import IModifierDefinition from './modifiers/IModifierDefinition';
import IVariables from './IVariables';

let NotDefinition: IModifierDefinition = {
    identifiers: [/!/i, /(?:\b|\s+)not(?:\b|\s+)/i],
    rule: (pass: boolean, variable: string, comparative: string | string[], variables: IVariables): boolean => !pass
}
export let Not = new Modifier(NotDefinition);

let OrEqualDefinition: IModifierDefinition = {
    identifiers: [/=/i],
    rule: (pass: boolean, variable: string, comparative: string | string[], variables: IVariables): boolean => pass || variables[variable] === comparative
}
export let OrEqual = new Modifier(OrEqualDefinition);