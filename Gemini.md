For anything 

    const params = await algodClient.getTransactionParams().do();
this code should be common


For Payment Transaciton node

const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: senderAccount.addr,
        to: receiver,
        amount: amount, // should be specified in the node params
        suggestedParams: params
    });

    For signing txn node 


    // Sign the transaction with the sender's private key

        const signedTxn = txn.signTxn(senderAccount.sk);

// Send the transaction to the network
    const { txId } = await algodClient.sendRawTransaction(signedTxn).do();
    console.log("Transaction sent with ID:", txId);



    This code is for the payment transaction nodes.. 


For Asset Transaction Node i want this
// Create asset transfer transaction object
    const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        from: senderAccount.addr,
        to: receiver,
        assetIndex: assetID, // ASA ID
        amount: amount,
        suggestedParams: params
    });




i want the params to work i can be able to to that, just implement the payment and the asset transafer now , i want to export the code when i click download i need to download the code in .js format

```
import algosdk from 'algosdk';

// Connect to Algorand node (TestNet in this example)
const algodToken = 'YOUR_ALGOD_API_TOKEN';
const algodServer = 'https://testnet-api.algonode.cloud';
const algodPort = ''; // Empty for Algonode cloud

const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

// Sender account (Replace with your private key)
const senderMnemonic = "PASTE YOUR MNEMONIC HERE";
const senderAccount = algosdk.mnemonicToSecretKey(senderMnemonic);

// Receiver address
const receiver = "RECEIVER_ALGORAND_ADDRESS";

// Async function to perform payment transaction
async function sendAlgos() {
    // Get transaction parameters from the network (like fee, firstRound, etc.)
    const params = await algodClient.getTransactionParams().do();

    // Amount to send in microAlgos (1 Algo = 1,000,000 microAlgos)
    const amount = 1000000; // 1 ALGO

    // Create payment transaction object
    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: senderAccount.addr,
        to: receiver,
        amount: amount,
        suggestedParams: params
    });

    // Sign the transaction with the sender's private key
    const signedTxn = txn.signTxn(senderAccount.sk);

    // Send the transaction to the network
    const { txId } = await algodClient.sendRawTransaction(signedTxn).do();
    console.log("Transaction sent with ID:", txId);

    // Wait for confirmation
    const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);
    console.log("Transaction confirmed in round", confirmedTxn['confirmed-round']);
}

sendAlgos().catch(console.error);

```



i want the params to work i can be able to to that, just implement the payment and the asset transafer now , i want to export the code when i click download i need to download the code in .js format, the above code should be there in the js, the file should be like the above, 


and also in the Account Node , i want to use the mnemonics from the localStorage so when you drag the Account node i want to add the default Mnemonics, it should also show in the Node Properties..

