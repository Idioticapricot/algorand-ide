/**
 * This error can be used in stub implementations that are expected to be overridden
 * by the testing framework
 */
export declare class NoImplementation extends Error {
    constructor();
    static value<T>(): T;
}
