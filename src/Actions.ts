import IActionDefinition from './actions/IActionDefinition';
import IActionResult from './actions/IActionResult';
import Action from './actions/Action';
import Command from './Command';
import {Condition, Equal, GreaterThan, LessThan, IsNull, AlphabeticallyGreaterThan, AlphabeticallyLessThan, LengthGreaterThan, LengthLessThan, IsNaN, Between} from './Conditions';
import CommandScope from './CommandScope';

let EndIfDefinition: IActionDefinition = {
    regex: /^\s*endif\b/i,
    conditions: [],
    dependents: [],
    terminator: false,
    rule: (command: Command, condition: Condition, inner: string, prev: IActionResult): IActionResult => { return {result: inner, passed: true}}
};
export let EndIf = new Action(EndIfDefinition);

let ElseDefinition: IActionDefinition = {
    regex: /^\s*else\b/i,
    conditions: [],
    dependents: [],
    terminator: false,
    rule: (command: Command, condition: Condition, inner: string, prev: IActionResult): IActionResult => !prev.result ? {result: inner + command.scope.perform().result, passed: true} : {result: '', passed: false}
};
export let Else = new Action(ElseDefinition);

let IfDefinition: IActionDefinition = {
    regex: /^\s*if\b/i,
    conditions: [Equal, GreaterThan, LessThan, IsNull, AlphabeticallyGreaterThan, AlphabeticallyLessThan, LengthGreaterThan, LengthLessThan, IsNaN, Between],
    dependents: [Else, EndIf],
    terminator: false,
    rule: (command: Command, condition: Condition, inner: string): IActionResult => condition.perform() ?{result: inner + command.scope.perform().result, passed: true} : {result: command.termination(), passed: false} 
};
export let If = new Action(IfDefinition);

export {default as IActionDefinition} from './actions/IActionDefinition';
export {default as IActionResult} from './actions/IActionResult';
export {default as Action} from './actions/Action';