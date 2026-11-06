// Calls one of the app's protected /api/cron/* routes. Used by the Render cron
// services (see render.yaml) instead of a bare curl, so that
//  - a messy APP_URL ("alfawzacademy.com", a trailing slash, quotes, spaces) still works,
//  - a missing APP_URL / CRON_SECRET is reported in plain words,
//  - a sleeping or briefly unavailable site is retried before the run counts as failed,
//  - the log shows the real HTTP status and response body.
//
// Usage: node scripts/cron-ping.mjs class-reminders

const job = process.argv[2];
if (!job || !/^[a-z-]+$/.test(job)) {
  console.error("Usage: node scripts/cron-ping.mjs <job-name>, for example class-reminders");
  process.exit(2);
}

const clean = (v) => (v ?? "").trim().replace(/^["']+|["']+$/g, "").trim();

let base = clean(process.env.APP_URL) || clean(process.env.NEXT_PUBLIC_APP_URL);
const secret = clean(process.env.CRON_SECRET);

if (!base) {
  console.error("APP_URL is not set on this cron service. Add APP_URL=https://alfawzacademy.com in this service's Environment tab.");
  process.exit(2);
}
if (!secret) {
  console.error("CRON_SECRET is not set on this cron service. Copy the CRON_SECRET value from the alfawz-academy web service's Environment tab.");
  process.exit(2);
}
if (!/^https?:\/\//i.test(base)) base = `https://${base}`;
base = base.replace(/\/+$/, "");

const url = `${base}/api/cron/${job}`;
const attempts = 3;
const waits = [0, 8000, 20000];

for (let i = 0; i < attempts; i++) {
  if (waits[i]) await new Promise((r) => setTimeout(r, waits[i]));
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}` },
      signal: AbortSignal.timeout(90_000),
      redirect: "follow",
    });
    const body = (await res.text()).slice(0, 400);
    console.log(`[${job}] attempt ${i + 1}: ${res.status} ${body}`);
    if (res.ok) process.exit(0);
    if (res.status === 401) {
      console.error("401 Unauthorized: CRON_SECRET here does not match CRON_SECRET on the web service (or the web service has none).");
      process.exit(1); // retrying will not help
    }
  } catch (err) {
    console.error(`[${job}] attempt ${i + 1} failed to connect to ${url}: ${err?.cause?.code ?? err?.name ?? ""} ${err?.message ?? err}`);
  }
}
console.error(`[${job}] gave up after ${attempts} attempts.`);
process.exit(1);
