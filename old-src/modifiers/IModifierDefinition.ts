import IVariables from '../IVariables';
import Value from '../Value';

interface IModifierDefinition {
    identifiers: RegExp[];
    rule: (pass: boolean, values: Value[], variables: IVariables) => boolean;
}
export default IModifierDefinition;