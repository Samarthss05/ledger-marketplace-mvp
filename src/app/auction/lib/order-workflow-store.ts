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

const REQUESTS_KEY = "restock-sourcing-requests-v2";
const ORDERS_KEY = "restock-created-orders-v2";
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
    return parseArray<ShopOrder>(window.localStorage.getItem(ORDERS_KEY), []);
}

function persist(requests: SourcingRequest[], createdOrders: ShopOrder[]) {
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

export function useOrderWorkflowStore() {
    const [requests, setRequests] = useState<SourcingRequest[]>([]);
    const [createdOrders, setCreatedOrders] = useState<ShopOrder[]>([]);

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

        const quantity = request.lines.reduce((total, line) => total + line.quantity, 0);
        const productName =
            request.lines.length === 1
                ? request.lines[0].productName
                : `${request.lines[0].productName} + ${request.lines.length - 1} more`;
        const order: ShopOrder = {
            id: `ORD-${Date.now().toString().slice(-6)}`,
            shopName: request.shopName,
            auctionId: request.id,
            supplierName: quote.supplierName,
            productName,
            quantity,
            unitPrice: quote.totalPrice / quantity,
            totalPrice: quote.totalPrice,
            deliveryDate: quote.deliveryDate,
            status: "confirmed",
            createdAt: new Date().toISOString(),
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

    return {
        requests,
        createdOrders,
        createRequest,
        submitQuote,
        awardQuote,
    };
}
