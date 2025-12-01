import {
  sendEmail,
  getLoginAlertEmailTemplate,
  getJobCompletedEmailTemplate,
  getJobFailedEmailTemplate,
  getCreditsAddedEmailTemplate,
  getCreditsLowEmailTemplate,
} from './email';

export interface LoginAlertData {
  userName: string;
  userEmail: string;
  ip: string;
  device: string;
  location: string;
}

export interface JobCompletedData {
  userName: string;
  userEmail: string;
  productName: string;
  jobId: string;
  itemsCompleted: number;
}

export interface JobFailedData {
  userName: string;
  userEmail: string;
  productName: string;
  jobId: string;
  creditsRefunded: number;
}

export interface CreditsAddedData {
  userName: string;
  userEmail: string;
  credits: number;
  totalCredits: number;
  transactionId: string;
}

export interface CreditsLowData {
  userName: string;
  userEmail: string;
  remainingCredits: number;
}

/**
 * Envia notificação de novo login
 */
export async function sendLoginAlert(data: LoginAlertData) {
  try {
    const result = await sendEmail({
      to: data.userEmail,
      subject: '🔐 Novo Login Detectado - Productify',
      html: getLoginAlertEmailTemplate(
        data.userName,
        data.ip,
        data.device,
        data.location
      ),
    });

    if (result.success) {
      console.log('✅ Email de login enviado:', data.userEmail);
    }

    return result;
  } catch (error) {
    console.error('❌ Erro ao enviar email de login:', error);
    return { success: false, error };
  }
}

/**
 * Envia notificação de job concluído
 */
export async function sendJobCompletedNotification(data: JobCompletedData) {
  try {
    const result = await sendEmail({
      to: data.userEmail,
      subject: `✅ ${data.productName} - Concluído!`,
      html: getJobCompletedEmailTemplate(
        data.userName,
        data.productName,
        data.jobId,
        data.itemsCompleted
      ),
    });

    if (result.success) {
      console.log('✅ Email de job concluído enviado:', data.userEmail);
    }

    return result;
  } catch (error) {
    console.error('❌ Erro ao enviar email de job concluído:', error);
    return { success: false, error };
  }
}

/**
 * Envia notificação de job com falha
 */
export async function sendJobFailedNotification(data: JobFailedData) {
  try {
    const result = await sendEmail({
      to: data.userEmail,
      subject: `⚠️ ${data.productName} - Falha no Processamento`,
      html: getJobFailedEmailTemplate(
        data.userName,
        data.productName,
        data.jobId,
        data.creditsRefunded
      ),
    });

    if (result.success) {
      console.log('✅ Email de job falho enviado:', data.userEmail);
    }

    return result;
  } catch (error) {
    console.error('❌ Erro ao enviar email de job falho:', error);
    return { success: false, error };
  }
}

/**
 * Envia notificação de créditos adicionados
 */
export async function sendCreditsAddedNotification(data: CreditsAddedData) {
  try {
    const result = await sendEmail({
      to: data.userEmail,
      subject: '💎 Créditos Adicionados - Productify',
      html: getCreditsAddedEmailTemplate(
        data.userName,
        data.credits,
        data.totalCredits,
        data.transactionId
      ),
    });

    if (result.success) {
      console.log('✅ Email de créditos adicionados enviado:', data.userEmail);
    }

    return result;
  } catch (error) {
    console.error('❌ Erro ao enviar email de créditos adicionados:', error);
    return { success: false, error };
  }
}

/**
 * Envia notificação de créditos acabando
 */
export async function sendCreditsLowNotification(data: CreditsLowData) {
  try {
    const result = await sendEmail({
      to: data.userEmail,
      subject: '⚡ Seus Créditos Estão Acabando - Productify',
      html: getCreditsLowEmailTemplate(data.userName, data.remainingCredits),
    });

    if (result.success) {
      console.log('✅ Email de créditos baixos enviado:', data.userEmail);
    }

    return result;
  } catch (error) {
    console.error('❌ Erro ao enviar email de créditos baixos:', error);
    return { success: false, error };
  }
}
