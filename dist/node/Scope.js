var Scope = (function () {
    function Scope() {
        this.variables = {};
        this.commands = [];
        this.dependents = [];
    }
    Scope.prototype.perform = function (prev) {
        var command;
        for (var _i = 0, _a = this.commands; _i < _a.length; _i++) {
            command = _a[_i];
            prev = command.perform(prev);
        }
        return prev;
    };
    return Scope;
})();
exports.default = Scope;
