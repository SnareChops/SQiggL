/// <reference path="ICondition.ts" />
var Main_1 = require('../Main');
var IsNotNull = (function () {
    function IsNotNull(variable) {
        this.variable = variable;
    }
    IsNotNull.create = function (statement) {
        var result = statement.match(IsNotNull.regex);
        if (!result)
            return null;
        return new IsNotNull(result[1]);
    };
    IsNotNull.prototype.result = function () {
        console.log(Main_1.variables);
        return Main_1.variables[this.variable] != null;
    };
    IsNotNull.regex = /\s*if\b\s+(.*?)\b\s*is\s*not\s*null\s*$/;
    return IsNotNull;
})();
exports.default = IsNotNull;
