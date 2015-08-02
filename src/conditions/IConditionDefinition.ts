import {Modifier} from '../Modifiers';
import IVariables from '../IVariables';
import Value from '../Value';
interface IConditionDefinition {
    template: string;
    items: Array<string | Modifier[]>;
    modOrder: number[];
    rule: (values: Value[], variables: IVariables) => boolean;
}
export default IConditionDefinition;