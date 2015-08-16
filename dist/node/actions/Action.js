// DO NOT PUT INSTANCE ITEMS IN THIS CLASS, DUMMY
var Action = (function () {
    function Action(definition) {
        this.definition = definition;
        if (!definition)
            throw 'Attempted to instatiate action without a definition';
    }
    Action.prototype.matches = function (statement) {
        return this.definition.regex.test(statement);
    };
    Action.prototype.parse = function (command) {
        var condition;
        for (var _i = 0, _a = this.definition.conditions; _i < _a.length; _i++) {
            condition = _a[_i];
            if (condition.matches(command.statement)) {
                command.condition = condition;
            }
        }
    };
    Action.prototype.perform = function (command, prev) {
        return this.definition.rule(command, prev);
    };
    return Action;
})();
exports.default = Action;
