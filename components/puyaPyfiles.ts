export const puyaPyfiles = {
  "contract.py": {
    file: {
      contents: `from algopy import Contract, Txn, log


class HelloWorldContract(Contract):
    def approval_program(self) -> bool:
        name = Txn.application_args(0)
        log(b"Hello, " + name)
        return True

    def clear_state_program(self) -> bool:
        return True
`,
    },
  },
  "README.md": {
    file: {
      contents: `
# PuyaPy Template

This project demonstrates how to build Algorand smart contracts using PuyaPy.

## Commands

- "npm install" - Install dependencies
- 'npm run build" - Compile the smart contract
- "npm run test" - Run tests
- "npm run deploy" - Deploy to network
`,
    },
  },
  "package.json": {
    file: {
      contents: `{
  "name": "puyapy-template",
  "version": "1.0.0",
  "description": "PuyaPy Algorand Smart Contract Template",
  "main": "index.js",
  "scripts": {
    "install": "pip install -r requirements.txt",
    "build": "puyapy compile contract.py",
    "test": "echo \"No tests yet\"",
    "deploy": "echo \"Deployment not implemented yet\""
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}`,
    },
  },
  "requirements.txt": {
    file: {
      contents: `algopy==0.1.0`,
    },
  },
};
