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
    from: `"Bazar" <${process.env.GMAIL_USER}>`,
    to,
    subject: "🔐 Şifrə sıfırlama linki",
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
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
            © Bazar.az — Azərbaycanın onlayn bazarı
          </p>
        </div>
      </div>
    `,
  });
}