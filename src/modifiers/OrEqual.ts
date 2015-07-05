import IModifier from './IModifier';
import IVariables from '../IVariables';
export default class OrEqual implements IModifier {
    public static identifiers: string[] = ['=', 'or\\s+equal\\s+to\\s+'];
    
    public perform(result: boolean, variable: string, variables: IVariables, comparative: string): boolean {
        return result || variables[variable] === comparative;
    }
}