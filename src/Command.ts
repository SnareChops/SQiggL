import {Runner} from './Runners';
import {Action} from './Actions';
import {Expression} from './Expressions';
import {Modifier} from './Modifiers';
import {Replacer} from './Replacers';
import CommandResult from './commands/CommandResult';
import Scope from './Scope';

export default class Command {
    public dependents: Command[] = [];
    public action: Action;
    public expression: Expression;
    public modifiers: Modifier[] = [];
    public result: CommandResult = new CommandResult('', false);
    constructor(public index: number, public length: number, public statement: string, public inner: string, public scope: Scope, private runner: Runner){
        let action: Action;
        for(action of runner.definition.actions){
            if(action.matches(statement)) {
                this.action = action;
                break;
            }
        }
    }
    
    public perform(prev?: Command): Command {
        return this.runner.perform(this, prev);
    }
    
    public replace(replacer: Replacer){
        this.result.text = replacer.replace(this.result.text, this.scope.variables);
    }
    
    public defer(passed: boolean): string {
        let dependent:Command, text: string = '';
        for(dependent of this.dependents){
            text += dependent.perform(this).result.text;
        }
        return text;
    }
    
    public terminate(): string{
        return this.dependents.some(command => command.action.definition.terminator)
		  ? this.dependents.filter(command => command.action.definition.terminator)[0].perform().result.text
		  : '';
    }
}