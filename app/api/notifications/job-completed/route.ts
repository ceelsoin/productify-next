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

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to send notification' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending job completed notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
