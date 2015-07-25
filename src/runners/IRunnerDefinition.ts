import {Action} from '../Actions';
import {Replacer} from '../Replacers';

interface IRunnerDefinition {
    regex: RegExp;
    actions: Action[];
    replacers: Replacer[];
}
export default IRunnerDefinition;