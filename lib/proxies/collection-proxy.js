"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionProxy = void 0;
var CollectionProxy = /** @class */ (function () {
    function CollectionProxy(collection, raw_json) {
        if (raw_json === void 0) { raw_json = { data: [] }; }
        this._collection = collection;
        this._raw_json = raw_json;
    }
    Object.defineProperty(CollectionProxy.prototype, "raw", {
        get: function () {
            return this._raw_json;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CollectionProxy.prototype, "data", {
        get: function () {
            return this._collection;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CollectionProxy.prototype, "meta", {
        get: function () {
            return this.raw.meta || {};
        },
        enumerable: false,
        configurable: true
    });
    return CollectionProxy;
}());
exports.CollectionProxy = CollectionProxy;
//# sourceMappingURL=collection-proxy.js.map