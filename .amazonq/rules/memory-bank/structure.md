# Algorand IDE - Project Structure

## Root Directory Organization

```
algorand-ide/
├── app/                          # Next.js App Router pages and API routes
├── components/                   # React components and UI elements
├── lib/                         # Utility libraries and helper functions
├── hooks/                       # Custom React hooks
├── database/                    # Database schema and migrations
├── public/                      # Static assets and web workers
├── styles/                      # Global CSS styles
├── scripts/                     # Build and utility scripts
└── tests/                       # Test files and configurations
```

## Core Application Structure

### App Router (`app/`)
- **API Routes**: Backend endpoints for project management and file operations
  - `api/projects/`: Project CRUD operations with Supabase integration
  - `api/whl/`: Python wheel distribution for PuyaPy framework
- **Page Routes**: Framework-specific IDE pages
  - `pyteal/page.tsx`: PyTeal development environment
  - `tealscript/page.tsx`: TealScript development environment
  - `puyapy/page.tsx`: PuyaPy development environment
  - `puyats/page.tsx`: PuyaTs development environment
- **Project Management**: 
  - `projects/page.tsx`: Project listing and management
  - `project/[projectId]/`: Individual project pages
  - `play/[slug]/`: Shareable project viewer

### Component Architecture (`components/`)

#### Core IDE Components
- **`algorand-ide.tsx`**: Main IDE orchestrator component
  - WebContainer lifecycle management
  - File system operations and state management
  - Build process coordination
  - Wallet integration and deployment logic

#### Editor Components
- **`code-editor.tsx`**: Monaco editor wrapper with multi-tab support
- **`code-editor-dynamic.tsx`**: Dynamic import wrapper for SSR compatibility
- **`file-tree.tsx`**: File explorer with CRUD operations
- **`sidebar.tsx`**: Navigation sidebar with multiple panels

#### Terminal Components
- **`webcontainer-terminal.tsx`**: WebContainer-based terminal for Node.js projects
- **`xterm-terminal.tsx`**: XTerm.js terminal implementation
- **`terminal.tsx`**: Generic terminal interface

#### Specialized Panels
- **`ai-chat.tsx`**: AI assistant with RAG implementation
- **`wallet-panel.tsx`**: Algorand wallet management
- **`artifacts-panel.tsx`**: Build artifact management
- **`programs-panel.tsx`**: Deployed contract registry
- **`settings-panel.tsx`**: IDE configuration

#### Template Files
- **`files.ts`**: PyTeal template structure
- **`tealScriptFiles.ts`**: TealScript template structure
- **`puyaPyfiles.ts`**: PuyaPy template structure
- **`puyaTsfiles.ts`**: PuyaTs template structure

#### UI Components (`components/ui/`)
- **shadcn/ui**: Complete component library for consistent UI
- **Radix UI**: Accessible component primitives
- **Custom Components**: Project-specific UI elements

### Library Layer (`lib/`)

#### Core Utilities
- **`utils.ts`**: General utility functions and helpers
- **`webcontainer-functions.ts`**: WebContainer file system operations
- **`indexeddb.ts`**: Browser storage management
- **`pyodide-compiler.ts`**: Python compilation in browser

#### AI Integration
- **`embed.ts`**: Vector embedding utilities for RAG
- **`code-generator.ts`**: AI-powered code generation helpers

### Database Layer (`database/`)
- **`schema.sql`**: Supabase database schema
  - Projects table with user ownership and sharing
  - Project files with JSONB file structure storage
  - Row Level Security (RLS) policies
  - Automatic timestamp triggers

## Architectural Patterns

### Execution Environments

#### WebContainer Architecture (TealScript, PuyaTs)
```
Browser → WebContainer → Node.js Runtime → npm/build tools
                      ↓
                   File System ← → IndexedDB (persistence)
```

#### Pyodide Architecture (PyTeal, PuyaPy)
```
Browser → Pyodide Worker → Python Runtime → pip/build tools
                        ↓
                   Virtual FS ← → IndexedDB (persistence)
```

### State Management Pattern
- **React Hooks**: Local component state management
- **localStorage**: IDE preferences and settings
- **IndexedDB**: File content persistence
- **Supabase**: Project metadata and sharing

### File System Abstraction
```
IDE Interface
     ↓
File Operations Layer (webcontainer-functions.ts)
     ↓
Dual Persistence:
├── WebContainer FS (runtime)
└── IndexedDB (persistence)
```

### Component Communication
- **Props**: Parent-child data flow
- **Callbacks**: Child-parent event handling
- **Context**: Theme and global state
- **Custom Hooks**: Shared logic and state

## Template System Architecture

### Template Structure
Each framework template includes:
- **File Structure**: Predefined directory layout
- **Dependencies**: Framework-specific packages
- **Build Scripts**: Compilation and deployment commands
- **Documentation**: Getting started guides and examples

### Template Loading Flow
1. User selects template from landing page
2. Template files loaded from respective `*Files.ts` modules
3. WebContainer/IndexedDB initialized with template structure
4. IDE components rendered with template-specific configuration
5. AI assistant configured with template-specific knowledge base

### Persistence Strategy
- **WebContainer Templates**: Dual persistence (WebContainer + IndexedDB)
- **Pyodide Templates**: IndexedDB only (lighter footprint)
- **Project Metadata**: Supabase for sharing and collaboration
- **Build Artifacts**: Temporary storage in WebContainer/virtual FS