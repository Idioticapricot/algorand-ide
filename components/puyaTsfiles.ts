export const puyaTsfiles = {
  "helloworld.algo.ts": {
    file: {
      contents: `import { BaseContract, log, op } from '@algorandfoundation/algorand-typescript'

export default class HelloWorldContract extends BaseContract {
  public approvalProgram(): boolean {
    const name = String(op.Txn.applicationArgs(0))
    log(`Hello, ${name}`)
    return true
  }
}
`,
    },
  },
  "package.json": {
    file: {
      contents: `{
  "name": "puyats-template",
  "version": "1.0.0",
  "description": "PuyaTS Algorand Smart Contract Template",
  "main": "index.js",
  "scripts": {
    "install": "npm install",
    "build": "algorand-typescript compile",
    "test": "echo \"No tests yet\"",
    "deploy": "echo \"Deployment not implemented yet\""
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}`,
    },
  },
  "README.md": {
    file: {
      contents: `
# PuyaTS Template

This project demonstrates how to build Algorand smart contracts using PuyaTS.

## Commands

- `npm install` - Install dependencies
- `npm run build` - Compile the smart contract
- `npm run test` - Run tests
- `npm run deploy` - Deploy to network
`,
    },
  },
};
