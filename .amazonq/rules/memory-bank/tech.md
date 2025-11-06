# Algorand IDE - Technology Stack

## Core Technologies

### Frontend Framework
- **Next.js 14**: React framework with App Router
- **React 18**: Component library with hooks and concurrent features
- **TypeScript 5**: Type-safe JavaScript development

### UI Framework & Styling
- **Tailwind CSS 3.4**: Utility-first CSS framework
- **shadcn/ui**: Component library built on Radix UI primitives
- **Radix UI**: Accessible, unstyled component primitives
- **Tailwind Animate**: Animation utilities
- **Lucide React**: Icon library

### Code Editor & Terminal
- **Monaco Editor**: VS Code editor in the browser via `@monaco-editor/react`
- **XTerm.js**: Terminal emulator for web browsers
- **Monaco Themes**: Additional editor themes including Dracula

### Runtime Environments
- **WebContainer API**: In-browser Node.js runtime for TealScript/PuyaTs
- **Pyodide**: Python runtime in the browser for PyTeal/PuyaPy
- **Web Workers**: Background processing for Python compilation

### Blockchain Integration
- **AlgoSDK**: Official Algorand JavaScript SDK
- **AlgoKit Utils**: High-level utilities for Algorand development
- **Algorand Networks**: TestNet and MainNet connectivity

### AI & Vector Search
- **OpenRouter API**: LLM access for AI assistant
- **Supabase**: Vector database for RAG implementation
- **Hugging Face**: Embedding generation for semantic search

### State Management & Storage
- **React Hooks**: Built-in state management
- **IndexedDB**: Browser-based file persistence
- **localStorage**: Settings and preferences
- **Supabase**: Project metadata and sharing

## Development Dependencies

### Build Tools
- **PostCSS**: CSS processing and optimization
- **Autoprefixer**: CSS vendor prefix automation
- **Cross-env**: Cross-platform environment variables

### Type Definitions
- **@types/node**: Node.js type definitions
- **@types/react**: React type definitions
- **@types/react-dom**: React DOM type definitions

## Framework-Specific Technologies

### PyTeal Template
- **PyTeal 0.27.0**: Python library for Algorand smart contracts
- **Pyodide Runtime**: Browser-based Python execution
- **Python Wheels**: Pre-compiled packages for browser use

### TealScript Template
- **AlgoKit TealScript**: TypeScript-to-TEAL compiler
- **Jest**: Testing framework
- **Node.js Runtime**: Via WebContainer API

### PuyaPy Template
- **AlgoPy (PuyaPy)**: Pythonic Algorand smart contract framework
- **Custom Wheel Distribution**: Via `/api/whl/puyapy-4.6.1.6-py3-none-any.whl`
- **Pyodide Runtime**: Browser-based Python execution

### PuyaTs Template
- **PuyaTs**: TypeScript version of PuyaPy framework
- **Node.js Runtime**: Via WebContainer API
- **TypeScript Compiler**: Built-in compilation support

## Key Libraries & Utilities

### Form Handling
- **React Hook Form**: Form state management
- **Zod**: Schema validation
- **@hookform/resolvers**: Form validation integration

### UI Components
- **React Resizable Panels**: Resizable layout panels
- **Embla Carousel**: Carousel component
- **React Day Picker**: Date picker component
- **Sonner**: Toast notifications
- **React Hot Toast**: Alternative toast system

### Markdown & Code Rendering
- **React Markdown**: Markdown rendering for AI responses
- **Rehype Highlight**: Syntax highlighting for code blocks
- **Rehype Raw**: Raw HTML support in markdown
- **Remark GFM**: GitHub Flavored Markdown support

### Data Visualization
- **Recharts**: Chart library for data visualization
- **@xyflow/react**: Flow diagram and node editor

### Utility Libraries
- **Class Variance Authority**: Conditional CSS class management
- **clsx**: Conditional class name utility
- **Tailwind Merge**: Tailwind class merging utility
- **Date-fns**: Date manipulation library
- **CMDK**: Command palette component

## Development Commands

### Primary Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server
npm run dev:trace   # Development with deprecation tracing
```

### Framework-Specific Build Commands
```bash
# TealScript projects
npm install         # Install dependencies
npm run build      # Compile contracts
npm run test       # Run test suite
npm run deploy     # Deploy to network

# PuyaTs projects
npm install         # Install dependencies
npm run build      # Compile contracts
npm run test       # Run tests
npm run deploy     # Deploy contracts
```

## Environment Configuration

### Required Environment Variables
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# OpenRouter API for AI
NEXT_PUBLIC_OPENROUTER_API_KEY=your-openrouter-api-key

# Hugging Face for embeddings
HF_API_KEY=your-huggingface-api-key
```

### Network Configuration
- **Algorand TestNet**: Default development network
- **Algorand MainNet**: Production network option
- **AlgoNode**: Public API endpoints for both networks

## Browser Compatibility

### Supported Features
- **WebContainer API**: Chrome/Edge 102+, Firefox 104+
- **Pyodide**: All modern browsers with WebAssembly support
- **IndexedDB**: Universal browser support
- **Web Workers**: Universal browser support
- **Monaco Editor**: All modern browsers

### Performance Considerations
- **WebContainer**: ~50MB initial download, Node.js runtime overhead
- **Pyodide**: ~10MB Python runtime, faster startup than WebContainer
- **IndexedDB**: Efficient for large file storage and retrieval
- **Vector Search**: Client-side embedding generation for privacy