import IActionDefinition from './IActionDefinition';
import IActionResult from './IActionResult';
import {Condition} from '../Conditions';
import IVariables from '../IVariables';
import Command from '../Command';
import CommandScope from '../CommandScope';
export default class Action {
    private regex: RegExp;
    private conditions: Condition[];
    private dependents: Action[];
    private terminator: boolean;
    private rule: (command: Command, condition: Condition, inner: string, prev?: IActionResult) => IActionResult;
    private condition: Condition;
    private command: Command;
    private inner: string;
    constructor(private definition: IActionDefinition){
        this.regex = definition.regex;
        this.conditions = definition.conditions;
        this.dependents = definition.dependents;
        this.terminator = definition.terminator;
        this.rule = definition.rule;
    }
    
    public parse(command: Command, statement: string, inner: string, variables: IVariables): boolean{
        this.command = command;
        this.inner = inner;
        let condition: Condition;
        for(condition of this.conditions){
            if(condition.matches(statement)) {
                this.condition = condition;
                this.condition.parse(statement, variables);
                return true;
            }
        }
        return false;
    }
    
    public perform(prev?: IActionResult): IActionResult {
        return this.rule(this.command, this.condition, this.inner, prev);
    }
}