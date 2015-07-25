var Command = (function () {
    function Command(index, length, statement, inner, scope, runner) {
        this.index = index;
        this.length = length;
        this.statement = statement;
        this.inner = inner;
        this.scope = scope;
        this.runner = runner;
        this.dependents = [];
    }
    Command.prototype.perform = function (prev) {
        return this.runner.perform(this, prev);
    };
    Command.prototype.replace = function (replacer) {
        this.result.text = replacer.replace(this.result.text, this.scope.variables);
    };
    Command.prototype.terminate = function () {
        return this.scope.commands.some(function (command) { return command.action.definition.terminator; })
            ? this.scope.commands.filter(function (command) { return command.action.definition.terminator; })[1].perform().result.text
            : '';
    };
    return Command;
})();
exports.default = Command;
