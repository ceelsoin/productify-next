import { NextRequest, NextResponse } from 'next/server';
import { sendJobCompletedNotification } from '@/lib/notifications';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    const { userName, userEmail, productName, jobId, itemsCompleted } = data;

    if (!userName || !userEmail || !productName || !jobId || itemsCompleted === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await sendJobCompletedNotification({
      userName,
      userEmail,
      productName,
      jobId,
      itemsCompleted,
    });

    // ✅ Sempre retorna 200 mesmo se email falhar (evita falhar o job)
    // Email é opcional - o importante é que o job completou
    if (result.success) {
      return NextResponse.json({ success: true, emailSent: true });
    } else {
      console.warn('⚠️ Email notification failed but job completed successfully');
      return NextResponse.json({ 
        success: true, 
        emailSent: false,
        reason: 'Email service unavailable' 
      });
    }
  } catch (error) {
    console.error('❌ Error in job completed notification endpoint:', error);
    // Mesmo com erro, retorna 200 para não bloquear o job
    return NextResponse.json({ 
      success: true, 
      emailSent: false,
      reason: 'Notification service error' 
    });
  }
}
