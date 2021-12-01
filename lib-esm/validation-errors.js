var ValidationError = /** @class */ (function () {
    function ValidationError(options) {
        for (var key in options) {
            this[key] = options[key];
        }
    }
    return ValidationError;
}());
export { ValidationError };
//# sourceMappingURL=validation-errors.js.map