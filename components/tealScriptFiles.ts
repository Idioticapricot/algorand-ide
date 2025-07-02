/** @satisfies {import('@webcontainer/api').FileSystemTree} */
export const tealScriptFiles = {
  src: {
    directory: {
      "main.algo.ts": {
        file: {
          contents: `import { Contract } from '@algorandfoundation/tealscript'


type EventConfig = {

    EventID: uint64
    EventName: string
    EventCategory : string
    EventCreator: Address
    MaxParticipants: uint64
    Location: string
    StartTime: uint64
    EndTime : uint64
    RegisteredCount: uint64
    EventAppID: uint64
}

type EventID = uint64


export class EventManager extends Contract {

    maintainerAddress = GlobalStateKey<Address>({ key: 'maintainerAddress' })
    totalEvents = GlobalStateKey<uint64>({ key: 'totalEvents' })
    lastEventID = GlobalStateKey<uint64>();

    allEvents = BoxMap<EventID, EventConfig>({ prefix: 'e' })

    createApplication(maintainerAddress: Address): void {
        this.totalEvents.value = 0;
        this.maintainerAddress.value = maintainerAddress
        this.lastEventID.value = 0;
      }

      createEvent(eventConfig: EventConfig) : void {
        
        this.lastEventID.value += 1;
        this.totalEvents.value +=1;
        this.allEvents(this.lastEventID.value).value = eventConfig

        

      }





}

`,
        },
      },
      "helloworld.algo.ts": {
        file: {
          contents: `import { Contract } from '@algorandfoundation/tealscript'



export class HelloWorld extends Contract {


    createApplication(): void {
          log('Hello World');

      }

      

        }



`,
        },
      },
      "deploy.ts": {
        file: {
          contents: `import { AlgoKitConfig, getAlgoKitConfig } from '@algorandfoundation/algokit-utils';
import { HelloWorld } from './main';

async function main() {
  const config = getAlgoKitConfig();
  
  // Deploy the contract
  const app = await HelloWorld.deploy({
    config,
    deployTimeParams: {},
  });

  console.log('Contract deployed with App ID:', app.appId);
  console.log('Contract address:', app.appAddress);
}

main().catch(console.error);
`,
        },
      },
      "client.ts": {
        file: {
          contents: `import { AlgoKitConfig, getAlgoKitConfig } from '@algorandfoundation/algokit-utils';
import { HelloWorld } from './main';

export class HelloWorldClient {
  private app: HelloWorld;
  private config: AlgoKitConfig;

  constructor(appId: number) {
    this.config = getAlgoKitConfig();
    this.app = new HelloWorld({ config: this.config, appId });
  }

  async callHello(sender: string): Promise<void> {
    await this.app.hello({ sender });
  }

  async setMessage(sender: string, message: string): Promise<void> {
    await this.app.setMessage({ 
      sender,
      message: new Uint8Array(Buffer.from(message, 'utf8'))
    });
  }

  async getMessage(): Promise<string> {
    const result = await this.app.getMessage();
    return Buffer.from(result).toString('utf8');
  }

  async getCreator(): Promise<string> {
    return await this.app.getCreator();
  }
}
`,
        },
      },
    },
  },
  
  artifacts: {
    directory: {
    }},
  "package.json": {
    file: {
      contents: `{
  "name": "algorand-tealscript-project",
  "type": "module",
  "dependencies": {
    "@algorandfoundation/algokit-utils": "^9.0.1",
    "@algorandfoundation/tealscript": "^0.106.3",
    "@algorandfoundation/algokit-client-generator": "^5.0.0",
    "@jest/globals": "^29.5.0",
    "jest": "^29.5.0",
    "prettier": "^3.0.3",
    "ts-jest": "^29.1.0",
    "typescript": "5.0.2"
  },
  "scripts": {
    "build": "tealscript src/*.algo.ts artifacts",
    "test": "jest",
    "deploy": "tsx src/deploy.ts",
    "generate-client": "algokit generate client src/main.ts"
  }
}`,
    },
  },
  "tsconfig.json": {
    file: {
      contents: `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*", "tests/**/*"],
  "exclude": ["node_modules", "dist"]
}`,
    },
  },
  "jest.config.js": {
    file: {
      contents: `module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
};
`,
    },
  },
  "README.md": {
    file: {
      contents: `# Algorand TealScript Project

This project demonstrates how to build and deploy Algorand smart contracts using TealScript.

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Build the contract:
   \`\`\`bash
   npm run build
   \`\`\`

3. Run tests:
   \`\`\`bash
   npm run test
   \`\`\`

4. Deploy to TestNet:
   \`\`\`bash
   npm run deploy
   \`\`\`

5. Generate client:
   \`\`\`bash
   npm run generate-client
   \`\`\`

## Project Structure

- \`src/\` - Source code
- \`tests/\` - Test files
- \`dist/\` - Compiled output

## Features

- TypeScript-based smart contract development
- Built-in testing framework
- Client generation
- Deployment automation
`,
    },
  },
  "algorand.json": {
    file: {
      contents: `{}`,
    },
  },
  ".env": {
    file: {
      contents: `ALGOD_PORT=443
      ALGOD_SERVER=https://testnet-api.4160.nodely.dev`,
    },
  },

} 