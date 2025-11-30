import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '1025'),
  secure: false, // true for 465, false for other ports
  auth: process.env.SMTP_USER
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    : undefined,
  tls: {
    rejectUnauthorized: false, // Aceitar certificados autoassinados em desenvolvimento
  },
});

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: SendEmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Productify" <noreply@productify.app>',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    console.log('📧 Email enviado:', {
      to: options.to,
      subject: options.subject,
      messageId: info.messageId,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    return { success: false, error };
  }
}

// Template para email de recuperação de senha
export function getPasswordResetEmailTemplate(
  name: string,
  resetUrl: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperação de Senha - Productify</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a; color: #ffffff;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #d946ef 0%, #3b82f6 100%); padding: 30px; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff;">
                      🎨 Productify
                    </h1>
                  </td>
                </tr>
                
                <!-- Body -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: #ffffff;">
                      Olá, ${name}!
                    </h2>
                    
                    <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #e5e5e5;">
                      Recebemos uma solicitação para redefinir a senha da sua conta no Productify.
                    </p>
                    
                    <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #e5e5e5;">
                      Clique no botão abaixo para criar uma nova senha:
                    </p>
                    
                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="${resetUrl}" 
                             style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #d946ef 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(217, 70, 239, 0.3);">
                            Redefinir Senha
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Alternative Link -->
                    <p style="margin: 30px 0 0 0; font-size: 14px; line-height: 1.6; color: #a3a3a3;">
                      Se o botão acima não funcionar, copie e cole o seguinte link no seu navegador:
                    </p>
                    <p style="margin: 10px 0 0 0; font-size: 14px; word-break: break-all;">
                      <a href="${resetUrl}" style="color: #d946ef; text-decoration: underline;">
                        ${resetUrl}
                      </a>
                    </p>
                    
                    <!-- Warning -->
                    <div style="margin-top: 30px; padding: 15px; background-color: #262626; border-left: 4px solid #d946ef; border-radius: 4px;">
                      <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #e5e5e5;">
                        ⏰ <strong>Este link expira em 1 hora.</strong>
                      </p>
                      <p style="margin: 10px 0 0 0; font-size: 14px; line-height: 1.6; color: #a3a3a3;">
                        Se você não solicitou a redefinição de senha, ignore este email. Sua senha permanecerá inalterada.
                      </p>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #0a0a0a; padding: 30px; text-align: center; border-top: 1px solid #262626;">
                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #a3a3a3;">
                      © ${new Date().getFullYear()} Productify. Todos os direitos reservados.
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #737373;">
                      Transforme suas fotos em conteúdo profissional com IA
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

// Template de texto puro (fallback)
export function getPasswordResetEmailText(
  name: string,
  resetUrl: string
): string {
  return `
Olá, ${name}!

Recebemos uma solicitação para redefinir a senha da sua conta no Productify.

Clique no link abaixo para criar uma nova senha:
${resetUrl}

Este link expira em 1 hora.

Se você não solicitou a redefinição de senha, ignore este email. Sua senha permanecerá inalterada.

---
© ${new Date().getFullYear()} Productify
Transforme suas fotos em conteúdo profissional com IA
  `.trim();
}
