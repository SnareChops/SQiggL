import IConditionDefinition from './conditions/IConditionDefinition';
import IVariables from './IVariables';
import Condition from './conditions/Condition';
import {Not, OrEqual, LengthOrEqual} from './Modifiers';
import Value from './Value';
let EqualDefinition: IConditionDefinition = {
    template: '(v) (m)=(m) (v)',
    items: ['value', [Not, OrEqual], [OrEqual], 'value'],
    modOrder: [1,0],
    rule: (values: Value[], variables: IVariables): boolean => values[0].evaluate(variables) === values[1].evaluate(variables)
}
export let Equal = new Condition(EqualDefinition);

let GreaterThanDefinition: IConditionDefinition = {
    template: '(v) (m)>(m) (v)',
    items: ['value', [Not], [OrEqual], 'value'],
    modOrder: [1,0],
    rule: (values: Value[], variables: IVariables): boolean => values[0].evaluate(variables) > values[1].evaluate(variables)
}
export let GreaterThan = new Condition(GreaterThanDefinition);

let LessThanDefinition: IConditionDefinition = {
    template: '(v) (m)<(m) (v)',
    items: ['value', [Not], [OrEqual], 'value'],
    modOrder: [1,0],
    rule: (values: Value[], variables: IVariables): boolean => values[0].evaluate(variables) < values[1].evaluate(variables)
}
export let LessThan = new Condition(LessThanDefinition);

let IsNullDefinition: IConditionDefinition = {
    template: '(v) is (m) null',
    items: ['value', [Not]],
    modOrder: [0],
    rule: (values: Value[], variables: IVariables): boolean => values[0].evaluate(variables) == null
}
export let IsNull = new Condition(IsNullDefinition);

let AlphabeticallyGreaterThanDefinition: IConditionDefinition = {
    template: '(v) (m)abc>(m) (v)',
    items: ['value', [Not], [OrEqual], 'value'],
    modOrder: [1,0],
    rule: (values: Value[], variables: IVariables): boolean => [values[0].evaluate(variables), values[1].evaluate(variables)].sort().indexOf(values[0].evaluate(variables)) > 0
}
export let AlphabeticallyGreaterThan = new Condition(AlphabeticallyGreaterThanDefinition);

let AlphabeticallyLessThanDefinition: IConditionDefinition = {
    template: '(v) (m)abc<(m) (v)',
    items: ['value', [Not], [OrEqual], 'value'],
    modOrder: [1,0],
    rule: (values: Value[], variables: IVariables): boolean => values[0].evaluate(variables) === values[1].evaluate(variables) ? false : [values[0].evaluate(variables), values[1].evaluate(variables)].sort().indexOf(values[0].evaluate(variables)) === 0
}
export let AlphabeticallyLessThan = new Condition(AlphabeticallyLessThanDefinition);

let LengthGreaterThanDefinition: IConditionDefinition = {
    template: '(v) (m)len>(m) (v)',
    items: ['value', [Not], [LengthOrEqual], 'value'],
    modOrder: [1,0],
    rule: (values: Value[], variables: IVariables): boolean => (<string>values[0].evaluate(variables)).length > values[1].evaluate(variables)
}
export let LengthGreaterThan = new Condition(LengthGreaterThanDefinition);

let LengthLessThanDefinition: IConditionDefinition = {
    template: '(v) (m)len<(m) (v)',
    items: ['value', [Not], [LengthOrEqual], 'value'],
    modOrder: [1,0],
    rule: (values: Value[], variables: IVariables): boolean => (<string>values[0].evaluate(variables)).length < values[1].evaluate(variables)
}
export let LengthLessThan = new Condition(LengthLessThanDefinition);

let IsNaNDefinition: IConditionDefinition = {
    template: '(v) is (m)NaN',
    items: ['value', [Not]],
    modOrder: [0],
    rule: (values: Value[], variables: IVariables): boolean => isNaN((<number>values[0].evaluate(variables)))
}
export let IsNaN = new Condition(IsNaNDefinition);

let BetweenDefinition: IConditionDefinition = {
    template: '(v) (v)>(m)<(v)',
    items: ['value', 'value', [Not, OrEqual], 'value'],
    modOrder: [0],
    rule: (values: Value[], variables: IVariables): boolean => values[1].evaluate(variables) > values[0].evaluate(variables) && values[2].evaluate(variables) < values[0].evaluate(variables) 
}
export let Between = new Condition(BetweenDefinition);

export {default as Condition} from './conditions/Condition';
