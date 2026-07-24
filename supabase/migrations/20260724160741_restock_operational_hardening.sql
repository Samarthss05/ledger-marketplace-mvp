create unique index if not exists restock_events_source_unique
on public.restock_fulfillment_events(order_id, source_reference)
where source_reference is not null;

create table public.restock_organization_logistics (
    organization_id uuid primary key references public.restock_organizations(id) on delete cascade,
    contact_name text not null check (char_length(contact_name) between 2 and 100),
    phone_e164 text not null check (phone_e164 ~ '^\+[1-9][0-9]{7,14}$'),
    address_line_1 text not null check (char_length(address_line_1) between 3 and 180),
    address_line_2 text not null default '' check (char_length(address_line_2) <= 180),
    postal_code text not null check (postal_code ~ '^[0-9]{6}$'),
    country_code text not null default 'SG' check (country_code = 'SG'),
    delivery_instructions text not null default '' check (char_length(delivery_instructions) <= 500),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create trigger restock_logistics_updated_at
before update on public.restock_organization_logistics
for each row execute function private.restock_set_updated_at();

alter table public.restock_organization_logistics enable row level security;

create policy "restock members read own logistics"
on public.restock_organization_logistics for select to authenticated
using (private.restock_user_belongs_to(organization_id));

create policy "restock managers update own logistics"
on public.restock_organization_logistics for update to authenticated
using (
    exists (
        select 1
        from public.restock_organization_members membership
        where membership.organization_id = restock_organization_logistics.organization_id
          and membership.user_id = (select auth.uid())
          and membership.member_role in ('owner', 'manager')
    )
)
with check (private.restock_user_belongs_to(organization_id));

grant select, update on public.restock_organization_logistics to authenticated;

create table public.restock_reviewers (
    user_id uuid primary key references auth.users(id) on delete cascade,
    active boolean not null default true,
    created_at timestamptz not null default now()
);

alter table public.restock_reviewers enable row level security;
revoke all on public.restock_reviewers from anon, authenticated;

create or replace function public.restock_onboard_organization(
    organization_id uuid,
    alias_code text,
    legal_name text,
    display_name text,
    account_type text,
    categories text[],
    contact_name text,
    phone_e164 text,
    address_line_1 text,
    address_line_2 text,
    postal_code text,
    delivery_instructions text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
    current_user_id uuid := (select auth.uid());
begin
    if current_user_id is null then
        raise exception 'Authentication required.';
    end if;
    if exists (
        select 1
        from public.restock_organization_members membership
        where membership.user_id = current_user_id
    ) then
        raise exception 'This account already belongs to a ReStock organization.';
    end if;
    if account_type not in ('retailer', 'supplier') then
        raise exception 'Invalid account type.';
    end if;
    if alias_code !~ (case when account_type = 'retailer'
        then '^RET-[A-Z0-9]{6}$'
        else '^SUP-[A-Z0-9]{6}$'
    end) then
        raise exception 'Invalid protected alias.';
    end if;
    if char_length(trim(legal_name)) not between 2 and 160
       or char_length(trim(display_name)) not between 2 and 80
       or char_length(trim(contact_name)) not between 2 and 100
       or phone_e164 !~ '^\+[1-9][0-9]{7,14}$'
       or char_length(trim(address_line_1)) not between 3 and 180
       or postal_code !~ '^[0-9]{6}$' then
        raise exception 'Business and logistics details are invalid.';
    end if;

    insert into public.restock_organizations (
        id, legal_name, display_name, account_type, alias_code, created_by
    ) values (
        organization_id, trim(legal_name), trim(display_name), account_type, alias_code, current_user_id
    );

    insert into public.restock_organization_members (
        organization_id, user_id, member_role
    ) values (
        organization_id, current_user_id, 'owner'
    );

    insert into public.restock_organization_logistics (
        organization_id,
        contact_name,
        phone_e164,
        address_line_1,
        address_line_2,
        postal_code,
        delivery_instructions
    ) values (
        organization_id,
        trim(contact_name),
        phone_e164,
        trim(address_line_1),
        trim(coalesce(address_line_2, '')),
        postal_code,
        trim(coalesce(delivery_instructions, ''))
    );

    if account_type = 'supplier' then
        if coalesce(array_length(categories, 1), 0) = 0 then
            raise exception 'Select at least one supply category.';
        end if;
        insert into public.restock_supplier_profiles (
            organization_id, alias_code, category_tags
        ) values (
            organization_id, alias_code, categories
        );
    end if;

    return organization_id;
end;
$$;

revoke all on function public.restock_onboard_organization(
    uuid, text, text, text, text, text[], text, text, text, text, text, text
) from public, anon;
grant execute on function public.restock_onboard_organization(
    uuid, text, text, text, text, text[], text, text, text, text, text, text
) to authenticated;
