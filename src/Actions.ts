import IActionDefinition from './actions/IActionDefinition';
import CommandResult from './commands/CommandResult';
import Action from './actions/Action';
import Command from './Command';
import {Condition, Equal, GreaterThan, LessThan, IsNull, AlphabeticallyGreaterThan, AlphabeticallyLessThan, LengthGreaterThan, LengthLessThan, IsNaN, Between} from './Conditions';
import Scope from './Scope';

let EndIfDefinition: IActionDefinition = {
    regex: /^\s*endif\b/i,
    conditions: [],
    dependents: [],
    terminator: true,
    rule: (command: Command, prev?: Command): Command => {
        command.result = new CommandResult(command.inner, true);
        return command;
    }
};
export let EndIf = new Action(EndIfDefinition);

let ElseDefinition: IActionDefinition = {
    regex: /^\s*else\b/i,
    conditions: [],
    dependents: [],
    terminator: false,
    rule: (command: Command, prev?: Command): Command => {
        if(!prev.result.passed) command.result = new CommandResult(command.inner + command.scope.perform(), true);
        else command.result = new CommandResult('', false);
        return command;
    }
};
export let Else = new Action(ElseDefinition);

let IfDefinition: IActionDefinition = {
    regex: /^\s*if\b/i,
    conditions: [Equal, GreaterThan, LessThan, IsNull, AlphabeticallyGreaterThan, AlphabeticallyLessThan, LengthGreaterThan, LengthLessThan, IsNaN, Between],
    dependents: [Else, EndIf],
    terminator: false,
    rule: (command: Command, prev?: Command): Command => {
        if(command.condition.perform(command)) {
            command.result = new CommandResult(command.inner + command.scope.perform() + command.terminate(), true);
        }
        else command.result = new CommandResult(command.defer(false), false);
        return command;
    } 
};
export let If = new Action(IfDefinition);

export {default as IActionDefinition} from './actions/IActionDefinition';
export {default as Action} from './actions/Action';