import Command from '../Command';
import {IPerformResult} from '../IPerformResult';
export interface IAction {
	terminator: boolean;
	perform(prevPassed?: boolean): IPerformResult;
	dependents: any[]; //IAction[]
}