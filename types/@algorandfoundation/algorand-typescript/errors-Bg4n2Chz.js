/**
 * This error can be used in stub implementations that are expected to be overridden
 * by the testing framework
 */
class NoImplementation extends Error {
    constructor() {
        super([
            'This method is intentionally not implemented.',
            '\n\n',
            'If you are attempting to unit test your contract, check the configuration of your test transformer (see @algorandfoundation/algorand-typescript-testing)',
        ].join(''));
    }
    static value() {
        return new Proxy({}, {
            get() {
                throw new NoImplementation();
            },
            set() {
                throw new NoImplementation();
            },
            has() {
                throw new NoImplementation();
            },
        });
    }
}

export { NoImplementation as N };
//# sourceMappingURL=errors-Bg4n2Chz.js.map
