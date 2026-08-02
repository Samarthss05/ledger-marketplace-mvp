-- Stripe Connect marketplace payments.
-- Existing orders are deliberately grandfathered so a deployment can never
-- create a payable Checkout Session for earlier demo activity.

alter table public.restock_orders
    add column payment_status text not null default 'legacy';

alter table public.restock_orders
    alter column payment_status set default 'not_started';

alter table public.restock_orders
    add constraint restock_orders_payment_status_check check (
        payment_status in (
            'legacy',
            'not_started',
            'checkout_creating',
            'checkout_pending',
            'processing',
            'paid',
            'transfer_pending',
            'transferred',
            'refund_pending',
            'refunded',
            'failed',
            'disputed'
        )
    );

create table public.restock_supplier_payment_accounts (
    organization_id uuid primary key
        references public.restock_organizations(id) on delete restrict,
    provider text not null default 'stripe' check (provider = 'stripe'),
    stripe_account_id text unique
        check (stripe_account_id is null or stripe_account_id ~ '^acct_[A-Za-z0-9]+$'),
    livemode boolean not null default false,
    provisioning_status text not null default 'creating'
        check (provisioning_status in ('creating', 'ready', 'error')),
    provisioning_started_at timestamptz not null default now(),
    details_submitted boolean not null default false,
    payouts_enabled boolean not null default false,
    transfers_status text not null default 'pending'
        check (transfers_status in ('pending', 'active', 'inactive')),
    requirements_due text[] not null default '{}',
    disabled_reason text check (disabled_reason is null or char_length(disabled_reason) <= 500),
    last_synced_at timestamptz not null default now(),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create trigger restock_supplier_payment_accounts_updated_at
before update on public.restock_supplier_payment_accounts
for each row execute function private.restock_set_updated_at();

alter table public.restock_supplier_payment_accounts enable row level security;

create policy "restock suppliers read own payment account"
on public.restock_supplier_payment_accounts for select to authenticated
using (private.restock_user_belongs_to(organization_id));

grant select on public.restock_supplier_payment_accounts to authenticated;
grant all on public.restock_supplier_payment_accounts to service_role;

create table public.restock_payments (
    id uuid primary key default gen_random_uuid(),
    order_id uuid not null unique references public.restock_orders(id) on delete restrict,
    provider text not null default 'stripe' check (provider = 'stripe'),
    currency text not null default 'sgd' check (currency = 'sgd'),
    amount_subtotal bigint not null check (amount_subtotal > 0),
    retailer_fee_amount bigint not null default 0 check (retailer_fee_amount >= 0),
    amount_total bigint not null check (amount_total > 0),
    supplier_transfer_amount bigint not null
        check (supplier_transfer_amount > 0 and supplier_transfer_amount <= amount_subtotal),
    payment_method text check (payment_method is null or payment_method in ('paynow', 'card')),
    fee_bps integer not null default 0 check (fee_bps between 0 and 1500),
    fee_fixed_amount bigint not null default 0 check (fee_fixed_amount between 0 and 5000),
    status text not null default 'not_started' check (
        status in (
            'legacy',
            'not_started',
            'checkout_creating',
            'checkout_pending',
            'processing',
            'paid',
            'transfer_pending',
            'transferred',
            'refund_pending',
            'refunded',
            'failed',
            'disputed'
        )
    ),
    checkout_attempts integer not null default 0 check (checkout_attempts >= 0),
    checkout_lock_until timestamptz,
    checkout_expires_at timestamptz,
    stripe_checkout_session_id text unique,
    stripe_payment_intent_id text unique,
    stripe_charge_id text,
    stripe_transfer_id text unique,
    stripe_transfer_reversal_id text unique,
    stripe_refund_id text unique,
    stripe_dispute_id text unique,
    last_error text check (last_error is null or char_length(last_error) <= 1000),
    paid_at timestamptz,
    transferred_at timestamptz,
    refunded_at timestamptz,
    failed_at timestamptz,
    version integer not null default 1 check (version > 0),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint restock_payments_total_check
        check (amount_total = amount_subtotal + retailer_fee_amount)
);

create trigger restock_payments_updated_at
before update on public.restock_payments
for each row execute function private.restock_set_updated_at();

alter table public.restock_payments enable row level security;

create policy "restock order parties read payments"
on public.restock_payments for select to authenticated
using (
    exists (
        select 1
        from public.restock_orders restock_order
        where restock_order.id = restock_payments.order_id
          and private.restock_is_order_party(restock_order.id)
    )
);

grant select on public.restock_payments to authenticated;
grant all on public.restock_payments to service_role;

create index restock_payments_status_idx
on public.restock_payments(status, updated_at);

create table public.restock_payment_operations (
    id uuid primary key default gen_random_uuid(),
    order_id uuid not null references public.restock_orders(id) on delete restrict,
    operation_type text not null check (operation_type in ('transfer', 'refund')),
    operation_key text not null unique check (char_length(operation_key) between 10 and 180),
    status text not null default 'pending'
        check (status in ('pending', 'processing', 'provider_pending', 'completed', 'failed', 'dead_letter')),
    attempts integer not null default 0 check (attempts between 0 and 20),
    available_at timestamptz not null default now(),
    locked_at timestamptz,
    provider_reference text,
    secondary_provider_reference text,
    last_error text check (last_error is null or char_length(last_error) <= 1000),
    completed_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create trigger restock_payment_operations_updated_at
before update on public.restock_payment_operations
for each row execute function private.restock_set_updated_at();

alter table public.restock_payment_operations enable row level security;
revoke all on public.restock_payment_operations from public, anon, authenticated;
grant all on public.restock_payment_operations to service_role;

create index restock_payment_operations_pending_idx
on public.restock_payment_operations(status, available_at)
where status in ('pending', 'failed');

create table public.restock_payment_provider_events (
    event_id text primary key check (event_id ~ '^evt_[A-Za-z0-9]+$'),
    event_type text not null check (char_length(event_type) between 3 and 120),
    livemode boolean not null,
    object_id text,
    status text not null default 'processing'
        check (status in ('processing', 'completed', 'failed')),
    processing_started_at timestamptz not null default now(),
    next_attempt_at timestamptz not null default now(),
    processed_at timestamptz,
    attempts integer not null default 1 check (attempts between 1 and 30),
    last_error text check (last_error is null or char_length(last_error) <= 1000),
    created_at timestamptz not null default now()
);

alter table public.restock_payment_provider_events enable row level security;
revoke all on public.restock_payment_provider_events from public, anon, authenticated;
grant all on public.restock_payment_provider_events to service_role;

create index restock_payment_provider_events_retry_idx
on public.restock_payment_provider_events(status, next_attempt_at)
where status = 'failed';

create or replace function private.restock_create_payment_record()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_amount_minor bigint;
begin
    v_amount_minor := round(new.total_price * 100)::bigint;
    insert into public.restock_payments (
        order_id,
        amount_subtotal,
        amount_total,
        supplier_transfer_amount,
        status
    ) values (
        new.id,
        v_amount_minor,
        v_amount_minor,
        v_amount_minor,
        new.payment_status
    );
    return new;
end;
$$;

revoke all on function private.restock_create_payment_record() from public, anon, authenticated;

create trigger restock_orders_create_payment_record
after insert on public.restock_orders
for each row execute function private.restock_create_payment_record();

insert into public.restock_payments (
    order_id,
    amount_subtotal,
    amount_total,
    supplier_transfer_amount,
    status
)
select
    restock_order.id,
    round(restock_order.total_price * 100)::bigint,
    round(restock_order.total_price * 100)::bigint,
    round(restock_order.total_price * 100)::bigint,
    'legacy'
from public.restock_orders restock_order
on conflict (order_id) do nothing;

-- Courier work must not leave the platform until Stripe confirms payment.
alter table public.restock_integration_outbox
    drop constraint restock_integration_outbox_status_check;

alter table public.restock_integration_outbox
    add constraint restock_integration_outbox_status_check check (
        status in ('blocked', 'pending', 'processing', 'completed', 'failed', 'dead_letter')
    );

create or replace function private.restock_block_unpaid_courier_booking()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_payment_status text;
begin
    if new.event_type <> 'ninjavan_create_order' then
        return new;
    end if;

    select restock_order.payment_status
    into v_payment_status
    from public.restock_orders restock_order
    where restock_order.id = new.aggregate_id;

    if v_payment_status not in ('legacy', 'paid', 'transfer_pending', 'transferred') then
        new.status := 'blocked';
    end if;
    return new;
end;
$$;

revoke all on function private.restock_block_unpaid_courier_booking()
from public, anon, authenticated;

create trigger restock_block_unpaid_courier_booking
before insert on public.restock_integration_outbox
for each row execute function private.restock_block_unpaid_courier_booking();

create or replace function public.restock_claim_supplier_payment_account(
    p_actor_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_organization_id uuid;
    v_account public.restock_supplier_payment_accounts%rowtype;
    v_should_create boolean := false;
    v_inserted_count integer := 0;
begin
    select organization.id
    into v_organization_id
    from public.restock_organization_members membership
    join public.restock_organizations organization
      on organization.id = membership.organization_id
    where membership.user_id = p_actor_user_id
      and membership.member_role in ('owner', 'manager')
      and organization.account_type = 'supplier'
      and organization.status = 'active'
    limit 1;

    if v_organization_id is null then
        raise sqlstate 'PT403' using message = 'A supplier owner or manager account is required.';
    end if;

    perform pg_catalog.pg_advisory_xact_lock(
        pg_catalog.hashtextextended('stripe-connect:' || v_organization_id::text, 0)
    );

    insert into public.restock_supplier_payment_accounts (organization_id)
    values (v_organization_id)
    on conflict (organization_id) do nothing;
    get diagnostics v_inserted_count = row_count;
    v_should_create := v_inserted_count = 1;

    select * into v_account
    from public.restock_supplier_payment_accounts account
    where account.organization_id = v_organization_id
    for update;

    if not v_should_create
       and v_account.stripe_account_id is null
       and (
           v_account.provisioning_status <> 'creating'
           or v_account.provisioning_started_at <= now() - interval '10 minutes'
       ) then
        v_should_create := true;
        update public.restock_supplier_payment_accounts
        set provisioning_status = 'creating',
            provisioning_started_at = now(),
            disabled_reason = null
        where organization_id = v_organization_id;
    end if;

    return jsonb_build_object(
        'organizationId', v_organization_id,
        'shouldCreate', v_should_create,
        'stripeAccountId', v_account.stripe_account_id
    );
end;
$$;

revoke all on function public.restock_claim_supplier_payment_account(uuid)
from public, anon, authenticated;
grant execute on function public.restock_claim_supplier_payment_account(uuid) to service_role;

-- Only the payment service role may claim checkout. The row lease prevents two
-- clicks from creating two payable Checkout Sessions for the same order.
create or replace function public.restock_claim_checkout(
    p_actor_user_id uuid,
    p_order_id uuid,
    p_payment_method text,
    p_retailer_fee_amount bigint,
    p_fee_bps integer,
    p_fee_fixed_amount bigint,
    p_livemode boolean
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_payment public.restock_payments%rowtype;
    v_order public.restock_orders%rowtype;
    v_supplier_account public.restock_supplier_payment_accounts%rowtype;
begin
    select * into v_order
    from public.restock_orders restock_order
    where restock_order.id = p_order_id
    for update;

    if v_order.id is null then
        raise sqlstate 'PT404' using message = 'Order not found.';
    end if;
    if not exists (
        select 1
        from public.restock_organization_members membership
        where membership.organization_id = v_order.buyer_org_id
          and membership.user_id = p_actor_user_id
          and membership.member_role in ('owner', 'manager', 'operator')
    ) then
        raise sqlstate 'PT403' using message = 'Only the retailer that placed this order can pay for it.';
    end if;

    select * into v_supplier_account
    from public.restock_supplier_payment_accounts account
    where account.organization_id = v_order.supplier_org_id;

    if v_supplier_account.stripe_account_id is null
       or v_supplier_account.provisioning_status <> 'ready'
       or v_supplier_account.transfers_status <> 'active'
       or not v_supplier_account.payouts_enabled then
        raise sqlstate 'PT409' using message = 'The supplier is still completing payment setup.';
    end if;
    if v_supplier_account.livemode <> p_livemode then
        raise sqlstate 'PT409' using message = 'The supplier payment account is configured for a different Stripe mode.';
    end if;

    select * into v_payment
    from public.restock_payments payment
    where payment.order_id = p_order_id
    for update;

    if v_payment.id is null then
        raise sqlstate 'PT404' using message = 'Payment record not found.';
    end if;
    if v_payment.status = 'checkout_pending'
       and v_payment.stripe_checkout_session_id is not null
       and v_payment.checkout_expires_at > now() then
        return jsonb_build_object(
            'action', case when v_payment.payment_method = p_payment_method then 'reuse' else 'replace' end,
            'sessionId', v_payment.stripe_checkout_session_id,
            'paymentMethod', v_payment.payment_method
        );
    end if;
    if v_payment.status in (
        'processing', 'paid', 'transfer_pending', 'transferred',
        'refund_pending', 'refunded', 'disputed'
    ) then
        raise sqlstate 'PT409' using message = 'This order already has an active or completed payment.';
    end if;
    if v_payment.status = 'legacy' then
        raise sqlstate 'PT409' using message = 'Earlier demo orders cannot be charged through Stripe.';
    end if;
    if v_payment.status = 'checkout_creating' and v_payment.checkout_lock_until > now() then
        raise sqlstate 'PT409' using message = 'A secure checkout is already being prepared.';
    end if;
    if p_payment_method not in ('paynow', 'card')
       or p_retailer_fee_amount < 0
       or p_retailer_fee_amount > ceil(v_payment.amount_subtotal * 0.15) + 5000
       or p_fee_bps not between 0 and 1500
       or p_fee_fixed_amount not between 0 and 5000 then
        raise sqlstate 'PT400' using message = 'The configured transaction fee is invalid.';
    end if;

    update public.restock_payments
    set status = 'checkout_creating',
        payment_method = p_payment_method,
        retailer_fee_amount = p_retailer_fee_amount,
        amount_total = amount_subtotal + p_retailer_fee_amount,
        supplier_transfer_amount = amount_subtotal,
        fee_bps = p_fee_bps,
        fee_fixed_amount = p_fee_fixed_amount,
        checkout_attempts = checkout_attempts + 1,
        checkout_lock_until = now() + interval '5 minutes',
        checkout_expires_at = null,
        stripe_checkout_session_id = null,
        last_error = null,
        version = version + 1
    where id = v_payment.id
    returning * into v_payment;

    update public.restock_orders
    set payment_status = 'checkout_creating', version = version + 1
    where id = p_order_id;

    return jsonb_build_object(
        'action', 'create',
        'attempt', v_payment.checkout_attempts,
        'orderReference', v_order.reference,
        'productSummary', v_order.product_summary,
        'supplierAccountId', v_supplier_account.stripe_account_id,
        'amountSubtotal', v_payment.amount_subtotal,
        'retailerFeeAmount', v_payment.retailer_fee_amount,
        'amountTotal', v_payment.amount_total,
        'supplierTransferAmount', v_payment.supplier_transfer_amount
    );
end;
$$;

revoke all on function public.restock_claim_checkout(uuid, uuid, text, bigint, integer, bigint, boolean)
from public, anon, authenticated;
grant execute on function public.restock_claim_checkout(uuid, uuid, text, bigint, integer, bigint, boolean)
to service_role;

create or replace function public.restock_reset_checkout(
    p_order_id uuid,
    p_session_id text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    update public.restock_payments
    set status = 'not_started',
        checkout_lock_until = null,
        checkout_expires_at = null,
        stripe_checkout_session_id = null,
        last_error = null,
        version = version + 1
    where order_id = p_order_id
      and stripe_checkout_session_id = p_session_id
      and status = 'checkout_pending';

    if found then
        update public.restock_orders
        set payment_status = 'not_started', version = version + 1
        where id = p_order_id and payment_status = 'checkout_pending';
    end if;
end;
$$;

revoke all on function public.restock_reset_checkout(uuid, text)
from public, anon, authenticated;
grant execute on function public.restock_reset_checkout(uuid, text) to service_role;

create or replace function public.restock_complete_checkout(
    p_order_id uuid,
    p_session_id text,
    p_expires_at timestamptz
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    update public.restock_payments
    set status = 'checkout_pending',
        stripe_checkout_session_id = p_session_id,
        checkout_lock_until = null,
        checkout_expires_at = p_expires_at,
        version = version + 1
    where order_id = p_order_id
      and status = 'checkout_creating';
    if not found then
        raise sqlstate 'PT409' using message = 'The checkout lease is no longer active.';
    end if;

    update public.restock_orders
    set payment_status = 'checkout_pending', version = version + 1
    where id = p_order_id;
end;
$$;

revoke all on function public.restock_complete_checkout(uuid, text, timestamptz)
from public, anon, authenticated;
grant execute on function public.restock_complete_checkout(uuid, text, timestamptz) to service_role;

create or replace function public.restock_fail_checkout(
    p_order_id uuid,
    p_error text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    update public.restock_payments
    set status = 'failed',
        checkout_lock_until = null,
        checkout_expires_at = null,
        last_error = left(coalesce(p_error, 'Stripe checkout failed.'), 1000),
        failed_at = now(),
        version = version + 1
    where order_id = p_order_id
      and status in ('checkout_creating', 'checkout_pending', 'processing');

    update public.restock_orders
    set payment_status = 'failed', version = version + 1
    where id = p_order_id
      and payment_status in ('checkout_creating', 'checkout_pending', 'processing');
end;
$$;

revoke all on function public.restock_fail_checkout(uuid, text)
from public, anon, authenticated;
grant execute on function public.restock_fail_checkout(uuid, text) to service_role;

create or replace function public.restock_record_payment_succeeded(
    p_order_id uuid,
    p_session_id text,
    p_payment_intent_id text,
    p_charge_id text,
    p_amount_total bigint,
    p_payment_method text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_payment public.restock_payments%rowtype;
    v_order public.restock_orders%rowtype;
begin
    select * into v_payment
    from public.restock_payments payment
    where payment.order_id = p_order_id
    for update;

    if v_payment.id is null then
        raise sqlstate 'PT404' using message = 'Payment record not found.';
    end if;
    if v_payment.status in ('paid', 'transfer_pending', 'transferred')
       and v_payment.stripe_payment_intent_id = p_payment_intent_id then
        return jsonb_build_object('status', v_payment.status, 'idempotent', true);
    end if;
    if v_payment.stripe_checkout_session_id is distinct from p_session_id
       or v_payment.amount_total <> p_amount_total
       or v_payment.payment_method <> p_payment_method
       or p_payment_intent_id !~ '^pi_[A-Za-z0-9]+$'
       or (p_charge_id is not null and p_charge_id !~ '^ch_[A-Za-z0-9]+$') then
        raise sqlstate 'PT409' using message = 'Stripe payment details did not match this order.';
    end if;
    if v_payment.status not in ('checkout_pending', 'processing') then
        raise sqlstate 'PT409' using message = 'This payment cannot be completed from its current state.';
    end if;

    select * into v_order
    from public.restock_orders restock_order
    where restock_order.id = p_order_id
    for update;

    update public.restock_payments
    set status = 'paid',
        stripe_payment_intent_id = p_payment_intent_id,
        stripe_charge_id = p_charge_id,
        paid_at = coalesce(paid_at, now()),
        checkout_lock_until = null,
        checkout_expires_at = null,
        last_error = null,
        version = version + 1
    where id = v_payment.id;

    update public.restock_orders
    set payment_status = 'paid', version = version + 1
    where id = p_order_id;

    update public.restock_integration_outbox
    set status = 'pending', available_at = now(), locked_at = null, last_error = null
    where aggregate_id = p_order_id
      and event_type = 'ninjavan_create_order'
      and status = 'blocked';

    insert into public.restock_fulfillment_events (
        order_id, actor_type, event_type, title, detail, source_reference
    ) values (
        p_order_id,
        'system',
        'payment_received',
        'Payment received',
        'The retailer paid securely. The supplier can prepare the order for pickup.',
        p_payment_intent_id
    );

    insert into public.restock_notifications (
        user_id, organization_id, notification_type, title, body, link_path
    )
    select
        membership.user_id,
        membership.organization_id,
        'payment_received',
        'Order ready to prepare',
        v_order.reference || ' has been paid and is ready for dispatch preparation.',
        '/auction/supplier/operations'
    from public.restock_organization_members membership
    where membership.organization_id = v_order.supplier_org_id;

    return jsonb_build_object('status', 'paid', 'idempotent', false);
end;
$$;

revoke all on function public.restock_record_payment_succeeded(uuid, text, text, text, bigint, text)
from public, anon, authenticated;
grant execute on function public.restock_record_payment_succeeded(uuid, text, text, text, bigint, text)
to service_role;

-- Order payout transitions create durable Stripe jobs. This keeps the delivery
-- confirmation transaction authoritative even if Stripe is briefly unavailable.
create or replace function private.restock_queue_payment_transition()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_payment public.restock_payments%rowtype;
begin
    if new.payout_status = old.payout_status then
        return new;
    end if;

    select * into v_payment
    from public.restock_payments payment
    where payment.order_id = new.id
    for update;

    if v_payment.id is null or v_payment.status = 'legacy' then
        return new;
    end if;

    if new.payout_status = 'under_review' then
        update public.restock_payments
        set status = 'disputed', version = version + 1
        where id = v_payment.id
          and status in ('paid', 'transfer_pending');
        new.payment_status := 'disputed';
    elsif new.payout_status = 'released'
          and v_payment.status in ('paid', 'disputed') then
        insert into public.restock_payment_operations (
            order_id, operation_type, operation_key
        ) values (
            new.id, 'transfer', 'order:' || new.id::text || ':supplier-transfer:v1'
        )
        on conflict (operation_key) do update
        set status = case
                when public.restock_payment_operations.status = 'completed' then 'completed'
                else 'pending'
            end,
            available_at = now(),
            locked_at = null,
            last_error = null;

        update public.restock_payments
        set status = 'transfer_pending', version = version + 1
        where id = v_payment.id;
        new.payment_status := 'transfer_pending';
    elsif new.payout_status = 'refunded'
          and v_payment.status in ('paid', 'disputed', 'transfer_pending', 'transferred') then
        insert into public.restock_payment_operations (
            order_id, operation_type, operation_key
        ) values (
            new.id, 'refund', 'order:' || new.id::text || ':retailer-refund:v1'
        )
        on conflict (operation_key) do update
        set status = case
                when public.restock_payment_operations.status = 'completed' then 'completed'
                else 'pending'
            end,
            available_at = now(),
            locked_at = null,
            last_error = null;

        update public.restock_payments
        set status = 'refund_pending', version = version + 1
        where id = v_payment.id;
        new.payment_status := 'refund_pending';
    end if;

    return new;
end;
$$;

revoke all on function private.restock_queue_payment_transition()
from public, anon, authenticated;

create trigger restock_orders_queue_payment_transition
before update of payout_status on public.restock_orders
for each row execute function private.restock_queue_payment_transition();

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

create or replace function public.restock_complete_payment_operation(
    p_operation_id uuid,
    p_provider_reference text,
    p_secondary_provider_reference text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_operation public.restock_payment_operations%rowtype;
    v_order public.restock_orders%rowtype;
begin
    select * into v_operation
    from public.restock_payment_operations operation
    where operation.id = p_operation_id
    for update;

    if v_operation.id is null then
        raise sqlstate 'PT404' using message = 'Payment operation not found.';
    end if;
    if v_operation.status = 'completed' then
        return;
    end if;
    if v_operation.status not in ('processing', 'provider_pending') then
        raise sqlstate 'PT409' using message = 'Payment operation is not being processed.';
    end if;

    select * into v_order
    from public.restock_orders restock_order
    where restock_order.id = v_operation.order_id;

    update public.restock_payment_operations
    set status = 'completed',
        provider_reference = p_provider_reference,
        secondary_provider_reference = p_secondary_provider_reference,
        completed_at = now(),
        locked_at = null,
        last_error = null
    where id = p_operation_id;

    if v_operation.operation_type = 'transfer' then
        update public.restock_payments
        set status = 'transferred',
            stripe_transfer_id = p_provider_reference,
            transferred_at = now(),
            last_error = null,
            version = version + 1
        where order_id = v_operation.order_id;
        update public.restock_orders
        set payment_status = 'transferred', version = version + 1
        where id = v_operation.order_id;

        insert into public.restock_fulfillment_events (
            order_id, actor_type, event_type, title, detail, source_reference
        ) values (
            v_operation.order_id,
            'system',
            'supplier_payment_sent',
            'Supplier payment sent',
            'Delivery verification passed and the supplier payment was released.',
            p_provider_reference
        );
    else
        update public.restock_payments
        set status = 'refunded',
            stripe_refund_id = p_provider_reference,
            stripe_transfer_reversal_id = p_secondary_provider_reference,
            refunded_at = now(),
            last_error = null,
            version = version + 1
        where order_id = v_operation.order_id;
        update public.restock_orders
        set payment_status = 'refunded', version = version + 1
        where id = v_operation.order_id;

        insert into public.restock_fulfillment_events (
            order_id, actor_type, event_type, title, detail, source_reference
        ) values (
            v_operation.order_id,
            'system',
            'retailer_refund_submitted',
            'Retailer refund submitted',
            'The delivery review was resolved for the retailer and Stripe accepted the refund.',
            p_provider_reference
        );
    end if;
end;
$$;

revoke all on function public.restock_complete_payment_operation(uuid, text, text)
from public, anon, authenticated;
grant execute on function public.restock_complete_payment_operation(uuid, text, text) to service_role;

create or replace function public.restock_defer_payment_operation(
    p_operation_id uuid,
    p_provider_reference text,
    p_secondary_provider_reference text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    update public.restock_payment_operations
    set status = 'provider_pending',
        provider_reference = p_provider_reference,
        secondary_provider_reference = p_secondary_provider_reference,
        locked_at = null,
        last_error = null
    where id = p_operation_id
      and status = 'processing';
    if not found then
        raise sqlstate 'PT409' using message = 'Payment operation cannot be deferred.';
    end if;
end;
$$;

revoke all on function public.restock_defer_payment_operation(uuid, text, text)
from public, anon, authenticated;
grant execute on function public.restock_defer_payment_operation(uuid, text, text) to service_role;

create or replace function public.restock_fail_payment_operation(
    p_operation_id uuid,
    p_error text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    update public.restock_payment_operations
    set status = case when attempts >= 8 then 'dead_letter' else 'failed' end,
        available_at = now() + make_interval(secs => least(3600, 30 * (2 ^ least(attempts, 7))))::interval,
        locked_at = null,
        last_error = left(coalesce(p_error, 'Stripe operation failed.'), 1000)
    where id = p_operation_id
      and status in ('processing', 'provider_pending');

    update public.restock_payments payment
    set last_error = left(coalesce(p_error, 'Stripe operation failed.'), 1000),
        version = version + 1
    from public.restock_payment_operations operation
    where operation.id = p_operation_id
      and payment.order_id = operation.order_id;
end;
$$;

revoke all on function public.restock_fail_payment_operation(uuid, text)
from public, anon, authenticated;
grant execute on function public.restock_fail_payment_operation(uuid, text) to service_role;

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

create or replace function public.restock_complete_payment_provider_event(p_event_id text)
returns void
language sql
security definer
set search_path = ''
as $$
    update public.restock_payment_provider_events
    set status = 'completed', processed_at = now(), last_error = null
    where event_id = p_event_id and status = 'processing';
$$;

revoke all on function public.restock_complete_payment_provider_event(text)
from public, anon, authenticated;
grant execute on function public.restock_complete_payment_provider_event(text) to service_role;

create or replace function public.restock_fail_payment_provider_event(
    p_event_id text,
    p_error text
)
returns void
language sql
security definer
set search_path = ''
as $$
    update public.restock_payment_provider_events
    set status = 'failed',
        next_attempt_at = now() + interval '30 seconds',
        last_error = left(coalesce(p_error, 'Stripe webhook failed.'), 1000)
    where event_id = p_event_id and status = 'processing';
$$;

revoke all on function public.restock_fail_payment_provider_event(text, text)
from public, anon, authenticated;
grant execute on function public.restock_fail_payment_provider_event(text, text) to service_role;

create or replace function public.restock_record_provider_dispute(
    p_payment_intent_id text,
    p_dispute_id text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_order_id uuid;
begin
    select payment.order_id into v_order_id
    from public.restock_payments payment
    where payment.stripe_payment_intent_id = p_payment_intent_id
    for update;

    if v_order_id is null then
        return;
    end if;

    update public.restock_payments
    set status = 'disputed',
        stripe_dispute_id = p_dispute_id,
        version = version + 1
    where order_id = v_order_id;

    update public.restock_orders
    set payment_status = 'disputed',
        payout_status = 'under_review',
        version = version + 1
    where id = v_order_id;

    insert into public.restock_fulfillment_events (
        order_id, actor_type, event_type, title, detail, source_reference
    ) values (
        v_order_id,
        'system',
        'stripe_dispute_opened',
        'Payment dispute opened',
        'Stripe reported a payment dispute. Supplier payout is on hold for manual review.',
        p_dispute_id
    );
end;
$$;

revoke all on function public.restock_record_provider_dispute(text, text)
from public, anon, authenticated;
grant execute on function public.restock_record_provider_dispute(text, text) to service_role;

-- Update the already-deployed award transaction copy without duplicating its
-- large, security-reviewed implementation in this migration.
do $$
declare
    v_definition text;
begin
    select pg_catalog.pg_get_functiondef(
        'public.restock_award_quote(uuid,uuid,uuid,uuid,uuid,text)'::regprocedure
    ) into v_definition;

    v_definition := replace(
        v_definition,
        'The supplier is preparing the order for Ninja Van pickup.',
        'The retailer must complete payment before the supplier prepares the order.'
    );
    v_definition := replace(
        v_definition,
        'The courier booking is queued for secure processing.',
        'Ninja Van booking starts after Stripe confirms the retailer payment.'
    );
    v_definition := replace(
        v_definition,
        ' is ready for you to prepare and photograph before pickup.',
        ' was awarded. Wait for payment confirmation before preparing it.'
    );
    execute v_definition;
end;
$$;

-- The public schema is exposed by the Data API. Every new table above has RLS;
-- privileged mutations are available only through service-role RPCs.
