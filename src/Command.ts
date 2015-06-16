/// <reference path="actions/IAction.ts" />
/// <reference path="IVariables.ts" />
import {If} from './Actions';
import CommandScope from './CommandScope';

export default class Command {
	public static regex: RegExp = /{{%(.*?)%}}(.*?)(?=(?:{{%|$))/g;
	public action: IAction;
	public scope: CommandScope = new CommandScope();
	constructor(public statement: string, public inner: string, variables: IVariables){
		this.scope.variables = variables;
		console.log('Command statement: '+statement);
		console.log('Command inner: '+inner);
		this.extract(statement, inner, variables);
	}
		
	public extract(statement: string, inner: string, variables: IVariables){
		if(If.regex.test(this.statement)) this.action = new If(statement, inner, variables);
	}
}