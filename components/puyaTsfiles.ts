import { dir } from "console";

export const puyaTsfiles = {
  smart_contracts :{
    directory:{

      "helloworld.algo.ts": {
    file: {
      contents: `import { Contract } from '@algorandfoundation/algorand-typescript'

export class HelloWorld extends Contract {
  public hello(name: string): string {
    return \`Hello \${name}\`
  }
}
`,
    },
  },
    }
  },
  output :{
    directory:{}
  }
  
  ,
  "package.json": {
    file: {
      contents: `{
  "dependencies": {    "@algorandfoundation/algorand-typescript": "^1.0.0",
        "@algorandfoundation/puya-ts": "^1.0.0-beta.72"

  }
}
`,
    },
  },
};