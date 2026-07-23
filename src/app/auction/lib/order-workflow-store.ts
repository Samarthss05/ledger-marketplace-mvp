"use client";

import { useCallback, useEffect, useState } from "react";
import type { ShopOrder } from "./mock-data";
import { products } from "./products-db";

export interface OrderLine {
    id: string;
    productId: string;
    productName: string;
    category: string;
    quantity: number;
    targetPrice: number;
    marketPrice: number;
}

export interface SupplierQuote {
    id: string;
    requestId: string;
    supplierId: string;
    supplierName: string;
    totalPrice: number;
    deliveryDays: number;
    deliveryDate: string;
    paymentTerms: string;
    score: number;
    submittedAt: string;
}

export interface SourcingRequest {
    id: string;
    title: string;
    shopName: string;
    lines: OrderLine[];
    deliveryDate: string;
    priority: "standard" | "urgent";
    notes: string;
    status: "sent" | "quoted" | "awarded";
    selectedSupplierIds: string[];
    quotes: SupplierQuote[];
    awardedQuoteId?: string;
    createdAt: string;
}

export interface DeliveryProof {
    id: string;
    actor: "supplier" | "shop";
    photoDataUrl: string;
    fileName: string;
    quantity: number;
    note: string;
    condition: "sealed" | "good" | "damaged" | "short" | "wrong_items" | "other";
    capturedAt: string;
}

export interface FulfillmentEvent {
    id: string;
    actor: "supplier" | "ninja_van" | "shop" | "system";
    title: string;
    detail: string;
    at: string;
}

export interface DeliveryDispute {
    id: string;
    reason: "damaged" | "short" | "wrong_items" | "other";
    details: string;
    status: "reviewing" | "resolved";
    aiAssessment: string;
    payoutOnHold: boolean;
    openedAt: string;
}

export interface FulfillmentOrder extends ShopOrder {
    supplierId: string;
    supplierAlias: string;
    retailerAlias: string;
    courier: {
        partner: "Ninja Van";
        trackingId: string;
        status: "pickup_scheduled" | "in_transit" | "delivered";
        lastScan: string;
        lastScanAt: string;
    };
    verificationStatus:
        | "awaiting_supplier_proof"
        | "in_transit"
        | "awaiting_shop_verification"
        | "verified"
        | "disputed";
    supplierProof?: DeliveryProof;
    shopProof?: DeliveryProof;
    dispute?: DeliveryDispute;
    events: FulfillmentEvent[];
}

export interface CreateRequestInput {
    title: string;
    lines: OrderLine[];
    deliveryDate: string;
    priority: "standard" | "urgent";
    notes: string;
    selectedSupplierIds: string[];
}

export interface SubmitQuoteInput {
    requestId: string;
    supplierId: string;
    supplierName: string;
    totalPrice: number;
    deliveryDays: number;
    paymentTerms: string;
}

export interface SubmitSupplierProofInput {
    orderId: string;
    photoDataUrl: string;
    fileName: string;
    quantity: number;
    note: string;
}

export interface VerifyShopDeliveryInput {
    orderId: string;
    photoDataUrl: string;
    fileName: string;
    quantity: number;
    note: string;
    outcome: "accepted" | "damaged" | "short" | "wrong_items" | "other";
}

const REQUESTS_KEY = "restock-sourcing-requests-v3";
const ORDERS_KEY = "restock-created-orders-v3";
const UPDATED_EVENT = "restock:order-workflow-updated";

const milo = products.find((product) => product.name.includes("Milo 400G")) ?? products[0];
const sauce = products.find((product) => product.name.includes("Oyster Sauce 770G")) ?? products[1];
const rice = products.find((product) => product.name.includes("Basmati Rice 1KG")) ?? products[2];

const seedRequests: SourcingRequest[] = [
    {
        id: "RFQ-4901",
        title: "August beverage and cooking stock",
        shopName: "RK Minimart",
        lines: [
            {
                id: "LINE-4901-1",
                productId: milo.id,
                productName: milo.name,
                category: milo.category,
                quantity: 120,
                targetPrice: 3.9,
                marketPrice: milo.price,
            },
            {
                id: "LINE-4901-2",
                productId: sauce.id,
                productName: sauce.name,
                category: sauce.category,
                quantity: 80,
                targetPrice: 4.1,
                marketPrice: sauce.price,
            },
        ],
        deliveryDate: "2026-08-02",
        priority: "standard",
        notes: "Deliver both lines together during the morning receiving window.",
        status: "quoted",
        selectedSupplierIds: ["SUP-001", "SUP-002", "SUP-006"],
        createdAt: "2026-07-22T09:00:00.000Z",
        quotes: [
            {
                id: "QUOTE-4901-1",
                requestId: "RFQ-4901",
                supplierId: "SUP-001",
                supplierName: "Pacific Foods Distribution",
                totalPrice: 762,
                deliveryDays: 5,
                deliveryDate: "2026-08-01",
                paymentTerms: "Net 30",
                score: 94,
                submittedAt: "2026-07-22T11:30:00.000Z",
            },
            {
                id: "QUOTE-4901-2",
                requestId: "RFQ-4901",
                supplierId: "SUP-002",
                supplierName: "Golden Harvest Trading",
                totalPrice: 735,
                deliveryDays: 7,
                deliveryDate: "2026-08-02",
                paymentTerms: "Net 15",
                score: 88,
                submittedAt: "2026-07-22T13:15:00.000Z",
            },
            {
                id: "QUOTE-4901-3",
                requestId: "RFQ-4901",
                supplierId: "SUP-006",
                supplierName: "Sunrise Wholesale Hub",
                totalPrice: 748,
                deliveryDays: 5,
                deliveryDate: "2026-08-01",
                paymentTerms: "Net 30",
                score: 91,
                submittedAt: "2026-07-22T15:00:00.000Z",
            },
        ],
    },
    {
        id: "RFQ-4902",
        title: "Weekend rice replenishment",
        shopName: "RK Minimart",
        lines: [
            {
                id: "LINE-4902-1",
                productId: rice.id,
                productName: rice.name,
                category: rice.category,
                quantity: 180,
                targetPrice: 4.5,
                marketPrice: rice.price,
            },
        ],
        deliveryDate: "2026-08-05",
        priority: "standard",
        notes: "Pallet delivery is acceptable.",
        status: "sent",
        selectedSupplierIds: ["SUP-001", "SUP-002", "SUP-006"],
        quotes: [],
        createdAt: "2026-07-23T08:30:00.000Z",
    },
];

const seedOrders: FulfillmentOrder[] = [
    {
        id: "ORD-6002",
        shopName: "RK Minimart",
        auctionId: "RFQ-4894",
        supplierId: "SUP-001",
        supplierName: "Pacific Foods Distribution",
        supplierAlias: "Verified Supplier B",
        retailerAlias: "East Retailer R-118",
        productName: "India Gate Classic Basmati Rice 1KG",
        quantity: 180,
        unitPrice: 4.42,
        totalPrice: 795.6,
        deliveryDate: "2026-07-28",
        status: "confirmed",
        createdAt: "2026-07-23T02:10:00.000Z",
        courier: {
            partner: "Ninja Van",
            trackingId: "NVSG-784118",
            status: "pickup_scheduled",
            lastScan: "Pickup booking created",
            lastScanAt: "2026-07-23T02:10:00.000Z",
        },
        verificationStatus: "awaiting_supplier_proof",
        events: [
            {
                id: "EVT-6002-1",
                actor: "system",
                title: "Order confirmed",
                detail: "Payment protected until delivery verification.",
                at: "2026-07-23T02:10:00.000Z",
            },
            {
                id: "EVT-6002-2",
                actor: "ninja_van",
                title: "Ninja Van pickup booked",
                detail: "Tracking NVSG-784118 created for the protected route.",
                at: "2026-07-23T02:11:00.000Z",
            },
        ],
    },
    {
        id: "ORD-6001",
        shopName: "RK Minimart",
        auctionId: "RFQ-4888",
        supplierId: "SUP-001",
        supplierName: "Pacific Foods Distribution",
        supplierAlias: "Verified Supplier A",
        retailerAlias: "Central Retailer R-104",
        productName: "Nestle Milo 400G + 1 more",
        quantity: 200,
        unitPrice: 3.81,
        totalPrice: 762,
        deliveryDate: "2026-07-24",
        status: "shipped",
        createdAt: "2026-07-20T09:00:00.000Z",
        courier: {
            partner: "Ninja Van",
            trackingId: "NVSG-784102",
            status: "delivered",
            lastScan: "Delivered to receiving location",
            lastScanAt: "2026-07-23T07:42:00.000Z",
        },
        verificationStatus: "awaiting_shop_verification",
        supplierProof: {
            id: "EV-SUP-6001",
            actor: "supplier",
            photoDataUrl: "",
            fileName: "sealed-handoff.jpg",
            quantity: 200,
            note: "Eight sealed cartons handed to Ninja Van.",
            condition: "sealed",
            capturedAt: "2026-07-22T04:20:00.000Z",
        },
        events: [
            {
                id: "EVT-6001-1",
                actor: "system",
                title: "Order confirmed",
                detail: "Payment protected until delivery verification.",
                at: "2026-07-20T09:00:00.000Z",
            },
            {
                id: "EVT-6001-2",
                actor: "supplier",
                title: "Supplier handoff proof recorded",
                detail: "200 units photographed in sealed cartons.",
                at: "2026-07-22T04:20:00.000Z",
            },
            {
                id: "EVT-6001-3",
                actor: "ninja_van",
                title: "Ninja Van pickup scan",
                detail: "Shipment NVSG-784102 entered the courier network.",
                at: "2026-07-22T05:05:00.000Z",
            },
            {
                id: "EVT-6001-4",
                actor: "ninja_van",
                title: "Ninja Van delivery scan",
                detail: "Delivered to the protected receiving location.",
                at: "2026-07-23T07:42:00.000Z",
            },
        ],
    },
];

function parseArray<T>(value: string | null, fallback: T[]): T[] {
    if (!value) return fallback;

    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : fallback;
    } catch {
        return fallback;
    }
}

function readRequests() {
    return parseArray<SourcingRequest>(
        window.localStorage.getItem(REQUESTS_KEY),
        seedRequests
    );
}

function readCreatedOrders() {
    return parseArray<FulfillmentOrder>(
        window.localStorage.getItem(ORDERS_KEY),
        seedOrders
    );
}

function persist(requests: SourcingRequest[], createdOrders: FulfillmentOrder[]) {
    window.localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
    window.localStorage.setItem(ORDERS_KEY, JSON.stringify(createdOrders));
    window.dispatchEvent(new Event(UPDATED_EVENT));
}

function scoreQuote(request: SourcingRequest, totalPrice: number, deliveryDays: number) {
    const targetTotal = request.lines.reduce(
        (total, line) => total + line.targetPrice * line.quantity,
        0
    );
    const priceScore = Math.max(0, Math.min(100, (targetTotal / totalPrice) * 88));
    const speedScore = Math.max(45, 100 - deliveryDays * 6);
    return Math.round(priceScore * 0.72 + speedScore * 0.28);
}

function newEvent(
    actor: FulfillmentEvent["actor"],
    title: string,
    detail: string,
    at = new Date()
): FulfillmentEvent {
    return {
        id: `EVT-${at.getTime()}-${actor}`,
        actor,
        title,
        detail,
        at: at.toISOString(),
    };
}

function createProof(
    actor: DeliveryProof["actor"],
    input: {
        photoDataUrl: string;
        fileName: string;
        quantity: number;
        note: string;
        condition: DeliveryProof["condition"];
    },
    capturedAt = new Date()
): DeliveryProof {
    return {
        ...input,
        id: `EV-${actor.toUpperCase()}-${capturedAt.getTime()}`,
        actor,
        capturedAt: capturedAt.toISOString(),
    };
}

function getDisputeAssessment(
    order: FulfillmentOrder,
    quantity: number,
    outcome: VerifyShopDeliveryInput["outcome"]
) {
    const supplierQuantity = order.supplierProof?.quantity ?? order.quantity;
    const difference = supplierQuantity - quantity;
    const quantityFinding =
        difference === 0
            ? "Both parties recorded the same quantity."
            : `Supplier evidence records ${supplierQuantity} units while shop evidence records ${quantity}, a difference of ${Math.abs(difference)} units.`;
    const courierFinding =
        order.courier.status === "delivered"
            ? "Ninja Van confirms a completed delivery scan."
            : "Ninja Van has not yet recorded a final delivery scan.";
    const issueFinding =
        outcome === "damaged"
            ? "Shop evidence reports visible damage."
            : outcome === "wrong_items"
              ? "Shop evidence reports a product mismatch."
              : outcome === "short"
                ? "Shop evidence reports a quantity shortage."
                : "Shop requested manual review.";

    return `${issueFinding} ${quantityFinding} ${courierFinding} Payout remains on hold while the evidence is reviewed.`;
}

export function getSupplierAlias(supplierId: string) {
    const supplierNumber = Number(supplierId.split("-").at(-1));
    const index = Number.isFinite(supplierNumber)
        ? Math.max(0, Math.min(25, supplierNumber - 1))
        : 0;
    return `Verified Supplier ${String.fromCharCode(65 + index)}`;
}

export function isFulfillmentOrder(order: ShopOrder): order is FulfillmentOrder {
    return "courier" in order && "verificationStatus" in order;
}

export function useOrderWorkflowStore() {
    const [requests, setRequests] = useState<SourcingRequest[]>([]);
    const [createdOrders, setCreatedOrders] = useState<FulfillmentOrder[]>([]);

    const refresh = useCallback(() => {
        setRequests(readRequests());
        setCreatedOrders(readCreatedOrders());
    }, []);

    useEffect(() => {
        const refreshTimer = window.setTimeout(refresh, 0);
        window.addEventListener("storage", refresh);
        window.addEventListener(UPDATED_EVENT, refresh);

        return () => {
            window.clearTimeout(refreshTimer);
            window.removeEventListener("storage", refresh);
            window.removeEventListener(UPDATED_EVENT, refresh);
        };
    }, [refresh]);

    const createRequest = useCallback((input: CreateRequestInput) => {
        const currentRequests = readRequests();
        const currentOrders = readCreatedOrders();
        const createdAt = new Date();
        const request: SourcingRequest = {
            ...input,
            id: `RFQ-${createdAt.getTime().toString().slice(-6)}`,
            shopName: "RK Minimart",
            status: "sent",
            quotes: [],
            createdAt: createdAt.toISOString(),
        };
        const nextRequests = [request, ...currentRequests];
        persist(nextRequests, currentOrders);
        setRequests(nextRequests);
        return request;
    }, []);

    const submitQuote = useCallback((input: SubmitQuoteInput) => {
        const currentRequests = readRequests();
        const currentOrders = readCreatedOrders();
        const request = currentRequests.find((candidate) => candidate.id === input.requestId);
        if (!request) return;

        const submittedAt = new Date();
        const deliveryDate = new Date(
            submittedAt.getTime() + input.deliveryDays * 24 * 60 * 60 * 1000
        );
        const quote: SupplierQuote = {
            ...input,
            id: `QUOTE-${submittedAt.getTime()}`,
            deliveryDate: deliveryDate.toISOString().slice(0, 10),
            score: scoreQuote(request, input.totalPrice, input.deliveryDays),
            submittedAt: submittedAt.toISOString(),
        };

        const nextRequests = currentRequests.map((candidate) =>
            candidate.id === input.requestId
                ? {
                    ...candidate,
                    status: "quoted" as const,
                    quotes: [
                        quote,
                        ...candidate.quotes.filter(
                            (existing) => existing.supplierId !== input.supplierId
                        ),
                    ],
                }
                : candidate
        );
        persist(nextRequests, currentOrders);
        setRequests(nextRequests);
    }, []);

    const awardQuote = useCallback((requestId: string, quoteId: string) => {
        const currentRequests = readRequests();
        const currentOrders = readCreatedOrders();
        const request = currentRequests.find((candidate) => candidate.id === requestId);
        const quote = request?.quotes.find((candidate) => candidate.id === quoteId);
        if (!request || !quote) return;

        const now = new Date();
        const quantity = request.lines.reduce((total, line) => total + line.quantity, 0);
        const productName =
            request.lines.length === 1
                ? request.lines[0].productName
                : `${request.lines[0].productName} + ${request.lines.length - 1} more`;
        const trackingSuffix = now.getTime().toString().slice(-6);
        const order: FulfillmentOrder = {
            id: `ORD-${trackingSuffix}`,
            shopName: request.shopName,
            auctionId: request.id,
            supplierId: quote.supplierId,
            supplierName: quote.supplierName,
            supplierAlias: getSupplierAlias(quote.supplierId),
            retailerAlias: `Central Retailer R-${request.id.slice(-3)}`,
            productName,
            quantity,
            unitPrice: quote.totalPrice / quantity,
            totalPrice: quote.totalPrice,
            deliveryDate: quote.deliveryDate,
            status: "confirmed",
            createdAt: now.toISOString(),
            courier: {
                partner: "Ninja Van",
                trackingId: `NVSG-${trackingSuffix}`,
                status: "pickup_scheduled",
                lastScan: "Pickup booking created",
                lastScanAt: now.toISOString(),
            },
            verificationStatus: "awaiting_supplier_proof",
            events: [
                newEvent(
                    "system",
                    "Order confirmed",
                    "Party identities remain protected. Payout is held until delivery verification.",
                    now
                ),
                newEvent(
                    "ninja_van",
                    "Ninja Van pickup booked",
                    `Tracking NVSG-${trackingSuffix} created for the protected route.`,
                    now
                ),
            ],
        };
        const nextRequests = currentRequests.map((candidate) =>
            candidate.id === requestId
                ? { ...candidate, status: "awarded" as const, awardedQuoteId: quoteId }
                : candidate
        );
        const nextOrders = [
            order,
            ...currentOrders.filter((candidate) => candidate.auctionId !== requestId),
        ];
        persist(nextRequests, nextOrders);
        setRequests(nextRequests);
        setCreatedOrders(nextOrders);
        return order;
    }, []);

    const submitSupplierProof = useCallback((input: SubmitSupplierProofInput) => {
        const currentRequests = readRequests();
        const currentOrders = readCreatedOrders();
        const now = new Date();
        const nextOrders = currentOrders.map((order) => {
            if (order.id !== input.orderId) return order;

            const supplierProof = createProof(
                "supplier",
                {
                    photoDataUrl: input.photoDataUrl,
                    fileName: input.fileName,
                    quantity: input.quantity,
                    note: input.note,
                    condition: "sealed",
                },
                now
            );
            return {
                ...order,
                status: "shipped" as const,
                supplierProof,
                verificationStatus: "in_transit" as const,
                courier: {
                    ...order.courier,
                    status: "in_transit" as const,
                    lastScan: "Shipment collected from anonymous supplier",
                    lastScanAt: now.toISOString(),
                },
                events: [
                    ...order.events,
                    newEvent(
                        "supplier",
                        "Supplier handoff proof recorded",
                        `${input.quantity} units photographed before courier collection.`,
                        now
                    ),
                    newEvent(
                        "ninja_van",
                        "Ninja Van pickup scan",
                        `Shipment ${order.courier.trackingId} entered the courier network.`,
                        now
                    ),
                ],
            };
        });
        persist(currentRequests, nextOrders);
        setCreatedOrders(nextOrders);
    }, []);

    const verifyShopDelivery = useCallback((input: VerifyShopDeliveryInput) => {
        const currentRequests = readRequests();
        const currentOrders = readCreatedOrders();
        const now = new Date();
        const nextOrders = currentOrders.map((order) => {
            if (order.id !== input.orderId) return order;

            const accepted = input.outcome === "accepted";
            const condition: DeliveryProof["condition"] =
                input.outcome === "accepted" ? "good" : input.outcome;
            const shopProof = createProof(
                "shop",
                {
                    photoDataUrl: input.photoDataUrl,
                    fileName: input.fileName,
                    quantity: input.quantity,
                    note: input.note,
                    condition,
                },
                now
            );
            const disputeReason: DeliveryDispute["reason"] =
                input.outcome === "accepted" ? "other" : input.outcome;
            const dispute: DeliveryDispute | undefined = accepted
                ? undefined
                : {
                    id: `DSP-${now.getTime().toString().slice(-6)}`,
                    reason: disputeReason,
                    details: input.note,
                    status: "reviewing",
                    aiAssessment: getDisputeAssessment(order, input.quantity, input.outcome),
                    payoutOnHold: true,
                    openedAt: now.toISOString(),
                };
            const shopEvent = accepted
                ? newEvent(
                    "shop",
                    "Delivery verified by shop",
                    `${input.quantity} units received and photo-confirmed in good condition.`,
                    now
                )
                : newEvent(
                    "shop",
                    "Delivery discrepancy reported",
                    `${input.quantity} units recorded with issue: ${input.outcome.replace("_", " ")}.`,
                    now
                );
            const systemEvent = accepted
                ? newEvent(
                    "system",
                    "Verification complete",
                    "Supplier evidence, courier scan, and shop evidence agree. Payout released.",
                    now
                )
                : newEvent(
                    "system",
                    "Evidence review opened",
                    `${dispute?.id} created and payout placed on hold.`,
                    now
                );

            return {
                ...order,
                status: "delivered" as const,
                shopProof,
                dispute,
                verificationStatus: accepted ? ("verified" as const) : ("disputed" as const),
                courier: {
                    ...order.courier,
                    status: "delivered" as const,
                    lastScan: "Delivery completed at protected receiving location",
                    lastScanAt:
                        order.courier.status === "delivered"
                            ? order.courier.lastScanAt
                            : now.toISOString(),
                },
                events: [...order.events, shopEvent, systemEvent],
            };
        });
        persist(currentRequests, nextOrders);
        setCreatedOrders(nextOrders);
    }, []);

    return {
        requests,
        createdOrders,
        createRequest,
        submitQuote,
        awardQuote,
        submitSupplierProof,
        verifyShopDelivery,
    };
}
