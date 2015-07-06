import IVariables from '../IVariables';

interface IModifier {
    identifiers: RegExp[];
    perform(result:boolean, variable: string, variables: IVariables, comparative: string):boolean;
}
export default IModifier;