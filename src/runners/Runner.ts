import IRunnerDefinition from './IRunnerDefinition';
import IVariables from '../IVariables';
import Scope from '../Scope';
import {Action} from '../Actions';
import Command from '../Command';
import {Replacer} from '../Replacers';

export default class Runner {
    constructor(public definition: IRunnerDefinition){
        if(!definition) throw 'Attempted to instatiate runner without a definition';
    }
    
    public parse(command: Command) {
        let action: Action;
        for(action of this.definition.actions){
            if(action.matches(command.statement)) {
                command.action = action;
                command.action.parse(command);
            }
        }
    }
    
    public perform(command: Command, prev?: Command): Command {
        command.result = command.action.perform(command, prev).result;
        // command.result.dependent = command.scope.perform(command).result;
        let replacer: Replacer;
        for(replacer of this.definition.replacers){
            command.replace(replacer);
        }
        return command;
    }
    
    public matches(text: string): boolean {
        this.definition.regex.lastIndex = 0;
        return this.definition.regex.test(text);
    }
}