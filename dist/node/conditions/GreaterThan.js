var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Condition_1 = require('./Condition');
var Modifiers_1 = require('../Modifiers');
/**
 * The > condition
 * @module GreaterThan
 * @class
 * @implements {ICondition}
 * @param {string} variable         - Variable to test condition against
 * @param {IVariables} variables    - Variables within the scope of this condition
 * @property {string} variable      - Variable to test condition against
 * @property {IVariables} variables - Variables within the scope of this condition
 */
var GreaterThan = (function (_super) {
    __extends(GreaterThan, _super);
    function GreaterThan(variable, variables, comparative, mod1, mod2) {
        _super.call(this);
        this.variable = variable;
        this.variables = variables;
        this.comparative = comparative;
        this.modifiers = [];
        this.modifiers = _super.prototype.extractModifiers.call(this, GreaterThan, mod1, mod2);
    }
    GreaterThan.extract = function (statement, variables) {
        var match = statement.match(GreaterThan.regex);
        if (match && match.length > 0)
            return new GreaterThan(match[1], variables, match[4], match[2], match[3]);
        return null;
    };
    /**
     * @memberof GreaterThan
     * @method
     * @public
     * @returns {boolean} Outcome of applying the condition to the variable
     */
    GreaterThan.prototype.perform = function () {
        var result = parseInt(this.variables[this.variable]) > parseInt(this.comparative);
        result = this.performModifiers(this.modifiers, result, this.variable, this.variables, this.comparative);
        return result;
    };
    /**
     * @memberof GreaterThan
     * @static
     * @property {RegExp} The regex matcher
     */
    GreaterThan.modifiers = [Modifiers_1.Not, Modifiers_1.OrEqual];
    GreaterThan.regex = new RegExp("(\\w+)\\s+((?:" + GreaterThan.mods(GreaterThan) + "|\\s*))>((?:" + GreaterThan.mods(GreaterThan) + "|\\s*))\\s+(\\d+)", 'i');
    return GreaterThan;
})(Condition_1.default);
exports.default = GreaterThan;
