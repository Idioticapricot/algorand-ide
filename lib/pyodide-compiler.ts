export class PyodideCompiler {
  private worker: Worker | null = null;
  private isInitialized = false;

  async init(template?: string): Promise<void> {
    console.log(`[PyodideCompiler] Initializing for template: ${template}`);
    return new Promise((resolve, reject) => {
      this.worker = new Worker('/workers/pyodideWorker.js');
      
      this.worker.onmessage = (e) => {
        const { type, error } = e.data;
        console.log(`[PyodideCompiler] Received message from worker:`, { type });
        if (type === 'inited') {
          console.log(`[PyodideCompiler] Initialization completed successfully`);
          this.isInitialized = true;
          resolve();
        } else if (type === 'error') {
          console.error(`[PyodideCompiler] Initialization failed:`, error);
          reject(new Error(error));
        }
      };

      this.worker.onerror = (error) => {
        console.error(`[PyodideCompiler] Worker error:`, error);
        reject(error);
      };

      console.log(`[PyodideCompiler] Sending init message to worker`);
      this.worker.postMessage({ type: 'init', template });
    });
  }

  async compile(filename: string, code: string): Promise<{ elapsed?: number; error?: string; files?: string[] }> {
    if (!this.worker || !this.isInitialized) {
      throw new Error('Pyodide compiler not initialized');
    }

    console.log(`[PyodideCompiler] Starting compilation of ${filename} (${code.length} chars)`);
    return new Promise((resolve) => {
      this.worker!.onmessage = (e) => {
        const { type, elapsed, error, files } = e.data;
        console.log(`[PyodideCompiler] Received compilation result:`, { type, elapsed, filesCount: files?.length });
        if (type === 'compiled') {
          console.log(`[PyodideCompiler] Compilation successful in ${elapsed}s, found ${files?.length || 0} files`);
          resolve({ elapsed, files });
        } else if (type === 'error') {
          console.error(`[PyodideCompiler] Compilation failed:`, error);
          resolve({ error });
        }
      };

      this.worker!.postMessage({ type: 'compile', filename, code });
    });
  }

  async readFile(filepath: string): Promise<{ content?: string; error?: string }> {
    if (!this.worker || !this.isInitialized) {
      throw new Error('Pyodide compiler not initialized');
    }

    console.log(`[PyodideCompiler] Reading file: ${filepath}`);
    return new Promise((resolve) => {
      this.worker!.onmessage = (e) => {
        const { type, content, error } = e.data;
        if (type === 'fileRead') {
          console.log(`[PyodideCompiler] File read successfully: ${filepath} (${content?.length || 0} chars)`);
          resolve({ content });
        } else if (type === 'error') {
          console.error(`[PyodideCompiler] Failed to read file ${filepath}:`, error);
          resolve({ error });
        }
      };

      this.worker!.postMessage({ type: 'readFile', filepath });
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