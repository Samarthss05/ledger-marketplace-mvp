import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import {
  calculateRetailerFee,
  feeConfig,
  feeDescription,
  processPaymentOperation,
  stripeLivemode,
  stripeRequest,
  StripeApiError,
  type CheckoutPaymentMethod,
} from "../_shared/stripe-client.ts";

const allowedOrigins = new Set([
  "https://samarthss05.github.io",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

const baseHeaders = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
  "Vary": "Origin",
};

function corsHeaders(req: Request) {
  const origin = req.headers.get("origin") ?? "";
  return {
    ...baseHeaders,
    ...(allowedOrigins.has(origin) ? { "Access-Control-Allow-Origin": origin } : {}),
  };
}

function response(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders(req) });
}

function getConfiguredKey(name: "publishable" | "secret") {
  if (name === "publishable") {
    const legacy = Deno.env.get("SUPABASE_ANON_KEY");
    if (legacy) return legacy;
    const keys = JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") ?? "{}");
    return keys.default as string | undefined;
  }
  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (legacy) return legacy;
  const keys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}");
  return keys.default as string | undefined;
}

function appBaseUrl() {
  const configured = Deno.env.get("RESTOCK_APP_URL") ??
    "https://samarthss05.github.io/ledger-marketplace-mvp";
  const url = new URL(configured);
  if (url.protocol !== "https:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
    throw new Error("RESTOCK_APP_URL must use HTTPS.");
  }
  return url.toString().replace(/\/$/, "");
}

const requestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("quote_checkout"), orderId: z.string().uuid() }),
  z.object({
    action: z.literal("create_checkout"),
    orderId: z.string().uuid(),
    paymentMethod: z.enum(["paynow", "card"]),
  }),
  z.object({
    action: z.literal("sync_checkout"),
    orderId: z.string().uuid(),
    sessionId: z.string().regex(/^cs_(test_|live_)?[A-Za-z0-9]+$/),
  }),
  z.object({ action: z.literal("create_connect_onboarding") }),
  z.object({ action: z.literal("refresh_connect_account") }),
  z.object({ action: z.literal("create_connect_dashboard") }),
  z.object({
    action: z.literal("process_payment_operation"),
    orderId: z.string().uuid(),
  }),
  z.object({
    action: z.literal("retry_payment_operation"),
    orderId: z.string().uuid(),
  }),
]);

type AdminClient = SupabaseClient;
type UserContext = { id: string; email?: string };

type Membership = {
  organizationId: string;
  accountType: "retailer" | "supplier";
  memberRole: "owner" | "manager" | "operator" | "viewer";
};

type StripeAccount = {
  id: string;
  details_submitted?: boolean;
  payouts_enabled?: boolean;
  capabilities?: { transfers?: "active" | "inactive" | "pending" };
  requirements?: {
    currently_due?: string[];
    disabled_reason?: string | null;
  };
};

type StripeCheckoutSession = {
  id: string;
  url?: string | null;
  status?: "open" | "complete" | "expired";
  payment_status?: "paid" | "unpaid" | "no_payment_required";
  payment_intent?: string | { id: string; latest_charge?: string | { id: string } | null } | null;
  amount_total?: number | null;
  expires_at?: number;
  metadata?: Record<string, string>;
};

type PaymentRow = {
  order_id: string;
  amount_subtotal: number;
  retailer_fee_amount: number;
  amount_total: number;
  payment_method: CheckoutPaymentMethod | null;
  status: string;
  stripe_checkout_session_id?: string | null;
};

type OrderRow = {
  id: string;
  reference: string;
  buyer_org_id: string;
  supplier_org_id: string;
  product_summary: string;
  payment_status: string;
};

function asRecord(value: unknown) {
  return value as Record<string, unknown>;
}

async function requireMembership(admin: AdminClient, userId: string): Promise<Membership> {
  const { data, error } = await admin
    .from("restock_organization_members")
    .select("organization_id, member_role, organization:restock_organizations!inner(account_type, status)")
    .eq("user_id", userId)
    .eq("organization.status", "active")
    .limit(1)
    .single();
  if (error || !data) throw new StripeApiError("An active ReStock organization is required.", 403);
  const organizationValue = data.organization as unknown;
  const organization = (Array.isArray(organizationValue) ? organizationValue[0] : organizationValue) as {
    account_type: "retailer" | "supplier";
  };
  return {
    organizationId: data.organization_id,
    accountType: organization.account_type,
    memberRole: data.member_role,
  };
}

async function requireRetailerOrder(admin: AdminClient, userId: string, orderId: string) {
  const membership = await requireMembership(admin, userId);
  if (membership.accountType !== "retailer" || !["owner", "manager", "operator"].includes(membership.memberRole)) {
    throw new StripeApiError("Only a retailer operator can pay for an order.", 403);
  }

  const [{ data: order, error: orderError }, { data: payment, error: paymentError }] = await Promise.all([
    admin.from("restock_orders").select("*").eq("id", orderId).eq("buyer_org_id", membership.organizationId).single(),
    admin.from("restock_payments").select("*").eq("order_id", orderId).single(),
  ]);
  if (orderError || !order) throw new StripeApiError("Order not found.", 404);
  if (paymentError || !payment) throw new StripeApiError("Payment record not found.", 404);
  return { membership, order: order as OrderRow, payment: payment as PaymentRow };
}

async function supplierPaymentAccount(admin: AdminClient, organizationId: string) {
  const { data, error } = await admin
    .from("restock_supplier_payment_accounts")
    .select("*")
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

function checkoutQuote(payment: PaymentRow, method: CheckoutPaymentMethod) {
  const config = feeConfig(method);
  const fee = calculateRetailerFee(Number(payment.amount_subtotal), config);
  return {
    paymentMethod: method,
    amountSubtotal: Number(payment.amount_subtotal),
    transactionFee: fee,
    amountTotal: Number(payment.amount_subtotal) + fee,
    feeBps: config.bps,
    feeFixedAmount: config.fixedAmount,
    feeDescription: feeDescription(method, config),
    recommended: method === "paynow",
  };
}

async function quoteCheckout(req: Request, admin: AdminClient, user: UserContext, orderId: string) {
  const { order, payment } = await requireRetailerOrder(admin, user.id, orderId);
  if (payment.status === "legacy") {
    return response(req, { error: "Earlier demo orders are not payable." }, 409);
  }
  if (["paid", "transfer_pending", "transferred", "refund_pending", "refunded", "disputed"].includes(payment.status)) {
    return response(req, { error: "This order has already been paid." }, 409);
  }

  const account = await supplierPaymentAccount(admin, order.supplier_org_id);
  const supplierReady = Boolean(
    account?.stripe_account_id &&
    account?.provisioning_status === "ready" &&
    account?.transfers_status === "active" &&
    account?.payouts_enabled &&
    account?.livemode === stripeLivemode()
  );

  return response(req, {
    data: {
      orderId: order.id,
      orderReference: order.reference,
      productSummary: order.product_summary,
      supplierReady,
      unavailableReason: supplierReady
        ? null
        : "The supplier must finish Stripe verification before this order can be paid.",
      quotes: [checkoutQuote(payment, "paynow"), checkoutQuote(payment, "card")],
    },
  });
}

async function expireAndResetCheckout(admin: AdminClient, orderId: string, sessionId: string) {
  try {
    await stripeRequest(`/checkout/sessions/${encodeURIComponent(sessionId)}/expire`);
  } catch (cause) {
    if (!(cause instanceof StripeApiError) || cause.code !== "checkout_session_not_open") throw cause;
  }
  const { error } = await admin.rpc("restock_reset_checkout", {
    p_order_id: orderId,
    p_session_id: sessionId,
  });
  if (error) throw new Error(error.message);
}

async function createCheckout(
  req: Request,
  admin: AdminClient,
  user: UserContext,
  orderId: string,
  method: CheckoutPaymentMethod
) {
  const { payment } = await requireRetailerOrder(admin, user.id, orderId);
  const quote = checkoutQuote(payment, method);

  const claimCheckout = () => admin.rpc("restock_claim_checkout", {
    p_actor_user_id: user.id,
    p_order_id: orderId,
    p_payment_method: method,
    p_retailer_fee_amount: quote.transactionFee,
    p_fee_bps: quote.feeBps,
    p_fee_fixed_amount: quote.feeFixedAmount,
    p_livemode: stripeLivemode(),
  });

  let { data: claimValue, error: claimError } = await claimCheckout();
  if (claimError) throw new StripeApiError(claimError.message, 409);
  let claim = asRecord(claimValue);

  if (claim.action === "reuse" || claim.action === "replace") {
    const sessionId = String(claim.sessionId);
    const existing = await stripeRequest<StripeCheckoutSession>(
      `/checkout/sessions/${encodeURIComponent(sessionId)}`,
      { method: "GET" }
    );
    if (claim.action === "reuse" && existing.status === "open" && existing.url) {
      return response(req, { data: { checkoutUrl: existing.url, sessionId, reused: true } });
    }
    await expireAndResetCheckout(admin, orderId, sessionId);
    ({ data: claimValue, error: claimError } = await claimCheckout());
    if (claimError) throw new StripeApiError(claimError.message, 409);
    claim = asRecord(claimValue);
  }

  if (claim.action !== "create") throw new Error("Checkout could not be claimed.");
  const expiresAt = Math.floor(Date.now() / 1000) + 30 * 60;
  let session: StripeCheckoutSession | null = null;

  try {
    const base = appBaseUrl();
    const successUrl = `${base}/auction/shop/orders?payment=success&order=${encodeURIComponent(orderId)}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${base}/auction/shop/orders?payment=cancelled&order=${encodeURIComponent(orderId)}`;
    session = await stripeRequest<StripeCheckoutSession>("/checkout/sessions", {
      idempotencyKey: `restock-checkout-${orderId}-${String(claim.attempt)}`,
      params: {
        mode: "payment",
        success_url: successUrl,
        cancel_url: cancelUrl,
        expires_at: expiresAt,
        client_reference_id: orderId,
        customer_email: user.email,
        "payment_method_types[0]": method,
        "line_items[0][price_data][currency]": "sgd",
        "line_items[0][price_data][unit_amount]": Number(claim.amountSubtotal),
        "line_items[0][price_data][product_data][name]": `${String(claim.orderReference)} · ${String(claim.productSummary)}`,
        "line_items[0][quantity]": 1,
        "line_items[1][price_data][currency]": "sgd",
        "line_items[1][price_data][unit_amount]": Number(claim.retailerFeeAmount),
        "line_items[1][price_data][product_data][name]": quote.feeDescription,
        "line_items[1][quantity]": 1,
        "payment_intent_data[transfer_group]": `RESTOCK_${orderId}`,
        "payment_intent_data[metadata][order_id]": orderId,
        "payment_intent_data[metadata][payment_method]": method,
        "metadata[order_id]": orderId,
        "metadata[payment_method]": method,
        "metadata[fee_amount]": quote.transactionFee,
        locale: "en",
      },
    });
    if (!session.id || !session.url) throw new Error("Stripe did not return a Checkout URL.");

    const { error: completeError } = await admin.rpc("restock_complete_checkout", {
      p_order_id: orderId,
      p_session_id: session.id,
      p_expires_at: new Date(expiresAt * 1000).toISOString(),
    });
    if (completeError) throw new Error(completeError.message);
    return response(req, {
      data: {
        checkoutUrl: session.url,
        sessionId: session.id,
        reused: false,
        quote,
      },
    });
  } catch (cause) {
    if (session?.id) {
      await stripeRequest(`/checkout/sessions/${encodeURIComponent(session.id)}/expire`).catch(() => undefined);
    }
    await admin.rpc("restock_fail_checkout", {
      p_order_id: orderId,
      p_error: cause instanceof Error ? cause.message : "Stripe checkout failed.",
    });
    throw cause;
  }
}

function paymentIntentId(session: StripeCheckoutSession) {
  if (typeof session.payment_intent === "string") return session.payment_intent;
  return session.payment_intent?.id ?? null;
}

function latestChargeId(intent: { latest_charge?: string | { id: string } | null }) {
  if (typeof intent.latest_charge === "string") return intent.latest_charge;
  return intent.latest_charge?.id ?? null;
}

async function recordPaidSession(admin: AdminClient, session: StripeCheckoutSession) {
  const orderId = session.metadata?.order_id;
  const method = session.metadata?.payment_method;
  const intentId = paymentIntentId(session);
  if (!orderId || !intentId || !session.id || !session.amount_total || !["paynow", "card"].includes(method ?? "")) {
    throw new Error("Stripe Checkout metadata is incomplete.");
  }
  const intent = await stripeRequest<{ id: string; latest_charge?: string | { id: string } | null }>(
    `/payment_intents/${encodeURIComponent(intentId)}`,
    { method: "GET", params: { "expand[0]": "latest_charge" } }
  );
  const { data, error } = await admin.rpc("restock_record_payment_succeeded", {
    p_order_id: orderId,
    p_session_id: session.id,
    p_payment_intent_id: intent.id,
    p_charge_id: latestChargeId(intent),
    p_amount_total: session.amount_total,
    p_payment_method: method,
  });
  if (error) throw new Error(error.message);
  return data;
}

async function syncCheckout(
  req: Request,
  admin: AdminClient,
  user: UserContext,
  orderId: string,
  sessionId: string
) {
  const { payment } = await requireRetailerOrder(admin, user.id, orderId);
  if (payment.stripe_checkout_session_id !== sessionId) {
    return response(req, { error: "This Checkout Session does not belong to the order." }, 403);
  }
  const session = await stripeRequest<StripeCheckoutSession>(
    `/checkout/sessions/${encodeURIComponent(sessionId)}`,
    { method: "GET", params: { "expand[0]": "payment_intent" } }
  );
  if (session.metadata?.order_id !== orderId) {
    return response(req, { error: "Stripe returned mismatched order details." }, 409);
  }
  if (session.payment_status === "paid") await recordPaidSession(admin, session);
  return response(req, { data: { paymentStatus: session.payment_status, checkoutStatus: session.status } });
}

async function supplierMembership(admin: AdminClient, userId: string) {
  const membership = await requireMembership(admin, userId);
  if (membership.accountType !== "supplier" || !["owner", "manager"].includes(membership.memberRole)) {
    throw new StripeApiError("A supplier owner or manager account is required.", 403);
  }
  return membership;
}

async function syncStripeAccount(admin: AdminClient, organizationId: string, accountId: string) {
  const account = await stripeRequest<StripeAccount>(`/accounts/${encodeURIComponent(accountId)}`, {
    method: "GET",
  });
  const { error } = await admin
    .from("restock_supplier_payment_accounts")
    .update({
      stripe_account_id: account.id,
      livemode: stripeLivemode(),
      provisioning_status: "ready",
      details_submitted: Boolean(account.details_submitted),
      payouts_enabled: Boolean(account.payouts_enabled),
      transfers_status: account.capabilities?.transfers ?? "pending",
      requirements_due: account.requirements?.currently_due ?? [],
      disabled_reason: account.requirements?.disabled_reason ?? null,
      last_synced_at: new Date().toISOString(),
    })
    .eq("organization_id", organizationId);
  if (error) throw error;
  return account;
}

function accountStatus(account: StripeAccount) {
  return {
    detailsSubmitted: Boolean(account.details_submitted),
    payoutsEnabled: Boolean(account.payouts_enabled),
    transfersStatus: account.capabilities?.transfers ?? "pending",
    requirementsDue: account.requirements?.currently_due ?? [],
    disabledReason: account.requirements?.disabled_reason ?? null,
    ready: Boolean(
      account.details_submitted &&
      account.payouts_enabled &&
      account.capabilities?.transfers === "active"
    ),
  };
}

async function connectOnboarding(req: Request, admin: AdminClient, user: UserContext) {
  const membership = await supplierMembership(admin, user.id);
  const { data: claimValue, error: claimError } = await admin.rpc(
    "restock_claim_supplier_payment_account",
    { p_actor_user_id: user.id }
  );
  if (claimError) throw new StripeApiError(claimError.message, 409);
  const claim = asRecord(claimValue);
  let accountId = typeof claim.stripeAccountId === "string" ? claim.stripeAccountId : null;

  if (claim.shouldCreate) {
    try {
      const account = await stripeRequest<StripeAccount>("/accounts", {
        idempotencyKey: `restock-connect-${membership.organizationId}`,
        params: {
          type: "express",
          country: "SG",
          email: user.email,
          "capabilities[transfers][requested]": true,
          "business_profile[product_description]": "Wholesale goods supplier on the ReStock marketplace",
          "metadata[restock_organization_id]": membership.organizationId,
        },
      });
      accountId = account.id;
      const { error } = await admin
        .from("restock_supplier_payment_accounts")
        .update({
          stripe_account_id: account.id,
          livemode: stripeLivemode(),
          provisioning_status: "ready",
          disabled_reason: null,
          last_synced_at: new Date().toISOString(),
        })
        .eq("organization_id", membership.organizationId)
        .is("stripe_account_id", null);
      if (error) throw error;
    } catch (cause) {
      await admin
        .from("restock_supplier_payment_accounts")
        .update({
          provisioning_status: "error",
          disabled_reason: cause instanceof Error ? cause.message.slice(0, 500) : "Stripe account setup failed.",
        })
        .eq("organization_id", membership.organizationId);
      throw cause;
    }
  }

  if (!accountId) {
    return response(req, { error: "Stripe account setup is already in progress. Please try again shortly." }, 409);
  }
  await syncStripeAccount(admin, membership.organizationId, accountId);
  const base = appBaseUrl();
  const link = await stripeRequest<{ url: string }>("/account_links", {
    params: {
      account: accountId,
      refresh_url: `${base}/auction/supplier/operations?stripe=refresh`,
      return_url: `${base}/auction/supplier/operations?stripe=return`,
      type: "account_onboarding",
      "collection_options[fields]": "eventually_due",
    },
  });
  return response(req, { data: { url: link.url } });
}

async function refreshConnectAccount(req: Request, admin: AdminClient, user: UserContext) {
  const membership = await supplierMembership(admin, user.id);
  const stored = await supplierPaymentAccount(admin, membership.organizationId);
  if (!stored?.stripe_account_id) {
    return response(req, { data: { connected: false, ready: false } });
  }
  const account = await syncStripeAccount(admin, membership.organizationId, stored.stripe_account_id);
  return response(req, { data: { connected: true, ...accountStatus(account) } });
}

async function connectDashboard(req: Request, admin: AdminClient, user: UserContext) {
  const membership = await supplierMembership(admin, user.id);
  const stored = await supplierPaymentAccount(admin, membership.organizationId);
  if (!stored?.stripe_account_id) {
    return response(req, { error: "Connect Stripe before opening the payment dashboard." }, 409);
  }
  const link = await stripeRequest<{ url: string }>(
    `/accounts/${encodeURIComponent(stored.stripe_account_id)}/login_links`
  );
  return response(req, { data: { url: link.url } });
}

async function retryPaymentOperation(
  req: Request,
  admin: AdminClient,
  user: UserContext,
  orderId: string
) {
  const membership = await requireMembership(admin, user.id);
  const { data: order, error } = await admin
    .from("restock_orders")
    .select("id, buyer_org_id, supplier_org_id, payment_status, payout_status")
    .eq("id", orderId)
    .or(`buyer_org_id.eq.${membership.organizationId},supplier_org_id.eq.${membership.organizationId}`)
    .single();
  if (error || !order) return response(req, { error: "Order not found." }, 404);
  if (!["released", "refunded"].includes(order.payout_status) ||
      !["transfer_pending", "refund_pending"].includes(order.payment_status)) {
    return response(req, { data: { processed: false, reason: "No payment operation is due." } });
  }
  const result = await processPaymentOperation(admin, orderId);
  return response(req, { data: result });
}

function errorResponse(req: Request, cause: unknown) {
  console.error(cause);
  if (cause instanceof StripeApiError) {
    const status = cause.status >= 400 && cause.status < 500 ? cause.status : 502;
    return response(req, { error: cause.message }, status);
  }
  const message = cause instanceof Error ? cause.message : "Payment service error.";
  return response(req, { error: message }, 500);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });
  if (req.method !== "POST") return response(req, { error: "Method not allowed." }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const publishableKey = getConfiguredKey("publishable");
    const secretKey = getConfiguredKey("secret");
    if (!supabaseUrl || !publishableKey || !secretKey) {
      return response(req, { error: "Payment services are not configured yet." }, 503);
    }

    const parsed = requestSchema.safeParse(await req.json());
    if (!parsed.success) return response(req, { error: "Invalid payment request." }, 400);

    const admin = createClient(supabaseUrl, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const internal = req.headers.get("apikey") === secretKey &&
      req.headers.get("x-restock-internal") === "payment-worker";

    if (parsed.data.action === "process_payment_operation") {
      if (!internal) return response(req, { error: "Internal payment authorization required." }, 401);
      const result = await processPaymentOperation(admin, parsed.data.orderId);
      return response(req, { data: result });
    }

    const authorization = req.headers.get("Authorization");
    if (!authorization) return response(req, { error: "Authentication required." }, 401);
    const userClient = createClient(supabaseUrl, publishableKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) return response(req, { error: "Authentication required." }, 401);
    const userContext = { id: user.id, email: user.email };

    const limit = parsed.data.action.startsWith("create_") ? 15 : 60;
    const { data: allowed, error: rateError } = await admin.rpc("restock_consume_rate_limit", {
      p_actor_user_id: user.id,
      p_action: `stripe_${parsed.data.action}`,
      p_max_attempts: limit,
      p_window_seconds: 600,
    });
    if (rateError) throw rateError;
    if (!allowed) return response(req, { error: "Too many payment requests. Please try again later." }, 429);

    switch (parsed.data.action) {
      case "quote_checkout":
        return await quoteCheckout(req, admin, userContext, parsed.data.orderId);
      case "create_checkout":
        return await createCheckout(req, admin, userContext, parsed.data.orderId, parsed.data.paymentMethod);
      case "sync_checkout":
        return await syncCheckout(req, admin, userContext, parsed.data.orderId, parsed.data.sessionId);
      case "create_connect_onboarding":
        return await connectOnboarding(req, admin, userContext);
      case "refresh_connect_account":
        return await refreshConnectAccount(req, admin, userContext);
      case "create_connect_dashboard":
        return await connectDashboard(req, admin, userContext);
      case "retry_payment_operation":
        return await retryPaymentOperation(req, admin, userContext, parsed.data.orderId);
    }
  } catch (cause) {
    return errorResponse(req, cause);
  }
});
