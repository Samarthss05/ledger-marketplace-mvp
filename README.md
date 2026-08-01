# ReStock by Ledger

Production-oriented procurement and fulfillment for independent retailers and
suppliers. Counterparties operate through protected aliases; Ninja Van provides
the delivery chain of custody; both parties submit private photo evidence.

## Workflow

1. A retailer creates a structured RFQ and invites verified supplier aliases.
2. Suppliers submit complete quotes. ReStock ranks price and delivery fit.
3. The retailer awards one quote and an order is created with payout held.
4. The supplier photographs sealed stock before Ninja Van collection.
5. Ninja Van webhook events update pickup, transit, and delivery state.
6. The retailer photographs received stock and accepts it or opens a dispute.
7. Accepted orders release the payout state. Disputes enter independent review.

Legal names, phone numbers, and addresses are restricted to the owning
organization and backend logistics services. They are not exposed to the other
party.

## Stack

- Next.js static frontend deployed to GitHub Pages
- Supabase Auth, Postgres, Row Level Security, private Storage, and Edge Functions
- `restock-workflow` authenticated command boundary
- `ninjavan-webhook` raw-body HMAC verification and idempotent courier events

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
- Configure the payment provider that moves funds; database payout states are an
  auditable workflow control and do not themselves transfer money.

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
