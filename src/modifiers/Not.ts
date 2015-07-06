import IModifier from './IModifier';
import IVariables from '../IVariables';
const Not:IModifier = {
    identifiers: [/!/i, /not\s+/i, /is\s+not\s+/i],
    perform: (result: boolean, variable: string, variables: IVariables, comparative: string): boolean => {return !result;}
}
export default Not;