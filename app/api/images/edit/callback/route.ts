import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ImageEdit from '@/models/ImageEdit';
import { User } from '@/lib/models/User';
import { sendImageEditCompletedNotification, sendImageEditFailedNotification } from '@/lib/notifications';
import * as aws from 'aws-sdk';

/**
 * POST /api/images/edit/callback
 * Webhook endpoint to receive callbacks from Kie.ai
 * 
 * Called by Kie.ai when image edit task is completed or failed
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    console.log('[Callback] Received webhook from Kie.ai');
    console.log('[Callback] Body:', JSON.stringify(body, null, 2));

    // Kie.ai sends: { taskId, status, imageUrls, failReason }
    const { taskId, status, imageUrls, failReason } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: 'taskId is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find the image edit task
    const imageEdit = await ImageEdit.findOne({ taskId: taskId });
    if (!imageEdit) {
      console.error(`[Callback] ImageEdit not found for taskId: ${taskId}`);
      return NextResponse.json(
        { error: 'ImageEdit task not found' },
        { status: 404 }
      );
    }

    console.log(`[Callback] Found ImageEdit: ${imageEdit._id}`);
    console.log(`[Callback] Status: ${status}`);

    // Handle completed task (Kie.ai sends status: 'SUCCESS')
    if (status === 'SUCCESS') {
      try {
        // Extract edited image URL
        const editedImageUrl = imageUrls?.[0];
        
        if (!editedImageUrl) {
          console.error('[Callback] No image URL in callback:', JSON.stringify(body));
          throw new Error('No edited image URL in callback');
        }

        console.log(`[Callback] Edited image URL: ${editedImageUrl}`);

        // Download and save edited image to S3
        const s3ImageUrl = await downloadAndSaveImage(editedImageUrl);
        console.log(`[Callback] Saved to S3: ${s3ImageUrl}`);

        // Update ImageEdit record
        imageEdit.status = 'completed';
        imageEdit.editedImageUrl = s3ImageUrl;
        imageEdit.completedAt = new Date();
        await imageEdit.save();

        // Get user for notification
        const user = await User.findById(imageEdit.user);
        if (user) {
          // Send success notification
          await sendImageEditCompletedNotification({
            userName: user.name,
            userEmail: user.email,
            editPrompt: imageEdit.editPrompt,
            editedImageUrl: s3ImageUrl,
            editId: imageEdit._id.toString(),
          }).catch(err => console.error('[Callback] Failed to send notification:', err));
        }

        console.log(`[Callback] Image edit completed successfully: ${imageEdit._id}`);

        return NextResponse.json({
          success: true,
          message: 'Image edit completed',
          editId: imageEdit._id.toString(),
        });

      } catch (error) {
        console.error('[Callback] Error processing completed task:', error);
        
        // Mark as failed
        imageEdit.status = 'failed';
        imageEdit.error = error instanceof Error ? error.message : 'Failed to process result';
        imageEdit.completedAt = new Date();
        await imageEdit.save();

        // Refund credits
        const user = await User.findById(imageEdit.user);
        if (user) {
          user.credits += imageEdit.creditsUsed;
          await user.save();
          console.log(`[Callback] Refunded ${imageEdit.creditsUsed} credits to user`);

          // Send failure notification
          await sendImageEditFailedNotification({
            userName: user.name,
            userEmail: user.email,
            editPrompt: imageEdit.editPrompt,
            error: imageEdit.error,
            creditsRefunded: imageEdit.creditsUsed,
          }).catch(err => console.error('[Callback] Failed to send notification:', err));
        }

        return NextResponse.json(
          { error: 'Failed to process completed task' },
          { status: 500 }
        );
      }
    }

    // Handle failed task (Kie.ai sends status: 'FAILED')
    if (status === 'FAILED') {
      imageEdit.status = 'failed';
      imageEdit.error = failReason || 'Task failed';
      imageEdit.completedAt = new Date();
      await imageEdit.save();

      // Refund credits
      const user = await User.findById(imageEdit.user);
      if (user) {
        user.credits += imageEdit.creditsUsed;
        await user.save();
        console.log(`[Callback] Refunded ${imageEdit.creditsUsed} credits to user`);

        // Send failure notification
        await sendImageEditFailedNotification({
          userName: user.name,
          userEmail: user.email,
          editPrompt: imageEdit.editPrompt,
          error: imageEdit.error,
          creditsRefunded: imageEdit.creditsUsed,
        }).catch(err => console.error('[Callback] Failed to send notification:', err));
      }

      console.log(`[Callback] Image edit failed: ${imageEdit._id}`);

      return NextResponse.json({
        success: true,
        message: 'Image edit failed, credits refunded',
        editId: imageEdit._id.toString(),
      });
    }

    // Unknown status
    console.warn(`[Callback] Unknown status: ${status}`);
    return NextResponse.json({
      success: true,
      message: 'Callback received',
    });

  } catch (error) {
    console.error('[Callback] Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Download image from Kie.ai and save locally
 */
async function downloadAndSaveImage(imageUrl: string): Promise<string> {
  try {
    // Download image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate filename
    const ext = imageUrl.endsWith('.png') ? 'png' : 'jpg';
    const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';
    const filename = `edited-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    
    // Upload to S3
    const s3Url = await uploadEditedImageToS3(buffer, filename, contentType);
    console.log(`[Callback] Saved edited image to S3: ${s3Url}`);
    
    return s3Url;

  } catch (error) {
    console.error('[Callback] Error downloading image:', error);
    throw error;
  }
}

/**
 * Upload edited image to S3
 */
async function uploadEditedImageToS3(buffer: Buffer, filename: string, contentType: string): Promise<string> {
  const s3 = new aws.S3({
    signatureVersion: 'v4',
    endpoint: new aws.Endpoint(process.env.S3_ENDPOINT || ''),
    secretAccessKey: process.env.S3_SECRET_KEY || '',
    accessKeyId: process.env.S3_ACCESS_KEY || '',
    s3ForcePathStyle: true,
  });

  const bucketName = process.env.S3_BUCKET_NAME || '';
  const key = `edited/${filename}`;

  await s3.putObject({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: 'public-read',
  }).promise();

  const publicUrl = `https://${process.env.S3_ENDPOINT}/${bucketName}/${key}`;
  return publicUrl;
}
