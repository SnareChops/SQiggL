import IActionDefinition from './IActionDefinition';
import ActionResult from './ActionResult';
import {Condition} from '../Conditions';
import IVariables from '../IVariables';
import Command from '../Command';
import Scope from '../Scope';
export default class Action {
    private condition: Condition;
    private command: Command;
    private inner: string;
    constructor(public definition: IActionDefinition){
        if(!definition) throw 'Attempted to instatiate action without a definition';
    }
    
    public matches(statement: string): boolean{
        return this.definition.regex.test(statement);
    }
    
    public parse(command: Command, statement: string, inner: string, variables: IVariables): boolean{
        this.command = command;
        this.inner = inner;
        let condition: Condition;
        for(condition of this.definition.conditions){
            if(condition.matches(statement)) {
                this.condition = condition;
                this.condition.parse(statement, variables);
                return true;
            }
        }
        return false;
    }
    
    public perform(prev?: ActionResult): ActionResult {
        return this.definition.rule(this.command, this.condition, prev);
    }
}