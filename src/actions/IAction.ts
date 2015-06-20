import Command from '../Command';
import {IPerformResult} from '../IPerformResult';

/**
 * The interface for all actions to adhere to
 * @interface
 * @property {boolean} terminator
 * @property {IAction[]} dependents
 * @property {Command} command
 */
export interface IAction {
	terminator: boolean;
	// dependents: any[]; //IAction[]
    command: Command;
    supporter: Command;
	/**
	 * @method
	 * @param {boolean} prevPassed
	 * @returns {@link IPerformResult}
	 */
	perform(prevPassed?: boolean): IPerformResult;
    validate():string;
}