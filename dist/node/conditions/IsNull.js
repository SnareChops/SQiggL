var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Modifiers_1 = require('../Modifiers');
var Condition_1 = require('./Condition');
/**
 * The Is Null condition
 * @module IsNull
 * @class
 * @implements {ICondition}
 * @param {string} variable         - Variable to test condition against
 * @param {IVariables} variables    - Variables within the scope of this condition
 * @property {string} variable      - Variable to test condition against
 * @property {IVariables} variables - Variables within the scope of this condition
 */
var IsNull = (function (_super) {
    __extends(IsNull, _super);
    function IsNull(variable, variables, comparative, mod1, mod2) {
        _super.call(this);
        this.variable = variable;
        this.variables = variables;
        this.comparative = comparative;
        this.modifiers = [];
        this.modifiers = _super.prototype.extractModifiers.call(this, IsNull, mod1, mod2);
    }
    IsNull.extract = function (statement, variables) {
        var match = statement.match(IsNull.regex);
        if (match && match.length > 0)
            return new IsNull(match[1], variables, null, match[2], null);
        return null;
    };
    /**
     * @memberof IsNull
     * @method
     * @public
     * @returns {boolean} Outcome of applying the condition to the variable
     */
    IsNull.prototype.perform = function () {
        var result = this.variables[this.variable] == null;
        result = this.performModifiers(this.modifiers, result, this.variable, this.variables, this.comparative);
        return result;
    };
    /**
     * @memberof IsNull
     * @static
     * @property {RegExp} The regex matcher
     */
    IsNull.modifiers = [Modifiers_1.Not];
    IsNull.regex = new RegExp("(\\w+)\\s+is\\s+((?:" + IsNull.mods(IsNull) + "|\\s*))null\\s*", 'i');
    return IsNull;
})(Condition_1.default);
exports.default = IsNull;
