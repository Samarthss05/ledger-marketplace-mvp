import type { SupabaseClient } from "@supabase/supabase-js";

export const STRIPE_API_VERSION = "2026-02-25.clover";

export type CheckoutPaymentMethod = "paynow" | "card";

export type FeeConfig = {
  bps: number;
  fixedAmount: number;
};

type SupabaseAdmin = SupabaseClient;

export class StripeApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "StripeApiError";
    this.status = status;
    this.code = code;
  }
}

function integerEnvironment(name: string, fallback: number, minimum: number, maximum: number) {
  const value = Number(Deno.env.get(name) ?? fallback);
  if (!Number.isInteger(value) || value < minimum || value > maximum) return fallback;
  return value;
}

export function stripeSecretKey() {
  return Deno.env.get("STRIPE_SECRET_KEY") ?? "";
}

export function stripeLivemode() {
  return stripeSecretKey().startsWith("sk_live_");
}

export function feeConfig(method: CheckoutPaymentMethod): FeeConfig {
  if (method === "card") {
    return {
      bps: integerEnvironment("RESTOCK_CARD_FEE_BPS", 410, 0, 1500),
      fixedAmount: integerEnvironment("RESTOCK_CARD_FEE_FIXED", 100, 0, 5000),
    };
  }
  return {
    bps: integerEnvironment("RESTOCK_PAYNOW_FEE_BPS", 190, 0, 1500),
    fixedAmount: integerEnvironment("RESTOCK_PAYNOW_FEE_FIXED", 50, 0, 5000),
  };
}

export function calculateRetailerFee(amountSubtotal: number, config: FeeConfig) {
  if (!Number.isSafeInteger(amountSubtotal) || amountSubtotal <= 0) {
    throw new Error("The order amount is invalid.");
  }
  return Math.ceil((amountSubtotal * config.bps) / 10_000) + config.fixedAmount;
}

export function feeDescription(method: CheckoutPaymentMethod, config: FeeConfig) {
  const percentage = (config.bps / 100).toFixed(2);
  const fixed = (config.fixedAmount / 100).toFixed(2);
  return method === "card"
    ? `Card transaction fee (${percentage}% + S$${fixed})`
    : `PayNow transaction fee (${percentage}% + S$${fixed})`;
}

function stripeHeaders(idempotencyKey?: string) {
  const secret = stripeSecretKey();
  if (!secret) throw new Error("Stripe is not configured yet.");
  return {
    Authorization: `Bearer ${secret}`,
    "Content-Type": "application/x-www-form-urlencoded",
    "Stripe-Version": STRIPE_API_VERSION,
    ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
  };
}

export async function stripeRequest<T>(
  path: string,
  options: {
    method?: "GET" | "POST";
    params?: Record<string, string | number | boolean | null | undefined>;
    idempotencyKey?: string;
  } = {}
): Promise<T> {
  const method = options.method ?? "POST";
  const params = new URLSearchParams();
  Object.entries(options.params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) params.set(key, String(value));
  });

  const query = method === "GET" && params.size ? `?${params.toString()}` : "";
  const response = await fetch(`https://api.stripe.com/v1${path}${query}`, {
    method,
    headers: stripeHeaders(options.idempotencyKey),
    ...(method === "POST" ? { body: params } : {}),
  });

  const payload = await response.json().catch(() => ({})) as {
    error?: { message?: string; code?: string };
  };
  if (!response.ok) {
    throw new StripeApiError(
      payload.error?.message ?? `Stripe returned HTTP ${response.status}.`,
      response.status,
      payload.error?.code
    );
  }
  return payload as T;
}

type PaymentOperation = {
  operationId: string;
  operationType: "transfer" | "refund";
  operationKey: string;
  orderId: string;
  orderReference: string;
  paymentIntentId: string;
  chargeId?: string | null;
  transferId?: string | null;
  supplierAccountId?: string | null;
  supplierTransferAmount: number;
  amountTotal: number;
  currency: string;
};

type StripePaymentIntent = {
  id: string;
  latest_charge?: string | { id: string } | null;
};

function paymentIntentChargeId(intent: StripePaymentIntent) {
  if (typeof intent.latest_charge === "string") return intent.latest_charge;
  return intent.latest_charge?.id ?? null;
}

export async function processPaymentOperation(admin: SupabaseAdmin, orderId: string) {
  const { data, error } = await admin.rpc("restock_claim_payment_operation", {
    p_order_id: orderId,
  });
  if (error) throw new Error(error.message);
  if (!data) return { processed: false as const };

  const operation = data as PaymentOperation;
  try {
    if (operation.operationType === "transfer") {
      if (!operation.supplierAccountId) throw new Error("Supplier Stripe account is missing.");
      let chargeId = operation.chargeId ?? null;
      if (!chargeId) {
        const intent = await stripeRequest<StripePaymentIntent>(
          `/payment_intents/${encodeURIComponent(operation.paymentIntentId)}`,
          { method: "GET" }
        );
        chargeId = paymentIntentChargeId(intent);
      }
      if (!chargeId) throw new Error("The successful Stripe charge is not available yet.");

      const transfer = await stripeRequest<{ id: string }>("/transfers", {
        idempotencyKey: operation.operationKey,
        params: {
          amount: operation.supplierTransferAmount,
          currency: operation.currency,
          destination: operation.supplierAccountId,
          source_transaction: chargeId,
          transfer_group: `RESTOCK_${operation.orderId}`,
          description: `ReStock ${operation.orderReference}`,
          "metadata[order_id]": operation.orderId,
          "metadata[order_reference]": operation.orderReference,
        },
      });
      const completed = await admin.rpc("restock_complete_payment_operation", {
        p_operation_id: operation.operationId,
        p_provider_reference: transfer.id,
        p_secondary_provider_reference: null,
      });
      if (completed.error) throw new Error(completed.error.message);
      return { processed: true as const, operation: "transfer" as const, providerId: transfer.id };
    }

    let reversalId: string | null = null;
    if (operation.transferId) {
      const reversal = await stripeRequest<{ id: string }>(
        `/transfers/${encodeURIComponent(operation.transferId)}/reversals`,
        {
          idempotencyKey: `${operation.operationKey}:reverse-transfer`,
          params: {
            amount: operation.supplierTransferAmount,
            "metadata[order_id]": operation.orderId,
          },
        }
      );
      reversalId = reversal.id;
    }

    const refund = await stripeRequest<{ id: string; status?: "pending" | "requires_action" | "succeeded" | "failed" | "canceled" }>("/refunds", {
      idempotencyKey: operation.operationKey,
      params: {
        payment_intent: operation.paymentIntentId,
        amount: operation.amountTotal,
        reason: "requested_by_customer",
        "metadata[order_id]": operation.orderId,
        "metadata[order_reference]": operation.orderReference,
      },
    });
    if (refund.status === "failed" || refund.status === "canceled") {
      throw new Error("Stripe could not complete the retailer refund.");
    }
    if (refund.status === "pending" || refund.status === "requires_action") {
      const deferred = await admin.rpc("restock_defer_payment_operation", {
        p_operation_id: operation.operationId,
        p_provider_reference: refund.id,
        p_secondary_provider_reference: reversalId,
      });
      if (deferred.error) throw new Error(deferred.error.message);
      return { processed: true as const, operation: "refund_pending" as const, providerId: refund.id };
    }

    const completed = await admin.rpc("restock_complete_payment_operation", {
      p_operation_id: operation.operationId,
      p_provider_reference: refund.id,
      p_secondary_provider_reference: reversalId,
    });
    if (completed.error) throw new Error(completed.error.message);
    return { processed: true as const, operation: "refund" as const, providerId: refund.id };
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Stripe operation failed.";
    await admin.rpc("restock_fail_payment_operation", {
      p_operation_id: operation.operationId,
      p_error: message,
    });
    throw cause;
  }
}
