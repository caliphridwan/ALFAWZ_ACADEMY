import "server-only";
import { Resend } from "resend";

/**
 * Section 43: email provider is kept swappable — every call in this file
 * goes through the small functions below, so switching from Resend to
 * SendGrid/Postmark later only means rewriting this one file.
 */
function getClient() {
  const apiKey = process.env.EMAIL_API_KEY;
  if (!apiKey) {
    console.warn("EMAIL_API_KEY not set — emails will be logged, not sent.");
    return null;
  }
  return new Resend(apiKey);
}

const FROM = process.env.EMAIL_FROM ?? "AlFawz Academy <noreply@alfawzacademy.example>";

async function send(to: string, subject: string, html: string) {
  const client = getClient();
  if (!client) {
    console.log(`[dev email] to=${to} subject="${subject}"`);
    return;
  }
  await client.emails.send({ from: FROM, to, subject, html });
}

export async function sendWelcomeEmail({ to, name }: { to: string; name: string }) {
  await send(
    to,
    "Assalamu Alaikum warahmatullahi wabarakaatuh— Welcome to AlFawz Academy",
    `<p>Assalamu Alaikum ${escapeHtml(name)},</p>
     <p>Welcome to AlFawz Academy. Your account has been created successfully.</p>`
  );
}

export async function sendEnrollmentConfirmationEmail(params: {
  to: string;
  name: string;
  courseTitle: string;
}) {
  await send(
    params.to,
    `Enrollment confirmed: ${params.courseTitle}`,
    `<p>Assalamu Alaikum ${escapeHtml(params.name)},</p>
     <p>Your enrollment in <strong>${escapeHtml(params.courseTitle)}</strong> is now active.</p>`
  );
}

export async function sendPaymentConfirmationEmail(params: {
  to: string;
  name: string;
  amount: number;
  currency: string;
  type: "COURSE" | "SPONSORSHIP";
}) {
  const label = params.type === "COURSE" ? "course payment" : "sponsorship";
  await send(
    params.to,
    "Payment confirmed — AlFawz Academy",
    `<p>Assalamu Alaikum ${escapeHtml(params.name)},</p>
     <p>We've received your ${label} of ${params.currency} ${params.amount.toLocaleString()}. Jazakallahu khairan.</p>`
  );
}

export async function sendAlumniApprovedEmail(params: { to: string; name: string }) {
  await send(
    params.to,
    "Your AlFawz Academy alumni profile is live",
    `<p>Assalamu Alaikum ${escapeHtml(params.name)},</p>
     <p>Your alumni registration has been approved and now appears on the AlFawz Academy Alumni page. Jazakumullahu khairan for sharing your story.</p>`
  );
}

export async function sendPasswordResetEmail(params: { to: string; resetUrl: string }) {
  await send(
    params.to,
    "Reset your AlFawz Academy password",
    `<p>Click the link below to reset your password. This link expires in 1 hour.</p>
     <p><a href="${params.resetUrl}">${params.resetUrl}</a></p>`
  );
}

/**
 * Sent once, right after a sponsor's first successful sponsorship payment —
 * their account is created automatically at checkout but has no password
 * yet, so this is how they find out an account exists at all and get set
 * up to log in and see their sponsor dashboard.
 */
export async function sendSponsorWelcomeEmail(params: {
  to: string;
  name: string;
  setupUrl: string;
}) {
  await send(
    params.to,
    "Welcome to AlFawz Academy — set up your sponsor dashboard",
    `<p>Assalamu Alaikum ${escapeHtml(params.name)},</p>
     <p>Jazakumullahu khairan for your sponsorship. An account has been created for you so you can track your impact, view receipts, and manage future sponsorships.</p>
     <p>Set a password to access it (this link expires in 1 hour):</p>
     <p><a href="${params.setupUrl}">${params.setupUrl}</a></p>
     <p>Once set, log in any time at the link above's domain using this email address.</p>`
  );
}

export async function sendContactNotificationToAdmin(params: {
  adminEmail: string;
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  await send(
    params.adminEmail,
    `New contact message: ${params.subject}`,
    `<p>From: ${escapeHtml(params.name)} (${escapeHtml(params.email)})</p>
     <p>${escapeHtml(params.message)}</p>`
  );
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
