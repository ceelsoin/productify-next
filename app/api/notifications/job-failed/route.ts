import { NextRequest, NextResponse } from 'next/server';
import { sendJobFailedNotification } from '@/lib/notifications';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    const { userName, userEmail, productName, jobId, creditsRefunded } = data;

    if (!userName || !userEmail || !productName || !jobId || creditsRefunded === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await sendJobFailedNotification({
      userName,
      userEmail,
      productName,
      jobId,
      creditsRefunded,
    });

    // ✅ Sempre retorna 200 mesmo se email falhar (evita bloquear o sistema)
    // Email é opcional - o importante é que o job foi marcado como falho
    if (result.success) {
      return NextResponse.json({ success: true, emailSent: true });
    } else {
      console.warn('⚠️ Email notification failed but job was marked as failed');
      return NextResponse.json({ 
        success: true, 
        emailSent: false,
        reason: 'Email service unavailable' 
      });
    }
  } catch (error) {
    console.error('❌ Error in job failed notification endpoint:', error);
    // Mesmo com erro, retorna 200 para não bloquear o sistema
    return NextResponse.json({ 
      success: true, 
      emailSent: false,
      reason: 'Notification service error' 
    });
  }
}
