import IExpressionDefinition from './expressions/IExpressionDefinition';
import IVariables from './IVariables';
import Expression from './expressions/Expression';
import {Not, OrEqual, LengthOrEqual, BetweenOrEqual} from './Modifiers';
import Value from './Value';
import Command from './Command';
let EqualDefinition: IExpressionDefinition = {
    template: '(v) (m)=(m) (v)',
    items: ['value', [Not, OrEqual], [OrEqual], 'value'],
    modOrder: [1,0],
    rule: (command: Command, values: Value[], variables: IVariables): boolean => values[0].evaluate(variables) === values[1].evaluate(variables)
}
export let Equal = new Expression(EqualDefinition);

let GreaterThanDefinition: IExpressionDefinition = {
    template: '(v) (m)>(m) (v)',
    items: ['value', [Not], [OrEqual], 'value'],
    modOrder: [1,0],
    rule: (command: Command, values: Value[], variables: IVariables): boolean => values[0].evaluate(variables) > values[1].evaluate(variables)
}
export let GreaterThan = new Expression(GreaterThanDefinition);

let LessThanDefinition: IExpressionDefinition = {
    template: '(v) (m)<(m) (v)',
    items: ['value', [Not], [OrEqual], 'value'],
    modOrder: [1,0],
    rule: (command: Command, values: Value[], variables: IVariables): boolean => values[0].evaluate(variables) < values[1].evaluate(variables)
}
export let LessThan = new Expression(LessThanDefinition);

let IsNullDefinition: IExpressionDefinition = {
    template: '(v) is (m) null',
    items: ['value', [Not]],
    modOrder: [0],
    rule: (command: Command, values: Value[], variables: IVariables): boolean => values[0].evaluate(variables) == null
}
export let IsNull = new Expression(IsNullDefinition);

let AlphabeticallyGreaterThanDefinition: IExpressionDefinition = {
    template: '(v) (m)abc>(m) (v)',
    items: ['value', [Not], [OrEqual], 'value'],
    modOrder: [1,0],
    rule: (command: Command, values: Value[], variables: IVariables): boolean => [values[0].evaluate(variables), values[1].evaluate(variables)].sort().indexOf(values[0].evaluate(variables)) > 0
}
export let AlphabeticallyGreaterThan = new Expression(AlphabeticallyGreaterThanDefinition);

let AlphabeticallyLessThanDefinition: IExpressionDefinition = {
    template: '(v) (m)abc<(m) (v)',
    items: ['value', [Not], [OrEqual], 'value'],
    modOrder: [1,0],
    rule: (command: Command, values: Value[], variables: IVariables): boolean => values[0].evaluate(variables) === values[1].evaluate(variables) ? false : [values[0].evaluate(variables), values[1].evaluate(variables)].sort().indexOf(values[0].evaluate(variables)) === 0
}
export let AlphabeticallyLessThan = new Expression(AlphabeticallyLessThanDefinition);

let LengthGreaterThanDefinition: IExpressionDefinition = {
    template: '(v) (m)len>(m) (v)',
    items: ['value', [Not], [LengthOrEqual], 'value'],
    modOrder: [1,0],
    rule: (command: Command, values: Value[], variables: IVariables): boolean => (<string>values[0].evaluate(variables)).length > values[1].evaluate(variables)
}
export let LengthGreaterThan = new Expression(LengthGreaterThanDefinition);

let LengthLessThanDefinition: IExpressionDefinition = {
    template: '(v) (m)len<(m) (v)',
    items: ['value', [Not], [LengthOrEqual], 'value'],
    modOrder: [1,0],
    rule: (command: Command, values: Value[], variables: IVariables): boolean => (<string>values[0].evaluate(variables)).length < values[1].evaluate(variables)
}
export let LengthLessThan = new Expression(LengthLessThanDefinition);

let IsNaNDefinition: IExpressionDefinition = {
    template: '(v) is (m)NaN',
    items: ['value', [Not]],
    modOrder: [0],
    rule: (command: Command, values: Value[], variables: IVariables): boolean => isNaN((<number>values[0].evaluate(variables)))
}
export let IsNaN = new Expression(IsNaNDefinition);

let BetweenDefinition: IExpressionDefinition = {
    template: '(v) (v)>(m)<(v)',
    items: ['value', 'value', [Not, BetweenOrEqual], 'value'],
    modOrder: [0],
    rule: (command: Command, values: Value[], variables: IVariables): boolean => values[1].evaluate(variables) < values[0].evaluate(variables) && values[2].evaluate(variables) > values[0].evaluate(variables) 
}
export let Between = new Expression(BetweenDefinition);

let ForInUsingDefinition: IExpressionDefinition = {
    template: '(v) in (c) using (j)',
    items: ['value', 'collection', 'joiner'],
    modOrder: [],
    rule: (command: Command, values: Value[], variables: IVariables): string => {
        let i=0, result = '';
        for(i=0;i<(<any[]>values[1].evaluate(variables)).length;i++){
            variables[<string>values[0].value] = values[1].evaluate(variables)[i];
            result += `${command.scope.perform()}`
        }
        return result;
    }
}
export let ForInUsing = new Expression(ForInUsingDefinition);

export {default as Expression} from './expressions/Expression';
