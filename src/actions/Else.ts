import Command from '../Command';
import {IAction} from './IAction';
import {IPerformResult} from '../IPerformResult';
import {IVariables} from '../IVariables';

export default class Else implements IAction {
	public static regex: RegExp = /^\s*else\b/;
	public terminator: boolean = false;
	public dependents = [];
	constructor(public command: Command, public statement: string, public inner: string, public variables: IVariables){
		console.log('Else statement: '+statement);
		console.log('Else inner: '+inner);
	}
	
	public perform(prevPassed: boolean = false): IPerformResult{
		return !prevPassed ? {result: this.inner + this.command.performScope(), passed: true} : {result: '', passed: false};
	}
}