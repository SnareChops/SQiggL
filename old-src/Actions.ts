import {default as IActionDefinition} from './actions/IActionDefinition';
import CommandResult from './commands/CommandResult';
import Action from './actions/Action';
import Command from './Command';
import {Expression, Equal, GreaterThan, LessThan, IsNull, AlphabeticallyGreaterThan, AlphabeticallyLessThan, LengthGreaterThan, LengthLessThan, IsNaN, Between, ForInUsing} from './Expressions';
import Scope from './Scope';

let EndIfDefinition: IActionDefinition = {
    regex: /^\s*endif\b/i,
    expressions: [],
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
    expressions: [],
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
    expressions: [Equal, GreaterThan, LessThan, IsNull, AlphabeticallyGreaterThan, AlphabeticallyLessThan, LengthGreaterThan, LengthLessThan, IsNaN, Between],
    dependents: [Else, EndIf],
    terminator: false,
    rule: (command: Command, prev?: Command): Command => {
        if(command.expression.evaluate(command)) {
            command.result = new CommandResult(command.inner + command.scope.perform() + command.terminate(), true);
        }
        else command.result = new CommandResult(command.defer(false), false);
        return command;
    } 
};
export let If = new Action(IfDefinition);

let EndUnlessDefinition: IActionDefinition = {
    regex: /^\s*endunless\b/i,
    expressions: [],
    dependents: [],
    terminator: true,
    rule: (command: Command, prev?: Command): Command => {
        command.result = new CommandResult(command.inner, true);
        return command;
    }
}
export let EndUnless = new Action(EndUnlessDefinition);

let UnlessDefinition: IActionDefinition = {
    regex: /^\s*unless\b/i,
    expressions: [Equal, GreaterThan, LessThan, IsNull, AlphabeticallyGreaterThan, AlphabeticallyLessThan, LengthGreaterThan, LengthLessThan, IsNaN, Between],
    dependents: [Else, EndUnless],
    terminator: false,
    rule: (command: Command, prev?: Command): Command => {
        if(!command.expression.evaluate(command)){
            command.result = new CommandResult(command.inner + command.scope.perform() + command.terminate(), true);
        }
        else command.result = new CommandResult(command.defer(false), false);
        return command;
    }
}
export let Unless = new Action(UnlessDefinition);

let EndForDefinition: IActionDefinition = {
    regex: /^\s*endfor\b/i,
    expressions: [],
    dependents: [],
    terminator: true,
    rule: (command: Command, prev?: Command): Command => {
        command.result = new CommandResult(command.inner, true);
        return command;
    }
}
export let EndFor = new Action(EndForDefinition);

let ForDefinition: IActionDefinition = {
    regex: /^\s*for\b/i,
    expressions: [ForInUsing],
    dependents: [EndFor],
    terminator: false,
    rule: (command: Command, prev?: Command): Command => {
        command.result = new CommandResult(command.expression.evaluate(command));
        return command;
    }
}

export {default as IActionDefinition} from './actions/IActionDefinition';
export {default as Action} from './actions/Action';