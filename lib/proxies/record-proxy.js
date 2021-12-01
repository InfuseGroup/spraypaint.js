"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordProxy = void 0;
var RecordProxy = /** @class */ (function () {
    function RecordProxy(record, raw_json) {
        this._record = record;
        this._raw_json = raw_json;
    }
    Object.defineProperty(RecordProxy.prototype, "raw", {
        get: function () {
            return this._raw_json;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RecordProxy.prototype, "data", {
        get: function () {
            return this._record;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RecordProxy.prototype, "meta", {
        get: function () {
            return this.raw.meta || {};
        },
        enumerable: false,
        configurable: true
    });
    return RecordProxy;
}());
exports.RecordProxy = RecordProxy;
//# sourceMappingURL=record-proxy.js.map