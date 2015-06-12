/// <reference path="ICondition.ts" />
import {variables} from '../Main';
export default class IsNotNull implements ICondition {
	public static regex: RegExp = /\s*if\b\s+(.*?)\b\s*is\s*not\s*null\s*$/;
	constructor(private variable: string){
		
	}
		
	public static create(statement: string): ICondition{
		var result = statement.match(IsNotNull.regex);
		if(!result) return null;
		return new IsNotNull(result[1]);
	}
		
	public result():boolean{
		console.log(variables);
		return variables[this.variable] != null;
	}
}