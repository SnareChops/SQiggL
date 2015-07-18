import IVariables from '../IVariables';

interface IModifierDefinition {
    identifiers: RegExp[];
    rule: (pass: boolean, variable: string, comparative: string | string[], variables: IVariables) => boolean;
}
export default IModifierDefinition;