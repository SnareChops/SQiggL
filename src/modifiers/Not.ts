import IModifier from './IModifier';
import IVariables from '../IVariables';
export default class Not implements IModifier {
    public static identifiers: string[] = ['!', 'not\\s+', 'is\\s+not\\s+'];
    
    public perform(result: boolean, variable: string, variables: IVariables, comparative: string): boolean{
        return !result;
    }
}