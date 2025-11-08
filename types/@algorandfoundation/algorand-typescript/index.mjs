import { N as NoImplementation } from './errors-Bg4n2Chz.js';
export { B as Base64, E as Ec, a as Ecdsa, G as Global, M as MimcConfigurations, T as Txn, V as VrfVerify, o as op } from './op-BUFe04-Y.js';
export { B as BaseContract, C as Contract, a as abimethod, i as arc4, b as baremethod, c as contract, r as readonly } from './index-C_DRi4sH.js';

function Uint64(v) {
    throw new NoImplementation();
}
Uint64.MAX_VALUE = NoImplementation.value();
Uint64.MIN_VALUE = NoImplementation.value();
function BigUint(v) {
    throw new NoImplementation();
}
function Bytes(value, ...replacements) {
    throw new NoImplementation();
}
(function (Bytes) {
    function fromHex(hex, options) {
        throw new NoImplementation();
    }
    Bytes.fromHex = fromHex;
    function fromBase64(b64, options) {
        throw new NoImplementation();
    }
    Bytes.fromBase64 = fromBase64;
    function fromBase32(b32, options) {
        throw new NoImplementation();
    }
    Bytes.fromBase32 = fromBase32;
})(Bytes || (Bytes = {}));

/**
 * Write one or more values to the transaction log.
 *
 * Each value is converted to bytes and concatenated
 * @param args The values to write
 */
function log(...args) {
    throw new NoImplementation();
}
/**
 * Asserts that `condition` is truthy, otherwise error and halt execution.
 * @param condition An expression that can be evaluated as truthy of falsy
 * @param message The message to show if `condition` is falsy and an error is raised.
 */
function assert(condition, message) {
    throw new NoImplementation();
}
/**
 * Raise an error and halt execution
 * @param message The message to accompany the error
 */
function err(message) {
    throw new NoImplementation();
}
/**
 * Applies all tests in `test` against `subject` and returns a boolean indicating if they all pass
 * @param subject An object or tuple to be tested
 * @param test An object containing one or more tests to be applied to the subject
 * @typeParam T The type of the subject
 * @returns True if all tests pass, otherwise false
 */
function match(subject, test) {
    throw new NoImplementation();
}
/**
 *
 * Applies all tests in `test` against `subject` and asserts they all pass
 * @param subject An object or tuple to be tested
 * @param test An object containing one or more tests to be applied to the subject
 * @param message An optional message to show if the assertion fails
 * @typeParam T The type of the subject
 */
function assertMatch(subject, test, message) {
    throw new NoImplementation();
}
/**
 * Defines the source of fees for the OpUp utility
 */
var OpUpFeeSource;
(function (OpUpFeeSource) {
    /**
     * Only the excess fee (credit) on the outer group should be used (itxn.fee = 0)
     */
    OpUpFeeSource[OpUpFeeSource["GroupCredit"] = 0] = "GroupCredit";
    /**
     * The app's account will cover all fees (itxn.fee = Global.minTxFee)
     */
    OpUpFeeSource[OpUpFeeSource["AppAccount"] = 1] = "AppAccount";
    /**
     * First the excess will be used, then remaining fees taken from the app account
     */
    OpUpFeeSource[OpUpFeeSource["Any"] = 2] = "Any";
})(OpUpFeeSource || (OpUpFeeSource = {}));
/**
 * Ensure the available op code budget is greater than or equal to requiredBudget.
 *
 * This is done by adding AppCall itxns to the group to increase the available budget. These itxns must be paid for
 * by the caller or the application.
 * @param requiredBudget The total required budget
 * @param feeSource Which source to withdraw txn fees from.
 */
function ensureBudget(requiredBudget, feeSource = OpUpFeeSource.GroupCredit) {
    throw new NoImplementation();
}
function urange(a, b, c) {
    throw new NoImplementation();
}
/**
 * Creates a deep copy of the specified value
 * @param value The value to clone
 */
function clone(value) {
    throw new NoImplementation();
}
/**
 * Performs validation to ensure the value is well-formed, errors if it is not
 * @param value The value to validate
 *
 */
function validateEncoding(value) {
    throw new NoImplementation();
}

function Account(publicKeyOrAddress) {
    throw new NoImplementation();
}
function Asset(assetId) {
    throw new NoImplementation();
}
function Application(applicationId) {
    throw new NoImplementation();
}

/**
 * Creates a Box proxy object offering methods of getting and setting the value stored in a single box.
 * @param options Options for creating the Box proxy
 * @typeParam TValue The type of the data stored in the box. This value will be encoded to bytes when stored and decoded on retrieval.
 */
function Box(options) {
    throw new NoImplementation();
}
/**
 * Creates a BoxMap proxy object offering methods of getting and setting a set of values stored in individual boxes indexed by a common key type
 * @param options Options for creating the BoxMap proxy
 * @typeParam TKey The type of the value used to key each box. This key will be encoded to bytes and prefixed with `keyPrefix`
 * @typeParam TValue The type of the data stored in the box. This value will be encoded to bytes when stored and decoded on retrieval.
 */
function BoxMap(options) {
    throw new NoImplementation();
}

/**
 * Creates a new proxy for manipulating a global state field
 * @param options Options for configuring this field
 * @typeParam ValueType The type of the value being stored - must be a serializable type
 */
function GlobalState(options) {
    throw new NoImplementation();
}
/**
 * Creates a new proxy for manipulating a local state field
 * @param options Options for configuring this field
 */
function LocalState(options) {
    throw new NoImplementation();
}

/* THIS FILE IS GENERATED BY ~/scripts/generate-txn-types.ts - DO NOT MODIFY DIRECTLY */
var itxn;
(function (itxn) {
    /**
     * Submit a group of ItxnParams objects and return the InnerTransaction results
     */
    function submitGroup(...transactionFields) {
        throw new NoImplementation();
    }
    itxn.submitGroup = submitGroup;
    /**
     * Holds Payment fields which can be updated, cloned, or submitted.
     */
    class PaymentItxnParams {
        /**
         * Submit an itxn with these fields and return the PaymentInnerTxn result
         */
        submit() {
            throw new NoImplementation();
        }
        /**
         * Update one or more fields in this PaymentItxnParams object
         */
        set(fields) {
            throw new NoImplementation();
        }
        /**
         * Return a copy of this PaymentItxnParams object
         */
        copy() {
            throw new NoImplementation();
        }
    }
    itxn.PaymentItxnParams = PaymentItxnParams;
    /**
     * Create a new PaymentItxnParams object with the specified fields
     */
    function payment(fields) {
        throw new NoImplementation();
    }
    itxn.payment = payment;
    /**
     * Holds KeyRegistration fields which can be updated, cloned, or submitted.
     */
    class KeyRegistrationItxnParams {
        /**
         * Submit an itxn with these fields and return the KeyRegistrationInnerTxn result
         */
        submit() {
            throw new NoImplementation();
        }
        /**
         * Update one or more fields in this KeyRegistrationItxnParams object
         */
        set(fields) {
            throw new NoImplementation();
        }
        /**
         * Return a copy of this KeyRegistrationItxnParams object
         */
        copy() {
            throw new NoImplementation();
        }
    }
    itxn.KeyRegistrationItxnParams = KeyRegistrationItxnParams;
    /**
     * Create a new KeyRegistrationItxnParams object with the specified fields
     */
    function keyRegistration(fields) {
        throw new NoImplementation();
    }
    itxn.keyRegistration = keyRegistration;
    /**
     * Holds AssetConfig fields which can be updated, cloned, or submitted.
     */
    class AssetConfigItxnParams {
        /**
         * Submit an itxn with these fields and return the AssetConfigInnerTxn result
         */
        submit() {
            throw new NoImplementation();
        }
        /**
         * Update one or more fields in this AssetConfigItxnParams object
         */
        set(fields) {
            throw new NoImplementation();
        }
        /**
         * Return a copy of this AssetConfigItxnParams object
         */
        copy() {
            throw new NoImplementation();
        }
    }
    itxn.AssetConfigItxnParams = AssetConfigItxnParams;
    /**
     * Create a new AssetConfigItxnParams object with the specified fields
     */
    function assetConfig(fields) {
        throw new NoImplementation();
    }
    itxn.assetConfig = assetConfig;
    /**
     * Holds AssetTransfer fields which can be updated, cloned, or submitted.
     */
    class AssetTransferItxnParams {
        /**
         * Submit an itxn with these fields and return the AssetTransferInnerTxn result
         */
        submit() {
            throw new NoImplementation();
        }
        /**
         * Update one or more fields in this AssetTransferItxnParams object
         */
        set(fields) {
            throw new NoImplementation();
        }
        /**
         * Return a copy of this AssetTransferItxnParams object
         */
        copy() {
            throw new NoImplementation();
        }
    }
    itxn.AssetTransferItxnParams = AssetTransferItxnParams;
    /**
     * Create a new AssetTransferItxnParams object with the specified fields
     */
    function assetTransfer(fields) {
        throw new NoImplementation();
    }
    itxn.assetTransfer = assetTransfer;
    /**
     * Holds AssetFreeze fields which can be updated, cloned, or submitted.
     */
    class AssetFreezeItxnParams {
        /**
         * Submit an itxn with these fields and return the AssetFreezeInnerTxn result
         */
        submit() {
            throw new NoImplementation();
        }
        /**
         * Update one or more fields in this AssetFreezeItxnParams object
         */
        set(fields) {
            throw new NoImplementation();
        }
        /**
         * Return a copy of this AssetFreezeItxnParams object
         */
        copy() {
            throw new NoImplementation();
        }
    }
    itxn.AssetFreezeItxnParams = AssetFreezeItxnParams;
    /**
     * Create a new AssetFreezeItxnParams object with the specified fields
     */
    function assetFreeze(fields) {
        throw new NoImplementation();
    }
    itxn.assetFreeze = assetFreeze;
    /**
     * Holds ApplicationCall fields which can be updated, cloned, or submitted.
     */
    class ApplicationCallItxnParams {
        /**
         * Submit an itxn with these fields and return the ApplicationCallInnerTxn result
         */
        submit() {
            throw new NoImplementation();
        }
        /**
         * Update one or more fields in this ApplicationCallItxnParams object
         */
        set(fields) {
            throw new NoImplementation();
        }
        /**
         * Return a copy of this ApplicationCallItxnParams object
         */
        copy() {
            throw new NoImplementation();
        }
    }
    itxn.ApplicationCallItxnParams = ApplicationCallItxnParams;
    /**
     * Create a new ApplicationCallItxnParams object with the specified fields
     */
    function applicationCall(fields) {
        throw new NoImplementation();
    }
    itxn.applicationCall = applicationCall;
})(itxn || (itxn = {}));

const itxnCompose = NoImplementation.value();

var gtxn;
(function (gtxn) {
    /**
     * Get the nth transaction in the group without verifying its type
     * @param n The index of the txn in the group
     */
    function Transaction(n) {
        throw new NoImplementation();
    }
    gtxn.Transaction = Transaction;
    /**
     * Get the nth transaction in the group
     * Verifies the txn type is 'pay'
     * @param n The index of the txn in the group
     */
    function PaymentTxn(n) {
        throw new NoImplementation();
    }
    gtxn.PaymentTxn = PaymentTxn;
    /**
     * Get the nth transaction in the group
     * Verifies the txn type is 'keyreg'
     * @param n The index of the txn in the group
     */
    function KeyRegistrationTxn(n) {
        throw new NoImplementation();
    }
    gtxn.KeyRegistrationTxn = KeyRegistrationTxn;
    /**
     * Get the nth transaction in the group
     * Verifies the txn type is 'acfg'
     * @param n The index of the txn in the group
     */
    function AssetConfigTxn(n) {
        throw new NoImplementation();
    }
    gtxn.AssetConfigTxn = AssetConfigTxn;
    /**
     * Get the nth transaction in the group
     * Verifies the txn type is 'axfer'
     * @param n The index of the txn in the group
     */
    function AssetTransferTxn(n) {
        throw new NoImplementation();
    }
    gtxn.AssetTransferTxn = AssetTransferTxn;
    /**
     * Get the nth transaction in the group
     * Verifies the txn type is 'afrz'
     * @param n The index of the txn in the group
     */
    function AssetFreezeTxn(n) {
        throw new NoImplementation();
    }
    gtxn.AssetFreezeTxn = AssetFreezeTxn;
    /**
     * Get the nth transaction in the group
     * Verifies the txn type is 'appl'
     * @param n The index of the txn in the group
     */
    function ApplicationCallTxn(n) {
        throw new NoImplementation();
    }
    gtxn.ApplicationCallTxn = ApplicationCallTxn;
})(gtxn || (gtxn = {}));

/**
 * The different transaction types available in a transaction
 */
var TransactionType;
(function (TransactionType) {
    /**
     * A Payment transaction
     */
    TransactionType[TransactionType["Payment"] = 1] = "Payment";
    /**
     * A Key Registration transaction
     */
    TransactionType[TransactionType["KeyRegistration"] = 2] = "KeyRegistration";
    /**
     * An Asset Config transaction
     */
    TransactionType[TransactionType["AssetConfig"] = 3] = "AssetConfig";
    /**
     * An Asset Transfer transaction
     */
    TransactionType[TransactionType["AssetTransfer"] = 4] = "AssetTransfer";
    /**
     * An Asset Freeze transaction
     */
    TransactionType[TransactionType["AssetFreeze"] = 5] = "AssetFreeze";
    /**
     * An Application Call transaction
     */
    TransactionType[TransactionType["ApplicationCall"] = 6] = "ApplicationCall";
})(TransactionType || (TransactionType = {}));

/**
 * Base class for Algorand TypeScript Logic Signatures (also known as Smart Signatures)
 */
class LogicSig {
}
/**
 * The logicsig decorator can be used to specify additional configuration options for a logic signature
 * @param options An object containing the configuration options
 */
function logicsig(options) {
    return (logicSig) => logicSig;
}

/**
 * Declare a template variable which can be replaced at compile time with an environment specific value.
 *
 * The final variable name will be `prefix + variableName`
 * @param variableName The key used to identify the variable.
 * @param prefix The prefix to apply the variable name (Defaults to 'TMPL_')
 */
function TemplateVar(variableName, prefix = 'TMPL_') {
    throw new NoImplementation();
}

function compile(artefact) {
    throw new NoImplementation();
}

/**
 * An in memory mutable array which is passed by reference
 */
class ReferenceArray {
    /**
     * Create a new ReferenceArray with the specified items
     * @param items The initial items for the array
     */
    constructor(...items) { }
    /**
     * Returns the current length of this array
     */
    get length() {
        throw new NoImplementation();
    }
    /**
     * Returns the item at the given index.
     * Negative indexes are taken from the end.
     * @param index The index of the item to retrieve
     */
    at(index) {
        throw new NoImplementation();
    }
    slice(start, end) {
        throw new NoImplementation();
    }
    /**
     * Returns an iterator for the items in this array
     */
    [Symbol.iterator]() {
        throw new NoImplementation();
    }
    /**
     * Returns an iterator for a tuple of the indexes and items in this array
     */
    entries() {
        throw new NoImplementation();
    }
    /**
     * Returns an iterator for the indexes in this array
     */
    keys() {
        throw new NoImplementation();
    }
    /**
     * Push a number of items into this array
     * @param items The items to be added to this array
     */
    push(...items) {
        throw new NoImplementation();
    }
    /**
     * Pop a single item from this array
     */
    pop() {
        throw new NoImplementation();
    }
}

function emit(event, ...eventProps) {
    throw new NoImplementation();
}

/**
 * The possible on complete actions a method can handle, represented as an integer
 */
var OnCompleteAction;
(function (OnCompleteAction) {
    /**
     * Do nothing after the transaction has completed
     */
    OnCompleteAction[OnCompleteAction["NoOp"] = 0] = "NoOp";
    /**
     * Opt the calling user into the contract
     */
    OnCompleteAction[OnCompleteAction["OptIn"] = 1] = "OptIn";
    /**
     * Close the calling user out of the contract
     */
    OnCompleteAction[OnCompleteAction["CloseOut"] = 2] = "CloseOut";
    /**
     * Run the clear state program and forcibly close the user out of the contract
     */
    OnCompleteAction[OnCompleteAction["ClearState"] = 3] = "ClearState";
    /**
     * Replace the application's approval and clear state programs with the bytes from this transaction
     */
    OnCompleteAction[OnCompleteAction["UpdateApplication"] = 4] = "UpdateApplication";
    /**
     * Delete the application
     */
    OnCompleteAction[OnCompleteAction["DeleteApplication"] = 5] = "DeleteApplication";
})(OnCompleteAction || (OnCompleteAction = {}));

/**
 * A fixed sized array
 * @typeParam TItem The type of a single item in the array
 * @typeParam TLength The fixed length of the array
 */
class FixedArray {
    constructor(...items) { }
    /**
     * Returns a new array containing all items from _this_ array, and _other_ array
     * @param items Another array to concat with this one
     */
    concat(...items) {
        throw new NoImplementation();
    }
    /**
     * Returns the statically declared length of this array
     */
    get length() {
        throw new NoImplementation();
    }
    /**
     * Returns the item at the given index.
     * Negative indexes are taken from the end.
     * @param index The index of the item to retrieve
     */
    at(index) {
        throw new NoImplementation();
    }
    slice(start, end) {
        throw new NoImplementation();
    }
    /**
     * Returns an iterator for the items in this array
     */
    [Symbol.iterator]() {
        throw new NoImplementation();
    }
    /**
     * Returns an iterator for a tuple of the indexes and items in this array
     */
    entries() {
        throw new NoImplementation();
    }
    /**
     * Returns an iterator for the indexes in this array
     */
    keys() {
        throw new NoImplementation();
    }
    /**
     * Creates a string by concatenating all the items in the array delimited by the
     * specified separator (or ',' by default)
     * @param separator
     * @deprecated Join is not supported in Algorand TypeScript
     */
    join(separator) {
        throw new NoImplementation();
    }
}

export { Account, Application, Asset, BigUint, Box, BoxMap, Bytes, FixedArray, GlobalState, LocalState, LogicSig, OnCompleteAction, OpUpFeeSource, ReferenceArray, TemplateVar, TransactionType, Uint64, assert, assertMatch, clone, compile, emit, ensureBudget, err, gtxn, itxn, itxnCompose, log, logicsig, match, urange, validateEncoding };
//# sourceMappingURL=index.mjs.map
