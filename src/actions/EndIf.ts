import Command from '../Command';
import {IAction} from './IAction';
import {IPerformResult} from '../IPerformResult';
import {IVariables} from '../IVariables';

export default class EndIf implements IAction {
	public static regex: RegExp = /^\s*endif\b/;
	public terminator: boolean = true;
	public static dependents = [];
    public supporter: Command;
	constructor(public command: Command, public statement: string, public inner: string, public variables: IVariables){
	}
	
    public validate(): string{
        return null;
    }
    
	public perform(prevPassed: boolean = false): IPerformResult {
		return {result: this.inner, passed: true};
	}    
}