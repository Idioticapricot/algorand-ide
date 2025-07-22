 
 
 1️⃣ Create Asset Transaction (ASA Creation)

 const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
        from: creator.addr,
        total: 1000000, // Total supply
        decimals: 0, // No fractional parts
        defaultFrozen: false,
        unitName: "MYASA",
        assetName: "My Custom Token",
        manager: creator.addr, // Manager Address
        reserve: creator.addr,
        freeze: creator.addr,
        clawback: creator.addr,
        suggestedParams: params
    });

    const signedTxn = txn.signTxn(creator.sk);
    const { txId } = await algodClient.sendRawTransaction(signedTxn).do();


    2️⃣ Asset Transfer Transaction (ASA Transfer)
const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        from: sender.addr,
        to: receiver,
        assetIndex: assetID,
        amount: 10, // Transfer 10 units of the ASA
        suggestedParams: params
    });

    const signedTxn = txn.signTxn(sender.sk);
    const { txId } = await algodClient.sendRawTransaction(signedTxn).do();

3️⃣ Asset Freeze Transaction (ASA Freeze / Unfreeze)



const params = await algodClient.getTransactionParams().do();

    // Create the asset freeze transaction
    const txn = algosdk.makeAssetFreezeTxnWithSuggestedParamsFromObject({
        from: freezeAccount.addr, // Only the Freeze Manager can do this
        assetIndex: assetID, // ASA ID
        freezeTarget: targetAccount, // Account to freeze/unfreeze
        freezeState: freezeFlag, // true = freeze, false = unfreeze
        suggestedParams: params
    });

    // Sign the transaction with Freeze Manager's private key
    const signedTxn = txn.signTxn(freezeAccount.sk);

    // Send the transaction to the network
    const { txId } = await algodClient.sendRawTransaction(signedTxn).do();
    console.log("Freeze transaction sent with ID:", txId);

    // Wait for confirmation
    const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);
    console.log("Freeze confirmed in round", confirmedTxn['confirmed-round']);


    4️⃣ Key Registration Transaction (Participating in Consensus)
const params = await algodClient.getTransactionParams().do();

    // Create key registration transaction
    const txn = algosdk.makeKeyRegistrationTxnWithSuggestedParamsFromObject({
        from: account.addr,
        voteKey: new Uint8Array(32), // Set to 32 zero bytes if you don't have participation keys
        selectionKey: new Uint8Array(32), // Same as above
        voteFirst: params.firstRound, // When voting starts
        voteLast: params.lastRound + 1000, // How long the key is valid
        voteKeyDilution: 10, // Dilution factor (minimum is 1, typical is 10 or 10000)
        suggestedParams: params
    });

    // Sign the transaction
    const signedTxn = txn.signTxn(account.sk);

    // Send the transaction to the network
    const { txId } = await algodClient.sendRawTransaction(signedTxn).do();
    console.log("Key Registration Transaction sent with ID:", txId);

    // Wait for confirmation
    const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);
    console.log("Key Registration confirmed in round", confirmedTxn['confirmed-round']);
}




1st fix i want you to impmenet the above trasacntions also in the flow builder
2nd fix i am not getitng any export code int he downlaoded export file
import algosdk from 'algosdk';

// Connect to Algorand node (TestNet in this example)
const algodToken = 'YOUR_ALGOD_API_TOKEN';
const algodServer = 'https://testnet-api.algonode.cloud';
const algodPort = ''; // Empty for Algonode cloud

const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);


async function main() {
    // Get transaction parameters from the network
    const params = await algodClient.getTransactionParams().do();

}

main().catch(console.error);

This is the output...



