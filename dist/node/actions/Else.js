var Errors_1 = require('../Errors');
/**
 * The Else action
 * @module Else
 * @class
 * @implements {@link IAction}
 * @param {Command} command             - Command that contains this action
 * @param {string} statement            - Statement that this should take action on
 * @param {string} inner                - Text that follows after this action until the next command
 * @param {IVariables} variables        - Variables within the scope of this action
 * @property {Command} command          - Command that contains this action
 * @property {string} statement         - Statement that this should take action on
 * @property {string} inner 			- Text that follows after this action until the next command
 * @property {IVariables} variables		- Variables within the scope of this action
 * @property {boolean} terminator 		- Defines if this action is a terminator
 * @property {IVariable} variable		- Variable that this should take action on depending on the result of the condition
 * @property {ICondition[]} conditions	- Array of conditions that this action supports (if any)
 * @property {ICondition} condition		- Condition that was found as a match for this action
 * @property {IAction[]} dependents		- Array of actions that are dependent on this action's result
 */
var Else = (function () {
    function Else(command, statement, inner, variables) {
        this.command = command;
        this.statement = statement;
        this.inner = inner;
        this.variables = variables;
        this.terminator = false;
    }
    /**
     * Checks for any known syntax errors regarding this action
     * @memberof Else
     * @method
     * @public
     * @returns {string | null} The caught error if any
     */
    Else.prototype.validate = function () {
        if (!this.supporter)
            return Errors_1.default.IncorrectStatement(this, this.statement);
    };
    /**
     * Perform the action and return the result.
     * @memberof Else
     * @method
     * @public
     * @param {boolean} prevPassed	- If this action is a dependent of another action, did the previous action ran pass or fail.
     * @returns {IPerformResult} {@link IPerformResult}
     */
    Else.prototype.perform = function (prevPassed) {
        if (prevPassed === void 0) { prevPassed = false; }
        return !prevPassed ? { result: this.inner + this.command.performScope(), passed: true } : { result: '', passed: false };
    };
    /**
     * @memberof Else
     * @static
     * @property {RegExp} The regex matcher
     */
    Else.regex = /^\s*else\b/i;
    /**
     * @memberof Else
     * @static
     * @property {ICondition[]} Array of conditions available to this action
     */
    Else.conditions = [];
    /**
     * @memberof Else
     * @static
     * @property {IAction[]} Array of dependent actions
     */
    Else.dependents = [];
    return Else;
})();
exports.default = Else;
