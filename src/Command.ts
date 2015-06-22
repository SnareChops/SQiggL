import {If, Else, EndIf} from './Actions';
import CommandScope from './CommandScope';
import {VariableReplacer} from './Replacers';
import {IAction} from './actions/IAction';
import {IPerformResult} from './IPerformResult';
import {IVariables} from './IVariables';

export default class Command {
	public static regex: RegExp = /{{%(.*?)%}}([\s\S]*?)?(?=(?:{{%|$))/igm;
	public actions: any[] = [If, Else, EndIf];
	public replacers = [VariableReplacer];
	public action: IAction;
	public scope: CommandScope = new CommandScope();
	public dependents: Command[] = [];
	constructor(public index: number, public length:number, public statement: string, public inner: string, variables: IVariables){
		this.scope.variables = variables;
		this.action = this.extract(statement, inner, variables);
	}
		
	public extract(statement: string, inner: string, variables: IVariables): IAction{
		for(var action of this.actions){
			if(action.regex.test(this.statement)) return new action(this, statement, inner, variables);
		}
		return null;
	}
	
	public perform(passed: boolean): IPerformResult {
		var result: IPerformResult = this.action.perform(passed);
		result.result += this.performDependents(result.passed);
		for(var replacer of this.replacers){
			result.result = replacer.replace(result.result, this.scope.variables);
		}
		return result;
	}
	
	public performScope(): string {
		var ret: string = '', prevPassed: boolean = false;
		for(var command of this.scope.commands){
			var result = command.perform(prevPassed);
			prevPassed = result.passed;
			ret += result.result;
		}
		return ret;
	}
	
	public performDependents(prevPassed: boolean): string {
		var ret: string = '';
		for(var dependent of this.dependents){
			var result = dependent.perform(prevPassed);
			prevPassed = result.passed;
			ret += result.result;
		}
		return ret;
	}
	
	public termination(): string {
		return this.scope.commands.some(command => command.action.terminator)
		? this.scope.commands.filter(command => command.action.terminator)[1].perform(false).result
		: '';
	}
	
	public dependent(action: IAction): boolean {
        window['action'] = this.action.constructor['dependents'];
		for(var dependent of this.action.constructor['dependents']){
			if(action instanceof <any>dependent) return true;
		}
		return false;
	}
}