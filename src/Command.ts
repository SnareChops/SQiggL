/// <reference path="actions/IAction.ts" />
import {If} from './Actions';

export default class Command {
	public static regex: RegExp = /{{%(.*?)%}}(.*?)(?=(?:{{%|$))/g;
	public action: IAction;
	constructor(public statement: string, public inner: string){
		this.parse();
	}
		
	public parse(){
		if(If.regex.test(this.statement)) this.action = new If(this.statement, this.inner);
	}
}