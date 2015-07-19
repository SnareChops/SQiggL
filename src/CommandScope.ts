import IVariables from './IVariables';
import {IActionResult} from './Actions'
import Command from './Command';
/**
 * The Command Scope object
 * @module CommandScope
 * @class
 * @property {IVariables} variables - Holds variables for the scope
 * @property {Command[]} commands   - Array of commands within the scope
 * @property {Command[]} commands   - Array of dependent commands 
 */
export default class CommandScope {
	public variables: IVariables = {};
	public commands: Command[] = [];
	public dependents: Command[] = [];
    public perform(prev?: IActionResult): IActionResult {
        let command: Command;
        for(command of this.commands){
            prev = command.perform(prev);
        }
        return prev;
    }
}