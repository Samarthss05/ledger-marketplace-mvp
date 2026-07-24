create index if not exists restock_audit_actor_idx
on public.restock_audit_log(actor_user_id, created_at desc)
where actor_user_id is not null;
