# ReStock by Ledger

Production-oriented procurement and fulfillment for independent retailers and
suppliers. Counterparties operate through protected aliases; Ninja Van provides
the delivery chain of custody; both parties submit private photo evidence.

## Workflow

1. A retailer creates a structured RFQ and invites verified supplier aliases.
2. Suppliers submit complete quotes. ReStock ranks price and delivery fit.
3. The retailer awards one quote and pays through Stripe Checkout. PayNow is the
   lower-cost default; card checkout shows its transaction fee before payment.
4. Stripe holds the platform charge while the supplier prepares the order.
5. The supplier photographs sealed stock before Ninja Van collection.
6. Ninja Van webhook events update pickup, transit, and delivery state.
7. The retailer photographs received stock and accepts it or opens a dispute.
8. Acceptance creates an idempotent Stripe Connect transfer to the supplier.
   A buyer-approved dispute queues a provider refund instead.

Legal names, phone numbers, and addresses are restricted to the owning
organization and backend logistics services. They are not exposed to the other
party.

## Stack

- Next.js static frontend deployed to GitHub Pages
- Supabase Auth, Postgres, Row Level Security, private Storage, and Edge Functions
- `restock-workflow` authenticated command boundary
- `ninjavan-webhook` raw-body HMAC verification and idempotent courier events
- Stripe Connect Express, Stripe Checkout, signed webhooks, and durable
  transfer/refund operations

## Local development

```bash
cp .env.example .env.local
npm ci
npm run dev
```

Quality gates:

```bash
npm run lint
npm run typecheck
npm run build
npm audit --omit=dev --audit-level=high
```

## Backend operations

Database changes live in `supabase/migrations`. Edge Functions live in
`supabase/functions`.

The following production configuration is required outside source control:

- Add `NINJAVAN_CLIENT_SECRET` to Supabase Edge Function secrets.
- Register
  `https://mlhjwbzxqvszfizaxzex.supabase.co/functions/v1/ninjavan-webhook`
  as the Ninja Van webhook URL.
- Add approved reviewer user IDs to `public.restock_reviewers`.
- Add `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` to Supabase Edge Function
  secrets. Use test-mode keys until the complete pilot has passed.
- Register
  `https://mlhjwbzxqvszfizaxzex.supabase.co/functions/v1/stripe-webhook`
  as a `2026-02-25.clover` Stripe webhook endpoint. Subscribe to
  `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
  `checkout.session.expired`, `checkout.session.async_payment_failed`,
  `payment_intent.payment_failed`, `account.updated`,
  `charge.dispute.created`, `refund.updated`, and `refund.failed`.
- Set `RESTOCK_APP_URL` to the deployed application base URL. The default fee
  configuration charges retailers 1.90% + S$0.50 for PayNow or 4.10% + S$1.00
  for cards; change the `RESTOCK_*_FEE_*` secrets only after commercial and legal
  review.

Retailer fees are calculated on the server, saved with the order, and shown as a
separate Checkout line item. Supplier payout equals the awarded quote subtotal;
ReStock receives the difference. The application uses separate charges and
transfers so delivery acceptance controls payout. Do not market this as escrow
without Singapore legal advice.

The reviewer portal is `/auction/review`. Access is denied unless the signed-in
user is active in `restock_reviewers`.

## WhatsApp-assisted ordering

The home page, order review, and quote confirmation can open privacy-safe,
pre-filled WhatsApp messages. Set the public GitHub Actions repository variable
`RESTOCK_WHATSAPP_NUMBER` to the ReStock WhatsApp Business number in international
format without `+` or spaces. Without it, WhatsApp opens its share flow.

This click-to-chat experience does not ingest messages or create orders. A full
WhatsApp Business Platform integration still requires a verified business number,
backend webhooks, opt-in/template compliance, idempotent message processing, order
confirmation, and human handoff.

See [the market launch readiness checklist](docs/market-launch-readiness.md) before
accepting real orders or payments.

## Deployment

Pushes to `main` run dependency audit, lint, type checking, a static production
build, and GitHub Pages deployment. The Pages environment must allow `main` to
deploy.
