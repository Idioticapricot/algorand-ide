# 🚀 AlgoCraft - Algorand Development Platform

<div align="center">

![AlgoCraft Banner](https://img.shields.io/badge/AlgoCraft-Algorand%20IDE-00D4AA?style=for-the-badge&logo=algorand)

**A comprehensive web-based development environment for building, testing, and deploying Algorand smart contracts**

[![xGov Proposal](https://img.shields.io/badge/xGov-Proposal%203262647286-blue?style=flat-square)](https://xgov.algorand.co/proposal/3262647286)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)

[🌐 Main Site](https://algocraft.fun) • [💻 IDE](https://ide.algocraft.fun) • [🔄 Flow Builder](https://flow.algocraft.fun)

</div>

---

## 📌 Important Requirements

Before running this project, ensure you have:

- **Node.js** 18+ installed
- **npm** or **pnpm** package manager
- **Supabase** account for authentication and database
- **OpenRouter API** key for AI features
- **Hugging Face API** key for embeddings

---

## 🎯 About AlgoCraft

AlgoCraft is a **unified development platform** for the Algorand blockchain ecosystem, providing developers with powerful tools to build, test, and deploy smart contracts without complex local setup.

### 🏆 xGov Proposal

This project was submitted to the **Algorand xGov program** and unfortunately **did not receive funding**. Despite this setback, we continue to develop and improve AlgoCraft to serve the Algorand developer community.

**Proposal Link:** [xGov #3262647286](https://xgov.algorand.co/proposal/3262647286)

---

## ✨ Key Features

### 🛠️ Multi-Framework Support
- **PyTeal** - Python-based smart contract development
- **TealScript** - TypeScript-based smart contract development  
- **PuyaPy** - Pythonic smart contracts using AlgoPy
- **PuyaTs** - TypeScript version of PuyaPy

### 💻 Development Environment
- **Monaco Editor** - Full-featured VS Code editor in browser
- **Real-time Compilation** - Instant feedback via external compiler API
- **Multi-tab Editing** - Work on multiple files simultaneously
- **File Management** - Complete CRUD operations on files and directories

### 🤖 AI-Powered Assistant
- **RAG Implementation** - Context-aware code assistance
- **Template-Specific Knowledge** - Framework-specific documentation
- **Code Generation** - AI-powered suggestions and completions

### 🔗 Blockchain Integration
- **Built-in Wallet** - Create and manage Algorand wallets
- **TestNet/MainNet Support** - Deploy to both networks
- **Transaction Builder** - Visual interface for contract interactions
- **Deployment Tools** - One-click contract deployment

### 👥 Collaboration Features
- **Project Management** - Save and organize your projects
- **GitHub Authentication** - Secure login with GitHub OAuth
- **Public/Private Projects** - Share your work or keep it private
- **Contract Loading** - Import contracts via base64 encoding

---

## 🌐 Platform Components

### 1. **Main Site** - [algocraft.fun](https://algocraft.fun)
Landing page and project showcase

### 2. **IDE** - [ide.algocraft.fun](https://ide.algocraft.fun)
Full-featured development environment with:
- Code editor with syntax highlighting
- Integrated terminal for build output
- AI chat assistant
- Wallet integration
- Artifact management

### 3. **Flow Builder** - [flow.algocraft.fun](https://flow.algocraft.fun)
Visual smart contract workflow designer

---

## 🚀 Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/algorand-ide.git
cd algorand-ide

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### Environment Configuration

Create a `.env` file with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenRouter API for AI
NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_api_key

# Hugging Face for embeddings
HF_API_KEY=your_huggingface_api_key

# Compiler API
NEXT_PUBLIC_COMPILER_API_URL=https://compiler.algocraft.fun
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript 5
- Tailwind CSS
- shadcn/ui components

**Editor & Terminal:**
- Monaco Editor (VS Code in browser)
- XTerm.js (Terminal emulator)

**Blockchain:**
- AlgoSDK (Algorand JavaScript SDK)
- AlgoKit Utils (High-level utilities)

**AI & Search:**
- OpenRouter API (LLM access)
- Supabase (Vector database for RAG)
- Hugging Face (Embedding generation)

**Database & Auth:**
- Supabase (PostgreSQL + Auth)
- GitHub OAuth

### Project Structure

```
algorand-ide/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── compile/       # Compiler wrapper
│   │   ├── load-contract/ # Contract loading
│   │   └── projects/      # Project CRUD
│   ├── puyats/           # PuyaTs IDE page
│   ├── tealscript/       # TealScript IDE page
│   ├── puyapy/           # PuyaPy IDE page
│   └── pyteal/           # PyTeal IDE page
├── components/            # React components
│   ├── algorand-ide.tsx  # Main IDE component
│   ├── code-editor.tsx   # Monaco editor wrapper
│   ├── ai-chat.tsx       # AI assistant
│   └── ...
├── lib/                  # Utility libraries
└── database/             # Database schema
```

---

## 🔧 API Endpoints

### Compilation API

All compilation requests go through the wrapper API at `/api/compile`:

```typescript
POST /api/compile
{
  "type": "puyapy" | "puyats" | "tealscript" | "pyteal" | "generate-client",
  "filename": "contract.algo.ts",
  "code": "contract code" | "base64_encoded_code"
}
```

### Contract Loading

```typescript
GET /api/load-contract?contract=<base64_encoded_contract>
// Redirects to /puyats?contract=<base64>

POST /api/load-contract
{
  "encoded": "base64_encoded_contract"
}
```

---

## 🎨 Features in Detail

### 1. **Code Editor**
- Syntax highlighting for TypeScript and Python
- IntelliSense and auto-completion
- Multi-file editing with tabs
- Unsaved changes indicator

### 2. **Build System**
- External compiler API integration
- Real-time compilation feedback
- Artifact management (TEAL, ARC32, etc.)
- Error reporting and debugging

### 3. **Wallet Integration**
- Create new Algorand wallets
- Import existing wallets via mnemonic
- View balance and transaction history
- TestNet faucet integration

### 4. **Deployment**
- One-click contract deployment
- Method argument input forms
- Transaction confirmation
- Deployed contract registry

### 5. **AI Assistant**
- Context-aware code suggestions
- Framework-specific documentation
- Code generation and debugging help
- Natural language queries

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Algorand Foundation** - For the amazing blockchain platform
- **AlgoKit Team** - For the development tools and utilities
- **Algorand Community** - For continuous support and feedback
- **xGov Program** - For the opportunity to propose this project

---

## 📞 Contact & Support

- **Website:** [algocraft.fun](https://algocraft.fun)
- **IDE:** [ide.algocraft.fun](https://ide.algocraft.fun)
- **Flow Builder:** [flow.algocraft.fun](https://flow.algocraft.fun)
- **Issues:** [GitHub Issues](https://github.com/yourusername/algorand-ide/issues)

---

<div align="center">

**Built with ❤️ for the Algorand Community**

⭐ Star us on GitHub if you find this project useful!

</div>
