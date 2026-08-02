import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { processPaymentOperation } from "../_shared/stripe-client.ts";

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
  return new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders(req),
  });
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

const lineSchema = z.object({
  productId: z.string().min(1).max(80),
  productName: z.string().min(2).max(200),
  category: z.string().min(2).max(100),
  quantity: z.number().int().positive().max(1_000_000),
  targetPrice: z.number().positive().max(1_000_000),
  marketPrice: z.number().positive().max(1_000_000),
});

const requestSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("onboard_organization"),
    organizationId: z.string().uuid(),
    aliasCode: z.string().regex(/^(RET|SUP)-[A-Z0-9]{6}$/),
    legalName: z.string().trim().min(2).max(160),
    displayName: z.string().trim().min(2).max(80),
    accountType: z.enum(["retailer", "supplier"]),
    categories: z.array(z.string().trim().min(2).max(100)).max(20),
    contactName: z.string().trim().min(2).max(100),
    phoneE164: z.string().regex(/^\+[1-9][0-9]{7,14}$/),
    addressLine1: z.string().trim().min(3).max(180),
    addressLine2: z.string().trim().max(180),
    postalCode: z.string().regex(/^[0-9]{6}$/),
    deliveryInstructions: z.string().trim().max(500),
  }),
  z.object({
    action: z.literal("create_request"),
    idempotencyKey: z.string().uuid(),
    title: z.string().trim().min(3).max(140),
    deliveryDate: z.string().date(),
    priority: z.enum(["standard", "urgent"]),
    notes: z.string().trim().max(2000),
    lines: z.array(lineSchema).min(1).max(50),
    selectedSupplierIds: z.array(z.string().uuid()).min(1).max(25),
  }),
  z.object({
    action: z.literal("submit_quote"),
    idempotencyKey: z.string().uuid(),
    requestId: z.string().uuid(),
    totalPrice: z.number().positive().max(100_000_000),
    deliveryDays: z.number().int().min(1).max(120),
    paymentTerms: z.string().trim().min(2).max(80),
  }),
  z.object({
    action: z.literal("award_quote"),
    idempotencyKey: z.string().uuid(),
    requestId: z.string().uuid(),
    quoteId: z.string().uuid(),
  }),
  z.object({
    action: z.literal("submit_supplier_proof"),
    orderId: z.string().uuid(),
    storagePath: z.string().regex(
      /^[0-9a-f-]{36}\/supplier\/[0-9a-f-]{36}\.(jpg|png|webp)$/
    ),
    fileName: z.string().trim().min(1).max(255).regex(/^[^/\\\u0000-\u001f]+$/),
    mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
    fileSizeBytes: z.number().int().positive().max(10_485_760),
    quantity: z.number().int().positive().max(1_000_000),
    note: z.string().trim().max(2000),
  }),
  z.object({
    action: z.literal("verify_delivery"),
    orderId: z.string().uuid(),
    storagePath: z.string().regex(
      /^[0-9a-f-]{36}\/retailer\/[0-9a-f-]{36}\.(jpg|png|webp)$/
    ),
    fileName: z.string().trim().min(1).max(255).regex(/^[^/\\\u0000-\u001f]+$/),
    mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
    fileSizeBytes: z.number().int().positive().max(10_485_760),
    quantity: z.number().int().positive().max(1_000_000),
    note: z.string().trim().max(2000),
    outcome: z.enum(["accepted", "damaged", "short", "wrong_items", "other"]),
  }),
  z.object({
    action: z.literal("review_queue"),
  }),
  z.object({
    action: z.literal("resolve_dispute"),
    disputeId: z.string().uuid(),
    resolution: z.enum(["refund_buyer", "release_supplier"]),
    note: z.string().trim().min(10).max(3000),
  }),
]);

type AdminClient = ReturnType<typeof createClient>;

function reference(prefix: "RFQ" | "QUO" | "ORD" | "DSP") {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const suffix = Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
  return `${prefix}-${suffix}`;
}

type DatabaseError = {
  code?: string;
  message: string;
};

const rateLimits: Record<z.infer<typeof requestSchema>["action"], {
  maxAttempts: number;
  windowSeconds: number;
}> = {
  onboard_organization: { maxAttempts: 5, windowSeconds: 3600 },
  create_request: { maxAttempts: 10, windowSeconds: 600 },
  submit_quote: { maxAttempts: 30, windowSeconds: 600 },
  award_quote: { maxAttempts: 15, windowSeconds: 600 },
  submit_supplier_proof: { maxAttempts: 10, windowSeconds: 3600 },
  verify_delivery: { maxAttempts: 10, windowSeconds: 3600 },
  review_queue: { maxAttempts: 120, windowSeconds: 600 },
  resolve_dispute: { maxAttempts: 30, windowSeconds: 3600 },
};

function databaseErrorResponse(req: Request, error: DatabaseError) {
  const explicitStatus = error.code?.startsWith("PT")
    ? Number(error.code.slice(2))
    : undefined;
  const status =
    explicitStatus && explicitStatus >= 400 && explicitStatus <= 599
      ? explicitStatus
      : error.code === "23505"
        ? 409
        : 500;
  return response(
    req,
    { error: status === 500 ? "The workflow could not be completed safely." : error.message },
    status
  );
}

async function getMembership(admin: AdminClient, userId: string) {
  const { data, error } = await admin
    .from("restock_organization_members")
    .select(
      "organization_id, member_role, organization:restock_organizations(id, account_type, alias_code, status)"
    )
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Complete business onboarding before using this workflow.");
  const organization = Array.isArray(data.organization)
    ? data.organization[0]
    : data.organization;
  if (!organization || organization.status !== "active") {
    throw new Error("This business account is not active.");
  }
  return {
    organizationId: data.organization_id as string,
    accountType: organization.account_type as "retailer" | "supplier",
    aliasCode: organization.alias_code as string,
    memberRole: data.member_role as string,
  };
}

async function notifyOrganization(
  admin: AdminClient,
  organizationId: string,
  notification: { type: string; title: string; body: string; linkPath: string }
) {
  const { data: members } = await admin
    .from("restock_organization_members")
    .select("user_id")
    .eq("organization_id", organizationId);
  if (!members?.length) return;

  await admin.from("restock_notifications").insert(
    members.map((member) => ({
      user_id: member.user_id,
      organization_id: organizationId,
      notification_type: notification.type,
      title: notification.title,
      body: notification.body,
      link_path: notification.linkPath,
    }))
  );
}

async function audit(
  admin: AdminClient,
  organizationId: string,
  userId: string,
  entityTable: string,
  entityId: string,
  action: "INSERT" | "UPDATE",
  newRecord: Record<string, unknown>
) {
  await admin.from("restock_audit_log").insert({
    organization_id: organizationId,
    actor_user_id: userId,
    entity_table: entityTable,
    entity_id: entityId,
    action,
    new_record: newRecord,
  });
}

async function requireReviewer(admin: AdminClient, userId: string) {
  const { data, error } = await admin
    .from("restock_reviewers")
    .select("user_id")
    .eq("user_id", userId)
    .eq("active", true)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Independent reviewer access is required.");
}

function imageMimeFromSignature(bytes: Uint8Array) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

async function validateStoredEvidence(
  admin: AdminClient,
  storagePath: string,
  expectedMimeType: "image/jpeg" | "image/png" | "image/webp",
  expectedSize: number
) {
  const { data: storedFile, error } = await admin.storage
    .from("restock-delivery-evidence")
    .download(storagePath);
  if (error || !storedFile) throw new Error("The uploaded photo could not be verified.");
  if (storedFile.size !== expectedSize || storedFile.size > 10_485_760) {
    throw new Error("The uploaded photo size does not match the submitted evidence.");
  }
  const header = new Uint8Array(await storedFile.slice(0, 16).arrayBuffer());
  if (imageMimeFromSignature(header) !== expectedMimeType) {
    throw new Error("The uploaded file is not a supported photo.");
  }
}

async function onboardOrganization(
  req: Request,
  admin: AdminClient,
  userId: string,
  input: Extract<z.infer<typeof requestSchema>, { action: "onboard_organization" }>
) {
  if (
    (input.accountType === "retailer" && !input.aliasCode.startsWith("RET-")) ||
    (input.accountType === "supplier" && !input.aliasCode.startsWith("SUP-"))
  ) {
    return response(req, { error: "Protected alias does not match account type." }, 400);
  }
  if (input.accountType === "supplier" && input.categories.length === 0) {
    return response(req, { error: "Select at least one supply category." }, 400);
  }

  const { data, error } = await admin.rpc("restock_onboard_organization", {
    actor_user_id: userId,
    organization_id: input.organizationId,
    alias_code: input.aliasCode,
    legal_name: input.legalName,
    display_name: input.displayName,
    account_type: input.accountType,
    categories: input.categories,
    contact_name: input.contactName,
    phone_e164: input.phoneE164,
    address_line_1: input.addressLine1,
    address_line_2: input.addressLine2,
    postal_code: input.postalCode,
    delivery_instructions: input.deliveryInstructions,
  });
  if (error) throw error;

  await admin.from("restock_audit_log").insert({
    organization_id: input.organizationId,
    actor_user_id: userId,
    entity_table: "restock_organizations",
    entity_id: input.organizationId,
    action: "INSERT",
    new_record: {
      accountType: input.accountType,
      aliasCode: input.aliasCode,
      logisticsConfigured: true,
    },
  });
  return response(req, { data: { id: data, aliasCode: input.aliasCode } }, 201);
}

async function createRequest(
  req: Request,
  admin: AdminClient,
  userId: string,
  input: Extract<z.infer<typeof requestSchema>, { action: "create_request" }>
) {
  const deliveryDate = new Date(`${input.deliveryDate}T12:00:00.000Z`);
  const requestId = crypto.randomUUID();
  const requestReference = reference("RFQ");
  const deadline = new Date();
  deadline.setHours(deadline.getHours() + (input.priority === "urgent" ? 12 : 48));
  const latestDeadline = new Date(deliveryDate);
  latestDeadline.setUTCDate(latestDeadline.getUTCDate() - 1);
  const quoteDeadline = new Date(
    Math.min(deadline.getTime(), latestDeadline.getTime())
  ).toISOString();

  const { data, error } = await admin.rpc("restock_create_request", {
    p_actor_user_id: userId,
    p_idempotency_key: input.idempotencyKey,
    p_request_id: requestId,
    p_request_reference: requestReference,
    p_title: input.title,
    p_delivery_date: input.deliveryDate,
    p_priority: input.priority,
    p_notes: input.notes,
    p_quote_deadline: quoteDeadline,
    p_lines: input.lines,
    p_supplier_ids: input.selectedSupplierIds,
  });
  if (error) return databaseErrorResponse(req, error);

  return response(req, { data }, 201);
}

async function submitQuote(
  req: Request,
  admin: AdminClient,
  userId: string,
  input: Extract<z.infer<typeof requestSchema>, { action: "submit_quote" }>
) {
  const quoteId = crypto.randomUUID();
  const quoteReference = reference("QUO");
  const { data, error } = await admin.rpc("restock_submit_quote", {
    p_actor_user_id: userId,
    p_idempotency_key: input.idempotencyKey,
    p_request_id: input.requestId,
    p_quote_id: quoteId,
    p_quote_reference: quoteReference,
    p_total_price: input.totalPrice,
    p_delivery_days: input.deliveryDays,
    p_payment_terms: input.paymentTerms,
  });
  if (error) return databaseErrorResponse(req, error);

  return response(req, { data }, 201);
}

async function awardQuote(
  req: Request,
  admin: AdminClient,
  userId: string,
  input: Extract<z.infer<typeof requestSchema>, { action: "award_quote" }>
) {
  const orderId = crypto.randomUUID();
  const orderReference = reference("ORD");
  const { data, error } = await admin.rpc("restock_award_quote", {
    p_actor_user_id: userId,
    p_idempotency_key: input.idempotencyKey,
    p_request_id: input.requestId,
    p_quote_id: input.quoteId,
    p_order_id: orderId,
    p_order_reference: orderReference,
  });
  if (error) return databaseErrorResponse(req, error);

  return response(req, { data }, 201);
}

async function submitSupplierProof(
  req: Request,
  admin: AdminClient,
  userId: string,
  input: Extract<z.infer<typeof requestSchema>, { action: "submit_supplier_proof" }>
) {
  const membership = await getMembership(admin, userId);
  if (membership.accountType !== "supplier") {
    return response(req, { error: "Only the assigned supplier can add the dispatch photo." }, 403);
  }
  if (!input.storagePath.startsWith(`${input.orderId}/supplier/`)) {
    return response(req, { error: "The uploaded photo could not be linked to this order." }, 400);
  }

  const { data: order, error: orderError } = await admin
    .from("restock_orders")
    .select("*")
    .eq("id", input.orderId)
    .eq("supplier_org_id", membership.organizationId)
    .single();
  if (orderError) throw orderError;
  if (!["legacy", "paid", "transfer_pending", "transferred"].includes(order.payment_status)) {
    return response(req, { error: "Wait for the retailer payment before preparing this order." }, 409);
  }
  if (!["awaiting_supplier_proof", "awaiting_courier_pickup"].includes(order.verification_status)) {
    return response(req, { error: "A dispatch photo has already been submitted for this order." }, 409);
  }

  await validateStoredEvidence(admin, input.storagePath, input.mimeType, input.fileSizeBytes);

  const { error: proofError } = await admin.from("restock_delivery_proofs").insert({
    order_id: order.id,
    actor_type: "supplier",
    submitted_by: userId,
    storage_path: input.storagePath,
    file_name: input.fileName,
    mime_type: input.mimeType,
    file_size_bytes: input.fileSizeBytes,
    quantity: input.quantity,
    note: input.note,
    condition: "sealed",
  });
  if (proofError) {
    if (proofError.code === "23505") {
      return response(req, { error: "A dispatch photo has already been submitted." }, 409);
    }
    throw proofError;
  }

  const nextVerification =
    order.courier_status === "in_transit" ? "in_transit" : "awaiting_courier_pickup";
  await admin
    .from("restock_orders")
    .update({ verification_status: nextVerification, version: order.version + 1 })
    .eq("id", order.id)
    .eq("version", order.version);
  await admin.from("restock_fulfillment_events").insert({
    order_id: order.id,
    actor_type: "supplier",
    event_type: "supplier_proof_submitted",
    title: "Dispatch photo added",
    detail: `${input.quantity} units were photographed before Ninja Van pickup.`,
  });
  await notifyOrganization(admin, order.buyer_org_id, {
    type: "supplier_proof_recorded",
    title: "Supplier dispatch photo added",
    body: `${order.reference} is awaiting Ninja Van pickup.`,
    linkPath: "/auction/shop/orders",
  });
  await audit(admin, membership.organizationId, userId, "restock_delivery_proofs", order.id, "INSERT", {
    actor: "supplier",
    quantity: input.quantity,
  });

  return response(req, { data: { orderId: order.id, verificationStatus: nextVerification } });
}

function automatedAssessment(
  supplierQuantity: number,
  retailerQuantity: number,
  outcome: "damaged" | "short" | "wrong_items" | "other",
  courierStatus: string
) {
  const quantityDifference = supplierQuantity - retailerQuantity;
  const issue =
    outcome === "damaged"
      ? "The retailer reported damaged items."
      : outcome === "wrong_items"
        ? "The retailer reported that different items arrived."
        : outcome === "short"
          ? "The retailer reported missing units."
          : "The retailer asked for a review.";
  const quantity =
    quantityDifference === 0
      ? "Both photos record the same quantity."
      : `The supplier recorded ${supplierQuantity} units and the retailer recorded ${retailerQuantity}, a difference of ${Math.abs(quantityDifference)} units.`;
  const courier =
    courierStatus === "delivered"
      ? "Ninja Van marked the order delivered."
      : "A final Ninja Van delivery update is missing.";
  return `${issue} ${quantity} ${courier} The order remains under review until a reviewer makes a decision.`;
}

async function verifyDelivery(
  req: Request,
  admin: AdminClient,
  userId: string,
  input: Extract<z.infer<typeof requestSchema>, { action: "verify_delivery" }>
) {
  const membership = await getMembership(admin, userId);
  if (membership.accountType !== "retailer") {
    return response(req, { error: "Only the retailer receiving this order can confirm delivery." }, 403);
  }
  if (!input.storagePath.startsWith(`${input.orderId}/retailer/`)) {
    return response(req, { error: "The uploaded photo could not be linked to this order." }, 400);
  }

  const { data: order, error: orderError } = await admin
    .from("restock_orders")
    .select("*, restock_delivery_proofs(*)")
    .eq("id", input.orderId)
    .eq("buyer_org_id", membership.organizationId)
    .single();
  if (orderError) throw orderError;
  if (order.courier_status !== "delivered" || order.verification_status !== "awaiting_shop_verification") {
    return response(req, { error: "This order is not ready to be confirmed yet." }, 409);
  }

  const supplierProof = order.restock_delivery_proofs.find(
    (proof: { actor_type: string }) => proof.actor_type === "supplier"
  );
  if (!supplierProof) {
    return response(req, { error: "The supplier dispatch photo is missing." }, 409);
  }

  await validateStoredEvidence(admin, input.storagePath, input.mimeType, input.fileSizeBytes);

  const accepted = input.outcome === "accepted";
  const { error: proofError } = await admin.from("restock_delivery_proofs").insert({
    order_id: order.id,
    actor_type: "retailer",
    submitted_by: userId,
    storage_path: input.storagePath,
    file_name: input.fileName,
    mime_type: input.mimeType,
    file_size_bytes: input.fileSizeBytes,
    quantity: input.quantity,
    note: input.note,
    condition: accepted ? "good" : input.outcome,
  });
  if (proofError) {
    if (proofError.code === "23505") {
      return response(req, { error: "A delivery photo has already been submitted." }, 409);
    }
    throw proofError;
  }

  let disputeReference: string | null = null;
  if (!accepted) {
    disputeReference = reference("DSP");
    await admin.from("restock_disputes").insert({
      reference: disputeReference,
      order_id: order.id,
      opened_by: userId,
      reason: input.outcome,
      details: input.note,
      automated_assessment: automatedAssessment(
        supplierProof.quantity,
        input.quantity,
        input.outcome,
        order.courier_status
      ),
      assessment_source: "rules",
    });
  }

  await admin
    .from("restock_orders")
    .update({
      status: "delivered",
      verification_status: accepted ? "verified" : "disputed",
      payout_status: accepted ? "released" : "under_review",
      version: order.version + 1,
    })
    .eq("id", order.id)
    .eq("version", order.version);
  await admin.from("restock_fulfillment_events").insert([
    {
      order_id: order.id,
      actor_type: "retailer",
      event_type: accepted ? "delivery_verified" : "delivery_issue_reported",
      title: accepted ? "Delivery confirmed by retailer" : "Delivery issue reported",
      detail: accepted
        ? `${input.quantity} units confirmed in good condition.`
        : `${input.quantity} units recorded with issue: ${input.outcome.replace("_", " ")}.`,
    },
    {
      order_id: order.id,
      actor_type: "system",
      event_type: accepted ? "payout_released" : "payout_held",
      title: accepted ? "Order completed" : "Independent review opened",
      detail: accepted
        ? "The retailer confirmed the order arrived correctly. Payment status was updated."
        : `${disputeReference} was created. The order will remain open until a reviewer decides.`,
    },
  ]);
  await notifyOrganization(admin, order.supplier_org_id, {
    type: accepted ? "delivery_verified" : "dispute_opened",
    title: accepted ? "Delivery confirmed" : "Delivery issue reported",
    body: accepted
      ? `${order.reference} was accepted. Payment status has been updated.`
      : `${disputeReference} was opened for ${order.reference}.`,
    linkPath: "/auction/supplier/operations",
  });
  await audit(admin, membership.organizationId, userId, "restock_orders", order.id, "UPDATE", {
    verificationStatus: accepted ? "verified" : "disputed",
    disputeReference,
  });

  if (accepted) {
    await processPaymentOperation(admin, order.id).catch((cause) => {
      console.error("Supplier payment remains queued for retry.", cause);
    });
  }

  return response(req, {
    data: {
      orderId: order.id,
      verificationStatus: accepted ? "verified" : "disputed",
      disputeReference,
    },
  });
}

async function reviewQueue(
  req: Request,
  admin: AdminClient,
  userId: string
) {
  await requireReviewer(admin, userId);
  const { data: disputes, error } = await admin
    .from("restock_disputes")
    .select(
      "*, order:restock_orders(*, restock_delivery_proofs(*), restock_fulfillment_events(*))"
    )
    .in("status", ["reviewing", "needs_information"])
    .order("opened_at", { ascending: true });
  if (error) throw error;

  const paths = (disputes ?? []).flatMap((dispute) => {
    const order = Array.isArray(dispute.order) ? dispute.order[0] : dispute.order;
    return (order?.restock_delivery_proofs ?? []).map(
      (proof: { storage_path: string }) => proof.storage_path
    );
  });
  const signedByPath = new Map<string, string>();
  if (paths.length) {
    const { data: signed, error: signedError } = await admin.storage
      .from("restock-delivery-evidence")
      .createSignedUrls(paths, 900);
    if (signedError) throw signedError;
    signed?.forEach((item, index) => {
      if (item.signedUrl) signedByPath.set(paths[index], item.signedUrl);
    });
  }

  const queue = (disputes ?? []).map((dispute) => {
    const order = Array.isArray(dispute.order) ? dispute.order[0] : dispute.order;
    return {
      ...dispute,
      order: order
        ? {
            ...order,
            restock_delivery_proofs: order.restock_delivery_proofs.map(
              (proof: { storage_path: string }) => ({
                ...proof,
                signed_url: signedByPath.get(proof.storage_path),
              })
            ),
          }
        : null,
    };
  });
  return response(req, { data: queue });
}

async function resolveDispute(
  req: Request,
  admin: AdminClient,
  userId: string,
  input: Extract<z.infer<typeof requestSchema>, { action: "resolve_dispute" }>
) {
  await requireReviewer(admin, userId);
  const { data: dispute, error } = await admin
    .from("restock_disputes")
    .select("*, order:restock_orders(*)")
    .eq("id", input.disputeId)
    .in("status", ["reviewing", "needs_information"])
    .single();
  if (error) throw error;
  const order = Array.isArray(dispute.order) ? dispute.order[0] : dispute.order;
  if (!order) return response(req, { error: "The related order is unavailable." }, 409);

  const buyerRefund = input.resolution === "refund_buyer";
  const resolvedAt = new Date().toISOString();
  const { error: disputeError } = await admin
    .from("restock_disputes")
    .update({
      status: buyerRefund ? "refunded" : "resolved_supplier",
      payout_on_hold: false,
      assigned_reviewer: userId,
      resolution_note: input.note,
      resolved_at: resolvedAt,
    })
    .eq("id", dispute.id)
    .in("status", ["reviewing", "needs_information"]);
  if (disputeError) throw disputeError;

  const { error: orderError } = await admin
    .from("restock_orders")
    .update({
      payout_status: buyerRefund ? "refunded" : "released",
      version: order.version + 1,
    })
    .eq("id", order.id)
    .eq("version", order.version);
  if (orderError) throw orderError;

  await admin.from("restock_fulfillment_events").insert({
    order_id: order.id,
    actor_type: "reviewer",
    event_type: buyerRefund ? "dispute_refunded" : "dispute_supplier_upheld",
    title: buyerRefund ? "Review completed: retailer refunded" : "Review completed: supplier paid",
    detail: input.note,
  });
  await admin.from("restock_dispute_messages").insert({
    dispute_id: dispute.id,
    author_user_id: userId,
    author_type: "reviewer",
    message: input.note,
  });
  await Promise.all([
    notifyOrganization(admin, order.buyer_org_id, {
      type: "dispute_resolved",
      title: "Delivery review completed",
      body: `${dispute.reference} has been resolved. Open the order for the decision record.`,
      linkPath: "/auction/shop/orders",
    }),
    notifyOrganization(admin, order.supplier_org_id, {
      type: "dispute_resolved",
      title: "Delivery review completed",
      body: `${dispute.reference} has been resolved. Open the order for the final decision.`,
      linkPath: "/auction/supplier/operations",
    }),
  ]);
  await admin.from("restock_audit_log").insert({
    actor_user_id: userId,
    entity_table: "restock_disputes",
    entity_id: dispute.id,
    action: "UPDATE",
    old_record: { status: dispute.status, payoutOnHold: true },
    new_record: {
      status: buyerRefund ? "refunded" : "resolved_supplier",
      payoutStatus: buyerRefund ? "refunded" : "released",
    },
  });

  await processPaymentOperation(admin, order.id).catch((cause) => {
    console.error("Dispute payment operation remains queued for retry.", cause);
  });

  return response(req, {
    data: {
      disputeId: dispute.id,
      reference: dispute.reference,
      status: buyerRefund ? "refunded" : "resolved_supplier",
    },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });
  if (req.method !== "POST") return response(req, { error: "Method not allowed." }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const publishableKey = getConfiguredKey("publishable");
    const secretKey = getConfiguredKey("secret");
    const authorization = req.headers.get("Authorization");
    if (!supabaseUrl || !publishableKey || !secretKey || !authorization) {
      return response(req, { error: "Service authentication is not configured." }, 503);
    }

    const userClient = createClient(supabaseUrl, publishableKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();
    if (userError || !user) return response(req, { error: "Authentication required." }, 401);

    const parsed = requestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return response(
        req,
        { error: "Invalid workflow request.", fields: z.flattenError(parsed.error).fieldErrors },
        400
      );
    }

    const admin = createClient(supabaseUrl, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const limit = rateLimits[parsed.data.action];
    const { data: allowed, error: rateLimitError } = await admin.rpc(
      "restock_consume_rate_limit",
      {
        p_actor_user_id: user.id,
        p_action: parsed.data.action,
        p_max_attempts: limit.maxAttempts,
        p_window_seconds: limit.windowSeconds,
      }
    );
    if (rateLimitError) return databaseErrorResponse(req, rateLimitError);
    if (!allowed) {
      return response(
        req,
        { error: "Too many requests. Wait a few minutes before trying again." },
        429
      );
    }

    switch (parsed.data.action) {
      case "onboard_organization":
        return await onboardOrganization(req, admin, user.id, parsed.data);
      case "create_request":
        return await createRequest(req, admin, user.id, parsed.data);
      case "submit_quote":
        return await submitQuote(req, admin, user.id, parsed.data);
      case "award_quote":
        return await awardQuote(req, admin, user.id, parsed.data);
      case "submit_supplier_proof":
        return await submitSupplierProof(req, admin, user.id, parsed.data);
      case "verify_delivery":
        return await verifyDelivery(req, admin, user.id, parsed.data);
      case "review_queue":
        return await reviewQueue(req, admin, user.id);
      case "resolve_dispute":
        return await resolveDispute(req, admin, user.id, parsed.data);
    }
  } catch (error) {
    console.error("restock-workflow", error);
    return response(
      req,
      { error: error instanceof Error ? error.message : "Unexpected workflow failure." },
      500
    );
  }
});
