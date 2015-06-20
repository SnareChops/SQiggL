import Command from '../Command';
import {IAction} from './IAction';
import {IPerformResult} from '../IPerformResult';
import {IVariables} from '../IVariables';
import Errors from '../Errors';

export default class Else implements IAction {
	public static regex: RegExp = /^\s*else\b/;
	public terminator: boolean = false;
	public static dependents = [];
    public supporter: Command;
	constructor(public command: Command, public statement: string, public inner: string, public variables: IVariables){
	}
    
    public validate(): string {
        if(!this.supporter) return Errors.IncorrectStatement(this, this.statement);
    }
	
	public perform(prevPassed: boolean = false): IPerformResult{
		return !prevPassed ? {result: this.inner + this.command.performScope(), passed: true} : {result: '', passed: false};
	}
}