import Command from '../Command';
import {IAction} from './IAction';
import {IPerformResult} from '../IPerformResult';

export default class EndIf implements IAction {
	public static regex: RegExp = /^\s*endif\b/;
	public terminator: boolean = true;
	public dependents = [];
	constructor(public command: Command, public statement: string, public inner: string, public variables: IVariables){
		console.log('EndIf statement: '+statement);
		console.log('EndIf inner: '+inner);
	}
	
	public perform(prevPassed: boolean = false): IPerformResult {
		return {result: this.inner, passed: true};
	}
}