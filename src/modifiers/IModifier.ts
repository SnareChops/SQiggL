import IVariables from '../IVariables';

interface IModifier {
    perform(result:boolean, variable: string, variables: IVariables, comparative: string):boolean;
}
export default IModifier;