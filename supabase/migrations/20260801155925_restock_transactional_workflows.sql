create extension if not exists pg_cron with schema pg_catalog;

alter table public.restock_sourcing_requests
    add column if not exists idempotency_key uuid;

alter table public.restock_quotes
    add column if not exists idempotency_key uuid,
    add column if not exists revision integer not null default 1
        check (revision > 0);

alter table public.restock_orders
    add column if not exists idempotency_key uuid;

alter table public.restock_quotes
    drop constraint if exists restock_quotes_status_check;

alter table public.restock_quotes
    add constraint restock_quotes_status_check
    check (status in ('submitted', 'awarded', 'declined', 'withdrawn', 'expired'));

create unique index if not exists restock_requests_idempotency_idx
on public.restock_sourcing_requests(retailer_org_id, idempotency_key)
where idempotency_key is not null;

create unique index if not exists restock_quotes_idempotency_idx
on public.restock_quotes(supplier_org_id, idempotency_key)
where idempotency_key is not null;

create unique index if not exists restock_orders_idempotency_idx
on public.restock_orders(buyer_org_id, idempotency_key)
where idempotency_key is not null;

create unique index if not exists restock_request_product_idx
on public.restock_request_lines(request_id, product_id);

create index if not exists restock_requests_expiry_idx
on public.restock_sourcing_requests(quote_deadline)
where status in ('sent', 'quoted');

create table public.restock_quote_revisions (
    id bigint generated always as identity primary key,
    quote_id uuid not null references public.restock_quotes(id) on delete restrict,
    revision integer not null check (revision > 0),
    total_price numeric(14,2) not null check (total_price > 0),
    delivery_days integer not null check (delivery_days between 1 and 120),
    delivery_date date not null,
    payment_terms text not null check (char_length(payment_terms) between 2 and 80),
    score integer not null check (score between 0 and 100),
    idempotency_key uuid,
    submitted_by uuid not null references auth.users(id) on delete restrict,
    created_at timestamptz not null default now(),
    unique (quote_id, revision)
);

insert into public.restock_quote_revisions (
    quote_id,
    revision,
    total_price,
    delivery_days,
    delivery_date,
    payment_terms,
    score,
    submitted_by,
    created_at
)
select
    quote.id,
    1,
    quote.total_price,
    quote.delivery_days,
    quote.delivery_date,
    quote.payment_terms,
    quote.score,
    quote.submitted_by,
    quote.submitted_at
from public.restock_quotes quote
on conflict (quote_id, revision) do nothing;

alter table public.restock_quote_revisions enable row level security;

create policy "restock request parties read quote revisions"
on public.restock_quote_revisions for select to authenticated
using (
    exists (
        select 1
        from public.restock_quotes quote
        where quote.id = quote_id
          and private.restock_is_request_party(quote.request_id)
    )
);

grant select on public.restock_quote_revisions to authenticated;
grant all on public.restock_quote_revisions to service_role;

create table public.restock_integration_outbox (
    id uuid primary key default gen_random_uuid(),
    aggregate_type text not null check (aggregate_type in ('order')),
    aggregate_id uuid not null,
    event_type text not null check (event_type in ('ninjavan_create_order', 'ninjavan_cancel_order')),
    payload jsonb not null default '{}'::jsonb,
    status text not null default 'pending'
        check (status in ('pending', 'processing', 'completed', 'failed', 'dead_letter')),
    attempts integer not null default 0 check (attempts >= 0),
    available_at timestamptz not null default now(),
    locked_at timestamptz,
    provider_reference text,
    last_error text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (aggregate_id, event_type)
);

create trigger restock_integration_outbox_updated_at
before update on public.restock_integration_outbox
for each row execute function private.restock_set_updated_at();

alter table public.restock_integration_outbox enable row level security;
revoke all on public.restock_integration_outbox from public, anon, authenticated;
grant all on public.restock_integration_outbox to service_role;

create index restock_integration_outbox_pending_idx
on public.restock_integration_outbox(status, available_at)
where status in ('pending', 'failed');

create table private.restock_rate_limits (
    actor_user_id uuid not null references auth.users(id) on delete cascade,
    action text not null check (action ~ '^[a-z_]{2,60}$'),
    bucket_started_at timestamptz not null,
    attempts integer not null default 1 check (attempts > 0),
    primary key (actor_user_id, action, bucket_started_at)
);

create function public.restock_consume_rate_limit(
    p_actor_user_id uuid,
    p_action text,
    p_max_attempts integer,
    p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_bucket timestamptz;
    v_attempts integer;
begin
    if p_actor_user_id is null
       or not exists (select 1 from auth.users where id = p_actor_user_id)
       or coalesce(p_action, '') !~ '^[a-z_]{2,60}$'
       or coalesce(p_max_attempts, 0) not between 1 and 1000
       or coalesce(p_window_seconds, 0) not between 10 and 86400 then
        raise sqlstate 'PT400' using message = 'Invalid rate-limit request.';
    end if;

    v_bucket := to_timestamp(
        floor(extract(epoch from clock_timestamp()) / p_window_seconds) * p_window_seconds
    );

    insert into private.restock_rate_limits (
        actor_user_id,
        action,
        bucket_started_at,
        attempts
    ) values (
        p_actor_user_id,
        p_action,
        v_bucket,
        1
    )
    on conflict (actor_user_id, action, bucket_started_at)
    do update set attempts = private.restock_rate_limits.attempts + 1
    returning attempts into v_attempts;

    return v_attempts <= p_max_attempts;
end;
$$;

revoke all on function public.restock_consume_rate_limit(uuid, text, integer, integer)
from public, anon, authenticated;
grant execute on function public.restock_consume_rate_limit(uuid, text, integer, integer)
to service_role;

create function public.restock_create_request(
    p_actor_user_id uuid,
    p_idempotency_key uuid,
    p_request_id uuid,
    p_request_reference text,
    p_title text,
    p_delivery_date date,
    p_priority text,
    p_notes text,
    p_quote_deadline timestamptz,
    p_lines jsonb,
    p_supplier_ids uuid[]
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_retailer_org_id uuid;
    v_retailer_alias text;
    v_existing_id uuid;
    v_existing_reference text;
    v_line_count integer;
    v_supplier_count integer;
    v_target_total numeric;
begin
    if p_actor_user_id is null or p_idempotency_key is null then
        raise sqlstate 'PT400' using message = 'A valid idempotency key is required.';
    end if;

    select organization.id, organization.alias_code
    into v_retailer_org_id, v_retailer_alias
    from public.restock_organization_members membership
    join public.restock_organizations organization
      on organization.id = membership.organization_id
    where membership.user_id = p_actor_user_id
      and membership.member_role in ('owner', 'manager', 'operator')
      and organization.account_type = 'retailer'
      and organization.status = 'active'
    limit 1;

    if v_retailer_org_id is null then
        raise sqlstate 'PT403' using message = 'An active retailer operator account is required.';
    end if;

    perform pg_catalog.pg_advisory_xact_lock(
        pg_catalog.hashtextextended(v_retailer_org_id::text || ':' || p_idempotency_key::text, 0)
    );

    select request.id, request.reference
    into v_existing_id, v_existing_reference
    from public.restock_sourcing_requests request
    where request.retailer_org_id = v_retailer_org_id
      and request.idempotency_key = p_idempotency_key;

    if v_existing_id is not null then
        return jsonb_build_object('id', v_existing_id, 'reference', v_existing_reference);
    end if;

    if p_request_id is null
       or coalesce(p_request_reference, '') !~ '^RFQ-[A-Z0-9]{8}$'
       or char_length(trim(coalesce(p_title, ''))) not between 3 and 140
       or coalesce(p_priority, '') not in ('standard', 'urgent')
       or char_length(trim(coalesce(p_notes, ''))) > 2000 then
        raise sqlstate 'PT400' using message = 'The quote request details are invalid.';
    end if;

    if p_delivery_date < current_date + 2 then
        raise sqlstate 'PT400' using message = 'Delivery must be scheduled at least two days ahead.';
    end if;

    if p_quote_deadline <= now() + interval '5 minutes'
       or p_quote_deadline >= p_delivery_date::timestamptz then
        raise sqlstate 'PT400' using message = 'The quote deadline must be before the delivery date.';
    end if;

    if jsonb_typeof(p_lines) <> 'array' then
        raise sqlstate 'PT400' using message = 'At least one valid product is required.';
    end if;

    v_line_count := jsonb_array_length(p_lines);
    if v_line_count not between 1 and 50 then
        raise sqlstate 'PT400' using message = 'A request may contain between 1 and 50 products.';
    end if;

    if exists (
        select 1
        from jsonb_to_recordset(p_lines) as line(
            "productId" text,
            "productName" text,
            category text,
            quantity integer,
            "targetPrice" numeric,
            "marketPrice" numeric
        )
        where char_length(trim(coalesce(line."productId", ''))) not between 1 and 80
           or char_length(trim(coalesce(line."productName", ''))) not between 2 and 200
           or char_length(trim(coalesce(line.category, ''))) not between 2 and 100
           or line.quantity is null or line.quantity not between 1 and 1000000
           or line."targetPrice" is null
           or line."targetPrice" <= 0 or line."targetPrice" > 1000000
           or line."marketPrice" is null
           or line."marketPrice" <= 0 or line."marketPrice" > 1000000
    ) then
        raise sqlstate 'PT400' using message = 'One or more requested products are invalid.';
    end if;

    if (
        select count(distinct line."productId")
        from jsonb_to_recordset(p_lines) as line("productId" text)
    ) <> v_line_count then
        raise sqlstate 'PT400' using message = 'A product can appear only once in a request.';
    end if;

    select sum(line.quantity * line."targetPrice")
    into v_target_total
    from jsonb_to_recordset(p_lines) as line(quantity integer, "targetPrice" numeric);

    if v_target_total <= 0 or v_target_total > 1000000 then
        raise sqlstate 'PT400' using message = 'The target order value must not exceed S$1,000,000.';
    end if;

    if coalesce(cardinality(p_supplier_ids), 0) not between 1 and 25
       or (select count(distinct supplier_id) from unnest(p_supplier_ids) supplier_id)
          <> cardinality(p_supplier_ids) then
        raise sqlstate 'PT400' using message = 'Select between 1 and 25 unique suppliers.';
    end if;

    select count(*)
    into v_supplier_count
    from public.restock_supplier_profiles profile
    join public.restock_organizations organization
      on organization.id = profile.organization_id
    where profile.organization_id = any(p_supplier_ids)
      and profile.accepting_requests
      and organization.status = 'active'
      and organization.account_type = 'supplier';

    if v_supplier_count <> cardinality(p_supplier_ids) then
        raise sqlstate 'PT409' using message = 'One or more selected suppliers are unavailable.';
    end if;

    insert into public.restock_sourcing_requests (
        id,
        reference,
        retailer_org_id,
        retailer_alias,
        title,
        delivery_date,
        priority,
        notes,
        quote_deadline,
        idempotency_key,
        created_by
    ) values (
        p_request_id,
        p_request_reference,
        v_retailer_org_id,
        v_retailer_alias,
        trim(p_title),
        p_delivery_date,
        p_priority,
        trim(coalesce(p_notes, '')),
        p_quote_deadline,
        p_idempotency_key,
        p_actor_user_id
    );

    insert into public.restock_request_lines (
        request_id,
        product_id,
        product_name,
        category,
        quantity,
        target_price,
        market_price
    )
    select
        p_request_id,
        trim(line."productId"),
        trim(line."productName"),
        trim(line.category),
        line.quantity,
        line."targetPrice",
        line."marketPrice"
    from jsonb_to_recordset(p_lines) as line(
        "productId" text,
        "productName" text,
        category text,
        quantity integer,
        "targetPrice" numeric,
        "marketPrice" numeric
    );

    insert into public.restock_request_suppliers (
        request_id,
        supplier_org_id,
        supplier_alias
    )
    select p_request_id, profile.organization_id, profile.alias_code
    from public.restock_supplier_profiles profile
    where profile.organization_id = any(p_supplier_ids);

    insert into public.restock_notifications (
        user_id,
        organization_id,
        notification_type,
        title,
        body,
        link_path
    )
    select
        membership.user_id,
        membership.organization_id,
        'request_received',
        'New quote request',
        p_request_reference || ' is ready for your quote.',
        '/auction/supplier/crm'
    from public.restock_organization_members membership
    where membership.organization_id = any(p_supplier_ids);

    insert into public.restock_audit_log (
        organization_id,
        actor_user_id,
        entity_table,
        entity_id,
        action,
        new_record
    ) values (
        v_retailer_org_id,
        p_actor_user_id,
        'restock_sourcing_requests',
        p_request_id,
        'INSERT',
        jsonb_build_object(
            'reference', p_request_reference,
            'suppliersInvited', v_supplier_count,
            'targetTotal', v_target_total,
            'idempotencyKey', p_idempotency_key
        )
    );

    return jsonb_build_object('id', p_request_id, 'reference', p_request_reference);
end;
$$;

revoke all on function public.restock_create_request(
    uuid, uuid, uuid, text, text, date, text, text, timestamptz, jsonb, uuid[]
) from public, anon, authenticated;
grant execute on function public.restock_create_request(
    uuid, uuid, uuid, text, text, date, text, text, timestamptz, jsonb, uuid[]
) to service_role;

create function public.restock_submit_quote(
    p_actor_user_id uuid,
    p_idempotency_key uuid,
    p_request_id uuid,
    p_quote_id uuid,
    p_quote_reference text,
    p_total_price numeric,
    p_delivery_days integer,
    p_payment_terms text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_supplier_org_id uuid;
    v_supplier_alias text;
    v_request public.restock_sourcing_requests%rowtype;
    v_quote public.restock_quotes%rowtype;
    v_had_quote boolean := false;
    v_target_total numeric;
    v_price_score numeric;
    v_speed_score numeric;
    v_score integer;
    v_delivery_date date;
begin
    if p_actor_user_id is null or p_idempotency_key is null then
        raise sqlstate 'PT400' using message = 'A valid idempotency key is required.';
    end if;

    select organization.id, organization.alias_code
    into v_supplier_org_id, v_supplier_alias
    from public.restock_organization_members membership
    join public.restock_organizations organization
      on organization.id = membership.organization_id
    join public.restock_supplier_profiles profile
      on profile.organization_id = organization.id
    where membership.user_id = p_actor_user_id
      and membership.member_role in ('owner', 'manager', 'operator')
      and organization.account_type = 'supplier'
      and organization.status = 'active'
    limit 1;

    if v_supplier_org_id is null then
        raise sqlstate 'PT403' using message = 'An active supplier operator account is required.';
    end if;

    perform pg_catalog.pg_advisory_xact_lock(
        pg_catalog.hashtextextended(v_supplier_org_id::text || ':' || p_request_id::text, 0)
    );

    select * into v_request
    from public.restock_sourcing_requests request
    where request.id = p_request_id
    for update;

    if v_request.id is null then
        raise sqlstate 'PT404' using message = 'Quote request not found.';
    end if;

    if not exists (
        select 1
        from public.restock_request_suppliers invitation
        where invitation.request_id = p_request_id
          and invitation.supplier_org_id = v_supplier_org_id
    ) then
        raise sqlstate 'PT403' using message = 'Your organization was not invited to this request.';
    end if;

    select * into v_quote
    from public.restock_quotes quote
    where quote.request_id = p_request_id
      and quote.supplier_org_id = v_supplier_org_id
    for update;
    v_had_quote := v_quote.id is not null;

    if v_had_quote and v_quote.idempotency_key = p_idempotency_key then
        return jsonb_build_object(
            'id', v_quote.id,
            'reference', v_quote.reference,
            'score', v_quote.score,
            'revision', v_quote.revision
        );
    end if;

    if v_request.status not in ('sent', 'quoted') or v_request.quote_deadline <= now() then
        raise sqlstate 'PT409' using message = 'This quote request is closed.';
    end if;

    if p_quote_id is null
       or coalesce(p_quote_reference, '') !~ '^QUO-[A-Z0-9]{8}$'
       or p_total_price is null
       or p_total_price <= 0 or p_total_price > 100000000
       or p_delivery_days is null or p_delivery_days not between 1 and 120
       or char_length(trim(coalesce(p_payment_terms, ''))) not between 2 and 80 then
        raise sqlstate 'PT400' using message = 'The supplier quote is invalid.';
    end if;

    v_delivery_date := current_date + p_delivery_days;
    if v_delivery_date > v_request.delivery_date then
        raise sqlstate 'PT400' using message = 'The proposed delivery date is later than the retailer requested.';
    end if;

    select sum(line.quantity * line.target_price)
    into v_target_total
    from public.restock_request_lines line
    where line.request_id = p_request_id;

    v_price_score := greatest(0, least(100, (v_target_total / p_total_price) * 88));
    v_speed_score := greatest(40, 100 - p_delivery_days * 6);
    v_score := round(v_price_score * 0.72 + v_speed_score * 0.28);

    if v_had_quote then
        update public.restock_quotes
        set total_price = p_total_price,
            delivery_days = p_delivery_days,
            delivery_date = v_delivery_date,
            payment_terms = trim(p_payment_terms),
            score = v_score,
            status = 'submitted',
            submitted_by = p_actor_user_id,
            submitted_at = now(),
            idempotency_key = p_idempotency_key,
            revision = v_quote.revision + 1
        where id = v_quote.id
        returning * into v_quote;
    else
        insert into public.restock_quotes (
            id,
            reference,
            request_id,
            supplier_org_id,
            supplier_alias,
            total_price,
            delivery_days,
            delivery_date,
            payment_terms,
            score,
            status,
            submitted_by,
            idempotency_key
        ) values (
            p_quote_id,
            p_quote_reference,
            p_request_id,
            v_supplier_org_id,
            v_supplier_alias,
            p_total_price,
            p_delivery_days,
            v_delivery_date,
            trim(p_payment_terms),
            v_score,
            'submitted',
            p_actor_user_id,
            p_idempotency_key
        )
        returning * into v_quote;
    end if;

    insert into public.restock_quote_revisions (
        quote_id,
        revision,
        total_price,
        delivery_days,
        delivery_date,
        payment_terms,
        score,
        idempotency_key,
        submitted_by
    ) values (
        v_quote.id,
        v_quote.revision,
        v_quote.total_price,
        v_quote.delivery_days,
        v_quote.delivery_date,
        v_quote.payment_terms,
        v_quote.score,
        p_idempotency_key,
        p_actor_user_id
    );

    update public.restock_sourcing_requests
    set status = 'quoted'
    where id = p_request_id
      and status in ('sent', 'quoted');

    insert into public.restock_notifications (
        user_id,
        organization_id,
        notification_type,
        title,
        body,
        link_path
    )
    select
        membership.user_id,
        membership.organization_id,
        'quote_received',
        case when v_had_quote then 'Supplier quote updated' else 'New supplier quote' end,
        v_supplier_alias || case when v_had_quote then ' updated ' else ' sent ' end || v_quote.reference || '.',
        '/auction/shop/requests'
    from public.restock_organization_members membership
    where membership.organization_id = v_request.retailer_org_id;

    insert into public.restock_audit_log (
        organization_id,
        actor_user_id,
        entity_table,
        entity_id,
        action,
        old_record,
        new_record
    ) values (
        v_supplier_org_id,
        p_actor_user_id,
        'restock_quotes',
        v_quote.id,
        case when v_had_quote then 'UPDATE' else 'INSERT' end,
        case when v_had_quote then jsonb_build_object(
            'revision', v_quote.revision - 1
        ) else null end,
        jsonb_build_object(
            'reference', v_quote.reference,
            'requestId', p_request_id,
            'revision', v_quote.revision,
            'idempotencyKey', p_idempotency_key
        )
    );

    return jsonb_build_object(
        'id', v_quote.id,
        'reference', v_quote.reference,
        'score', v_quote.score,
        'revision', v_quote.revision
    );
end;
$$;

revoke all on function public.restock_submit_quote(
    uuid, uuid, uuid, uuid, text, numeric, integer, text
) from public, anon, authenticated;
grant execute on function public.restock_submit_quote(
    uuid, uuid, uuid, uuid, text, numeric, integer, text
) to service_role;

create function public.restock_award_quote(
    p_actor_user_id uuid,
    p_idempotency_key uuid,
    p_request_id uuid,
    p_quote_id uuid,
    p_order_id uuid,
    p_order_reference text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_retailer_org_id uuid;
    v_retailer_alias text;
    v_request public.restock_sourcing_requests%rowtype;
    v_quote public.restock_quotes%rowtype;
    v_order public.restock_orders%rowtype;
    v_total_quantity integer;
    v_summary text;
begin
    if p_actor_user_id is null or p_idempotency_key is null then
        raise sqlstate 'PT400' using message = 'A valid idempotency key is required.';
    end if;

    select organization.id, organization.alias_code
    into v_retailer_org_id, v_retailer_alias
    from public.restock_organization_members membership
    join public.restock_organizations organization
      on organization.id = membership.organization_id
    where membership.user_id = p_actor_user_id
      and membership.member_role in ('owner', 'manager', 'operator')
      and organization.account_type = 'retailer'
      and organization.status = 'active'
    limit 1;

    if v_retailer_org_id is null then
        raise sqlstate 'PT403' using message = 'An active retailer operator account is required.';
    end if;

    perform pg_catalog.pg_advisory_xact_lock(
        pg_catalog.hashtextextended(v_retailer_org_id::text || ':' || p_request_id::text, 0)
    );

    select * into v_request
    from public.restock_sourcing_requests request
    where request.id = p_request_id
      and request.retailer_org_id = v_retailer_org_id
    for update;

    if v_request.id is null then
        raise sqlstate 'PT404' using message = 'Quote request not found.';
    end if;

    select * into v_order
    from public.restock_orders restock_order
    where restock_order.request_id = p_request_id
    for update;

    if v_order.id is not null then
        if v_order.quote_id = p_quote_id then
            return jsonb_build_object('id', v_order.id, 'reference', v_order.reference);
        end if;
        raise sqlstate 'PT409' using message = 'A different supplier has already been selected.';
    end if;

    if v_request.status not in ('sent', 'quoted') or v_request.quote_deadline <= now() then
        raise sqlstate 'PT409' using message = 'This quote request is closed and can no longer be awarded.';
    end if;

    select * into v_quote
    from public.restock_quotes quote
    where quote.id = p_quote_id
      and quote.request_id = p_request_id
      and quote.status = 'submitted'
    for update;

    if v_quote.id is null then
        raise sqlstate 'PT409' using message = 'This supplier quote is no longer available.';
    end if;

    if not exists (
        select 1
        from public.restock_organizations organization
        join public.restock_supplier_profiles profile
          on profile.organization_id = organization.id
        where organization.id = v_quote.supplier_org_id
          and organization.account_type = 'supplier'
          and organization.status = 'active'
    ) then
        raise sqlstate 'PT409' using message = 'The supplier account is no longer active.';
    end if;

    if p_order_id is null or p_order_reference !~ '^ORD-[A-Z0-9]{8}$' then
        raise sqlstate 'PT400' using message = 'The order identifier is invalid.';
    end if;

    select sum(line.quantity)::integer
    into v_total_quantity
    from public.restock_request_lines line
    where line.request_id = p_request_id;

    select case
        when count(*) = 1 then min(line.product_name)
        else (array_agg(line.product_name order by line.created_at))[1] || ' + ' || (count(*) - 1) || ' more'
    end
    into v_summary
    from public.restock_request_lines line
    where line.request_id = p_request_id;

    insert into public.restock_orders (
        id,
        reference,
        request_id,
        quote_id,
        buyer_org_id,
        supplier_org_id,
        retailer_alias,
        supplier_alias,
        product_summary,
        quantity,
        unit_price,
        total_price,
        delivery_date,
        courier_last_scan,
        idempotency_key,
        created_by
    ) values (
        p_order_id,
        p_order_reference,
        p_request_id,
        p_quote_id,
        v_retailer_org_id,
        v_quote.supplier_org_id,
        v_retailer_alias,
        v_quote.supplier_alias,
        v_summary,
        v_total_quantity,
        v_quote.total_price / v_total_quantity,
        v_quote.total_price,
        v_quote.delivery_date,
        'Ninja Van booking pending',
        p_idempotency_key,
        p_actor_user_id
    )
    returning * into v_order;

    insert into public.restock_order_items (
        order_id,
        product_id,
        product_name,
        category,
        quantity,
        unit_price
    )
    select
        p_order_id,
        line.product_id,
        line.product_name,
        line.category,
        line.quantity,
        v_quote.total_price / v_total_quantity
    from public.restock_request_lines line
    where line.request_id = p_request_id;

    insert into public.restock_fulfillment_events (
        order_id,
        actor_type,
        event_type,
        title,
        detail
    ) values
    (
        p_order_id,
        'system',
        'order_confirmed',
        'Order created',
        'The supplier is preparing the order for Ninja Van pickup.'
    ),
    (
        p_order_id,
        'ninja_van',
        'booking_pending',
        'Ninja Van booking queued',
        'The courier booking is queued for secure processing.'
    );

    insert into public.restock_integration_outbox (
        aggregate_type,
        aggregate_id,
        event_type,
        payload
    ) values (
        'order',
        p_order_id,
        'ninjavan_create_order',
        jsonb_build_object(
            'orderId', p_order_id,
            'orderReference', p_order_reference
        )
    );

    update public.restock_sourcing_requests
    set status = 'awarded', awarded_quote_id = p_quote_id
    where id = p_request_id;

    update public.restock_quotes
    set status = case when id = p_quote_id then 'awarded' else 'declined' end
    where request_id = p_request_id
      and status = 'submitted';

    insert into public.restock_notifications (
        user_id,
        organization_id,
        notification_type,
        title,
        body,
        link_path
    )
    select
        membership.user_id,
        membership.organization_id,
        'quote_awarded',
        'Your quote was selected',
        p_order_reference || ' is ready for you to prepare and photograph before pickup.',
        '/auction/supplier/operations'
    from public.restock_organization_members membership
    where membership.organization_id = v_quote.supplier_org_id;

    insert into public.restock_audit_log (
        organization_id,
        actor_user_id,
        entity_table,
        entity_id,
        action,
        new_record
    ) values (
        v_retailer_org_id,
        p_actor_user_id,
        'restock_orders',
        p_order_id,
        'INSERT',
        jsonb_build_object(
            'reference', p_order_reference,
            'requestReference', v_request.reference,
            'idempotencyKey', p_idempotency_key,
            'integrationQueued', true
        )
    );

    return jsonb_build_object('id', v_order.id, 'reference', v_order.reference);
end;
$$;

revoke all on function public.restock_award_quote(
    uuid, uuid, uuid, uuid, uuid, text
) from public, anon, authenticated;
grant execute on function public.restock_award_quote(
    uuid, uuid, uuid, uuid, uuid, text
) to service_role;

create function private.restock_expire_requests()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_request record;
    v_expired integer := 0;
begin
    for v_request in
        select request.id,
               request.reference,
               request.retailer_org_id,
               request.status
        from public.restock_sourcing_requests request
        where request.status in ('sent', 'quoted')
          and request.quote_deadline <= now()
        order by request.quote_deadline
        for update skip locked
    loop
        update public.restock_sourcing_requests
        set status = 'expired'
        where id = v_request.id;

        update public.restock_quotes
        set status = 'expired'
        where request_id = v_request.id
          and status = 'submitted';

        insert into public.restock_notifications (
            user_id,
            organization_id,
            notification_type,
            title,
            body,
            link_path
        )
        select
            membership.user_id,
            membership.organization_id,
            'request_expired',
            'Quote request closed',
            v_request.reference || ' closed without a supplier being selected.',
            case
                when organization.account_type = 'retailer' then '/auction/shop/requests'
                else '/auction/supplier/crm'
            end
        from public.restock_organization_members membership
        join public.restock_organizations organization
          on organization.id = membership.organization_id
        where membership.organization_id = v_request.retailer_org_id
           or membership.organization_id in (
               select invitation.supplier_org_id
               from public.restock_request_suppliers invitation
               where invitation.request_id = v_request.id
           );

        insert into public.restock_audit_log (
            organization_id,
            entity_table,
            entity_id,
            action,
            old_record,
            new_record
        ) values (
            v_request.retailer_org_id,
            'restock_sourcing_requests',
            v_request.id,
            'UPDATE',
            jsonb_build_object('status', v_request.status),
            jsonb_build_object('status', 'expired', 'expiredBy', 'cron')
        );

        v_expired := v_expired + 1;
    end loop;

    delete from private.restock_rate_limits
    where bucket_started_at < now() - interval '2 days';

    return v_expired;
end;
$$;

revoke all on function private.restock_expire_requests()
from public, anon, authenticated;

select cron.schedule(
    'restock-expire-quote-requests',
    '*/5 * * * *',
    'select private.restock_expire_requests();'
);
