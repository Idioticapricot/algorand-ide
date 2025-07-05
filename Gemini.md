/pyteal - should contain the /app/page.tsx with the files.ts loaded
/tealscript  - should contain the /app/page.tsx with the tealScriptFiles.ts loaded
/ - this should be edited with the navigation for different templates ... it should have 4 Main templates show them on the screen "Pyteal", "TealScript", "PuyaPy", "PuyaTs" , the main website should have the same style as the other pages, please make sure it has
/puyapy - should contain the /app/page.tsx with the puyaPyfiles.ts loaded
/puyats - should contain the /app/page.tsx with the puyaTsfiles.ts loaded





puyaPyfiles.ts

contract.py [PuyaPy File]

from algopy import Contract, Txn, log


class HelloWorldContract(Contract):
    def approval_program(self) -> bool:
        name = Txn.application_args(0)
        log(b"Hello, " + name)
        return True

    def clear_state_program(self) -> bool:
        return True



/// puyaTsFiles.ts 

helloworld.algo.ts
import { BaseContract, log, op } from '@algorandfoundation/algorand-typescript'

export default class HelloWorldContract extends BaseContract {
  public approvalProgram(): boolean {
    const name = String(op.Txn.applicationArgs(0))
    log(`Hello, ${name}`)
    return true
  }
}

//include the package.json also in the puyaTsFiles.ts



please implement the changes above