import * as monaco from "monaco-editor";

// Type declarations for webpack require.context
declare const require: {
  context: (directory: string, useSubdirectories: boolean, regExp: RegExp) => {
    keys(): string[];
    (id: string): any;
  };
};

function importAll(r: any) {
  return r.keys().map(r);
}

console.log('Loading modules from require.context...');
const context = (require as any).context("../types/@algorandfoundation/algorand-typescript", true, /\.d\.ts$/);
const modules = context.keys().map((key: string) => ({ key, content: context(key) }));
console.log('Modules loaded:', modules.length, modules.map(m => m.key));

export function setupMonacoTypes(monaco: any) {
  console.log('Setting up Monaco types...', modules.length, 'files loaded');
  console.log('Monaco object:', monaco);
  
  modules.forEach(({ key, content }: { key: string; content: string }, i: number) => {
    const filePath = `file:///__typings__/@algorandfoundation/algorand-typescript${key.substring(1)}`;
    console.log(`Adding lib ${i}:`, key, '->', filePath);
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      content,
      filePath
    );
  });
  
  console.log('Added', modules.length, 'extra libs for Algorand TypeScript');

  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    allowJs: true,
    allowSyntheticDefaultImports: true,
    esModuleInterop: true,
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    typeRoots: ["file:///__typings__"],
    strict: false
  });
  
  console.log('Monaco TypeScript setup complete');
}