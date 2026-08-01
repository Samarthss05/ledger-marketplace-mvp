create policy "restock integration outbox denies direct data api access"
on public.restock_integration_outbox for all to authenticated
using (false)
with check (false);

create index if not exists restock_quote_revisions_submitted_by_idx
on public.restock_quote_revisions(submitted_by, created_at desc);
