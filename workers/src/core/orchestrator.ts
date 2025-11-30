import { queueManager } from './queue-manager';
import { mongoService } from '../services/mongodb.service';
import { Job } from '../models/job.model';
import {
  JobType,
  JobStatus,
  JobItemStatus,
  WorkerJobData,
  WorkerJobResult,
} from './types';
import { Pipeline, validatePipeline } from './pipelines';

/**
 * Pipeline execution state
 */
interface PipelineExecution {
  jobId: string;
  pipeline: Pipeline;
  completedSteps: Set<JobType>;
  results: Map<JobType, unknown>;
  stepIndices: Map<JobType, number>;
}

/**
 * Orchestrator for managing pipeline executions
 */
class PipelineOrchestrator {
  private executions: Map<string, PipelineExecution> = new Map();

  /**
   * Start a pipeline execution
   */
  async startPipeline(
    jobId: string,
    pipeline: Pipeline,
    overrideConfigs?: Map<JobType, Record<string, unknown>>
  ): Promise<void> {
    console.log(`[Orchestrator] Starting pipeline "${pipeline.name}" for job ${jobId}`);

    // Validate pipeline
    const validation = validatePipeline(pipeline);
    if (!validation.valid) {
      throw new Error(`Invalid pipeline: ${validation.errors.join(', ')}`);
    }

    // Get job from database
    console.log(`[Orchestrator] Searching for job ${jobId} in database...`);
    console.log(`[Orchestrator] Current database:`, Job.db.name);
    console.log(`[Orchestrator] Collection:`, Job.collection.name);
    console.log(`[Orchestrator] Full collection name:`, Job.collection.collectionName);
    
    // Try to count documents
    const count = await Job.countDocuments();
    console.log(`[Orchestrator] Total jobs in collection:`, count);
    
    // Try to list all jobs to debug
    const allJobs = await Job.find({}).limit(10).lean();
    console.log(`[Orchestrator] Found ${allJobs.length} jobs:`, allJobs.map((j: any) => ({ id: j._id, status: j.status })));
    
    const job = await Job.findById(jobId);
    if (!job) {
      console.error(`[Orchestrator] Job ${jobId} not found in database`);
      console.error(`[Orchestrator] MongoDB connection state:`, mongoService.isConnected());
      throw new Error(`Job ${jobId} not found`);
    }
    console.log(`[Orchestrator] Job found:`, { id: job._id, user: job.user, status: job.status });

    // Create execution state
    const execution: PipelineExecution = {
      jobId,
      pipeline,
      completedSteps: new Set(),
      results: new Map(),
      stepIndices: new Map(),
    };

    // Map job items to step indices
    job.items.forEach((item: any, index: number) => {
      execution.stepIndices.set(item.type as JobType, index);
    });

    this.executions.set(jobId, execution);

    // Update job status to processing
    await Job.findByIdAndUpdate(jobId, {
      $set: { status: JobStatus.PROCESSING, updatedAt: new Date() },
    });

    // Start executing steps that have no dependencies
    await this.executeReadySteps(jobId);
  }

  /**
   * Execute all steps that are ready (dependencies satisfied)
   */
  private async executeReadySteps(jobId: string): Promise<void> {
    const execution = this.executions.get(jobId);
    if (!execution) return;

    const job = await Job.findById(jobId);
    if (!job) return;

    for (let i = 0; i < execution.pipeline.steps.length; i++) {
      const step = execution.pipeline.steps[i];

      // Skip if already completed or processing
      if (execution.completedSteps.has(step.type)) continue;

      const itemIndex = execution.stepIndices.get(step.type);
      if (itemIndex === undefined) continue;

      const item = job.items[itemIndex];
      if (item.status !== JobItemStatus.PENDING) continue;

      // Check if dependencies are satisfied
      const dependenciesSatisfied = !step.dependsOn || step.dependsOn.every(dep => 
        execution.completedSteps.has(dep)
      );

      if (!dependenciesSatisfied) continue;

      // Execute step
      console.log(`[Orchestrator] Executing step ${step.type} for job ${jobId}`);
      await this.executeStep(jobId, step.type, itemIndex, step.config, execution.results);
    }
  }

  /**
   * Execute a single step
   */
  private async executeStep(
    jobId: string,
    type: JobType,
    itemIndex: number,
    config: any,
    previousResults: Map<JobType, unknown>
  ): Promise<void> {
    const job = await Job.findById(jobId);
    if (!job) return;

    // Build previous results for this step
    const results: WorkerJobData['previousResults'] = {
      enhancedImages: previousResults.get(JobType.ENHANCED_IMAGES) as string[] | undefined,
      text: previousResults.get(JobType.VIRAL_COPY) as string | undefined,
      audio: previousResults.get(JobType.VOICE_OVER) as string | undefined,
      captions: previousResults.get(JobType.CAPTIONS) as string | undefined,
    };

    // Create worker job data
    const workerJobData: WorkerJobData = {
      jobId,
      itemIndex,
      type,
      itemType: type, // Explicit type for routing
      pipelineName: this.executions.get(jobId)?.pipeline.name, // Pipeline name for prompt lookup
      config,
      originalImage: job.originalImage,
      productInfo: job.productInfo,
      previousResults: results,
    };

    // Add job to appropriate queue
    const queueName = this.getQueueNameForType(type);
    await queueManager.addJob(queueName, workerJobData);

    console.log(`[Orchestrator] Added job to ${queueName} for step ${type}`);
  }

  /**
   * Handle step completion
   */
  async handleStepComplete(result: WorkerJobResult): Promise<void> {
    const { jobId, itemIndex, success } = result;

    const execution = this.executions.get(jobId);
    if (!execution) {
      console.warn(`[Orchestrator] No execution found for job ${jobId}`);
      return;
    }

    const job = await Job.findById(jobId);
    if (!job) return;

    const item = job.items[itemIndex];
    const stepType = item.type as JobType;

    if (success && result.result) {
      console.log(`[Orchestrator] Step ${stepType} completed successfully for job ${jobId}`);
      
      // Store result
      execution.completedSteps.add(stepType);
      execution.results.set(stepType, result.result);

      // Execute next ready steps
      await this.executeReadySteps(jobId);

      // Check if pipeline is complete
      const allStepsCompleted = execution.pipeline.steps.every(step =>
        execution.completedSteps.has(step.type)
      );

      if (allStepsCompleted) {
        console.log(`[Orchestrator] Pipeline completed for job ${jobId}`);
        await Job.findByIdAndUpdate(jobId, {
          $set: { status: JobStatus.COMPLETED, progress: 100, updatedAt: new Date() },
        });
        this.executions.delete(jobId);
      }
    } else {
      console.error(`[Orchestrator] Step ${stepType} failed for job ${jobId}:`, result.error);
      
      // Mark job as failed
      await Job.findByIdAndUpdate(jobId, {
        $set: { status: JobStatus.FAILED, updatedAt: new Date() },
      });
      this.executions.delete(jobId);
    }
  }

  /**
   * Get queue name for job type
   */
  private getQueueNameForType(type: JobType): string {
    const queueMap: Record<JobType, string> = {
      [JobType.ENHANCED_IMAGES]: 'images-queue',
      [JobType.VIRAL_COPY]: 'text-queue',
      [JobType.VOICE_OVER]: 'voiceover-queue',
      [JobType.CAPTIONS]: 'captions-queue',
      [JobType.PROMOTIONAL_VIDEO]: 'video-queue',
    };

    return queueMap[type];
  }

  /**
   * Cancel pipeline execution
   */
  async cancelPipeline(jobId: string): Promise<void> {
    console.log(`[Orchestrator] Cancelling pipeline for job ${jobId}`);
    
    await Job.findByIdAndUpdate(jobId, {
      $set: { status: JobStatus.CANCELLED, updatedAt: new Date() },
    });

    this.executions.delete(jobId);
  }

  /**
   * Get pipeline execution status
   */
  getExecutionStatus(jobId: string): {
    running: boolean;
    completedSteps: JobType[];
    totalSteps: number;
  } | null {
    const execution = this.executions.get(jobId);
    if (!execution) return null;

    return {
      running: true,
      completedSteps: Array.from(execution.completedSteps),
      totalSteps: execution.pipeline.steps.length,
    };
  }
}

export const orchestrator = new PipelineOrchestrator();
