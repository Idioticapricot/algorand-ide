import { N as NoImplementation } from './errors-Bg4n2Chz.js';

/**
 * The base type for all Algorand TypeScript contracts
 */
class BaseContract {
    /**
     * The program to be run when the On Completion Action is == ClearState (3)
     */
    clearStateProgram() {
        return true;
    }
}
/**
 * The contract decorator can be used to specify additional configuration options for a smart contract
 * @param options An object containing the configuration options
 */
function contract(options) {
    return (contract, ctx) => {
        throw new NoImplementation();
    };
}

/**
 * Pre compile the target ARC4 contract and return a proxy object for constructing inner transactions to call an instance of that contract.
 * @param contract An ARC4 contract class
 * @param options Compile contract arguments
 */
function compileArc4(contract, options) {
    throw new NoImplementation();
}
/**
 * Invokes the target ABI method using a strongly typed fields object.
 * @param options Specify options for the abi call.
 */
function abiCall(options) {
    throw new NoImplementation();
}

/**
 * @hidden
 */
const TypeProperty = Symbol('ARC4Type');
/**
 * A base type for ARC4 encoded values
 */
class ARC4Encoded {
    /**
     * Retrieve the encoded bytes for this type
     */
    get bytes() {
        throw new NoImplementation();
    }
}
/**
 * A utf8 encoded string prefixed with its length expressed as a 2 byte uint
 */
class Str extends ARC4Encoded {
    /** @hidden */
    [TypeProperty];
    /**
     * Create a new Str instance
     * @param s The native string to initialize this Str from
     */
    constructor(s) {
        super();
    }
    /**
     * Retrieve the decoded native string
     */
    get native() {
        throw new NoImplementation();
    }
}
/**
 * A fixed bit size unsigned int
 */
class Uint extends ARC4Encoded {
    /** @hidden */
    [TypeProperty];
    /**
     * Create a new UintN instance
     * @param v The native uint64 or biguint value to initialize this UintN from
     */
    constructor(v) {
        super();
    }
    /**
     * Retrieve the decoded native uint64
     */
    asUint64() {
        throw new NoImplementation();
    }
    /**
     * Retrieve the decoded native biguint
     */
    asBigUint() {
        throw new NoImplementation();
    }
}
/**
 * An alias for Uint<8>
 */
class Byte extends Uint {
}
/**
 * An alias for Uint<8>
 */
class Uint8 extends Uint {
}
/**
 * An alias for Uint<16>
 */
class Uint16 extends Uint {
}
/**
 * An alias for Uint<32>
 */
class Uint32 extends Uint {
}
/**
 * An alias for Uint<64>
 */
class Uint64 extends Uint {
}
/**
 * An alias for Uint<128>
 */
class Uint128 extends Uint {
}
/**
 * An alias for Uint<256>
 */
class Uint256 extends Uint {
}
/**
 * A fixed bit size, fixed decimal unsigned value
 */
class UFixed extends ARC4Encoded {
    /** @hidden */
    [TypeProperty];
    /**
     * Create a new UFixed value
     * @param v A string representing the integer and fractional portion of the number
     */
    constructor(v) {
        super();
    }
}
/**
 * A boolean value
 */
class Bool extends ARC4Encoded {
    /** @hidden */
    [TypeProperty];
    /**
     * Create a new Bool value
     * @param v The native boolean to initialize this value from
     */
    constructor(v) {
        super();
    }
    /**
     * Get the decoded native boolean for this value
     */
    get native() {
        throw new NoImplementation();
    }
}
/**
 * A base type for arc4 array types
 */
class Arc4ArrayBase extends ARC4Encoded {
    constructor() {
        super();
    }
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
     * Creates a string by concatenating all the items in the array delimited by the
     * specified separator (or ',' by default)
     * @param separator
     * @deprecated Join is not supported in Algorand TypeScript
     */
    join(separator) {
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
}
/**
 * A fixed sized array of arc4 items
 * @typeParam TItem The type of a single item in the array
 * @typeParam TLength The fixed length of the array
 */
class StaticArray extends Arc4ArrayBase {
    /** @hidden */
    [TypeProperty];
    constructor(...items) {
        super();
    }
    /**
     * Returns a new array containing all items from _this_ array, and _other_ array
     * @param other Another array to concat with this one
     */
    concat(other) {
        throw new NoImplementation();
    }
    /**
     * Returns the statically declared length of this array
     */
    get length() {
        throw new NoImplementation();
    }
}
/**
 * A dynamic sized array of arc4 items
 * @typeParam TItem The type of a single item in the array
 */
class DynamicArray extends Arc4ArrayBase {
    /** @hidden */
    [TypeProperty];
    /**
     * Create a new DynamicArray with the specified items
     * @param items The initial items for the array
     */
    constructor(...items) {
        super();
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
    /**
     * Returns a new array containing all items from _this_ array, and _other_ array
     * @param other Another array to concat with this one
     */
    concat(other) {
        throw new NoImplementation();
    }
}
/**
 * An arc4 encoded tuple of values
 * @typeParam TTuple A type representing the native tuple of item types
 */
class Tuple extends ARC4Encoded {
    /** @hidden */
    [TypeProperty];
    constructor(...items) {
        super();
    }
    /**
     * Returns the item at the specified index
     * @param index The index of the item to get. Must be a positive literal representing a tuple index
     */
    at(index) {
        throw new NoImplementation();
    }
    /**
     * Returns the length of this tuple
     */
    get length() {
        throw new NoImplementation();
    }
    /**
     * Returns the decoded native tuple (with arc4 encoded items)
     */
    get native() {
        throw new NoImplementation();
    }
}
/**
 * A 32 byte Algorand Address
 */
class Address extends Arc4ArrayBase {
    /** @hidden */
    [TypeProperty];
    /**
     * Create a new Address instance
     * @param value An Account, base 32 address string, or the address bytes
     */
    constructor(value) {
        super();
    }
    /**
     * Returns an Account instance for this Address
     */
    get native() {
        throw new NoImplementation();
    }
}
/**
 * The base type for arc4 structs
 */
class StructBase extends ARC4Encoded {
    /** @hidden */
    [TypeProperty];
    get native() {
        throw new NoImplementation();
    }
}
/**
 * The base type of arc4 structs
 *
 * Usage:
 * ```
 * class MyStruct extends Struct<{ x: Uint8, y: Str, z: DynamicBytes }> { }
 * ```
 */
const Struct = StructBase;
/**
 * A variable length sequence of bytes prefixed with its length expressed as a 2 byte uint
 */
class DynamicBytes extends Arc4ArrayBase {
    /** @hidden */
    [TypeProperty];
    /**
     * Create a new DynamicBytes instance
     * @param value The bytes or utf8 interpreted string to initialize this type
     */
    constructor(value) {
        super();
    }
    /**
     * Get the native bytes value (excludes the length prefix)
     */
    get native() {
        throw new NoImplementation();
    }
    /**
     * Returns a dynamic bytes object containing all bytes from _this_ and _other_
     * @param other Another array of bytes to concat with this one
     */
    concat(other) {
        throw new NoImplementation();
    }
}
/**
 * A fixed length sequence of bytes
 */
class StaticBytes extends Arc4ArrayBase {
    /** @hidden */
    [TypeProperty];
    constructor(value) {
        super();
    }
    /**
     * Get the native bytes value
     */
    get native() {
        throw new NoImplementation();
    }
    /**
     * Returns a dynamic bytes object containing all bytes from _this_ and _other_
     * @param other Another array of bytes to concat with this one
     */
    concat(other) {
        throw new NoImplementation();
    }
    /**
     * Returns the statically declared length of this byte array
     */
    get length() {
        throw new NoImplementation();
    }
}

/**
 * The base type for all ARC4 contracts in Algorand TypeScript
 */
class Contract extends BaseContract {
    /**
     * Default implementation of an ARC4 approval program, routes transactions to ABI or bare methods based on application
     * args and on completion actions
     */
    approvalProgram() {
        throw new NoImplementation();
    }
}
/**
 * Declares the decorated method as an abimethod that is called when the first transaction arg matches the method selector
 * @param config The config for this abi method
 * @typeParam TContract the type of the contract this method is a part of
 */
function abimethod(config) {
    return function (target, ctx) {
        throw new NoImplementation();
    };
}
/**
 * Declares this abi method does not mutate chain state and can be called using a simulate call to the same effect.
 *
 * Shorthand for `@abimethod({readonly: true})`
 * @typeParam TContract the type of the contract this method is a part of
 */
function readonly(target, ctx) {
    throw new NoImplementation();
}
/**
 * Declares the decorated method as a baremethod that can only be called with no transaction args
 * @param config The config for this bare method
 * @typeParam TContract the type of the contract this method is a part of
 */
function baremethod(config) {
    return function (target, ctx) {
        throw new NoImplementation();
    };
}
function methodSelector(methodSignature) {
    throw new NoImplementation();
}
/**
 * Interpret the provided bytes as an ARC4 encoded type
 * @param bytes An arc4 encoded bytes value
 * @param options Options for how the bytes should be converted
 * @param options.prefix The prefix (if any), present in the bytes value. This prefix will be validated and removed
 * @param options.strategy The strategy used for converting bytes.
 *         `unsafe-cast`: Reinterpret the value as an ARC4 encoded type without validation
 *         `validate`: Asserts the encoding of the raw bytes matches the expected type
 */
function convertBytes(bytes, options) {
    throw new NoImplementation();
}
/**
 * Decode the provided bytes to a native Algorand TypeScript value
 * @param bytes An arc4 encoded bytes value
 * @param prefix The prefix (if any), present in the bytes value. This prefix will be validated and removed
 */
function decodeArc4(bytes, prefix = 'none') {
    throw new NoImplementation();
}
/**
 * Encode the provided Algorand TypeScript value as ARC4 bytes
 * @param value Any native Algorand TypeScript value with a supported ARC4 encoding
 */
function encodeArc4(value) {
    throw new NoImplementation();
}
/**
 * Return the total number of bytes required to store T as bytes.
 *
 * T must represent a type with a fixed length encoding scheme.
 * @typeParam T Any native or arc4 type with a fixed encoding size.
 */
function sizeOf() {
    throw new NoImplementation();
}

var index = /*#__PURE__*/Object.freeze({
    __proto__: null,
    ARC4Encoded: ARC4Encoded,
    Address: Address,
    Bool: Bool,
    Byte: Byte,
    Contract: Contract,
    DynamicArray: DynamicArray,
    DynamicBytes: DynamicBytes,
    StaticArray: StaticArray,
    StaticBytes: StaticBytes,
    Str: Str,
    Struct: Struct,
    Tuple: Tuple,
    UFixed: UFixed,
    Uint: Uint,
    Uint128: Uint128,
    Uint16: Uint16,
    Uint256: Uint256,
    Uint32: Uint32,
    Uint64: Uint64,
    Uint8: Uint8,
    abiCall: abiCall,
    abimethod: abimethod,
    baremethod: baremethod,
    compileArc4: compileArc4,
    convertBytes: convertBytes,
    decodeArc4: decodeArc4,
    encodeArc4: encodeArc4,
    methodSelector: methodSelector,
    readonly: readonly,
    sizeOf: sizeOf
});

export { ARC4Encoded as A, BaseContract as B, Contract as C, DynamicArray as D, Str as S, Tuple as T, Uint as U, abimethod as a, baremethod as b, contract as c, convertBytes as d, decodeArc4 as e, encodeArc4 as f, compileArc4 as g, abiCall as h, index as i, Byte as j, Uint8 as k, Uint16 as l, methodSelector as m, Uint32 as n, Uint64 as o, Uint128 as p, Uint256 as q, readonly as r, sizeOf as s, UFixed as t, Bool as u, StaticArray as v, Address as w, Struct as x, DynamicBytes as y, StaticBytes as z };
//# sourceMappingURL=index-C_DRi4sH.js.map
