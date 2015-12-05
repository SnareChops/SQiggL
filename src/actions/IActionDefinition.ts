import Action from './Action';
import {Expression} from '../Expressions';
import Command from '../Command';
import Scope from '../Scope';

interface IActionDefinition {
    regex: RegExp;
    expressions: Expression[]
    dependents: Action[];
    terminator: boolean;
    rule: (command: Command, prev?: Command) => Command;
}
export default IActionDefinition;