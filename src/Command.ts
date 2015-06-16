/// <reference path="actions/IAction.ts" />
/// <reference path="IVariables.ts" />
import {If} from './Actions';
import CommandScope from './CommandScope';
import {VariableReplacer} from './Replacers';

export default class Command {
	public static regex: RegExp = /{{%(.*?)%}}(.*?)(?=(?:{{%|$))/g;
	public actions = [If];
	public replacers = [VariableReplacer];
	public action: IAction;
	public scope: CommandScope = new CommandScope();
	constructor(public index: number, public statement: string, public inner: string, variables: IVariables){
		this.scope.variables = variables;
		console.log('Command statement: '+statement);
		console.log('Command inner: '+inner);
		this.action = this.extract(statement, inner, variables);
	}
		
	public extract(statement: string, inner: string, variables: IVariables): IAction{
		for(var action of this.actions){
			if(action.regex.test(this.statement)) return new action(statement, inner, variables);
		}
		return null;
	}
	
	public perform(): string {
		var result = this.action.perform();
		for(var replacer of this.replacers){
			result = replacer.replace(result, this.scope.variables);
		}
		return result;
	}
}