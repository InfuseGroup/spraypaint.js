"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = void 0;
var ValidationError = /** @class */ (function () {
    function ValidationError(options) {
        for (var key in options) {
            this[key] = options[key];
        }
    }
    return ValidationError;
}());
exports.ValidationError = ValidationError;
//# sourceMappingURL=validation-errors.js.map