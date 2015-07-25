import Action from './Action';
import {Condition} from '../Conditions';
import Command from '../Command';
import Scope from '../Scope';

interface IActionDefinition {
    regex: RegExp;
    conditions: Condition[];
    dependents: Action[];
    terminator: boolean;
    rule: (command: Command, prev?: Command) => Command;
}
export default IActionDefinition;