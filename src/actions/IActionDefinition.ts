import Action from './Action';
import {Condition} from '../Conditions';
import Command from '../Command';
import CommandScope from '../CommandScope';
import IActionResult from './IActionResult';

interface IActionDefinition {
    regex: RegExp;
    conditions: Condition[];
    dependents: Action[];
    terminator: boolean;
    rule: (command: Command, condition: Condition, inner: string, prev?: IActionResult) => IActionResult;
}
export default IActionDefinition;