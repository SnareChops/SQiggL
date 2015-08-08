import IModifierDefinition from './modifiers/IModifierDefinition';
import Modifier from './modifiers/Modifier';
import IVariables from './IVariables';
import Value from './Value';

let NotDefinition: IModifierDefinition = {
    identifiers: [/!/i, /(?:\b|\s+)not(?:\b|\s+)/i],
    rule: (pass: boolean, values: Value[], variables: IVariables): boolean => !pass
}
export let Not = new Modifier(NotDefinition);

let OrEqualDefinition: IModifierDefinition = {
    identifiers: [/=/i],
    rule: (pass: boolean, values: Value[], variables: IVariables): boolean => pass || values[0].evaluate(variables) === values[1].evaluate(variables)
}
export let OrEqual = new Modifier(OrEqualDefinition);

let LengthOrEqualDefinition: IModifierDefinition = {
    identifiers: [/=/i],
    rule: (pass: boolean, values: Value[], variables: IVariables): boolean => pass || (<string>values[0].evaluate(variables)).length === values[1].evaluate(variables)
}
export let LengthOrEqual = new Modifier(LengthOrEqualDefinition);

export {default as IModifierDefinition} from './modifiers/IModifierDefinition';
export {default as Modifier} from './modifiers/Modifier'; 