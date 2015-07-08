import IModifier from './IModifier';
import IVariables from '../IVariables';
const OrEqual: IModifier = {
    identifiers: [/=/i],
    perform: (result: boolean, variable: string, variables: IVariables, comparative: string): boolean => {
        return result || variables[variable] === comparative;
    },
    matches: (item): boolean => {
        for(let identifier of OrEqual.identifiers){
            if(identifier.test(item)) return true;
        }
        return false;
    }
}
export default OrEqual;