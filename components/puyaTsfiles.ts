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
}`,
    },
  },
  "package.json": {
    file: {
      contents: `{
  "name": "puyats-example",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "build": "algokit compile",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@algorandfoundation/algorand-typescript": "^1.0.0"
  }
}`,
    },
  },
};