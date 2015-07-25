var Action = (function () {
    function Action(definition) {
        this.definition = definition;
    }
    Action.prototype.matches = function (statement) {
        return this.definition.regex.test(statement);
    };
    Action.prototype.parse = function (command, statement, inner, variables) {
        this.command = command;
        this.inner = inner;
        var condition;
        for (var _i = 0, _a = this.definition.conditions; _i < _a.length; _i++) {
            condition = _a[_i];
            if (condition.matches(statement)) {
                this.condition = condition;
                this.condition.parse(statement, variables);
                return true;
            }
        }
        return false;
    };
    Action.prototype.perform = function (prev) {
        return this.definition.rule(this.command, this.condition, prev);
    };
    return Action;
})();
exports.default = Action;
