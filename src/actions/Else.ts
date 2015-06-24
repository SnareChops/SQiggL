import Command from '../Command';
import {IAction} from './IAction';
import {IPerformResult} from '../IPerformResult';
import {IVariables} from '../IVariables';
import Errors from '../Errors';
import {ICondition} from '../conditions/ICondition';

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
export default class Else implements IAction {
	/**
     * @memberof Else
     * @static
     * @property {RegExp} The regex matcher
     */
    public static regex: RegExp = /^\s*else\b/i;
    /**
     * @memberof Else
     * @static
     * @property {ICondition[]} Array of conditions available to this action
     */
    public static conditions = [];
    /**
     * @memberof Else
     * @static
     * @property {IAction[]} Array of dependent actions
     */
	public static dependents = [];
	public terminator: boolean = false;
    public variable: any;
	public condition: ICondition;
    public supporter: Command;
	constructor(public command: Command, public statement: string, public inner: string, public variables: IVariables){
	}
    /**
     * Checks for any known syntax errors regarding this action
     * @memberof Else
     * @method
     * @public
     * @returns {string | null} The caught error if any
     */
    public validate(): string {
        if(!this.supporter) return Errors.IncorrectStatement(this, this.statement);
    }
	/**
	 * Perform the action and return the result.
     * @memberof Else
	 * @method
	 * @public
	 * @param {boolean} prevPassed	- If this action is a dependent of another action, did the previous action ran pass or fail.
	 * @returns {IPerformResult} {@link IPerformResult}
	 */
	public perform(prevPassed: boolean = false): IPerformResult{
		return !prevPassed ? {result: this.inner + this.command.performScope(), passed: true} : {result: '', passed: false};
	}
}