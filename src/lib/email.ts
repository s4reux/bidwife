import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
  await transporter.sendMail({
    from: `"BidWife" <${process.env.GMAIL_USER}>`,
    to,
    subject: "🔐 Şifrə sıfırlama linki",
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; border-radius: 16px; padding: 40px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 16px;">🔐</div>
          <h1 style="color: #111827; margin: 0 0 12px; font-size: 24px;">Şifrə sıfırlama</h1>
          <p style="color: #6b7280; margin: 0 0 8px;">Salam, ${name}!</p>
          <p style="color: #6b7280; margin: 0 0 24px;">Şifrənizi sıfırlamaq üçün aşağıdaki düyməyə basın:</p>
          <a href="${resetUrl}"
             style="display: inline-block; background: linear-gradient(135deg, #f97316, #dc2626); color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold;">
            Şifrəni sıfırla
          </a>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
            Bu link 1 saat ərzində keçərlidir.<br>
            Əgər bu istəyi siz göndərməmisinizsə, bu emaili nəzərə almayın.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
          <p style="color: #9ca3af; font-size: 11px; margin: 0;">
            © BidWife — Azərbaycanın onlayn bazarı
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendVerificationEmail(to: string, name: string, code: string) {
  await transporter.sendMail({
    from: `"BidWife" <${process.env.GMAIL_USER}>`,
    to,
    subject: "✉️ BidWife — Email təsdiq kodu",
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; border-radius: 16px; padding: 40px; text-align: center;">
          <h1 style="color: #111827; margin: 0 0 8px; font-size: 22px;">Xoş gəldin, ${name}!</h1>
          <p style="color: #6b7280; margin: 0 0 24px;">
            Hesabınızı təsdiqləmək üçün aşağıdaki kodu sayta daxil edin:
          </p>
          <div style="background: linear-gradient(135deg, #f97316, #dc2626); color: white; font-size: 36px; font-weight: 900; letter-spacing: 12px; padding: 20px; border-radius: 12px; margin: 0 auto 20px;">
            ${code}
          </div>
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            Bu kod 15 dəqiqə ərzində keçərlidir.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
          <p style="color: #9ca3af; font-size: 11px; margin: 0;">
            © BidWife — Azərbaycanın onlayn bazarı
          </p>
        </div>
      </div>
    `,
  });
}