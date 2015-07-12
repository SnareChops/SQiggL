var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Condition_1 = require('./Condition');
var Modifiers_1 = require('../Modifiers');
/**
 * The == condition
 * @module Equal
 * @class
 * @implements {ICondition}
 * @param {string} variable         - Variable to test condition against
 * @param {IVariables} variables    - Variables within the scope of this condition
 * @property {string} variable      - Variable to test condition against
 * @property {IVariables} variables - Variables within the scope of this condition
 */
var Equal = (function (_super) {
    __extends(Equal, _super);
    function Equal(variable, variables, comparative, mod1, mod2) {
        _super.call(this);
        this.variable = variable;
        this.variables = variables;
        this.comparative = comparative;
        this.modifiers = [];
        this.modifiers = this.extractModifiers(Equal, mod1, mod2);
    }
    Equal.extract = function (statement, variables) {
        var match = statement.match(Equal.regex);
        if (match && match.length > 0)
            return new Equal(match[1], variables, match[4], match[2], match[3]);
        return null;
    };
    /**
     * @memberof Equal
     * @method
     * @public
     * @returns {boolean} Outcome of applying the condition to the variable
     */
    Equal.prototype.perform = function () {
        var result = this.variables[this.variable] === this.comparative;
        result = this.performModifiers(this.modifiers, result, this.variable, this.variables, this.comparative);
        return result;
    };
    /**
     * @memberof Equal
     * @static
     * @property {RegExp} The regex matcher
     */
    Equal.modifiers = [Modifiers_1.Not, Modifiers_1.OrEqual];
    Equal.regex = new RegExp("(\\w+)\\s+((?:" + Equal.mods(Equal) + "|\\s*))=((?:" + Equal.mods(Equal) + "|\\s*))\\s+(\\d+|[\"']\\w+[\"'])", 'i');
    return Equal;
})(Condition_1.default);
exports.default = Equal;
