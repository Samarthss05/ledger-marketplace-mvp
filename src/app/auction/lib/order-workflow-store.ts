"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../components/auth-context";
import type { PreparedEvidencePhoto } from "./delivery-proof-utils";
import { DELIVERY_EVIDENCE_BUCKET, supabase } from "./supabase";

export interface OrderLine {
    id: string;
    productId: string;
    productName: string;
    category: string;
    quantity: number;
    targetPrice: number;
    marketPrice: number;
}

export interface SupplierDirectoryEntry {
    id: string;
    aliasCode: string;
    categoryTags: string[];
    serviceRegions: string[];
    minimumOrderValue: number;
    performanceScore: number;
    onTimeRate: number;
    completedOrders: number;
}

export interface SupplierQuote {
    id: string;
    reference: string;
    requestId: string;
    supplierId: string;
    supplierAlias: string;
    totalPrice: number;
    deliveryDays: number;
    deliveryDate: string;
    paymentTerms: string;
    score: number;
    status: "submitted" | "awarded" | "declined" | "withdrawn";
    submittedAt: string;
}

export interface SourcingRequest {
    id: string;
    reference: string;
    title: string;
    retailerAlias: string;
    lines: OrderLine[];
    deliveryDate: string;
    quoteDeadline: string;
    priority: "standard" | "urgent";
    notes: string;
    status: "sent" | "quoted" | "awarded" | "cancelled" | "expired";
    selectedSupplierIds: string[];
    quotes: SupplierQuote[];
    awardedQuoteId?: string;
    createdAt: string;
}

export interface DeliveryProof {
    id: string;
    actor: "supplier" | "retailer";
    photoUrl?: string;
    fileName: string;
    quantity: number;
    note: string;
    condition: "sealed" | "good" | "damaged" | "short" | "wrong_items" | "other";
    capturedAt: string;
}

export interface FulfillmentEvent {
    id: string;
    actor: "supplier" | "ninja_van" | "retailer" | "system" | "reviewer";
    title: string;
    detail: string;
    at: string;
}

export interface DeliveryDispute {
    id: string;
    reference: string;
    reason: "damaged" | "short" | "wrong_items" | "other";
    details: string;
    status:
        | "reviewing"
        | "needs_information"
        | "resolved_buyer"
        | "resolved_supplier"
        | "refunded"
        | "closed";
    automatedAssessment: string;
    payoutOnHold: boolean;
    resolutionNote?: string;
    openedAt: string;
    resolvedAt?: string;
}

export interface FulfillmentOrder {
    id: string;
    reference: string;
    requestId: string;
    supplierId: string;
    supplierAlias: string;
    retailerAlias: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    deliveryDate: string;
    status: "confirmed" | "in_transit" | "delivered" | "cancelled";
    payoutStatus: "held" | "released" | "under_review" | "refunded";
    createdAt: string;
    courier: {
        partner: "Ninja Van";
        trackingId?: string;
        status: "pickup_scheduled" | "in_transit" | "delivered" | "exception" | "cancelled";
        lastScan: string;
        lastScanAt: string;
    };
    verificationStatus:
        | "awaiting_supplier_proof"
        | "awaiting_courier_pickup"
        | "in_transit"
        | "awaiting_shop_verification"
        | "verified"
        | "disputed";
    supplierProof?: DeliveryProof;
    retailerProof?: DeliveryProof;
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
    totalPrice: number;
    deliveryDays: number;
    paymentTerms: string;
}

export interface SubmitSupplierProofInput {
    orderId: string;
    photo: PreparedEvidencePhoto;
    quantity: number;
    note: string;
}

export interface VerifyShopDeliveryInput {
    orderId: string;
    photo: PreparedEvidencePhoto;
    quantity: number;
    note: string;
    outcome: "accepted" | "damaged" | "short" | "wrong_items" | "other";
}

type DbRecord = Record<string, unknown>;

function rows(value: unknown): DbRecord[] {
    return Array.isArray(value) ? (value as DbRecord[]) : [];
}

function numberValue(value: unknown) {
    return Number(value ?? 0);
}

function stringValue(value: unknown) {
    return typeof value === "string" ? value : "";
}

function mapQuote(row: DbRecord): SupplierQuote {
    return {
        id: stringValue(row.id),
        reference: stringValue(row.reference),
        requestId: stringValue(row.request_id),
        supplierId: stringValue(row.supplier_org_id),
        supplierAlias: stringValue(row.supplier_alias),
        totalPrice: numberValue(row.total_price),
        deliveryDays: numberValue(row.delivery_days),
        deliveryDate: stringValue(row.delivery_date),
        paymentTerms: stringValue(row.payment_terms),
        score: numberValue(row.score),
        status: row.status as SupplierQuote["status"],
        submittedAt: stringValue(row.submitted_at),
    };
}

function mapRequest(row: DbRecord): SourcingRequest {
    return {
        id: stringValue(row.id),
        reference: stringValue(row.reference),
        title: stringValue(row.title),
        retailerAlias: stringValue(row.retailer_alias),
        deliveryDate: stringValue(row.delivery_date),
        quoteDeadline: stringValue(row.quote_deadline),
        priority: row.priority as SourcingRequest["priority"],
        notes: stringValue(row.notes),
        status: row.status as SourcingRequest["status"],
        awardedQuoteId: stringValue(row.awarded_quote_id) || undefined,
        createdAt: stringValue(row.created_at),
        lines: rows(row.restock_request_lines).map((line) => ({
            id: stringValue(line.id),
            productId: stringValue(line.product_id),
            productName: stringValue(line.product_name),
            category: stringValue(line.category),
            quantity: numberValue(line.quantity),
            targetPrice: numberValue(line.target_price),
            marketPrice: numberValue(line.market_price),
        })),
        selectedSupplierIds: rows(row.restock_request_suppliers).map((invitation) =>
            stringValue(invitation.supplier_org_id)
        ),
        quotes: rows(row.restock_quotes).map(mapQuote),
    };
}

function mapProof(row: DbRecord, signedUrl?: string): DeliveryProof {
    return {
        id: stringValue(row.id),
        actor: row.actor_type as DeliveryProof["actor"],
        photoUrl: signedUrl,
        fileName: stringValue(row.file_name),
        quantity: numberValue(row.quantity),
        note: stringValue(row.note),
        condition: row.condition as DeliveryProof["condition"],
        capturedAt: stringValue(row.captured_at),
    };
}

function mapOrder(row: DbRecord, signedUrls: Map<string, string>): FulfillmentOrder {
    const proofs = rows(row.restock_delivery_proofs);
    const supplierProof = proofs.find((proof) => proof.actor_type === "supplier");
    const retailerProof = proofs.find((proof) => proof.actor_type === "retailer");
    const disputes = rows(row.restock_disputes);
    const dispute = disputes[0];

    return {
        id: stringValue(row.id),
        reference: stringValue(row.reference),
        requestId: stringValue(row.request_id),
        supplierId: stringValue(row.supplier_org_id),
        supplierAlias: stringValue(row.supplier_alias),
        retailerAlias: stringValue(row.retailer_alias),
        productName: stringValue(row.product_summary),
        quantity: numberValue(row.quantity),
        unitPrice: numberValue(row.unit_price),
        totalPrice: numberValue(row.total_price),
        deliveryDate: stringValue(row.delivery_date),
        status: row.status as FulfillmentOrder["status"],
        payoutStatus: row.payout_status as FulfillmentOrder["payoutStatus"],
        createdAt: stringValue(row.created_at),
        courier: {
            partner: "Ninja Van",
            trackingId: stringValue(row.courier_tracking_id) || undefined,
            status: row.courier_status as FulfillmentOrder["courier"]["status"],
            lastScan: stringValue(row.courier_last_scan),
            lastScanAt: stringValue(row.courier_last_scan_at),
        },
        verificationStatus: row.verification_status as FulfillmentOrder["verificationStatus"],
        supplierProof: supplierProof
            ? mapProof(
                  supplierProof,
                  signedUrls.get(stringValue(supplierProof.storage_path))
              )
            : undefined,
        retailerProof: retailerProof
            ? mapProof(
                  retailerProof,
                  signedUrls.get(stringValue(retailerProof.storage_path))
              )
            : undefined,
        dispute: dispute
            ? {
                  id: stringValue(dispute.id),
                  reference: stringValue(dispute.reference),
                  reason: dispute.reason as DeliveryDispute["reason"],
                  details: stringValue(dispute.details),
                  status: dispute.status as DeliveryDispute["status"],
                  automatedAssessment: stringValue(dispute.automated_assessment),
                  payoutOnHold: Boolean(dispute.payout_on_hold),
                  resolutionNote: stringValue(dispute.resolution_note) || undefined,
                  openedAt: stringValue(dispute.opened_at),
                  resolvedAt: stringValue(dispute.resolved_at) || undefined,
              }
            : undefined,
        events: rows(row.restock_fulfillment_events)
            .map((event) => ({
                id: stringValue(event.id),
                actor: event.actor_type as FulfillmentEvent["actor"],
                title: stringValue(event.title),
                detail: stringValue(event.detail),
                at: stringValue(event.occurred_at),
            }))
            .sort((a, b) => a.at.localeCompare(b.at)),
    };
}

async function workflow<T>(body: Record<string, unknown>): Promise<T> {
    const { data, error } = await supabase.functions.invoke("restock-workflow", { body });
    if (error) {
        let message = error.message;
        const context = error.context as Response | undefined;
        if (context) {
            try {
                const payload = (await context.clone().json()) as { error?: string };
                if (payload.error) message = payload.error;
            } catch {
                // The network error already carries the most useful available message.
            }
        }
        throw new Error(message);
    }
    if (data?.error) throw new Error(String(data.error));
    return data.data as T;
}

function extensionFor(mimeType: PreparedEvidencePhoto["mimeType"]) {
    if (mimeType === "image/png") return "png";
    if (mimeType === "image/webp") return "webp";
    return "jpg";
}

async function uploadEvidence(
    orderId: string,
    actor: "supplier" | "retailer",
    photo: PreparedEvidencePhoto
) {
    const storagePath = `${orderId}/${actor}/${crypto.randomUUID()}.${extensionFor(photo.mimeType)}`;
    const { error } = await supabase.storage
        .from(DELIVERY_EVIDENCE_BUCKET)
        .upload(storagePath, photo.blob, {
            cacheControl: "3600",
            contentType: photo.mimeType,
            upsert: false,
        });
    if (error) throw new Error(`Photo upload failed: ${error.message}`);
    return storagePath;
}

export function useOrderWorkflowStore() {
    const { organization, session } = useAuth();
    const [requests, setRequests] = useState<SourcingRequest[]>([]);
    const [createdOrders, setCreatedOrders] = useState<FulfillmentOrder[]>([]);
    const [supplierDirectory, setSupplierDirectory] = useState<SupplierDirectoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        if (!organization || !session) {
            setRequests([]);
            setCreatedOrders([]);
            setSupplierDirectory([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const [requestsResult, ordersResult, suppliersResult] = await Promise.all([
                supabase
                    .from("restock_sourcing_requests")
                    .select(
                        "*, restock_request_lines(*), restock_request_suppliers(*), restock_quotes!restock_quotes_request_id_fkey(*)"
                    )
                    .order("created_at", { ascending: false }),
                supabase
                    .from("restock_orders")
                    .select(
                        "*, restock_order_items(*), restock_fulfillment_events(*), restock_delivery_proofs(*), restock_disputes(*)"
                    )
                    .order("created_at", { ascending: false }),
                organization.accountType === "retailer"
                    ? supabase
                          .from("restock_supplier_profiles")
                          .select("*")
                          .eq("accepting_requests", true)
                          .order("performance_score", { ascending: false })
                    : Promise.resolve({ data: [], error: null }),
            ]);

            const queryError =
                requestsResult.error ?? ordersResult.error ?? suppliersResult.error;
            if (queryError) throw queryError;

            const orderRows = rows(ordersResult.data);
            const evidencePaths = orderRows.flatMap((order) =>
                rows(order.restock_delivery_proofs)
                    .map((proof) => stringValue(proof.storage_path))
                    .filter(Boolean)
            );
            const signedUrls = new Map<string, string>();
            if (evidencePaths.length) {
                const { data: signed, error: signedError } = await supabase.storage
                    .from(DELIVERY_EVIDENCE_BUCKET)
                    .createSignedUrls(evidencePaths, 900);
                if (signedError) throw signedError;
                signed?.forEach((item, index) => {
                    if (item.signedUrl) signedUrls.set(evidencePaths[index], item.signedUrl);
                });
            }

            setRequests(rows(requestsResult.data).map(mapRequest));
            setCreatedOrders(orderRows.map((order) => mapOrder(order, signedUrls)));
            setSupplierDirectory(
                rows(suppliersResult.data).map((supplier) => ({
                    id: stringValue(supplier.organization_id),
                    aliasCode: stringValue(supplier.alias_code),
                    categoryTags: Array.isArray(supplier.category_tags)
                        ? (supplier.category_tags as string[])
                        : [],
                    serviceRegions: Array.isArray(supplier.service_regions)
                        ? (supplier.service_regions as string[])
                        : [],
                    minimumOrderValue: numberValue(supplier.minimum_order_value),
                    performanceScore: numberValue(supplier.performance_score),
                    onTimeRate: numberValue(supplier.on_time_rate),
                    completedOrders: numberValue(supplier.completed_orders),
                }))
            );
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "We could not load your account data. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [organization, session]);

    useEffect(() => {
        void refresh();
        const timer = window.setInterval(() => void refresh(), 30_000);
        const onFocus = () => void refresh();
        window.addEventListener("focus", onFocus);
        return () => {
            window.clearInterval(timer);
            window.removeEventListener("focus", onFocus);
        };
    }, [refresh]);

    const createRequest = useCallback(
        async (input: CreateRequestInput) => {
            const created = await workflow<{ id: string; reference: string }>({
                action: "create_request",
                ...input,
            });
            await refresh();
            return created;
        },
        [refresh]
    );

    const submitQuote = useCallback(
        async (input: SubmitQuoteInput) => {
            const created = await workflow<{ id: string; reference: string; score: number }>({
                action: "submit_quote",
                ...input,
            });
            await refresh();
            return created;
        },
        [refresh]
    );

    const awardQuote = useCallback(
        async (requestId: string, quoteId: string) => {
            const order = await workflow<{ id: string; reference: string }>({
                action: "award_quote",
                requestId,
                quoteId,
            });
            await refresh();
            return order;
        },
        [refresh]
    );

    const submitSupplierProof = useCallback(
        async (input: SubmitSupplierProofInput) => {
            const storagePath = await uploadEvidence(input.orderId, "supplier", input.photo);
            const result = await workflow<{ orderId: string; verificationStatus: string }>({
                action: "submit_supplier_proof",
                orderId: input.orderId,
                storagePath,
                fileName: input.photo.fileName,
                mimeType: input.photo.mimeType,
                fileSizeBytes: input.photo.fileSizeBytes,
                quantity: input.quantity,
                note: input.note,
            });
            await refresh();
            return result;
        },
        [refresh]
    );

    const verifyShopDelivery = useCallback(
        async (input: VerifyShopDeliveryInput) => {
            const storagePath = await uploadEvidence(input.orderId, "retailer", input.photo);
            const result = await workflow<{
                orderId: string;
                verificationStatus: string;
                disputeReference?: string;
            }>({
                action: "verify_delivery",
                orderId: input.orderId,
                storagePath,
                fileName: input.photo.fileName,
                mimeType: input.photo.mimeType,
                fileSizeBytes: input.photo.fileSizeBytes,
                quantity: input.quantity,
                note: input.note,
                outcome: input.outcome,
            });
            await refresh();
            return result;
        },
        [refresh]
    );

    return {
        requests,
        createdOrders,
        supplierDirectory,
        loading,
        error,
        refresh,
        createRequest,
        submitQuote,
        awardQuote,
        submitSupplierProof,
        verifyShopDelivery,
    };
}
