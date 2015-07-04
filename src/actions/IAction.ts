import Command from '../Command';
import IPerformResult from '../IPerformResult';
import IVariables from '../IVariables';
import ICondition from '../conditions/ICondition';

/**
 * The interface for all actions to adhere to
 * @interface IAction
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
interface IAction {
    // static regex: RegExp;
    // static conditions: ICondition[];
	// static dependents: IAction[];
	terminator: boolean;
    variable: any;
    condition: ICondition;
    supporter: Command;
    command: Command;
    statement: string;
    inner: string;
    variables: IVariables;
	/**
	 * @method
     * @memberof IAction
	 * @param {boolean} prevPassed
	 * @returns IPerformResult {@link IPerformResult}
	 */
    validate():string;
	perform(prevPassed?: boolean): IPerformResult;
}
export default IAction;