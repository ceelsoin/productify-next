import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ImageEdit from '@/models/ImageEdit';

/**
 * POST /api/images/edit
 * Submit an image edit task to Kie.ai Nano Banana Edit
 * 
 * Body:
 * {
 *   imageUrl: string,
 *   editPrompt: string,
 *   outputFormat?: 'PNG' | 'JPEG',
 *   imageSize?: '1:1' | '9:16' | '16:9' | '3:4' | '4:3' | '2:3' | '3:2' | '5:4' | '4:5' | '21:9' | 'auto'
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // TODO: Add authentication when implemented
    // For now, skip auth check to allow testing
    
    // Parse request body
    const body = await req.json();
    const { imageUrl, editPrompt, outputFormat = 'JPEG', imageSize = 'auto' } = body;

    // Validate required fields
    if (!imageUrl || !editPrompt) {
      return NextResponse.json(
        { error: 'imageUrl and editPrompt are required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // TODO: Re-enable user/credits check when auth is implemented
    // const user = await User.findOne({ email: session.user.email });
    // if (!user) {
    //   return NextResponse.json(
    //     { error: 'User not found' },
    //     { status: 404 }
    //   );
    // }

    // Check credits (editing costs 5 credits)
    // const editCost = 5;
    // if (user.credits < editCost) {
    //   return NextResponse.json(
    //     { error: 'Insufficient credits', required: editCost, available: user.credits },
    //     { status: 402 }
    //   );
    // }

    // Deduct credits
    // user.credits -= editCost;
    // await user.save();

    // Upload image to Kie.ai
    const kieApiKey = process.env.KIE_API_KEY;
    if (!kieApiKey) {
      // Refund credits
      // user.credits += editCost;
      // await user.save();
      
      return NextResponse.json(
        { error: 'Image editing service not configured' },
        { status: 503 }
      );
    }

    try {
      // Validate that imageUrl is a public S3 URL
      const s3Endpoint = process.env.S3_ENDPOINT;
      const s3Bucket = process.env.S3_BUCKET_NAME;
      
      if (!imageUrl.includes(s3Endpoint || '') || !imageUrl.includes(s3Bucket || '')) {
        throw new Error('Image must be hosted on S3. Please upload the image first.');
      }

      console.log(`[API] Using public S3 image URL: ${imageUrl}`);

      // Submit edit task with callback URL
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const callbackUrl = `${appUrl}/api/images/edit/callback`;

      // Note: Kie.ai expects 'png' or 'jpg' (not 'jpeg')
      const normalizedFormat = outputFormat.toLowerCase() === 'jpeg' ? 'jpg' : outputFormat.toLowerCase();

      const kieInput: any = {
        prompt: editPrompt,
        aspect_ratio: imageSize === 'auto' ? '4:5' : imageSize,
        resolution: '4K',
        output_format: normalizedFormat,
        image_input: [imageUrl],
      };

      const kiePayload = {
        model: 'nano-banana-pro',
        input: kieInput,
        callBackUrl: callbackUrl,
      };

      console.log(`[API] Submitting to Kie.ai:`, JSON.stringify(kiePayload, null, 2));

      const taskResponse = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${kieApiKey}`,
        },
        body: JSON.stringify(kiePayload),
      });

      if (!taskResponse.ok) {
        const errorText = await taskResponse.text();
        console.error(`[API] Kie.ai error:`, errorText);
        throw new Error(`Failed to submit edit task: ${taskResponse.statusText} - ${errorText}`);
      }

      const responseData: any = await taskResponse.json();
      console.log(`[API] Kie.ai response:`, JSON.stringify(responseData, null, 2));

      // Check Kie.ai response
      if (responseData.code !== 200) {
        throw new Error(`Kie.ai error: ${responseData.msg || 'Unknown error'}`);
      }

      const taskId = responseData.data?.taskId;
      
      if (!taskId) {
        throw new Error(`No task ID in response: ${JSON.stringify(responseData)}`);
      }

      // Create ImageEdit record to track the task
      const imageEdit = await ImageEdit.create({
        // user: user._id, // TODO: Add when auth implemented
        taskId,
        originalImageUrl: imageUrl,
        editPrompt,
        outputFormat,
        imageSize,
        status: 'processing',
        creditsUsed: 0, // editCost, // TODO: Add when auth implemented
        createdAt: new Date(),
      });

      console.log(`[API] Image edit task created: ${imageEdit._id}`);
      console.log(`[API] Kie.ai task ID: ${taskId}`);
      console.log(`[API] Callback URL: ${callbackUrl}`);

      return NextResponse.json({
        success: true,
        editId: imageEdit._id.toString(),
        taskId,
        status: 'processing',
        message: 'Image edit submitted successfully. You will be notified when complete.',
        creditsUsed: 0, // editCost,
        creditsRemaining: 0, // user.credits,
      });

    } catch (error) {
      // Refund credits on error
      // user.credits += editCost;
      // await user.save();

      console.error('[API] Error submitting edit task:', error);
      return NextResponse.json(
        { error: 'Failed to submit edit task', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('[API] Error editing image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
