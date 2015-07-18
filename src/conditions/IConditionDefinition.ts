import {IModifier} from '../Modifiers';
import IVariables from '../IVariables';
interface IConditionDefinition {
    template: string;
    items: Array<string | IModifier[]>;
    rule: (variable: string, comparative: string, variables: IVariables) => boolean;
}
export default IConditionDefinition;