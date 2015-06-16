/// <reference path="IAction.ts" />
/// <reference path="../conditions/ICondition.ts" />
/// <reference path="../IVariables.ts" />
import {IsNotNull} from '../Conditions'

export default class If implements IAction {
	public static regex: RegExp = /^\s*if\b/g;
	public variable: any;
	public conditions = [IsNotNull];
	public condition: ICondition;
	constructor(public statement: string, public inner: string, public variables: IVariables){
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
		
	public perform(): string{
		return this.condition.perform() ? this.inner : '';
	}
}