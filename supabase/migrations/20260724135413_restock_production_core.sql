create extension if not exists pgcrypto;
create schema if not exists private;

create table public.restock_organizations (
    id uuid primary key default gen_random_uuid(),
    legal_name text not null check (char_length(legal_name) between 2 and 160),
    display_name text not null check (char_length(display_name) between 2 and 80),
    account_type text not null check (account_type in ('retailer', 'supplier')),
    alias_code text not null unique check (alias_code ~ '^(RET|SUP)-[A-Z0-9]{6}$'),
    status text not null default 'active' check (status in ('active', 'suspended', 'closed')),
    created_by uuid not null references auth.users(id) on delete restrict,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.restock_organization_members (
    organization_id uuid not null references public.restock_organizations(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    member_role text not null default 'owner' check (member_role in ('owner', 'manager', 'operator', 'viewer')),
    created_at timestamptz not null default now(),
    primary key (organization_id, user_id)
);

create table public.restock_supplier_profiles (
    organization_id uuid primary key references public.restock_organizations(id) on delete cascade,
    alias_code text not null unique check (alias_code ~ '^SUP-[A-Z0-9]{6}$'),
    category_tags text[] not null default '{}',
    service_regions text[] not null default array['Singapore']::text[],
    minimum_order_value numeric(12,2) not null default 0 check (minimum_order_value >= 0),
    performance_score numeric(5,2) not null default 0 check (performance_score between 0 and 100),
    on_time_rate numeric(5,2) not null default 0 check (on_time_rate between 0 and 100),
    completed_orders integer not null default 0 check (completed_orders >= 0),
    accepting_requests boolean not null default true,
    updated_at timestamptz not null default now()
);

create table public.restock_sourcing_requests (
    id uuid primary key default gen_random_uuid(),
    reference text not null unique check (reference ~ '^RFQ-[A-Z0-9]{8}$'),
    retailer_org_id uuid not null references public.restock_organizations(id) on delete restrict,
    retailer_alias text not null check (retailer_alias ~ '^RET-[A-Z0-9]{6}$'),
    title text not null check (char_length(title) between 3 and 140),
    delivery_date date not null,
    priority text not null default 'standard' check (priority in ('standard', 'urgent')),
    notes text not null default '' check (char_length(notes) <= 2000),
    status text not null default 'sent' check (status in ('sent', 'quoted', 'awarded', 'cancelled', 'expired')),
    quote_deadline timestamptz not null,
    awarded_quote_id uuid,
    created_by uuid not null references auth.users(id) on delete restrict,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    check (delivery_date >= created_at::date)
);

create table public.restock_request_lines (
    id uuid primary key default gen_random_uuid(),
    request_id uuid not null references public.restock_sourcing_requests(id) on delete cascade,
    product_id text not null check (char_length(product_id) between 1 and 80),
    product_name text not null check (char_length(product_name) between 2 and 200),
    category text not null check (char_length(category) between 2 and 100),
    quantity integer not null check (quantity > 0 and quantity <= 1000000),
    target_price numeric(12,2) not null check (target_price > 0),
    market_price numeric(12,2) not null check (market_price > 0),
    created_at timestamptz not null default now()
);

create table public.restock_request_suppliers (
    request_id uuid not null references public.restock_sourcing_requests(id) on delete cascade,
    supplier_org_id uuid not null references public.restock_organizations(id) on delete restrict,
    supplier_alias text not null check (supplier_alias ~ '^SUP-[A-Z0-9]{6}$'),
    invited_at timestamptz not null default now(),
    viewed_at timestamptz,
    primary key (request_id, supplier_org_id)
);

create table public.restock_quotes (
    id uuid primary key default gen_random_uuid(),
    reference text not null unique check (reference ~ '^QUO-[A-Z0-9]{8}$'),
    request_id uuid not null references public.restock_sourcing_requests(id) on delete restrict,
    supplier_org_id uuid not null references public.restock_organizations(id) on delete restrict,
    supplier_alias text not null check (supplier_alias ~ '^SUP-[A-Z0-9]{6}$'),
    total_price numeric(14,2) not null check (total_price > 0),
    delivery_days integer not null check (delivery_days between 1 and 120),
    delivery_date date not null,
    payment_terms text not null check (char_length(payment_terms) between 2 and 80),
    score integer not null default 0 check (score between 0 and 100),
    status text not null default 'submitted' check (status in ('submitted', 'awarded', 'declined', 'withdrawn')),
    submitted_by uuid not null references auth.users(id) on delete restrict,
    submitted_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (request_id, supplier_org_id)
);

alter table public.restock_sourcing_requests
    add constraint restock_sourcing_requests_awarded_quote_fkey
    foreign key (awarded_quote_id) references public.restock_quotes(id) on delete restrict;

create table public.restock_orders (
    id uuid primary key default gen_random_uuid(),
    reference text not null unique check (reference ~ '^ORD-[A-Z0-9]{8}$'),
    request_id uuid not null unique references public.restock_sourcing_requests(id) on delete restrict,
    quote_id uuid not null unique references public.restock_quotes(id) on delete restrict,
    buyer_org_id uuid not null references public.restock_organizations(id) on delete restrict,
    supplier_org_id uuid not null references public.restock_organizations(id) on delete restrict,
    retailer_alias text not null check (retailer_alias ~ '^RET-[A-Z0-9]{6}$'),
    supplier_alias text not null check (supplier_alias ~ '^SUP-[A-Z0-9]{6}$'),
    product_summary text not null,
    quantity integer not null check (quantity > 0),
    unit_price numeric(12,4) not null check (unit_price > 0),
    total_price numeric(14,2) not null check (total_price > 0),
    delivery_date date not null,
    status text not null default 'confirmed' check (status in ('confirmed', 'in_transit', 'delivered', 'cancelled')),
    verification_status text not null default 'awaiting_supplier_proof'
        check (verification_status in ('awaiting_supplier_proof', 'in_transit', 'awaiting_shop_verification', 'verified', 'disputed')),
    payout_status text not null default 'held' check (payout_status in ('held', 'released', 'under_review', 'refunded')),
    courier_partner text not null default 'Ninja Van' check (courier_partner = 'Ninja Van'),
    courier_tracking_id text,
    courier_status text not null default 'pickup_scheduled'
        check (courier_status in ('pickup_scheduled', 'in_transit', 'delivered', 'exception', 'cancelled')),
    courier_last_scan text not null default 'Pickup pending',
    courier_last_scan_at timestamptz not null default now(),
    version integer not null default 1 check (version > 0),
    created_by uuid not null references auth.users(id) on delete restrict,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    check (buyer_org_id <> supplier_org_id)
);

create table public.restock_order_items (
    id uuid primary key default gen_random_uuid(),
    order_id uuid not null references public.restock_orders(id) on delete cascade,
    product_id text not null,
    product_name text not null,
    category text not null,
    quantity integer not null check (quantity > 0),
    unit_price numeric(12,4) not null check (unit_price > 0),
    created_at timestamptz not null default now()
);

create table public.restock_fulfillment_events (
    id uuid primary key default gen_random_uuid(),
    order_id uuid not null references public.restock_orders(id) on delete cascade,
    actor_type text not null check (actor_type in ('supplier', 'ninja_van', 'retailer', 'system', 'reviewer')),
    event_type text not null check (char_length(event_type) between 2 and 80),
    title text not null check (char_length(title) between 2 and 160),
    detail text not null default '' check (char_length(detail) <= 2000),
    source_reference text,
    occurred_at timestamptz not null default now(),
    created_at timestamptz not null default now()
);

create table public.restock_delivery_proofs (
    id uuid primary key default gen_random_uuid(),
    order_id uuid not null references public.restock_orders(id) on delete restrict,
    actor_type text not null check (actor_type in ('supplier', 'retailer')),
    submitted_by uuid not null references auth.users(id) on delete restrict,
    storage_path text not null unique,
    file_name text not null check (char_length(file_name) between 1 and 255),
    mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp')),
    file_size_bytes integer not null check (file_size_bytes between 1 and 10485760),
    quantity integer not null check (quantity > 0),
    note text not null default '' check (char_length(note) <= 2000),
    condition text not null check (condition in ('sealed', 'good', 'damaged', 'short', 'wrong_items', 'other')),
    captured_at timestamptz not null default now(),
    created_at timestamptz not null default now(),
    unique (order_id, actor_type)
);

create table public.restock_disputes (
    id uuid primary key default gen_random_uuid(),
    reference text not null unique check (reference ~ '^DSP-[A-Z0-9]{8}$'),
    order_id uuid not null unique references public.restock_orders(id) on delete restrict,
    opened_by uuid not null references auth.users(id) on delete restrict,
    reason text not null check (reason in ('damaged', 'short', 'wrong_items', 'other')),
    details text not null check (char_length(details) between 2 and 3000),
    status text not null default 'reviewing' check (status in ('reviewing', 'needs_information', 'resolved_buyer', 'resolved_supplier', 'refunded', 'closed')),
    automated_assessment text not null default '',
    assessment_source text not null default 'rules' check (assessment_source in ('rules', 'openai')),
    payout_on_hold boolean not null default true,
    assigned_reviewer uuid references auth.users(id) on delete set null,
    resolution_note text,
    opened_at timestamptz not null default now(),
    resolved_at timestamptz,
    updated_at timestamptz not null default now()
);

create table public.restock_dispute_messages (
    id uuid primary key default gen_random_uuid(),
    dispute_id uuid not null references public.restock_disputes(id) on delete cascade,
    author_user_id uuid references auth.users(id) on delete set null,
    author_type text not null check (author_type in ('retailer', 'supplier', 'reviewer', 'system')),
    message text not null check (char_length(message) between 1 and 3000),
    created_at timestamptz not null default now()
);

create table public.restock_notifications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    organization_id uuid not null references public.restock_organizations(id) on delete cascade,
    notification_type text not null,
    title text not null,
    body text not null,
    link_path text,
    read_at timestamptz,
    created_at timestamptz not null default now()
);

create table public.restock_audit_log (
    id bigint generated always as identity primary key,
    organization_id uuid references public.restock_organizations(id) on delete set null,
    actor_user_id uuid references auth.users(id) on delete set null,
    entity_table text not null,
    entity_id uuid,
    action text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
    old_record jsonb,
    new_record jsonb,
    created_at timestamptz not null default now()
);

create index restock_members_user_idx on public.restock_organization_members(user_id, organization_id);
create index restock_requests_retailer_idx on public.restock_sourcing_requests(retailer_org_id, created_at desc);
create index restock_request_suppliers_supplier_idx on public.restock_request_suppliers(supplier_org_id, invited_at desc);
create index restock_quotes_request_idx on public.restock_quotes(request_id, score desc);
create index restock_orders_buyer_idx on public.restock_orders(buyer_org_id, created_at desc);
create index restock_orders_supplier_idx on public.restock_orders(supplier_org_id, created_at desc);
create index restock_events_order_idx on public.restock_fulfillment_events(order_id, occurred_at);
create index restock_proofs_order_idx on public.restock_delivery_proofs(order_id, actor_type);
create index restock_disputes_status_idx on public.restock_disputes(status, opened_at desc);
create index restock_notifications_user_idx on public.restock_notifications(user_id, read_at, created_at desc);
create index restock_audit_org_idx on public.restock_audit_log(organization_id, created_at desc);

create or replace function private.restock_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger restock_organizations_updated_at
before update on public.restock_organizations
for each row execute function private.restock_set_updated_at();

create trigger restock_supplier_profiles_updated_at
before update on public.restock_supplier_profiles
for each row execute function private.restock_set_updated_at();

create trigger restock_requests_updated_at
before update on public.restock_sourcing_requests
for each row execute function private.restock_set_updated_at();

create trigger restock_quotes_updated_at
before update on public.restock_quotes
for each row execute function private.restock_set_updated_at();

create trigger restock_orders_updated_at
before update on public.restock_orders
for each row execute function private.restock_set_updated_at();

create trigger restock_disputes_updated_at
before update on public.restock_disputes
for each row execute function private.restock_set_updated_at();

create or replace function private.restock_user_belongs_to(target_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select (select auth.uid()) is not null
       and exists (
           select 1
           from public.restock_organization_members membership
           where membership.organization_id = target_org_id
             and membership.user_id = (select auth.uid())
       );
$$;

create or replace function private.restock_is_request_party(target_request_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select (select auth.uid()) is not null
       and exists (
           select 1
           from public.restock_sourcing_requests request
           where request.id = target_request_id
             and (
                 private.restock_user_belongs_to(request.retailer_org_id)
                 or exists (
                     select 1
                     from public.restock_request_suppliers invited
                     where invited.request_id = request.id
                       and private.restock_user_belongs_to(invited.supplier_org_id)
                 )
             )
       );
$$;

create or replace function private.restock_is_order_party(target_order_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select (select auth.uid()) is not null
       and exists (
           select 1
           from public.restock_orders restock_order
           where restock_order.id = target_order_id
             and (
                 private.restock_user_belongs_to(restock_order.buyer_org_id)
                 or private.restock_user_belongs_to(restock_order.supplier_org_id)
             )
       );
$$;

create or replace function private.restock_can_upload_evidence(target_order_id uuid, target_actor text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select (select auth.uid()) is not null
       and exists (
           select 1
           from public.restock_orders restock_order
           where restock_order.id = target_order_id
             and (
                 (target_actor = 'supplier' and private.restock_user_belongs_to(restock_order.supplier_org_id))
                 or
                 (target_actor = 'retailer' and private.restock_user_belongs_to(restock_order.buyer_org_id))
             )
       );
$$;

revoke all on function private.restock_user_belongs_to(uuid) from public, anon;
revoke all on function private.restock_is_request_party(uuid) from public, anon;
revoke all on function private.restock_is_order_party(uuid) from public, anon;
revoke all on function private.restock_can_upload_evidence(uuid, text) from public, anon;
grant execute on function private.restock_user_belongs_to(uuid) to authenticated;
grant execute on function private.restock_is_request_party(uuid) to authenticated;
grant execute on function private.restock_is_order_party(uuid) to authenticated;
grant execute on function private.restock_can_upload_evidence(uuid, text) to authenticated;

alter table public.restock_organizations enable row level security;
alter table public.restock_organization_members enable row level security;
alter table public.restock_supplier_profiles enable row level security;
alter table public.restock_sourcing_requests enable row level security;
alter table public.restock_request_lines enable row level security;
alter table public.restock_request_suppliers enable row level security;
alter table public.restock_quotes enable row level security;
alter table public.restock_orders enable row level security;
alter table public.restock_order_items enable row level security;
alter table public.restock_fulfillment_events enable row level security;
alter table public.restock_delivery_proofs enable row level security;
alter table public.restock_disputes enable row level security;
alter table public.restock_dispute_messages enable row level security;
alter table public.restock_notifications enable row level security;
alter table public.restock_audit_log enable row level security;

create policy "restock members read own organizations"
on public.restock_organizations for select to authenticated
using (private.restock_user_belongs_to(id));

create policy "restock users create organizations"
on public.restock_organizations for insert to authenticated
with check (created_by = (select auth.uid()));

create policy "restock owners update organizations"
on public.restock_organizations for update to authenticated
using (
    exists (
        select 1 from public.restock_organization_members membership
        where membership.organization_id = id
          and membership.user_id = (select auth.uid())
          and membership.member_role in ('owner', 'manager')
    )
)
with check (created_by is not null);

create policy "restock members read memberships"
on public.restock_organization_members for select to authenticated
using (private.restock_user_belongs_to(organization_id) or user_id = (select auth.uid()));

create policy "restock creators add own membership"
on public.restock_organization_members for insert to authenticated
with check (
    user_id = (select auth.uid())
    and exists (
        select 1 from public.restock_organizations organization
        where organization.id = organization_id
          and organization.created_by = (select auth.uid())
    )
);

create policy "restock authenticated browse active supplier directory"
on public.restock_supplier_profiles for select to authenticated
using (accepting_requests or private.restock_user_belongs_to(organization_id));

create policy "restock suppliers create own directory profile"
on public.restock_supplier_profiles for insert to authenticated
with check (
    private.restock_user_belongs_to(organization_id)
    and exists (
        select 1 from public.restock_organizations organization
        where organization.id = organization_id
          and organization.account_type = 'supplier'
    )
);

create policy "restock suppliers update own directory profile"
on public.restock_supplier_profiles for update to authenticated
using (private.restock_user_belongs_to(organization_id))
with check (private.restock_user_belongs_to(organization_id));

create policy "restock request parties read requests"
on public.restock_sourcing_requests for select to authenticated
using (private.restock_is_request_party(id));

create policy "restock request parties read lines"
on public.restock_request_lines for select to authenticated
using (private.restock_is_request_party(request_id));

create policy "restock request parties read invitations"
on public.restock_request_suppliers for select to authenticated
using (private.restock_is_request_party(request_id));

create policy "restock quote parties read quotes"
on public.restock_quotes for select to authenticated
using (private.restock_is_request_party(request_id));

create policy "restock order parties read orders"
on public.restock_orders for select to authenticated
using (private.restock_is_order_party(id));

create policy "restock order parties read items"
on public.restock_order_items for select to authenticated
using (private.restock_is_order_party(order_id));

create policy "restock order parties read events"
on public.restock_fulfillment_events for select to authenticated
using (private.restock_is_order_party(order_id));

create policy "restock order parties read proofs"
on public.restock_delivery_proofs for select to authenticated
using (private.restock_is_order_party(order_id));

create policy "restock order parties read disputes"
on public.restock_disputes for select to authenticated
using (private.restock_is_order_party(order_id));

create policy "restock order parties read dispute messages"
on public.restock_dispute_messages for select to authenticated
using (
    exists (
        select 1 from public.restock_disputes dispute
        where dispute.id = dispute_id
          and private.restock_is_order_party(dispute.order_id)
    )
);

create policy "restock users read notifications"
on public.restock_notifications for select to authenticated
using (user_id = (select auth.uid()));

create policy "restock users mark notifications read"
on public.restock_notifications for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "restock members read organization audit"
on public.restock_audit_log for select to authenticated
using (organization_id is not null and private.restock_user_belongs_to(organization_id));

grant usage on schema public to authenticated;
grant select, insert, update on public.restock_organizations to authenticated;
grant select, insert on public.restock_organization_members to authenticated;
grant select, insert, update on public.restock_supplier_profiles to authenticated;
grant select on public.restock_sourcing_requests to authenticated;
grant select on public.restock_request_lines to authenticated;
grant select on public.restock_request_suppliers to authenticated;
grant select on public.restock_quotes to authenticated;
grant select on public.restock_orders to authenticated;
grant select on public.restock_order_items to authenticated;
grant select on public.restock_fulfillment_events to authenticated;
grant select on public.restock_delivery_proofs to authenticated;
grant select on public.restock_disputes to authenticated;
grant select on public.restock_dispute_messages to authenticated;
grant select, update(read_at) on public.restock_notifications to authenticated;
grant select on public.restock_audit_log to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'restock-delivery-evidence',
    'restock-delivery-evidence',
    false,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "restock parties read private evidence"
on storage.objects for select to authenticated
using (
    bucket_id = 'restock-delivery-evidence'
    and name ~ '^[0-9a-f-]{36}/(supplier|retailer)/'
    and private.restock_is_order_party(((storage.foldername(name))[1])::uuid)
);

create policy "restock parties upload immutable evidence"
on storage.objects for insert to authenticated
with check (
    bucket_id = 'restock-delivery-evidence'
    and name ~ '^[0-9a-f-]{36}/(supplier|retailer)/[0-9a-f-]{36}\\.(jpg|jpeg|png|webp)$'
    and private.restock_can_upload_evidence(
        ((storage.foldername(name))[1])::uuid,
        (storage.foldername(name))[2]
    )
);
