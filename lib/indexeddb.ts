// IndexedDB utilities for persisting file changes across templates

const DB_NAME = 'AlgorandIDE';
const DB_VERSION = 1;
const STORE_NAME = 'files';

interface FileRecord {
  id: string; // template:filePath
  template: string;
  filePath: string;
  content: string;
  lastModified: number;
}

class IndexedDBManager {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('template', 'template', { unique: false });
        }
      };
    });
  }

  async saveFile(template: string, filePath: string, content: string): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const record: FileRecord = {
      id: `${template}:${filePath}`,
      template,
      filePath,
      content,
      lastModified: Date.now()
    };
    
    return new Promise((resolve, reject) => {
      const request = store.put(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getFile(template: string, filePath: string): Promise<string | null> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.get(`${template}:${filePath}`);
      request.onsuccess = () => {
        const result = request.result as FileRecord | undefined;
        resolve(result ? result.content : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAllFiles(template: string): Promise<Record<string, string>> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('template');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(template);
      request.onsuccess = () => {
        const records = request.result as FileRecord[];
        const files: Record<string, string> = {};
        records.forEach(record => {
          files[record.filePath] = record.content;
        });
        resolve(files);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async seedTemplate(template: string, initialFiles: any): Promise<void> {
    const existingFiles = await this.getAllFiles(template);
    if (Object.keys(existingFiles).length > 0) return;
    
    const flatFiles = this.flattenFileTree(initialFiles);
    for (const [filePath, content] of Object.entries(flatFiles)) {
      await this.saveFile(template, filePath, content);
    }
  }

  private flattenFileTree(tree: any, currentPath = ''): Record<string, string> {
    const files: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(tree)) {
      const fullPath = currentPath ? `${currentPath}/${key}` : key;
      
      if (value && typeof value === 'object') {
        if ('file' in value && value.file?.contents) {
          files[fullPath] = value.file.contents;
        } else if ('directory' in value) {
          Object.assign(files, this.flattenFileTree(value.directory, fullPath));
        }
      }
    }
    
    return files;
  }
}

export const indexedDBManager = new IndexedDBManager();