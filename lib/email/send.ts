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

const FROM = process.env.EMAIL_FROM ?? "AlFawz Academy <onboarding@resend.dev>";

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
    "Assalamu Alaikum — Welcome to AlFawz Academy",
    `<p>Assalamu Alaikum warahmatullahi wabarakaatuh ${escapeHtml(name)},</p>
     <h1 style="color: #0f4c81;"> Welcome to AlFawz Academy! 🌙 </h1> <p> We are delighted to welcome you to our learning community. </p> <p> Your <strong>AlFawz Academy</strong> account has been <strong>successfully created</strong>, and you can now access your student account and begin your learning journey with us. </p> <p> At AlFawz Academy, we are committed to nurturing students with <strong>authentic Islamic knowledge, sound character, and a love for the Qur’an and authentic Sunnah</strong>. </p><p> We pray that your time with us will be beneficial, inspiring, and a means of drawing closer to Allah ﷻ. </p> <div style="background: #f4f8fb; padding: 20px; border-radius: 8px; margin: 25px 0;"> <h3 style="color: #0f4c81; margin-top: 0;"> Your next step </h3> <p style="margin-bottom: 0;"> Log in to your account and explore your student dashboard to discover your available courses, learning resources, and academic activities. </p> </div> <p> May Allah ﷻ put barakah in your pursuit of knowledge, increase you in beneficial knowledge, and make what you learn a source of guidance and benefit for you, your family, and the wider Ummah. </p><p> <strong>Bārakallāhu fīk</strong>, and once again, welcome to <strong>AlFawz Academy</strong>. </p> <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;" /> <p style="text-align: center; color: #666; font-size: 14px;"> <strong>AlFawz Academy</strong><br /> Learning. Character. Faith. </p>`
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
     <p>We've received your ${label} of ${params.currency} ${params.amount.toLocaleString()}. Jazakumullahu khairan.</p>`
  );
}

export async function sendAlumniApprovedEmail(params: { to: string; name: string }) {
  await send(
    params.to,
    "Your AlFawz Academy alumni profile is live",
    `<p>Assalamu Alaikum ${escapeHtml(params.name)},</p>
     <p> We are delighted to let you know that your <strong>AlFawz Academy alumni registration</strong> has been reviewed and approved. </p> <p> Your alumni profile is now live on the AlFawz Academy Alumni page, allowing you to remain connected with the academy and fellow members of our growing alumni community. </p> <p> Thank you for taking the time to share your journey and remain connected with AlFawz Academy. Your story may inspire current and future students to pursue knowledge and strive for excellence. </p> <p> May Allah ﷻ bless your journey, increase you in beneficial knowledge, and make your contributions a lasting source of benefit. </p> <p> <strong>Jazākumullāhu khayran</strong> for being part of the AlFawz Academy family. </p> <p> <strong>AlFawz Academy</strong><br /> Learning. Character. Faith. </p>`
  );
}

export async function sendPasswordResetEmail(params: { to: string; resetUrl: string }) {
  await send(
    params.to,
    "Reset your AlFawz Academy password",
    `<p>Assalamu Alaikum,</p> <p> We received a request to reset the password for your <strong>AlFawz Academy</strong> account. </p> <p> If you made this request, click the button below to create a new password: </p> <p style="margin:25px 0;"> <a href="${params.resetUrl}" style=" display:inline-block; padding:12px 22px; background:#0f4c81; color:#ffffff; text-decoration:none;border-radius:6px; font-weight:bold; " > Reset My Password </a> </p> <p> For your security, this password-reset link will expire in <strong>1 hour</strong>. </p> <p> If you did not request a password reset, you can safely ignore this email. Your account password will remain unchanged. </p><p> May Allah ﷻ keep you, your account and personal information safe & secure. </p> <p> <strong>AlFawz Academy</strong><br /> Learning. Character. Faith. </p>
     ${params.resetUrl}</a></p>`
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
     <div style="background:#f4f8fb;padding:18px;border-radius:8px;margin:20px 0;"> <h3 style="margin-top:0;color:#0f4c81;"> Complete Your Account </h3> <p style="margin-bottom:0;"> Please set a password using the button below to activate access to your sponsor dashboard. </p> 
     <p>Once set, log in any time at the link above's domain using this email address.</p>
     </div>
     <p style="margin:25px 0;"> <a href="${params.setupUrl}" style=" display:inline-block; padding:12px 22px; background:#0f4c81; color:#ffffff; text-decoration:none; border-radius:6px; font-weight:bold; " > Set Up My Sponsor Account </a> </p>
     <p><a href="${params.setupUrl}">${params.setupUrl}</a></p>
     <p> For your security, this setup link will expire in <strong>1 hour</strong>. </p>
      <p> Your generosity can help provide opportunities for students to pursue beneficial Islamic education. May Allah ﷻ accept your contribution, place barakah in your wealth, and reward you for every good that comes from your support. </p>
      <p> <strong>Jazākumullāhu khayran</strong> for partnering with AlFawz Academy in this important mission. </p> <p> <strong>AlFawz Academy</strong><br /> Learning. Character. Faith. </p>
     `
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
