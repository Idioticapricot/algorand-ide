# Algorand IDE - Developer Guide

## Project Overview

The Algorand IDE is a web-based development environment for building, testing, and deploying Algorand smart contracts. It supports multiple development frameworks including PyTeal, TealScript, PuyaPy, and PuyaTs.

## Architecture

### Core Technologies
- **Frontend**: Next.js 14 with TypeScript
- **UI Framework**: Tailwind CSS + shadcn/ui components
- **Code Editor**: Monaco Editor (VS Code editor)
- **Container Runtime**: WebContainer API for in-browser execution
- **Blockchain Integration**: AlgoSDK + AlgoKit Utils
- **AI Integration**: OpenRouter API with vector search via Supabase
- **State Management**: React hooks with localStorage persistence

### Project Structure

```
algorand-ide/
├── app/                          # Next.js app router pages
│   ├── layout.tsx               # Root layout with theme provider
│   ├── page.tsx                 # Landing page with template selection
│   ├── pyteal/page.tsx          # PyTeal IDE page
│   ├── tealscript/page.tsx      # TealScript IDE page
│   ├── puyapy/page.tsx          # PuyaPy IDE page
│   └── puyats/page.tsx          # PuyaTs IDE page
├── components/                   # React components
│   ├── ui/                      # shadcn/ui base components
│   ├── algorand-ide.tsx         # Main IDE component
│   ├── sidebar.tsx              # File explorer & navigation
│   ├── code-editor.tsx          # Monaco editor wrapper
│   ├── webcontainer-terminal.tsx # Build terminal
│   ├── ai-chat.tsx              # AI assistant with RAG
│   ├── wallet-panel.tsx         # Algorand wallet integration
│   ├── build-toolbar.tsx        # Build/deploy controls
│   └── [template]Files.ts       # Template file structures
├── lib/                         # Utility libraries
│   ├── utils.ts                 # General utilities
│   ├── embed.ts                 # Vector embedding utilities
│   ├── webcontainer-functions.ts # WebContainer file operations
│   └── code-generator.ts        # Code generation helpers
└── public/                      # Static assets
```

## Key Components

### 1. Main IDE Component (`algorand-ide.tsx`)

**Purpose**: Central orchestrator for the entire IDE experience

**Key Features**:
- WebContainer initialization and management
- File system operations (create, read, update, delete)
- Real-time file watching and updates
- Build process management (install, build, test, deploy)
- Wallet integration and smart contract deployment
- Resizable panels (sidebar, terminal, wallet)

**State Management**:
- `currentFiles`: File tree structure from WebContainer
- `fileContents`: In-memory file content cache
- `activeFile`: Currently selected file
- `openFiles`: Array of open file tabs
- `webcontainer`: WebContainer instance
- `wallet`: Algorand wallet state
- `deployedContracts`: Deployed contract registry

### 2. Sidebar Component (`sidebar.tsx`)

**Purpose**: File explorer and navigation hub

**Sections**:
- **Explorer**: File tree with CRUD operations
- **Build & Deploy**: Artifact management
- **Tests**: Test execution controls
- **Programs**: Deployed contract management
- **Tutorials**: Learning resources
- **Settings**: IDE configuration

**File Operations**:
- Create/rename/delete files and folders
- Context menu for file operations
- Real-time file tree updates via WebContainer watcher

### 3. Code Editor (`code-editor.tsx`)

**Purpose**: Monaco-based code editing experience

**Features**:
- Multi-tab file editing
- Syntax highlighting for Python, TypeScript, JavaScript
- Dracula theme integration
- Auto-save with unsaved file indicators
- Language-specific features (IntelliSense, error checking)

### 4. WebContainer Terminal (`webcontainer-terminal.tsx`)

**Purpose**: In-browser terminal for build operations

**Capabilities**:
- Execute npm/pip commands in WebContainer
- Real-time output streaming
- Command history navigation
- Process management (start/stop builds)

### 5. AI Chat (`ai-chat.tsx`)

**Purpose**: Context-aware AI assistant using RAG (Retrieval-Augmented Generation)

**Architecture**:
- **Vector Search**: Supabase with embeddings for each template
- **LLM Integration**: OpenRouter API with DeepSeek models
- **Context Retrieval**: Template-specific knowledge base
- **Markdown Rendering**: Rich formatting with code highlighting

**Flow**:
1. User query → Generate embedding
2. Search similar chunks in Supabase
3. Build context from top matches
4. Send context + query to LLM
5. Render markdown response

### 6. Wallet Panel (`wallet-panel.tsx`)

**Purpose**: Algorand wallet management and transaction monitoring

**Features**:
- Wallet creation with mnemonic generation
- Balance checking (TestNet/MainNet)
- Transaction history
- Account backup/export
- Network switching

## Template System

### Supported Templates

1. **PyTeal** (`files.ts`)
   - Python-based smart contract development using PyTeal library
   - Pyodide-based compilation (no WebContainer)
   - Generates .teal files directly
   - IndexedDB persistence for file changes

2. **TealScript** (`tealScriptFiles.ts`)
   - TypeScript-based smart contract development
   - AlgoKit TealScript compiler
   - WebContainer-based execution
   - Jest for testing

3. **PuyaPy** (`puyaPyfiles.ts`)
   - Pythonic smart contract development using AlgoPy
   - Pyodide-based compilation (no WebContainer)
   - Generates .teal, .arc32.json, and .puya.map files
   - IndexedDB persistence for file changes

4. **PuyaTs** (`puyaTsfiles.ts`)
   - TypeScript version of PuyaPy
   - WebContainer-based execution
   - Type-safe smart contract development

### Template Structure

#### WebContainer Templates (TealScript, PuyaTs)
- `src/`: Source code files
- `tests/`: Test files
- `scripts/`: Deployment scripts
- `package.json`: Dependencies and scripts
- `README.md`: Documentation
- Configuration files (tsconfig.json)

#### Pyodide Templates (PyTeal, PuyaPy)
- `contract.py`: Main contract file
- `package.json`: Build scripts
- `requirements.txt`: Python dependencies
- `README.md`: Documentation
- Flat file structure for simplicity

## File System Management

### WebContainer Functions (`lib/webcontainer-functions.ts`)

Utility functions for WebContainer file operations:

```typescript
// Write file to WebContainer
export async function writeFileToWebContainer(
  webcontainer: WebContainer,
  filePath: string,
  content: string
): Promise<void>

// Append content to file
export async function appendFileToWebContainer(
  webcontainer: WebContainer,
  filePath: string,
  content: string
): Promise<void>

// Update file with IndexedDB sync
export async function updateFileInWebContainer(
  webcontainer: WebContainer,
  filePath: string,
  content: string,
  selectedTemplate: string,
  indexedDBManager: any
): Promise<void>
```

### File Operations

The IDE supports full CRUD operations on files with dual persistence:

```typescript
// Create file (WebContainer + IndexedDB)
const createFile = async (filePath: string) => {
  await updateFileInWebContainer(webcontainer, filePath, "", selectedTemplate, indexedDBManager);
};

// Update file content (real-time sync)
const updateFile = async (filePath: string, content: string) => {
  setFileContents(prev => ({ ...prev, [filePath]: content }));
  await updateFileInWebContainer(webcontainer, filePath, content, selectedTemplate, indexedDBManager);
};

// Save active file
const handleSave = async () => {
  const content = fileContents[activeFile];
  await updateFileInWebContainer(webcontainer, activeFile, content, selectedTemplate, indexedDBManager);
};
```

### File Persistence Strategy

#### WebContainer Templates (TealScript, PuyaTs)
- **Primary Storage**: WebContainer filesystem for execution
- **Backup Storage**: IndexedDB for persistence across sessions
- **Real-time Sync**: Automatic synchronization between both systems
- **File Watcher**: Real-time UI updates via WebContainer watcher
- **Save Operation**: Updates both WebContainer and IndexedDB simultaneously
- **Utility Functions**: Centralized file operations via `webcontainer-functions.ts`

#### Pyodide Templates (PyTeal, PuyaPy)
- **Primary Storage**: IndexedDB only (no WebContainer)
- **Execution**: Pyodide virtual filesystem for compilation
- **Performance**: Reduced memory footprint without WebContainer
- **Direct Access**: File manipulation directly in browser storage

## Build System

### Execution Environments

#### WebContainer Integration

Used for TealScript and PuyaTs templates to provide a full Node.js environment:

```typescript
// Initialize WebContainer
const webcontainer = await WebContainer.boot();
await webcontainer.mount(initialFiles);

// Execute build commands
const buildProcess = await webcontainer.spawn("npm", ["run", "build"]);
```

#### Pyodide Integration

Used for PyTeal and PuyaPy templates for Python execution in the browser:

```typescript
// Initialize Pyodide compiler
const compiler = new PyodideCompiler();
await compiler.init('Pyteal'); // or 'PuyaPy'

// Compile Python code
const result = await compiler.compile('contract.py', pythonCode);
```

### Build Pipeline

#### WebContainer Templates (TealScript, PuyaTs)
1. **Install**: `npm install` - Install dependencies
2. **Build**: `npm run build` - Compile smart contracts
3. **Test**: `npm run test` - Run test suite
4. **Deploy**: `npm run deploy` - Deploy to Algorand network
5. **Generate Client**: Generate TypeScript client code

#### Pyodide Templates (PyTeal, PuyaPy)
1. **Build**: Direct Python execution in Pyodide
2. **File Discovery**: Automatically find generated artifacts
3. **Artifact Management**: .teal, .arc32.json, .puya.map files
4. **Console Logging**: All files and artifacts logged to console

### Artifact Management

Built contracts are stored in the `artifacts/` directory:
- `.teal` files: Compiled TEAL code
- `.arc32.json` files: ARC-32 application specifications
- Client generation artifacts

## Deployment System

### Smart Contract Deployment

1. **Artifact Selection**: Choose compiled contract from artifacts panel
2. **Parameter Input**: Provide constructor arguments via modal
3. **Wallet Integration**: Use connected wallet for signing
4. **Network Deployment**: Deploy to TestNet/MainNet
5. **Contract Registry**: Store deployed contract info in localStorage

### Deployment Flow

```typescript
// Deploy contract with arguments
const deployResult = await appFactory.send.create({
  sender: account.addr,
  signer: algosdk.makeBasicAccountTransactionSigner(account),
  method: "createApplication",
  args: deployArgs
});

// Store deployment info
const deployed = {
  appId: deployResult.result.appId,
  txId: deployResult.result.txId,
  artifact: filename,
  methods: contractSpec.methods
};
```

## AI Assistant Integration

### Vector Database Setup

The AI assistant uses Supabase for vector storage:

**Tables**:
- `pyteal`: PyTeal documentation chunks
- `tealscript`: TealScript documentation chunks  
- `algopy`: PuyaPy documentation chunks
- `puyats`: PuyaTs documentation chunks

**Schema**:
```sql
CREATE TABLE pyteal (
  id SERIAL PRIMARY KEY,
  text TEXT,
  embedding TEXT -- Comma-separated float values
);
```

### RAG Implementation

1. **Query Processing**: Convert user question to embedding
2. **Similarity Search**: Find most relevant documentation chunks
3. **Context Building**: Combine top chunks into context
4. **LLM Query**: Send context + question to OpenRouter
5. **Response Rendering**: Display markdown-formatted response

## Environment Configuration

### Required Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# OpenRouter API
NEXT_PUBLIC_OPENROUTER_API_KEY=your-openrouter-api-key

# Hugging Face (for embeddings)
HF_API_KEY=your-huggingface-api-key
```

### Python Wheels Configuration

#### PyTeal Template
- **Wheel URL**: `https://files.pythonhosted.org/packages/d4/53/83beac9246e682f22d36bd0c80ab6ec142a680443d51313c302edb810d08/pyteal-0.27.0-py3-none-any.whl`
- **Execution**: Direct Python script execution
- **Artifacts**: .teal files

#### PuyaPy Template
- **Wheel URL**: `/api/whl/puyapy-4.6.1.6-py3-none-any.whl`
- **Execution**: `runpy.run_module("puyapy")`
- **Artifacts**: .teal, .arc32.json, .puya.map files

### Network Configuration

The IDE supports both Algorand TestNet and MainNet:

```typescript
const NETWORK_CONFIG = {
  testnet: {
    indexer: "https://testnet-idx.algonode.cloud",
    algod: "https://testnet-api.algonode.cloud",
    explorer: "https://testnet.algoexplorer.io"
  },
  mainnet: {
    indexer: "https://mainnet-idx.algonode.cloud", 
    algod: "https://mainnet-api.algonode.cloud",
    explorer: "https://algoexplorer.io"
  }
}
```

## Development Workflow

### Adding New Templates

1. Create template file structure in `components/[template]Files.ts`
2. Add route in `app/[template]/page.tsx`
3. Update template selection in `app/page.tsx`
4. Add AI knowledge base table in Supabase
5. Update AI chat template mapping

### Extending Build System

1. Add new build commands in template `package.json`
2. Update build toolbar with new actions
3. Implement command handlers in `algorand-ide.tsx`
4. Add output parsing for new artifact types

### Adding UI Components

1. Create component in `components/`
2. Use shadcn/ui base components
3. Follow existing styling patterns
4. Add to main IDE layout if needed

## Performance Considerations

### File System Optimization

- **Lazy Loading**: Files loaded on-demand
- **Debounced Updates**: File changes batched
- **Memory Management**: Large files truncated in display
- **IndexedDB Persistence**: File changes persisted across sessions
- **Template Isolation**: Each template has separate file storage
- **WebContainer Sync**: Real-time synchronization between IndexedDB and WebContainer
- **Dual Persistence**: Files saved to both WebContainer and IndexedDB for reliability

### Execution Environment Management

#### WebContainer Management (TealScript, PuyaTs)
- **Single Instance**: One WebContainer per IDE session
- **Process Cleanup**: Terminate long-running processes
- **Resource Limits**: Monitor memory usage

#### Pyodide Management (PyTeal, PuyaPy)
- **Worker Isolation**: Pyodide runs in Web Worker
- **Template-Specific Wheels**: Different packages per template
- **File System Access**: Direct access to Pyodide virtual filesystem
- **Artifact Discovery**: Automatic file enumeration after compilation

### AI Assistant Optimization

- **Embedding Caching**: Cache query embeddings
- **Context Limiting**: Limit context size for LLM
- **Response Streaming**: Stream AI responses when possible

## Security Considerations

### Wallet Security

- **Local Storage**: Private keys stored in browser localStorage
- **Mnemonic Backup**: Users responsible for mnemonic security
- **Network Isolation**: TestNet default for development

### Code Execution

- **Sandboxed Environment**: WebContainer provides isolation
- **Limited Permissions**: No file system access outside container
- **Process Limits**: Prevent resource exhaustion

## Troubleshooting

### Common Issues

1. **WebContainer Not Ready**: Wait for initialization
2. **Build Failures**: Check dependencies and syntax
3. **Deployment Errors**: Verify wallet connection and balance
4. **AI Chat Issues**: Check API keys and network connection

### Debug Tools

- Browser DevTools for client-side debugging
- WebContainer terminal for build debugging
- Network tab for API call inspection
- Console logs for detailed error information

## Future Enhancements

### Planned Features (from TODO)

- [x] Deploy Smart Contract (wallet integration) ✓ Completed
- [x] Full file interaction with realtime updates ✓ Completed  
- [x] WebContainer file synchronization ✓ Completed
- [x] Save functionality with dual persistence ✓ Completed
- [ ] Tutorial templates from tutorials/ folder
- [ ] Programs tab with build artifact count
- [ ] Advanced debugging tools
- [ ] Collaborative editing
- [ ] Git integration
- [ ] Plugin system

### Technical Improvements

- WebAssembly compilation for better performance
- Service worker for offline capabilities
- Advanced code analysis and linting
- Integrated testing framework
- Performance profiling tools

---

This guide provides a comprehensive overview of the Algorand IDE architecture and development patterns. Use it as a reference for understanding the codebase and implementing new features.