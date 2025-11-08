import * as monaco from "monaco-editor";

// Type declarations for webpack require.context
declare const require: {
  context: (directory: string, useSubdirectories: boolean, regExp: RegExp) => {
    keys(): string[];
    (id: string): any;
  };
};

type Template = 'pyteal' | 'tealscript' | 'puyapy' | 'puyats';

let puyaTsModules: { key: string; content: string }[] | null = null;

function loadPuyaTsTypes() {
  if (puyaTsModules === null) {
    // Skip loading during build to prevent Vercel build errors
    if (typeof window === 'undefined') {
      console.log('Skipping PuyaTs type loading during build');
      puyaTsModules = [];
      return puyaTsModules;
    }
    
    console.log('Loading PuyaTs modules from require.context...');
    try {
      const context = (require as any).context("../types/@algorandfoundation/algorand-typescript", true, /\.d\.ts$/);
      puyaTsModules = context.keys().map((key: string) => ({ key, content: context(key) }));
      console.log('PuyaTs modules loaded:', puyaTsModules.length, puyaTsModules.map(m => m.key));
    } catch (error) {
      console.warn('Failed to load PuyaTs types:', error);
      puyaTsModules = [];
    }
  }
  return puyaTsModules;
}

function setupPuyaPyIntelliSense(monaco: any) {
  console.log('Setting up PuyaPy IntelliSense...');
  
  // Core algopy types
  const ALGOPY_CORE_TYPES = [
    { label: 'UInt64', kind: monaco.languages.CompletionItemKind.Class, detail: 'algopy.UInt64', documentation: '64-bit unsigned integer, one of the primary data types on the AVM. Supports arithmetic operations.', insertText: 'UInt64' },
    { label: 'BigUInt', kind: monaco.languages.CompletionItemKind.Class, detail: 'algopy.BigUInt', documentation: 'Variable length (max 512-bit) unsigned integer for large number operations', insertText: 'BigUInt' },
    { label: 'Bytes', kind: monaco.languages.CompletionItemKind.Class, detail: 'algopy.Bytes', documentation: 'Byte sequence with a maximum length of 4096 bytes. Represents binary data.', insertText: 'Bytes' },
    { label: 'String', kind: monaco.languages.CompletionItemKind.Class, detail: 'algopy.String', documentation: 'UTF-8 encoded string type. Length is total bytes, not characters.', insertText: 'String' },
    { label: 'Account', kind: monaco.languages.CompletionItemKind.Class, detail: 'algopy.Account', documentation: 'Represents an Algorand network account with properties like balance and auth_address', insertText: 'Account' },
    { label: 'Application', kind: monaco.languages.CompletionItemKind.Class, detail: 'algopy.Application', documentation: 'Represents an Algorand application with ID and associated metadata', insertText: 'Application' },
    { label: 'Asset', kind: monaco.languages.CompletionItemKind.Class, detail: 'algopy.Asset', documentation: 'Represents an Algorand Standard Asset with properties like creator and decimals', insertText: 'Asset' },
    { label: 'Contract', kind: monaco.languages.CompletionItemKind.Class, detail: 'algopy.Contract', documentation: 'Base class for Algorand smart contracts requiring approval and clear state programs', insertText: 'Contract' },
    { label: 'ARC4Contract', kind: monaco.languages.CompletionItemKind.Class, detail: 'algopy.ARC4Contract', documentation: 'Contract conforming to ARC-4 ABI specification with automatic method routing', insertText: 'ARC4Contract' },
    { label: 'GlobalState', kind: monaco.languages.CompletionItemKind.Class, detail: 'algopy.GlobalState', documentation: 'Global state associated with the application. Usage: GlobalState[Type](initial_value)', insertText: 'GlobalState' },
    { label: 'LocalState', kind: monaco.languages.CompletionItemKind.Class, detail: 'algopy.LocalState', documentation: 'Local state associated with the application and an account', insertText: 'LocalState' },
    { label: 'Box', kind: monaco.languages.CompletionItemKind.Class, detail: 'algopy.Box', documentation: 'Abstracts the reading and writing of a single value to a single box storage', insertText: 'Box' },
    { label: 'BoxMap', kind: monaco.languages.CompletionItemKind.Class, detail: 'algopy.BoxMap', documentation: 'Abstracts reading/writing of a set of boxes using a common key and content type', insertText: 'BoxMap' },
    { label: 'BoxRef', kind: monaco.languages.CompletionItemKind.Class, detail: 'algopy.BoxRef', documentation: 'Abstracts reading/writing of boxes containing raw binary data', insertText: 'BoxRef' },
    { label: 'Txn', kind: monaco.languages.CompletionItemKind.Variable, detail: 'algopy.Txn', documentation: 'Access current transaction fields like sender, amount, fee, etc.', insertText: 'Txn' },
    { label: 'Global', kind: monaco.languages.CompletionItemKind.Variable, detail: 'algopy.Global', documentation: 'Access blockchain global properties like latest_timestamp, current_application_id', insertText: 'Global' },
  ];

  // ARC-4 specific types
  const ARC4_TYPES = [
    { label: 'arc4.String', kind: monaco.languages.CompletionItemKind.Class, detail: 'algopy.arc4.String', documentation: 'ARC-4 encoded UTF-8 string. Use .native to convert to algopy.String', insertText: 'arc4.String' },
    { label: 'arc4.Bool', kind: monaco.languages.CompletionItemKind.Class, detail: 'algopy.arc4.Bool', documentation: 'ARC-4 encoded boolean value', insertText: 'arc4.Bool' },
    { label: 'arc4.UInt64', kind: monaco.languages.CompletionItemKind.Class, detail: 'algopy.arc4.UInt64', documentation: 'ARC-4 encoded 64-bit unsigned integer. Use .native to convert to UInt64', insertText: 'arc4.UInt64' },
    { label: 'arc4.Address', kind: monaco.languages.CompletionItemKind.Class, detail: 'algopy.arc4.Address', documentation: '32-byte Algorand address in ARC-4 encoding', insertText: 'arc4.Address' },
    { label: 'arc4.DynamicArray', kind: monaco.languages.CompletionItemKind.Class, detail: 'algopy.arc4.DynamicArray', documentation: 'ARC-4 encoded variable-size array. Usage: arc4.DynamicArray[ItemType]', insertText: 'arc4.DynamicArray' },
    { label: 'arc4.StaticArray', kind: monaco.languages.CompletionItemKind.Class, detail: 'algopy.arc4.StaticArray', documentation: 'ARC-4 encoded fixed-size array. Usage: arc4.StaticArray[ItemType, Literal[Size]]', insertText: 'arc4.StaticArray' },
    { label: 'arc4.Struct', kind: monaco.languages.CompletionItemKind.Class, detail: 'algopy.arc4.Struct', documentation: 'ARC-4 encoded named tuple (struct). Supports frozen and kw_only parameters', insertText: 'arc4.Struct' },
  ];

  // Functions and decorators
  const ALGOPY_FUNCTIONS = [
    { label: 'log', kind: monaco.languages.CompletionItemKind.Function, detail: 'algopy.log()', documentation: 'Concatenates and logs supplied args as a single bytes value to the transaction log', insertText: 'log' },
    { label: 'urange', kind: monaco.languages.CompletionItemKind.Function, detail: 'algopy.urange()', documentation: 'Produces a sequence of UInt64 from start (inclusive) to stop (exclusive) by step', insertText: 'urange' },
    { label: '@arc4.abimethod', kind: monaco.languages.CompletionItemKind.Function, detail: 'Decorator for ARC-4 ABI methods', documentation: 'Marks a method as externally callable via ABI. Supports create, allow_actions, name, readonly, and default_args parameters', insertText: '@arc4.abimethod' },
    { label: '@subroutine', kind: monaco.languages.CompletionItemKind.Function, detail: 'Decorator for internal subroutines', documentation: 'Marks a function as an internal subroutine (not externally callable)', insertText: '@subroutine' },
  ];

  // Code snippets
  const CODE_SNIPPETS = [
    {
      label: 'arc4_contract',
      kind: monaco.languages.CompletionItemKind.Snippet,
      detail: 'Complete ARC4 Contract Template',
      documentation: 'Create a complete ARC-4 compliant smart contract with initialization',
      insertText: [
        'from algopy import ARC4Contract, UInt64, arc4',
        '',
        '',
        'class ${1:MyContract}(ARC4Contract):',
        '    """${2:Contract description}"""',
        '',
        '    def __init__(self) -> None:',
        '        """Initialize contract state"""',
        '        ${3:self.counter = UInt64(0)}',
        '',
        '    @arc4.abimethod',
        '    def ${4:method_name}(self) -> arc4.String:',
        '        """${5:Method description}"""',
        '        return arc4.String("${6:Hello}")',
      ].join('\n'),
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    },
    {
      label: 'abimethod',
      kind: monaco.languages.CompletionItemKind.Snippet,
      detail: 'ABI Method',
      documentation: 'Create an ARC-4 ABI method',
      insertText: [
        '@arc4.abimethod',
        'def ${1:method_name}(self${2:, param: arc4.String}) -> ${3:arc4.String}:',
        '    """${4:Method description}"""',
        '    ${5:# Implementation}',
        '    return ${6:result}',
      ].join('\n'),
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    },
  ];

  // Combine all completion items
  const ALL_COMPLETIONS = [...ALGOPY_CORE_TYPES, ...ARC4_TYPES, ...ALGOPY_FUNCTIONS, ...CODE_SNIPPETS];

  // Register completion provider for Python
  monaco.languages.registerCompletionItemProvider('python', {
    provideCompletionItems: (model: any, position: any) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      return {
        suggestions: ALL_COMPLETIONS.map(item => ({
          ...item,
          range,
        })),
      };
    },
  });

  // Add hover provider for documentation
  monaco.languages.registerHoverProvider('python', {
    provideHover: (model: any, position: any) => {
      const word = model.getWordAtPosition(position);
      if (!word) return null;

      const item = ALL_COMPLETIONS.find(i => i.label === word.word || i.label.endsWith('.' + word.word));
      if (item && item.documentation) {
        return {
          contents: [
            { value: `**${item.label}**` },
            { value: item.detail || '' },
            { value: item.documentation as string },
          ],
        };
      }
      return null;
    },
  });

  console.log('PuyaPy IntelliSense setup complete');
}

export function setupMonacoTypes(monaco: any, template?: Template) {
  // Skip all Monaco setup during build to prevent import errors
  if (typeof window === 'undefined') {
    console.log('Skipping Monaco setup during build');
    return;
  }
  
  console.log('Setting up Monaco types for template:', template);
  
  // Load template-specific types and IntelliSense
  if (template === 'puyats') {
    const modules = loadPuyaTsTypes();
    console.log('Setting up Monaco types...', modules.length, 'files loaded');
    
    modules.forEach(({ key, content }: { key: string; content: string }, i: number) => {
      const filePath = `file:///__typings__/@algorandfoundation/algorand-typescript${key.substring(1)}`;
      console.log(`Adding lib ${i}:`, key, '->', filePath);
      monaco.languages.typescript.typescriptDefaults.addExtraLib(
        content,
        filePath
      );
    });
    
    console.log('Added', modules.length, 'extra libs for Algorand TypeScript');
  } else if (template === 'puyapy') {
    setupPuyaPyIntelliSense(monaco);
  }

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
  
  console.log('Monaco setup complete for template:', template);
}