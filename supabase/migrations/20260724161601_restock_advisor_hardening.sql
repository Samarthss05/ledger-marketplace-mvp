create policy "restock reviewers deny direct data api access"
on public.restock_reviewers for all to authenticated
using (false)
with check (false);

revoke execute on function public.restock_onboard_organization(
    uuid, text, text, text, text, text[], text, text, text, text, text, text
) from authenticated;
grant execute on function public.restock_onboard_organization(
    uuid, text, text, text, text, text[], text, text, text, text, text, text
) to service_role;

create index if not exists restock_organizations_created_by_idx
on public.restock_organizations(created_by);
create index if not exists restock_request_lines_request_idx
on public.restock_request_lines(request_id);
create index if not exists restock_requests_awarded_quote_idx
on public.restock_sourcing_requests(awarded_quote_id)
where awarded_quote_id is not null;
create index if not exists restock_requests_created_by_idx
on public.restock_sourcing_requests(created_by);
create index if not exists restock_quotes_supplier_idx
on public.restock_quotes(supplier_org_id, submitted_at desc);
create index if not exists restock_quotes_submitted_by_idx
on public.restock_quotes(submitted_by);
create index if not exists restock_orders_created_by_idx
on public.restock_orders(created_by);
create index if not exists restock_order_items_order_idx
on public.restock_order_items(order_id);
create index if not exists restock_proofs_submitted_by_idx
on public.restock_delivery_proofs(submitted_by);
create index if not exists restock_disputes_opened_by_idx
on public.restock_disputes(opened_by);
create index if not exists restock_disputes_reviewer_idx
on public.restock_disputes(assigned_reviewer)
where assigned_reviewer is not null;
create index if not exists restock_dispute_messages_dispute_idx
on public.restock_dispute_messages(dispute_id, created_at);
create index if not exists restock_dispute_messages_author_idx
on public.restock_dispute_messages(author_user_id)
where author_user_id is not null;
create index if not exists restock_notifications_org_idx
on public.restock_notifications(organization_id, created_at desc);
