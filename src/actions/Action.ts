import IActionDefinition from './IActionDefinition';
import {Condition} from '../Conditions';
import IVariables from '../IVariables';
import Command from '../Command';
import Scope from '../Scope';
// DO NOT PUT INSTANCE ITEMS IN THIS CLASS, DUMMY
export default class Action {
    constructor(public definition: IActionDefinition){
        if(!definition) throw 'Attempted to instatiate action without a definition';
    }
    
    public matches(statement: string): boolean{
        return this.definition.regex.test(statement);
    }
    
    public parse(command: Command){
        let condition: Condition;
        for(condition of this.definition.conditions){
            if(condition.matches(command.statement)) {
                command.condition = condition;
            }
        }
    }
    
    public perform(command: Command, prev?: Command): Command {
        return this.definition.rule(command, prev);
    }
}