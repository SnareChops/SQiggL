/// <reference path="ICondition.ts" />
import {IVariables} from '../IVariables';

export default class IsNotNull implements ICondition {
	public static regex: RegExp = /(\w*)\s+is\s+not\s+null\s*/;
	constructor(public variable: string, public variables: IVariables){
		console.log('IsNotNull variable: '+variable);
		console.log('IsNotNull variable value: '+this.variables[this.variable]);
	}
		
	public perform():boolean{
		console.log('IsNotNull result: '+this.variables[this.variable] != null);
		return this.variables[this.variable] != null;
	}
}