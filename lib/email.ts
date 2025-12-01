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

// Template base para emails
function getEmailBaseTemplate(
  title: string,
  emoji: string,
  content: string,
  ctaButton?: { text: string; url: string }
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - Productify</title>
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
                      ${emoji} Productify
                    </h1>
                  </td>
                </tr>
                
                <!-- Body -->
                <tr>
                  <td style="padding: 40px 30px;">
                    ${content}
                    
                    ${
                      ctaButton
                        ? `
                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="${ctaButton.url}" 
                             style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #d946ef 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(217, 70, 239, 0.3);">
                            ${ctaButton.text}
                          </a>
                        </td>
                      </tr>
                    </table>
                    `
                        : ''
                    }
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

// Email de login em nova conta
export function getLoginAlertEmailTemplate(
  name: string,
  ip: string,
  device: string,
  location: string
): string {
  const content = `
    <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: #ffffff;">
      Olá, ${name}!
    </h2>
    
    <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #e5e5e5;">
      Detectamos um novo login na sua conta do Productify.
    </p>
    
    <div style="margin: 30px 0; padding: 20px; background-color: #262626; border-radius: 6px;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #a3a3a3;">
        <strong style="color: #e5e5e5;">📱 Dispositivo:</strong> ${device}
      </p>
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #a3a3a3;">
        <strong style="color: #e5e5e5;">🌍 Localização:</strong> ${location}
      </p>
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #a3a3a3;">
        <strong style="color: #e5e5e5;">🔐 IP:</strong> ${ip}
      </p>
      <p style="margin: 0; font-size: 14px; color: #a3a3a3;">
        <strong style="color: #e5e5e5;">⏰ Data:</strong> ${new Date().toLocaleString('pt-BR')}
      </p>
    </div>
    
    <div style="margin-top: 30px; padding: 15px; background-color: #262626; border-left: 4px solid #ef4444; border-radius: 4px;">
      <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #e5e5e5;">
        ⚠️ <strong>Não foi você?</strong>
      </p>
      <p style="margin: 10px 0 0 0; font-size: 14px; line-height: 1.6; color: #a3a3a3;">
        Se você não reconhece este login, altere sua senha imediatamente e entre em contato conosco.
      </p>
    </div>
  `;

  return getEmailBaseTemplate('Novo Login Detectado', '🔐', content, {
    text: 'Alterar Senha',
    url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings/security`,
  });
}

// Email de job concluído
export function getJobCompletedEmailTemplate(
  name: string,
  productName: string,
  jobId: string,
  itemsCompleted: number
): string {
  const content = `
    <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: #ffffff;">
      Ótimas notícias, ${name}!
    </h2>
    
    <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #e5e5e5;">
      Seu produto <strong style="color: #d946ef;">${productName}</strong> foi processado com sucesso! 🎉
    </p>
    
    <div style="margin: 30px 0; padding: 20px; background-color: #262626; border-radius: 6px; border-left: 4px solid #22c55e;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #a3a3a3;">
        <strong style="color: #e5e5e5;">✨ Items gerados:</strong> ${itemsCompleted}
      </p>
      <p style="margin: 0; font-size: 14px; color: #a3a3a3;">
        <strong style="color: #e5e5e5;">⏰ Concluído em:</strong> ${new Date().toLocaleString('pt-BR')}
      </p>
    </div>
    
    <p style="margin: 30px 0 0 0; font-size: 16px; line-height: 1.6; color: #e5e5e5;">
      Seus resultados estão prontos para visualização e download!
    </p>
  `;

  return getEmailBaseTemplate('Produto Concluído', '✅', content, {
    text: 'Ver Produto',
    url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/jobs/${jobId}`,
  });
}

// Email de job com falha
export function getJobFailedEmailTemplate(
  name: string,
  productName: string,
  jobId: string,
  creditsRefunded: number
): string {
  const content = `
    <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: #ffffff;">
      Olá, ${name}
    </h2>
    
    <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #e5e5e5;">
      Infelizmente, houve um problema ao processar seu produto <strong style="color: #d946ef;">${productName}</strong>.
    </p>
    
    <div style="margin: 30px 0; padding: 20px; background-color: #262626; border-radius: 6px; border-left: 4px solid #ef4444;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #a3a3a3;">
        <strong style="color: #e5e5e5;">❌ Status:</strong> Falha no processamento
      </p>
      <p style="margin: 0; font-size: 14px; color: #a3a3a3;">
        <strong style="color: #e5e5e5;">⏰ Data:</strong> ${new Date().toLocaleString('pt-BR')}
      </p>
    </div>
    
    <div style="margin: 30px 0; padding: 20px; background-color: #262626; border-radius: 6px; border-left: 4px solid #22c55e;">
      <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #22c55e;">
        💰 <strong>Seus créditos foram reembolsados!</strong>
      </p>
      <p style="margin: 10px 0 0 0; font-size: 14px; color: #a3a3a3;">
        Devolvemos <strong style="color: #22c55e;">${creditsRefunded} créditos</strong> para sua conta. Você pode tentar novamente quando quiser.
      </p>
    </div>
    
    <p style="margin: 30px 0 0 0; font-size: 14px; line-height: 1.6; color: #a3a3a3;">
      Se o problema persistir, entre em contato com nosso suporte.
    </p>
  `;

  return getEmailBaseTemplate('Falha no Processamento', '⚠️', content, {
    text: 'Tentar Novamente',
    url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/generate`,
  });
}

// Email de créditos adicionados
export function getCreditsAddedEmailTemplate(
  name: string,
  credits: number,
  totalCredits: number,
  transactionId: string
): string {
  const content = `
    <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: #ffffff;">
      Parabéns, ${name}!
    </h2>
    
    <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #e5e5e5;">
      Seus créditos foram adicionados com sucesso! 🎉
    </p>
    
    <div style="margin: 30px 0; padding: 30px; background: linear-gradient(135deg, #d946ef 0%, #3b82f6 100%); border-radius: 8px; text-align: center;">
      <p style="margin: 0 0 10px 0; font-size: 48px; font-weight: 700; color: #ffffff;">
        +${credits}
      </p>
      <p style="margin: 0; font-size: 16px; color: rgba(255, 255, 255, 0.9);">
        créditos adicionados
      </p>
    </div>
    
    <div style="margin: 30px 0; padding: 20px; background-color: #262626; border-radius: 6px;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #a3a3a3;">
        <strong style="color: #e5e5e5;">💰 Saldo atual:</strong> ${totalCredits} créditos
      </p>
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #a3a3a3;">
        <strong style="color: #e5e5e5;">📋 ID da transação:</strong> ${transactionId}
      </p>
      <p style="margin: 0; font-size: 14px; color: #a3a3a3;">
        <strong style="color: #e5e5e5;">⏰ Data:</strong> ${new Date().toLocaleString('pt-BR')}
      </p>
    </div>
    
    <p style="margin: 30px 0 0 0; font-size: 16px; line-height: 1.6; color: #e5e5e5;">
      Está na hora de criar produtos incríveis!
    </p>
  `;

  return getEmailBaseTemplate('Créditos Adicionados', '💎', content, {
    text: 'Começar Agora',
    url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/generate`,
  });
}

// Email de créditos acabando
export function getCreditsLowEmailTemplate(
  name: string,
  remainingCredits: number
): string {
  const content = `
    <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: #ffffff;">
      Atenção, ${name}!
    </h2>
    
    <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #e5e5e5;">
      Seus créditos estão acabando. Você tem apenas <strong style="color: #ef4444;">${remainingCredits} créditos</strong> restantes.
    </p>
    
    <div style="margin: 30px 0; padding: 20px; background-color: #262626; border-radius: 6px; border-left: 4px solid #f59e0b;">
      <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #e5e5e5;">
        ⚠️ <strong>Não deixe suas ideias esperando!</strong>
      </p>
      <p style="margin: 10px 0 0 0; font-size: 14px; line-height: 1.6; color: #a3a3a3;">
        Adicione mais créditos agora para continuar gerando conteúdo profissional com IA.
      </p>
    </div>
    
    <p style="margin: 30px 0 0 0; font-size: 16px; line-height: 1.6; color: #e5e5e5;">
      Aproveite nossos pacotes com bônus e economize ainda mais!
    </p>
  `;

  return getEmailBaseTemplate('Créditos Acabando', '⚡', content, {
    text: 'Comprar Créditos',
    url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings/credits`,
  });
}

// Email de edição de imagem concluída
export function getImageEditCompletedEmailTemplate(
  name: string,
  editPrompt: string,
  editedImageUrl: string,
  editId: string
): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const fullImageUrl = editedImageUrl.startsWith('http') ? editedImageUrl : `${appUrl}${editedImageUrl}`;
  
  const content = `
    <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: #ffffff;">
      Ótima notícia, ${name}!
    </h2>
    
    <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #e5e5e5;">
      Sua imagem foi editada com sucesso usando IA Nano Banana Edit!
    </p>
    
    <div style="margin: 30px 0; padding: 20px; background-color: #262626; border-radius: 8px;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #a3a3a3;">
        <strong>Prompt de Edição:</strong>
      </p>
      <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #e5e5e5; font-style: italic;">
        "${editPrompt}"
      </p>
    </div>
    
    <div style="margin: 30px 0; text-align: center;">
      <img src="${fullImageUrl}" alt="Imagem Editada" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);" />
    </div>
    
    <p style="margin: 30px 0 0 0; font-size: 16px; line-height: 1.6; color: #e5e5e5;">
      Baixe sua imagem ou faça novas edições na plataforma.
    </p>
  `;

  return getEmailBaseTemplate('Imagem Editada', '🎨', content, {
    text: 'Ver Imagem Editada',
    url: fullImageUrl,
  });
}

// Email de falha na edição de imagem
export function getImageEditFailedEmailTemplate(
  name: string,
  editPrompt: string,
  error: string,
  creditsRefunded: number
): string {
  const content = `
    <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: #ffffff;">
      Ops, ${name}...
    </h2>
    
    <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #e5e5e5;">
      Infelizmente a edição da sua imagem encontrou um problema e não pôde ser concluída.
    </p>
    
    <div style="margin: 30px 0; padding: 20px; background-color: #262626; border-radius: 8px;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #a3a3a3;">
        <strong>Prompt de Edição:</strong>
      </p>
      <p style="margin: 0 0 15px 0; font-size: 15px; line-height: 1.6; color: #e5e5e5; font-style: italic;">
        "${editPrompt}"
      </p>
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #a3a3a3;">
        <strong>Erro:</strong>
      </p>
      <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #ef4444;">
        ${error}
      </p>
    </div>
    
    <div style="margin: 30px 0; padding: 20px; background-color: #262626; border-radius: 6px; border-left: 4px solid #10b981;">
      <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #e5e5e5;">
        ✅ <strong>Reembolso Processado</strong>
      </p>
      <p style="margin: 10px 0 0 0; font-size: 14px; line-height: 1.6; color: #a3a3a3;">
        Devolvemos <strong style="color: #10b981;">${creditsRefunded} créditos</strong> para sua conta. Você pode tentar novamente quando quiser!
      </p>
    </div>
    
    <p style="margin: 30px 0 0 0; font-size: 16px; line-height: 1.6; color: #e5e5e5;">
      Se o problema persistir, entre em contato com nosso suporte.
    </p>
  `;

  return getEmailBaseTemplate('Falha na Edição', '⚠️', content, {
    text: 'Tentar Novamente',
    url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/my-products`,
  });
}
