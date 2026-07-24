drop function if exists public.restock_onboard_organization(
    uuid, text, text, text, text, text[], text, text, text, text, text, text
);

create function public.restock_onboard_organization(
    actor_user_id uuid,
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
begin
    if actor_user_id is null or not exists (
        select 1 from auth.users where id = actor_user_id
    ) then
        raise exception 'A valid authenticated user is required.';
    end if;
    if exists (
        select 1
        from public.restock_organization_members membership
        where membership.user_id = actor_user_id
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
        organization_id, trim(legal_name), trim(display_name), account_type, alias_code, actor_user_id
    );

    insert into public.restock_organization_members (
        organization_id, user_id, member_role
    ) values (
        organization_id, actor_user_id, 'owner'
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
    uuid, uuid, text, text, text, text, text[], text, text, text, text, text, text
) from public, anon, authenticated;
grant execute on function public.restock_onboard_organization(
    uuid, uuid, text, text, text, text, text[], text, text, text, text, text, text
) to service_role;
