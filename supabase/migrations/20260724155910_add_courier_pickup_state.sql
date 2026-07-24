alter table public.restock_orders
    drop constraint restock_orders_verification_status_check;

alter table public.restock_orders
    add constraint restock_orders_verification_status_check
    check (
        verification_status in (
            'awaiting_supplier_proof',
            'awaiting_courier_pickup',
            'in_transit',
            'awaiting_shop_verification',
            'verified',
            'disputed'
        )
    );
