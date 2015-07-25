import IActionDefinition from './actions/IActionDefinition';
import ActionResult from './actions/ActionResult';
import Action from './actions/Action';
import Command from './Command';
import {Condition, Equal, GreaterThan, LessThan, IsNull, AlphabeticallyGreaterThan, AlphabeticallyLessThan, LengthGreaterThan, LengthLessThan, IsNaN, Between} from './Conditions';
import Scope from './Scope';

let EndIfDefinition: IActionDefinition = {
    regex: /^\s*endif\b/i,
    conditions: [],
    dependents: [],
    terminator: false,
    rule: (command: Command, condition: Condition, prev: ActionResult): ActionResult => { return new ActionResult(command.inner, true)}
};
export let EndIf = new Action(EndIfDefinition);

let ElseDefinition: IActionDefinition = {
    regex: /^\s*else\b/i,
    conditions: [],
    dependents: [],
    terminator: false,
    rule: (command: Command, condition: Condition, prev: ActionResult): ActionResult => !prev.text ? new ActionResult(command.inner + command.scope.perform().result.text, true) : new ActionResult('', false)
};
export let Else = new Action(ElseDefinition);

let IfDefinition: IActionDefinition = {
    regex: /^\s*if\b/i,
    conditions: [Equal, GreaterThan, LessThan, IsNull, AlphabeticallyGreaterThan, AlphabeticallyLessThan, LengthGreaterThan, LengthLessThan, IsNaN, Between],
    dependents: [Else, EndIf],
    terminator: false,
    rule: (command: Command, condition: Condition): ActionResult => condition.perform() ? new ActionResult(command.inner + command.scope.perform().result.text, true) : new ActionResult(command.terminate(), false) 
};
export let If = new Action(IfDefinition);

export {default as IActionDefinition} from './actions/IActionDefinition';
export {default as ActionResult} from './actions/ActionResult';
export {default as Action} from './actions/Action';