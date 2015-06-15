/// <reference path="actions/IAction.ts" />
/// <reference path="IVariables.ts" />
var Actions_1 = require('./Actions');
var Command = (function () {
    function Command(statement, inner, variables) {
        this.statement = statement;
        this.inner = inner;
        this.variables = variables;
        console.log('Command statement: ' + statement);
        console.log('Command inner: ' + inner);
        this.extract(statement, inner, variables);
    }
    Command.prototype.extract = function (statement, inner, variables) {
        if (Actions_1.If.regex.test(this.statement))
            this.action = new Actions_1.If(statement, inner, variables);
    };
    Command.regex = /{{%(.*?)%}}(.*?)(?=(?:{{%|$))/g;
    return Command;
})();
exports.default = Command;
