var Scope = (function () {
    function Scope() {
        this.variables = {};
        this.commands = [];
        this.dependents = [];
    }
    Scope.prototype.perform = function () {
        var command, text = '';
        for (var _i = 0, _a = this.commands; _i < _a.length; _i++) {
            command = _a[_i];
            text += command.perform().result.text;
        }
        return text;
    };
    return Scope;
})();
exports.default = Scope;
