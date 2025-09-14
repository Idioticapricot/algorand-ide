export class PyodideCompiler {
  private worker: Worker | null = null;
  private isInitialized = false;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.worker = new Worker('/workers/pyodideWorker.js');
      
      this.worker.onmessage = (e) => {
        const { type } = e.data;
        if (type === 'inited') {
          this.isInitialized = true;
          resolve();
        }
      };

      this.worker.onerror = (error) => {
        reject(error);
      };

      this.worker.postMessage({ type: 'init' });
    });
  }

  async compile(filename: string, code: string): Promise<{ elapsed?: number; error?: string }> {
    if (!this.worker || !this.isInitialized) {
      throw new Error('Pyodide compiler not initialized');
    }

    return new Promise((resolve) => {
      this.worker!.onmessage = (e) => {
        const { type, elapsed, error } = e.data;
        if (type === 'compiled') {
          resolve({ elapsed });
        } else if (type === 'error') {
          resolve({ error });
        }
      };

      this.worker!.postMessage({ type: 'compile', filename, code });
    });
  }

  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
    }
  }
}