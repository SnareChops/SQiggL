import {Modifier} from '../Modifiers';
import Command from '../Command';
import IVariables from '../IVariables';
import Value from '../Value';
interface IExpressionDefinition {
    template: string;
    items: Array<string | Modifier[]>;
    modOrder: number[];
    rule: (command: Command, values: Value[], variables: IVariables) => any;
}
export default IExpressionDefinition;