drop policy "restock members read own organizations" on public.restock_organizations;

create policy "restock members read own organizations"
on public.restock_organizations for select to authenticated
using (
    created_by = (select auth.uid())
    or private.restock_user_belongs_to(id)
);
