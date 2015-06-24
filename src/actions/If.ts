/// <reference path="../conditions/ICondition.ts" />
import {Else, EndIf} from '../Actions';
import {IsNotNull} from '../Conditions';
import Command from '../Command';
import {IAction} from './IAction';
import {IPerformResult} from '../IPerformResult';
import {IVariables} from '../IVariables';
import {ICondition} from '../conditions/ICondition';

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
export default class If implements IAction {
	/**
     * @memberof If
     * @static
     * @property {RegExp} The regex matcher
     */
    public static regex: RegExp = /^\s*if\b/i;
    /**
     * @memberof If
     * @static
     * @property {ICondition[]} Array of conditions available to this action
     */
	public static conditions = [IsNotNull];
    /**
     * @memberof If
     * @static
     * @property {IAction[]} Array of dependent actions
     */
	public static dependents = [Else, EndIf];
	public terminator: boolean = false;
	public variable: any;
	public condition: ICondition;
    public supporter: Command;
	constructor(public command: Command, public statement: string, public inner: string, public variables: IVariables){
		this.condition = this.parseCondition(statement, variables);
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
	public parseCondition(statement: string, variables: IVariables){
		for(var condition of If.conditions){
			var match = statement.match(condition.regex);
			if(match.length > 0) return new condition(match[1], variables);
		}
		return null;
	}
    /**
     * Checks for any known syntax errors regarding this action
     * @memberof If
     * @method
     * @public
     * @returns {string | null} The caught error if any
     */
    public validate():string{
        return null;
    }
	/**
	 * Perform the action and return the result.
     * @memberof If
	 * @method
	 * @public
	 * @param {boolean} prevPassed	- If this action is a dependent of another action, did the previous action ran pass or fail.
	 * @returns {IPerformResult} {@link IPerformResult}
	 */
	public perform(prevPassed: boolean = false): IPerformResult{
		return this.condition.perform()	
				? {result: this.inner + this.command.performScope(), passed: true} 
				: {result: this.command.termination(), passed: false};
	}
}