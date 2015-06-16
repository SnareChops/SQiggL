/// <reference path="../conditions/ICondition.ts" />
/// <reference path="../IVariables.ts" />
import {Else, EndIf} from '../Actions';
import {IsNotNull} from '../Conditions';
import Command from '../Command';
import {IAction} from './IAction';
import {IPerformResult} from '../IPerformResult';

export default class If implements IAction {
	public static regex: RegExp = /^\s*if\b/;
	public terminator: boolean = false;
	public variable: any;
	public conditions = [IsNotNull];
	public condition: ICondition;
	public dependents = [Else, EndIf];
	constructor(public command: Command, public statement: string, public inner: string, public variables: IVariables){
		console.log('If statement: '+statement);
		console.log('If inner: '+inner);
		this.condition = this.parseCondition(statement, variables);
		console.log(this.condition.perform());
	}
		
	public parseCondition(statement: string, variables: IVariables){
		for(var condition of this.conditions){
			var match = statement.match(condition.regex);
			if(match.length > 0) return new condition(match[1], variables);
		}
		return null;
	}
		
	public perform(prevPassed: boolean = false): IPerformResult{
		return this.condition.perform()	
				? {result: this.inner + this.command.performScope(), passed: true} 
				: {result: this.command.termination(), passed: false};
	}
	
	// public dependent(action: IAction): boolean {
	// 	for(var dependent of this.dependents){
	// 		if(action instanceof dependent) return true;
	// 	}
	// 	return false;
	// }
}