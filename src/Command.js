/// <reference path="actions/IAction.ts" />
var Actions_1 = require('./Actions');
var Command = (function () {
    function Command(statement, inner) {
        this.statement = statement;
        this.inner = inner;
        this.parse();
    }
    Command.prototype.parse = function () {
        if (Actions_1.If.regex.test(this.statement))
            this.action = new Actions_1.If(this.statement, this.inner);
    };
    Command.regex = /{{%(.*?)%}}(.*?)(?=(?:{{%|$))/g;
    return Command;
})();
exports.default = Command;
