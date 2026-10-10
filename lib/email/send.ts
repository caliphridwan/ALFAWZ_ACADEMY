import "server-only";
import { Resend } from "resend";

const BRAND = "#1d4ed8";
const BRAND_DARK = "#1e3a8a";
const MUTED = "#64748b";
const EMAIL_BACKGROUND = "#f1f5f9";

function getClient() {
  const apiKey = process.env.EMAIL_API_KEY;

  if (!apiKey) {
    throw new Error("EMAIL_API_KEY is not configured.");
  }

  return new Resend(apiKey);
}

const FROM =
  process.env.EMAIL_FROM ??
  "AlFawz Academy <onboarding@resend.dev>";

function emailLayout(content: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>AlFawz Academy</title>
      </head>
      <body style="margin:0;padding:0;background:${EMAIL_BACKGROUND};font-family:Arial,Helvetica,sans-serif;color:#1e293b;">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
          AlFawz Academy — seeking beneficial Islamic knowledge.
        </div>

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${EMAIL_BACKGROUND};padding:30px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
                <tr>
                  <td style="background:${BRAND_DARK};padding:28px 24px;text-align:center;">
                    <div style="font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#bfdbfe;margin-bottom:8px;">
                      Knowledge • Faith • Excellence
                    </div>
                    <h1 style="margin:0;color:#ffffff;font-size:28px;line-height:1.3;">
                      AlFawz Academy
                    </h1>
                    <p style="margin:9px 0 0;color:#dbeafe;font-size:14px;">
                      Nurturing hearts through the light of Islamic knowledge
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:32px 26px;font-size:15px;line-height:1.8;">
                    ${content}
                  </td>
                </tr>

                <tr>
                  <td style="padding:22px 24px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
                    <p style="margin:0 0 8px;color:${BRAND_DARK};font-size:14px;font-weight:bold;">
                      The AlFawz Academy Team
                    </p>
                    <p style="margin:0;color:${MUTED};font-size:12px;line-height:1.7;">
                      May Allah grant us beneficial knowledge and righteous deeds.
                      <br />
                      
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

async function send(to: string, subject: string, html: string) {
  const client = getClient();

  const { error } = await client.emails.send({
    from: FROM,
    to,
    subject,
    html,
  });

  if (error) {
    console.error("AlFawz Academy email error:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

/**
 * Welcome email after a student creates an account.
 */
export async function sendWelcomeEmail(params: {
  to: string;
  name: string;
}) {
  await send(
    params.to,
    "Welcome to AlFawz Academy",
    emailLayout(`
      <h2 style="color:${BRAND_DARK};margin-top:0;">
        Assalamu Alaikum, ${escapeHtml(params.name)}!
      </h2>

      <p>
        Welcome to <strong>AlFawz Academy </strong>. We are delighted to have
        you join our learning community, where students are encouraged to
        grow in Qur'anic knowledge, Islamic understanding, and excellent character.
      </p>

      <p>
        Kindly proceed to exploring our available courses, choose a learning path that suits you,
        and take the next step in your pursuit of beneficial knowledge.
      </p>

      <p>
        May Allah ﷻ make your learning easy, increase you in knowledge,
        and make it a source of goodness in this life and the Hereafter. Ameen.
      </p>

      <p style="margin-bottom:0;">
        With warm regards,<br />
        <strong style="color:${BRAND};">AlFawz Academy</strong>
      </p>
    `)
  );
}

/**
 * Confirmation email after course enrollment.
 */
export async function sendEnrollmentConfirmationEmail(params: {
  to: string;
  name: string;
  courseTitle: string;
}) {
  await send(
    params.to,
    `Enrollment Confirmed — ${params.courseTitle}`,
    emailLayout(`
      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-size:42px;margin-bottom:8px;">📚</div>
        <h2 style="color:${BRAND_DARK};margin:0;">
          Enrollment Confirmed!
        </h2>
        <p style="color:${MUTED};margin:8px 0 0;">
          Your learning journey starts here.
        </p>
      </div>

      <p>
        Assalamu Alaikum, ${escapeHtml(params.name)}.
      </p>

      <p>
        We are pleased to confirm your enrollment at AlFawz Academy.
        Your registration for the following course has been received successfully:
      </p>

      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-left:5px solid ${BRAND};padding:20px;margin:24px 0;border-radius:10px;">
        <p style="margin:0 0 6px;color:${MUTED};font-size:12px;text-transform:uppercase;letter-spacing:1px;">
          Enrolled Course
        </p>
        <h3 style="margin:0;color:${BRAND_DARK};font-size:21px;">
          ${escapeHtml(params.courseTitle)}
        </h3>
      </div>

      <p>
        Please check your student dashboard and any further instructions
        provided by the Academy for details about your course and next steps.
      </p>

      <p>
        May Allah ﷻ bless your studies and grant you knowledge that benefits
        you and the wider Ummah. Ameen.
      </p>

      <p style="margin-bottom:0;">
        Jazakumullahu Khairan,<br />
        <strong style="color:${BRAND};">The AlFawz Academy Team</strong>
      </p>
    `)
  );
}

/**
 * Payment confirmation for course enrollment or sponsorship.
 */
export async function sendPaymentConfirmationEmail(params: {
  to: string;
  name: string;
  amount: number;
  currency: string;
  type: "COURSE" | "SPONSORSHIP";
}) {
  const isSponsorship = params.type === "SPONSORSHIP";
  const formattedAmount = new Intl.NumberFormat("en", {
    style: "currency",
    currency: params.currency,
  }).format(params.amount);

  await send(
    params.to,
    isSponsorship
      ? "Sponsorship Payment Confirmation — AlFawz Academy"
      : "Payment Confirmation — AlFawz Academy",
    emailLayout(`
      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-size:42px;margin-bottom:8px;">${
          isSponsorship ? "🤝" : "✅"
        }</div>
        <h2 style="color:${BRAND_DARK};margin:0;">
          Payment Successful
        </h2>
        <p style="color:${MUTED};margin:8px 0 0;">
          Thank you for your ${
            isSponsorship ? "generous support" : "payment"
          }.
        </p>
      </div>

      <p>
        Assalamu Alaikum, ${escapeHtml(params.name)}.
      </p>

      <p>
        This email confirms that we have received your ${
          isSponsorship ? "sponsorship contribution" : "course payment"
        } for AlFawz Academy.
      </p>

      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:22px;margin:24px 0;">
        <p style="margin:0 0 8px;color:${MUTED};font-size:12px;text-transform:uppercase;letter-spacing:1px;">
          Amount Paid
        </p>
        <h2 style="margin:0;color:${BRAND_DARK};font-size:30px;">
          ${escapeHtml(formattedAmount)}
        </h2>
        <p style="margin:12px 0 0;color:${MUTED};font-size:13px;">
          Payment type: ${isSponsorship ? "Student Sponsorship" : "Course Enrollment"}
        </p>
      </div>

      ${
        isSponsorship
          ? `<p>
              Your generosity helps support access to Islamic education.
              May Allah ﷻ reward you abundantly, place barakah in your wealth,
              and make your contribution a lasting source of reward. Ameen.
            </p>`
          : `<p>
              Thank you for taking this step in your pursuit of beneficial
              Islamic knowledge. Please check your student dashboard for
              enrollment information and any further instructions.
            </p>`
      }

      <p style="margin-bottom:0;">
        With gratitude,<br />
        <strong style="color:${BRAND};">The AlFawz Academy Team</strong>
      </p>
    `)
  );
}

/**
 * Email notification when an alumni application is approved.
 */
export async function sendAlumniApprovedEmail(params: {
  to: string;
  name: string;
}) {
  await send(
    params.to,
    "Your AlFawz Academy Alumni Application Is Approved",
    emailLayout(`
      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-size:42px;margin-bottom:8px;">🎓</div>
        <h2 style="color:${BRAND_DARK};margin:0;">
          Welcome to Our Alumni Community!
        </h2>
      </div>

      <p>
        Assalamu Alaikum, ${escapeHtml(params.name)}.
      </p>

      <p>
        We are pleased to inform you that your application to join the
        AlFawz Academy alumni community has been approved.
      </p>

      <p>
        As an alumnus, you remain an important part of our growing community.
        You can help strengthen the Academy by sharing your experiences,
        supporting current students, and contributing to the continued growth
        of Islamic education.
      </p>

      <p>
        May Allah ﷻ continue to guide you, bless your efforts, and make you
        a means of benefit to others. Ameen.
      </p>

      <p style="margin-bottom:0;">
        With appreciation,<br />
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
  const safeResetUrl = escapeHtml(params.resetUrl);

  await send(
    params.to,
    "Reset Your AlFawz Academy Password",
    emailLayout(`
      <h2 style="color:${BRAND_DARK};margin-top:0;">
        Password Reset Request
      </h2>

      <p>
        Assalamu Alaikum.
      </p>

      <p>
        We received a request to reset the password for your AlFawz Academy
        account. Use the button below to continue.
      </p>

      <div style="text-align:center;margin:28px 0;">
        <a href="${safeResetUrl}" style="display:inline-block;background:${BRAND};color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:bold;">
          Reset My Password
        </a>
      </div>

      <p>
        If the button does not work, copy and paste this link into your browser:
      </p>

      <p style="word-break:break-all;font-size:13px;">
        <a href="${safeResetUrl}" style="color:${BRAND};">${safeResetUrl}</a>
      </p>

      <p>
        If you did not request a password reset, you can safely ignore this
        email. For your security, do not share your reset link with anyone.
      </p>

      <p style="margin-bottom:0;">
        Regards,<br />
        <strong style="color:${BRAND};">The AlFawz Academy Team</strong>
      </p>
    `)
  );
}

/**
 * Welcome email for a sponsor, including a sponsorship setup link.
 */
export async function sendSponsorWelcomeEmail(params: {
  to: string;
  name: string;
  setupUrl: string;
}) {
  const safeSetupUrl = escapeHtml(params.setupUrl);

  await send(
    params.to,
    "Thank You for Supporting AlFawz Academy",
    emailLayout(`
      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-size:42px;margin-bottom:8px;">🤝</div>
        <h2 style="color:${BRAND_DARK};margin:0;">
          Your Generosity Can Change Lives
        </h2>
      </div>

      <p>
        Assalamu Alaikum, ${escapeHtml(params.name)}.
      </p>

      <p>
        Thank you for your interest in supporting AlFawz Academy. Your
        willingness to help students access Qur'anic and Islamic education
        is deeply appreciated.
      </p>

      <p>
        Use the link below to continue with your sponsorship arrangements:
      </p>

      <div style="text-align:center;margin:28px 0;">
        <a href="${safeSetupUrl}" style="display:inline-block;background:${BRAND};color:#ffffff;text-decoration:none;padding:14px 26px;border-radius:8px;font-weight:bold;">
          Continue Sponsorship
        </a>
      </div>

      <p>
        If the button does not work, copy this link into your browser:
      </p>

      <p style="word-break:break-all;font-size:13px;">
        <a href="${safeSetupUrl}" style="color:${BRAND};">${safeSetupUrl}</a>
      </p>

      <p>
        May Allah ﷻ accept your intention, bless your wealth, and reward
        you for every student who benefits from your support. Ameen.
      </p>

      <p style="margin-bottom:0;">
        With sincere appreciation,<br />
        <strong style="color:${BRAND};">The AlFawz Academy Team</strong>
      </p>
    `)
  );
}

/**
 * Notify the administrator when someone submits the contact form.
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
    `Website Contact: ${params.subject}`,
    emailLayout(`
      <h2 style="color:${BRAND_DARK};margin-top:0;">
        New Website Contact Message
      </h2>

      <p>An enquiry has been submitted through the AlFawz Academy website.</p>

      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px;margin:22px 0;">
        <p style="margin:0 0 8px;">
          <strong>Name:</strong> ${escapeHtml(params.name)}
        </p>
        <p style="margin:0 0 8px;">
          <strong>Email:</strong> ${escapeHtml(params.email)}
        </p>
        <p style="margin:0 0 8px;">
          <strong>Subject:</strong> ${escapeHtml(params.subject)}
        </p>
        <p style="margin:0;">
          <strong>Message:</strong><br />
          ${escapeHtml(params.message).replace(/\n/g, "<br />")}
        </p>
      </div>

      <p style="margin-bottom:0;">
        This notification was generated by the AlFawz Academy website.
      </p>
    `)
  );
}

/**
 * Email sent when an administrator creates a student account.
 */
export async function sendAdminCreatedAccountEmail(params: {
  to: string;
  name: string;
  password: string;
}) {
  await send(
    params.to,
    "Your AlFawz Academy Student Account Is Ready",
    emailLayout(`
      <div style="text-align:center;margin-bottom:26px;">
        <div style="font-size:42px;margin-bottom:8px;">🎓</div>
        <h2 style="color:${BRAND};margin:0;font-size:25px;">
          Welcome to AlFawz Academy!
        </h2>
        <p style="color:${MUTED};font-size:14px;margin:8px 0 0;">
          Your student account has been created.
        </p>
      </div>

      <p>
        Assalamu Alaikum wa Rahmatullahi wa Barakatuh,
        ${escapeHtml(params.name)}.
      </p>

      <p>
        We are pleased to inform you that an administrator has successfully
        created your student account at <strong>AlFawz Academy</strong>.
        You can now log in and begin your journey toward beneficial
        Islamic knowledge.
      </p>

      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-left:5px solid ${BRAND};padding:20px;margin:24px 0;border-radius:10px;">
        <h3 style="color:${BRAND_DARK};margin:0 0 14px;">
          Your Login Details
        </h3>

        <p style="margin:0 0 8px;">
          <strong>Email:</strong> ${escapeHtml(params.to)}
        </p>

        <p style="margin:0;">
          <strong>Temporary Password:</strong><br />
          <span style="font-family:monospace;word-break:break-all;">
            ${escapeHtml(params.password)}
          </span>
        </p>
      </div>

      <p>
        Please log in using the credentials provided above. For your security,
        change your temporary password as soon as possible if your account
        settings allow you to do so.
      </p>

      <p>
        May Allah ﷻ bless your pursuit of knowledge, increase you in
        beneficial knowledge, and make your studies a source of goodness
        for you and the wider Ummah. Ameen.
      </p>

      <p style="margin-bottom:0;">
        Warm regards,<br />
        <strong style="color:${BRAND};">The AlFawz Academy Team</strong>
      </p>
    `)
  );
}
