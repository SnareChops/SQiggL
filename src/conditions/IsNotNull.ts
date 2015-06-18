/// <reference path="ICondition.ts" />
import {IVariables} from '../IVariables';

export default class IsNotNull implements ICondition {
	public static regex: RegExp = /(\w*)\s+is\s+not\s+null\s*/;
	constructor(public variable: string, public variables: IVariables){
	}
		
	public perform():boolean{
		return this.variables[this.variable] != null;
	}
}