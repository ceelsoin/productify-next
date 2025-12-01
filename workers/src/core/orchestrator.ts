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
import { RefundService } from '../services/refund.service';

/**
 * Pipeline execution state
 */
interface PipelineExecution {
  jobId: string;
  pipelineId: string; // ID do pipeline (ex: "viral-copy-only")
  pipeline: Pipeline;
  completedItems: Set<number>; // Track by item index instead of type
  results: Map<JobType, unknown>;
}

/**
 * Orchestrator for managing pipeline executions
 */
class PipelineOrchestrator {
  private executions: Map<string, PipelineExecution> = new Map();

  /**
   * Start a pipeline execution with dynamic pipeline creation
   */
  async startPipeline(
    jobId: string,
    pipeline: Pipeline | null = null, // Pipeline can be null for dynamic creation
    pipelineId?: string,
    overrideConfigs?: Map<JobType, Record<string, unknown>>
  ): Promise<void> {
    // Get job from database first
    const job = await Job.findById(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    console.log(`[Orchestrator] Starting pipeline for job ${jobId}`);
    console.log(`[Orchestrator] Job items:`, job.items.map((i: any) => i.type));

    // If no pipeline provided, create one dynamically from job items
    if (!pipeline) {
      pipeline = this.createDynamicPipeline(job.items);
      pipelineId = pipelineId || 'dynamic-pipeline';
    }

    console.log(`[Orchestrator] Using pipeline: ${pipeline.name} (${pipelineId})`);

    // Validate pipeline
    const validation = validatePipeline(pipeline);
    if (!validation.valid) {
      throw new Error(`Invalid pipeline: ${validation.errors.join(', ')}`);
    }

    // Create execution state
    const execution: PipelineExecution = {
      jobId,
      pipelineId: pipelineId || 'unknown',
      pipeline,
      completedItems: new Set(),
      results: new Map(),
    };

    this.executions.set(jobId, execution);

    // Update job status to processing
    await Job.findByIdAndUpdate(jobId, {
      $set: { status: JobStatus.PROCESSING, updatedAt: new Date() },
    });

    // Start executing items that have no dependencies
    await this.executeReadySteps(jobId);
  }

  /**
   * Create a dynamic pipeline based on job items and their dependencies
   */
  private createDynamicPipeline(items: any[]): Pipeline {
    // Define possible dependencies (não obrigatórias)
    const POSSIBLE_DEPENDENCIES: Record<string, string[]> = {
      'enhanced-images': [],
      'viral-copy': [],
      'product-description': [],
      'voice-over': ['viral-copy', 'product-description'], // Pode usar qualquer texto gerado
      'captions': ['voice-over'],
      'promotional-video': ['enhanced-images'],
    };

    // Criar conjunto de tipos presentes no job
    const availableTypes = new Set(items.map((item: any) => item.type));

    const steps = items.map((item: any) => {
      const itemType = item.type as JobType;
      const possibleDeps = POSSIBLE_DEPENDENCIES[item.type] || [];
      
      // Filtrar apenas dependências que existem no job atual
      const dependencies = possibleDeps.filter(dep => availableTypes.has(dep));

      return {
        type: itemType,
        dependsOn: dependencies.map(dep => {
          // Map dependency string to JobType
          const depMap: Record<string, JobType> = {
            'enhanced-images': JobType.ENHANCED_IMAGES,
            'viral-copy': JobType.VIRAL_COPY,
            'product-description': JobType.PRODUCT_DESCRIPTION,
            'voice-over': JobType.VOICE_OVER,
            'captions': JobType.CAPTIONS,
            'promotional-video': JobType.PROMOTIONAL_VIDEO,
          };
          return depMap[dep];
        }).filter(Boolean),
        config: {},
      };
    });

    return {
      name: `Dynamic Pipeline (${items.map(i => i.type).join('+')})`,
      description: 'Automatically generated pipeline based on selected items',
      steps,
    };
  }

  /**
   * Execute all items that are ready (dependencies satisfied)
   */
  private async executeReadySteps(jobId: string): Promise<void> {
    const execution = this.executions.get(jobId);
    if (!execution) return;

    const job = await Job.findById(jobId);
    if (!job) return;

    // Get set of completed item types for dependency checking
    const completedTypes = new Set<string>();
    for (let idx = 0; idx < job.items.length; idx++) {
      if (execution.completedItems.has(idx)) {
        completedTypes.add(job.items[idx].type);
      }
    }

    console.log(`[Orchestrator] Completed types:`, Array.from(completedTypes));

    // Iterate through all job items
    for (let itemIndex = 0; itemIndex < job.items.length; itemIndex++) {
      const item = job.items[itemIndex];
      const itemType = item.type as JobType;

      console.log(`[Orchestrator] Checking item ${itemIndex} (${itemType}), status: ${item.status}, completed: ${execution.completedItems.has(itemIndex)}`);

      // Skip if already completed or processing
      if (execution.completedItems.has(itemIndex)) {
        console.log(`[Orchestrator] Item ${itemIndex} already completed, skipping`);
        continue;
      }
      if (item.status !== JobItemStatus.PENDING) {
        console.log(`[Orchestrator] Item ${itemIndex} not pending (${item.status}), skipping`);
        continue;
      }

      // Find matching pipeline step for this item type
      const step = execution.pipeline.steps.find(s => s.type === itemType);
      if (!step) {
        console.warn(`[Orchestrator] No pipeline step found for item type ${itemType}`);
        continue;
      }

      // Check if dependencies are satisfied based on completed TYPES (not indices)
      const dependenciesSatisfied = !step.dependsOn || step.dependsOn.length === 0 || 
        step.dependsOn.every(depType => {
          const depTypeName = this.getJobTypeName(depType);
          const satisfied = completedTypes.has(depTypeName);
          console.log(`[Orchestrator] Checking dependency ${depTypeName} for ${itemType}: ${satisfied}`);
          return satisfied;
        });

      if (!dependenciesSatisfied) {
        console.log(`[Orchestrator] Item ${itemIndex} (${itemType}) dependencies not satisfied, skipping`);
        continue;
      }

      // Execute item
      console.log(`[Orchestrator] Executing item ${itemIndex} (${itemType}) for job ${jobId}`);
      await this.executeStep(jobId, itemType, itemIndex, item.config, execution.results);
    }
  }

  /**
   * Helper to convert JobType enum to string name
   */
  private getJobTypeName(jobType: JobType): string {
    const typeMap: Record<JobType, string> = {
      [JobType.ENHANCED_IMAGES]: 'enhanced-images',
      [JobType.VIRAL_COPY]: 'viral-copy',
      [JobType.PRODUCT_DESCRIPTION]: 'product-description',
      [JobType.VOICE_OVER]: 'voice-over',
      [JobType.CAPTIONS]: 'captions',
      [JobType.PROMOTIONAL_VIDEO]: 'promotional-video',
    };
    return typeMap[jobType];
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
    const execution = this.executions.get(jobId);
    const workerJobData: WorkerJobData = {
      jobId,
      itemIndex,
      type,
      itemType: type, // Explicit type for routing
      pipelineName: execution?.pipelineId, // Pipeline ID (ex: "viral-copy-only") for prompt lookup
      config,
      originalImage: job.originalImage,
      productInfo: job.productInfo,
      previousResults: results,
    };

    console.log(`[Orchestrator] Sending to worker - Type: ${type}, Pipeline: ${execution?.pipelineId}`);
    console.log(`[Orchestrator] Config being sent:`, JSON.stringify(config, null, 2));

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
    const itemType = item.type as JobType;

    if (success && result.result) {
      console.log(`[Orchestrator] Item ${itemIndex} (${itemType}) completed successfully for job ${jobId}`);
      
      // Store result
      execution.completedItems.add(itemIndex);
      execution.results.set(itemType, result.result);

      // Execute next ready items
      await this.executeReadySteps(jobId);

      // Check if all items are complete
      const allItemsCompleted = execution.completedItems.size === job.items.length;

      if (allItemsCompleted) {
        console.log(`[Orchestrator] All items completed for job ${jobId}`);
        await Job.findByIdAndUpdate(jobId, {
          $set: { status: JobStatus.COMPLETED, progress: 100, updatedAt: new Date() },
        });
        this.executions.delete(jobId);
      }
    } else {
      console.error(`[Orchestrator] Item ${itemIndex} (${itemType}) failed for job ${jobId}:`, result.error);
      
      // Count completed items before marking as failed
      const completedItems = execution.completedItems.size;
      const totalItems = job.items.length;
      
      // Mark job as failed
      await Job.findByIdAndUpdate(jobId, {
        $set: { status: JobStatus.FAILED, failedAt: new Date(), updatedAt: new Date() },
      });
      
      // Process automatic refund based on completion
      try {
        console.log(`[Orchestrator] Processing refund for failed job ${jobId} (${completedItems}/${totalItems} completed)`);
        
        if (completedItems === 0) {
          // Full refund if nothing completed
          await RefundService.processJobFailureRefund(jobId);
        } else if (completedItems < totalItems) {
          // Partial refund if some items completed
          await RefundService.processPartialRefund(jobId, completedItems, totalItems);
        }
      } catch (error) {
        console.error(`[Orchestrator] Failed to process refund for job ${jobId}:`, error);
      }
      
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
      [JobType.PRODUCT_DESCRIPTION]: 'text-queue', // Uses same text generation worker
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
    completedItems: number[];
    totalItems: number;
  } | null {
    const execution = this.executions.get(jobId);
    if (!execution) return null;

    return {
      running: true,
      completedItems: Array.from(execution.completedItems),
      totalItems: execution.completedItems.size,
    };
  }
}

export const orchestrator = new PipelineOrchestrator();
