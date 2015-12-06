import IActionDefinition from './IActionDefinition';
import {Expression} from '../Expressions';
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
        let expression: Expression;
        for(expression of this.definition.expressions){
            if(expression.matches(command.statement)) {
                command.expression = expression;
            }
        }
    }
    
    public perform(command: Command, prev?: Command): Command {
        return this.definition.rule(command, prev);
    }
}