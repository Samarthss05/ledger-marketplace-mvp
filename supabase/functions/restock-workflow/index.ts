import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

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
    title: z.string().trim().min(3).max(140),
    deliveryDate: z.string().date(),
    priority: z.enum(["standard", "urgent"]),
    notes: z.string().trim().max(2000),
    lines: z.array(lineSchema).min(1).max(50),
    selectedSupplierIds: z.array(z.string().uuid()).min(1).max(25),
  }),
  z.object({
    action: z.literal("submit_quote"),
    requestId: z.string().uuid(),
    totalPrice: z.number().positive().max(100_000_000),
    deliveryDays: z.number().int().min(1).max(120),
    paymentTerms: z.string().trim().min(2).max(80),
  }),
  z.object({
    action: z.literal("award_quote"),
    requestId: z.string().uuid(),
    quoteId: z.string().uuid(),
  }),
  z.object({
    action: z.literal("submit_supplier_proof"),
    orderId: z.string().uuid(),
    storagePath: z.string().min(20).max(500),
    fileName: z.string().min(1).max(255),
    mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
    fileSizeBytes: z.number().int().positive().max(10_485_760),
    quantity: z.number().int().positive().max(1_000_000),
    note: z.string().trim().max(2000),
  }),
  z.object({
    action: z.literal("verify_delivery"),
    orderId: z.string().uuid(),
    storagePath: z.string().min(20).max(500),
    fileName: z.string().min(1).max(255),
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

function scoreQuote(targetTotal: number, totalPrice: number, deliveryDays: number) {
  const priceScore = Math.max(0, Math.min(100, (targetTotal / totalPrice) * 88));
  const speedScore = Math.max(40, 100 - deliveryDays * 6);
  return Math.round(priceScore * 0.72 + speedScore * 0.28);
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
    throw new Error("This business workspace is not active.");
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
  const membership = await getMembership(admin, userId);
  if (membership.accountType !== "retailer") {
    return response(req, { error: "Only retailer accounts can create requests." }, 403);
  }

  const deliveryDate = new Date(`${input.deliveryDate}T12:00:00.000Z`);
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  if (deliveryDate < tomorrow) {
    return response(req, { error: "Delivery date must be at least one day ahead." }, 400);
  }

  const { data: supplierProfiles, error: suppliersError } = await admin
    .from("restock_supplier_profiles")
    .select("organization_id, alias_code")
    .in("organization_id", input.selectedSupplierIds)
    .eq("accepting_requests", true);
  if (suppliersError) throw suppliersError;
  if (supplierProfiles.length !== new Set(input.selectedSupplierIds).size) {
    return response(req, { error: "One or more selected suppliers are unavailable." }, 409);
  }

  const requestId = crypto.randomUUID();
  const requestReference = reference("RFQ");
  const deadline = new Date();
  deadline.setHours(deadline.getHours() + (input.priority === "urgent" ? 12 : 48));
  const latestDeadline = new Date(deliveryDate);
  latestDeadline.setUTCDate(latestDeadline.getUTCDate() - 1);

  const { error: requestError } = await admin.from("restock_sourcing_requests").insert({
    id: requestId,
    reference: requestReference,
    retailer_org_id: membership.organizationId,
    retailer_alias: membership.aliasCode,
    title: input.title,
    delivery_date: input.deliveryDate,
    priority: input.priority,
    notes: input.notes,
    quote_deadline: new Date(Math.min(deadline.getTime(), latestDeadline.getTime())).toISOString(),
    created_by: userId,
  });
  if (requestError) throw requestError;

  const { error: linesError } = await admin.from("restock_request_lines").insert(
    input.lines.map((line) => ({
      request_id: requestId,
      product_id: line.productId,
      product_name: line.productName,
      category: line.category,
      quantity: line.quantity,
      target_price: line.targetPrice,
      market_price: line.marketPrice,
    }))
  );
  if (linesError) throw linesError;

  const { error: invitationsError } = await admin.from("restock_request_suppliers").insert(
    supplierProfiles.map((supplier) => ({
      request_id: requestId,
      supplier_org_id: supplier.organization_id,
      supplier_alias: supplier.alias_code,
    }))
  );
  if (invitationsError) throw invitationsError;

  await Promise.all(
    supplierProfiles.map((supplier) =>
      notifyOrganization(admin, supplier.organization_id, {
        type: "request_received",
        title: "New quote request",
        body: `${requestReference} is ready for review.`,
        linkPath: "/auction/supplier/crm",
      })
    )
  );
  await audit(admin, membership.organizationId, userId, "restock_sourcing_requests", requestId, "INSERT", {
    reference: requestReference,
    suppliersInvited: supplierProfiles.length,
  });

  return response(req, { data: { id: requestId, reference: requestReference } }, 201);
}

async function submitQuote(
  req: Request,
  admin: AdminClient,
  userId: string,
  input: Extract<z.infer<typeof requestSchema>, { action: "submit_quote" }>
) {
  const membership = await getMembership(admin, userId);
  if (membership.accountType !== "supplier") {
    return response(req, { error: "Only supplier accounts can submit quotes." }, 403);
  }

  const { data: request, error: requestError } = await admin
    .from("restock_sourcing_requests")
    .select("id, retailer_org_id, status, quote_deadline, delivery_date, restock_request_lines(quantity, target_price)")
    .eq("id", input.requestId)
    .single();
  if (requestError) throw requestError;
  if (!["sent", "quoted"].includes(request.status) || new Date(request.quote_deadline) < new Date()) {
    return response(req, { error: "This quote request is closed." }, 409);
  }

  const { data: invitation } = await admin
    .from("restock_request_suppliers")
    .select("request_id")
    .eq("request_id", input.requestId)
    .eq("supplier_org_id", membership.organizationId)
    .maybeSingle();
  if (!invitation) return response(req, { error: "Your organization was not invited to this request." }, 403);

  const deliveryDate = new Date();
  deliveryDate.setUTCDate(deliveryDate.getUTCDate() + input.deliveryDays);
  const targetTotal = request.restock_request_lines.reduce(
    (total: number, line: { quantity: number; target_price: number }) =>
      total + line.quantity * Number(line.target_price),
    0
  );
  const quoteId = crypto.randomUUID();
  const quoteReference = reference("QUO");
  const quote = {
    id: quoteId,
    reference: quoteReference,
    request_id: input.requestId,
    supplier_org_id: membership.organizationId,
    supplier_alias: membership.aliasCode,
    total_price: input.totalPrice,
    delivery_days: input.deliveryDays,
    delivery_date: deliveryDate.toISOString().slice(0, 10),
    payment_terms: input.paymentTerms,
    score: scoreQuote(targetTotal, input.totalPrice, input.deliveryDays),
    submitted_by: userId,
    submitted_at: new Date().toISOString(),
  };

  const { data: savedQuote, error: quoteError } = await admin
    .from("restock_quotes")
    .upsert(quote, { onConflict: "request_id,supplier_org_id", ignoreDuplicates: false })
    .select("id, reference, score")
    .single();
  if (quoteError) throw quoteError;

  await admin
    .from("restock_sourcing_requests")
    .update({ status: "quoted" })
    .eq("id", input.requestId)
    .in("status", ["sent", "quoted"]);

  await notifyOrganization(admin, request.retailer_org_id, {
    type: "quote_received",
    title: "Supplier quote received",
    body: `${membership.aliasCode} submitted an offer for ${savedQuote.reference}.`,
    linkPath: "/auction/shop/requests",
  });
  await audit(admin, membership.organizationId, userId, "restock_quotes", savedQuote.id, "INSERT", {
    reference: savedQuote.reference,
    requestId: input.requestId,
  });

  return response(req, { data: savedQuote }, 201);
}

async function awardQuote(
  req: Request,
  admin: AdminClient,
  userId: string,
  input: Extract<z.infer<typeof requestSchema>, { action: "award_quote" }>
) {
  const membership = await getMembership(admin, userId);
  if (membership.accountType !== "retailer") {
    return response(req, { error: "Only retailer accounts can award quotes." }, 403);
  }

  const { data: request, error: requestError } = await admin
    .from("restock_sourcing_requests")
    .select("*, restock_request_lines(*)")
    .eq("id", input.requestId)
    .eq("retailer_org_id", membership.organizationId)
    .single();
  if (requestError) throw requestError;
  if (request.status === "awarded") {
    return response(req, { error: "This request has already been awarded." }, 409);
  }

  const { data: quote, error: quoteError } = await admin
    .from("restock_quotes")
    .select("*")
    .eq("id", input.quoteId)
    .eq("request_id", input.requestId)
    .eq("status", "submitted")
    .single();
  if (quoteError) throw quoteError;

  const totalQuantity = request.restock_request_lines.reduce(
    (total: number, line: { quantity: number }) => total + line.quantity,
    0
  );
  const summary =
    request.restock_request_lines.length === 1
      ? request.restock_request_lines[0].product_name
      : `${request.restock_request_lines[0].product_name} + ${request.restock_request_lines.length - 1} more`;
  const orderId = crypto.randomUUID();
  const orderReference = reference("ORD");

  const { error: orderError } = await admin.from("restock_orders").insert({
    id: orderId,
    reference: orderReference,
    request_id: request.id,
    quote_id: quote.id,
    buyer_org_id: membership.organizationId,
    supplier_org_id: quote.supplier_org_id,
    retailer_alias: membership.aliasCode,
    supplier_alias: quote.supplier_alias,
    product_summary: summary,
    quantity: totalQuantity,
    unit_price: Number(quote.total_price) / totalQuantity,
    total_price: quote.total_price,
    delivery_date: quote.delivery_date,
    courier_last_scan: "Ninja Van booking pending",
    created_by: userId,
  });
  if (orderError) {
    if (orderError.code === "23505") {
      return response(req, { error: "This request has already produced an order." }, 409);
    }
    throw orderError;
  }

  await admin.from("restock_order_items").insert(
    request.restock_request_lines.map(
      (line: { product_id: string; product_name: string; category: string; quantity: number }) => ({
        order_id: orderId,
        product_id: line.product_id,
        product_name: line.product_name,
        category: line.category,
        quantity: line.quantity,
        unit_price: Number(quote.total_price) / totalQuantity,
      })
    )
  );
  await admin.from("restock_fulfillment_events").insert([
    {
      order_id: orderId,
      actor_type: "system",
      event_type: "order_confirmed",
      title: "Order confirmed",
      detail: "Counterparty identities remain protected. Payout is held until verification.",
    },
    {
      order_id: orderId,
      actor_type: "ninja_van",
      event_type: "booking_pending",
      title: "Ninja Van booking requested",
      detail: "The protected pickup and delivery route is awaiting courier confirmation.",
    },
  ]);
  await admin
    .from("restock_sourcing_requests")
    .update({ status: "awarded", awarded_quote_id: quote.id })
    .eq("id", request.id);
  await admin.from("restock_quotes").update({ status: "awarded" }).eq("id", quote.id);
  await admin
    .from("restock_quotes")
    .update({ status: "declined" })
    .eq("request_id", request.id)
    .neq("id", quote.id)
    .eq("status", "submitted");

  await notifyOrganization(admin, quote.supplier_org_id, {
    type: "quote_awarded",
    title: "Quote awarded",
    body: `${orderReference} is confirmed and awaiting handoff proof.`,
    linkPath: "/auction/supplier/operations",
  });
  await audit(admin, membership.organizationId, userId, "restock_orders", orderId, "INSERT", {
    reference: orderReference,
    requestReference: request.reference,
  });

  return response(req, { data: { id: orderId, reference: orderReference } }, 201);
}

async function submitSupplierProof(
  req: Request,
  admin: AdminClient,
  userId: string,
  input: Extract<z.infer<typeof requestSchema>, { action: "submit_supplier_proof" }>
) {
  const membership = await getMembership(admin, userId);
  if (membership.accountType !== "supplier") {
    return response(req, { error: "Only the assigned supplier can submit handoff proof." }, 403);
  }
  if (!input.storagePath.startsWith(`${input.orderId}/supplier/`)) {
    return response(req, { error: "Invalid evidence path." }, 400);
  }

  const { data: order, error: orderError } = await admin
    .from("restock_orders")
    .select("*")
    .eq("id", input.orderId)
    .eq("supplier_org_id", membership.organizationId)
    .single();
  if (orderError) throw orderError;
  if (!["awaiting_supplier_proof", "awaiting_courier_pickup"].includes(order.verification_status)) {
    return response(req, { error: "Supplier proof is already locked for this order." }, 409);
  }

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
      return response(req, { error: "Supplier proof has already been submitted." }, 409);
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
    title: "Sealed handoff proof recorded",
    detail: `${input.quantity} units photographed before Ninja Van collection.`,
  });
  await notifyOrganization(admin, order.buyer_org_id, {
    type: "supplier_proof_recorded",
    title: "Supplier handoff proof ready",
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
      ? "Retailer evidence reports visible damage."
      : outcome === "wrong_items"
        ? "Retailer evidence reports a product mismatch."
        : outcome === "short"
          ? "Retailer evidence reports a quantity shortage."
          : "Retailer requested manual review.";
  const quantity =
    quantityDifference === 0
      ? "Both parties recorded the same quantity."
      : `Supplier proof records ${supplierQuantity} units and retailer proof records ${retailerQuantity}, a difference of ${Math.abs(quantityDifference)} units.`;
  const courier =
    courierStatus === "delivered"
      ? "Ninja Van recorded a completed delivery scan."
      : "A final Ninja Van delivery scan is missing.";
  return `${issue} ${quantity} ${courier} Payout remains on hold pending human review.`;
}

async function verifyDelivery(
  req: Request,
  admin: AdminClient,
  userId: string,
  input: Extract<z.infer<typeof requestSchema>, { action: "verify_delivery" }>
) {
  const membership = await getMembership(admin, userId);
  if (membership.accountType !== "retailer") {
    return response(req, { error: "Only the buying retailer can verify delivery." }, 403);
  }
  if (!input.storagePath.startsWith(`${input.orderId}/retailer/`)) {
    return response(req, { error: "Invalid evidence path." }, 400);
  }

  const { data: order, error: orderError } = await admin
    .from("restock_orders")
    .select("*, restock_delivery_proofs(*)")
    .eq("id", input.orderId)
    .eq("buyer_org_id", membership.organizationId)
    .single();
  if (orderError) throw orderError;
  if (order.courier_status !== "delivered" || order.verification_status !== "awaiting_shop_verification") {
    return response(req, { error: "This order is not ready for retailer verification." }, 409);
  }

  const supplierProof = order.restock_delivery_proofs.find(
    (proof: { actor_type: string }) => proof.actor_type === "supplier"
  );
  if (!supplierProof) {
    return response(req, { error: "Supplier handoff proof is missing." }, 409);
  }

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
      return response(req, { error: "Retailer proof has already been submitted." }, 409);
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
      title: accepted ? "Delivery verified by retailer" : "Delivery discrepancy reported",
      detail: accepted
        ? `${input.quantity} units photo-confirmed in good condition.`
        : `${input.quantity} units recorded with issue: ${input.outcome.replace("_", " ")}.`,
    },
    {
      order_id: order.id,
      actor_type: "system",
      event_type: accepted ? "payout_released" : "payout_held",
      title: accepted ? "Verification complete" : "Evidence review opened",
      detail: accepted
        ? "Supplier proof, Ninja Van scan, and retailer proof agree. Payout released."
        : `${disputeReference} created. Payout is held for independent review.`,
    },
  ]);
  await notifyOrganization(admin, order.supplier_org_id, {
    type: accepted ? "delivery_verified" : "dispute_opened",
    title: accepted ? "Delivery verified" : "Evidence review opened",
    body: accepted
      ? `${order.reference} was accepted and payout released.`
      : `${disputeReference} was opened for ${order.reference}.`,
    linkPath: "/auction/supplier/operations",
  });
  await audit(admin, membership.organizationId, userId, "restock_orders", order.id, "UPDATE", {
    verificationStatus: accepted ? "verified" : "disputed",
    disputeReference,
  });

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
    title: buyerRefund ? "Independent review: buyer refunded" : "Independent review: supplier upheld",
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
      title: "Evidence review resolved",
      body: `${dispute.reference} has been resolved. Open the order for the decision record.`,
      linkPath: "/auction/shop/orders",
    }),
    notifyOrganization(admin, order.supplier_org_id, {
      type: "dispute_resolved",
      title: "Evidence review resolved",
      body: `${dispute.reference} has been resolved. Open fulfillment for the decision record.`,
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
