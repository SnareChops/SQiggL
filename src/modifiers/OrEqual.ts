import IModifier from './IModifier';
import IVariables from '../IVariables';
const OrEqual: IModifier = {
    identifiers: [/=/i, /or\s+equal\s+to\s+/i],
    perform: (result: boolean, variable: string, variables: IVariables, comparative: string): boolean => {
        return result || variables[variable] === comparative;
    }
}
export default OrEqual;