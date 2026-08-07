import { analyzeDocument } from './lab-analyzer.js?v=2.6.19';

function abortError() {
  try {
    return new DOMException('Analysis cancelled', 'AbortError');
  } catch {
    const error = new Error('Analysis cancelled');
    error.name = 'AbortError';
    return error;
  }
}

/**
 * Runs analysis in a module worker and falls back to the same engine on the
 * main thread when workers are blocked. Both routes use the exact same
 * deterministic analyzer contract.
 */
export class LabAnalyzerClient {
  constructor({ workerUrl = new URL('./lab-analyzer-worker.js?v=2.6.19', import.meta.url) } = {}) {
    this.workerUrl = workerUrl;
    this.worker = null;
    this.jobs = new Map();
    this.sequence = 0;
    this.workerUnavailable = false;
  }

  ensureWorker() {
    if (this.worker || this.workerUnavailable || typeof Worker === 'undefined') return this.worker;
    try {
      this.worker = new Worker(this.workerUrl, { type: 'module', name: 'le-lab-analyzer' });
      this.worker.addEventListener('message', (event) => this.handleMessage(event.data || {}));
      this.worker.addEventListener('error', (event) => {
        const error = new Error(event?.message || 'The analyzer worker failed. Retry to use the main-thread fallback.');
        error.name = 'WorkerError';
        this.jobs.forEach((job) => job.reject(error));
        this.jobs.clear();
        this.workerUnavailable = true;
        this.worker?.terminate();
        this.worker = null;
      });
    } catch {
      this.workerUnavailable = true;
      this.worker = null;
    }
    return this.worker;
  }

  handleMessage(message) {
    const job = this.jobs.get(message.jobId);
    if (!job) return;
    if (message.type === 'progress') {
      job.onProgress(message.progress);
      return;
    }
    this.jobs.delete(message.jobId);
    if (message.type === 'result') job.resolve(message.result);
    else if (message.type === 'cancelled') job.reject(abortError());
    else if (message.type === 'error') {
      const error = new Error(message.error?.message || 'Analysis failed.');
      error.name = message.error?.name || 'Error';
      job.reject(error);
    }
  }

  /**
   * `diagnostics` is the opt-in Pass B trace: `true` for the whole document, or
   * `{ segmentIds: [...] }` for those claim units only. It is forwarded verbatim
   * on BOTH routes so the worker and the main-thread fallback stay the same
   * analyzer with the same options, not two engines that happen to agree on the
   * default path. The scoped form is what keeps a single flag from cloning a
   * document-sized trace back across the worker boundary.
   */
  analyze(document, canonIndex, {
    signal, onProgress = () => {}, domainOverrides = null, diagnostics = false,
  } = {}) {
    const jobId = `job-${Date.now().toString(36)}-${(++this.sequence).toString(36)}`;
    const worker = this.ensureWorker();

    if (!worker) {
      let cancelled = Boolean(signal?.aborted);
      const onAbort = () => { cancelled = true; };
      signal?.addEventListener('abort', onAbort, { once: true });
      return analyzeDocument(document, canonIndex, {
        isCancelled: () => cancelled,
        onProgress,
        domainOverrides,
        diagnostics,
      }).finally(() => signal?.removeEventListener('abort', onAbort));
    }

    return new Promise((resolve, reject) => {
      const onAbort = () => {
        worker.postMessage({ type: 'cancel', jobId });
        this.jobs.delete(jobId);
        reject(abortError());
      };
      if (signal?.aborted) {
        reject(abortError());
        return;
      }
      signal?.addEventListener('abort', onAbort, { once: true });
      this.jobs.set(jobId, {
        resolve: (value) => {
          signal?.removeEventListener('abort', onAbort);
          resolve(value);
        },
        reject: (error) => {
          signal?.removeEventListener('abort', onAbort);
          reject(error);
        },
        onProgress,
      });
      worker.postMessage({ type: 'analyze', jobId, document, canonIndex, options: { domainOverrides, diagnostics } });
    });
  }

  reset() {
    this.jobs.forEach((job) => job.reject(abortError()));
    this.jobs.clear();
    if (this.worker) this.worker.terminate();
    this.worker = null;
    this.workerUnavailable = false;
  }

  destroy() {
    this.reset();
    this.workerUnavailable = true;
  }
}
