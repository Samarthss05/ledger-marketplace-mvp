-- Recover safely when an Edge Function stops after claiming work. Stripe API
-- idempotency keys make provider retries safe; stale database leases must also
-- be reclaimable instead of remaining in "processing" forever.

create or replace function public.restock_claim_payment_operation(
    p_order_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_operation public.restock_payment_operations%rowtype;
    v_payment public.restock_payments%rowtype;
    v_order public.restock_orders%rowtype;
    v_account public.restock_supplier_payment_accounts%rowtype;
begin
    select * into v_operation
    from public.restock_payment_operations operation
    where operation.order_id = p_order_id
      and (
          (
              operation.status in ('pending', 'failed')
              and operation.available_at <= now()
          )
          or (
              operation.status = 'processing'
              and operation.locked_at <= now() - interval '5 minutes'
          )
      )
      and operation.attempts < 8
    order by operation.created_at
    for update skip locked
    limit 1;

    if v_operation.id is null then
        return null;
    end if;

    select * into v_payment
    from public.restock_payments payment
    where payment.order_id = p_order_id;

    select * into v_order
    from public.restock_orders restock_order
    where restock_order.id = p_order_id;

    select * into v_account
    from public.restock_supplier_payment_accounts account
    where account.organization_id = v_order.supplier_org_id;

    if v_payment.stripe_payment_intent_id is null then
        raise sqlstate 'PT409' using message = 'The Stripe payment is not ready for settlement.';
    end if;
    if v_operation.operation_type = 'transfer'
       and (v_account.stripe_account_id is null or v_account.transfers_status <> 'active') then
        raise sqlstate 'PT409' using message = 'The supplier Stripe account cannot receive transfers.';
    end if;

    update public.restock_payment_operations
    set status = 'processing',
        attempts = attempts + 1,
        locked_at = now(),
        last_error = null
    where id = v_operation.id
    returning * into v_operation;

    return jsonb_build_object(
        'operationId', v_operation.id,
        'operationType', v_operation.operation_type,
        'operationKey', v_operation.operation_key,
        'attempt', v_operation.attempts,
        'orderId', v_order.id,
        'orderReference', v_order.reference,
        'paymentIntentId', v_payment.stripe_payment_intent_id,
        'chargeId', v_payment.stripe_charge_id,
        'transferId', v_payment.stripe_transfer_id,
        'supplierAccountId', v_account.stripe_account_id,
        'supplierTransferAmount', v_payment.supplier_transfer_amount,
        'amountTotal', v_payment.amount_total,
        'currency', v_payment.currency
    );
end;
$$;

revoke all on function public.restock_claim_payment_operation(uuid)
from public, anon, authenticated;
grant execute on function public.restock_claim_payment_operation(uuid) to service_role;

create or replace function public.restock_claim_payment_provider_event(
    p_event_id text,
    p_event_type text,
    p_livemode boolean,
    p_object_id text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_claimed text;
begin
    if p_event_id !~ '^evt_[A-Za-z0-9]+$'
       or char_length(p_event_type) not between 3 and 120 then
        raise sqlstate 'PT400' using message = 'Invalid Stripe event.';
    end if;

    insert into public.restock_payment_provider_events (
        event_id, event_type, livemode, object_id
    ) values (
        p_event_id, p_event_type, p_livemode, p_object_id
    )
    on conflict (event_id) do update
    set status = 'processing',
        processing_started_at = now(),
        attempts = public.restock_payment_provider_events.attempts + 1,
        last_error = null
    where (
          (
              public.restock_payment_provider_events.status = 'failed'
              and public.restock_payment_provider_events.next_attempt_at <= now()
          )
          or (
              public.restock_payment_provider_events.status = 'processing'
              and public.restock_payment_provider_events.processing_started_at <= now() - interval '5 minutes'
          )
      )
      and public.restock_payment_provider_events.attempts < 30
    returning event_id into v_claimed;

    return v_claimed is not null;
end;
$$;

revoke all on function public.restock_claim_payment_provider_event(text, text, boolean, text)
from public, anon, authenticated;
grant execute on function public.restock_claim_payment_provider_event(text, text, boolean, text)
to service_role;
