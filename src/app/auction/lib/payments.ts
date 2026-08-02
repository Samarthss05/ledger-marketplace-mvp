"use client";

import { supabase } from "./supabase";

export type PaymentMethod = "paynow" | "card";

export type CheckoutFeeQuote = {
    paymentMethod: PaymentMethod;
    amountSubtotal: number;
    transactionFee: number;
    amountTotal: number;
    feeBps: number;
    feeFixedAmount: number;
    feeDescription: string;
    recommended: boolean;
};

export type CheckoutQuote = {
    orderId: string;
    orderReference: string;
    productSummary: string;
    supplierReady: boolean;
    unavailableReason: string | null;
    quotes: CheckoutFeeQuote[];
};

export type SupplierPaymentAccount = {
    organization_id: string;
    stripe_account_id: string | null;
    provisioning_status: "creating" | "ready" | "error";
    details_submitted: boolean;
    payouts_enabled: boolean;
    transfers_status: "pending" | "active" | "inactive";
    requirements_due: string[];
    disabled_reason: string | null;
    last_synced_at: string;
};

async function paymentFunction<T>(body: Record<string, unknown>) {
    const { data, error } = await supabase.functions.invoke("stripe-marketplace", { body });
    if (error) {
        let message = error.message;
        const context = (error as { context?: Response }).context;
        if (context) {
            try {
                const payload = await context.clone().json();
                if (typeof payload?.error === "string") message = payload.error;
            } catch {
                // The transport error is the best available message.
            }
        }
        throw new Error(message);
    }
    if (data?.error) throw new Error(String(data.error));
    return data.data as T;
}

export function quoteCheckout(orderId: string) {
    return paymentFunction<CheckoutQuote>({ action: "quote_checkout", orderId });
}

export function createCheckout(orderId: string, paymentMethod: PaymentMethod) {
    return paymentFunction<{ checkoutUrl: string; sessionId: string; reused: boolean }>({
        action: "create_checkout",
        orderId,
        paymentMethod,
    });
}

export function syncCheckout(orderId: string, sessionId: string) {
    return paymentFunction<{ paymentStatus: string; checkoutStatus: string }>({
        action: "sync_checkout",
        orderId,
        sessionId,
    });
}

export function retryPaymentOperation(orderId: string) {
    return paymentFunction<{ processed: boolean; operation?: string }>({
        action: "retry_payment_operation",
        orderId,
    });
}

export function createConnectOnboarding() {
    return paymentFunction<{ url: string }>({ action: "create_connect_onboarding" });
}

export function refreshConnectAccount() {
    return paymentFunction<{
        connected: boolean;
        ready: boolean;
        detailsSubmitted?: boolean;
        payoutsEnabled?: boolean;
        transfersStatus?: "pending" | "active" | "inactive";
        requirementsDue?: string[];
        disabledReason?: string | null;
    }>({ action: "refresh_connect_account" });
}

export function createConnectDashboard() {
    return paymentFunction<{ url: string }>({ action: "create_connect_dashboard" });
}

export async function loadSupplierPaymentAccount() {
    const { data, error } = await supabase
        .from("restock_supplier_payment_accounts")
        .select("*")
        .maybeSingle();
    if (error) throw error;
    return data as SupplierPaymentAccount | null;
}
