/// <reference path="IAction.ts" />
/// <reference path="../conditions/ICondition.ts" />
import {IsNotNull} from '../Conditions'

export default class If implements IAction {
	public static regex: RegExp = /^\s*if\b/g;
	public variable: IVariable;
	public conditions = [IsNotNull];
	public condition: ICondition;
	constructor(public statement: string, public inner: string){
		this.condition = this.parseCondition(statement);
		console.log(this.condition.result());
	}
		
	private parseCondition(statement: string){
		for (var i = 0; i < this.conditions.length; i++) {
			var x = this.conditions[i].create(statement);
			if(x) return x;
		}
	}
		
	public perform():string{
		return '';
	}
}