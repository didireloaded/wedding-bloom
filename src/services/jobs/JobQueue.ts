/**
 * ForeverVow — Background Job Queue
 * Asynchronous job processing to ensure CPU-intensive or network-heavy
 * operations (CSV imports, PDF generation, emails) never block the UI thread.
 */

export type JobType =
  | "CSV_IMPORT"
  | "MEMORY_BOOK_GEN"
  | "IMAGE_PROCESS"
  | "EMAIL_SEND"
  | "REMINDER_SCHEDULE"
  | "ANALYTICS_AGGREGATE";

export type JobStatus = "pending" | "running" | "completed" | "failed";

export interface Job<P = any, R = any> {
  id: string;
  type: JobType;
  payload: P;
  status: JobStatus;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  error?: string;
  result?: R;
}

export type JobHandler<P = any, R = any> = (payload: P, job: Job<P, R>) => Promise<R> | R;
type JobCompletionListener<R = any> = (job: Job<any, R>) => void;

export class JobQueueService {
  private jobs = new Map<string, Job>();
  private handlers = new Map<JobType, JobHandler>();
  private listeners = new Map<string, Set<JobCompletionListener>>();
  private isProcessing = false;

  /**
   * Register an asynchronous execution handler for a specific job type.
   */
  registerHandler<P, R>(type: JobType, handler: JobHandler<P, R>): void {
    this.handlers.set(type, handler as JobHandler);
  }

  /**
   * Enqueue a job for background processing. Returns a unique job ID immediately.
   */
  enqueue<P = any>(type: JobType, payload: P): string {
    const id = `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const job: Job<P> = {
      id,
      type,
      payload,
      status: "pending",
      createdAt: Date.now(),
    };

    this.jobs.set(id, job);
    this.scheduleProcessing();
    return id;
  }

  /**
   * Get current status and metadata of a queued job.
   */
  getJob<R = any>(jobId: string): Job<any, R> | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Subscribe to completion or failure notifications for a specific job.
   */
  onComplete<R = any>(jobId: string, listener: JobCompletionListener<R>): () => void {
    if (!this.listeners.has(jobId)) {
      this.listeners.set(jobId, new Set());
    }
    this.listeners.get(jobId)!.add(listener as JobCompletionListener);

    // If job already finished, notify immediately
    const job = this.jobs.get(jobId);
    if (job && (job.status === "completed" || job.status === "failed")) {
      try { listener(job); } catch (e) { console.error("[JobQueue] Listener error:", e); }
    }

    return () => {
      this.listeners.get(jobId)?.delete(listener as JobCompletionListener);
    };
  }

  /**
   * Get all jobs currently in the queue or history.
   */
  getAllJobs(): Job[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Clear all jobs and listeners from memory.
   */
  clear(): void {
    this.jobs.clear();
    this.listeners.clear();
    this.isProcessing = false;
  }

  private scheduleProcessing(): void {
    if (this.isProcessing) return;

    // Use setTimeout to yield execution back to the browser UI thread
    setTimeout(() => {
      void this.processNext();
    }, 0);
  }

  private async processNext(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      for (const job of this.jobs.values()) {
        if (job.status === "pending") {
          await this.executeJob(job);
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async executeJob(job: Job): Promise<void> {
    const handler = this.handlers.get(job.type);
    job.status = "running";
    job.startedAt = Date.now();
    this.jobs.set(job.id, job);

    try {
      if (!handler) {
        throw new Error(`No registered handler found for job type: ${job.type}`);
      }

      const result = await handler(job.payload, job);
      job.status = "completed";
      job.result = result;
      job.completedAt = Date.now();
    } catch (err: any) {
      job.status = "failed";
      job.error = err?.message || "Unknown job execution failure";
      job.completedAt = Date.now();
      console.error(`[JobQueue] Job ${job.id} (${job.type}) failed:`, err);
    } finally {
      this.jobs.set(job.id, job);
      this.notifyListeners(job);
    }
  }

  private notifyListeners(job: Job): void {
    const subs = this.listeners.get(job.id);
    if (subs) {
      subs.forEach((listener) => {
        try { listener(job); } catch (e) { console.error("[JobQueue] Listener callback error:", e); }
      });
    }
  }
}

export const JobQueue = new JobQueueService();
