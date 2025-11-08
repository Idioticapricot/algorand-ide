import { DeliberateAny } from './internal/typescript-helpers';
/**
 * Emit an arc28 event log using either an ARC4Struct type or a named object type.
 * Object types must have an ARC4 equivalent type.
 *
 * Anonymous types cannot be used as the type name is used to determine the event prefix
 * @param event An ARC4Struct instance, or a plain object with a named type
 *
 * @example
 * class Demo extends Struct<{ a: Uint64 }> {}
 * emit(new Demo({ a: new Uint64(123) }))
 *
 * @example
 * type Demo = { a: uint64 }
 * emit<Demo>({a: 123})
 * // or
 * const d: Demo = { a: 123 }
 * emit(d)
 */
export declare function emit<TEvent extends Record<string, DeliberateAny>>(event: TEvent): void;
/**
 * Emit an arc28 event log using an explicit name and inferred property/field types.
 * Property types must be ARC4 or have an ARC4 equivalent type.
 * @param eventName The name of the event (must be a compile time constant)
 * @param eventProps A set of event properties (order is significant)
 *
 * @example
 * emit("Demo", new Uint64(123))
 *
 * @example
 * const a: uint64 = 123
 * emit("Demo", a)
 */
export declare function emit<TProps extends [...DeliberateAny[]]>(eventName: string, ...eventProps: TProps): void;
import { uint64, Uint64Compat } from './primitives';
/**
 * A fixed sized array
 * @typeParam TItem The type of a single item in the array
 * @typeParam TLength The fixed length of the array
 */
export declare class FixedArray<TItem, TLength extends number> implements ConcatArray<TItem> {
    /**
     * Create a new FixedArray instance
     */
    constructor();
    /**
     * Create a new FixedArray instance with the specified items
     * @param items The initial items for the array
     */
    constructor(...items: TItem[] & {
        length: TLength;
    });
    /**
     * Returns a new array containing all items from _this_ array, and _other_ array
     * @param items Another array to concat with this one
     */
    concat(...items: (TItem | ConcatArray<TItem>)[]): TItem[];
    /**
     * Returns the statically declared length of this array
     */
    get length(): uint64;
    /**
     * Returns the item at the given index.
     * Negative indexes are taken from the end.
     * @param index The index of the item to retrieve
     */
    at(index: Uint64Compat): TItem;
    /** @deprecated Array slicing is not yet supported in Algorand TypeScript
     * Create a new Dynamic array with all items from this array
     */
    slice(): Array<TItem>;
    /** @deprecated Array slicing is not yet supported in Algorand TypeScript
     * Create a new DynamicArray with all items up till `end`.
     * Negative indexes are taken from the end.
     * @param end An index in which to stop copying items.
     */
    slice(end: Uint64Compat): Array<TItem>;
    /** @deprecated Array slicing is not yet supported in Algorand TypeScript
     * Create a new DynamicArray with items from `start`, up until `end`
     * Negative indexes are taken from the end.
     * @param start An index in which to start copying items.
     * @param end An index in which to stop copying items
     */
    slice(start: Uint64Compat, end: Uint64Compat): Array<TItem>;
    /**
     * Returns an iterator for the items in this array
     */
    [Symbol.iterator](): IterableIterator<TItem>;
    /**
     * Returns an iterator for a tuple of the indexes and items in this array
     */
    entries(): ArrayIterator<readonly [uint64, TItem]>;
    /**
     * Returns an iterator for the indexes in this array
     */
    keys(): IterableIterator<uint64>;
    /**
     * Get or set the item at the specified index.
     * Negative indexes are not supported
     */
    [index: uint64]: TItem;
    /**
     * Creates a string by concatenating all the items in the array delimited by the
     * specified separator (or ',' by default)
     * @param separator
     * @deprecated Join is not supported in Algorand TypeScript
     */
    join(separator?: string): string;
}
import { ConstructorFor } from './internal/typescript-helpers';
import { uint64 } from './primitives';
import { NumberRange } from './util';
/**
 * The base type for all Algorand TypeScript contracts
 */
export declare abstract class BaseContract {
    /**
     * The program to be run when the On Completion Action is != ClearState (3)
     */
    abstract approvalProgram(): boolean | uint64;
    /**
     * The program to be run when the On Completion Action is == ClearState (3)
     */
    clearStateProgram(): boolean | uint64;
}
/**
 * Options class to manually define the total amount of global and local state contract will use.
 *
 * This is not required when all state is assigned to `this.`, but is required if a
 * contract dynamically interacts with state via `AppGlobal.getBytes` etc, or if you want
 * to reserve additional state storage for future contract updates, since the Algorand protocol
 * doesn't allow increasing them after creation.
 */
export type StateTotals = {
    globalUints?: number;
    globalBytes?: number;
    localUints?: number;
    localBytes?: number;
};
/**
 * Additional configuration options for a contract
 */
export type ContractOptions = {
    /**
     * Determines which AVM version to use, this affects what operations are supported.
     * Defaults to value provided on command line (which defaults to current mainnet version)
     */
    avmVersion?: 10 | 11 | 12 | 13;
    /**
     * Override the name of the logic signature when generating build artifacts.
     * Defaults to the class name
     */
    name?: string;
    /**
     * Allows you to mark a slot ID or range of slot IDs as "off limits" to Puya.
     * These slot ID(s) will never be written to or otherwise manipulating by the compiler itself.
     * This is particularly useful in combination with `op.gload_bytes` / `op.gload_uint64`
     * which lets a contract in a group transaction read from the scratch slots of another contract
     * that occurs earlier in the transaction group.
     *
     * In the case of inheritance, scratch slots reserved become cumulative. It is not an error
     * to have overlapping ranges or values either, so if a base class contract reserves slots
     * 0-5 inclusive and the derived contract reserves 5-10 inclusive, then within the derived
     * contract all slots 0-10 will be marked as reserved.
     */
    scratchSlots?: Array<number | NumberRange>;
    /**
     * Allows defining what values should be used for global and local uint and bytes storage
     * values when creating a contract. Used when outputting ARC-32 application.json schemas.
     *
     * If left unspecified, the totals will be determined by the compiler based on state
     * variables assigned to `this`.
     *
     * This setting is not inherited, and only applies to the exact `Contract` it is specified
     * on. If a base class does specify this setting, and a derived class does not, a warning
     * will be emitted for the derived class. To resolve this warning, `stateTotals` must be
     * specified. An empty object may be provided in order to indicate that this contract should
     * revert to the default behaviour
     */
    stateTotals?: StateTotals;
};
/**
 * The contract decorator can be used to specify additional configuration options for a smart contract
 * @param options An object containing the configuration options
 */
export declare function contract(options: ContractOptions): <T extends ConstructorFor<BaseContract>>(contract: T, ctx: ClassDecoratorContext) => never;
import { bytes, uint64 } from './primitives';
/**
 * A Box proxy
 * @typeParam TValue The type of the data stored in the box.
 */
export type Box<TValue> = {
    /**
     * Create the box for this proxy with a bzero value.
     *  - If options.size is specified, the box will be created with that length
     *  - Otherwise the box will be created with storage size of TValue. Errors if the size of TValue is not fixed
     *
     * No op if the box already exists with the same size
     * Errors if the box already exists with a different size.
     * Errors if the specified size is greater than the max box size (32,768)
     * @returns True if the box was created, false if it already existed
     */
    create(options?: {
        size?: uint64;
    }): boolean;
    /**
     * Get the key used by this box proxy
     */
    readonly key: bytes;
    /**
     * Get or set the value stored in the box
     *
     * Get will error if the box does not exist
     */
    value: TValue;
    /**
     * Get a boolean indicating if the box exists or not
     */
    readonly exists: boolean;
    /**
     * Get the value stored in the box, or return a specified default value if the box does not exist
     * @param options Options to specify a default value to be returned if no other value exists
     * @returns The value if the box exists, else the default value
     */
    get(options: {
        default: TValue;
    }): TValue;
    /**
     * Delete the box associated with this proxy if it exists.
     * @returns True if the box existed and was deleted, else false
     */
    delete(): boolean;
    /**
     * Get the value stored in the box if available, and a boolean indicating if the box exists.
     *
     * If the box does not exist, the value returned at position 0 should not be relied on to have a valid value.
     * @returns A tuple with the first item being the box value, and the second item being a boolean indicating if the box exists.
     */
    maybe(): readonly [TValue, boolean];
    /**
     * Returns the length of the box, or error if the box does not exist
     */
    readonly length: uint64;
    /**
     * Splice the specified bytes into the box starting at `start`, removing `length` bytes
     * from the existing value and replacing them with `value` before appending the remainder of the original box value.
     *
     * If the resulting byte value is larger than length, bytes will be trimmed from the end
     * If the resulting byte value is smaller than length, zero bytes will be appended to the end
     * Error if the box does not exist
     * @param start The index to start inserting the value
     * @param length The number of bytes after `start` to be omitted
     * @param value The value to be inserted
     */
    splice(start: uint64, length: uint64, value: bytes): void;
    /**
     * Replace bytes in a box starting at `start`.
     *
     * Error if the box does not exist
     * Error if `start` + `value.length` is greater than the box size
     * @param start The index to start replacing
     * @param value The value to be written
     */
    replace(start: uint64, value: bytes): void;
    /**
     * Extract a slice of bytes from the box
     *
     * Error if the box does not exist
     * Error if `start` + `length` is greater than the box size
     * @param start The index to start extracting
     * @param length The number of bytes to extract
     * @returns The extracted bytes
     */
    extract(start: uint64, length: uint64): bytes;
    /**
     * Resize the box to the specified size.
     *
     * Adds zero bytes to the end if the new size is larger
     * Removes end bytes if the new size is smaller
     * Error if the box does not exist
     * @param newSize The new size for the box
     */
    resize(newSize: uint64): void;
};
/**
 * A BoxMap proxy
 * @typeParam TKey The type of the value used to key each box.
 * @typeParam TValue The type of the data stored in the box.
 */
export type BoxMap<TKey, TValue> = {
    /**
     * Get the bytes used to prefix each key
     */
    readonly keyPrefix: bytes;
    /**
     * Get a Box proxy for a single item in the BoxMap
     * @param key The key of the box to retrieve a proxy for
     */
    (key: TKey): Box<TValue>;
};
/**
 * Options for creating a Box proxy
 */
interface CreateBoxOptions {
    /**
     * The bytes which make up the key of the box
     */
    key: bytes | string;
}
/**
 * Creates a Box proxy object offering methods of getting and setting the value stored in a single box.
 * @param options Options for creating the Box proxy
 * @typeParam TValue The type of the data stored in the box. This value will be encoded to bytes when stored and decoded on retrieval.
 */
export declare function Box<TValue>(options: CreateBoxOptions): Box<TValue>;
/**
 * Options for creating a BoxMap proxy
 */
interface CreateBoxMapOptions {
    /**
     * The bytes which prefix each key of the box map
     */
    keyPrefix: bytes | string;
}
/**
 * Creates a BoxMap proxy object offering methods of getting and setting a set of values stored in individual boxes indexed by a common key type
 * @param options Options for creating the BoxMap proxy
 * @typeParam TKey The type of the value used to key each box. This key will be encoded to bytes and prefixed with `keyPrefix`
 * @typeParam TValue The type of the data stored in the box. This value will be encoded to bytes when stored and decoded on retrieval.
 */
export declare function BoxMap<TKey, TValue>(options: CreateBoxMapOptions): BoxMap<TKey, TValue>;
export {};
import { BaseContract } from './base-contract';
import { ConstructorFor, DeliberateAny } from './internal/typescript-helpers';
import { LogicSig } from './logic-sig';
import { bytes, uint64 } from './primitives';
import { Account } from './reference';
/**
 * Provides compiled programs and state allocation values for a Contract. Created by calling `compile(ExampleContractType)`
 */
export type CompiledContract = {
    /**
     * Approval program pages for a contract, after template variables have been replaced and compiled to AVM bytecode
     */
    readonly approvalProgram: readonly [bytes, bytes];
    /**
     * Clear state program pages for a contract, after template variables have been replaced and compiled to AVM bytecode
     */
    readonly clearStateProgram: readonly [bytes, bytes];
    /**
     * By default, provides extra program pages required based on approval and clear state program size, can be overridden when calling `compile(ExampleContractType, { extraProgramPages: ... })`
     */
    readonly extraProgramPages: uint64;
    /**
     * By default, provides global num uints based on contract state totals, can be overridden when calling `compile(ExampleContractType, { globalUints: ... })`
     */
    readonly globalUints: uint64;
    /**
     * By default, provides global num bytes based on contract state totals, can be overridden when calling `compile(ExampleContractType, { globalBytes: ... })`
     */
    readonly globalBytes: uint64;
    /**
     * By default, provides local num uints based on contract state totals, can be overridden when calling `compile(ExampleContractType, { localUints: ... })`
     */
    readonly localUints: uint64;
    /**
     * By default, provides local num bytes based on contract state totals, can be overridden  when calling `compile(ExampleContractType, { localBytes: ... })`
     */
    readonly localBytes: uint64;
};
/**
 * Provides account for a Logic Signature. Created by calling `compile(LogicSigType)`
 */
export type CompiledLogicSig = {
    /**
     * Address of a logic sig program, after template variables have been replaced and compiled to AVM bytecode
     */
    readonly account: Account;
};
/**
 * Options for compiling a contract
 */
export type CompileContractOptions = {
    /**
     * Number of extra program pages, defaults to minimum required for contract
     */
    readonly extraProgramPages?: uint64;
    /**
     * Number of global uint64s, defaults to value defined for contract
     */
    readonly globalUints?: uint64;
    /**
     * Number of global bytes, defaults to value defined for contract
     */
    readonly globalBytes?: uint64;
    /**
     * Number of local uint64s, defaults to value defined for contract
     */
    readonly localUints?: uint64;
    /**
     * Number of local bytes, defaults to value defined for contract
     */
    readonly localBytes?: uint64;
    /**
     * Template variables to substitute into the contract, key should be without the prefix, must evaluate to a compile time constant
     * and match the type of the template var declaration
     */
    readonly templateVars?: Record<string, DeliberateAny>;
    /**
     * Prefix to add to provided template vars, defaults to the prefix supplied on command line (which defaults to TMPL_)
     */
    readonly templateVarsPrefix?: string;
};
/**
 * Options for compiling a logic signature
 */
export type CompileLogicSigOptions = {
    /**
     * Template variables to substitute into the contract, key should be without the prefix, must evaluate to a compile time constant
     * and match the type of the template var declaration
     */
    templateVars?: Record<string, DeliberateAny>;
    /**
     * Prefix to add to provided template vars, defaults to the prefix supplied on command line (which defaults to TMPL_)
     */
    templateVarsPrefix?: string;
};
/**
 * Compile a contract and return the resulting byte code for approval and clear state programs.
 * @param contract The contract class to compile
 * @param options Options for compiling the contract
 */
export declare function compile(contract: ConstructorFor<BaseContract>, options?: CompileContractOptions): CompiledContract;
/**
 * Compile a logic signature and return an account ready for signing transactions.
 * @param logicSig The logic sig class to compile
 * @param options Options for compiling the logic sig
 */
export declare function compile(logicSig: ConstructorFor<LogicSig>, options?: CompileLogicSigOptions): CompiledLogicSig;
import { OnCompleteAction } from './on-complete-action';
import { bytes, uint64 } from './primitives';
import { Account, Application, Asset } from './reference';
import { TransactionType } from './transactions';
declare const isGtxn: unique symbol;
export declare namespace gtxn {
    /**
     * A group transaction of type 'pay'
     */
    interface PaymentTxn {
        /** @hidden */
        [isGtxn]?: true;
        /**
         * 32 byte address
         */
        readonly sender: Account;
        /**
         * microalgos
         */
        readonly fee: uint64;
        /**
         * round number
         */
        readonly firstValid: uint64;
        /**
         * UNIX timestamp of block before txn.FirstValid. Fails if negative
         */
        readonly firstValidTime: uint64;
        /**
         * round number
         */
        readonly lastValid: uint64;
        /**
         * Any data up to 1024 bytes
         */
        readonly note: bytes;
        /**
         * 32 byte lease value
         */
        readonly lease: bytes<32>;
        /**
         * Transaction type as bytes
         */
        readonly typeBytes: bytes;
        /**
         * Transaction type
         */
        readonly type: TransactionType.Payment;
        /**
         * Position of this transaction within an atomic group
         * A stand-alone transaction is implicitly element 0 in a group of 1
         */
        readonly groupIndex: uint64;
        /**
         * The computed ID for this transaction. 32 bytes.
         */
        readonly txnId: bytes<32>;
        /**
         * 32 byte Sender's new AuthAddr
         */
        readonly rekeyTo: Account;
        /**
         * 32 byte address
         */
        readonly receiver: Account;
        /**
         * microalgos
         */
        readonly amount: uint64;
        /**
         * 32 byte address
         */
        readonly closeRemainderTo: Account;
    }
    /**
     * A group transaction of type 'keyreg'
     */
    interface KeyRegistrationTxn {
        /** @hidden */
        [isGtxn]?: true;
        /**
         * 32 byte address
         */
        readonly sender: Account;
        /**
         * microalgos
         */
        readonly fee: uint64;
        /**
         * round number
         */
        readonly firstValid: uint64;
        /**
         * UNIX timestamp of block before txn.FirstValid. Fails if negative
         */
        readonly firstValidTime: uint64;
        /**
         * round number
         */
        readonly lastValid: uint64;
        /**
         * Any data up to 1024 bytes
         */
        readonly note: bytes;
        /**
         * 32 byte lease value
         */
        readonly lease: bytes<32>;
        /**
         * Transaction type as bytes
         */
        readonly typeBytes: bytes;
        /**
         * Transaction type
         */
        readonly type: TransactionType.KeyRegistration;
        /**
         * Position of this transaction within an atomic group
         * A stand-alone transaction is implicitly element 0 in a group of 1
         */
        readonly groupIndex: uint64;
        /**
         * The computed ID for this transaction. 32 bytes.
         */
        readonly txnId: bytes<32>;
        /**
         * 32 byte Sender's new AuthAddr
         */
        readonly rekeyTo: Account;
        /**
         * 32 byte address
         */
        readonly voteKey: bytes<32>;
        /**
         * 32 byte address
         */
        readonly selectionKey: bytes<32>;
        /**
         * The first round that the participation key is valid.
         */
        readonly voteFirst: uint64;
        /**
         * The last round that the participation key is valid.
         */
        readonly voteLast: uint64;
        /**
         * Dilution for the 2-level participation key
         */
        readonly voteKeyDilution: uint64;
        /**
         * Marks an account nonparticipating for rewards
         */
        readonly nonparticipation: boolean;
        /**
         * 64 byte state proof public key
         */
        readonly stateProofKey: bytes<64>;
    }
    /**
     * A group transaction of type 'acfg'
     */
    interface AssetConfigTxn {
        /** @hidden */
        [isGtxn]?: true;
        /**
         * 32 byte address
         */
        readonly sender: Account;
        /**
         * microalgos
         */
        readonly fee: uint64;
        /**
         * round number
         */
        readonly firstValid: uint64;
        /**
         * UNIX timestamp of block before txn.FirstValid. Fails if negative
         */
        readonly firstValidTime: uint64;
        /**
         * round number
         */
        readonly lastValid: uint64;
        /**
         * Any data up to 1024 bytes
         */
        readonly note: bytes;
        /**
         * 32 byte lease value
         */
        readonly lease: bytes<32>;
        /**
         * Transaction type as bytes
         */
        readonly typeBytes: bytes;
        /**
         * Transaction type
         */
        readonly type: TransactionType.AssetConfig;
        /**
         * Position of this transaction within an atomic group
         * A stand-alone transaction is implicitly element 0 in a group of 1
         */
        readonly groupIndex: uint64;
        /**
         * The computed ID for this transaction. 32 bytes.
         */
        readonly txnId: bytes<32>;
        /**
         * 32 byte Sender's new AuthAddr
         */
        readonly rekeyTo: Account;
        /**
         * Asset ID in asset config transaction
         */
        readonly configAsset: Asset;
        /**
         * The asset created by this transaction
         */
        readonly createdAsset: Asset;
        /**
         * Total number of units of this asset created
         */
        readonly total: uint64;
        /**
         * Number of digits to display after the decimal place when displaying the asset
         */
        readonly decimals: uint64;
        /**
         * Whether the asset's slots are frozen by default or not, 0 or 1
         */
        readonly defaultFrozen: boolean;
        /**
         * Unit name of the asset
         */
        readonly unitName: bytes;
        /**
         * The asset name
         */
        readonly assetName: bytes;
        /**
         * URL
         */
        readonly url: bytes;
        /**
         * 32 byte commitment to unspecified asset metadata
         */
        readonly metadataHash: bytes<32>;
        /**
         * 32 byte address
         */
        readonly manager: Account;
        /**
         * 32 byte address
         */
        readonly reserve: Account;
        /**
         * 32 byte address
         */
        readonly freeze: Account;
        /**
         * 32 byte address
         */
        readonly clawback: Account;
    }
    /**
     * A group transaction of type 'axfer'
     */
    interface AssetTransferTxn {
        /** @hidden */
        [isGtxn]?: true;
        /**
         * 32 byte address
         */
        readonly sender: Account;
        /**
         * microalgos
         */
        readonly fee: uint64;
        /**
         * round number
         */
        readonly firstValid: uint64;
        /**
         * UNIX timestamp of block before txn.FirstValid. Fails if negative
         */
        readonly firstValidTime: uint64;
        /**
         * round number
         */
        readonly lastValid: uint64;
        /**
         * Any data up to 1024 bytes
         */
        readonly note: bytes;
        /**
         * 32 byte lease value
         */
        readonly lease: bytes<32>;
        /**
         * Transaction type as bytes
         */
        readonly typeBytes: bytes;
        /**
         * Transaction type
         */
        readonly type: TransactionType.AssetTransfer;
        /**
         * Position of this transaction within an atomic group
         * A stand-alone transaction is implicitly element 0 in a group of 1
         */
        readonly groupIndex: uint64;
        /**
         * The computed ID for this transaction. 32 bytes.
         */
        readonly txnId: bytes<32>;
        /**
         * 32 byte Sender's new AuthAddr
         */
        readonly rekeyTo: Account;
        /**
         * Asset ID
         */
        readonly xferAsset: Asset;
        /**
         * value in Asset's units
         */
        readonly assetAmount: uint64;
        /**
         * 32 byte address. Source of assets if Sender is the Asset's Clawback address.
         */
        readonly assetSender: Account;
        /**
         * 32 byte address
         */
        readonly assetReceiver: Account;
        /**
         * 32 byte address
         */
        readonly assetCloseTo: Account;
    }
    /**
     * A group transaction of type 'afrz'
     */
    interface AssetFreezeTxn {
        /** @hidden */
        [isGtxn]?: true;
        /**
         * 32 byte address
         */
        readonly sender: Account;
        /**
         * microalgos
         */
        readonly fee: uint64;
        /**
         * round number
         */
        readonly firstValid: uint64;
        /**
         * UNIX timestamp of block before txn.FirstValid. Fails if negative
         */
        readonly firstValidTime: uint64;
        /**
         * round number
         */
        readonly lastValid: uint64;
        /**
         * Any data up to 1024 bytes
         */
        readonly note: bytes;
        /**
         * 32 byte lease value
         */
        readonly lease: bytes<32>;
        /**
         * Transaction type as bytes
         */
        readonly typeBytes: bytes;
        /**
         * Transaction type
         */
        readonly type: TransactionType.AssetFreeze;
        /**
         * Position of this transaction within an atomic group
         * A stand-alone transaction is implicitly element 0 in a group of 1
         */
        readonly groupIndex: uint64;
        /**
         * The computed ID for this transaction. 32 bytes.
         */
        readonly txnId: bytes<32>;
        /**
         * 32 byte Sender's new AuthAddr
         */
        readonly rekeyTo: Account;
        /**
         * Asset ID being frozen or un-frozen
         */
        readonly freezeAsset: Asset;
        /**
         * 32 byte address of the account whose asset slot is being frozen or un-frozen
         */
        readonly freezeAccount: Account;
        /**
         * The new frozen value
         */
        readonly frozen: boolean;
    }
    /**
     * A group transaction of type 'appl'
     */
    interface ApplicationCallTxn {
        /** @hidden */
        [isGtxn]?: true;
        /**
         * 32 byte address
         */
        readonly sender: Account;
        /**
         * microalgos
         */
        readonly fee: uint64;
        /**
         * round number
         */
        readonly firstValid: uint64;
        /**
         * UNIX timestamp of block before txn.FirstValid. Fails if negative
         */
        readonly firstValidTime: uint64;
        /**
         * round number
         */
        readonly lastValid: uint64;
        /**
         * Any data up to 1024 bytes
         */
        readonly note: bytes;
        /**
         * 32 byte lease value
         */
        readonly lease: bytes<32>;
        /**
         * Transaction type as bytes
         */
        readonly typeBytes: bytes;
        /**
         * Transaction type
         */
        readonly type: TransactionType.ApplicationCall;
        /**
         * Position of this transaction within an atomic group
         * A stand-alone transaction is implicitly element 0 in a group of 1
         */
        readonly groupIndex: uint64;
        /**
         * The computed ID for this transaction. 32 bytes.
         */
        readonly txnId: bytes<32>;
        /**
         * 32 byte Sender's new AuthAddr
         */
        readonly rekeyTo: Account;
        /**
         * ApplicationID from ApplicationCall transaction
         */
        readonly appId: Application;
        /**
         * ApplicationCall transaction on completion action
         */
        readonly onCompletion: OnCompleteAction;
        /**
         * Number of ApplicationArgs
         */
        readonly numAppArgs: uint64;
        /**
         * Number of ApplicationArgs
         */
        readonly numAccounts: uint64;
        /**
         * The first page of the Approval program
         */
        readonly approvalProgram: bytes;
        /**
         * The first page of the Clear State program
         */
        readonly clearStateProgram: bytes;
        /**
         * Number of Assets
         */
        readonly numAssets: uint64;
        /**
         * Number of Applications
         */
        readonly numApps: uint64;
        /**
         * Number of global state integers this application makes use of.
         */
        readonly globalNumUint: uint64;
        /**
         * Number of global state byteslices this application makes use of.
         */
        readonly globalNumBytes: uint64;
        /**
         * Number of local state integers this application makes use of.
         */
        readonly localNumUint: uint64;
        /**
         * Number of local state byteslices this application makes use of.
         */
        readonly localNumBytes: uint64;
        /**
         * Number of additional pages for each of the application's approval and clear state program
         */
        readonly extraProgramPages: uint64;
        /**
         * The last message emitted. Empty bytes if none were emitted. App mode only
         */
        readonly lastLog: bytes;
        /**
         * Read application logs
         * @param index Index of the log to get
         */
        logs(index: uint64): bytes;
        /**
         * Number of Approval Program pages
         */
        readonly numApprovalProgramPages: uint64;
        /**
         * All approval program pages
         * @param index Index of the page to get
         */
        approvalProgramPages(index: uint64): bytes;
        /**
         * Number of Clear State Program pages
         */
        readonly numClearStateProgramPages: uint64;
        /**
         * All clear state program pages
         * @param index Index of the page to get
         */
        clearStateProgramPages(index: uint64): bytes;
        /**
         * Arguments passed to the application in the ApplicationCall transaction
         * @param index Index of the arg to get
         */
        appArgs(index: uint64): bytes;
        /**
         * Accounts listed in the ApplicationCall transaction
         * @param index Index of the account to get
         */
        accounts(index: uint64): Account;
        /**
         * Foreign Assets listed in the ApplicationCall transaction
         * @param index Index of the asset to get
         */
        assets(index: uint64): Asset;
        /**
         * Foreign Apps listed in the ApplicationCall transaction
         * @param index Index of the application to get
         */
        apps(index: uint64): Application;
        /**
         * The id of the created application
         */
        readonly createdApp: Application;
        /**
         * Number of logs
         */
        readonly numLogs: uint64;
        /**
         * Application version for which the txn must reject
         */
        readonly rejectVersion: uint64;
    }
    /**
     * A group transaction of any type
     */
    type Transaction = PaymentTxn | KeyRegistrationTxn | AssetConfigTxn | AssetTransferTxn | AssetFreezeTxn | ApplicationCallTxn;
    /**
     * Get the nth transaction in the group without verifying its type
     * @param n The index of the txn in the group
     */
    function Transaction(n: uint64): Transaction;
    /**
     * Get the nth transaction in the group
     * Verifies the txn type is 'pay'
     * @param n The index of the txn in the group
     */
    function PaymentTxn(n: uint64): PaymentTxn;
    /**
     * Get the nth transaction in the group
     * Verifies the txn type is 'keyreg'
     * @param n The index of the txn in the group
     */
    function KeyRegistrationTxn(n: uint64): KeyRegistrationTxn;
    /**
     * Get the nth transaction in the group
     * Verifies the txn type is 'acfg'
     * @param n The index of the txn in the group
     */
    function AssetConfigTxn(n: uint64): AssetConfigTxn;
    /**
     * Get the nth transaction in the group
     * Verifies the txn type is 'axfer'
     * @param n The index of the txn in the group
     */
    function AssetTransferTxn(n: uint64): AssetTransferTxn;
    /**
     * Get the nth transaction in the group
     * Verifies the txn type is 'afrz'
     * @param n The index of the txn in the group
     */
    function AssetFreezeTxn(n: uint64): AssetFreezeTxn;
    /**
     * Get the nth transaction in the group
     * Verifies the txn type is 'appl'
     * @param n The index of the txn in the group
     */
    function ApplicationCallTxn(n: uint64): ApplicationCallTxn;
}
export {};
export * from './primitives';
export { log, err, assert, match, assertMatch, ensureBudget, urange, OpUpFeeSource, clone, validateEncoding } from './util';
export * from './reference';
export * as op from './op';
export { Txn, Global } from './op';
export * as arc4 from './arc4';
export { Contract, abimethod, baremethod, readonly } from './arc4';
export { BaseContract, contract } from './base-contract';
export { BoxMap, Box } from './box';
export * from './state';
export { itxn } from './itxn';
export * from './itxn-compose';
export { gtxn } from './gtxn';
export { TransactionType } from './transactions';
export { LogicSig, logicsig } from './logic-sig';
export { TemplateVar } from './template-var';
export { Base64, Ec, Ecdsa, MimcConfigurations, VrfVerify } from './op';
export { compile, CompiledContract, CompiledLogicSig, CompileContractOptions, CompileLogicSigOptions } from './compiled';
export { ReferenceArray } from './reference-array';
export { emit } from './arc-28';
export { OnCompleteAction, OnCompleteActionStr } from './on-complete-action';
export * from './arrays';
import { Contract, TypedApplicationCallFields } from './arc4';
import { DeliberateAny, InstanceMethod } from './internal/typescript-helpers';
import { itxn } from './itxn';
import { TransactionType } from './transactions';
export interface PaymentComposeFields extends itxn.PaymentFields {
    type: TransactionType.Payment;
}
export interface KeyRegistrationComposeFields extends itxn.KeyRegistrationFields {
    type: TransactionType.KeyRegistration;
}
export interface AssetConfigComposeFields extends itxn.AssetConfigFields {
    type: TransactionType.AssetConfig;
}
export interface AssetTransferComposeFields extends itxn.AssetTransferFields {
    type: TransactionType.AssetTransfer;
}
export interface AssetFreezeComposeFields extends itxn.AssetFreezeFields {
    type: TransactionType.AssetFreeze;
}
export interface ApplicationCallComposeFields extends itxn.ApplicationCallFields {
    type: TransactionType.ApplicationCall;
}
export interface AnyTransactionComposeFields extends itxn.PaymentFields, itxn.KeyRegistrationFields, itxn.AssetConfigFields, itxn.AssetTransferFields, itxn.AssetFreezeFields, itxn.ApplicationCallFields {
    type: TransactionType;
}
export type ComposeItxnParams = itxn.PaymentItxnParams | itxn.KeyRegistrationItxnParams | itxn.AssetConfigItxnParams | itxn.AssetTransferItxnParams | itxn.AssetFreezeItxnParams | itxn.ApplicationCallItxnParams;
export type ItxnCompose = {
    begin(fields: PaymentComposeFields): void;
    begin(fields: KeyRegistrationComposeFields): void;
    begin(fields: AssetConfigComposeFields): void;
    begin(fields: AssetTransferComposeFields): void;
    begin(fields: AssetFreezeComposeFields): void;
    begin(fields: ApplicationCallComposeFields): void;
    begin(fields: AnyTransactionComposeFields): void;
    begin(fields: ComposeItxnParams): void;
    begin<TArgs extends DeliberateAny[]>(method: InstanceMethod<Contract, TArgs>, fields: TypedApplicationCallFields<TArgs>): void;
    next(fields: PaymentComposeFields): void;
    next(fields: KeyRegistrationComposeFields): void;
    next(fields: AssetConfigComposeFields): void;
    next(fields: AssetTransferComposeFields): void;
    next(fields: AssetFreezeComposeFields): void;
    next(fields: ApplicationCallComposeFields): void;
    next(fields: AnyTransactionComposeFields): void;
    next(fields: ComposeItxnParams): void;
    next<TArgs extends DeliberateAny[]>(method: InstanceMethod<Contract, TArgs>, fields: TypedApplicationCallFields<TArgs>): void;
    submit(): void;
};
export declare const itxnCompose: ItxnCompose;
import { OnCompleteAction } from './on-complete-action';
import { bytes, uint64 } from './primitives';
import { Account, Application, Asset } from './reference';
import { TransactionType } from './transactions';
declare const isItxn: unique symbol;
export declare namespace itxn {
    /**
     * An inner transaction of type 'pay'
     */
    interface PaymentInnerTxn {
        /** @hidden */
        [isItxn]?: true;
        /**
         * 32 byte address
         */
        readonly sender: Account;
        /**
         * microalgos
         */
        readonly fee: uint64;
        /**
         * round number
         */
        readonly firstValid: uint64;
        /**
         * UNIX timestamp of block before txn.FirstValid. Fails if negative
         */
        readonly firstValidTime: uint64;
        /**
         * round number
         */
        readonly lastValid: uint64;
        /**
         * Any data up to 1024 bytes
         */
        readonly note: bytes;
        /**
         * 32 byte lease value
         */
        readonly lease: bytes<32>;
        /**
         * Transaction type as bytes
         */
        readonly typeBytes: bytes;
        /**
         * Transaction type
         */
        readonly type: TransactionType.Payment;
        /**
         * Position of this transaction within an atomic group
         * A stand-alone transaction is implicitly element 0 in a group of 1
         */
        readonly groupIndex: uint64;
        /**
         * The computed ID for this transaction. 32 bytes.
         */
        readonly txnId: bytes<32>;
        /**
         * 32 byte Sender's new AuthAddr
         */
        readonly rekeyTo: Account;
        /**
         * 32 byte address
         */
        readonly receiver: Account;
        /**
         * microalgos
         */
        readonly amount: uint64;
        /**
         * 32 byte address
         */
        readonly closeRemainderTo: Account;
    }
    /**
     * An inner transaction of type 'keyreg'
     */
    interface KeyRegistrationInnerTxn {
        /** @hidden */
        [isItxn]?: true;
        /**
         * 32 byte address
         */
        readonly sender: Account;
        /**
         * microalgos
         */
        readonly fee: uint64;
        /**
         * round number
         */
        readonly firstValid: uint64;
        /**
         * UNIX timestamp of block before txn.FirstValid. Fails if negative
         */
        readonly firstValidTime: uint64;
        /**
         * round number
         */
        readonly lastValid: uint64;
        /**
         * Any data up to 1024 bytes
         */
        readonly note: bytes;
        /**
         * 32 byte lease value
         */
        readonly lease: bytes<32>;
        /**
         * Transaction type as bytes
         */
        readonly typeBytes: bytes;
        /**
         * Transaction type
         */
        readonly type: TransactionType.KeyRegistration;
        /**
         * Position of this transaction within an atomic group
         * A stand-alone transaction is implicitly element 0 in a group of 1
         */
        readonly groupIndex: uint64;
        /**
         * The computed ID for this transaction. 32 bytes.
         */
        readonly txnId: bytes<32>;
        /**
         * 32 byte Sender's new AuthAddr
         */
        readonly rekeyTo: Account;
        /**
         * 32 byte address
         */
        readonly voteKey: bytes<32>;
        /**
         * 32 byte address
         */
        readonly selectionKey: bytes<32>;
        /**
         * The first round that the participation key is valid.
         */
        readonly voteFirst: uint64;
        /**
         * The last round that the participation key is valid.
         */
        readonly voteLast: uint64;
        /**
         * Dilution for the 2-level participation key
         */
        readonly voteKeyDilution: uint64;
        /**
         * Marks an account nonparticipating for rewards
         */
        readonly nonparticipation: boolean;
        /**
         * 64 byte state proof public key
         */
        readonly stateProofKey: bytes<64>;
    }
    /**
     * An inner transaction of type 'acfg'
     */
    interface AssetConfigInnerTxn {
        /** @hidden */
        [isItxn]?: true;
        /**
         * 32 byte address
         */
        readonly sender: Account;
        /**
         * microalgos
         */
        readonly fee: uint64;
        /**
         * round number
         */
        readonly firstValid: uint64;
        /**
         * UNIX timestamp of block before txn.FirstValid. Fails if negative
         */
        readonly firstValidTime: uint64;
        /**
         * round number
         */
        readonly lastValid: uint64;
        /**
         * Any data up to 1024 bytes
         */
        readonly note: bytes;
        /**
         * 32 byte lease value
         */
        readonly lease: bytes<32>;
        /**
         * Transaction type as bytes
         */
        readonly typeBytes: bytes;
        /**
         * Transaction type
         */
        readonly type: TransactionType.AssetConfig;
        /**
         * Position of this transaction within an atomic group
         * A stand-alone transaction is implicitly element 0 in a group of 1
         */
        readonly groupIndex: uint64;
        /**
         * The computed ID for this transaction. 32 bytes.
         */
        readonly txnId: bytes<32>;
        /**
         * 32 byte Sender's new AuthAddr
         */
        readonly rekeyTo: Account;
        /**
         * Asset ID in asset config transaction
         */
        readonly configAsset: Asset;
        /**
         * The asset created by this transaction
         */
        readonly createdAsset: Asset;
        /**
         * Total number of units of this asset created
         */
        readonly total: uint64;
        /**
         * Number of digits to display after the decimal place when displaying the asset
         */
        readonly decimals: uint64;
        /**
         * Whether the asset's slots are frozen by default or not, 0 or 1
         */
        readonly defaultFrozen: boolean;
        /**
         * Unit name of the asset
         */
        readonly unitName: bytes;
        /**
         * The asset name
         */
        readonly assetName: bytes;
        /**
         * URL
         */
        readonly url: bytes;
        /**
         * 32 byte commitment to unspecified asset metadata
         */
        readonly metadataHash: bytes<32>;
        /**
         * 32 byte address
         */
        readonly manager: Account;
        /**
         * 32 byte address
         */
        readonly reserve: Account;
        /**
         * 32 byte address
         */
        readonly freeze: Account;
        /**
         * 32 byte address
         */
        readonly clawback: Account;
    }
    /**
     * An inner transaction of type 'axfer'
     */
    interface AssetTransferInnerTxn {
        /** @hidden */
        [isItxn]?: true;
        /**
         * 32 byte address
         */
        readonly sender: Account;
        /**
         * microalgos
         */
        readonly fee: uint64;
        /**
         * round number
         */
        readonly firstValid: uint64;
        /**
         * UNIX timestamp of block before txn.FirstValid. Fails if negative
         */
        readonly firstValidTime: uint64;
        /**
         * round number
         */
        readonly lastValid: uint64;
        /**
         * Any data up to 1024 bytes
         */
        readonly note: bytes;
        /**
         * 32 byte lease value
         */
        readonly lease: bytes<32>;
        /**
         * Transaction type as bytes
         */
        readonly typeBytes: bytes;
        /**
         * Transaction type
         */
        readonly type: TransactionType.AssetTransfer;
        /**
         * Position of this transaction within an atomic group
         * A stand-alone transaction is implicitly element 0 in a group of 1
         */
        readonly groupIndex: uint64;
        /**
         * The computed ID for this transaction. 32 bytes.
         */
        readonly txnId: bytes<32>;
        /**
         * 32 byte Sender's new AuthAddr
         */
        readonly rekeyTo: Account;
        /**
         * Asset ID
         */
        readonly xferAsset: Asset;
        /**
         * value in Asset's units
         */
        readonly assetAmount: uint64;
        /**
         * 32 byte address. Source of assets if Sender is the Asset's Clawback address.
         */
        readonly assetSender: Account;
        /**
         * 32 byte address
         */
        readonly assetReceiver: Account;
        /**
         * 32 byte address
         */
        readonly assetCloseTo: Account;
    }
    /**
     * An inner transaction of type 'afrz'
     */
    interface AssetFreezeInnerTxn {
        /** @hidden */
        [isItxn]?: true;
        /**
         * 32 byte address
         */
        readonly sender: Account;
        /**
         * microalgos
         */
        readonly fee: uint64;
        /**
         * round number
         */
        readonly firstValid: uint64;
        /**
         * UNIX timestamp of block before txn.FirstValid. Fails if negative
         */
        readonly firstValidTime: uint64;
        /**
         * round number
         */
        readonly lastValid: uint64;
        /**
         * Any data up to 1024 bytes
         */
        readonly note: bytes;
        /**
         * 32 byte lease value
         */
        readonly lease: bytes<32>;
        /**
         * Transaction type as bytes
         */
        readonly typeBytes: bytes;
        /**
         * Transaction type
         */
        readonly type: TransactionType.AssetFreeze;
        /**
         * Position of this transaction within an atomic group
         * A stand-alone transaction is implicitly element 0 in a group of 1
         */
        readonly groupIndex: uint64;
        /**
         * The computed ID for this transaction. 32 bytes.
         */
        readonly txnId: bytes<32>;
        /**
         * 32 byte Sender's new AuthAddr
         */
        readonly rekeyTo: Account;
        /**
         * Asset ID being frozen or un-frozen
         */
        readonly freezeAsset: Asset;
        /**
         * 32 byte address of the account whose asset slot is being frozen or un-frozen
         */
        readonly freezeAccount: Account;
        /**
         * The new frozen value
         */
        readonly frozen: boolean;
    }
    /**
     * An inner transaction of type 'appl'
     */
    interface ApplicationCallInnerTxn {
        /** @hidden */
        [isItxn]?: true;
        /**
         * 32 byte address
         */
        readonly sender: Account;
        /**
         * microalgos
         */
        readonly fee: uint64;
        /**
         * round number
         */
        readonly firstValid: uint64;
        /**
         * UNIX timestamp of block before txn.FirstValid. Fails if negative
         */
        readonly firstValidTime: uint64;
        /**
         * round number
         */
        readonly lastValid: uint64;
        /**
         * Any data up to 1024 bytes
         */
        readonly note: bytes;
        /**
         * 32 byte lease value
         */
        readonly lease: bytes<32>;
        /**
         * Transaction type as bytes
         */
        readonly typeBytes: bytes;
        /**
         * Transaction type
         */
        readonly type: TransactionType.ApplicationCall;
        /**
         * Position of this transaction within an atomic group
         * A stand-alone transaction is implicitly element 0 in a group of 1
         */
        readonly groupIndex: uint64;
        /**
         * The computed ID for this transaction. 32 bytes.
         */
        readonly txnId: bytes<32>;
        /**
         * 32 byte Sender's new AuthAddr
         */
        readonly rekeyTo: Account;
        /**
         * ApplicationID from ApplicationCall transaction
         */
        readonly appId: Application;
        /**
         * ApplicationCall transaction on completion action
         */
        readonly onCompletion: OnCompleteAction;
        /**
         * Number of ApplicationArgs
         */
        readonly numAppArgs: uint64;
        /**
         * Number of ApplicationArgs
         */
        readonly numAccounts: uint64;
        /**
         * The first page of the Approval program
         */
        readonly approvalProgram: bytes;
        /**
         * The first page of the Clear State program
         */
        readonly clearStateProgram: bytes;
        /**
         * Number of Assets
         */
        readonly numAssets: uint64;
        /**
         * Number of Applications
         */
        readonly numApps: uint64;
        /**
         * Number of global state integers this application makes use of.
         */
        readonly globalNumUint: uint64;
        /**
         * Number of global state byteslices this application makes use of.
         */
        readonly globalNumBytes: uint64;
        /**
         * Number of local state integers this application makes use of.
         */
        readonly localNumUint: uint64;
        /**
         * Number of local state byteslices this application makes use of.
         */
        readonly localNumBytes: uint64;
        /**
         * Number of additional pages for each of the application's approval and clear state program
         */
        readonly extraProgramPages: uint64;
        /**
         * The last message emitted. Empty bytes if none were emitted. App mode only
         */
        readonly lastLog: bytes;
        /**
         * Read application logs
         * @param index Index of the log to get
         */
        logs(index: uint64): bytes;
        /**
         * Number of Approval Program pages
         */
        readonly numApprovalProgramPages: uint64;
        /**
         * All approval program pages
         * @param index Index of the page to get
         */
        approvalProgramPages(index: uint64): bytes;
        /**
         * Number of Clear State Program pages
         */
        readonly numClearStateProgramPages: uint64;
        /**
         * All clear state program pages
         * @param index Index of the page to get
         */
        clearStateProgramPages(index: uint64): bytes;
        /**
         * Arguments passed to the application in the ApplicationCall transaction
         * @param index Index of the arg to get
         */
        appArgs(index: uint64): bytes;
        /**
         * Accounts listed in the ApplicationCall transaction
         * @param index Index of the account to get
         */
        accounts(index: uint64): Account;
        /**
         * Foreign Assets listed in the ApplicationCall transaction
         * @param index Index of the asset to get
         */
        assets(index: uint64): Asset;
        /**
         * Foreign Apps listed in the ApplicationCall transaction
         * @param index Index of the application to get
         */
        apps(index: uint64): Application;
        /**
         * The id of the created application
         */
        readonly createdApp: Application;
        /**
         * Number of logs
         */
        readonly numLogs: uint64;
        /**
         * Application version for which the txn must reject
         */
        readonly rejectVersion: uint64;
    }
    interface PaymentFields {
        /**
         * 32 byte address
         */
        sender?: Account | bytes;
        /**
         * microalgos
         */
        fee?: uint64;
        /**
         * round number
         */
        firstValid?: uint64;
        /**
         * UNIX timestamp of block before txn.FirstValid. Fails if negative
         */
        firstValidTime?: uint64;
        /**
         * round number
         */
        lastValid?: uint64;
        /**
         * Any data up to 1024 bytes
         */
        note?: bytes | string;
        /**
         * 32 byte lease value
         */
        lease?: bytes<32>;
        /**
         * 32 byte Sender's new AuthAddr
         */
        rekeyTo?: Account | bytes;
        /**
         * 32 byte address
         */
        receiver?: Account | bytes;
        /**
         * microalgos
         */
        amount?: uint64;
        /**
         * 32 byte address
         */
        closeRemainderTo?: Account | bytes;
    }
    interface KeyRegistrationFields {
        /**
         * 32 byte address
         */
        sender?: Account | bytes;
        /**
         * microalgos
         */
        fee?: uint64;
        /**
         * round number
         */
        firstValid?: uint64;
        /**
         * UNIX timestamp of block before txn.FirstValid. Fails if negative
         */
        firstValidTime?: uint64;
        /**
         * round number
         */
        lastValid?: uint64;
        /**
         * Any data up to 1024 bytes
         */
        note?: bytes | string;
        /**
         * 32 byte lease value
         */
        lease?: bytes<32>;
        /**
         * 32 byte Sender's new AuthAddr
         */
        rekeyTo?: Account | bytes;
        /**
         * 32 byte address
         */
        voteKey?: bytes<32>;
        /**
         * 32 byte address
         */
        selectionKey?: bytes<32>;
        /**
         * The first round that the participation key is valid.
         */
        voteFirst?: uint64;
        /**
         * The last round that the participation key is valid.
         */
        voteLast?: uint64;
        /**
         * Dilution for the 2-level participation key
         */
        voteKeyDilution?: uint64;
        /**
         * Marks an account nonparticipating for rewards
         */
        nonparticipation?: boolean;
        /**
         * 64 byte state proof public key
         */
        stateProofKey?: bytes<64>;
    }
    interface AssetConfigFields {
        /**
         * 32 byte address
         */
        sender?: Account | bytes;
        /**
         * microalgos
         */
        fee?: uint64;
        /**
         * round number
         */
        firstValid?: uint64;
        /**
         * UNIX timestamp of block before txn.FirstValid. Fails if negative
         */
        firstValidTime?: uint64;
        /**
         * round number
         */
        lastValid?: uint64;
        /**
         * Any data up to 1024 bytes
         */
        note?: bytes | string;
        /**
         * 32 byte lease value
         */
        lease?: bytes<32>;
        /**
         * 32 byte Sender's new AuthAddr
         */
        rekeyTo?: Account | bytes;
        /**
         * Asset ID in asset config transaction
         */
        configAsset?: Asset | uint64;
        /**
         * Total number of units of this asset created
         */
        total?: uint64;
        /**
         * Number of digits to display after the decimal place when displaying the asset
         */
        decimals?: uint64;
        /**
         * Whether the asset's slots are frozen by default or not, 0 or 1
         */
        defaultFrozen?: boolean;
        /**
         * Unit name of the asset
         */
        unitName?: bytes | string;
        /**
         * The asset name
         */
        assetName?: bytes | string;
        /**
         * URL
         */
        url?: bytes | string;
        /**
         * 32 byte commitment to unspecified asset metadata
         */
        metadataHash?: bytes<32>;
        /**
         * 32 byte address
         */
        manager?: Account | bytes;
        /**
         * 32 byte address
         */
        reserve?: Account | bytes;
        /**
         * 32 byte address
         */
        freeze?: Account | bytes;
        /**
         * 32 byte address
         */
        clawback?: Account | bytes;
    }
    interface AssetTransferFields {
        /**
         * 32 byte address
         */
        sender?: Account | bytes;
        /**
         * microalgos
         */
        fee?: uint64;
        /**
         * round number
         */
        firstValid?: uint64;
        /**
         * UNIX timestamp of block before txn.FirstValid. Fails if negative
         */
        firstValidTime?: uint64;
        /**
         * round number
         */
        lastValid?: uint64;
        /**
         * Any data up to 1024 bytes
         */
        note?: bytes | string;
        /**
         * 32 byte lease value
         */
        lease?: bytes<32>;
        /**
         * 32 byte Sender's new AuthAddr
         */
        rekeyTo?: Account | bytes;
        /**
         * Asset ID
         */
        xferAsset?: Asset | uint64;
        /**
         * value in Asset's units
         */
        assetAmount?: uint64;
        /**
         * 32 byte address. Source of assets if Sender is the Asset's Clawback address.
         */
        assetSender?: Account | bytes;
        /**
         * 32 byte address
         */
        assetReceiver?: Account | bytes;
        /**
         * 32 byte address
         */
        assetCloseTo?: Account | bytes;
    }
    interface AssetFreezeFields {
        /**
         * 32 byte address
         */
        sender?: Account | bytes;
        /**
         * microalgos
         */
        fee?: uint64;
        /**
         * round number
         */
        firstValid?: uint64;
        /**
         * UNIX timestamp of block before txn.FirstValid. Fails if negative
         */
        firstValidTime?: uint64;
        /**
         * round number
         */
        lastValid?: uint64;
        /**
         * Any data up to 1024 bytes
         */
        note?: bytes | string;
        /**
         * 32 byte lease value
         */
        lease?: bytes<32>;
        /**
         * 32 byte Sender's new AuthAddr
         */
        rekeyTo?: Account | bytes;
        /**
         * Asset ID being frozen or un-frozen
         */
        freezeAsset?: Asset | uint64;
        /**
         * 32 byte address of the account whose asset slot is being frozen or un-frozen
         */
        freezeAccount?: Account | bytes;
        /**
         * The new frozen value
         */
        frozen?: boolean;
    }
    interface ApplicationCallFields {
        /**
         * 32 byte address
         */
        sender?: Account | bytes;
        /**
         * microalgos
         */
        fee?: uint64;
        /**
         * round number
         */
        firstValid?: uint64;
        /**
         * UNIX timestamp of block before txn.FirstValid. Fails if negative
         */
        firstValidTime?: uint64;
        /**
         * round number
         */
        lastValid?: uint64;
        /**
         * Any data up to 1024 bytes
         */
        note?: bytes | string;
        /**
         * 32 byte lease value
         */
        lease?: bytes<32>;
        /**
         * 32 byte Sender's new AuthAddr
         */
        rekeyTo?: Account | bytes;
        /**
         * ApplicationID from ApplicationCall transaction
         */
        appId?: Application | uint64;
        /**
         * ApplicationCall transaction on completion action
         */
        onCompletion?: OnCompleteAction;
        /**
         * Number of global state integers this application makes use of.
         */
        globalNumUint?: uint64;
        /**
         * Number of global state byteslices this application makes use of.
         */
        globalNumBytes?: uint64;
        /**
         * Number of local state integers this application makes use of.
         */
        localNumUint?: uint64;
        /**
         * Number of local state byteslices this application makes use of.
         */
        localNumBytes?: uint64;
        /**
         * Number of additional pages for each of the application's approval and clear state program
         */
        extraProgramPages?: uint64;
        /**
         * All approval program pages
         * @param index Index of the page to get
         */
        approvalProgram?: bytes | readonly [...bytes[]];
        /**
         * All clear state program pages
         * @param index Index of the page to get
         */
        clearStateProgram?: bytes | readonly [...bytes[]];
        /**
         * Arguments passed to the application in the ApplicationCall transaction
         * @param index Index of the arg to get
         */
        appArgs?: readonly [...unknown[]];
        /**
         * Accounts listed in the ApplicationCall transaction
         * @param index Index of the account to get
         */
        accounts?: readonly [...(Account | bytes)[]];
        /**
         * Foreign Assets listed in the ApplicationCall transaction
         * @param index Index of the asset to get
         */
        assets?: readonly [...(Asset | uint64)[]];
        /**
         * Foreign Apps listed in the ApplicationCall transaction
         * @param index Index of the application to get
         */
        apps?: readonly [...(Application | uint64)[]];
        /**
         * Application version for which the txn must reject
         */
        rejectVersion?: uint64;
    }
    /**
     * A union of all ItxnParams types
     */
    type ItxnParams = PaymentItxnParams | KeyRegistrationItxnParams | AssetConfigItxnParams | AssetTransferItxnParams | AssetFreezeItxnParams | ApplicationCallItxnParams;
    /**
     * Conditional type which returns the matching InnerTransaction types for a given tuple of ItxnParams types
     */
    type TxnFor<TFields extends [...ItxnParams[]]> = TFields extends [
        {
            submit(): infer TTxn;
        },
        ...infer TRest extends [...ItxnParams[]]
    ] ? readonly [TTxn, ...TxnFor<TRest>] : [];
    /**
     * Submit a group of ItxnParams objects and return the InnerTransaction results
     */
    function submitGroup<TFields extends [...ItxnParams[]]>(...transactionFields: TFields): TxnFor<TFields>;
    /**
     * Holds Payment fields which can be updated, cloned, or submitted.
     */
    abstract class PaymentItxnParams {
        /**
         * Submit an itxn with these fields and return the PaymentInnerTxn result
         */
        submit(): PaymentInnerTxn;
        /**
         * Update one or more fields in this PaymentItxnParams object
         */
        set(fields: PaymentFields): void;
        /**
         * Return a copy of this PaymentItxnParams object
         */
        copy(): PaymentItxnParams;
    }
    /**
     * Create a new PaymentItxnParams object with the specified fields
     */
    function payment(fields: PaymentFields): PaymentItxnParams;
    /**
     * Holds KeyRegistration fields which can be updated, cloned, or submitted.
     */
    abstract class KeyRegistrationItxnParams {
        /**
         * Submit an itxn with these fields and return the KeyRegistrationInnerTxn result
         */
        submit(): KeyRegistrationInnerTxn;
        /**
         * Update one or more fields in this KeyRegistrationItxnParams object
         */
        set(fields: KeyRegistrationFields): void;
        /**
         * Return a copy of this KeyRegistrationItxnParams object
         */
        copy(): KeyRegistrationItxnParams;
    }
    /**
     * Create a new KeyRegistrationItxnParams object with the specified fields
     */
    function keyRegistration(fields: KeyRegistrationFields): KeyRegistrationItxnParams;
    /**
     * Holds AssetConfig fields which can be updated, cloned, or submitted.
     */
    abstract class AssetConfigItxnParams {
        /**
         * Submit an itxn with these fields and return the AssetConfigInnerTxn result
         */
        submit(): AssetConfigInnerTxn;
        /**
         * Update one or more fields in this AssetConfigItxnParams object
         */
        set(fields: AssetConfigFields): void;
        /**
         * Return a copy of this AssetConfigItxnParams object
         */
        copy(): AssetConfigItxnParams;
    }
    /**
     * Create a new AssetConfigItxnParams object with the specified fields
     */
    function assetConfig(fields: AssetConfigFields): AssetConfigItxnParams;
    /**
     * Holds AssetTransfer fields which can be updated, cloned, or submitted.
     */
    abstract class AssetTransferItxnParams {
        /**
         * Submit an itxn with these fields and return the AssetTransferInnerTxn result
         */
        submit(): AssetTransferInnerTxn;
        /**
         * Update one or more fields in this AssetTransferItxnParams object
         */
        set(fields: AssetTransferFields): void;
        /**
         * Return a copy of this AssetTransferItxnParams object
         */
        copy(): AssetTransferItxnParams;
    }
    /**
     * Create a new AssetTransferItxnParams object with the specified fields
     */
    function assetTransfer(fields: AssetTransferFields): AssetTransferItxnParams;
    /**
     * Holds AssetFreeze fields which can be updated, cloned, or submitted.
     */
    abstract class AssetFreezeItxnParams {
        /**
         * Submit an itxn with these fields and return the AssetFreezeInnerTxn result
         */
        submit(): AssetFreezeInnerTxn;
        /**
         * Update one or more fields in this AssetFreezeItxnParams object
         */
        set(fields: AssetFreezeFields): void;
        /**
         * Return a copy of this AssetFreezeItxnParams object
         */
        copy(): AssetFreezeItxnParams;
    }
    /**
     * Create a new AssetFreezeItxnParams object with the specified fields
     */
    function assetFreeze(fields: AssetFreezeFields): AssetFreezeItxnParams;
    /**
     * Holds ApplicationCall fields which can be updated, cloned, or submitted.
     */
    abstract class ApplicationCallItxnParams {
        /**
         * Submit an itxn with these fields and return the ApplicationCallInnerTxn result
         */
        submit(): ApplicationCallInnerTxn;
        /**
         * Update one or more fields in this ApplicationCallItxnParams object
         */
        set(fields: ApplicationCallFields): void;
        /**
         * Return a copy of this ApplicationCallItxnParams object
         */
        copy(): ApplicationCallItxnParams;
    }
    /**
     * Create a new ApplicationCallItxnParams object with the specified fields
     */
    function applicationCall(fields: ApplicationCallFields): ApplicationCallItxnParams;
}
export {};
import { ConstructorFor } from './internal/typescript-helpers';
import { uint64 } from './primitives';
/**
 * Base class for Algorand TypeScript Logic Signatures (also known as Smart Signatures)
 */
export declare abstract class LogicSig {
    /**
     * The logic signature program logic
     */
    abstract program(): boolean | uint64;
}
/**
 * Alias for a numeric range specification.
 */
type NumberRange = {
    /**
     * The start point of the range (inclusive)
     */
    from: number;
    /**
     * The end point of the range (inclusive)
     */
    to: number;
};
/**
 * Defines optional configuration for a logic signature
 */
type LogicSigOptions = {
    /**
     * Determines which AVM version to use, this affects what operations are supported.
     * Defaults to value provided on command line (which defaults to current mainnet version)
     */
    avmVersion?: 10 | 11 | 12 | 13;
    /**
     * Override the name of the logic signature when generating build artifacts.
     * Defaults to the class name
     */
    name?: string;
    /**
     * Allows you to mark a slot ID or range of slot IDs as "off limits" to Puya.
     * These slot ID(s) will never be written to or otherwise manipulating by the compiler itself.
     * This is particularly useful in combination with `op.gload_bytes` / `op.gload_uint64`
     * which lets a contract in a group transaction read from the scratch slots of another contract
     * that occurs earlier in the transaction group.
     */
    scratchSlots?: Array<number | NumberRange>;
};
/**
 * The logicsig decorator can be used to specify additional configuration options for a logic signature
 * @param options An object containing the configuration options
 */
export declare function logicsig(options: LogicSigOptions): <T extends ConstructorFor<LogicSig>>(logicSig: T) => T;
export {};
/**
 * The possible on complete actions a method can handle, represented as a string
 */
export type OnCompleteActionStr = 'NoOp' | 'OptIn' | 'ClearState' | 'CloseOut' | 'UpdateApplication' | 'DeleteApplication';
/**
 * The possible on complete actions a method can handle, represented as an integer
 */
export declare enum OnCompleteAction {
    /**
     * Do nothing after the transaction has completed
     */
    NoOp = 0,
    /**
     * Opt the calling user into the contract
     */
    OptIn = 1,
    /**
     * Close the calling user out of the contract
     */
    CloseOut = 2,
    /**
     * Run the clear state program and forcibly close the user out of the contract
     */
    ClearState = 3,
    /**
     * Replace the application's approval and clear state programs with the bytes from this transaction
     */
    UpdateApplication = 4,
    /**
     * Delete the application
     */
    DeleteApplication = 5
}
import { bytes, uint64, biguint } from './primitives';
import { Account, Application, Asset } from './reference';
import { OnCompleteAction } from './on-complete-action';
import { TransactionType } from './transactions';
export declare enum Base64 {
    URLEncoding = "URLEncoding",
    StdEncoding = "StdEncoding"
}
export declare enum Ec {
    /**
     * G1 of the BN254 curve. Points encoded as 32 byte X following by 32 byte Y
     */
    BN254g1 = "BN254g1",
    /**
     * G2 of the BN254 curve. Points encoded as 64 byte X following by 64 byte Y
     */
    BN254g2 = "BN254g2",
    /**
     * G1 of the BLS 12-381 curve. Points encoded as 48 byte X following by 48 byte Y
     */
    BLS12_381g1 = "BLS12_381g1",
    /**
     * G2 of the BLS 12-381 curve. Points encoded as 96 byte X following by 96 byte Y
     */
    BLS12_381g2 = "BLS12_381g2"
}
export declare enum Ecdsa {
    /**
     * secp256k1 curve, used in Bitcoin
     */
    Secp256k1 = "Secp256k1",
    /**
     * secp256r1 curve, NIST standard
     */
    Secp256r1 = "Secp256r1"
}
export declare enum MimcConfigurations {
    /**
     * MiMC configuration for the BN254 curve with Miyaguchi-Preneel mode, 110 rounds, exponent 5, seed "seed"
     */
    BN254Mp110 = "BN254Mp110",
    /**
     * MiMC configuration for the BLS12-381 curve with Miyaguchi-Preneel mode, 111 rounds, exponent 5, seed "seed"
     */
    BLS12_381Mp111 = "BLS12_381Mp111"
}
export declare enum VrfVerify {
    VrfAlgorand = "VrfAlgorand"
}
export declare const AcctParams: {
    /**
     * Account balance in microalgos
     * Min AVM version: 6
     */
    acctBalance(a: Account | uint64): readonly [uint64, boolean];
    /**
     * Minimum required balance for account, in microalgos
     * Min AVM version: 6
     */
    acctMinBalance(a: Account | uint64): readonly [uint64, boolean];
    /**
     * Address the account is rekeyed to.
     * Min AVM version: 6
     */
    acctAuthAddr(a: Account | uint64): readonly [Account, boolean];
    /**
     * The total number of uint64 values allocated by this account in Global and Local States.
     * Min AVM version: 8
     */
    acctTotalNumUint(a: Account | uint64): readonly [uint64, boolean];
    /**
     * The total number of byte array values allocated by this account in Global and Local States.
     * Min AVM version: 8
     */
    acctTotalNumByteSlice(a: Account | uint64): readonly [uint64, boolean];
    /**
     * The number of extra app code pages used by this account.
     * Min AVM version: 8
     */
    acctTotalExtraAppPages(a: Account | uint64): readonly [uint64, boolean];
    /**
     * The number of existing apps created by this account.
     * Min AVM version: 8
     */
    acctTotalAppsCreated(a: Account | uint64): readonly [uint64, boolean];
    /**
     * The number of apps this account is opted into.
     * Min AVM version: 8
     */
    acctTotalAppsOptedIn(a: Account | uint64): readonly [uint64, boolean];
    /**
     * The number of existing ASAs created by this account.
     * Min AVM version: 8
     */
    acctTotalAssetsCreated(a: Account | uint64): readonly [uint64, boolean];
    /**
     * The numbers of ASAs held by this account (including ASAs this account created).
     * Min AVM version: 8
     */
    acctTotalAssets(a: Account | uint64): readonly [uint64, boolean];
    /**
     * The number of existing boxes created by this account's app.
     * Min AVM version: 8
     */
    acctTotalBoxes(a: Account | uint64): readonly [uint64, boolean];
    /**
     * The total number of bytes used by this account's app's box keys and values.
     * Min AVM version: 8
     */
    acctTotalBoxBytes(a: Account | uint64): readonly [uint64, boolean];
    /**
     * Has this account opted into block payouts
     * Min AVM version: 11
     */
    acctIncentiveEligible(a: Account | uint64): readonly [boolean, boolean];
    /**
     * The round number of the last block this account proposed.
     * Min AVM version: 11
     */
    acctLastProposed(a: Account | uint64): readonly [uint64, boolean];
    /**
     * The round number of the last block this account sent a heartbeat.
     * Min AVM version: 11
     */
    acctLastHeartbeat(a: Account | uint64): readonly [uint64, boolean];
};
/**
 * A plus B as a 128-bit result. X is the carry-bit, Y is the low-order 64 bits.
 * @see Native TEAL opcode: [`addw`](https://dev.algorand.co/reference/algorand-teal/opcodes#addw)
 * Min AVM version: 2
 */
export declare function addw(a: uint64, b: uint64): readonly [uint64, uint64];
/**
 * Get or modify Global app state
 */
export declare const AppGlobal: {
    /**
     * delete key A from the global state of the current application
     * @param a state key.
     * Deleting a key which is already absent has no effect on the application global state. (In particular, it does _not_ cause the program to fail.)
     * @see Native TEAL opcode: [`app_global_del`](https://dev.algorand.co/reference/algorand-teal/opcodes#app_global_del)
     * Min AVM version: 2
     */
    delete(a: bytes): void;
    /**
     * global state of the key A in the current application
     * @param a state key.
     * @return value. The value is zero (of type uint64) if the key does not exist.
     * @see Native TEAL opcode: [`app_global_get`](https://dev.algorand.co/reference/algorand-teal/opcodes#app_global_get)
     * Min AVM version: 2
     */
    getBytes(a: bytes): bytes;
    /**
     * global state of the key A in the current application
     * @param a state key.
     * @return value. The value is zero (of type uint64) if the key does not exist.
     * @see Native TEAL opcode: [`app_global_get`](https://dev.algorand.co/reference/algorand-teal/opcodes#app_global_get)
     * Min AVM version: 2
     */
    getUint64(a: bytes): uint64;
    /**
     * X is the global state of application A, key B. Y is 1 if key existed, else 0
     * @param a Txn.ForeignApps offset (or, since v4, an _available_ application id), state key.
     * @return did_exist flag (top of the stack, 1 if the application and key existed and 0 otherwise), value. The value is zero (of type uint64) if the key does not exist.
     * @see Native TEAL opcode: [`app_global_get_ex`](https://dev.algorand.co/reference/algorand-teal/opcodes#app_global_get_ex)
     * Min AVM version: 2
     */
    getExBytes(a: Application | uint64, b: bytes): readonly [bytes, boolean];
    /**
     * X is the global state of application A, key B. Y is 1 if key existed, else 0
     * @param a Txn.ForeignApps offset (or, since v4, an _available_ application id), state key.
     * @return did_exist flag (top of the stack, 1 if the application and key existed and 0 otherwise), value. The value is zero (of type uint64) if the key does not exist.
     * @see Native TEAL opcode: [`app_global_get_ex`](https://dev.algorand.co/reference/algorand-teal/opcodes#app_global_get_ex)
     * Min AVM version: 2
     */
    getExUint64(a: Application | uint64, b: bytes): readonly [uint64, boolean];
    /**
     * write B to key A in the global state of the current application
     * @see Native TEAL opcode: [`app_global_put`](https://dev.algorand.co/reference/algorand-teal/opcodes#app_global_put)
     * Min AVM version: 2
     */
    put(a: bytes, b: bytes | uint64): void;
};
/**
 * Get or modify Local app state
 */
export declare const AppLocal: {
    /**
     * delete key B from account A's local state of the current application
     * @param a Txn.Accounts offset (or, since v4, an _available_ account address), state key.
     * Deleting a key which is already absent has no effect on the application local state. (In particular, it does _not_ cause the program to fail.)
     * @see Native TEAL opcode: [`app_local_del`](https://dev.algorand.co/reference/algorand-teal/opcodes#app_local_del)
     * Min AVM version: 2
     */
    delete(a: Account | uint64, b: bytes): void;
    /**
     * local state of the key B in the current application in account A
     * @param a Txn.Accounts offset (or, since v4, an _available_ account address), state key.
     * @return value. The value is zero (of type uint64) if the key does not exist.
     * @see Native TEAL opcode: [`app_local_get`](https://dev.algorand.co/reference/algorand-teal/opcodes#app_local_get)
     * Min AVM version: 2
     */
    getBytes(a: Account | uint64, b: bytes): bytes;
    /**
     * local state of the key B in the current application in account A
     * @param a Txn.Accounts offset (or, since v4, an _available_ account address), state key.
     * @return value. The value is zero (of type uint64) if the key does not exist.
     * @see Native TEAL opcode: [`app_local_get`](https://dev.algorand.co/reference/algorand-teal/opcodes#app_local_get)
     * Min AVM version: 2
     */
    getUint64(a: Account | uint64, b: bytes): uint64;
    /**
     * X is the local state of application B, key C in account A. Y is 1 if key existed, else 0
     * @param a Txn.Accounts offset (or, since v4, an _available_ account address), _available_ application id (or, since v4, a Txn.ForeignApps offset), state key.
     * @return did_exist flag (top of the stack, 1 if the application and key existed and 0 otherwise), value. The value is zero (of type uint64) if the key does not exist.
     * @see Native TEAL opcode: [`app_local_get_ex`](https://dev.algorand.co/reference/algorand-teal/opcodes#app_local_get_ex)
     * Min AVM version: 2
     */
    getExBytes(a: Account | uint64, b: Application | uint64, c: bytes): readonly [bytes, boolean];
    /**
     * X is the local state of application B, key C in account A. Y is 1 if key existed, else 0
     * @param a Txn.Accounts offset (or, since v4, an _available_ account address), _available_ application id (or, since v4, a Txn.ForeignApps offset), state key.
     * @return did_exist flag (top of the stack, 1 if the application and key existed and 0 otherwise), value. The value is zero (of type uint64) if the key does not exist.
     * @see Native TEAL opcode: [`app_local_get_ex`](https://dev.algorand.co/reference/algorand-teal/opcodes#app_local_get_ex)
     * Min AVM version: 2
     */
    getExUint64(a: Account | uint64, b: Application | uint64, c: bytes): readonly [uint64, boolean];
    /**
     * write C to key B in account A's local state of the current application
     * @param a Txn.Accounts offset (or, since v4, an _available_ account address), state key, value.
     * @see Native TEAL opcode: [`app_local_put`](https://dev.algorand.co/reference/algorand-teal/opcodes#app_local_put)
     * Min AVM version: 2
     */
    put(a: Account | uint64, b: bytes, c: bytes | uint64): void;
};
/**
 * 1 if account A is opted in to application B, else 0
 * @param a Txn.Accounts offset (or, since v4, an _available_ account address), _available_ application id (or, since v4, a Txn.ForeignApps offset).
 * @return 1 if opted in and 0 otherwise.
 * @see Native TEAL opcode: [`app_opted_in`](https://dev.algorand.co/reference/algorand-teal/opcodes#app_opted_in)
 * Min AVM version: 2
 */
export declare function appOptedIn(a: Account | uint64, b: Application | uint64): boolean;
export declare const AppParams: {
    /**
     * Bytecode of Approval Program
     * Min AVM version: 5
     */
    appApprovalProgram(a: Application | uint64): readonly [bytes, boolean];
    /**
     * Bytecode of Clear State Program
     * Min AVM version: 5
     */
    appClearStateProgram(a: Application | uint64): readonly [bytes, boolean];
    /**
     * Number of uint64 values allowed in Global State
     * Min AVM version: 5
     */
    appGlobalNumUint(a: Application | uint64): readonly [uint64, boolean];
    /**
     * Number of byte array values allowed in Global State
     * Min AVM version: 5
     */
    appGlobalNumByteSlice(a: Application | uint64): readonly [uint64, boolean];
    /**
     * Number of uint64 values allowed in Local State
     * Min AVM version: 5
     */
    appLocalNumUint(a: Application | uint64): readonly [uint64, boolean];
    /**
     * Number of byte array values allowed in Local State
     * Min AVM version: 5
     */
    appLocalNumByteSlice(a: Application | uint64): readonly [uint64, boolean];
    /**
     * Number of Extra Program Pages of code space
     * Min AVM version: 5
     */
    appExtraProgramPages(a: Application | uint64): readonly [uint64, boolean];
    /**
     * Creator address
     * Min AVM version: 5
     */
    appCreator(a: Application | uint64): readonly [Account, boolean];
    /**
     * Address for which this application has authority
     * Min AVM version: 5
     */
    appAddress(a: Application | uint64): readonly [Account, boolean];
    /**
     * Version of the app, incremented each time the approval or clear program changes
     * Min AVM version: 12
     */
    appVersion(a: Application | uint64): readonly [uint64, boolean];
};
/**
 * Ath LogicSig argument
 * @see Native TEAL opcode: [`args`](https://dev.algorand.co/reference/algorand-teal/opcodes#args)
 * Min AVM version: 5
 */
export declare function arg(a: uint64): bytes;
export declare const AssetHolding: {
    /**
     * Amount of the asset unit held by this account
     * Min AVM version: 2
     */
    assetBalance(a: Account | uint64, b: Asset | uint64): readonly [uint64, boolean];
    /**
     * Is the asset frozen or not
     * Min AVM version: 2
     */
    assetFrozen(a: Account | uint64, b: Asset | uint64): readonly [boolean, boolean];
};
export declare const AssetParams: {
    /**
     * Total number of units of this asset
     * Min AVM version: 2
     */
    assetTotal(a: Asset | uint64): readonly [uint64, boolean];
    /**
     * See AssetParams.Decimals
     * Min AVM version: 2
     */
    assetDecimals(a: Asset | uint64): readonly [uint64, boolean];
    /**
     * Frozen by default or not
     * Min AVM version: 2
     */
    assetDefaultFrozen(a: Asset | uint64): readonly [boolean, boolean];
    /**
     * Asset unit name
     * Min AVM version: 2
     */
    assetUnitName(a: Asset | uint64): readonly [bytes, boolean];
    /**
     * Asset name
     * Min AVM version: 2
     */
    assetName(a: Asset | uint64): readonly [bytes, boolean];
    /**
     * URL with additional info about the asset
     * Min AVM version: 2
     */
    assetUrl(a: Asset | uint64): readonly [bytes, boolean];
    /**
     * Arbitrary commitment
     * Min AVM version: 2
     */
    assetMetadataHash(a: Asset | uint64): readonly [bytes<32>, boolean];
    /**
     * Manager address
     * Min AVM version: 2
     */
    assetManager(a: Asset | uint64): readonly [Account, boolean];
    /**
     * Reserve address
     * Min AVM version: 2
     */
    assetReserve(a: Asset | uint64): readonly [Account, boolean];
    /**
     * Freeze address
     * Min AVM version: 2
     */
    assetFreeze(a: Asset | uint64): readonly [Account, boolean];
    /**
     * Clawback address
     * Min AVM version: 2
     */
    assetClawback(a: Asset | uint64): readonly [Account, boolean];
    /**
     * Creator address
     * Min AVM version: 5
     */
    assetCreator(a: Asset | uint64): readonly [Account, boolean];
};
/**
 * balance for account A, in microalgos. The balance is observed after the effects of previous transactions in the group, and after the fee for the current transaction is deducted. Changes caused by inner transactions are observable immediately following `itxn_submit`
 * @param a Txn.Accounts offset (or, since v4, an _available_ account address), _available_ application id (or, since v4, a Txn.ForeignApps offset).
 * @return value.
 * @see Native TEAL opcode: [`balance`](https://dev.algorand.co/reference/algorand-teal/opcodes#balance)
 * Min AVM version: 2
 */
export declare function balance(a: Account | uint64): uint64;
/**
 * decode A which was base64-encoded using _encoding_ E. Fail if A is not base64 encoded with encoding E
 * *Warning*: Usage should be restricted to very rare use cases. In almost all cases, smart contracts should directly handle non-encoded byte-strings.	This opcode should only be used in cases where base64 is the only available option, e.g. interoperability with a third-party that only signs base64 strings.
 *  Decodes A using the base64 encoding E. Specify the encoding with an immediate arg either as URL and Filename Safe (`URLEncoding`) or Standard (`StdEncoding`). See [RFC 4648 sections 4 and 5](https://rfc-editor.org/rfc/rfc4648.html#section-4). It is assumed that the encoding ends with the exact number of `=` padding characters as required by the RFC. When padding occurs, any unused pad bits in the encoding must be set to zero or the decoding will fail. The special cases of `\n` and `\r` are allowed but completely ignored. An error will result when attempting to decode a string with a character that is not in the encoding alphabet or not one of `=`, `\r`, or `\n`.
 * @see Native TEAL opcode: [`base64_decode`](https://dev.algorand.co/reference/algorand-teal/opcodes#base64_decode)
 * Min AVM version: 7
 */
export declare function base64Decode(e: Base64, a: bytes): bytes;
/**
 * The highest set bit in A. If A is a byte-array, it is interpreted as a big-endian unsigned integer. bitlen of 0 is 0, bitlen of 8 is 4
 * bitlen interprets arrays as big-endian integers, unlike setbit/getbit
 * @see Native TEAL opcode: [`bitlen`](https://dev.algorand.co/reference/algorand-teal/opcodes#bitlen)
 * Min AVM version: 4
 */
export declare function bitLength(a: bytes | uint64): uint64;
export declare const Block: {
    blkSeed(a: uint64): bytes<32>;
    blkTimestamp(a: uint64): uint64;
    blkProposer(a: uint64): Account;
    blkFeesCollected(a: uint64): uint64;
    blkBonus(a: uint64): uint64;
    blkBranch(a: uint64): bytes<32>;
    blkFeeSink(a: uint64): Account;
    blkProtocol(a: uint64): bytes;
    blkTxnCounter(a: uint64): uint64;
    blkProposerPayout(a: uint64): uint64;
};
/**
 * Get or modify box state
 */
export declare const Box: {
    /**
     * create a box named A, of length B. Fail if the name A is empty or B exceeds 32,768. Returns 0 if A already existed, else 1
     * Newly created boxes are filled with 0 bytes. `box_create` will fail if the referenced box already exists with a different size. Otherwise, existing boxes are unchanged by `box_create`.
     * @see Native TEAL opcode: [`box_create`](https://dev.algorand.co/reference/algorand-teal/opcodes#box_create)
     * Min AVM version: 8
     */
    create(a: bytes, b: uint64): boolean;
    /**
     * delete box named A if it exists. Return 1 if A existed, 0 otherwise
     * @see Native TEAL opcode: [`box_del`](https://dev.algorand.co/reference/algorand-teal/opcodes#box_del)
     * Min AVM version: 8
     */
    delete(a: bytes): boolean;
    /**
     * read C bytes from box A, starting at offset B. Fail if A does not exist, or the byte range is outside A's size.
     * @see Native TEAL opcode: [`box_extract`](https://dev.algorand.co/reference/algorand-teal/opcodes#box_extract)
     * Min AVM version: 8
     */
    extract(a: bytes, b: uint64, c: uint64): bytes;
    /**
     * X is the contents of box A if A exists, else ''. Y is 1 if A exists, else 0.
     * For boxes that exceed 4,096 bytes, consider `box_create`, `box_extract`, and `box_replace`
     * @see Native TEAL opcode: [`box_get`](https://dev.algorand.co/reference/algorand-teal/opcodes#box_get)
     * Min AVM version: 8
     */
    get(a: bytes): readonly [bytes, boolean];
    /**
     * X is the length of box A if A exists, else 0. Y is 1 if A exists, else 0.
     * @see Native TEAL opcode: [`box_len`](https://dev.algorand.co/reference/algorand-teal/opcodes#box_len)
     * Min AVM version: 8
     */
    length(a: bytes): readonly [uint64, boolean];
    /**
     * replaces the contents of box A with byte-array B. Fails if A exists and len(B) != len(box A). Creates A if it does not exist
     * For boxes that exceed 4,096 bytes, consider `box_create`, `box_extract`, and `box_replace`
     * @see Native TEAL opcode: [`box_put`](https://dev.algorand.co/reference/algorand-teal/opcodes#box_put)
     * Min AVM version: 8
     */
    put(a: bytes, b: bytes): void;
    /**
     * write byte-array C into box A, starting at offset B. Fail if A does not exist, or the byte range is outside A's size.
     * @see Native TEAL opcode: [`box_replace`](https://dev.algorand.co/reference/algorand-teal/opcodes#box_replace)
     * Min AVM version: 8
     */
    replace(a: bytes, b: uint64, c: bytes): void;
    /**
     * change the size of box named A to be of length B, adding zero bytes to end or removing bytes from the end, as needed. Fail if the name A is empty, A is not an existing box, or B exceeds 32,768.
     * @see Native TEAL opcode: [`box_resize`](https://dev.algorand.co/reference/algorand-teal/opcodes#box_resize)
     * Min AVM version: 10
     */
    resize(a: bytes, b: uint64): void;
    /**
     * set box A to contain its previous bytes up to index B, followed by D, followed by the original bytes of A that began at index B+C.
     * Boxes are of constant length. If C < len(D), then len(D)-C bytes will be removed from the end. If C > len(D), zero bytes will be appended to the end to reach the box length.
     * @see Native TEAL opcode: [`box_splice`](https://dev.algorand.co/reference/algorand-teal/opcodes#box_splice)
     * Min AVM version: 10
     */
    splice(a: bytes, b: uint64, c: uint64, d: bytes): void;
};
/**
 * The largest integer I such that I^2 <= A. A and I are interpreted as big-endian unsigned integers
 * @see Native TEAL opcode: [`bsqrt`](https://dev.algorand.co/reference/algorand-teal/opcodes#bsqrt)
 * Min AVM version: 6
 */
export declare function bsqrt(a: biguint): biguint;
/**
 * converts big-endian byte array A to uint64. Fails if len(A) > 8. Padded by leading 0s if len(A) < 8.
 * `btoi` fails if the input is longer than 8 bytes.
 * @see Native TEAL opcode: [`btoi`](https://dev.algorand.co/reference/algorand-teal/opcodes#btoi)
 * Min AVM version: 1
 */
export declare function btoi(a: bytes): uint64;
/**
 * zero filled byte-array of length A
 * @see Native TEAL opcode: [`bzero`](https://dev.algorand.co/reference/algorand-teal/opcodes#bzero)
 * Min AVM version: 4
 */
export declare function bzero<TLength extends uint64 = uint64>(a: TLength): bytes<TLength>;
/**
 * join A and B
 * `concat` fails if the result would be greater than 4096 bytes.
 * @see Native TEAL opcode: [`concat`](https://dev.algorand.co/reference/algorand-teal/opcodes#concat)
 * Min AVM version: 2
 */
export declare function concat(a: bytes, b: bytes): bytes;
/**
 * W,X = (A,B / C,D); Y,Z = (A,B modulo C,D)
 * The notation J,K indicates that two uint64 values J and K are interpreted as a uint128 value, with J as the high uint64 and K the low.
 * @see Native TEAL opcode: [`divmodw`](https://dev.algorand.co/reference/algorand-teal/opcodes#divmodw)
 * Min AVM version: 4
 */
export declare function divmodw(a: uint64, b: uint64, c: uint64, d: uint64): readonly [uint64, uint64, uint64, uint64];
/**
 * A,B / C. Fail if C == 0 or if result overflows.
 * The notation A,B indicates that A and B are interpreted as a uint128 value, with A as the high uint64 and B the low.
 * @see Native TEAL opcode: [`divw`](https://dev.algorand.co/reference/algorand-teal/opcodes#divw)
 * Min AVM version: 6
 */
export declare function divw(a: uint64, b: uint64, c: uint64): uint64;
/**
 * Elliptic Curve functions
 */
export declare const EllipticCurve: {
    /**
     * for curve points A and B, return the curve point A + B
     * A and B are curve points in affine representation: field element X concatenated with field element Y. Field element `Z` is encoded as follows.
     * For the base field elements (Fp), `Z` is encoded as a big-endian number and must be lower than the field modulus.
     * For the quadratic field extension (Fp2), `Z` is encoded as the concatenation of the individual encoding of the coefficients. For an Fp2 element of the form `Z = Z0 + Z1 i`, where `i` is a formal quadratic non-residue, the encoding of Z is the concatenation of the encoding of `Z0` and `Z1` in this order. (`Z0` and `Z1` must be less than the field modulus).
     * The point at infinity is encoded as `(X,Y) = (0,0)`.
     * Groups G1 and G2 are denoted additively.
     * Fails if A or B is not in G.
     * A and/or B are allowed to be the point at infinity.
     * Does _not_ check if A and B are in the main prime-order subgroup.
     * @see Native TEAL opcode: [`ec_add`](https://dev.algorand.co/reference/algorand-teal/opcodes#ec_add)
     * Min AVM version: 10
     */
    add(g: Ec, a: bytes, b: bytes): bytes;
    /**
     * maps field element A to group G
     * BN254 points are mapped by the SVDW map. BLS12-381 points are mapped by the SSWU map.
     * G1 element inputs are base field elements and G2 element inputs are quadratic field elements, with nearly the same encoding rules (for field elements) as defined in `ec_add`. There is one difference of encoding rule: G1 element inputs do not need to be 0-padded if they fit in less than 32 bytes for BN254 and less than 48 bytes for BLS12-381. (As usual, the empty byte array represents 0.) G2 elements inputs need to be always have the required size.
     * @see Native TEAL opcode: [`ec_map_to`](https://dev.algorand.co/reference/algorand-teal/opcodes#ec_map_to)
     * Min AVM version: 10
     */
    mapTo(g: Ec, a: bytes): bytes;
    /**
     * for curve points A and scalars B, return curve point B0A0 + B1A1 + B2A2 + ... + BnAn
     * A is a list of concatenated points, encoded and checked as described in `ec_add`. B is a list of concatenated scalars which, unlike ec_scalar_mul, must all be exactly 32 bytes long.
     * The name `ec_multi_scalar_mul` was chosen to reflect common usage, but a more consistent name would be `ec_multi_scalar_mul`. AVM values are limited to 4096 bytes, so `ec_multi_scalar_mul` is limited by the size of the points in the group being operated upon.
     * @see Native TEAL opcode: [`ec_multi_scalar_mul`](https://dev.algorand.co/reference/algorand-teal/opcodes#ec_multi_scalar_mul)
     * Min AVM version: 10
     */
    scalarMulMulti(g: Ec, a: bytes, b: bytes): bytes;
    /**
     * 1 if the product of the pairing of each point in A with its respective point in B is equal to the identity element of the target group Gt, else 0
     * A and B are concatenated points, encoded and checked as described in `ec_add`. A contains points of the group G, B contains points of the associated group (G2 if G is G1, and vice versa). Fails if A and B have a different number of points, or if any point is not in its described group or outside the main prime-order subgroup - a stronger condition than other opcodes. AVM values are limited to 4096 bytes, so `ec_pairing_check` is limited by the size of the points in the groups being operated upon.
     * @see Native TEAL opcode: [`ec_pairing_check`](https://dev.algorand.co/reference/algorand-teal/opcodes#ec_pairing_check)
     * Min AVM version: 10
     */
    pairingCheck(g: Ec, a: bytes, b: bytes): boolean;
    /**
     * for curve point A and scalar B, return the curve point BA, the point A multiplied by the scalar B.
     * A is a curve point encoded and checked as described in `ec_add`. Scalar B is interpreted as a big-endian unsigned integer. Fails if B exceeds 32 bytes.
     * @see Native TEAL opcode: [`ec_scalar_mul`](https://dev.algorand.co/reference/algorand-teal/opcodes#ec_scalar_mul)
     * Min AVM version: 10
     */
    scalarMul(g: Ec, a: bytes, b: bytes): bytes;
    /**
     * 1 if A is in the main prime-order subgroup of G (including the point at infinity) else 0. Program fails if A is not in G at all.
     * @see Native TEAL opcode: [`ec_subgroup_check`](https://dev.algorand.co/reference/algorand-teal/opcodes#ec_subgroup_check)
     * Min AVM version: 10
     */
    subgroupCheck(g: Ec, a: bytes): boolean;
};
/**
 * decompress pubkey A into components X, Y
 * The 33 byte public key in a compressed form to be decompressed into X and Y (top) components. All values are big-endian encoded.
 * @see Native TEAL opcode: [`ecdsa_pk_decompress`](https://dev.algorand.co/reference/algorand-teal/opcodes#ecdsa_pk_decompress)
 * Min AVM version: 5
 */
export declare function ecdsaPkDecompress(v: Ecdsa, a: bytes<33> | bytes): readonly [bytes<32>, bytes<32>];
/**
 * for (data A, recovery id B, signature C, D) recover a public key
 * S (top) and R elements of a signature, recovery id and data (bottom) are expected on the stack and used to deriver a public key. All values are big-endian encoded. The signed data must be 32 bytes long.
 * @see Native TEAL opcode: [`ecdsa_pk_recover`](https://dev.algorand.co/reference/algorand-teal/opcodes#ecdsa_pk_recover)
 * Min AVM version: 5
 */
export declare function ecdsaPkRecover(v: Ecdsa, a: bytes<32> | bytes, b: uint64, c: bytes<32> | bytes, d: bytes<32> | bytes): readonly [bytes<32>, bytes<32>];
/**
 * for (data A, signature B, C and pubkey D, E) verify the signature of the data against the pubkey => {0 or 1}
 * The 32 byte Y-component of a public key is the last element on the stack, preceded by X-component of a pubkey, preceded by S and R components of a signature, preceded by the data that is fifth element on the stack. All values are big-endian encoded. The signed data must be 32 bytes long, and signatures in lower-S form are only accepted.
 * @see Native TEAL opcode: [`ecdsa_verify`](https://dev.algorand.co/reference/algorand-teal/opcodes#ecdsa_verify)
 * Min AVM version: 5
 */
export declare function ecdsaVerify(v: Ecdsa, a: bytes<32> | bytes, b: bytes<32> | bytes, c: bytes<32> | bytes, d: bytes<32> | bytes, e: bytes<32> | bytes): boolean;
/**
 * for (data A, signature B, pubkey C) verify the signature of ("ProgData" || program_hash || data) against the pubkey => {0 or 1}
 * The 32 byte public key is the last element on the stack, preceded by the 64 byte signature at the second-to-last element on the stack, preceded by the data which was signed at the third-to-last element on the stack.
 * @see Native TEAL opcode: [`ed25519verify`](https://dev.algorand.co/reference/algorand-teal/opcodes#ed25519verify)
 * Min AVM version: 1
 */
export declare function ed25519verify(a: bytes, b: bytes<64> | bytes, c: bytes<32> | bytes): boolean;
/**
 * for (data A, signature B, pubkey C) verify the signature of the data against the pubkey => {0 or 1}
 * @see Native TEAL opcode: [`ed25519verify_bare`](https://dev.algorand.co/reference/algorand-teal/opcodes#ed25519verify_bare)
 * Min AVM version: 7
 */
export declare function ed25519verifyBare(a: bytes, b: bytes<64> | bytes, c: bytes<32> | bytes): boolean;
/**
 * A raised to the Bth power. Fail if A == B == 0 and on overflow
 * @see Native TEAL opcode: [`exp`](https://dev.algorand.co/reference/algorand-teal/opcodes#exp)
 * Min AVM version: 4
 */
export declare function exp(a: uint64, b: uint64): uint64;
/**
 * A raised to the Bth power as a 128-bit result in two uint64s. X is the high 64 bits, Y is the low. Fail if A == B == 0 or if the results exceeds 2^128-1
 * @see Native TEAL opcode: [`expw`](https://dev.algorand.co/reference/algorand-teal/opcodes#expw)
 * Min AVM version: 4
 */
export declare function expw(a: uint64, b: uint64): readonly [uint64, uint64];
/**
 * A uint16 formed from a range of big-endian bytes from A starting at B up to but not including B+2. If B+2 is larger than the array length, the program fails
 * @see Native TEAL opcode: [`extract_uint16`](https://dev.algorand.co/reference/algorand-teal/opcodes#extract_uint16)
 * Min AVM version: 5
 */
export declare function extractUint16(a: bytes, b: uint64): uint64;
/**
 * A uint32 formed from a range of big-endian bytes from A starting at B up to but not including B+4. If B+4 is larger than the array length, the program fails
 * @see Native TEAL opcode: [`extract_uint32`](https://dev.algorand.co/reference/algorand-teal/opcodes#extract_uint32)
 * Min AVM version: 5
 */
export declare function extractUint32(a: bytes, b: uint64): uint64;
/**
 * A uint64 formed from a range of big-endian bytes from A starting at B up to but not including B+8. If B+8 is larger than the array length, the program fails
 * @see Native TEAL opcode: [`extract_uint64`](https://dev.algorand.co/reference/algorand-teal/opcodes#extract_uint64)
 * Min AVM version: 5
 */
export declare function extractUint64(a: bytes, b: uint64): uint64;
/**
 * for (data A, compressed-format signature B, pubkey C) verify the signature of data against the pubkey => {0 or 1}
 * @see Native TEAL opcode: [`falcon_verify`](https://dev.algorand.co/reference/algorand-teal/opcodes#falcon_verify)
 * Min AVM version: 12
 */
export declare function falconVerify(a: bytes, b: bytes<1232> | bytes, c: bytes<1793> | bytes): boolean;
/**
 * ID of the asset or application created in the Ath transaction of the current group
 * `gaids` fails unless the requested transaction created an asset or application and A < GroupIndex.
 * @see Native TEAL opcode: [`gaids`](https://dev.algorand.co/reference/algorand-teal/opcodes#gaids)
 * Min AVM version: 4
 */
export declare function gaid(a: uint64): uint64;
/**
 * Bth bit of (byte-array or integer) A. If B is greater than or equal to the bit length of the value (8*byte length), the program fails
 * see explanation of bit ordering in setbit
 * @see Native TEAL opcode: [`getbit`](https://dev.algorand.co/reference/algorand-teal/opcodes#getbit)
 * Min AVM version: 3
 */
export declare function getBit(a: bytes | uint64, b: uint64): boolean;
/**
 * Bth byte of A, as an integer. If B is greater than or equal to the array length, the program fails
 * @see Native TEAL opcode: [`getbyte`](https://dev.algorand.co/reference/algorand-teal/opcodes#getbyte)
 * Min AVM version: 3
 */
export declare function getByte(a: bytes, b: uint64): uint64;
/**
 * Get values for inner transaction in the last group submitted
 */
export declare const GITxn: {
    /**
     * 32 byte address
     * Min AVM version: 6
     */
    sender(t: uint64): Account;
    /**
     * microalgos
     * Min AVM version: 6
     */
    fee(t: uint64): uint64;
    /**
     * round number
     * Min AVM version: 6
     */
    firstValid(t: uint64): uint64;
    /**
     * UNIX timestamp of block before txn.FirstValid. Fails if negative
     * Min AVM version: 7
     */
    firstValidTime(t: uint64): uint64;
    /**
     * round number
     * Min AVM version: 6
     */
    lastValid(t: uint64): uint64;
    /**
     * Any data up to 1024 bytes
     * Min AVM version: 6
     */
    note(t: uint64): bytes;
    /**
     * 32 byte lease value
     * Min AVM version: 6
     */
    lease(t: uint64): bytes<32>;
    /**
     * 32 byte address
     * Min AVM version: 6
     */
    receiver(t: uint64): Account;
    /**
     * microalgos
     * Min AVM version: 6
     */
    amount(t: uint64): uint64;
    /**
     * 32 byte address
     * Min AVM version: 6
     */
    closeRemainderTo(t: uint64): Account;
    /**
     * 32 byte address
     * Min AVM version: 6
     */
    votePk(t: uint64): bytes<32>;
    /**
     * 32 byte address
     * Min AVM version: 6
     */
    selectionPk(t: uint64): bytes<32>;
    /**
     * The first round that the participation key is valid.
     * Min AVM version: 6
     */
    voteFirst(t: uint64): uint64;
    /**
     * The last round that the participation key is valid.
     * Min AVM version: 6
     */
    voteLast(t: uint64): uint64;
    /**
     * Dilution for the 2-level participation key
     * Min AVM version: 6
     */
    voteKeyDilution(t: uint64): uint64;
    /**
     * Transaction type as bytes
     * Min AVM version: 6
     */
    type(t: uint64): bytes;
    /**
     * Transaction type as integer
     * Min AVM version: 6
     */
    typeEnum(t: uint64): TransactionType;
    /**
     * Asset ID
     * Min AVM version: 6
     */
    xferAsset(t: uint64): Asset;
    /**
     * value in Asset's units
     * Min AVM version: 6
     */
    assetAmount(t: uint64): uint64;
    /**
     * 32 byte address. Source of assets if Sender is the Asset's Clawback address.
     * Min AVM version: 6
     */
    assetSender(t: uint64): Account;
    /**
     * 32 byte address
     * Min AVM version: 6
     */
    assetReceiver(t: uint64): Account;
    /**
     * 32 byte address
     * Min AVM version: 6
     */
    assetCloseTo(t: uint64): Account;
    /**
     * Position of this transaction within an atomic transaction group. A stand-alone transaction is implicitly element 0 in a group of 1
     * Min AVM version: 6
     */
    groupIndex(t: uint64): uint64;
    /**
     * The computed ID for this transaction. 32 bytes.
     * Min AVM version: 6
     */
    txId(t: uint64): bytes<32>;
    /**
     * ApplicationID from ApplicationCall transaction
     * Min AVM version: 2
     */
    applicationId(t: uint64): Application;
    /**
     * ApplicationCall transaction on completion action
     * Min AVM version: 2
     */
    onCompletion(t: uint64): OnCompleteAction;
    /**
     * Arguments passed to the application in the ApplicationCall transaction
     * Min AVM version: 2
     */
    applicationArgs(t: uint64, a: uint64): bytes;
    /**
     * Number of ApplicationArgs
     * Min AVM version: 2
     */
    numAppArgs(t: uint64): uint64;
    /**
     * Accounts listed in the ApplicationCall transaction
     * Min AVM version: 2
     */
    accounts(t: uint64, a: uint64): Account;
    /**
     * Number of Accounts
     * Min AVM version: 2
     */
    numAccounts(t: uint64): uint64;
    /**
     * Approval program
     * Min AVM version: 2
     */
    approvalProgram(t: uint64): bytes;
    /**
     * Clear state program
     * Min AVM version: 2
     */
    clearStateProgram(t: uint64): bytes;
    /**
     * 32 byte Sender's new AuthAddr
     * Min AVM version: 2
     */
    rekeyTo(t: uint64): Account;
    /**
     * Asset ID in asset config transaction
     * Min AVM version: 2
     */
    configAsset(t: uint64): Asset;
    /**
     * Total number of units of this asset created
     * Min AVM version: 2
     */
    configAssetTotal(t: uint64): uint64;
    /**
     * Number of digits to display after the decimal place when displaying the asset
     * Min AVM version: 2
     */
    configAssetDecimals(t: uint64): uint64;
    /**
     * Whether the asset's slots are frozen by default or not, 0 or 1
     * Min AVM version: 2
     */
    configAssetDefaultFrozen(t: uint64): boolean;
    /**
     * Unit name of the asset
     * Min AVM version: 2
     */
    configAssetUnitName(t: uint64): bytes;
    /**
     * The asset name
     * Min AVM version: 2
     */
    configAssetName(t: uint64): bytes;
    /**
     * URL
     * Min AVM version: 2
     */
    configAssetUrl(t: uint64): bytes;
    /**
     * 32 byte commitment to unspecified asset metadata
     * Min AVM version: 2
     */
    configAssetMetadataHash(t: uint64): bytes<32>;
    /**
     * 32 byte address
     * Min AVM version: 2
     */
    configAssetManager(t: uint64): Account;
    /**
     * 32 byte address
     * Min AVM version: 2
     */
    configAssetReserve(t: uint64): Account;
    /**
     * 32 byte address
     * Min AVM version: 2
     */
    configAssetFreeze(t: uint64): Account;
    /**
     * 32 byte address
     * Min AVM version: 2
     */
    configAssetClawback(t: uint64): Account;
    /**
     * Asset ID being frozen or un-frozen
     * Min AVM version: 2
     */
    freezeAsset(t: uint64): Asset;
    /**
     * 32 byte address of the account whose asset slot is being frozen or un-frozen
     * Min AVM version: 2
     */
    freezeAssetAccount(t: uint64): Account;
    /**
     * The new frozen value, 0 or 1
     * Min AVM version: 2
     */
    freezeAssetFrozen(t: uint64): boolean;
    /**
     * Foreign Assets listed in the ApplicationCall transaction
     * Min AVM version: 3
     */
    assets(t: uint64, a: uint64): Asset;
    /**
     * Number of Assets
     * Min AVM version: 3
     */
    numAssets(t: uint64): uint64;
    /**
     * Foreign Apps listed in the ApplicationCall transaction
     * Min AVM version: 3
     */
    applications(t: uint64, a: uint64): Application;
    /**
     * Number of Applications
     * Min AVM version: 3
     */
    numApplications(t: uint64): uint64;
    /**
     * Number of global state integers in ApplicationCall
     * Min AVM version: 3
     */
    globalNumUint(t: uint64): uint64;
    /**
     * Number of global state byteslices in ApplicationCall
     * Min AVM version: 3
     */
    globalNumByteSlice(t: uint64): uint64;
    /**
     * Number of local state integers in ApplicationCall
     * Min AVM version: 3
     */
    localNumUint(t: uint64): uint64;
    /**
     * Number of local state byteslices in ApplicationCall
     * Min AVM version: 3
     */
    localNumByteSlice(t: uint64): uint64;
    /**
     * Number of additional pages for each of the application's approval and clear state programs. An ExtraProgramPages of 1 means 2048 more total bytes, or 1024 for each program.
     * Min AVM version: 4
     */
    extraProgramPages(t: uint64): uint64;
    /**
     * Marks an account nonparticipating for rewards
     * Min AVM version: 5
     */
    nonparticipation(t: uint64): boolean;
    /**
     * Log messages emitted by an application call (only with `itxn` in v5). Application mode only
     * Min AVM version: 5
     */
    logs(t: uint64, a: uint64): bytes;
    /**
     * Number of Logs (only with `itxn` in v5). Application mode only
     * Min AVM version: 5
     */
    numLogs(t: uint64): uint64;
    /**
     * Asset ID allocated by the creation of an ASA (only with `itxn` in v5). Application mode only
     * Min AVM version: 5
     */
    createdAssetId(t: uint64): Asset;
    /**
     * ApplicationID allocated by the creation of an application (only with `itxn` in v5). Application mode only
     * Min AVM version: 5
     */
    createdApplicationId(t: uint64): Application;
    /**
     * The last message emitted. Empty bytes if none were emitted. Application mode only
     * Min AVM version: 6
     */
    lastLog(t: uint64): bytes;
    /**
     * State proof public key
     * Min AVM version: 6
     */
    stateProofPk(t: uint64): bytes<64>;
    /**
     * Approval Program as an array of pages
     * Min AVM version: 7
     */
    approvalProgramPages(t: uint64, a: uint64): bytes;
    /**
     * Number of Approval Program pages
     * Min AVM version: 7
     */
    numApprovalProgramPages(t: uint64): uint64;
    /**
     * ClearState Program as an array of pages
     * Min AVM version: 7
     */
    clearStateProgramPages(t: uint64, a: uint64): bytes;
    /**
     * Number of ClearState Program pages
     * Min AVM version: 7
     */
    numClearStateProgramPages(t: uint64): uint64;
    /**
     * Application version for which the txn must reject
     * Min AVM version: 12
     */
    rejectVersion(t: uint64): uint64;
};
/**
 * Bth scratch space value of the Ath transaction in the current group
 * @see Native TEAL opcode: [`gloadss`](https://dev.algorand.co/reference/algorand-teal/opcodes#gloadss)
 * Min AVM version: 6
 */
export declare function gloadBytes(a: uint64, b: uint64): bytes;
/**
 * Bth scratch space value of the Ath transaction in the current group
 * @see Native TEAL opcode: [`gloadss`](https://dev.algorand.co/reference/algorand-teal/opcodes#gloadss)
 * Min AVM version: 6
 */
export declare function gloadUint64(a: uint64, b: uint64): uint64;
export declare const Global: {
    /**
     * microalgos
     * Min AVM version: 1
     */
    readonly minTxnFee: uint64;
    /**
     * microalgos
     * Min AVM version: 1
     */
    readonly minBalance: uint64;
    /**
     * rounds
     * Min AVM version: 1
     */
    readonly maxTxnLife: uint64;
    /**
     * 32 byte address of all zero bytes
     * Min AVM version: 1
     */
    readonly zeroAddress: Account;
    /**
     * Number of transactions in this atomic transaction group. At least 1
     * Min AVM version: 1
     */
    readonly groupSize: uint64;
    /**
     * Maximum supported version
     * Min AVM version: 2
     */
    readonly logicSigVersion: uint64;
    /**
     * Current round number. Application mode only.
     * Min AVM version: 2
     */
    readonly round: uint64;
    /**
     * Last confirmed block UNIX timestamp. Fails if negative. Application mode only.
     * Min AVM version: 2
     */
    readonly latestTimestamp: uint64;
    /**
     * ID of current application executing. Application mode only.
     * Min AVM version: 2
     */
    readonly currentApplicationId: Application;
    /**
     * Address of the creator of the current application. Application mode only.
     * Min AVM version: 3
     */
    readonly creatorAddress: Account;
    /**
     * Address that the current application controls. Application mode only.
     * Min AVM version: 5
     */
    readonly currentApplicationAddress: Account;
    /**
     * ID of the transaction group. 32 zero bytes if the transaction is not part of a group.
     * Min AVM version: 5
     */
    readonly groupId: bytes<32>;
    /**
     * The remaining cost that can be spent by opcodes in this program.
     * Min AVM version: 6
     */
    readonly opcodeBudget: uint64;
    /**
     * The application ID of the application that called this application. 0 if this application is at the top-level. Application mode only.
     * Min AVM version: 6
     */
    readonly callerApplicationId: uint64;
    /**
     * The application address of the application that called this application. ZeroAddress if this application is at the top-level. Application mode only.
     * Min AVM version: 6
     */
    readonly callerApplicationAddress: Account;
    /**
     * The additional minimum balance required to create (and opt-in to) an asset.
     * Min AVM version: 10
     */
    readonly assetCreateMinBalance: uint64;
    /**
     * The additional minimum balance required to opt-in to an asset.
     * Min AVM version: 10
     */
    readonly assetOptInMinBalance: uint64;
    /**
     * The Genesis Hash for the network.
     * Min AVM version: 10
     */
    readonly genesisHash: bytes<32>;
    /**
     * Whether block proposal payouts are enabled.
     * Min AVM version: 11
     */
    readonly payoutsEnabled: boolean;
    /**
     * The fee required in a keyreg transaction to make an account incentive eligible.
     * Min AVM version: 11
     */
    readonly payoutsGoOnlineFee: uint64;
    /**
     * The percentage of transaction fees in a block that can be paid to the block proposer.
     * Min AVM version: 11
     */
    readonly payoutsPercent: uint64;
    /**
     * The minimum balance an account must have in the agreement round to receive block payouts in the proposal round.
     * Min AVM version: 11
     */
    readonly payoutsMinBalance: uint64;
    /**
     * The maximum balance an account can have in the agreement round to receive block payouts in the proposal round.
     * Min AVM version: 11
     */
    readonly payoutsMaxBalance: uint64;
};
/**
 * Get values for transactions in the current group
 */
export declare const GTxn: {
    /**
     * 32 byte address
     * Min AVM version: 3
     */
    sender(a: uint64): Account;
    /**
     * microalgos
     * Min AVM version: 3
     */
    fee(a: uint64): uint64;
    /**
     * round number
     * Min AVM version: 3
     */
    firstValid(a: uint64): uint64;
    /**
     * UNIX timestamp of block before txn.FirstValid. Fails if negative
     * Min AVM version: 7
     */
    firstValidTime(a: uint64): uint64;
    /**
     * round number
     * Min AVM version: 3
     */
    lastValid(a: uint64): uint64;
    /**
     * Any data up to 1024 bytes
     * Min AVM version: 3
     */
    note(a: uint64): bytes;
    /**
     * 32 byte lease value
     * Min AVM version: 3
     */
    lease(a: uint64): bytes<32>;
    /**
     * 32 byte address
     * Min AVM version: 3
     */
    receiver(a: uint64): Account;
    /**
     * microalgos
     * Min AVM version: 3
     */
    amount(a: uint64): uint64;
    /**
     * 32 byte address
     * Min AVM version: 3
     */
    closeRemainderTo(a: uint64): Account;
    /**
     * 32 byte address
     * Min AVM version: 3
     */
    votePk(a: uint64): bytes<32>;
    /**
     * 32 byte address
     * Min AVM version: 3
     */
    selectionPk(a: uint64): bytes<32>;
    /**
     * The first round that the participation key is valid.
     * Min AVM version: 3
     */
    voteFirst(a: uint64): uint64;
    /**
     * The last round that the participation key is valid.
     * Min AVM version: 3
     */
    voteLast(a: uint64): uint64;
    /**
     * Dilution for the 2-level participation key
     * Min AVM version: 3
     */
    voteKeyDilution(a: uint64): uint64;
    /**
     * Transaction type as bytes
     * Min AVM version: 3
     */
    type(a: uint64): bytes;
    /**
     * Transaction type as integer
     * Min AVM version: 3
     */
    typeEnum(a: uint64): TransactionType;
    /**
     * Asset ID
     * Min AVM version: 3
     */
    xferAsset(a: uint64): Asset;
    /**
     * value in Asset's units
     * Min AVM version: 3
     */
    assetAmount(a: uint64): uint64;
    /**
     * 32 byte address. Source of assets if Sender is the Asset's Clawback address.
     * Min AVM version: 3
     */
    assetSender(a: uint64): Account;
    /**
     * 32 byte address
     * Min AVM version: 3
     */
    assetReceiver(a: uint64): Account;
    /**
     * 32 byte address
     * Min AVM version: 3
     */
    assetCloseTo(a: uint64): Account;
    /**
     * Position of this transaction within an atomic transaction group. A stand-alone transaction is implicitly element 0 in a group of 1
     * Min AVM version: 3
     */
    groupIndex(a: uint64): uint64;
    /**
     * The computed ID for this transaction. 32 bytes.
     * Min AVM version: 3
     */
    txId(a: uint64): bytes<32>;
    /**
     * ApplicationID from ApplicationCall transaction
     * Min AVM version: 2
     */
    applicationId(a: uint64): Application;
    /**
     * ApplicationCall transaction on completion action
     * Min AVM version: 2
     */
    onCompletion(a: uint64): OnCompleteAction;
    /**
     * Arguments passed to the application in the ApplicationCall transaction
     * Min AVM version: 2
     */
    applicationArgs(a: uint64, b: uint64): bytes;
    /**
     * Number of ApplicationArgs
     * Min AVM version: 2
     */
    numAppArgs(a: uint64): uint64;
    /**
     * Accounts listed in the ApplicationCall transaction
     * Min AVM version: 2
     */
    accounts(a: uint64, b: uint64): Account;
    /**
     * Number of Accounts
     * Min AVM version: 2
     */
    numAccounts(a: uint64): uint64;
    /**
     * Approval program
     * Min AVM version: 2
     */
    approvalProgram(a: uint64): bytes;
    /**
     * Clear state program
     * Min AVM version: 2
     */
    clearStateProgram(a: uint64): bytes;
    /**
     * 32 byte Sender's new AuthAddr
     * Min AVM version: 2
     */
    rekeyTo(a: uint64): Account;
    /**
     * Asset ID in asset config transaction
     * Min AVM version: 2
     */
    configAsset(a: uint64): Asset;
    /**
     * Total number of units of this asset created
     * Min AVM version: 2
     */
    configAssetTotal(a: uint64): uint64;
    /**
     * Number of digits to display after the decimal place when displaying the asset
     * Min AVM version: 2
     */
    configAssetDecimals(a: uint64): uint64;
    /**
     * Whether the asset's slots are frozen by default or not, 0 or 1
     * Min AVM version: 2
     */
    configAssetDefaultFrozen(a: uint64): boolean;
    /**
     * Unit name of the asset
     * Min AVM version: 2
     */
    configAssetUnitName(a: uint64): bytes;
    /**
     * The asset name
     * Min AVM version: 2
     */
    configAssetName(a: uint64): bytes;
    /**
     * URL
     * Min AVM version: 2
     */
    configAssetUrl(a: uint64): bytes;
    /**
     * 32 byte commitment to unspecified asset metadata
     * Min AVM version: 2
     */
    configAssetMetadataHash(a: uint64): bytes<32>;
    /**
     * 32 byte address
     * Min AVM version: 2
     */
    configAssetManager(a: uint64): Account;
    /**
     * 32 byte address
     * Min AVM version: 2
     */
    configAssetReserve(a: uint64): Account;
    /**
     * 32 byte address
     * Min AVM version: 2
     */
    configAssetFreeze(a: uint64): Account;
    /**
     * 32 byte address
     * Min AVM version: 2
     */
    configAssetClawback(a: uint64): Account;
    /**
     * Asset ID being frozen or un-frozen
     * Min AVM version: 2
     */
    freezeAsset(a: uint64): Asset;
    /**
     * 32 byte address of the account whose asset slot is being frozen or un-frozen
     * Min AVM version: 2
     */
    freezeAssetAccount(a: uint64): Account;
    /**
     * The new frozen value, 0 or 1
     * Min AVM version: 2
     */
    freezeAssetFrozen(a: uint64): boolean;
    /**
     * Foreign Assets listed in the ApplicationCall transaction
     * Min AVM version: 3
     */
    assets(a: uint64, b: uint64): Asset;
    /**
     * Number of Assets
     * Min AVM version: 3
     */
    numAssets(a: uint64): uint64;
    /**
     * Foreign Apps listed in the ApplicationCall transaction
     * Min AVM version: 3
     */
    applications(a: uint64, b: uint64): Application;
    /**
     * Number of Applications
     * Min AVM version: 3
     */
    numApplications(a: uint64): uint64;
    /**
     * Number of global state integers in ApplicationCall
     * Min AVM version: 3
     */
    globalNumUint(a: uint64): uint64;
    /**
     * Number of global state byteslices in ApplicationCall
     * Min AVM version: 3
     */
    globalNumByteSlice(a: uint64): uint64;
    /**
     * Number of local state integers in ApplicationCall
     * Min AVM version: 3
     */
    localNumUint(a: uint64): uint64;
    /**
     * Number of local state byteslices in ApplicationCall
     * Min AVM version: 3
     */
    localNumByteSlice(a: uint64): uint64;
    /**
     * Number of additional pages for each of the application's approval and clear state programs. An ExtraProgramPages of 1 means 2048 more total bytes, or 1024 for each program.
     * Min AVM version: 4
     */
    extraProgramPages(a: uint64): uint64;
    /**
     * Marks an account nonparticipating for rewards
     * Min AVM version: 5
     */
    nonparticipation(a: uint64): boolean;
    /**
     * Log messages emitted by an application call (only with `itxn` in v5). Application mode only
     * Min AVM version: 5
     */
    logs(a: uint64, b: uint64): bytes;
    /**
     * Number of Logs (only with `itxn` in v5). Application mode only
     * Min AVM version: 5
     */
    numLogs(a: uint64): uint64;
    /**
     * Asset ID allocated by the creation of an ASA (only with `itxn` in v5). Application mode only
     * Min AVM version: 5
     */
    createdAssetId(a: uint64): Asset;
    /**
     * ApplicationID allocated by the creation of an application (only with `itxn` in v5). Application mode only
     * Min AVM version: 5
     */
    createdApplicationId(a: uint64): Application;
    /**
     * The last message emitted. Empty bytes if none were emitted. Application mode only
     * Min AVM version: 6
     */
    lastLog(a: uint64): bytes;
    /**
     * State proof public key
     * Min AVM version: 6
     */
    stateProofPk(a: uint64): bytes<64>;
    /**
     * Approval Program as an array of pages
     * Min AVM version: 7
     */
    approvalProgramPages(a: uint64, b: uint64): bytes;
    /**
     * Number of Approval Program pages
     * Min AVM version: 7
     */
    numApprovalProgramPages(a: uint64): uint64;
    /**
     * ClearState Program as an array of pages
     * Min AVM version: 7
     */
    clearStateProgramPages(a: uint64, b: uint64): bytes;
    /**
     * Number of ClearState Program pages
     * Min AVM version: 7
     */
    numClearStateProgramPages(a: uint64): uint64;
    /**
     * Application version for which the txn must reject
     * Min AVM version: 12
     */
    rejectVersion(a: uint64): uint64;
};
/**
 * converts uint64 A to big-endian byte array, always of length 8
 * @see Native TEAL opcode: [`itob`](https://dev.algorand.co/reference/algorand-teal/opcodes#itob)
 * Min AVM version: 1
 */
export declare function itob(a: uint64): bytes<8>;
/**
 * Get values for the last inner transaction
 */
export declare const ITxn: {
    /**
     * 32 byte address
     * Min AVM version: 5
     */
    readonly sender: Account;
    /**
     * microalgos
     * Min AVM version: 5
     */
    readonly fee: uint64;
    /**
     * round number
     * Min AVM version: 5
     */
    readonly firstValid: uint64;
    /**
     * UNIX timestamp of block before txn.FirstValid. Fails if negative
     * Min AVM version: 7
     */
    readonly firstValidTime: uint64;
    /**
     * round number
     * Min AVM version: 5
     */
    readonly lastValid: uint64;
    /**
     * Any data up to 1024 bytes
     * Min AVM version: 5
     */
    readonly note: bytes;
    /**
     * 32 byte lease value
     * Min AVM version: 5
     */
    readonly lease: bytes<32>;
    /**
     * 32 byte address
     * Min AVM version: 5
     */
    readonly receiver: Account;
    /**
     * microalgos
     * Min AVM version: 5
     */
    readonly amount: uint64;
    /**
     * 32 byte address
     * Min AVM version: 5
     */
    readonly closeRemainderTo: Account;
    /**
     * 32 byte address
     * Min AVM version: 5
     */
    readonly votePk: bytes<32>;
    /**
     * 32 byte address
     * Min AVM version: 5
     */
    readonly selectionPk: bytes<32>;
    /**
     * The first round that the participation key is valid.
     * Min AVM version: 5
     */
    readonly voteFirst: uint64;
    /**
     * The last round that the participation key is valid.
     * Min AVM version: 5
     */
    readonly voteLast: uint64;
    /**
     * Dilution for the 2-level participation key
     * Min AVM version: 5
     */
    readonly voteKeyDilution: uint64;
    /**
     * Transaction type as bytes
     * Min AVM version: 5
     */
    readonly type: bytes;
    /**
     * Transaction type as integer
     * Min AVM version: 5
     */
    readonly typeEnum: TransactionType;
    /**
     * Asset ID
     * Min AVM version: 5
     */
    readonly xferAsset: Asset;
    /**
     * value in Asset's units
     * Min AVM version: 5
     */
    readonly assetAmount: uint64;
    /**
     * 32 byte address. Source of assets if Sender is the Asset's Clawback address.
     * Min AVM version: 5
     */
    readonly assetSender: Account;
    /**
     * 32 byte address
     * Min AVM version: 5
     */
    readonly assetReceiver: Account;
    /**
     * 32 byte address
     * Min AVM version: 5
     */
    readonly assetCloseTo: Account;
    /**
     * Position of this transaction within an atomic transaction group. A stand-alone transaction is implicitly element 0 in a group of 1
     * Min AVM version: 5
     */
    readonly groupIndex: uint64;
    /**
     * The computed ID for this transaction. 32 bytes.
     * Min AVM version: 5
     */
    readonly txId: bytes<32>;
    /**
     * ApplicationID from ApplicationCall transaction
     * Min AVM version: 2
     */
    readonly applicationId: Application;
    /**
     * ApplicationCall transaction on completion action
     * Min AVM version: 2
     */
    readonly onCompletion: OnCompleteAction;
    /**
     * Arguments passed to the application in the ApplicationCall transaction
     * Min AVM version: 2
     */
    applicationArgs(a: uint64): bytes;
    /**
     * Number of ApplicationArgs
     * Min AVM version: 2
     */
    readonly numAppArgs: uint64;
    /**
     * Accounts listed in the ApplicationCall transaction
     * Min AVM version: 2
     */
    accounts(a: uint64): Account;
    /**
     * Number of Accounts
     * Min AVM version: 2
     */
    readonly numAccounts: uint64;
    /**
     * Approval program
     * Min AVM version: 2
     */
    readonly approvalProgram: bytes;
    /**
     * Clear state program
     * Min AVM version: 2
     */
    readonly clearStateProgram: bytes;
    /**
     * 32 byte Sender's new AuthAddr
     * Min AVM version: 2
     */
    readonly rekeyTo: Account;
    /**
     * Asset ID in asset config transaction
     * Min AVM version: 2
     */
    readonly configAsset: Asset;
    /**
     * Total number of units of this asset created
     * Min AVM version: 2
     */
    readonly configAssetTotal: uint64;
    /**
     * Number of digits to display after the decimal place when displaying the asset
     * Min AVM version: 2
     */
    readonly configAssetDecimals: uint64;
    /**
     * Whether the asset's slots are frozen by default or not, 0 or 1
     * Min AVM version: 2
     */
    readonly configAssetDefaultFrozen: boolean;
    /**
     * Unit name of the asset
     * Min AVM version: 2
     */
    readonly configAssetUnitName: bytes;
    /**
     * The asset name
     * Min AVM version: 2
     */
    readonly configAssetName: bytes;
    /**
     * URL
     * Min AVM version: 2
     */
    readonly configAssetUrl: bytes;
    /**
     * 32 byte commitment to unspecified asset metadata
     * Min AVM version: 2
     */
    readonly configAssetMetadataHash: bytes<32>;
    /**
     * 32 byte address
     * Min AVM version: 2
     */
    readonly configAssetManager: Account;
    /**
     * 32 byte address
     * Min AVM version: 2
     */
    readonly configAssetReserve: Account;
    /**
     * 32 byte address
     * Min AVM version: 2
     */
    readonly configAssetFreeze: Account;
    /**
     * 32 byte address
     * Min AVM version: 2
     */
    readonly configAssetClawback: Account;
    /**
     * Asset ID being frozen or un-frozen
     * Min AVM version: 2
     */
    readonly freezeAsset: Asset;
    /**
     * 32 byte address of the account whose asset slot is being frozen or un-frozen
     * Min AVM version: 2
     */
    readonly freezeAssetAccount: Account;
    /**
     * The new frozen value, 0 or 1
     * Min AVM version: 2
     */
    readonly freezeAssetFrozen: boolean;
    /**
     * Foreign Assets listed in the ApplicationCall transaction
     * Min AVM version: 3
     */
    assets(a: uint64): Asset;
    /**
     * Number of Assets
     * Min AVM version: 3
     */
    readonly numAssets: uint64;
    /**
     * Foreign Apps listed in the ApplicationCall transaction
     * Min AVM version: 3
     */
    applications(a: uint64): Application;
    /**
     * Number of Applications
     * Min AVM version: 3
     */
    readonly numApplications: uint64;
    /**
     * Number of global state integers in ApplicationCall
     * Min AVM version: 3
     */
    readonly globalNumUint: uint64;
    /**
     * Number of global state byteslices in ApplicationCall
     * Min AVM version: 3
     */
    readonly globalNumByteSlice: uint64;
    /**
     * Number of local state integers in ApplicationCall
     * Min AVM version: 3
     */
    readonly localNumUint: uint64;
    /**
     * Number of local state byteslices in ApplicationCall
     * Min AVM version: 3
     */
    readonly localNumByteSlice: uint64;
    /**
     * Number of additional pages for each of the application's approval and clear state programs. An ExtraProgramPages of 1 means 2048 more total bytes, or 1024 for each program.
     * Min AVM version: 4
     */
    readonly extraProgramPages: uint64;
    /**
     * Marks an account nonparticipating for rewards
     * Min AVM version: 5
     */
    readonly nonparticipation: boolean;
    /**
     * Log messages emitted by an application call (only with `itxn` in v5). Application mode only
     * Min AVM version: 5
     */
    logs(a: uint64): bytes;
    /**
     * Number of Logs (only with `itxn` in v5). Application mode only
     * Min AVM version: 5
     */
    readonly numLogs: uint64;
    /**
     * Asset ID allocated by the creation of an ASA (only with `itxn` in v5). Application mode only
     * Min AVM version: 5
     */
    readonly createdAssetId: Asset;
    /**
     * ApplicationID allocated by the creation of an application (only with `itxn` in v5). Application mode only
     * Min AVM version: 5
     */
    readonly createdApplicationId: Application;
    /**
     * The last message emitted. Empty bytes if none were emitted. Application mode only
     * Min AVM version: 6
     */
    readonly lastLog: bytes;
    /**
     * State proof public key
     * Min AVM version: 6
     */
    readonly stateProofPk: bytes<64>;
    /**
     * Approval Program as an array of pages
     * Min AVM version: 7
     */
    approvalProgramPages(a: uint64): bytes;
    /**
     * Number of Approval Program pages
     * Min AVM version: 7
     */
    readonly numApprovalProgramPages: uint64;
    /**
     * ClearState Program as an array of pages
     * Min AVM version: 7
     */
    clearStateProgramPages(a: uint64): bytes;
    /**
     * Number of ClearState Program pages
     * Min AVM version: 7
     */
    readonly numClearStateProgramPages: uint64;
    /**
     * Application version for which the txn must reject
     * Min AVM version: 12
     */
    readonly rejectVersion: uint64;
};
/**
 * Create inner transactions
 */
export declare const ITxnCreate: {
    /**
     * begin preparation of a new inner transaction in a new transaction group
     * `itxn_begin` initializes Sender to the application address; Fee to the minimum allowable, taking into account MinTxnFee and credit from overpaying in earlier transactions; FirstValid/LastValid to the values in the invoking transaction, and all other fields to zero or empty values.
     * @see Native TEAL opcode: [`itxn_begin`](https://dev.algorand.co/reference/algorand-teal/opcodes#itxn_begin)
     * Min AVM version: 5
     */
    begin(): void;
    /**
     * 32 byte address
     * Min AVM version: 5
     */
    setSender(a: Account): void;
    /**
     * microalgos
     * Min AVM version: 5
     */
    setFee(a: uint64): void;
    /**
     * Any data up to 1024 bytes
     * Min AVM version: 5
     */
    setNote(a: bytes): void;
    /**
     * 32 byte address
     * Min AVM version: 5
     */
    setReceiver(a: Account): void;
    /**
     * microalgos
     * Min AVM version: 5
     */
    setAmount(a: uint64): void;
    /**
     * 32 byte address
     * Min AVM version: 5
     */
    setCloseRemainderTo(a: Account): void;
    /**
     * 32 byte address
     * Min AVM version: 5
     */
    setVotePk(a: bytes<32> | bytes): void;
    /**
     * 32 byte address
     * Min AVM version: 5
     */
    setSelectionPk(a: bytes<32> | bytes): void;
    /**
     * The first round that the participation key is valid.
     * Min AVM version: 5
     */
    setVoteFirst(a: uint64): void;
    /**
     * The last round that the participation key is valid.
     * Min AVM version: 5
     */
    setVoteLast(a: uint64): void;
    /**
     * Dilution for the 2-level participation key
     * Min AVM version: 5
     */
    setVoteKeyDilution(a: uint64): void;
    /**
     * Transaction type as bytes
     * Min AVM version: 5
     */
    setType(a: bytes): void;
    /**
     * Transaction type as integer
     * Min AVM version: 5
     */
    setTypeEnum(a: uint64): void;
    /**
     * Asset ID
     * Min AVM version: 5
     */
    setXferAsset(a: Asset | uint64): void;
    /**
     * value in Asset's units
     * Min AVM version: 5
     */
    setAssetAmount(a: uint64): void;
    /**
     * 32 byte address. Source of assets if Sender is the Asset's Clawback address.
     * Min AVM version: 5
     */
    setAssetSender(a: Account): void;
    /**
     * 32 byte address
     * Min AVM version: 5
     */
    setAssetReceiver(a: Account): void;
    /**
     * 32 byte address
     * Min AVM version: 5
     */
    setAssetCloseTo(a: Account): void;
    /**
     * ApplicationID from ApplicationCall transaction
     * Min AVM version: 2
     */
    setApplicationId(a: Application | uint64): void;
    /**
     * ApplicationCall transaction on completion action
     * Min AVM version: 2
     */
    setOnCompletion(a: uint64): void;
    /**
     * Arguments passed to the application in the ApplicationCall transaction
     * Min AVM version: 2
     */
    setApplicationArgs(a: bytes): void;
    /**
     * Accounts listed in the ApplicationCall transaction
     * Min AVM version: 2
     */
    setAccounts(a: Account): void;
    /**
     * Approval program
     * Min AVM version: 2
     */
    setApprovalProgram(a: bytes): void;
    /**
     * Clear state program
     * Min AVM version: 2
     */
    setClearStateProgram(a: bytes): void;
    /**
     * 32 byte Sender's new AuthAddr
     * Min AVM version: 2
     */
    setRekeyTo(a: Account): void;
    /**
     * Asset ID in asset config transaction
     * Min AVM version: 2
     */
    setConfigAsset(a: Asset | uint64): void;
    /**
     * Total number of units of this asset created
     * Min AVM version: 2
     */
    setConfigAssetTotal(a: uint64): void;
    /**
     * Number of digits to display after the decimal place when displaying the asset
     * Min AVM version: 2
     */
    setConfigAssetDecimals(a: uint64): void;
    /**
     * Whether the asset's slots are frozen by default or not, 0 or 1
     * Min AVM version: 2
     */
    setConfigAssetDefaultFrozen(a: boolean): void;
    /**
     * Unit name of the asset
     * Min AVM version: 2
     */
    setConfigAssetUnitName(a: bytes): void;
    /**
     * The asset name
     * Min AVM version: 2
     */
    setConfigAssetName(a: bytes): void;
    /**
     * URL
     * Min AVM version: 2
     */
    setConfigAssetUrl(a: bytes): void;
    /**
     * 32 byte commitment to unspecified asset metadata
     * Min AVM version: 2
     */
    setConfigAssetMetadataHash(a: bytes<32> | bytes): void;
    /**
     * 32 byte address
     * Min AVM version: 2
     */
    setConfigAssetManager(a: Account): void;
    /**
     * 32 byte address
     * Min AVM version: 2
     */
    setConfigAssetReserve(a: Account): void;
    /**
     * 32 byte address
     * Min AVM version: 2
     */
    setConfigAssetFreeze(a: Account): void;
    /**
     * 32 byte address
     * Min AVM version: 2
     */
    setConfigAssetClawback(a: Account): void;
    /**
     * Asset ID being frozen or un-frozen
     * Min AVM version: 2
     */
    setFreezeAsset(a: Asset | uint64): void;
    /**
     * 32 byte address of the account whose asset slot is being frozen or un-frozen
     * Min AVM version: 2
     */
    setFreezeAssetAccount(a: Account): void;
    /**
     * The new frozen value, 0 or 1
     * Min AVM version: 2
     */
    setFreezeAssetFrozen(a: boolean): void;
    /**
     * Foreign Assets listed in the ApplicationCall transaction
     * Min AVM version: 3
     */
    setAssets(a: uint64): void;
    /**
     * Foreign Apps listed in the ApplicationCall transaction
     * Min AVM version: 3
     */
    setApplications(a: uint64): void;
    /**
     * Number of global state integers in ApplicationCall
     * Min AVM version: 3
     */
    setGlobalNumUint(a: uint64): void;
    /**
     * Number of global state byteslices in ApplicationCall
     * Min AVM version: 3
     */
    setGlobalNumByteSlice(a: uint64): void;
    /**
     * Number of local state integers in ApplicationCall
     * Min AVM version: 3
     */
    setLocalNumUint(a: uint64): void;
    /**
     * Number of local state byteslices in ApplicationCall
     * Min AVM version: 3
     */
    setLocalNumByteSlice(a: uint64): void;
    /**
     * Number of additional pages for each of the application's approval and clear state programs. An ExtraProgramPages of 1 means 2048 more total bytes, or 1024 for each program.
     * Min AVM version: 4
     */
    setExtraProgramPages(a: uint64): void;
    /**
     * Marks an account nonparticipating for rewards
     * Min AVM version: 5
     */
    setNonparticipation(a: boolean): void;
    /**
     * State proof public key
     * Min AVM version: 6
     */
    setStateProofPk(a: bytes<64> | bytes): void;
    /**
     * Approval Program as an array of pages
     * Min AVM version: 7
     */
    setApprovalProgramPages(a: bytes): void;
    /**
     * ClearState Program as an array of pages
     * Min AVM version: 7
     */
    setClearStateProgramPages(a: bytes): void;
    /**
     * Application version for which the txn must reject
     * Min AVM version: 12
     */
    setRejectVersion(a: uint64): void;
    /**
     * begin preparation of a new inner transaction in the same transaction group
     * `itxn_next` initializes the transaction exactly as `itxn_begin` does
     * @see Native TEAL opcode: [`itxn_next`](https://dev.algorand.co/reference/algorand-teal/opcodes#itxn_next)
     * Min AVM version: 6
     */
    next(): void;
    /**
     * execute the current inner transaction group. Fail if executing this group would exceed the inner transaction limit, or if any transaction in the group fails.
     * `itxn_submit` resets the current transaction so that it can not be resubmitted. A new `itxn_begin` is required to prepare another inner transaction.
     * @see Native TEAL opcode: [`itxn_submit`](https://dev.algorand.co/reference/algorand-teal/opcodes#itxn_submit)
     * Min AVM version: 5
     */
    submit(): void;
};
export declare const JsonRef: {
    jsonString(a: bytes, b: bytes): bytes;
    jsonUint64(a: bytes, b: bytes): uint64;
    jsonObject(a: bytes, b: bytes): bytes;
};
/**
 * Keccak256 hash of value A, yields [32]byte
 * @see Native TEAL opcode: [`keccak256`](https://dev.algorand.co/reference/algorand-teal/opcodes#keccak256)
 * Min AVM version: 1
 */
export declare function keccak256(a: bytes): bytes<32>;
/**
 * yields length of byte value A
 * @see Native TEAL opcode: [`len`](https://dev.algorand.co/reference/algorand-teal/opcodes#len)
 * Min AVM version: 1
 */
export declare function len(a: bytes): uint64;
/**
 * Load or store scratch values
 */
export declare const Scratch: {
    /**
     * Ath scratch space value.  All scratch spaces are 0 at program start.
     * @see Native TEAL opcode: [`loads`](https://dev.algorand.co/reference/algorand-teal/opcodes#loads)
     * Min AVM version: 5
     */
    loadBytes(a: uint64): bytes;
    /**
     * Ath scratch space value.  All scratch spaces are 0 at program start.
     * @see Native TEAL opcode: [`loads`](https://dev.algorand.co/reference/algorand-teal/opcodes#loads)
     * Min AVM version: 5
     */
    loadUint64(a: uint64): uint64;
    /**
     * store B to the Ath scratch space
     * @see Native TEAL opcode: [`stores`](https://dev.algorand.co/reference/algorand-teal/opcodes#stores)
     * Min AVM version: 5
     */
    store(a: uint64, b: bytes | uint64): void;
};
/**
 * MiMC hash of scalars A, using curve and parameters specified by configuration C
 * A is a list of concatenated 32 byte big-endian unsigned integer scalars.  Fail if A's length is not a multiple of 32 or any element exceeds the curve modulus.
 * The MiMC hash function has known collisions since any input which is a multiple of the elliptic curve modulus will hash to the same value. MiMC is thus not a general purpose hash function, but meant to be used in zero knowledge applications to match a zk-circuit implementation.
 * @see Native TEAL opcode: [`mimc`](https://dev.algorand.co/reference/algorand-teal/opcodes#mimc)
 * Min AVM version: 11
 */
export declare function mimc(c: MimcConfigurations, a: bytes): bytes<32>;
/**
 * minimum required balance for account A, in microalgos. Required balance is affected by ASA, App, and Box usage. When creating or opting into an app, the minimum balance grows before the app code runs, therefore the increase is visible there. When deleting or closing out, the minimum balance decreases after the app executes. Changes caused by inner transactions or box usage are observable immediately following the opcode effecting the change.
 * @param a Txn.Accounts offset (or, since v4, an _available_ account address), _available_ application id (or, since v4, a Txn.ForeignApps offset).
 * @return value.
 * @see Native TEAL opcode: [`min_balance`](https://dev.algorand.co/reference/algorand-teal/opcodes#min_balance)
 * Min AVM version: 3
 */
export declare function minBalance(a: Account | uint64): uint64;
/**
 * A times B as a 128-bit result in two uint64s. X is the high 64 bits, Y is the low
 * @see Native TEAL opcode: [`mulw`](https://dev.algorand.co/reference/algorand-teal/opcodes#mulw)
 * Min AVM version: 1
 */
export declare function mulw(a: uint64, b: uint64): readonly [uint64, uint64];
/**
 * the total online stake in the agreement round
 * @see Native TEAL opcode: [`online_stake`](https://dev.algorand.co/reference/algorand-teal/opcodes#online_stake)
 * Min AVM version: 11
 */
export declare function onlineStake(): uint64;
/**
 * Copy of A with the bytes starting at B replaced by the bytes of C. Fails if B+len(C) exceeds len(A)
 * `replace3` can be called using `replace` with no immediates.
 * @see Native TEAL opcode: [`replace3`](https://dev.algorand.co/reference/algorand-teal/opcodes#replace3)
 * Min AVM version: 7
 */
export declare function replace(a: bytes, b: uint64, c: bytes): bytes;
/**
 * Copy of A with the Bth byte set to small integer (between 0..255) C. If B is greater than or equal to the array length, the program fails
 * @see Native TEAL opcode: [`setbyte`](https://dev.algorand.co/reference/algorand-teal/opcodes#setbyte)
 * Min AVM version: 3
 */
export declare function setByte(a: bytes, b: uint64, c: uint64): bytes;
/**
 * SHA256 hash of value A, yields [32]byte
 * @see Native TEAL opcode: [`sha256`](https://dev.algorand.co/reference/algorand-teal/opcodes#sha256)
 * Min AVM version: 1
 */
export declare function sha256(a: bytes): bytes<32>;
/**
 * SHA3_256 hash of value A, yields [32]byte
 * @see Native TEAL opcode: [`sha3_256`](https://dev.algorand.co/reference/algorand-teal/opcodes#sha3_256)
 * Min AVM version: 7
 */
export declare function sha3_256(a: bytes): bytes<32>;
/**
 * SHA512_256 hash of value A, yields [32]byte
 * @see Native TEAL opcode: [`sha512_256`](https://dev.algorand.co/reference/algorand-teal/opcodes#sha512_256)
 * Min AVM version: 1
 */
export declare function sha512_256(a: bytes): bytes<32>;
/**
 * A times 2^B, modulo 2^64
 * @see Native TEAL opcode: [`shl`](https://dev.algorand.co/reference/algorand-teal/opcodes#shl)
 * Min AVM version: 4
 */
export declare function shl(a: uint64, b: uint64): uint64;
/**
 * A divided by 2^B
 * @see Native TEAL opcode: [`shr`](https://dev.algorand.co/reference/algorand-teal/opcodes#shr)
 * Min AVM version: 4
 */
export declare function shr(a: uint64, b: uint64): uint64;
/**
 * The largest integer I such that I^2 <= A
 * @see Native TEAL opcode: [`sqrt`](https://dev.algorand.co/reference/algorand-teal/opcodes#sqrt)
 * Min AVM version: 4
 */
export declare function sqrt(a: uint64): uint64;
/**
 * A range of bytes from A starting at B up to but not including C. If C < B, or either is larger than the array length, the program fails
 * @see Native TEAL opcode: [`substring3`](https://dev.algorand.co/reference/algorand-teal/opcodes#substring3)
 * Min AVM version: 2
 */
export declare function substring(a: bytes, b: uint64, c: uint64): bytes;
/**
 * sumhash512 of value A, yields [64]byte
 * @see Native TEAL opcode: [`sumhash512`](https://dev.algorand.co/reference/algorand-teal/opcodes#sumhash512)
 * Min AVM version: 13
 */
export declare function sumhash512(a: bytes): bytes<64>;
/**
 * Get values for the current executing transaction
 */
export declare const Txn: {
    /**
     * 32 byte address
     * Min AVM version: 1
     */
    readonly sender: Account;
    /**
     * microalgos
     * Min AVM version: 1
     */
    readonly fee: uint64;
    /**
     * round number
     * Min AVM version: 1
     */
    readonly firstValid: uint64;
    /**
     * UNIX timestamp of block before txn.FirstValid. Fails if negative
     * Min AVM version: 7
     */
    readonly firstValidTime: uint64;
    /**
     * round number
     * Min AVM version: 1
     */
    readonly lastValid: uint64;
    /**
     * Any data up to 1024 bytes
     * Min AVM version: 1
     */
    readonly note: bytes;
    /**
     * 32 byte lease value
     * Min AVM version: 1
     */
    readonly lease: bytes<32>;
    /**
     * 32 byte address
     * Min AVM version: 1
     */
    readonly receiver: Account;
    /**
     * microalgos
     * Min AVM version: 1
     */
    readonly amount: uint64;
    /**
     * 32 byte address
     * Min AVM version: 1
     */
    readonly closeRemainderTo: Account;
    /**
     * 32 byte address
     * Min AVM version: 1
     */
    readonly votePk: bytes<32>;
    /**
     * 32 byte address
     * Min AVM version: 1
     */
    readonly selectionPk: bytes<32>;
    /**
     * The first round that the participation key is valid.
     * Min AVM version: 1
     */
    readonly voteFirst: uint64;
    /**
     * The last round that the participation key is valid.
     * Min AVM version: 1
     */
    readonly voteLast: uint64;
    /**
     * Dilution for the 2-level participation key
     * Min AVM version: 1
     */
    readonly voteKeyDilution: uint64;
    /**
     * Transaction type as bytes
     * Min AVM version: 1
     */
    readonly type: bytes;
    /**
     * Transaction type as integer
     * Min AVM version: 1
     */
    readonly typeEnum: TransactionType;
    /**
     * Asset ID
     * Min AVM version: 1
     */
    readonly xferAsset: Asset;
    /**
     * value in Asset's units
     * Min AVM version: 1
     */
    readonly assetAmount: uint64;
    /**
     * 32 byte address. Source of assets if Sender is the Asset's Clawback address.
     * Min AVM version: 1
     */
    readonly assetSender: Account;
    /**
     * 32 byte address
     * Min AVM version: 1
     */
    readonly assetReceiver: Account;
    /**
     * 32 byte address
     * Min AVM version: 1
     */
    readonly assetCloseTo: Account;
    /**
     * Position of this transaction within an atomic transaction group. A stand-alone transaction is implicitly element 0 in a group of 1
     * Min AVM version: 1
     */
    readonly groupIndex: uint64;
    /**
     * The computed ID for this transaction. 32 bytes.
     * Min AVM version: 1
     */
    readonly txId: bytes<32>;
    /**
     * ApplicationID from ApplicationCall transaction
     * Min AVM version: 2
     */
    readonly applicationId: Application;
    /**
     * ApplicationCall transaction on completion action
     * Min AVM version: 2
     */
    readonly onCompletion: OnCompleteAction;
    /**
     * Arguments passed to the application in the ApplicationCall transaction
     * Min AVM version: 2
     */
    applicationArgs(a: uint64): bytes;
    /**
     * Number of ApplicationArgs
     * Min AVM version: 2
     */
    readonly numAppArgs: uint64;
    /**
     * Accounts listed in the ApplicationCall transaction
     * Min AVM version: 2
     */
    accounts(a: uint64): Account;
    /**
     * Number of Accounts
     * Min AVM version: 2
     */
    readonly numAccounts: uint64;
    /**
     * Approval program
     * Min AVM version: 2
     */
    readonly approvalProgram: bytes;
    /**
     * Clear state program
     * Min AVM version: 2
     */
    readonly clearStateProgram: bytes;
    /**
     * 32 byte Sender's new AuthAddr
     * Min AVM version: 2
     */
    readonly rekeyTo: Account;
    /**
     * Asset ID in asset config transaction
     * Min AVM version: 2
     */
    readonly configAsset: Asset;
    /**
     * Total number of units of this asset created
     * Min AVM version: 2
     */
    readonly configAssetTotal: uint64;
    /**
     * Number of digits to display after the decimal place when displaying the asset
     * Min AVM version: 2
     */
    readonly configAssetDecimals: uint64;
    /**
     * Whether the asset's slots are frozen by default or not, 0 or 1
     * Min AVM version: 2
     */
    readonly configAssetDefaultFrozen: boolean;
    /**
     * Unit name of the asset
     * Min AVM version: 2
     */
    readonly configAssetUnitName: bytes;
    /**
     * The asset name
     * Min AVM version: 2
     */
    readonly configAssetName: bytes;
    /**
     * URL
     * Min AVM version: 2
     */
    readonly configAssetUrl: bytes;
    /**
     * 32 byte commitment to unspecified asset metadata
     * Min AVM version: 2
     */
    readonly configAssetMetadataHash: bytes<32>;
    /**
     * 32 byte address
     * Min AVM version: 2
     */
    readonly configAssetManager: Account;
    /**
     * 32 byte address
     * Min AVM version: 2
     */
    readonly configAssetReserve: Account;
    /**
     * 32 byte address
     * Min AVM version: 2
     */
    readonly configAssetFreeze: Account;
    /**
     * 32 byte address
     * Min AVM version: 2
     */
    readonly configAssetClawback: Account;
    /**
     * Asset ID being frozen or un-frozen
     * Min AVM version: 2
     */
    readonly freezeAsset: Asset;
    /**
     * 32 byte address of the account whose asset slot is being frozen or un-frozen
     * Min AVM version: 2
     */
    readonly freezeAssetAccount: Account;
    /**
     * The new frozen value, 0 or 1
     * Min AVM version: 2
     */
    readonly freezeAssetFrozen: boolean;
    /**
     * Foreign Assets listed in the ApplicationCall transaction
     * Min AVM version: 3
     */
    assets(a: uint64): Asset;
    /**
     * Number of Assets
     * Min AVM version: 3
     */
    readonly numAssets: uint64;
    /**
     * Foreign Apps listed in the ApplicationCall transaction
     * Min AVM version: 3
     */
    applications(a: uint64): Application;
    /**
     * Number of Applications
     * Min AVM version: 3
     */
    readonly numApplications: uint64;
    /**
     * Number of global state integers in ApplicationCall
     * Min AVM version: 3
     */
    readonly globalNumUint: uint64;
    /**
     * Number of global state byteslices in ApplicationCall
     * Min AVM version: 3
     */
    readonly globalNumByteSlice: uint64;
    /**
     * Number of local state integers in ApplicationCall
     * Min AVM version: 3
     */
    readonly localNumUint: uint64;
    /**
     * Number of local state byteslices in ApplicationCall
     * Min AVM version: 3
     */
    readonly localNumByteSlice: uint64;
    /**
     * Number of additional pages for each of the application's approval and clear state programs. An ExtraProgramPages of 1 means 2048 more total bytes, or 1024 for each program.
     * Min AVM version: 4
     */
    readonly extraProgramPages: uint64;
    /**
     * Marks an account nonparticipating for rewards
     * Min AVM version: 5
     */
    readonly nonparticipation: boolean;
    /**
     * Log messages emitted by an application call (only with `itxn` in v5). Application mode only
     * Min AVM version: 5
     */
    logs(a: uint64): bytes;
    /**
     * Number of Logs (only with `itxn` in v5). Application mode only
     * Min AVM version: 5
     */
    readonly numLogs: uint64;
    /**
     * Asset ID allocated by the creation of an ASA (only with `itxn` in v5). Application mode only
     * Min AVM version: 5
     */
    readonly createdAssetId: Asset;
    /**
     * ApplicationID allocated by the creation of an application (only with `itxn` in v5). Application mode only
     * Min AVM version: 5
     */
    readonly createdApplicationId: Application;
    /**
     * The last message emitted. Empty bytes if none were emitted. Application mode only
     * Min AVM version: 6
     */
    readonly lastLog: bytes;
    /**
     * State proof public key
     * Min AVM version: 6
     */
    readonly stateProofPk: bytes<64>;
    /**
     * Approval Program as an array of pages
     * Min AVM version: 7
     */
    approvalProgramPages(a: uint64): bytes;
    /**
     * Number of Approval Program pages
     * Min AVM version: 7
     */
    readonly numApprovalProgramPages: uint64;
    /**
     * ClearState Program as an array of pages
     * Min AVM version: 7
     */
    clearStateProgramPages(a: uint64): bytes;
    /**
     * Number of ClearState Program pages
     * Min AVM version: 7
     */
    readonly numClearStateProgramPages: uint64;
    /**
     * Application version for which the txn must reject
     * Min AVM version: 12
     */
    readonly rejectVersion: uint64;
};
export declare const VoterParams: {
    /**
     * Online stake in microalgos
     * Min AVM version: 11
     */
    voterBalance(a: Account | uint64): readonly [uint64, boolean];
    /**
     * Had this account opted into block payouts
     * Min AVM version: 11
     */
    voterIncentiveEligible(a: Account | uint64): readonly [boolean, boolean];
};
/**
 * Verify the proof B of message A against pubkey C. Returns vrf output and verification flag.
 * `VrfAlgorand` is the VRF used in Algorand. It is ECVRF-ED25519-SHA512-Elligator2, specified in the IETF internet draft [draft-irtf-cfrg-vrf-03](https://datatracker.ietf.org/doc/draft-irtf-cfrg-vrf/03/).
 * @see Native TEAL opcode: [`vrf_verify`](https://dev.algorand.co/reference/algorand-teal/opcodes#vrf_verify)
 * Min AVM version: 7
 */
export declare function vrfVerify(s: VrfVerify, a: bytes, b: bytes<80> | bytes, c: bytes<32> | bytes): readonly [bytes<64>, boolean];
/**
 * A range of bytes from A starting at B up to the end of the sequence
 */
export declare function extract(a: bytes, b: uint64): bytes;
/**
 * A range of bytes from A starting at B up to but not including B+C. If B+C is larger than the array length, the program fails
 */
export declare function extract(a: bytes, b: uint64, c: uint64): bytes;
/**
 * selects one of two values based on top-of-stack: B if C != 0, else A
 */
export declare function select(a: bytes, b: bytes, c: uint64): bytes;
/**
 * selects one of two values based on top-of-stack: B if C != 0, else A
 */
export declare function select(a: uint64, b: uint64, c: uint64): uint64;
/**
 * Set the nth bit of target to the value of c (1 or 0)
 */
export declare function setBit(target: bytes, n: uint64, c: uint64): bytes;
/**
 * Set the nth bit of target to the value of c (1 or 0)
 */
export declare function setBit(target: uint64, n: uint64, c: uint64): uint64;
/**
 * An alias for types which can be converted to a uint64
 */
export type Uint64Compat = uint64 | bigint | boolean | number;
/**
 * An alias for types which can be converted to a biguint
 */
export type BigUintCompat = bigint | bytes | number | boolean;
/**
 * An alias for types which can be converted to a string
 */
export type StringCompat = string;
/**
 * An alias for types which can be converted to a bytes sequence
 */
export type BytesCompat = bytes | string;
/**
 * An unsigned integer of exactly 64 bits
 */
export type uint64 = {
    /**
     * @hidden
     */
    __type?: 'uint64';
} & number;
/**
 * Create a uint64 with the default value of 0
 */
export declare function Uint64(): uint64;
/**
 * Create a uint64 from a string literal
 */
export declare function Uint64(v: string): uint64;
/**
 * Create a uint64 from a bigint literal
 */
export declare function Uint64(v: bigint): uint64;
/**
 * Create a uint64 from a number literal
 */
export declare function Uint64(v: number): uint64;
/**
 * Create a uint64 from a boolean value. True is 1, False is 0
 */
export declare function Uint64(v: boolean): uint64;
export declare namespace Uint64 {
    var MAX_VALUE: uint64;
    var MIN_VALUE: uint64;
}
/**
 * An unsigned integer of up to 512 bits
 *
 * Stored as a big-endian variable byte array
 */
export type biguint = {
    /**
     * @hidden
     */
    __type?: 'biguint';
} & bigint;
/**
 * Create a biguint from a bigint literal
 */
export declare function BigUint(v: bigint): biguint;
/**
 * Create a biguint from a boolean value (true = 1, false = 0)
 */
export declare function BigUint(v: boolean): biguint;
/**
 * Create a biguint from a uint64 value
 */
export declare function BigUint(v: uint64): biguint;
/**
 * Create a biguint from a number literal
 */
export declare function BigUint(v: number): biguint;
/**
 * Create a biguint from a byte array interpreted as a big-endian number
 */
export declare function BigUint(v: bytes): biguint;
/**
 * Create a biguint from a string literal containing the decimal digits
 */
export declare function BigUint(v: string): biguint;
/**
 * Create a biguint with the default value of 0
 */
export declare function BigUint(): biguint;
type ToFixedBytesOptions<TLength extends uint64 = uint64> = {
    /**
     * The length for the bounded type
     */
    length: TLength;
    /**
     * The strategy to use for converting to a fixed length bytes type (default: 'assert-length')
     *
     * - 'assert-length': Asserts that the byte sequence has the specified length and fails if it differs
     * - 'unsafe-cast': Reinterprets the byte sequence as a fixed length type without any checks. This will succeed even if the value
     *              is not of the specified length but will result in undefined behaviour for any code that makes use of this value.
     *
     */
    strategy?: 'assert-length' | 'unsafe-cast';
};
/**
 * A sequence of zero or more bytes (ie. byte[])
 *
 * @typeParam TLength The static length of this byte array
 */
export type bytes<out TLength extends uint64 = uint64> = {
    /**
     * Retrieve the length of the byte sequence
     */
    readonly length: uint64;
    /**
     * Retrieve the byte at the index i
     * @param i The index to read. Can be negative to read from the end
     * @returns The byte found at the index, or an empty bytes value
     */
    at(i: Uint64Compat): bytes;
    /**
     * Concatenate this bytes value with another bytes value
     * @param other The other bytes value
     * @returns The concatenation result
     */
    concat(other: BytesCompat): bytes;
    /**
     * Perform a bitwise AND operation with this bytes value and another bytes value
     * of the same length.
     *
     * @param other The other bytes value
     * @returns The bitwise operation result
     */
    bitwiseAnd(other: bytes<TLength>): bytes<TLength>;
    /**
     * Perform a bitwise AND operation with this bytes value and another bytes value.
     *
     * The shorter of the two values will be zero-left extended to the larger length.
     * @param other The other bytes value
     * @returns The bitwise operation result
     */
    bitwiseAnd(other: BytesCompat): bytes;
    /**
     * Perform a bitwise OR operation with this bytes value and another bytes value
     * of the same length.
     *
     * @param other The other bytes value
     * @returns The bitwise operation result
     */
    bitwiseOr(other: bytes<TLength>): bytes<TLength>;
    /**
     * Perform a bitwise OR operation with this bytes value and another bytes value
     *
     * The shorter of the two values will be zero-left extended to the larger length.
     * @param other The other bytes value
     * @returns The bitwise operation result
     */
    bitwiseOr(other: BytesCompat): bytes;
    /**
     * Perform a bitwise XOR operation with this bytes value and another bytes value
     * of the same length.
     *
     * @param other The other bytes value
     * @returns The bitwise operation result
     */
    bitwiseXor(other: bytes<TLength>): bytes<TLength>;
    /**
     * Perform a bitwise XOR operation with this bytes value and another bytes value.
     *
     * The shorter of the two values will be zero-left extended to the larger length.
     * @param other The other bytes value
     * @returns The bitwise operation result
     */
    bitwiseXor(other: BytesCompat): bytes;
    /**
     * Perform a bitwise INVERT operation with this bytes value
     * @returns The bitwise operation result
     */
    bitwiseInvert(): bytes<TLength>;
    /**
     * Compares this bytes value with another.
     * @param other The other bytes value
     * @returns True if both values represent the same byte sequence
     */
    equals(other: BytesCompat): boolean;
    /**
     * Returns a copy of this bytes sequence
     */
    slice(): bytes<TLength>;
    /**
     * Returns a slice of this bytes sequence from the specified start to the end
     * @param start The index to start slicing from. Can be negative to count from the end.
     */
    slice(start: Uint64Compat): bytes;
    /**
     * Returns a slice of this bytes sequence from the specified start to the specified end
     * @param start The index to start slicing from. Can be negative to count from the end.
     * @param end The index to end the slice. Can be negative to count from the end.
     */
    slice(start: Uint64Compat, end: Uint64Compat): bytes;
    /**
     * @hidden
     */
    slice(start?: Uint64Compat, end?: Uint64Compat): bytes;
    /**
     * Interpret this byte sequence as a utf-8 string
     */
    toString(): string;
    /**
     * Change this unbounded bytes instance into a bounded one
     * @param options Options for the conversion
     */
    toFixed<TNewLength extends TLength>(options: ToFixedBytesOptions<TNewLength>): bytes<TNewLength>;
};
/**
 * Create a byte array from a string interpolation template and compatible replacements
 * @param value
 * @param replacements
 */
export declare function Bytes(value: TemplateStringsArray, ...replacements: BytesCompat[]): bytes<uint64>;
/**
 * Create a byte array from a utf8 string
 */
export declare function Bytes(value: string): bytes<uint64>;
/**
 * Create a byte array from a utf8 string
 */
export declare function Bytes<TLength extends uint64>(value: string, options: ToFixedBytesOptions<TLength>): bytes<TLength>;
/**
 * No op, returns the provided byte array.
 */
export declare function Bytes(value: bytes): bytes<uint64>;
/**
 * No op, returns the provided byte array.
 */
export declare function Bytes<TLength extends uint64>(value: bytes, options: ToFixedBytesOptions<TLength>): bytes<TLength>;
/**
 * Create a byte array from a biguint value encoded as a variable length big-endian number
 */
export declare function Bytes(value: biguint): bytes<uint64>;
/**
 * Create a byte array from a biguint value encoded as a variable length big-endian number
 */
export declare function Bytes<TLength extends uint64>(value: biguint, options: ToFixedBytesOptions<TLength>): bytes<TLength>;
/**
 * Create a byte array from a uint64 value encoded as a a variable length 64-bit number
 */
export declare function Bytes(value: uint64): bytes<uint64>;
/**
 * Create a byte array from a uint64 value encoded as a a variable length 64-bit number
 */
export declare function Bytes<TLength extends uint64 = 8>(value: uint64, options: ToFixedBytesOptions<TLength>): bytes<TLength>;
/**
 * Create a byte array from an Iterable<uint64> where each item is interpreted as a single byte and must be between 0 and 255 inclusively
 */
export declare function Bytes(value: Iterable<uint64>): bytes<uint64>;
/**
 * Create a byte array from an Iterable<uint64> where each item is interpreted as a single byte and must be between 0 and 255 inclusively
 */
export declare function Bytes<TLength extends uint64>(value: Iterable<uint64>, options: ToFixedBytesOptions<TLength>): bytes<TLength>;
/**
 * Create an empty byte array
 */
export declare function Bytes(): bytes<uint64>;
/**
 * Create an empty byte array
 */
export declare function Bytes<TLength extends uint64 = uint64>(options: ToFixedBytesOptions<TLength>): bytes<TLength>;
export declare namespace Bytes {
    /**
     * Create a new bytes value from a hexadecimal encoded string
     * @param hex A literal string of hexadecimal characters
     */
    function fromHex(hex: string): bytes<uint64>;
    /**
     * Create a new bytes value from a hexadecimal encoded string
     * @param hex A literal string of hexadecimal characters
     * @param options Options for bounded bytes
     */
    function fromHex<TLength extends uint64>(hex: string, options: ToFixedBytesOptions<TLength>): bytes<TLength>;
    /**
     * Create a new bytes value from a base 64 encoded string
     * @param b64 A literal string of b64 encoded characters
     */
    function fromBase64(b64: string): bytes<uint64>;
    /**
     * Create a new bytes value from a base 64 encoded string
     * @param b64 A literal string of b64 encoded characters
     * @param options Options for bounded bytes
     */
    function fromBase64<TLength extends uint64>(b64: string, options: ToFixedBytesOptions<TLength>): bytes<TLength>;
    /**
     * Create a new bytes value from a base 32 encoded string
     * @param b32 A literal string of b32 encoded characters
     */
    function fromBase32(b32: string): bytes<uint64>;
    /**
     * Create a new bytes value from a base 32 encoded string
     * @param b32 A literal string of b32 encoded characters
     * @param options Options for bounded bytes
     */
    function fromBase32<TLength extends uint64>(b32: string, options: ToFixedBytesOptions<TLength>): bytes<TLength>;
}
/**
 * An interface for types which are backed by the AVM bytes type
 */
export interface BytesBacked<TLength extends uint64 = uint64> {
    /**
     * Retrieve the underlying bytes representing this value
     */
    get bytes(): bytes<TLength>;
}
/**
 * Declare a homogeneous tuple with the item type T and length N.
 *
 * Eg.
 * NTuple<uint64, 3> === [uint64, uint64, uint64]
 */
export type NTuple<T, N extends number> = N extends N ? (number extends N ? T[] : _TupleOf<T, N, readonly []>) : never;
type _TupleOf<T, N extends number, R extends readonly unknown[]> = R['length'] extends N ? R : _TupleOf<T, N, readonly [T, ...R]>;
export {};
import { uint64, Uint64Compat } from './primitives';
/**
 * An in memory mutable array which is passed by reference
 */
export declare class ReferenceArray<TItem> {
    /**
     * Create a new ReferenceArray with the specified items
     * @param items The initial items for the array
     */
    constructor(...items: TItem[]);
    /**
     * Returns the current length of this array
     */
    get length(): uint64;
    /**
     * Returns the item at the given index.
     * Negative indexes are taken from the end.
     * @param index The index of the item to retrieve
     */
    at(index: Uint64Compat): TItem;
    /**
     * @deprecated Array slicing is not yet supported in Algorand TypeScript
     * Create a new ReferenceArray with all items from this array
     */
    slice(): ReferenceArray<TItem>;
    /**
     * @deprecated Array slicing is not yet supported in Algorand TypeScript
     * Create a new ReferenceArray with all items up till `end`.
     * Negative indexes are taken from the end.
     * @param end An index in which to stop copying items.
     */
    slice(end: Uint64Compat): ReferenceArray<TItem>;
    /**
     * @deprecated Array slicing is not yet supported in Algorand TypeScript
     * Create a new ReferenceArray with items from `start`, up until `end`
     * Negative indexes are taken from the end.
     * @param start An index in which to start copying items.
     * @param end An index in which to stop copying items
     */
    slice(start: Uint64Compat, end: Uint64Compat): ReferenceArray<TItem>;
    /**
     * Returns an iterator for the items in this array
     */
    [Symbol.iterator](): IterableIterator<TItem>;
    /**
     * Returns an iterator for a tuple of the indexes and items in this array
     */
    entries(): IterableIterator<readonly [uint64, TItem]>;
    /**
     * Returns an iterator for the indexes in this array
     */
    keys(): IterableIterator<uint64>;
    /**
     * Get or set the item at the specified index.
     * Negative indexes are not supported
     */
    [index: uint64]: TItem;
    /**
     * Push a number of items into this array
     * @param items The items to be added to this array
     */
    push(...items: TItem[]): void;
    /**
     * Pop a single item from this array
     */
    pop(): TItem;
}
import { bytes, uint64 } from './primitives';
/**
 * Represents an Algorand Account and exposes properties and methods for reading account data
 */
export type Account = {
    /**
     * Get the accounts address in bytes
     */
    readonly bytes: bytes<32>;
    /**
     * Account balance in microalgos
     *
     * Account must be an available resource
     */
    readonly balance: uint64;
    /**
     * Minimum required balance for account, in microalgos
     *
     * Account must be an available resource
     */
    readonly minBalance: uint64;
    /**
     * Address the account is rekeyed to
     *
     * Account must be an available resource
     */
    readonly authAddress: Account;
    /**
     * The total number of uint64 values allocated by this account in Global and Local States.
     *
     * Account must be an available resource
     */
    readonly totalNumUint: uint64;
    /**
     * The total number of byte array values allocated by this account in Global and Local States.
     *
     * Account must be an available resource
     */
    readonly totalNumByteSlice: uint64;
    /**
     * The number of extra app code pages used by this account.
     *
     * Account must be an available resource
     */
    readonly totalExtraAppPages: uint64;
    /**
     * The number of existing apps created by this account.
     *
     * Account must be an available resource
     */
    readonly totalAppsCreated: uint64;
    /**
     * The number of apps this account is opted into.
     *
     * Account must be an available resource
     */
    readonly totalAppsOptedIn: uint64;
    /**
     * The number of existing ASAs created by this account.
     *
     * Account must be an available resource
     */
    readonly totalAssetsCreated: uint64;
    /**
     * The numbers of ASAs held by this account (including ASAs this account created).
     *
     * Account must be an available resource
     */
    readonly totalAssets: uint64;
    /**
     * The number of existing boxes created by this account's app.
     *
     * Account must be an available resource
     */
    readonly totalBoxes: uint64;
    /**
     * The total number of bytes used by this account's app's box keys and values.
     *
     * Account must be an available resource
     */
    readonly totalBoxBytes: uint64;
    /**
     * Returns true if this account is opted in to the specified Asset or Application.
     * Note: Account and Asset/Application must be an available resource
     *
     * @param assetOrApp
     */
    isOptedIn(assetOrApp: Asset | Application): boolean;
};
/**
 * Create a new account object representing the zero address
 */
export declare function Account(): Account;
/**
 * Create a new account object representing the provided public key bytes
 * @param publicKey A 32-byte Algorand account public key
 */
export declare function Account(publicKey: bytes): Account;
/**
 * Create a new account object representing the provided address
 * @param address A 56 character base-32 encoded Algorand address
 */
export declare function Account(address: string): Account;
/**
 * Creates a new Asset object represent the asset id 0 (an invalid ID)
 */
export declare function Asset(): Asset;
/**
 * Creates a new Asset object representing the asset with the specified id
 * @param assetId The id of the asset
 */
export declare function Asset(assetId: uint64): Asset;
/**
 * An Asset on the Algorand network.
 */
export type Asset = {
    /**
     * Returns the id of the Asset
     */
    readonly id: uint64;
    /**
     * Total number of units of this asset
     */
    readonly total: uint64;
    /**
     * @see AssetParams.decimals
     */
    readonly decimals: uint64;
    /**
     * Frozen by default or not
     */
    readonly defaultFrozen: boolean;
    /**
     * Asset unit name
     */
    readonly unitName: bytes;
    /**
     * Asset name
     */
    readonly name: bytes;
    /**
     * URL with additional info about the asset
     */
    readonly url: bytes;
    /**
     * Arbitrary commitment
     */
    readonly metadataHash: bytes<32>;
    /**
     * Manager address
     */
    readonly manager: Account;
    /**
     * Reserve address
     */
    readonly reserve: Account;
    /**
     * Freeze address
     */
    readonly freeze: Account;
    /**
     * Clawback address
     */
    readonly clawback: Account;
    /**
     * Creator address
     */
    readonly creator: Account;
    /**
     * Amount of the asset unit held by this account. Fails if the account has not
     * opted in to the asset.
     * Asset and supplied Account must be an available resource
     * @param account Account
     * @return balance: uint64
     */
    balance(account: Account): uint64;
    /**
     * Is the asset frozen or not. Fails if the account has not
     * opted in to the asset.
     * Asset and supplied Account must be an available resource
     * @param account Account
     * @return isFrozen: boolean
     */
    frozen(account: Account): boolean;
};
/**
 * Creates a new Application object represent the application id 0 (an invalid ID)
 */
export declare function Application(): Application;
/**
 * Creates a new Application object representing the application with the specified id
 * @param applicationId The id of the application
 */
export declare function Application(applicationId: uint64): Application;
/**
 * An Application on the Algorand network.
 */
export type Application = {
    /**
     * The id of this application on the current network
     */
    readonly id: uint64;
    /**
     * Bytecode of Approval Program
     */
    readonly approvalProgram: bytes;
    /**
     * Bytecode of Clear State Program
     */
    readonly clearStateProgram: bytes;
    /**
     * Number of uint64 values allowed in Global State
     */
    readonly globalNumUint: uint64;
    /**
     * Number of byte array values allowed in Global State
     */
    readonly globalNumBytes: uint64;
    /**
     * Number of uint64 values allowed in Local State
     */
    readonly localNumUint: uint64;
    /**
     * Number of byte array values allowed in Local State
     */
    readonly localNumBytes: uint64;
    /**
     * Number of Extra Program Pages of code space
     */
    readonly extraProgramPages: uint64;
    /**
     * Creator address
     */
    readonly creator: Account;
    /**
     * Address for which this application has authority
     */
    readonly address: Account;
    /**
     * Version of the app, incremented each time the approval or clear program changes
     */
    readonly version: uint64;
};
import { bytes } from './primitives';
import { Account } from './reference';
/**
 * A proxy for manipulating a global state field
 * @typeParam ValueType The type of the value being stored - must be a serializable type
 */
export type GlobalState<ValueType> = {
    /**
     * Get or set the value of this global state field
     */
    value: ValueType;
    /**
     * Delete the stored value of this global state field
     */
    delete(): void;
    /**
     * Gets a boolean value indicating if global state field currently has a value
     */
    readonly hasValue: boolean;
};
/**
 * Options for declaring a global state field
 */
export type GlobalStateOptions<ValueType> = {
    /**
     * The key to be used for this global state field.
     *
     * Defaults to the name of the property this proxy is assigned to
     */
    key?: bytes | string;
    /**
     * An initial value to assign to this global state field when the application is created
     */
    initialValue?: ValueType;
};
/**
 * Creates a new proxy for manipulating a global state field
 * @param options Options for configuring this field
 * @typeParam ValueType The type of the value being stored - must be a serializable type
 */
export declare function GlobalState<ValueType>(options?: GlobalStateOptions<ValueType>): GlobalState<ValueType>;
/**
 * A proxy for manipulating a local state field for a single account
 */
export type LocalStateForAccount<ValueType> = {
    /**
     * Get or set the value of this local state field for a single account
     */
    value: ValueType;
    /**
     * Delete the stored value of this local state field for a single account
     */
    delete(): void;
    /**
     * Gets a boolean value indicating if local state field for a single account currently has a value
     */
    readonly hasValue: boolean;
};
/**
 * A proxy for manipulating a local state field for any account
 */
export type LocalState<ValueType> = {
    /**
     * Gets the LocalState proxy for a specific account
     * @param account The account to read or write state for. This account must be opted into the contract
     */
    (account: Account): LocalStateForAccount<ValueType>;
};
/**
 * Options for declaring a local state field
 */
export type LocalStateOptions = {
    /**
     * The key to be used for this local state field.
     *
     * Defaults to the name of the property this proxy is assigned to
     */
    key?: bytes | string;
};
/**
 * Creates a new proxy for manipulating a local state field
 * @param options Options for configuring this field
 */
export declare function LocalState<ValueType>(options?: LocalStateOptions): LocalState<ValueType>;
/**
 * Declare a template variable which can be replaced at compile time with an environment specific value.
 *
 * The final variable name will be `prefix + variableName`
 * @param variableName The key used to identify the variable.
 * @param prefix The prefix to apply the variable name (Defaults to 'TMPL_')
 */
export declare function TemplateVar<T>(variableName: string, prefix?: string): T;
/**
 * The different transaction types available in a transaction
 */
export declare enum TransactionType {
    /**
     * A Payment transaction
     */
    Payment = 1,
    /**
     * A Key Registration transaction
     */
    KeyRegistration = 2,
    /**
     * An Asset Config transaction
     */
    AssetConfig = 3,
    /**
     * An Asset Transfer transaction
     */
    AssetTransfer = 4,
    /**
     * An Asset Freeze transaction
     */
    AssetFreeze = 5,
    /**
     * An Application Call transaction
     */
    ApplicationCall = 6
}
import { biguint, BigUintCompat, BytesBacked, BytesCompat, StringCompat, uint64, Uint64Compat } from './primitives';
/**
 * Write one or more values to the transaction log.
 *
 * Each value is converted to bytes and concatenated
 * @param args The values to write
 */
export declare function log(...args: Array<Uint64Compat | BytesCompat | BigUintCompat | StringCompat | BytesBacked>): void;
/**
 * Asserts that `condition` is truthy, otherwise error and halt execution.
 * @param condition An expression that can be evaluated as truthy of falsy
 * @param message The message to show if `condition` is falsy and an error is raised.
 */
export declare function assert(condition: unknown, message?: string): asserts condition;
/**
 * Raise an error and halt execution
 * @param message The message to accompany the error
 */
export declare function err(message?: string): never;
/**
 * Defines possible comparison expressions for numeric types
 */
type NumericComparison<T> = T | {
    /**
     * Is the subject less than the specified value
     */
    lessThan: T;
} | {
    /**
     * Is the subject greater than the specified value
     */
    greaterThan: T;
} | {
    /**
     * Is the subject greater than or equal to the specified value
     */
    greaterThanEq: T;
} | {
    /**
     * Is the subject less than or equal to the specified value
     */
    lessThanEq: T;
} | {
    /**
     * Is the subject between the specified values (inclusive)
     */
    between: readonly [T, T];
} | {
    /**
     * Is the subject not equal to the specified value
     */
    not: T;
};
/**
 * Defines possible comparison expressions for non-numeric types
 */
type NonNumericComparison<T> = T | {
    /**
     * Is the subject not equal to the specified value
     */
    not: T;
};
/**
 * Returns compatible comparison expressions for a type `T`
 * @typeParam T The type requiring comparison
 */
type ComparisonFor<T> = T extends uint64 | biguint ? NumericComparison<T> : NonNumericComparison<T>;
/**
 * A set of tests to apply to the match subject
 * @typeParam T The type of the test subject
 */
type MatchTest<T> = T extends ConcatArray<infer TItem> ? {
    [index: number]: ComparisonFor<TItem>;
} & {
    length?: ComparisonFor<uint64>;
} : {
    [key in keyof T]?: ComparisonFor<T[key]>;
};
/**
 * Applies all tests in `test` against `subject` and returns a boolean indicating if they all pass
 * @param subject An object or tuple to be tested
 * @param test An object containing one or more tests to be applied to the subject
 * @typeParam T The type of the subject
 * @returns True if all tests pass, otherwise false
 */
export declare function match<T>(subject: T, test: MatchTest<T>): boolean;
/**
 *
 * Applies all tests in `test` against `subject` and asserts they all pass
 * @param subject An object or tuple to be tested
 * @param test An object containing one or more tests to be applied to the subject
 * @param message An optional message to show if the assertion fails
 * @typeParam T The type of the subject
 */
export declare function assertMatch<T>(subject: T, test: MatchTest<T>, message?: string): void;
/**
 * Defines the source of fees for the OpUp utility
 */
export declare enum OpUpFeeSource {
    /**
     * Only the excess fee (credit) on the outer group should be used (itxn.fee = 0)
     */
    GroupCredit = 0,
    /**
     * The app's account will cover all fees (itxn.fee = Global.minTxFee)
     */
    AppAccount = 1,
    /**
     * First the excess will be used, then remaining fees taken from the app account
     */
    Any = 2
}
/**
 * Ensure the available op code budget is greater than or equal to requiredBudget.
 *
 * This is done by adding AppCall itxns to the group to increase the available budget. These itxns must be paid for
 * by the caller or the application.
 * @param requiredBudget The total required budget
 * @param feeSource Which source to withdraw txn fees from.
 */
export declare function ensureBudget(requiredBudget: uint64, feeSource?: OpUpFeeSource): void;
/**
 * Generates an iterable sequence from 0...stop inclusive
 * @param stop The stop number of the sequence
 */
export declare function urange(stop: Uint64Compat): IterableIterator<uint64>;
/**
 * Generates an iterable sequence from start...stop inclusive
 * @param start The start number of the sequence
 * @param stop The stop number of the sequence
 */
export declare function urange(start: Uint64Compat, stop: Uint64Compat): IterableIterator<uint64>;
/**
 * Generates an iterable sequence from start...stop inclusive with increments of size step
 * @param start The start number of the sequence
 * @param stop The stop number of the sequence
 * @param step The step size of the sequence
 */
export declare function urange(start: Uint64Compat, stop: Uint64Compat, step: Uint64Compat): IterableIterator<uint64>;
/**
 * Defines a numeric range including all numbers between from and to
 */
export type NumberRange = {
    from: number;
    to: number;
};
/**
 * Creates a deep copy of the specified value
 * @param value The value to clone
 */
export declare function clone<T>(value: T): T;
/**
 * Performs validation to ensure the value is well-formed, errors if it is not
 * @param value The value to validate
 *
 */
export declare function validateEncoding<T>(value: T): void;
export {};
import { CompileContractOptions, CompiledContract } from '../compiled';
import { gtxn } from '../gtxn';
import { AnyFunction, ConstructorFor, InstanceMethod } from '../internal/typescript-helpers';
import { itxn } from '../itxn';
import { Contract } from './index';
/**
 * Defines txn fields that are available for a bare create application call.
 *
 * This is the regular application call fields minus:
 *  - appId: because the appId is not known when creating an application
 *  - appArgs: because a bare call cannot have arguments
 */
export type BareCreateApplicationCallFields = Omit<itxn.ApplicationCallFields, 'appId' | 'appArgs'>;
/**
 * Conditional type which given a group transaction type, returns the equivalent inner transaction
 * params type.
 */
export type GtxnToItxnFields<T extends gtxn.Transaction> = T extends gtxn.PaymentTxn ? itxn.PaymentItxnParams : T extends gtxn.KeyRegistrationTxn ? itxn.KeyRegistrationItxnParams : T extends gtxn.AssetConfigTxn ? itxn.AssetConfigItxnParams : T extends gtxn.AssetTransferTxn ? itxn.AssetTransferItxnParams : T extends gtxn.AssetFreezeTxn ? itxn.AssetFreezeItxnParams : T extends gtxn.ApplicationCallTxn ? itxn.ApplicationCallItxnParams : itxn.ItxnParams;
/**
 * Conditional type which given an application argument, returns the input type for that argument.
 *
 * The input type will usually be the original type apart from group transactions which will be substituted
 * with their equivalent inner transaction type.
 */
export type TypedApplicationArg<TArg> = TArg extends gtxn.Transaction ? GtxnToItxnFields<TArg> : TArg;
/**
 * Conditional type which maps a tuple of application arguments to a tuple of input types for specifying those arguments.
 */
export type TypedApplicationArgs<TArgs> = TArgs extends never ? unknown[] : TArgs extends [] ? [] : TArgs extends [infer TArg, ...infer TRest] ? readonly [TypedApplicationArg<TArg>, ...TypedApplicationArgs<TRest>] : never;
/**
 * Application call fields with `appArgs` replaced with an `args` property that is strongly typed to the actual arguments for the
 * given application call.
 */
export type TypedApplicationCallFields<TArgs> = Omit<itxn.ApplicationCallFields, 'appArgs'> & (TArgs extends [] ? {
    readonly args?: TypedApplicationArgs<TArgs>;
} : {
    readonly args: TypedApplicationArgs<TArgs>;
});
/**
 * The response type of a typed application call. Includes the raw itxn result object and the parsed ABI return value if applicable.
 */
export type TypedApplicationCallResponse<TReturn> = TReturn extends void ? {
    readonly itxn: itxn.ApplicationCallInnerTxn;
} : {
    readonly itxn: itxn.ApplicationCallInnerTxn;
    readonly returnValue: TReturn;
};
/**
 * Conditional type which maps an ABI method to a factory method for constructing an application call transaction to call that method.
 */
export type ContractProxyMethod<TMethod> = TMethod extends (...args: infer TArgs) => infer TReturn ? (fields?: TypedApplicationCallFields<TArgs>) => TypedApplicationCallResponse<TReturn> : never;
/**
 * Conditional type which maps an ARC4 compatible contract to a proxy object which allows for constructing application call transactions for
 * all available ABI and bare methods. Also includes the compiled contract result data.
 */
export type ContractProxy<TContract extends Contract> = CompiledContract & {
    /**
     * Get methods for calling ABI and bare methods on the target contract
     */
    call: {
        [key in keyof TContract as key extends 'approvalProgram' | 'clearStateProgram' ? never : TContract[key] extends AnyFunction ? key : never]: ContractProxyMethod<TContract[key]>;
    };
    /**
     * Create a bare application call itxn to create the contract.
     * @param fields Specify values for transaction fields which should override the default values.
     */
    bareCreate(fields?: BareCreateApplicationCallFields): itxn.ApplicationCallInnerTxn;
};
/**
 * Pre compile the target ARC4 contract and return a proxy object for constructing inner transactions to call an instance of that contract.
 * @param contract An ARC4 contract class
 * @param options Compile contract arguments
 */
export declare function compileArc4<TContract extends Contract>(contract: ConstructorFor<TContract>, options?: CompileContractOptions): ContractProxy<TContract>;
export interface AbiCallOptions<TMethod> extends Omit<itxn.ApplicationCallFields, 'appArgs'> {
    readonly method?: TMethod;
    readonly args?: TMethod extends InstanceMethod<Contract, infer TParams> ? TypedApplicationArgs<TParams> : unknown[];
}
export type AbiCallResponse<TMethod> = TMethod extends InstanceMethod<Contract, infer TParams, infer TResult> ? TypedApplicationCallResponse<TResult> : TypedApplicationCallResponse<unknown>;
/**
 * Invokes the target ABI method using a strongly typed fields object.
 * @param options Specify options for the abi call.
 */
export declare function abiCall<TMethod>(options: AbiCallOptions<TMethod>): AbiCallResponse<TMethod>;
import { biguint, BigUintCompat, bytes, BytesBacked, StringCompat, uint64, Uint64Compat } from '../primitives';
import { Account } from '../reference';
/**
 * Defines UintN bit sizes which are compatible with the uint64 type
 */
type UintBitSize = 8 | 16 | 24 | 32 | 40 | 48 | 56 | 64;
/**
 * Defines UintN bit sizes which are only compatible with the biguint type
 */
type BigUintBitSize = 72 | 80 | 88 | 96 | 104 | 112 | 120 | 128 | 136 | 144 | 152 | 160 | 168 | 176 | 184 | 192 | 200 | 208 | 216 | 224 | 232 | 240 | 248 | 256 | 264 | 272 | 280 | 288 | 296 | 304 | 312 | 320 | 328 | 336 | 344 | 352 | 360 | 368 | 376 | 384 | 392 | 400 | 408 | 416 | 424 | 432 | 440 | 448 | 456 | 464 | 472 | 480 | 488 | 496 | 504 | 512;
/**
 * Defines supported bit sizes for the UintN and UFixed types
 */
export type BitSize = UintBitSize | BigUintBitSize;
/**
 * Conditional type which returns the compat type relevant to a given UintN bit size
 */
type CompatForArc4Int<N extends BitSize> = N extends UintBitSize ? Uint64Compat : BigUintCompat;
/**
 * @hidden
 */
declare const TypeProperty: unique symbol;
/**
 * A base type for ARC4 encoded values
 */
export declare abstract class ARC4Encoded implements BytesBacked {
    /**
     * @hidden
     *
     * Since TypeScript is structurally typed, different ARC4Encodeds with compatible
     * structures will often be assignable to one and another and this is generally
     * not desirable. The TypeProperty property should be used to declare a literal value
     * (usually the class name) on each distinct ARC4Encoded class to ensure they are
     * structurally different.
     */
    abstract [TypeProperty]?: string;
    /**
     * Retrieve the encoded bytes for this type
     */
    get bytes(): bytes;
}
/**
 * A utf8 encoded string prefixed with its length expressed as a 2 byte uint
 */
export declare class Str extends ARC4Encoded {
    /** @hidden */
    [TypeProperty]?: 'arc4.Str';
    /**
     * Create a new Str instance
     * @param s The native string to initialize this Str from
     */
    constructor(s?: StringCompat);
    /**
     * Retrieve the decoded native string
     */
    get native(): string;
}
/**
 * A fixed bit size unsigned int
 */
export declare class Uint<N extends BitSize> extends ARC4Encoded {
    /** @hidden */
    [TypeProperty]?: `arc4.Uint<${N}>`;
    /**
     * Create a new UintN instance
     * @param v The native uint64 or biguint value to initialize this UintN from
     */
    constructor(v?: CompatForArc4Int<N>);
    /**
     * Retrieve the decoded native uint64
     */
    asUint64(): uint64;
    /**
     * Retrieve the decoded native biguint
     */
    asBigUint(): biguint;
}
/**
 * An alias for Uint<8>
 */
export declare class Byte extends Uint<8> {
}
/**
 * An alias for Uint<8>
 */
export declare class Uint8 extends Uint<8> {
}
/**
 * An alias for Uint<16>
 */
export declare class Uint16 extends Uint<16> {
}
/**
 * An alias for Uint<32>
 */
export declare class Uint32 extends Uint<32> {
}
/**
 * An alias for Uint<64>
 */
export declare class Uint64 extends Uint<64> {
}
/**
 * An alias for Uint<128>
 */
export declare class Uint128 extends Uint<128> {
}
/**
 * An alias for Uint<256>
 */
export declare class Uint256 extends Uint<256> {
}
/**
 * A fixed bit size, fixed decimal unsigned value
 */
export declare class UFixed<N extends BitSize, M extends number> extends ARC4Encoded {
    /** @hidden */
    [TypeProperty]?: `arc4.UFixed<${N}x${M}>`;
    /**
     * Create a new UFixed value
     * @param v A string representing the integer and fractional portion of the number
     */
    constructor(v?: `${number}.${number}`);
}
/**
 * A boolean value
 */
export declare class Bool extends ARC4Encoded {
    /** @hidden */
    [TypeProperty]?: 'arc4.Bool';
    /**
     * Create a new Bool value
     * @param v The native boolean to initialize this value from
     */
    constructor(v?: boolean);
    /**
     * Get the decoded native boolean for this value
     */
    get native(): boolean;
}
/**
 * A base type for arc4 array types
 */
declare abstract class Arc4ArrayBase<TItem extends ARC4Encoded> extends ARC4Encoded implements ConcatArray<TItem> {
    protected constructor();
    /**
     * Returns the current length of this array
     */
    get length(): uint64;
    /**
     * Returns the item at the given index.
     * Negative indexes are taken from the end.
     * @param index The index of the item to retrieve
     */
    at(index: Uint64Compat): TItem;
    /** @deprecated Array slicing is not yet supported in Algorand TypeScript
     * Create a new Dynamic array with all items from this array
     */
    slice(): Array<TItem>;
    /** @deprecated Array slicing is not yet supported in Algorand TypeScript
     * Create a new DynamicArray with all items up till `end`.
     * Negative indexes are taken from the end.
     * @param end An index in which to stop copying items.
     */
    slice(end: Uint64Compat): Array<TItem>;
    /** @deprecated Array slicing is not yet supported in Algorand TypeScript
     * Create a new DynamicArray with items from `start`, up until `end`
     * Negative indexes are taken from the end.
     * @param start An index in which to start copying items.
     * @param end An index in which to stop copying items
     */
    slice(start: Uint64Compat, end: Uint64Compat): Array<TItem>;
    /**
     * Creates a string by concatenating all the items in the array delimited by the
     * specified separator (or ',' by default)
     * @param separator
     * @deprecated Join is not supported in Algorand TypeScript
     */
    join(separator?: string): string;
    /**
     * Returns an iterator for the items in this array
     */
    [Symbol.iterator](): IterableIterator<TItem>;
    /**
     * Returns an iterator for a tuple of the indexes and items in this array
     */
    entries(): IterableIterator<readonly [uint64, TItem]>;
    /**
     * Returns an iterator for the indexes in this array
     */
    keys(): IterableIterator<uint64>;
    /**
     * Get or set the item at the specified index.
     * Negative indexes are not supported
     */
    [index: uint64]: TItem;
}
/**
 * A fixed sized array of arc4 items
 * @typeParam TItem The type of a single item in the array
 * @typeParam TLength The fixed length of the array
 */
export declare class StaticArray<TItem extends ARC4Encoded, TLength extends number> extends Arc4ArrayBase<TItem> {
    /** @hidden */
    [TypeProperty]?: `arc4.StaticArray<${TItem[typeof TypeProperty]}, ${TLength}>`;
    /**
     * Create a new StaticArray instance
     */
    constructor();
    /**
     * Create a new StaticArray instance with the specified items
     * @param items The initial items for the array
     */
    constructor(...items: TItem[] & {
        length: TLength;
    });
    /**
     * Returns a new array containing all items from _this_ array, and _other_ array
     * @param other Another array to concat with this one
     */
    concat(other: Arc4ArrayBase<TItem>): DynamicArray<TItem>;
    /**
     * Returns the statically declared length of this array
     */
    get length(): uint64;
}
/**
 * A dynamic sized array of arc4 items
 * @typeParam TItem The type of a single item in the array
 */
export declare class DynamicArray<TItem extends ARC4Encoded> extends Arc4ArrayBase<TItem> {
    /** @hidden */
    [TypeProperty]?: `arc4.DynamicArray<${TItem[typeof TypeProperty]}>`;
    /**
     * Create a new DynamicArray with the specified items
     * @param items The initial items for the array
     */
    constructor(...items: TItem[]);
    /**
     * Push a number of items into this array
     * @param items The items to be added to this array
     */
    push(...items: TItem[]): void;
    /**
     * Pop a single item from this array
     */
    pop(): TItem;
    /**
     * Returns a new array containing all items from _this_ array, and _other_ array
     * @param other Another array to concat with this one
     */
    concat(other: Arc4ArrayBase<TItem>): DynamicArray<TItem>;
}
/**
 * @hidden
 */
type ExpandTupleType<T extends readonly ARC4Encoded[]> = T extends [infer T1 extends ARC4Encoded, ...infer TRest extends ARC4Encoded[]] ? TRest extends [] ? `${T1[typeof TypeProperty]}` : `${T1[typeof TypeProperty]},${ExpandTupleType<TRest>}` : '';
/**
 * An arc4 encoded tuple of values
 * @typeParam TTuple A type representing the native tuple of item types
 */
export declare class Tuple<const TTuple extends readonly [ARC4Encoded, ...ARC4Encoded[]]> extends ARC4Encoded {
    /** @hidden */
    [TypeProperty]?: `arc4.Tuple<${ExpandTupleType<TTuple>}>`;
    /**
     * Create a new Tuple with the default zero values for items
     */
    constructor();
    /**
     * Create a new Tuple with the specified items
     * @param items The tuple items
     */
    constructor(...items: TTuple);
    /**
     * Returns the item at the specified index
     * @param index The index of the item to get. Must be a positive literal representing a tuple index
     */
    at<TIndex extends keyof TTuple>(index: TIndex): TTuple[TIndex];
    /**
     * Returns the length of this tuple
     */
    get length(): TTuple['length'] & uint64;
    /**
     * Returns the decoded native tuple (with arc4 encoded items)
     */
    get native(): TTuple;
}
/**
 * A 32 byte Algorand Address
 */
export declare class Address extends Arc4ArrayBase<Byte> {
    /** @hidden */
    [TypeProperty]?: 'arc4.Address';
    /**
     * Create a new Address instance
     * @param value An Account, base 32 address string, or the address bytes
     */
    constructor(value?: Account | string | bytes);
    /**
     * Returns an Account instance for this Address
     */
    get native(): Account;
}
/**
 * The base type for arc4 structs
 */
declare class StructBase<T> extends ARC4Encoded {
    /** @hidden */
    [TypeProperty]?: 'arc4.Struct';
    get native(): T;
}
/**
 * Type alias for the Struct constructor function
 * @typeParam T The shape of the arc4 struct
 */
type StructConstructor = {
    new <T extends Record<string, ARC4Encoded>>(initial: T): StructBase<T> & T;
};
/**
 * The base type of arc4 structs
 *
 * Usage:
 * ```
 * class MyStruct extends Struct<{ x: Uint8, y: Str, z: DynamicBytes }> { }
 * ```
 */
export declare const Struct: StructConstructor;
/**
 * A variable length sequence of bytes prefixed with its length expressed as a 2 byte uint
 */
export declare class DynamicBytes extends Arc4ArrayBase<Byte> {
    /** @hidden */
    [TypeProperty]?: 'arc4.DynamicBytes';
    /**
     * Create a new DynamicBytes instance
     * @param value The bytes or utf8 interpreted string to initialize this type
     */
    constructor(value?: bytes | string);
    /**
     * Get the native bytes value (excludes the length prefix)
     */
    get native(): bytes;
    /**
     * Returns a dynamic bytes object containing all bytes from _this_ and _other_
     * @param other Another array of bytes to concat with this one
     */
    concat(other: Arc4ArrayBase<Byte>): DynamicBytes;
}
/**
 * A fixed length sequence of bytes
 */
export declare class StaticBytes<TLength extends uint64 = 0> extends Arc4ArrayBase<Byte> {
    /** @hidden */
    [TypeProperty]?: `arc4.StaticBytes<${TLength}>`;
    /**
     * Create a new StaticBytes instance from native fixed sized bytes
     * @param value The bytes
     */
    constructor(value: bytes<TLength>);
    /**
     * Create a new StaticBytes instance from native bytes
     * @param value The bytes
     */
    constructor(value: bytes);
    /**
     * Create a new StaticBytes instance from a utf8 string
     * @param value A string
     */
    constructor(value: string);
    /**
     * Create a new StaticBytes instance of length 0
     */
    constructor();
    /**
     * Get the native bytes value
     */
    get native(): bytes<TLength>;
    /**
     * Returns a dynamic bytes object containing all bytes from _this_ and _other_
     * @param other Another array of bytes to concat with this one
     */
    concat(other: Arc4ArrayBase<Byte>): DynamicBytes;
    /**
     * Returns the statically declared length of this byte array
     */
    get length(): uint64;
}
export {};
import { BaseContract } from '../base-contract';
import { AnyFunction, DeliberateAny, InstanceMethod } from '../internal/typescript-helpers';
import { OnCompleteActionStr } from '../on-complete-action';
import { bytes, BytesCompat, uint64 } from '../primitives';
import { ARC4Encoded } from './encoded-types';
export * from './c2c';
export * from './encoded-types';
/**
 * The base type for all ARC4 contracts in Algorand TypeScript
 */
export declare class Contract extends BaseContract {
    /**
     * Default implementation of an ARC4 approval program, routes transactions to ABI or bare methods based on application
     * args and on completion actions
     */
    approvalProgram(): boolean;
}
/**
 * Defines conventional routing method names. When used, methods with these names will be implicitly routed to the corresponding
 * application lifecycle event.
 *
 * @remarks This behaviour is independent of a contract explicitly implementing this interface. The interface is provided simply to improve
 * the developer experience of using this feature.
 */
export interface ConventionalRouting {
    /**
     * The function to invoke when closing out of this application
     */
    closeOutOfApplication?: AnyFunction;
    /**
     * The function to invoke when creating this application
     */
    createApplication?: AnyFunction;
    /**
     * The function to invoke when deleting this application
     */
    deleteApplication?: AnyFunction;
    /**
     * The function to invoke when opting in to this application
     */
    optInToApplication?: AnyFunction;
    /**
     * The function to invoke when updating this application
     */
    updateApplication?: AnyFunction;
}
/**
 * The possible options for a method being available on application create
 *
 * allow: This method CAN be called when the application is being created, but it is not required
 * disallow: This method CANNOT be called when the application is being created
 * require: This method CAN ONLY be called when the application is being created
 */
export type CreateOptions = 'allow' | 'disallow' | 'require';
/**
 * The possible options for the resource encoding to use for the method
 *
 * index: Application, Asset, and Account arguments are included in the transaction's relevant array. The argument value is the uint8 index of the resource in the that array.
 * value: Application, Asset and Account arguments are passed by their uint64 id (Application and Asset) or bytes[32] address (Account).
 */
export type ResourceEncodingOptions = 'index' | 'value';
/**
 * The possible options for validation behaviour for this method
 * args: ABI arguments are validated automatically to ensure they are encoded correctly.
 * unsafe-disabled: No automatic validation occurs. Arguments can instead be validated manually.
 */
export type ValidateEncodingOptions = 'unsafe-disabled' | 'args';
/**
 * Type alias for a default argument schema
 * @typeParam TContract The type of the contract containing the method this default argument is for
 */
export type DefaultArgument<TContract extends Contract> = {
    /**
     * A compile time constant value to be used as a default
     */
    constant: string | boolean | number | bigint;
} | {
    /**
     * Retrieve the default value from a member of this contract. The member can be
     *
     * LocalState: The value is retrieved from the calling user's local state before invoking this method
     * GlobalState: The value is retrieved from the specified global state key before invoking this method
     * Method: Any readonly abimethod with no arguments can be used as a source
     */
    from: keyof TContract;
};
/**
 * Configuration options for an abi method
 * @typeParam TContract the type of the contract this method is a part of
 */
export type AbiMethodConfig<TContract extends Contract> = {
    /**
     * Which on complete action(s) are allowed when invoking this method.
     * @default 'NoOp'
     */
    allowActions?: OnCompleteActionStr | OnCompleteActionStr[];
    /**
     * Whether this method should be callable when creating the application.
     * @default 'disallow'
     */
    onCreate?: CreateOptions;
    /**
     * Does the method only perform read operations (no mutation of chain state)
     * @default false
     */
    readonly?: boolean;
    /**
     * Override the name used to generate the abi method selector
     */
    name?: string;
    /**
     * The resource encoding to use for this method. The default is 'value'
     *
     * index: Application, Asset, and Account arguments are included in the transaction's relevant array. The argument value is the uint8 index of the resource in the that array.
     * value: Application, Asset and Account arguments are passed by their uint64 id (Application and Asset) or bytes[32] address (Account).
     *
     * The resource must still be 'available' to this transaction but can take advantage of resource sharing within the transaction group.
     */
    resourceEncoding?: ResourceEncodingOptions;
    /**
     * Controls validation behaviour for this method.
     *
     * If "args", then ABI arguments are validated automatically to ensure they are encoded correctly.
     * If "unsafe-disabled", then no automatic validation occurs. Arguments can instead be validated using the validateEncoding(...) function.
     * The default behaviour of this option can be controlled with the --validate-abi-args CLI flag.
     */
    validateEncoding?: ValidateEncodingOptions;
    /**
     * Specify default arguments that can be populated by clients calling this method.
     *
     * A map of parameter names to the default argument source
     */
    defaultArguments?: Record<string, DefaultArgument<TContract>>;
};
/**
 * Declares the decorated method as an abimethod that is called when the first transaction arg matches the method selector
 * @param config The config for this abi method
 * @typeParam TContract the type of the contract this method is a part of
 */
export declare function abimethod<TContract extends Contract>(config?: AbiMethodConfig<TContract>): <TArgs extends DeliberateAny[], TReturn>(target: (this: TContract, ...args: TArgs) => TReturn, ctx: ClassMethodDecoratorContext<TContract>) => (this: TContract, ...args: TArgs) => TReturn;
/**
 * Declares this abi method does not mutate chain state and can be called using a simulate call to the same effect.
 *
 * Shorthand for `@abimethod({readonly: true})`
 * @typeParam TContract the type of the contract this method is a part of
 */
export declare function readonly<TContract extends Contract, TArgs extends DeliberateAny[], TReturn>(target: (this: TContract, ...args: TArgs) => TReturn, ctx: ClassMethodDecoratorContext<TContract>): (this: TContract, ...args: TArgs) => TReturn;
/**
 * Configuration options for a bare method
 */
export type BareMethodConfig = {
    /**
     * Which on complete action(s) are allowed when invoking this method.
     * @default 'NoOp'
     */
    allowActions?: OnCompleteActionStr | OnCompleteActionStr[];
    /**
     * Whether this method should be callable when creating the application.
     * @default 'disallow'
     */
    onCreate?: CreateOptions;
};
/**
 * Declares the decorated method as a baremethod that can only be called with no transaction args
 * @param config The config for this bare method
 * @typeParam TContract the type of the contract this method is a part of
 */
export declare function baremethod<TContract extends Contract>(config?: BareMethodConfig): <TArgs extends DeliberateAny[], TReturn>(target: (this: TContract, ...args: TArgs) => TReturn, ctx: ClassMethodDecoratorContext<TContract>) => (this: TContract, ...args: TArgs) => TReturn;
/**
 * Returns the ARC4 method selector for a given ARC4 method signature. The method selector is the first
 * 4 bytes of the SHA512/256 hash of the method signature.
 * @param methodSignature An ARC4 contract method reference. (Eg. `MyContract.prototype.myMethod`)
 * @returns The ARC4 method selector. Eg. `02BECE11`
 */
export declare function methodSelector(methodSignature: InstanceMethod<Contract>): bytes<4>;
/**
 * Returns the ARC4 method selector for a given ARC4 method signature. The method selector is the first
 * 4 bytes of the SHA512/256 hash of the method signature.
 * @param methodSignature An ARC4 method signature string (Eg. `hello(string)string`.  Must be a compile time constant)
 * @returns The ARC4 method selector. Eg. `02BECE11`
 */
export declare function methodSelector(methodSignature: string): bytes<4>;
/**
 * Interpret the provided bytes as an ARC4 encoded type
 * @param bytes An arc4 encoded bytes value
 * @param options Options for how the bytes should be converted
 * @param options.prefix The prefix (if any), present in the bytes value. This prefix will be validated and removed
 * @param options.strategy The strategy used for converting bytes.
 *         `unsafe-cast`: Reinterpret the value as an ARC4 encoded type without validation
 *         `validate`: Asserts the encoding of the raw bytes matches the expected type
 */
export declare function convertBytes<T extends ARC4Encoded>(bytes: BytesCompat, options: {
    prefix?: 'none' | 'log';
    strategy: 'unsafe-cast' | 'validate';
}): T;
/**
 * Decode the provided bytes to a native Algorand TypeScript value
 * @param bytes An arc4 encoded bytes value
 * @param prefix The prefix (if any), present in the bytes value. This prefix will be validated and removed
 */
export declare function decodeArc4<T>(bytes: BytesCompat, prefix?: 'none' | 'log'): T;
/**
 * Encode the provided Algorand TypeScript value as ARC4 bytes
 * @param value Any native Algorand TypeScript value with a supported ARC4 encoding
 */
export declare function encodeArc4<const T>(value: T): bytes;
/**
 * Return the total number of bytes required to store T as bytes.
 *
 * T must represent a type with a fixed length encoding scheme.
 * @typeParam T Any native or arc4 type with a fixed encoding size.
 */
export declare function sizeOf<T>(): uint64;
/**
 * This error can be used in stub implementations that are expected to be overridden
 * by the testing framework
 */
export declare class NoImplementation extends Error {
    constructor();
    static value<T>(): T;
}
export type DeliberateAny = any;
export type AnyFunction = (...args: DeliberateAny[]) => DeliberateAny;
export type ConstructorFor<T, TArgs extends DeliberateAny[] = DeliberateAny[]> = new (...args: TArgs) => T;
export type InstanceMethod<TClass, TArgs extends DeliberateAny[] = DeliberateAny[], TReturn = DeliberateAny> = (this: TClass, ...args: TArgs) => TReturn;
