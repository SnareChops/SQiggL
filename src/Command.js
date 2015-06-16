/// <reference path="actions/IAction.ts" />
/// <reference path="IVariables.ts" />
var Actions_1 = require('./Actions');
var Replacers_1 = require('./Replacers');
var Command = (function () {
    function Command(index, statement, inner, variables) {
        this.index = index;
        this.statement = statement;
        this.inner = inner;
        this.variables = variables;
        this.actions = [Actions_1.If];
        this.replacers = [Replacers_1.VariableReplacer];
        console.log('Command statement: ' + statement);
        console.log('Command inner: ' + inner);
        this.action = this.extract(statement, inner, variables);
    }
    Command.prototype.extract = function (statement, inner, variables) {
        for (var _i = 0, _a = this.actions; _i < _a.length; _i++) {
            var action = _a[_i];
            if (action.regex.test(this.statement))
                return new action(statement, inner, variables);
        }
        return null;
    };
    Command.prototype.perform = function () {
        var result = this.action.perform();
        for (var _i = 0, _a = this.replacers; _i < _a.length; _i++) {
            var replacer = _a[_i];
            result = replacer.replace(result, this.variables);
        }
        return result;
    };
    Command.regex = /{{%(.*?)%}}(.*?)(?=(?:{{%|$))/g;
    return Command;
})();
exports.default = Command;
