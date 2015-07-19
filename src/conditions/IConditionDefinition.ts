import {Modifier} from '../Modifiers';
import IVariables from '../IVariables';
interface IConditionDefinition {
    template: string;
    items: Array<string | Modifier[]>;
    rule: (variable: string, comparative: string | string[], variables: IVariables) => boolean;
}
export default IConditionDefinition;