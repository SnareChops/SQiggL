/// <reference path="../conditions/ICondition.ts" />
var Actions_1 = require('../Actions');
var Conditions_1 = require('../Conditions');
/**
 * The If action
 * @module If
 * @class
 * @implements {@link IAction}
 * @param {Command} command 			- Command that contains this action
 * @param {string} statement 			- Statement that this should take action on
 * @param {string} inner 				- Text that follows after this action until the next command
 * @param {IVariables} variables		- Variables within the scope of this action
 * @property {Command} command 			- Command that contains this action
 * @property {string} statement			- Statement that this should take action on
 * @property {string} inner 			- Text that follows after this action until the next command
 * @property {IVariables} variables		- Variables within the scope of this action
 * @property {boolean} terminator 		- Defines if this action is a terminator
 * @property {IVariable} variable		- Variable that this should take action on depending on the result of the condition
 * @property {ICondition[]} conditions	- Array of conditions that this action supports (if any)
 * @property {ICondition} condition		- Condition that was found as a match for this action
 * @property {IAction[]} dependents		- Array of actions that are dependent on this action's result
 */
var If = (function () {
    function If(command, statement, inner, variables) {
        this.command = command;
        this.statement = statement;
        this.inner = inner;
        this.variables = variables;
        this.terminator = false;
        this.condition = this.extractCondition(statement, variables);
    }
    /**
     * Try and locate a matching condition from the available conditions for this action. If no match is found, return null.
     * @memberof If
     * @method
     * @public
     * @param {string} statement		- Statement to check conditions against
     * @param {IVariables} variables	- List of variables within the scope of this action
     * @returns {ICondition | null}		- Condition that matches within the statement
     */
    If.prototype.extractCondition = function (statement, variables) {
        for (var _i = 0, _a = If.conditions; _i < _a.length; _i++) {
            var condition = _a[_i];
            var match = condition.extract(statement, variables);
            if (match)
                return match;
        }
        return null;
    };
    /**
     * Checks for any known syntax errors regarding this action
     * @memberof If
     * @method
     * @public
     * @returns {string | null} The caught error if any
     */
    If.prototype.validate = function () {
        return null;
    };
    /**
     * Perform the action and return the result.
     * @memberof If
     * @method
     * @public
     * @param {boolean} prevPassed	- If this action is a dependent of another action, did the previous action ran pass or fail.
     * @returns {IPerformResult} {@link IPerformResult}
     */
    If.prototype.perform = function (prevPassed) {
        if (prevPassed === void 0) { prevPassed = false; }
        return this.condition.perform()
            ? { result: this.inner + this.command.performScope(), passed: true }
            : { result: this.command.termination(), passed: false };
    };
    /**
     * @memberof If
     * @static
     * @property {RegExp} The regex matcher
     */
    If.regex = /^\s*if\b/i;
    /**
     * @memberof If
     * @static
     * @property {ICondition[]} Array of conditions available to this action
     */
    If.conditions = [Conditions_1.IsNull, Conditions_1.GreaterThan, Conditions_1.LessThan, Conditions_1.Equal];
    /**
     * @memberof If
     * @static
     * @property {IAction[]} Array of dependent actions
     */
    If.dependents = [Actions_1.Else, Actions_1.EndIf];
    return If;
})();
exports.default = If;
