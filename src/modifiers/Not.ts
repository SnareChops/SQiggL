import IModifier from './IModifier';
import IVariables from '../IVariables';
const Not:IModifier = {
    identifiers: [/!/i, /(?:\b|\s+)not(?:\b|\s+)/i],
    perform: (result: boolean, variable: string, variables: IVariables, comparative: string): boolean => {return !result;},
    matches: (item): boolean => {
        for(let identifier of Not.identifiers){
            if(identifier.test(item)) return true;
        }
        return false;
    }
}
export default Not;