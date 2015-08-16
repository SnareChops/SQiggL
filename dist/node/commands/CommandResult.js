var CommandResult = (function () {
    function CommandResult(text, passed) {
        this.text = text;
        this.passed = passed;
    }
    return CommandResult;
})();
exports.default = CommandResult;
