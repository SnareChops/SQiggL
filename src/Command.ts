import {Runner} from './Runners';
import {Action} from './Actions';
import {Replacer} from './Replacers';
import CommandResult from './commands/CommandResult';
import Scope from './Scope';

export default class Command {
    public dependents: Command[] = [];
    public action: Action;
    public result: CommandResult;
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
    
    public terminate(): string{
        return this.scope.commands.some(command => command.action.definition.terminator)
		  ? this.scope.commands.filter(command => command.action.definition.terminator)[1].perform().result.text
		  : '';
    }
}