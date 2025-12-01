import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Job } from '@/lib/models/Job';

/**
 * POST /api/jobs/retry
 * Retry a failed job
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the job
    const job = await Job.findById(jobId);
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Only allow retry for failed jobs
    if (job.status !== 'failed') {
      return NextResponse.json(
        { error: 'Only failed jobs can be retried' },
        { status: 400 }
      );
    }

    // Reset job status and failed items
    job.status = 'pending';
    job.progress = 0;
    
    // Reset all failed items to pending
    job.items.forEach((item: any) => {
      if (item.status === 'failed') {
        item.status = 'pending';
        // Clear error from result if exists
        if (item.result?.error) {
          delete item.result.error;
        }
      }
    });

    await job.save();

    // Re-enqueue the job in orchestrator
    try {
      const { queueManager } = await import('@/lib/queue-manager');
      const { determinePipeline } = await import('@/lib/pipeline-mapper');

      const pipelineName = determinePipeline(job.items);

      await queueManager.addJob('orchestrator-queue', {
        jobId: job._id.toString(),
        pipelineName,
      });

      console.log(`[API] Job ${jobId} retried and re-enqueued with pipeline: ${pipelineName}`);
    } catch (queueError) {
      console.error('[API] Error adding job to queue:', queueError);
      throw new Error('Failed to re-enqueue job');
    }

    return NextResponse.json({
      success: true,
      message: 'Job retried successfully',
      job: {
        id: job._id.toString(),
        status: job.status,
        progress: job.progress,
      },
    });

  } catch (error) {
    console.error('[API] Error retrying job:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to retry job' },
      { status: 500 }
    );
  }
}
