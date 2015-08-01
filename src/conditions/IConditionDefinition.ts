import {Modifier} from '../Modifiers';
import IVariables from '../IVariables';
interface IConditionDefinition {
    template: string;
    items: Array<string | Modifier[]>;
    modOrder: number[];
    rule: (variable: string, comparative: string | string[], variables: IVariables) => boolean;
}
export default IConditionDefinition;