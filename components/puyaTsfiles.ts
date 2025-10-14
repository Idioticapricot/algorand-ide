import { dir } from "console";

export const puyaTsfiles = {
  smart_contracts :{
    directory:{

      "helloworld.algo.ts": {
    file: {
      contents: `import { BaseContract, log, op } from '@algorandfoundation/algorand-typescript'

export default class HelloWorldContract extends BaseContract {
  public approvalProgram(): boolean {
    const name = String(op.Txn.applicationArgs(0))
    log("Hello")
    return true
  }
}
`,
    },
  },
    }
  }
  
  ,
  "package.json": {
    file: {
      contents: `{
  "dependencies": {
    "@algorandfoundation/algorand-typescript": "^1.0.0"
        "@algorandfoundation/puya-ts": "^1.0.0"

  }
}
`,
    },
  },
};