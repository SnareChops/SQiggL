/// <reference path="IAction.ts" />
/// <reference path="../conditions/ICondition.ts" />
var Conditions_1 = require('../Conditions');
var If = (function () {
    function If(statement, inner) {
        this.statement = statement;
        this.inner = inner;
        this.conditions = [Conditions_1.IsNotNull];
        this.condition = this.parseCondition(statement);
        console.log(this.condition.result());
    }
    If.prototype.parseCondition = function (statement) {
        for (var i = 0; i < this.conditions.length; i++) {
            var x = this.conditions[i].create(statement);
            if (x)
                return x;
        }
    };
    If.prototype.perform = function () {
        return '';
    };
    If.regex = /^\s*if\b/g;
    return If;
})();
exports.default = If;
