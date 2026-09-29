# QA & Security Test Checklist

This maps every test case from Section 72 of the project spec to the code
that's responsible for it, plus how to actually run the test once you have
a database and Paystack test keys connected. Nothing here is simulated —
each check exercises the real code path.

## Student flows

| Test | Responsible code | How to verify |
|---|---|---|
| Registration | `app/(auth)/register/actions.ts` | Register with a real email; confirm a `User` row is created with a bcrypt `passwordHash` (never plaintext) via `npm run db:studio`. |
| Login | `lib/auth/auth-options.ts` | Log in with the seeded demo student. Try a wrong password — should fail without revealing whether the email exists. |
| Course selection | `app/(marketing)/courses/[slug]/page.tsx` | Browse `/courses`, open a course, confirm price/duration match the DB record, not hardcoded text. |
| Payment initialization | `app/api/payments/paystack/initialize/route.ts` | Click Enroll Now while logged in; confirm a `Payment` row is created with status `PENDING` *before* redirecting to Paystack. |
| Successful Paystack payment | `lib/paystack/apply-payment.ts` via `app/api/payments/paystack/verify/route.ts` | Use a Paystack test card (paystack.com/docs/payments/test-payments). After redirect, confirm `Payment.status` → `SUCCESSFUL` and `Enrollment.status` → `ACTIVE`. |
| Failed payment | `applyVerifiedPayment` (`marked_failed` branch) | Use Paystack's test card configured to decline. Confirm `Payment.status` → `FAILED`, no enrollment activated. |
| Cancelled payment | Callback page (`app/dashboard/payments/callback/page.tsx`) | Abandon checkout on the Paystack page. Confirm the callback page shows the "couldn't confirm" state, not a false success. |
| Duplicate webhook | `applyVerifiedPayment`'s `already_processed` guard | Manually replay the same webhook payload twice (Paystack dashboard → webhook logs → resend, or `curl` with a captured signature). Confirm the second call is a no-op and no double-activation occurs. |
| Refresh after payment | Callback page | Refresh `/dashboard/payments/callback?reference=...` after a successful payment. Confirm it re-verifies and still shows success (idempotent), doesn't error. |
| Payment verification | `lib/paystack/client.ts` → `verifyTransaction` | Confirm this hits Paystack's real `/transaction/verify` endpoint — check server logs for the outbound call. |
| Enrollment activation | `applyVerifiedPayment` | Confirm `Enrollment.status` flips to `ACTIVE` only after verification, never on the client's say-so. |

## Sponsor flows

| Test | Responsible code | How to verify |
|---|---|---|
| Sponsor one / multiple / custom students | `components/sponsorship/calculator.tsx` | Try 1, 5, 10, and a custom number (e.g. 17). Confirm the total = count × `SiteSettings.sponsorshipPrice`, not a client-computed guess sent to the server. |
| Successful payment | `app/api/sponsorship/initialize/route.ts` + `apply-payment.ts` | Complete a sponsorship checkout with a Paystack test card; confirm `Sponsorship.status` → `ACTIVE`. |
| Failed payment | Same as above | Use a declining test card; confirm `Sponsorship.status` stays `PENDING`/payment `FAILED`. |
| Anonymous sponsor | `app/(marketing)/sponsors/page.tsx` | Sponsor without checking "display publicly"; confirm the sponsors page shows "Anonymous Sponsor" with the correct student count, and that no name/email leaks in the page source. |
| Public sponsor | Same page | Sponsor with the checkbox on; confirm the chosen public name appears. |
| Duplicate payment | `applyVerifiedPayment` idempotency guard | Same replay test as course payments — a second webhook for the same reference must not double the sponsorship or resend confirmation twice. |
| Webhook processing | `app/api/webhooks/paystack/route.ts` | Check server logs to confirm the webhook independently re-verifies via `verifyTransaction` rather than trusting the payload's own status field. |
| Sponsorship activation | `applyVerifiedPayment` | Confirm activation happens from the *verified* Paystack response, not from `Sponsorship.create` time. |

## Security

| Attack | Where it's stopped | How to verify |
|---|---|---|
| Fake payment status (client claims success) | `applyVerifiedPayment` only trusts `verifyTransaction`'s server-to-server response | Try calling `/api/payments/paystack/verify?reference=<fake>` with a reference that was never paid — should return `failed`/404, never `success`. |
| Modified payment amount | Amount-mismatch check in `apply-payment.ts` | This can't be triggered from the client at all — the amount charged is read from the `Course`/`SiteSettings` record server-side, never from client input. Confirm by inspecting `initialize/route.ts`: the request body only carries a `courseId`, never a price. |
| Unauthorized admin access | `middleware.ts` + `requireAdmin()` in every admin server action | Log in as the seeded demo **student**, try navigating to `/admin` → should redirect to `/unauthorized`. Then try calling an admin server action directly (e.g. via browser devtools) — `requireAdmin()` throws. |
| Unauthorized student access | `middleware.ts` (dashboard role check) | Log in as the seeded demo **sponsor**, try `/dashboard` → redirected to `/sponsor/dashboard`. |
| Invalid course ID | `initialize/route.ts`'s course lookup | POST a random UUID as `courseId` → 404, no payment row created. |
| Duplicate transaction | Unique constraint on `Payment.reference` + idempotency guard | Attempt to reuse a reference — Prisma's unique constraint prevents a second row; the apply-payment guard prevents double-processing even if one somehow existed. |
| Forged webhook | `lib/paystack/webhook-verify.ts` HMAC check | POST to `/api/webhooks/paystack` with a made-up signature header → 401, request never reaches `applyVerifiedPayment`. |

## Before going live

- [ ] Run through every row above against Paystack **test** keys first.
- [ ] Confirm `PAYSTACK_SECRET_KEY` never appears in any client-side bundle
      (search the built `.next/static` output for the string `sk_` — it
      should find nothing).
- [ ] Confirm the webhook URL in the Paystack dashboard points at your real
      production domain before switching to live keys.
- [ ] Re-run the "Forged webhook" and "Modified payment amount" tests one
      more time against production before announcing launch.
