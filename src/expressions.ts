import {Modifier, Not, OrEqual, LengthOrEqual, BetweenOrEqual} from './modifiers';
import {ScopedVariables} from './parser';

export interface OrderedModifier{
    [key: number]: Modifier;
}

export interface Expression{
    template: (string | OrderedModifier[])[];
    regex?: RegExp;
}

export interface BooleanExpression extends Expression{
    rule: (values?: string[], literal?: string) => boolean;
}

export interface ValueExpression extends Expression{
    rule: (values?: string[], literal?: string) => string;
}

export var VALUE: string = '(v)';
export var SPACE: string = ' ';

export var Equal: BooleanExpression = {
    template: [VALUE, SPACE,[{1: Not}, {2: OrEqual}], '=', [{0: OrEqual}], SPACE, VALUE],
    rule: (values: string[]) => values[0] == values[1]
};

export var GreaterThan: BooleanExpression = {
    template: [VALUE, SPACE, [{1: Not}], '>', [{0: OrEqual}], SPACE, VALUE],
    rule: (values: string[]) => parseFloat(values[0]) > parseFloat(values[1])
};

export var LessThan: BooleanExpression = {
    template: [VALUE, SPACE, [{1: Not}], '<', [{0: OrEqual}], SPACE, VALUE],
    rule: (values: string[]) => parseFloat(values[0]) < parseFloat(values[1])
};

export var IsNull: BooleanExpression = {
    template: [VALUE, SPACE, 'is', SPACE, [{0: Not}], SPACE, 'null'],
    rule: (values: string[]) => values[0] === '' || values[0] == null
};

export var LexicalGreaterThan: Expression = {
    template: [VALUE, SPACE, [{1: Not}], 'abc>', [{0: OrEqual}], SPACE, VALUE]
};

export var LexicalLessThan: Expression = {
    template: [VALUE, SPACE, [{1: Not}], 'abc<', [{0: OrEqual}], SPACE, VALUE]
};

export var LengthGreaterThan: Expression = {
    template: [VALUE, SPACE, [{1: Not}], 'len>', [{0: LengthOrEqual}], SPACE, VALUE]
};

export var LengthLessThan: Expression = {
    template: [VALUE, SPACE, [{1: Not}], 'len<', [{0: LengthOrEqual}], SPACE, VALUE]
};

export var IsNaN: Expression = {
    template: [VALUE, SPACE, 'is', SPACE, [{0: Not}], 'NaN']
};

export var Between: Expression = {
    template: [VALUE, SPACE, VALUE, '>', [{1: Not}], [{0: BetweenOrEqual}], '<', VALUE]
};

export var CORE_EXPRESSIONS: Expression[] = [
    Equal,
    GreaterThan,
    LessThan,
    IsNull,
    LexicalGreaterThan,
    LexicalLessThan,
    LengthGreaterThan,
    LengthLessThan,
    IsNaN,
    Between
];