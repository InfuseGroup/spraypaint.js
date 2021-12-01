import { __awaiter, __generator } from "tslib";
function asyncForEach(array, callback) {
    return __awaiter(this, void 0, void 0, function () {
        var index;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    index = 0;
                    _a.label = 1;
                case 1:
                    if (!(index < array.length)) return [3 /*break*/, 4];
                    return [4 /*yield*/, callback(array[index], index, array)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    index += 1;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
var MiddlewareStack = /** @class */ (function () {
    function MiddlewareStack(before, after) {
        if (before === void 0) { before = []; }
        if (after === void 0) { after = []; }
        this._beforeFilters = [];
        this._afterFilters = [];
        this._beforeFilters = before;
        this._afterFilters = after;
    }
    Object.defineProperty(MiddlewareStack.prototype, "beforeFilters", {
        get: function () {
            return this._beforeFilters;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MiddlewareStack.prototype, "afterFilters", {
        get: function () {
            return this._afterFilters;
        },
        enumerable: false,
        configurable: true
    });
    MiddlewareStack.prototype.beforeFetch = function (requestUrl, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, asyncForEach(this._beforeFilters, function (filter) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, filter(requestUrl, options)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MiddlewareStack.prototype.afterFetch = function (response, json) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, asyncForEach(this._afterFilters, function (filter) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, filter(response, json)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return MiddlewareStack;
}());
export { MiddlewareStack };
//# sourceMappingURL=middleware-stack.js.map