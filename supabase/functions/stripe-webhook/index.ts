import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  stripeLivemode,
  stripeRequest,
  stripeSecretKey,
} from "../_shared/stripe-client.ts";

function getConfiguredSecretKey() {
  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (legacy) return legacy;
  const keys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}");
  return keys.default as string | undefined;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

function hex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function verifyStripeSignature(payload: string, signatureHeader: string, secret: string) {
  const parts = signatureHeader.split(",").map((part) => part.trim().split("=", 2));
  const timestamp = parts.find(([key]) => key === "t")?.[1];
  const signatures = parts.filter(([key]) => key === "v1").map(([, value]) => value);
  if (!timestamp || signatures.length === 0 || !/^\d+$/.test(timestamp)) return false;

  const timestampSeconds = Number(timestamp);
  if (!Number.isSafeInteger(timestampSeconds) || Math.abs(Date.now() / 1000 - timestampSeconds) > 300) {
    return false;
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const digest = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${timestamp}.${payload}`)
  );
  const expected = hex(digest);
  return signatures.some((signature) => constantTimeEqual(expected, signature));
}

type StripeEvent = {
  id: string;
  type: string;
  livemode: boolean;
  data: { object: Record<string, unknown> };
};

type AdminClient = SupabaseClient;

function objectId(object: Record<string, unknown>) {
  return typeof object.id === "string" ? object.id : null;
}

function nestedId(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && typeof (value as { id?: unknown }).id === "string") {
    return (value as { id: string }).id;
  }
  return null;
}

function nestedChargeId(value: unknown) {
  return nestedId(value);
}

async function recordCheckoutPayment(admin: AdminClient, session: Record<string, unknown>) {
  const metadata = (session.metadata ?? {}) as Record<string, string>;
  const orderId = metadata.order_id;
  const method = metadata.payment_method;
  const sessionId = objectId(session);
  const paymentIntentId = nestedId(session.payment_intent);
  const amountTotal = Number(session.amount_total);
  if (!orderId || !sessionId || !paymentIntentId || !Number.isSafeInteger(amountTotal) ||
      !["paynow", "card"].includes(method)) {
    throw new Error("Stripe Checkout metadata is incomplete.");
  }

  const intent = await stripeRequest<{
    id: string;
    latest_charge?: string | { id: string } | null;
  }>(`/payment_intents/${encodeURIComponent(paymentIntentId)}`, {
    method: "GET",
    params: { "expand[0]": "latest_charge" },
  });
  const { error } = await admin.rpc("restock_record_payment_succeeded", {
    p_order_id: orderId,
    p_session_id: sessionId,
    p_payment_intent_id: intent.id,
    p_charge_id: nestedChargeId(intent.latest_charge),
    p_amount_total: amountTotal,
    p_payment_method: method,
  });
  if (error) throw new Error(error.message);
}

async function syncConnectedAccount(admin: AdminClient, account: Record<string, unknown>) {
  const accountId = objectId(account);
  if (!accountId) return;
  const capabilities = (account.capabilities ?? {}) as Record<string, string>;
  const requirements = (account.requirements ?? {}) as Record<string, unknown>;
  const update = {
    livemode: stripeLivemode(),
    provisioning_status: "ready",
    details_submitted: Boolean(account.details_submitted),
    payouts_enabled: Boolean(account.payouts_enabled),
    transfers_status: capabilities.transfers ?? "pending",
    requirements_due: Array.isArray(requirements.currently_due) ? requirements.currently_due : [],
    disabled_reason: typeof requirements.disabled_reason === "string" ? requirements.disabled_reason : null,
    last_synced_at: new Date().toISOString(),
  };
  // Always bind an account update to the immutable account ID saved during
  // onboarding. Connected-account metadata must never select another tenant.
  const { error } = await admin
    .from("restock_supplier_payment_accounts")
    .update(update)
    .eq("stripe_account_id", accountId);
  if (error) throw error;
}

async function processRefundUpdate(admin: AdminClient, refund: Record<string, unknown>) {
  const refundId = objectId(refund);
  const status = typeof refund.status === "string" ? refund.status : "";
  if (!refundId || !["succeeded", "failed", "canceled"].includes(status)) return;

  const { data: operation, error } = await admin
    .from("restock_payment_operations")
    .select("id, secondary_provider_reference, status")
    .eq("provider_reference", refundId)
    .eq("operation_type", "refund")
    .maybeSingle();
  if (error) throw error;
  if (!operation || operation.status === "completed") return;

  if (status === "succeeded") {
    const { error: completeError } = await admin.rpc("restock_complete_payment_operation", {
      p_operation_id: operation.id,
      p_provider_reference: refundId,
      p_secondary_provider_reference: operation.secondary_provider_reference,
    });
    if (completeError) throw new Error(completeError.message);
  } else {
    const { error: failError } = await admin.rpc("restock_fail_payment_operation", {
      p_operation_id: operation.id,
      p_error: `Stripe refund ${status}.`,
    });
    if (failError) throw new Error(failError.message);
  }
}

async function processEvent(admin: AdminClient, event: StripeEvent) {
  const object = event.data.object;
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      if (object.payment_status === "paid") await recordCheckoutPayment(admin, object);
      break;
    case "checkout.session.expired": {
      const metadata = (object.metadata ?? {}) as Record<string, string>;
      const sessionId = objectId(object);
      if (metadata.order_id && sessionId) {
        const { error } = await admin.rpc("restock_reset_checkout", {
          p_order_id: metadata.order_id,
          p_session_id: sessionId,
        });
        if (error) throw new Error(error.message);
      }
      break;
    }
    case "checkout.session.async_payment_failed":
    case "payment_intent.payment_failed": {
      const metadata = (object.metadata ?? {}) as Record<string, string>;
      if (metadata.order_id) {
        const lastError = (object.last_payment_error ?? {}) as Record<string, unknown>;
        const { error } = await admin.rpc("restock_fail_checkout", {
          p_order_id: metadata.order_id,
          p_error: typeof lastError.message === "string" ? lastError.message : "Stripe payment failed.",
        });
        if (error) throw new Error(error.message);
      }
      break;
    }
    case "account.updated":
      await syncConnectedAccount(admin, object);
      break;
    case "charge.dispute.created": {
      const paymentIntentId = nestedId(object.payment_intent);
      const disputeId = objectId(object);
      if (paymentIntentId && disputeId) {
        const { error } = await admin.rpc("restock_record_provider_dispute", {
          p_payment_intent_id: paymentIntentId,
          p_dispute_id: disputeId,
        });
        if (error) throw new Error(error.message);
      }
      break;
    }
    case "refund.updated":
    case "refund.failed":
      await processRefundUpdate(admin, object);
      break;
    default:
      break;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const secretKey = getConfiguredSecretKey();
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const signature = req.headers.get("Stripe-Signature");
  if (!supabaseUrl || !secretKey || !stripeSecretKey() || !webhookSecret) {
    return json({ error: "Stripe webhook is not configured." }, 503);
  }
  if (!signature) return json({ error: "Stripe signature required." }, 400);

  const rawBody = await req.text();
  if (!await verifyStripeSignature(rawBody, signature, webhookSecret)) {
    return json({ error: "Invalid Stripe signature." }, 400);
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(rawBody) as StripeEvent;
  } catch {
    return json({ error: "Invalid Stripe event payload." }, 400);
  }
  if (!event.id || !event.type || event.livemode !== stripeLivemode()) {
    return json({ error: "Stripe event mode mismatch." }, 400);
  }

  const admin = createClient(supabaseUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: claimed, error: claimError } = await admin.rpc(
    "restock_claim_payment_provider_event",
    {
      p_event_id: event.id,
      p_event_type: event.type,
      p_livemode: event.livemode,
      p_object_id: objectId(event.data.object),
    }
  );
  if (claimError) return json({ error: claimError.message }, 500);
  if (!claimed) {
    const { data: existing, error: existingError } = await admin
      .from("restock_payment_provider_events")
      .select("status")
      .eq("event_id", event.id)
      .maybeSingle();
    if (existingError) return json({ error: "Unable to verify Stripe event state." }, 500);
    if (existing?.status === "completed") return json({ received: true, duplicate: true });
    // A concurrent or backoff-delayed event is not complete. Returning a retryable
    // response prevents Stripe from treating an unprocessed event as delivered.
    return json({ error: "Stripe event processing is pending retry." }, 500);
  }

  try {
    await processEvent(admin, event);
    const { error } = await admin.rpc("restock_complete_payment_provider_event", {
      p_event_id: event.id,
    });
    if (error) throw new Error(error.message);
    return json({ received: true });
  } catch (cause) {
    console.error(cause);
    await admin.rpc("restock_fail_payment_provider_event", {
      p_event_id: event.id,
      p_error: cause instanceof Error ? cause.message : "Stripe webhook failed.",
    });
    return json({ error: "Webhook processing failed." }, 500);
  }
});
