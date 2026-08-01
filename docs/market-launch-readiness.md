# ReStock market launch readiness

Last audited: 1 August 2026

This is a go/no-go checklist for taking ReStock from a controlled pilot to a
commercial market launch in Singapore. It is an engineering and operations
assessment, not legal advice.

## Current position

The product has a coherent pilot flow: protected retailer and supplier aliases,
structured quote requests, sealed supplier quotes, transactional quote selection,
scheduled request expiry, idempotent workflow actions, Ninja Van tracking states,
supplier and retailer photo evidence, disputes, audit events, RLS-protected data,
and authenticated Edge Functions.

It is not ready to hold customer money or run without manual operations. The
highest-risk gaps are payment custody, courier booking, dispute staffing,
business verification, WhatsApp automation, legal documents, and operational
monitoring.

## P0 blockers before accepting real paid orders

- [ ] **Choose a payment model and licensed provider.** `payout_status` currently
  records a state only; ReStock does not collect, safeguard, refund, or release
  money. Obtain Singapore legal advice before describing funds as “held” or
  “escrow”. The Payment Services Act includes merchant acquisition and account
  issuance as regulated payment services and imposes safeguarding duties in
  relevant cases: <https://sso.agc.gov.sg/Act/PSA2019>.
- [ ] **Create Ninja Van delivery orders.** Selecting a quote currently creates a
  ReStock order and a “booking pending” event, but does not call Ninja Van's Order
  API. Complete sandbox testing, production integration review, address mapping,
  label/waybill generation, cancellation, retries, and tracking-number
  idempotency. Official API: <https://api-docs.ninjavan.co/>.
- [ ] **Staff disputes.** The production database currently has zero active
  reviewers. Add at least two trained reviewers, an escalation owner, response
  SLAs, conflict-of-interest rules, and an appeal path before enabling payout
  holds.
- [x] **Make quote award atomic.** Request creation, quote submission, and quote
  award now run in database transactions with authorization checks, row/advisory
  locks, idempotency keys, audit records, and a reliable courier-booking outbox.
- [ ] **Verify businesses.** Add KYB checks for legal entity, UEN, bank account,
  beneficial owner/contact, supplier product rights, required licences, and
  account suspension/reinstatement. Do not treat email confirmation as supplier
  verification.
- [ ] **Separate demo and production.** Public demo credentials are intentionally
  embedded in the site and currently use the same Supabase project. Move demos to
  an isolated project or synthetic tenant with automatic resets and strict quotas.
- [ ] **Use a dedicated production environment.** The current Supabase project
  contains unrelated application schemas/tables. Create separate development,
  staging, and production projects with independent keys, secrets, logs, backups,
  and change control.
- [ ] **Enable compromised-password protection.** The Supabase security advisor
  currently reports leaked password protection as disabled. Remediation:
  <https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection>.
- [ ] **Publish legal documents.** Terms for retailers, supplier terms, privacy
  notice, acceptable-use policy, marketplace/courier responsibilities, fees,
  cancellation/refund rules, dispute policy, prohibited goods, and data retention
  policy must be reviewed for the real operating model.
- [ ] **Implement PDPA operations.** Appoint and publish a DPO contact, document
  collection purposes and consent, access/correction/deletion handling, retention,
  overseas transfers, vendor agreements, and the breach response process. PDPC
  obligations: <https://www.pdpc.gov.sg/overview-of-pdpa/the-legislation/personal-data-protection-act/data-protection-obligations>.

## Quote and auction edge cases

- [ ] Define whether the product is a sealed RFQ, reverse auction, or negotiated
  quote process; use one term consistently in contracts and the interface.
- [ ] Decide whether retailers should see a target budget. Exposing it to every
  invited supplier can anchor bids and reduce price competition.
- [x] Add server-side request expiration and a scheduled job. PostgreSQL Cron now
  closes expired requests and their open quotes every five minutes.
- [ ] Define whether a retailer may award an already-submitted quote after the
  quote deadline and how long that quote remains binding.
- [ ] Add quote validity/expiry, GST inclusion, delivery fee, discounts, currency,
  minimum order, pack size, unit of measure, substitutes, and stock availability.
- [ ] Support item-level prices. A single quote total is currently divided evenly
  across all units, which is inaccurate for mixed-product orders and disputes.
- [ ] Decide whether partial quotes, split awards, multiple suppliers, backorders,
  and alternative quantities are allowed.
- [ ] Add supplier withdrawal and retailer cancellation flows with cut-off rules,
  reasons, notifications, and audit entries.
- [x] Preserve quote revisions instead of overwriting the prior quote. Every
  submission is retained with revision number, actor, values, and timestamp.
- [ ] Define tie-breaking and new-supplier treatment. A performance score of zero
  must not silently make a legitimate new supplier uncompetitive.
- [ ] Publish the fit-score inputs and weights. Test for manipulation, unintended
  bias, stale performance data, extreme prices, and impossible delivery promises.
- [ ] Detect collusion, duplicate supplier organizations, self-dealing, fake
  retailers, quote spam, and repeated no-award requests.
- [ ] Add approval thresholds for large orders and role-based authority so an
  operator cannot commit a business to an unlimited order.
- [ ] Re-check supplier status, stock, price, delivery feasibility, and retailer
  credit at award time—not only when the request or quote was created.

## Order creation edge cases

- [ ] Add SKU/barcode ownership and product-master governance; handle duplicate,
  missing, retired, or supplier-specific product codes.
- [ ] Support decimal quantities where relevant, cases/packs/pallets, weight,
  dimensions, temperature control, fragile/hazardous goods, and expiry dates.
- [ ] Validate realistic budgets, maximum order values, currency precision, GST,
  rounding, and negative/zero/overflow attempts on both client and server.
- [ ] Check delivery dates against supplier lead time, weekends, public holidays,
  receiving hours, blackout dates, and Ninja Van serviceability.
- [ ] Allow a retailer to save a draft, duplicate a previous order, edit before the
  deadline, and recover after a browser refresh or network loss.
- [x] Add idempotency to the live request, quote, and order-award actions so double
  taps and browser/network retries do not duplicate workflow records. Apply the
  same contract to future WhatsApp and payment processors before enabling them.
- [ ] Define what happens when all invited suppliers decline, ignore the request,
  lose stock, are suspended, or fail the minimum order value.

## WhatsApp ordering

The current site provides privacy-safe pre-filled WhatsApp messages from the home
page, order review, and quote confirmation. If
`NEXT_PUBLIC_RESTOCK_WHATSAPP_NUMBER` is configured, the chat opens directly with
ReStock; otherwise WhatsApp opens its share flow. This is assisted ordering, not
yet automated order ingestion.

Before calling WhatsApp a full ordering channel:

- [ ] Register and verify the company, WhatsApp Business Account, production phone
  number, display name, and Meta app; store access tokens only in backend secrets.
- [ ] Build an authenticated webhook endpoint for inbound messages and delivery
  receipts. Verify webhook challenges/signatures, deduplicate by message ID,
  process asynchronously, retry safely, and retain an audit trail.
- [ ] Capture explicit messaging opt-in and opt-out. Business-initiated messages
  must follow Meta's current template and quality rules; never message scraped or
  purchased numbers.
- [ ] Map a verified phone number to exactly one organization, with a secure flow
  for changed/shared numbers and employees who leave a business.
- [ ] Build a conversation state machine: identify retailer, capture items,
  quantities, budget, delivery date and notes, show a final summary, then require
  explicit confirmation before creating the request.
- [ ] Never award a supplier quote, release payment, or resolve a dispute from an
  ambiguous free-text reply such as “yes”. Use reference-bound confirmations.
- [ ] Handle voice notes, photos, PDFs, misspellings, mixed languages, unsupported
  products, multiple orders in one message, message edits/deletes, out-of-order
  messages, and conversations resumed after a long delay.
- [ ] Add human handoff, business hours, response SLA, agent ownership, internal
  notes, and a visible “talk to a person” path.
- [ ] Redact or restrict sensitive addresses, bank details, identity documents,
  and delivery evidence in logs, model prompts, analytics, and support tools.
- [ ] Ensure any AI extraction returns structured fields with confidence and
  requires human/user confirmation; do not let generated text become an order
  without deterministic validation.
- [ ] Monitor blocked messages, template rejection, quality-rating changes, token
  expiry, webhook downtime, duplicate delivery receipts, and Meta API version
  changes.

Meta states that users control business-message opt-in and that businesses using
the API initiate messages through approved templates. Meta's official webhook
reference also requires a public HTTPS endpoint:
<https://about.fb.com/news/2025/04/ways-to-manage-your-businesses-chats-on-whatsapp/>
and
<https://www.postman.com/meta/whatsapp-business-platform/folder/tduohwq/webhook-payload-reference>.

## Delivery and evidence edge cases

- [ ] Handle invalid/unserviceable addresses before booking and keep private
  addresses out of the counterparty-visible data model.
- [ ] Support one order across multiple parcels/tracking IDs and one parcel
  containing multiple order lines.
- [ ] Handle pickup failure, reschedule, shipper drop-off, delay, damaged parcel,
  lost parcel, refused delivery, return-to-sender, cancellation, and re-delivery.
- [ ] Treat courier webhooks as duplicated and out of order. Ninja Van explicitly
  warns that events may not arrive naturally ordered and retries failed delivery
  for up to two days.
- [ ] Acknowledge webhooks quickly and queue processing. Add dead-letter recovery,
  event replay, monitoring, and reconciliation against Ninja Van's API/dashboard.
- [ ] Archive courier proof images before external URLs expire; Ninja Van notes
  that proof image URLs expire after 90 days.
- [ ] Define acceptable supplier/retailer evidence: minimum image quality,
  timestamp, quantity coverage, packaging/label visibility, EXIF treatment,
  malware scanning, duplicate-image detection, and tamper review.
- [ ] Allow replacement evidence only with version history; never silently
  overwrite the original proof.

## Payments, refunds, and disputes

- [ ] Use a licensed payment provider and provider-side webhooks as the source of
  truth. Database labels alone must never cause financial ledger changes.
- [ ] Implement a double-entry ledger, immutable provider references,
  reconciliation, settlement reports, fees, GST invoices, failed payments,
  chargebacks, refunds, partial refunds, and payout failures.
- [ ] Define payout release timing, auto-release conditions, grace periods,
  retailer non-response, supplier appeal, and courier-delivered-but-shop-closed
  cases.
- [ ] Support item-level/quantity-level disputes and partial outcomes rather than
  only all-or-nothing order resolution.
- [ ] Require reason-specific evidence, show both parties the same case timeline,
  preserve messages, and prevent private identity leakage through uploads/text.
- [ ] Add reviewer assignment, separation of duties, conflict checks, SLA timers,
  escalation, appeal, and immutable resolution audit records.
- [ ] Define liability between ReStock, supplier, retailer, Ninja Van, and payment
  provider for loss, damage, perishables, prohibited goods, fraud, and force
  majeure.

## Security, privacy, and abuse

- [ ] Require MFA or passkeys for owners, payout changes, reviewers, and support
  administrators; add session/device management and rapid account revocation.
- [ ] Add rate limits and abuse controls to sign-up, onboarding, request creation,
  supplier invitations, quotes, uploads, WhatsApp, and webhooks.
- [ ] Test RLS for every role and cross-tenant combination, including suspended
  organizations, removed members, stale JWT claims, and reviewer access.
- [ ] Add file signature validation, decompression-bomb protection, malware
  scanning, safe image re-encoding, upload quotas, and storage lifecycle rules.
- [ ] Rotate secrets, use least privilege, prevent secrets in logs, and establish
  a documented incident response and credential-compromise process.
- [ ] Add privacy access/correction/deletion workflows while retaining only the
  records legally required for transactions and disputes.
- [ ] Contract and assess data intermediaries, including Supabase, Meta/WhatsApp,
  Ninja Van, payment processors, analytics, email, monitoring, and AI providers.
- [ ] Conduct penetration testing and threat modelling for BOLA/IDOR, broken role
  changes, webhook forgery, replay, mass assignment, injection, XSS, CSRF-like
  actions, open redirects, enumeration, and denial of service.

## Reliability and operations

- [ ] Define SLOs for sign-in, request creation, quote submission, award, booking,
  webhook lag, notifications, evidence upload, dispute response, and payout.
- [ ] Add structured logs, error monitoring, uptime checks, alert routing, audit
  dashboards, and synthetic tests for both retailer and supplier journeys.
- [ ] Configure tested backups, point-in-time recovery, restore drills, data export,
  disaster recovery targets, and a production rollback procedure.
- [ ] Load-test peak quote deadlines, large supplier invitations, photo uploads,
  webhook bursts, and dashboard polling. Replace broad polling where it creates
  unnecessary database load.
- [ ] Build operational tools for account suspension, order correction, courier
  reconciliation, payment reconciliation, manual notifications, and safe data
  repair with approvals.
- [ ] Add accessible responsive testing, supported-browser policy, slow/offline
  states, timezone checks, and localization for the actual launch audience.
- [ ] Create support runbooks and customer communications for outage, delayed
  delivery, payment delay, data breach, supplier failure, and disputed evidence.

## Recommended launch sequence

1. **Internal alpha:** synthetic data only; complete atomic award, expiry,
   monitoring, reviewer staffing, and demo isolation.
2. **Controlled pilot:** 5–10 verified shops and 3–5 verified suppliers; no
   ReStock custody of funds; manual payment/invoicing and manual Ninja Van booking
   with daily reconciliation.
3. **Paid private beta:** licensed payment provider, automated booking, staffed
   disputes, WhatsApp Business integration, signed contracts, and support SLA.
4. **Market launch:** security review, legal sign-off, load/restore exercises,
   operational dashboards, abuse controls, and measured pilot success criteria.

Do not move to the next stage based only on a successful demo. Require documented
owners, evidence, and sign-off for every P0 item.
