import IConditionDefinition from './conditions/IConditionDefinition';
import IVariables from './IVariables';
import Condition from './conditions/Condition';
import {Not, OrEqual} from './Modifiers';
let EqualDefinition: IConditionDefinition = {
    template: '(v) (m)=(m) (c)',
    items: ['variable', [Not, OrEqual], [OrEqual], 'comparative'],
    rule: (variable: string, comparative: string, variables: IVariables): boolean => variables[variable] === comparative
}
export let Equal = new Condition(EqualDefinition);

let GreaterThanDefinition: IConditionDefinition = {
    template: '(v) (m)>(m) (c)',
    items: ['variable', [Not], [OrEqual], 'comparative'],
    rule: (variable: string, comparative: string, variables: IVariables): boolean => parseFloat(variables[variable]) > parseFloat(comparative)
}
export let GreaterThan = new Condition(GreaterThanDefinition);

let LessThanDefinition: IConditionDefinition = {
    template: '(v) (m)<(m) (c)',
    items: ['variable', [Not], [OrEqual], 'comparative'],
    rule: (variable: string, comparative: string, variables: IVariables): boolean => parseFloat(variables[variable]) < parseFloat(comparative)
}
export let LessThan = new Condition(LessThanDefinition);

let IsNullDefinition: IConditionDefinition = {
    template: '(v) is (m) null',
    items: ['variable', [Not]],
    rule: (variable: string, comparative: string, variables: IVariables): boolean => variables[variable] == null
}
export let IsNull = new Condition(IsNullDefinition);

let AlphabeticallyGreaterThanDefinition: IConditionDefinition = {
    template: '(v) (m)abc>(m) (c)',
    items: ['variable', [Not], [OrEqual], 'comparative'],
    rule: (variable: string, comparative: string, variables: IVariables): boolean => [variables[variable], this.comparative].sort().indexOf(comparative) > 0
}
export let AlphabeticallyGreaterThan = new Condition(AlphabeticallyGreaterThanDefinition);

let AlphabeticallyLessThanDefinition: IConditionDefinition = {
    template: '(v) (m)abc<(m) (c)',
    items: ['variable', [Not], [OrEqual], 'comparative'],
    rule: (variable: string, comparative: string, variables: IVariables): boolean => [variables[variable], comparative].sort().indexOf(comparative) === 0
}
export let AlphabeticallyLessThan = new Condition(AlphabeticallyLessThanDefinition);

let LengthGreaterThanDefinition: IConditionDefinition = {
    template: '(v) (m)len>(m) (c)',
    items: ['variable', [Not], [OrEqual], 'comparative'],
    rule: (variable: string, comparative: string, variables: IVariables): boolean => variables[variable].length > parseInt(comparative)
}
export let LengthGreaterThan = new Condition(LengthGreaterThanDefinition);

let LengthLessThanDefinition: IConditionDefinition = {
    template: '(v) (m)len<(m) (c)',
    items: ['variable', [Not], [OrEqual], 'comparative'],
    rule: (variable: string, comparative: string, variables: IVariables): boolean => variables[variable].length < parseInt(comparative)
}
export let LengthLessThan = new Condition(LengthLessThanDefinition);

let IsNaNDefinition: IConditionDefinition = {
    template: '(v) is (m) NaN',
    items: ['variable', [Not]],
    rule: (variable: string, comparative: string, variables: IVariables): boolean => isNaN(variables[variable])
}
export let IsNaN = new Condition(IsNaNDefinition);

let BetweenDefinition: IConditionDefinition = {
    template: '(v) (c)>(m)<(c)',
    items: ['variable', 'comparative', [Not, OrEqual], 'comparative'],
    rule: (variable: string, comparative: string[], variables: IVariables): boolean => parseFloat(comparative[0]) > parseFloat(variables[variable]) && parseFloat(comparative[1]) < parseFloat(variables[variable]) 
}
export let Between = new Condition(BetweenDefinition);

export {default as Condition} from './conditions/Condition';
