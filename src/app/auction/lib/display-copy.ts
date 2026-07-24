import type {
    DeliveryDispute,
    DeliveryProof,
    FulfillmentOrder,
    SourcingRequest,
} from "./order-workflow-store";

export function retailerRequestStatus(status: SourcingRequest["status"]) {
    return {
        sent: "Waiting for quotes",
        quoted: "Quotes received",
        awarded: "Supplier selected",
        cancelled: "Cancelled",
        expired: "Closed",
    }[status];
}

export function supplierRequestStatus(status: SourcingRequest["status"]) {
    return {
        sent: "Open for quotes",
        quoted: "Open for quotes",
        awarded: "Supplier selected",
        cancelled: "Cancelled",
        expired: "Closed",
    }[status];
}

export function retailerOrderStatus(status: FulfillmentOrder["verificationStatus"]) {
    return {
        awaiting_supplier_proof: "Supplier preparing order",
        awaiting_courier_pickup: "Awaiting Ninja Van pickup",
        in_transit: "In delivery",
        awaiting_shop_verification: "Confirm delivery",
        verified: "Completed",
        disputed: "Issue under review",
    }[status];
}

export function supplierOrderStatus(status: FulfillmentOrder["verificationStatus"]) {
    return {
        awaiting_supplier_proof: "Add dispatch photo",
        awaiting_courier_pickup: "Awaiting Ninja Van pickup",
        in_transit: "In delivery",
        awaiting_shop_verification: "Awaiting retailer confirmation",
        verified: "Completed",
        disputed: "Issue under review",
    }[status];
}

export function disputeStatusLabel(status: DeliveryDispute["status"]) {
    return {
        reviewing: "Under review",
        needs_information: "More information needed",
        resolved_buyer: "Resolved for retailer",
        resolved_supplier: "Resolved for supplier",
        refunded: "Refunded",
        closed: "Closed",
    }[status];
}

export function proofConditionLabel(condition: DeliveryProof["condition"]) {
    return {
        sealed: "Packed and sealed",
        good: "Everything is correct",
        damaged: "Some items are damaged",
        short: "Some items are missing",
        wrong_items: "Wrong items arrived",
        other: "Another issue",
    }[condition];
}

export function timelineEventCopy(event: { title: string; detail: string }) {
    const title = {
        "Order confirmed": "Order created",
        "Ninja Van booking requested": "Ninja Van pickup requested",
        "Sealed handoff proof recorded": "Dispatch photo added",
        "Delivery verified by retailer": "Delivery confirmed by retailer",
        "Delivery discrepancy reported": "Delivery issue reported",
        "Verification complete": "Order completed",
        "Evidence review opened": "Independent review opened",
        "Independent review: buyer refunded": "Review completed: retailer refunded",
        "Independent review: supplier upheld": "Review completed: supplier paid",
    }[event.title] ?? event.title.replace(/^Ninja Van · /, "Ninja Van update: ");

    const detail =
        {
            "Counterparty identities remain protected. Payout is held until verification.":
                "The supplier is preparing the order for Ninja Van pickup.",
            "The protected pickup and delivery route is awaiting courier confirmation.":
                "Waiting for Ninja Van to confirm the pickup.",
            "Supplier proof, Ninja Van scan, and retailer proof agree. Payout released.":
                "The retailer confirmed the order arrived correctly. Payment status was updated.",
        }[event.detail] ??
        event.detail
            .replace(" photographed before Ninja Van collection.", " were photographed before Ninja Van pickup.")
            .replace(
                " created. Payout is held for independent review.",
                " was created. The order will remain open until a reviewer decides."
            );

    return { title, detail };
}
