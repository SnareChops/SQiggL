var Runner = (function () {
    function Runner(definition) {
        this.definition = definition;
        if (!definition)
            throw 'Attempted to instatiate runner without a definition';
    }
    Runner.prototype.parse = function (command) {
        var action;
        for (var _i = 0, _a = this.definition.actions; _i < _a.length; _i++) {
            action = _a[_i];
            if (action.matches(command.statement)) {
                command.action = action;
                command.action.parse(command);
            }
        }
    };
    Runner.prototype.perform = function (command, prev) {
        command.result = command.action.perform(command, prev).result;
        // command.result.dependent = command.scope.perform(command).result;
        var replacer;
        for (var _i = 0, _a = this.definition.replacers; _i < _a.length; _i++) {
            replacer = _a[_i];
            command.replace(replacer);
        }
        return command;
    };
    Runner.prototype.matches = function (text) {
        this.definition.regex.lastIndex = 0;
        return this.definition.regex.test(text);
    };
    return Runner;
})();
exports.default = Runner;
