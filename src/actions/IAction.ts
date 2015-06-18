import Command from '../Command';
import {IPerformResult} from '../IPerformResult';

/**
 * The interface for all actions to adhere to
 * @interface
 * @property {boolean} terminator
 * @property {IAction[]} dependents
 */
export interface IAction {
	terminator: boolean;
	dependents: any[]; //IAction[]
	/**
	 * @method
	 * @param {boolean} prevPassed
	 * @returns {@link IPerformResult}
	 */
	perform(prevPassed?: boolean): IPerformResult;
	
}