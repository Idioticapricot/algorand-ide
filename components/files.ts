/** @satisfies {import('@webcontainer/api').FileSystemTree} */
export const files = {
  "src/main.py": {
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
    
    print("Approval Program:")
    print(approval_teal)
    print("\\nClear State Program:")
    print(clear_state_teal)
`,
    },
  },
  "src/contract.py": {
    file: {
      contents: `from algosdk import account, mnemonic
from algosdk.v2client import algod
from algosdk.transaction import ApplicationCreateTxn, wait_for_confirmation
import base64

class AlgorandContract:
    def __init__(self, algod_client):
        self.algod_client = algod_client
        self.app_id = None
    
    def deploy(self, creator_private_key, approval_program, clear_program):
        """Deploy the smart contract to Algorand"""
        creator_address = account.address_from_private_key(creator_private_key)
        
        # Get network params
        params = self.algod_client.suggested_params()
        
        # Create application transaction
        txn = ApplicationCreateTxn(
            sender=creator_address,
            sp=params,
            on_complete=0,  # NoOp
            approval_program=base64.b64decode(approval_program),
            clear_program=base64.b64decode(clear_program),
            global_schema=StateSchema(num_uints=1, num_byte_slices=2),
            local_schema=StateSchema(num_uints=0, num_byte_slices=0)
        )
        
        # Sign transaction
        signed_txn = txn.sign(creator_private_key)
        
        # Submit transaction
        tx_id = self.algod_client.send_transaction(signed_txn)
        
        # Wait for confirmation
        confirmed_txn = wait_for_confirmation(self.algod_client, tx_id, 4)
        
        # Get application ID
        self.app_id = confirmed_txn["application-index"]
        
        return self.app_id
`,
    },
  },
  "package.json": {
    file: {
      contents: `{
  "name": "algorand-project",
  "type": "module",
  "dependencies": {
    "pyteal": "latest",
    "py-algorand-sdk": "latest"
  },
  "scripts": {
    "build": "python src/main.py",
    "test": "python -m pytest tests/",
    "deploy": "python scripts/deploy.py"
  }
}`,
    },
  },
  "requirements.txt": {
    file: {
      contents: `pyteal==0.20.1
py-algorand-sdk==2.7.0
pytest==7.4.0
`,
    },
  },
  "tests/test_contract.py": {
    file: {
      contents: `import pytest
from algosdk import account
from src.contract import AlgorandContract

class TestAlgorandContract:
    def setup_method(self):
        """Set up test fixtures"""
        self.test_account = account.generate_account()
        
    def test_contract_creation(self):
        """Test contract creation"""
        contract = AlgorandContract(None)
        assert contract.app_id is None
        
    def test_account_generation(self):
        """Test account generation"""
        assert len(self.test_account[0]) == 58  # Address length
        assert len(self.test_account[1]) == 64  # Private key length
`,
    },
  },
  "scripts/deploy.py": {
    file: {
      contents: `#!/usr/bin/env python3
"""
Deployment script for Algorand smart contracts
"""

import os
from algosdk.v2client import algod
from src.main import approval_program, clear_state_program
from src.contract import AlgorandContract

def main():
    # Connect to Algorand node
    algod_address = "https://testnet-api.algonode.cloud"
    algod_token = ""
    algod_client = algod.AlgodClient(algod_token, algod_address)
    
    # Create contract instance
    contract = AlgorandContract(algod_client)
    
    print("Deploying contract to TestNet...")
    
    # Note: You'll need to provide your private key
    # private_key = "your-private-key-here"
    # app_id = contract.deploy(private_key, approval_program(), clear_state_program())
    # print(f"Contract deployed with App ID: {app_id}")

if __name__ == "__main__":
    main()
`,
    },
  },
  "README.md": {
    file: {
      contents: `# Algorand Smart Contract Project

This project demonstrates how to build and deploy Algorand smart contracts using PyTeal.

## Getting Started

1. Install dependencies:
   \`\`\`bash
   pip install -r requirements.txt
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

## Project Structure

- \`src/\` - Source code
- \`tests/\` - Test files
- \`scripts/\` - Deployment scripts
`,
    },
  },
}
