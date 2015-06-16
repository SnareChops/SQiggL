/// <reference path="IAction.ts" />
/// <reference path="../conditions/ICondition.ts" />
/// <reference path="../IVariables.ts" />
import {Else, EndIf} from '../Actions';
import {IsNotNull} from '../Conditions'

export default class If implements IAction {
	public static regex: RegExp = /^\s*if\b/g;
	public variable: any;
	public conditions = [IsNotNull];
	public condition: ICondition;
	public dependents = [Else, EndIf]
	constructor(public statement: string, public inner: string, public variables: IVariables){
		console.log('If statement: '+statement);
		console.log('If inner: '+inner);
		this.condition = this.parseCondition(statement, variables);
		console.log(this.condition.result());
	}
		
	public parseCondition(statement: string, variables: IVariables){
		for (var i = 0; i < this.conditions.length; i++) {
			var match = statement.match(this.conditions[i].regex);
			if(match.length > 0) return new this.conditions[i](match[1], variables);
		}
	}
		
	public perform():string{
		return '';
	}
}