import Action from './Action';
import {Condition} from '../Conditions';
import Command from '../Command';
import Scope from '../Scope';
import ActionResult from './ActionResult';

interface IActionDefinition {
    regex: RegExp;
    conditions: Condition[];
    dependents: Action[];
    terminator: boolean;
    rule: (command: Command, condition: Condition, prev?: ActionResult) => ActionResult;
}
export default IActionDefinition;