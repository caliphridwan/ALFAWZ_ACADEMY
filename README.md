# AlFawz Academy — Platform

Online Islamic education platform: course catalogue, student/sponsor/admin
dashboards, Paystack-powered payments and sponsorships.

> **Status:** Stage 1 of the build — project scaffold, database schema,
> authentication, and the full Paystack payment/webhook pipeline. Marketing
> pages, dashboards UI, and admin screens are being layered on in follow-up
> stages (see the implementation plan below).

## Tech stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Prisma ·
PostgreSQL · NextAuth (Auth.js) · Zod · Paystack · Resend.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in real values — see below
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

## Environment variables

See `.env.example` for the full list. Notes on the sensitive ones:

- **`DATABASE_URL`** — your PostgreSQL connection string (Neon, Supabase, or
  any Postgres host).
- **`AUTH_SECRET`** — generate with `openssl rand -base64 32`.
- **`PAYSTACK_SECRET_KEY`** / **`NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`** — from
  your Paystack dashboard under Settings → API Keys & Webhooks. Use **test**
  keys locally. Set the **live** keys only in your production host's
  environment variable settings (never in a file you commit or share).

## Database

Schema lives in `prisma/schema.prisma` (Section 40 of the project spec — every
model: `User`, `Guardian`, `Course`, `Enrollment`, `Payment`, `Sponsorship`,
`SponsorProfile`, `Teacher`, `Testimonial`, `Event`, `ContactMessage`,
`SiteSettings`).

```bash
npx prisma migrate dev --name <description>   # create a migration
npx prisma migrate deploy                     # apply migrations in production
npm run db:studio                             # browse data visually
```

`prisma/seed.ts` creates clearly-labeled **demo accounts** for local dev:

| Role    | Email                        | Password         |
|---------|-------------------------------|-------------------|
| Admin   | admin@demograph.alfawzacademy.local       | DemoAdmin2453!     |
| Student | student@demograph.alfawzacademy    | DemoStudent540!   |
| Sponsor | sponsor@demograph.alfawz     | DemoSponsor1293!   |

**Do not run the seed script against a production database.**

## Paystack setup

1. Create a Paystack account (or use your existing one) and grab your
   **test** API keys from Settings → API Keys & Webhooks.
2. Add them to `.env.local` as `PAYSTACK_SECRET_KEY` and
   `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`.
3. In the same dashboard page, set your **webhook URL** to:
   `https://yourdomain.com/api/webhooks/paystack`
4. Paystack signs every webhook with your secret key
   (`x-paystack-signature`, HMAC-SHA512) — verified in
   `lib/paystack/webhook-verify.ts`. Requests that fail this check are
   rejected with 401 before anything is processed.
5. Payment flow, end to end:
   - `POST /api/payments/paystack/initialize` (course) or
     `/api/sponsorship/initialize` (sponsorship) creates a `PENDING` payment
     row using the price stored in **our own database** (never a client-sent
     amount), then asks Paystack for a checkout URL.
   - After checkout, Paystack redirects to a callback page, which calls
     `GET /api/payments/paystack/verify?reference=...` — this hits
     Paystack's `/transaction/verify` endpoint server-side. This is the only
     thing allowed to mark a payment successful.
   - `POST /api/webhooks/paystack` is the belt-and-braces path in case the
     student closes the tab before the callback runs. Both paths funnel
     through `lib/paystack/apply-payment.ts`, which is idempotent — running
     it twice for the same reference is a safe no-op.
6. Test with Paystack's test cards before going live:
   https://paystack.com/docs/payments/test-payments

## Email

`lib/email/send.ts` wraps Resend. Without `EMAIL_API_KEY` set, emails are
logged to the console instead of sent, so local dev works without an email
provider. Swap providers by editing that one file.

## Role-based access

`middleware.ts` protects `/dashboard/*`, `/admin/*`, and
`/sponsor/dashboard/*` by role at the edge. Every server action and API route
that mutates data **also** checks `getServerSession()` independently —
middleware alone is never sufficient authorization.

## Deployment (Vercel)

1. Push this repo to GitHub/GitLab/Bitbucket and import it in Vercel.
2. Add all variables from `.env.example` in Project Settings → Environment
   Variables (use your **live** Paystack keys here for production only).
3. Provision a PostgreSQL database (Neon or Supabase both work well with
   Vercel) and set `DATABASE_URL`.
4. Vercel will run `npm run build`, which runs `prisma generate` then
   `next build` (see `package.json`).
5. Run `npx prisma migrate deploy` against the production database (via a
   one-off job or Vercel's deploy hooks).
6. Update your Paystack webhook URL to your production domain.

## Production security checklist

- [ ] `PAYSTACK_SECRET_KEY` is set only as a server environment variable —
      confirm it never appears in any client bundle or `NEXT_PUBLIC_*` var.
- [ ] Webhook signature verification is enabled and tested with a
      deliberately-wrong signature (should get 401).
- [ ] `AUTH_SECRET` is a strong, unique value (not the example).
- [ ] Seed/demo accounts are **not** present in the production database.
- [ ] Rate limiting is added in front of `/api/auth/*`, `/api/payments/*`,
      and `/api/sponsorship/*` (e.g. via your host or a middleware library)
      before high-traffic launch.
- [ ] Database backups are configured with your Postgres host.
- [ ] `.env.local` / any file with real secrets is in `.gitignore` (already
      included) and was never committed.

## Implementation plan (full spec)

1. ✅ Scaffold, schema, seed data
2. ✅ Auth (registration with guardian logic, login, RBAC middleware)
3. ✅ Paystack initialize / verify / webhook (course + sponsorship)
4. ✅ Navbar, footer, homepage, course catalogue + detail page, about page
5. ✅ Student dashboard shell (overview + my courses), payment callback page
6. ✅ Login/registration UI forms, forgot/reset password
7. ✅ Dashboard: payments history + receipts, profile (edit + password change)
8. ✅ Public Sponsors page + sponsorship calculator UI + sponsor dashboard
9. ✅ Admin dashboard (overview + analytics, students, courses CRUD,
   payments, sponsors/sponsorships, settings, contact messages)
10. ✅ Teachers, Events, Testimonials — public pages + full admin CRUD;
    public Contact form (stores + emails admin); FAQ page
11. ✅ Sitemap, robots.txt, structured data (EducationalOrganization, Course,
    Event), error pages (404, 500, unauthorized, maintenance)
12. ✅ QA/security test checklist — see `docs/QA-CHECKLIST.md`

All 12 stages of the initial build are complete. See `docs/QA-CHECKLIST.md`
before going live — every test case from Section 72 of the spec is mapped
to the exact code path that handles it, with instructions for running it
against real Paystack test keys.
