import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const webhookSchema = z.object({
  tracking_id: z.string().min(2).max(120),
  shipper_order_ref_no: z.string().min(2).max(120),
  timestamp: z.string().min(10).max(80),
  event: z.string().max(160).optional(),
  status: z.string().min(2).max(160),
  is_parcel_on_rts_leg: z.boolean().optional(),
  image_uris: z.array(z.string().url()).max(20).optional(),
  signature_uri: z.string().url().optional(),
  delivery_exception: z
    .object({
      failure_reason: z.string().max(500).optional(),
    })
    .passthrough()
    .optional(),
}).passthrough();

function getSecretKey() {
  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (legacy) return legacy;
  const keys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}");
  return keys.default as string | undefined;
}

function toHex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function toBase64(bytes: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)));
}

function constantTimeEqual(left: string, right: string) {
  const encoder = new TextEncoder();
  const a = encoder.encode(left);
  const b = encoder.encode(right);
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index += 1) {
    difference |= a[index] ^ b[index];
  }
  return difference === 0;
}

async function signatureIsValid(rawBody: string, providedSignature: string, clientSecret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(clientSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
  const normalized = providedSignature.trim().replace(/^sha256=/i, "");
  return (
    constantTimeEqual(normalized.toLowerCase(), toHex(digest)) ||
    constantTimeEqual(normalized, toBase64(digest))
  );
}

function mapCourierState(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes("delivered") || normalized.includes("received by customer")) {
    return { courierStatus: "delivered", orderStatus: "delivered", verificationStatus: "awaiting_shop_verification" };
  }
  if (
    normalized.includes("pickup successful") ||
    normalized.includes("collected") ||
    normalized.includes("origin hub") ||
    normalized.includes("vehicle for delivery") ||
    normalized.includes("in transit")
  ) {
    return { courierStatus: "in_transit", orderStatus: "in_transit", verificationStatus: "in_transit" };
  }
  if (
    normalized.includes("exception") ||
    normalized.includes("failed") ||
    normalized.includes("unable") ||
    normalized.includes("return")
  ) {
    return { courierStatus: "exception", orderStatus: null, verificationStatus: null };
  }
  return { courierStatus: "pickup_scheduled", orderStatus: null, verificationStatus: null };
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed." }, { status: 405 });
  }

  const clientSecret = Deno.env.get("NINJAVAN_CLIENT_SECRET");
  const signature = req.headers.get("X-Ninjavan-Hmac-Sha256");
  if (!clientSecret) {
    console.error("NINJAVAN_CLIENT_SECRET is not configured");
    return Response.json({ error: "Webhook is not configured." }, { status: 503 });
  }
  if (!signature) return Response.json({ error: "Missing webhook signature." }, { status: 401 });

  const rawBody = await req.text();
  if (!(await signatureIsValid(rawBody, signature, clientSecret))) {
    return Response.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  let rawPayload: unknown;
  try {
    rawPayload = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const parsed = webhookSchema.safeParse(rawPayload);
  if (!parsed.success) return Response.json({ error: "Invalid webhook payload." }, { status: 400 });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const secretKey = getSecretKey();
  if (!supabaseUrl || !secretKey) {
    return Response.json({ error: "Database service is not configured." }, { status: 503 });
  }

  const admin = createClient(supabaseUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const payload = parsed.data;
  const { data: order, error: orderError } = await admin
    .from("restock_orders")
    .select("*")
    .or(`reference.eq.${payload.shipper_order_ref_no},courier_tracking_id.eq.${payload.tracking_id}`)
    .limit(1)
    .maybeSingle();
  if (orderError) {
    console.error("ninjavan order lookup", orderError);
    return Response.json({ error: "Temporary processing failure." }, { status: 500 });
  }
  if (!order) {
    return Response.json({ accepted: true, matched: false }, { status: 200 });
  }

  const state = mapCourierState(payload.status);
  const eventKey = `ninjavan:${payload.tracking_id}:${payload.timestamp}:${payload.status}`;
  const { data: existingEvent } = await admin
    .from("restock_fulfillment_events")
    .select("id")
    .eq("order_id", order.id)
    .eq("source_reference", eventKey)
    .maybeSingle();
  if (existingEvent) {
    return Response.json({ accepted: true, duplicate: true }, { status: 200 });
  }

  const orderUpdate: Record<string, unknown> = {
    courier_tracking_id: payload.tracking_id,
    courier_status: state.courierStatus,
    courier_last_scan: payload.status,
    courier_last_scan_at: new Date(payload.timestamp).toISOString(),
    version: order.version + 1,
  };
  if (state.orderStatus) orderUpdate.status = state.orderStatus;
  if (state.verificationStatus) {
    orderUpdate.verification_status =
      state.verificationStatus === "in_transit" && order.verification_status === "awaiting_supplier_proof"
        ? "awaiting_supplier_proof"
        : state.verificationStatus;
  }

  const { error: updateError } = await admin
    .from("restock_orders")
    .update(orderUpdate)
    .eq("id", order.id)
    .eq("version", order.version);
  if (updateError) {
    console.error("ninjavan order update", updateError);
    return Response.json({ error: "Temporary processing failure." }, { status: 500 });
  }

  await admin.from("restock_fulfillment_events").insert({
    order_id: order.id,
    actor_type: "ninja_van",
    event_type:
      state.courierStatus === "delivered"
        ? "delivery_scan"
        : state.courierStatus === "exception"
          ? "delivery_exception"
          : "tracking_update",
    title: `Ninja Van · ${payload.status}`,
    detail:
      payload.delivery_exception?.failure_reason ??
      `${payload.event ?? payload.status} recorded by Ninja Van.`,
    source_reference: eventKey,
    occurred_at: new Date(payload.timestamp).toISOString(),
  });

  return Response.json({ accepted: true, matched: true }, { status: 200 });
});
