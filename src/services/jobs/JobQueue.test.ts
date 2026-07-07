import { describe, it, expect, beforeEach, vi } from "vitest";
import { JobQueue, JobQueueService } from "./JobQueue";

describe("JobQueueService", () => {
  let queue: JobQueueService;

  beforeEach(() => {
    queue = new JobQueueService();
    vi.useRealTimers();
  });

  it("should enqueue a job with pending status and return unique ID", () => {
    const id = queue.enqueue("CSV_IMPORT", { fileUrl: "test.csv" });
    expect(typeof id).toBe("string");
    expect(id.startsWith("job_")).toBe(true);

    const job = queue.getJob(id);
    expect(job).toBeDefined();
    expect(job?.status).toBe("pending");
    expect(job?.payload).toEqual({ fileUrl: "test.csv" });
  });

  it("should execute registered handler asynchronously and mark as completed", async () => {
    const mockHandler = vi.fn().mockResolvedValue({ importedCount: 42 });
    queue.registerHandler("CSV_IMPORT", mockHandler);

    const id = queue.enqueue("CSV_IMPORT", { fileUrl: "guests.csv" });

    // Wait for microtask/setTimeout execution
    await new Promise((resolve) => setTimeout(resolve, 50));

    const job = queue.getJob(id);
    expect(job?.status).toBe("completed");
    expect(job?.result).toEqual({ importedCount: 42 });
    expect(mockHandler).toHaveBeenCalledWith({ fileUrl: "guests.csv" }, expect.any(Object));
  });

  it("should mark job as failed if handler throws an error", async () => {
    const mockHandler = vi.fn().mockRejectedValue(new Error("Corrupt CSV header"));
    queue.registerHandler("CSV_IMPORT", mockHandler);

    const id = queue.enqueue("CSV_IMPORT", { fileUrl: "bad.csv" });

    await new Promise((resolve) => setTimeout(resolve, 50));

    const job = queue.getJob(id);
    expect(job?.status).toBe("failed");
    expect(job?.error).toBe("Corrupt CSV header");
  });

  it("should notify subscribers when job finishes via onComplete", async () => {
    const mockHandler = vi.fn().mockResolvedValue("Success PDF");
    queue.registerHandler("MEMORY_BOOK_GEN", mockHandler);

    const id = queue.enqueue("MEMORY_BOOK_GEN", { weddingId: "wed-1" });

    const completionPromise = new Promise((resolve) => {
      queue.onComplete(id, (job) => {
        resolve(job);
      });
    });

    const finishedJob: any = await completionPromise;
    expect(finishedJob.status).toBe("completed");
    expect(finishedJob.result).toBe("Success PDF");
  });

  it("should fail gracefully if no handler is registered for job type", async () => {
    const id = queue.enqueue("IMAGE_PROCESS", { imageId: "img-1" });

    await new Promise((resolve) => setTimeout(resolve, 50));

    const job = queue.getJob(id);
    expect(job?.status).toBe("failed");
    expect(job?.error).toContain("No registered handler found");
  });
});
