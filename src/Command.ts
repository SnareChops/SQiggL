import {Action, If, Else, EndIf} from './Actions';
import CommandScope from './CommandScope';
import {VariableReplacer} from './Replacers';
import IVariables from './IVariables';
/**
 * Command object responsible for handling all actions, conditions, and variables within it's section of the query
 * @module Command
 * @class
 * @param {number} index                - Beginning index of the command in the original query string
 * @param {number} length               - Length of the section of the original string that this command is responsible for
 * @param {string} statement            - Statement within the '{{% %}}' that this command is responsible for
 * @param {string} inner                - Text that immediately follows the statement until the next command
 * @param {IVariables} variables        - Variables within the scope of this command
 * @property {number} index             - Beginning index of the command in the original query string
 * @property {number} length            - Length of the section of the original string that this command is responsible for
 * @property {string} statement         - Statement within the '{{% %}}' that this command is responsible for
 * @property {string} inner             - Text that immediately follows the statement until the next command
 * @property {IVariables} variables     - Variables within the scope of this command
 * @property {IAction[]} actions        - Array of actions available to SQiggL
 * @property {IReplacer[]} replacers    - Array of replacers available to SQiggL
 * @property {CommandScope} scope       - Holds information about the scope of this command, such as available variables {@see CommandScope}
 * @property {Command[]} dependents     - Array of commands dependent to this command        
 */
export default class Command {
    /**
     * @memberof Command
     * @static
     * @property {RegExp} The regex matcher
     */
	public static regex: RegExp = /{{%(.*?)%}}([\s\S]*?)?(?=(?:{{%|$))/gm;
	public actions: any[] = [If, Else, EndIf];
	public replacers = [VariableReplacer];
	public action: Action;
	public scope: CommandScope = new CommandScope();
	public dependents: Command[] = [];
	constructor(public index: number, public length:number, public statement: string, public inner: string, variables: IVariables){
		this.scope.variables = variables;
		this.action = this.extract(statement, inner, variables);
	}
	/**
     * Extract actions from the statement
     * @memberof Command
     * @method
     * @public
     * @param {string} statement        - Statement to extract the actions from
     * @param {string} inner            - Inner text for the command
     * @param {IVariables} variables    - Variables within the scope of this command
     * @returns {IAction | null}        - The matching action or null if no action was found
     */	
	public extract(statement: string, inner: string, variables: IVariables): Action{
		for(var action of this.actions){
			if(action.regex.test(this.statement)) return new action(this, statement, inner, variables);
		}
		return null;
	}
	/**
     * Perform the command and return the result
     * @memberof Command
     * @method
     * @public
     * @param {boolean} passed      - If the command is a dependent then this will reflect if the previous command succeeded or failed
     * @returns {IPerformResult}    - The result of the command execution {@see IPerformResult}
     */
	public perform(passed: boolean): IPerformResult {
		var result: IPerformResult = this.action.perform(passed);
		result.result += this.performDependents(result.passed);
		for(var replacer of this.replacers){
			result.result = replacer.replace(result.result, this.scope.variables);
		}
		return result;
	}
	/**
     * Perform commands that are within the scope of this command (sub-commands)
     * @memberof Command
     * @method
     * @public
     * @returns {string} The result of the sub-command's execution
     */
	public performScope(): string {
		var ret: string = '', prevPassed: boolean = false;
		for(var command of this.scope.commands){
			var result = command.perform(prevPassed);
			prevPassed = result.passed;
			ret += result.result;
		}
		return ret;
	}
	/**
     * Perform commands that are dependent on this command
     * @memberof Command
     * @method
     * @public
     * @param {boolean} prevPassed  - If this command is a dependent then this will reflect if the previous command succeeded or failed
     * @returns {string} The result of the dependent executions (collectively)
     */
	public performDependents(prevPassed: boolean): string {
		var ret: string = '';
		for(var dependent of this.dependents){
			var result = dependent.perform(prevPassed);
			prevPassed = result.passed;
			ret += result.result;
		}
		return ret;
	}
	/**
     * Perform the termination of the command's actions if needed (For example "EndIf" is a terminator of "If", so this essentially means to just print out the string that follows "EndIf")
     * @memberof Command
     * @method
     * @public
     * @returns {string} The result of the action's terminator
     */
	public termination(): string {
		return this.scope.commands.some(command => command.action.terminator)
		? this.scope.commands.filter(command => command.action.terminator)[1].perform(false).result
		: '';
	}
	/**
     * Check if the inputted action is a dependent of the action for this command
     * @memberof Command
     * @method
     * @public
     * @param {IAction} action  - The action to check if it is a dependent of this command's action
     * @returns {boolean} Whether the action is a dependent of this command's action 
     */
	public dependent(action: IAction): boolean {
		for(var dependent of this.action.constructor['dependents']){
			if(action instanceof <any>dependent) return true;
		}
		return false;
	}
}