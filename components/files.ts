export const files = {
  "contract.py": {
    file: {
      contents: `from pyteal import *

def approval_program():
    """
    Hello World Algorand Smart Contract
    """
    
    # Handle different application calls
    on_creation = Seq([
        App.globalPut(Bytes("Creator"), Txn.sender()),
        App.globalPut(Bytes("Message"), Bytes("Hello Algorand!")),
        Return(Int(1))
    ])
    
    on_call = Cond(
        [Txn.application_args[0] == Bytes("hello"), 
         Return(Int(1))],
        [Txn.application_args[0] == Bytes("set_message"),
         Seq([
             App.globalPut(Bytes("Message"), Txn.application_args[1]),
             Return(Int(1))
         ])],
    )
    
    program = Cond(
        [Txn.application_id() == Int(0), on_creation],
        [Txn.on_completion() == OnComplete.NoOp, on_call],
        [Txn.on_completion() == OnComplete.DeleteApplication, 
         Return(Txn.sender() == App.globalGet(Bytes("Creator")))],
        [Txn.on_completion() == OnComplete.UpdateApplication,
         Return(Txn.sender() == App.globalGet(Bytes("Creator")))],
    )
    
    return program

def clear_state_program():
    return Return(Int(1))

if __name__ == "__main__":
    # Compile the contract
    approval_teal = compileTeal(approval_program(), Mode.Application, version=6)
    clear_state_teal = compileTeal(clear_state_program(), Mode.Application, version=6)
    
    # Write TEAL files
    with open("HelloWorld.approval.teal", "w") as f:
        f.write(approval_teal)
    
    with open("HelloWorld.clear.teal", "w") as f:
        f.write(clear_state_teal)
    
    print("Approval Program:")
    print(approval_teal)
    print("\nClear State Program:")
    print(clear_state_teal)
`,
    },
  },
  "README.md": {
    file: {
      contents: `# PyTeal Template

This project demonstrates how to build Algorand smart contracts using PyTeal.

## Commands

- "npm install" - Install dependencies
- "npm run build" - Compile the smart contract
- "npm run test" - Run tests
- "npm run deploy" - Deploy to network
`,
    },
  },
  "package.json": {
    file: {
      contents: `{
  "name": "pyteal-template",
  "version": "1.0.0",
  "description": "PyTeal Algorand Smart Contract Template",
  "main": "index.js",
  "scripts": {
    "install": "pip install -r requirements.txt",
    "build": "python contract.py",
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
      contents: `pyteal==0.27.0`,
    },
  },
}