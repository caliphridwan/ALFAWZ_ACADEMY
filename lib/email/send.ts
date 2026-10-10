
import "server-only";
import { Resend } from "resend";

/**
 * AlFawz Academy Email Service
 * All email delivery goes through the shared send() helper.
 */

function getClient() {
  const apiKey = process.env.EMAIL_API_KEY;

  if (!apiKey) {
    console.warn("EMAIL_API_KEY not set — emails will be logged, not sent.");
    return null;
  }

  return new Resend(apiKey);
}

const FROM =
  process.env.EMAIL_FROM ?? "AlFawz Academy <onboarding@resend.dev>";

const BRAND = "#1d4ed8";
const BRAND_DARK = "#1e40af";
const TEXT = "#1e293b";
const MUTED = "#64748b";
const LIGHT_BG = "#f8fafc";

/**
 * Shared HTML email layout.
 */
function emailLayout(content: string) {
  return `
    <div style="margin:0;padding:24px 12px;background:${LIGHT_BG};font-family:Arial,Helvetica,sans-serif;color:${TEXT};line-height:1.8;">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">

        <div style="background:${BRAND};padding:26px 24px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:25px;line-height:1.4;">
            AlFawz Academy
          </h1>
          <p style="margin:7px 0 0;color:#dbeafe;font-size:13px;letter-spacing:1px;">
            LEARNING. CHARACTER. FAITH.
          </p>
        </div>

        <div style="padding:28px 24px;">
          ${content}
        </div>

        <div style="padding:20px 24px;background:#f1f5f9;text-align:center;border-top:1px solid #e2e8f0;">
          <p style="margin:0;color:${BRAND_DARK};font-size:14px;font-weight:bold;">
            AlFawz Academy
          </p>
          <p style="margin:4px 0 0;color:${MUTED};font-size:12px;">
            Nurturing knowledge, strengthening faith, building character.
          </p>
        </div>

      </div>
    </div>
  `;
}

/**
 * Shared email delivery helper.
 */
async function send(to: string, subject: string, html: string) {
  const client = getClient();

  if (!client) {
    console.log(`[dev email] to=${to} subject="${subject}"`);
    return;
  }

  const { error } = await client.emails.send({
    from: FROM,
    to,
    subject,
    html,
  });

  if (error) {
    console.error("Failed to send email:", error);
    throw new Error("Email delivery failed.");
  }
}

/**
 * Welcome email for newly registered users.
 */
export async function sendWelcomeEmail({
  to,
  name,
}: {
  to: string;
  name: string;
}) {
  await send(
    to,
    "Assalamu Alaikum — Welcome to AlFawz Academy",
    emailLayout(`
      <div style="text-align:center;margin-bottom:28px;">
        <div style="font-size:42px;margin-bottom:8px;">🌙</div>
        <h2 style="margin:0;color:${BRAND};font-size:26px;">
          Welcome to AlFawz Academy!
        </h2>
        <p style="margin:10px 0 0;color:${MUTED};font-size:14px;">
          Your journey toward beneficial knowledge begins here.
        </p>
      </div>

      <p>
        Assalamu Alaikum wa Rahmatullahi wa Barakatuh,
        ${escapeHtml(name)},
      </p>

      <p>
        We are delighted to welcome you to the
        <strong>AlFawz Academy family!</strong> Your account has been
        successfully created, and you can now access your student account
        and begin your learning journey with us.
      </p>

      <p>
        At AlFawz Academy, we are committed to nurturing students with
        <strong>authentic Islamic knowledge, sound character, and a deep love
        for the Qur'an and authentic Sunnah.</strong>
      </p>

      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-left:5px solid ${BRAND};padding:20px;margin:24px 0;border-radius:10px;">
        <h3 style="color:${BRAND_DARK};margin:0 0 8px;font-size:17px;">
          Your Next Step
        </h3>
        <p style="margin:0;">
          Log in to your account and explore your student dashboard to discover
          available courses, learning resources, and academic activities.
        </p>
      </div>

      <p>
        We pray that your time with us will be beneficial, inspiring, and
        a means of drawing closer to Allah ﷻ.
      </p>

      <p>
        May Allah ﷻ place barakah in your pursuit of knowledge, increase you
        in beneficial knowledge, and make what you learn a source of guidance
        and benefit for you, your family, and the wider Ummah.
      </p>

      <p>
        <strong>Bārakallāhu fīk.</strong> Once again, welcome to
        <strong>AlFawz Academy.</strong>
      </p>
    `)
  );
}

/**
 * Enrollment confirmation email.
 */
export async function sendEnrollmentConfirmationEmail(params: {
  to: string;
  name: string;
  courseTitle: string;
}) {
  await send(
    params.to,
    `Enrollment confirmed: ${params.courseTitle}`,
    emailLayout(`
      <div style="text-align:center;padding:4px 0 24px;">
        <div style="font-size:42px;margin-bottom:10px;">🎓</div>

        <h2 style="color:${BRAND};margin:0;font-size:26px;line-height:1.4;">
          Alhamdulillah! You're Enrolled!
        </h2>

        <p style="color:${MUTED};font-size:14px;margin:10px 0 0;">
          Your journey toward beneficial knowledge begins here.
        </p>
      </div>

      <p>
        Assalamu Alaikum wa Rahmatullahi wa Barakatuh,
        ${escapeHtml(params.name)},
      </p>

      <p>
        Congratulations! We are delighted to confirm that your enrollment in
        <strong style="color:${BRAND};">
          ${escapeHtml(params.courseTitle)}
        </strong>
        has been successfully activated.
      </p>

      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-left:5px solid ${BRAND};padding:20px;margin:24px 0;border-radius:10px;">
        <p style="margin:0 0 8px;font-size:17px;font-weight:bold;color:${BRAND_DARK};">
          ✓ Your Enrollment Is Confirmed!
        </p>

        <p style="margin:0;color:#334155;">
          You are all set to begin your learning journey with AlFawz Academy.
          Get ready to deepen your understanding of Islam, strengthen your
          connection with the Qur'an, and grow in beneficial knowledge.
        </p>
      </div>

      <p>
        At <strong>AlFawz Academy</strong>, we believe that seeking knowledge
        is a noble journey that transforms hearts, builds character, and brings
        us closer to Allah. We are honoured to accompany you on this path.
      </p>

      <div style="background:#f8fafc;border-left:4px solid #93c5fd;padding:16px 18px;margin:24px 0;border-radius:6px;">
        <p style="font-size:16px;font-style:italic;color:#334155;margin:0 0 8px;">
          "And say, 'My Lord, increase me in knowledge.'"
        </p>
        <p style="font-size:13px;color:${BRAND_DARK};font-weight:bold;margin:0;">
          — Qur'an 20:114
        </p>
      </div>

      <p>
        May Allah ﷻ place barakah in your studies, grant you beneficial
        knowledge, make it easy for you to practise what you learn, and make
        this journey a means of success in this life and the Hereafter. Ameen.
      </p>

      <div style="text-align:center;margin:28px 0;padding:20px;background:${BRAND};border-radius:10px;">
        <p style="color:#ffffff;font-size:16px;font-weight:bold;margin:0;">
          Seek Knowledge. Live by It. Share Its Light.
        </p>
        <p style="color:#dbeafe;font-size:13px;margin:7px 0 0;">
          Welcome to the AlFawz Academy family!
        </p>
      </div>

      <p>We look forward to seeing you learn, grow, and excel.</p>

      <p style="margin-bottom:0;">
        Warm regards,<br />
        <strong style="color:${BRAND};">The AlFawz Academy Team</strong>
      </p>
    `)
  );
}

/**
 * Payment confirmation email for courses and sponsorships.
 */
export async function sendPaymentConfirmationEmail(params: {
  to: string;
  name: string;
  amount: number;
  currency: string;
  type: "COURSE" | "SPONSORSHIP";
}) {
  const isCourse = params.type === "COURSE";
  const label = isCourse ? "course payment" : "sponsorship";
  const formattedAmount =
    `${params.currency} ${params.amount.toLocaleString()}`;

  await send(
    params.to,
    "Payment confirmed — AlFawz Academy",
    emailLayout(`
      <div style="text-align:center;margin-bottom:26px;">
        <div style="font-size:42px;margin-bottom:8px;">✓</div>
        <h2 style="color:${BRAND};margin:0;font-size:25px;">
          Payment Successful!
        </h2>
        <p style="color:${MUTED};font-size:14px;margin:8px 0 0;">
          Thank you for your trust and support.
        </p>
      </div>

      <p>
        Assalamu Alaikum wa Rahmatullahi wa Barakatuh,
        ${escapeHtml(params.name)},
      </p>

      <p>
        We are pleased to confirm that your ${label} has been received
        successfully.
      </p>

      <div style="background:#eff6ff;border:1px solid #bfdbfe;padding:22px;margin:24px 0;border-radius:10px;text-align:center;">
        <p style="margin:0;color:${MUTED};font-size:13px;">
          Amount Received
        </p>
        <h2 style="margin:6px 0;color:${BRAND};font-size:28px;">
          ${escapeHtml(formattedAmount)}
        </h2>
        <p style="margin:0;color:${BRAND_DARK};font-weight:bold;">
          ${isCourse ? "Course Payment Confirmed" : "Sponsorship Payment Confirmed"}
        </p>
      </div>

      ${
        isCourse
          ? `<p>Your payment helps secure your participation in your learning journey. We look forward to supporting your growth in beneficial Islamic knowledge.</p>`
          : `<p>Your generosity helps support Islamic education and create learning opportunities for students. Your contribution can make a meaningful difference in their lives.</p>`
      }

      <p>
        May Allah ﷻ accept your contribution, place barakah in your wealth,
        and reward you abundantly for your support.
      </p>

      <p>
        <strong>Jazākallāhu khayran!</strong> Thank you for being part of
        the AlFawz Academy community.
      </p>

      <p style="margin-bottom:0;">
        Warm regards,<br />
        <strong style="color:${BRAND};">The AlFawz Academy Team</strong>
      </p>
    `)
  );
}

/**
 * Alumni approval notification.
 */
export async function sendAlumniApprovedEmail(params: {
  to: string;
  name: string;
}) {
  await send(
    params.to,
    "Your AlFawz Academy alumni profile is live",
    emailLayout(`
      <div style="text-align:center;margin-bottom:26px;">
        <div style="font-size:42px;margin-bottom:8px;">🎉</div>
        <h2 style="color:${BRAND};margin:0;font-size:25px;">
          Your Alumni Profile Is Live!
        </h2>
        <p style="color:${MUTED};font-size:14px;margin:8px 0 0;">
          You will always be part of our story.
        </p>
      </div>

      <p>
        Assalamu Alaikum wa Rahmatullahi wa Barakatuh,
        ${escapeHtml(params.name)},
      </p>

      <p>
        We are delighted to let you know that your
        <strong>AlFawz Academy alumni registration</strong> has been reviewed
        and approved.
      </p>

      <div style="background:#eff6ff;border-left:5px solid ${BRAND};padding:20px;margin:24px 0;border-radius:10px;">
        <h3 style="color:${BRAND_DARK};margin:0 0 8px;">
          Welcome Back to the Family!
        </h3>
        <p style="margin:0;">
          Your alumni profile is now live on the AlFawz Academy Alumni page.
          You can remain connected with the academy and fellow members of
          our growing alumni community.
        </p>
      </div>

      <p>
        Your journey, experiences, and achievements can inspire current and
        future students to pursue knowledge, strengthen their character,
        and strive for excellence.
      </p>

      <p>
        As an alumnus, you can also help shape the future of AlFawz Academy
        by supporting institutional growth and helping students access
        beneficial Islamic education.
      </p>

      <p>
        May Allah ﷻ bless your journey, increase you in beneficial knowledge,
        and make your contributions a lasting source of benefit.
      </p>

      <p>
        <strong>Jazākallāhu khayran</strong> for remaining part of the
        AlFawz Academy family.
      </p>

      <p style="margin-bottom:0;">
        Warm regards,<br />
        <strong style="color:${BRAND};">The AlFawz Academy Team</strong>
      </p>
    `)
  );
}

/**
 * Password reset email.
 */
export async function sendPasswordResetEmail(params: {
  to: string;
  resetUrl: string;
}) {
  const resetUrl = escapeHtml(params.resetUrl);

  await send(
    params.to,
    "Reset your AlFawz Academy password",
    emailLayout(`
      <div style="text-align:center;margin-bottom:26px;">
        <div style="font-size:40px;margin-bottom:8px;">🔐</div>
        <h2 style="color:${BRAND};margin:0;font-size:25px;">
          Reset Your Password
        </h2>
        <p style="color:${MUTED};font-size:14px;margin:8px 0 0;">
          Let's get you securely back into your account.
        </p>
      </div>

      <p>Assalamu Alaikum,</p>

      <p>
        We received a request to reset the password for your
        <strong>AlFawz Academy</strong> account.
      </p>

      <p>
        If you made this request, use the button below to create a new password.
      </p>

      <div style="text-align:center;margin:30px 0;">
        <a href="${resetUrl}" style="display:inline-block;padding:14px 28px;background:${BRAND};color:#ffffff;text-decoration:none;border-radius:8px;font-weight:bold;font-size:15px;">
          Reset My Password
        </a>
      </div>

      <p style="font-size:13px;color:${MUTED};">
        If the button doesn't work, copy and paste this link into your browser:
      </p>

      <p style="font-size:13px;word-break:break-all;">
        <a href="${resetUrl}" style="color:${BRAND};">${resetUrl}</a>
      </p>

      <div style="background:#fff7ed;border:1px solid #fed7aa;padding:16px;margin:22px 0;border-radius:8px;">
        <p style="margin:0;color:#9a3412;font-size:14px;">
          <strong>Security notice:</strong> This password-reset link will
          expire in <strong>1 hour</strong>.
        </p>
      </div>

      <p>
        If you did not request a password reset, you can safely ignore this
        email. Your account password will remain unchanged.
      </p>

      <p>
        May Allah ﷻ keep you and your personal information safe and secure.
      </p>

      <p style="margin-bottom:0;">
        Warm regards,<br />
        <strong style="color:${BRAND};">The AlFawz Academy Team</strong>
      </p>
    `)
  );
}

/**
 * Sponsor welcome email and account setup.
 */
export async function sendSponsorWelcomeEmail(params: {
  to: string;
  name: string;
  setupUrl: string;
}) {
  const setupUrl = escapeHtml(params.setupUrl);

  await send(
    params.to,
    "Welcome to AlFawz Academy — Set Up Your Sponsor Dashboard",
    emailLayout(`
      <div style="text-align:center;margin-bottom:26px;">
        <div style="font-size:42px;margin-bottom:8px;">💙</div>
        <h2 style="color:${BRAND};margin:0;font-size:25px;">
          Your Generosity Makes a Difference!
        </h2>
        <p style="color:${MUTED};font-size:14px;margin:8px 0 0;">
          Welcome to our family of supporters.
        </p>
      </div>

      <p>
        Assalamu Alaikum wa Rahmatullahi wa Barakatuh,
        ${escapeHtml(params.name)},
      </p>

      <p>
        <strong>Jazākumullāhu khayran</strong> for your generous sponsorship.
        Your support helps create opportunities for students to pursue
        beneficial Islamic education.
      </p>

      <p>
        We have created an account for you so you can access your sponsor
        dashboard, track your impact, view receipts, and manage future
        sponsorships.
      </p>

      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-left:5px solid ${BRAND};padding:20px;margin:24px 0;border-radius:10px;">
        <h3 style="margin:0 0 8px;color:${BRAND_DARK};">
          Complete Your Account Setup
        </h3>
        <p style="margin:0;">
          Set a password using the button below to activate access to your
          sponsor dashboard. You can then log in using your email address.
        </p>
      </div>

      <div style="text-align:center;margin:28px 0;">
        <a href="${setupUrl}" style="display:inline-block;padding:14px 26px;background:${BRAND};color:#ffffff;text-decoration:none;border-radius:8px;font-weight:bold;font-size:15px;">
          Set Up My Sponsor Account
        </a>
      </div>

      <p style="font-size:13px;color:${MUTED};">
        If the button doesn't work, copy this link into your browser:
      </p>

      <p style="font-size:13px;word-break:break-all;">
        <a href="${setupUrl}" style="color:${BRAND};">${setupUrl}</a>
      </p>

      <p style="font-size:13px;color:${MUTED};">
        For your security, this setup link will expire in
        <strong>1 hour</strong>.
      </p>

      <p>
        Your generosity can help students gain access to knowledge that
        benefits them, their families, and the wider Ummah.
      </p>

      <p>
        May Allah ﷻ accept your contribution, place barakah in your wealth,
        and reward you for every good that comes from your support.
      </p>

      <p>
        <strong>Jazākumullāhu khayran</strong> for partnering with
        AlFawz Academy in this important mission.
      </p>

      <p style="margin-bottom:0;">
        With gratitude and du'a,<br />
        <strong style="color:${BRAND};">The AlFawz Academy Team</strong>
      </p>
    `)
  );
}

/**
 * Contact form notification to the administrator.
 */
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
    emailLayout(`
      <h2 style="color:${BRAND};margin-top:0;">
        New Contact Message
      </h2>

      <p>
        A new message has been submitted through the AlFawz Academy website.
      </p>

      <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:18px;border-radius:8px;">
        <p style="margin:0 0 8px;">
          <strong>From:</strong> ${escapeHtml(params.name)}
        </p>

        <p style="margin:0 0 8px;">
          <strong>Email:</strong> ${escapeHtml(params.email)}
        </p>

        <p style="margin:0 0 8px;">
          <strong>Subject:</strong> ${escapeHtml(params.subject)}
        </p>

        <p style="margin:16px 0 6px;">
          <strong>Message:</strong>
        </p>

        <p style="margin:0;white-space:pre-wrap;">${escapeHtml(params.message)}</p>
      </div>

      <p style="font-size:13px;color:${MUTED};">
        You can reply directly to the sender using the email address above.
      </p>
    `)
  );
}

/**
 * Escapes user-provided text before inserting it into HTML.
 */
function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
