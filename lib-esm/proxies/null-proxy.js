var NullProxy = /** @class */ (function () {
    function NullProxy(raw_json) {
        this._raw_json = raw_json;
    }
    Object.defineProperty(NullProxy.prototype, "raw", {
        get: function () {
            return this._raw_json;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NullProxy.prototype, "data", {
        get: function () {
            return null;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NullProxy.prototype, "meta", {
        get: function () {
            return this.raw.meta || {};
        },
        enumerable: false,
        configurable: true
    });
    return NullProxy;
}());
export { NullProxy };
//# sourceMappingURL=null-proxy.js.map