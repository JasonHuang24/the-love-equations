import { analyzeDocument } from './lab-analyzer.js?v=2.6.3';

const cancelledJobs = new Set();

self.addEventListener('message', async (event) => {
  const message = event.data || {};

  if (message.type === 'cancel' && message.jobId) {
    cancelledJobs.add(message.jobId);
    return;
  }

  if (message.type !== 'analyze' || !message.jobId) return;
  const { jobId, document, canonIndex, options } = message;
  cancelledJobs.delete(jobId);

  try {
    const result = await analyzeDocument(document, canonIndex, {
      ...options,
      isCancelled: () => cancelledJobs.has(jobId),
      onProgress(progress) {
        self.postMessage({ type: 'progress', jobId, progress });
      },
    });
    if (!cancelledJobs.has(jobId)) {
      self.postMessage({ type: 'result', jobId, result });
    }
  } catch (error) {
    const cancelled = cancelledJobs.has(jobId) || error?.name === 'AbortError';
    self.postMessage({
      type: cancelled ? 'cancelled' : 'error',
      jobId,
      error: cancelled ? null : {
        name: error?.name || 'Error',
        message: error?.message || 'Analysis failed.',
      },
    });
  } finally {
    cancelledJobs.delete(jobId);
  }
});
