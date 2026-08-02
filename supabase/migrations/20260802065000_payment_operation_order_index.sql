-- Cover the payment-operation order foreign key for order deletion checks and
-- operational lookups. The pending-work partial index is intentionally retained
-- for the worker queue.
create index if not exists restock_payment_operations_order_idx
  on public.restock_payment_operations(order_id);
