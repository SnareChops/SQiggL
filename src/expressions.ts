import {Modifier, Not, OrEqual, LengthOrEqual, BetweenOrEqual} from './modifiers';
import {ScopedVariables} from './parser';

export interface OrderedModifier{
    [key: number]: Modifier;
}

export interface BaseExpression{
    template: (string | OrderedModifier[])[];
    regex?: RegExp;
}

export interface BooleanExpression extends BaseExpression{
    rule: (values?: string[], literal?: string) => boolean;
}

export interface ValueExpression extends BaseExpression{
    rule: (values?: string[], literal?: string) => string;
}

export type Expression = BooleanExpression | ValueExpression;

export var VALUE: string = '(v)';
export var SPACE: string = ' ';

export var Equal: BooleanExpression = {
    template: [VALUE, SPACE,[{1: Not}, {2: OrEqual}], '=', [{0: OrEqual}], SPACE, VALUE],
    rule: (values: string[]) => values[0] == values[1]
};

export var GreaterThan: BooleanExpression = {
    template: [VALUE, SPACE, [{1: Not}], '>', [{0: OrEqual}], SPACE, VALUE],
    rule: (values: string[]) => (+values[0]) > (+values[1])
};

export var LessThan: BooleanExpression = {
    template: [VALUE, SPACE, [{1: Not}], '<', [{0: OrEqual}], SPACE, VALUE],
    rule: (values: string[]) => (+values[0]) < (+values[1])
};

export var IsNull: BooleanExpression = {
    template: [VALUE, SPACE, 'is', SPACE, [{0: Not}], SPACE, 'null'],
    rule: (values: string[]) => !values[0]
};

export var LexicalGreaterThan: BooleanExpression = {
    template: [VALUE, SPACE, [{1: Not}], 'abc>', [{0: OrEqual}], SPACE, VALUE],
    rule: (values: string[]) => [values[0], values[1]].sort().indexOf(values[0]) > 0
};

export var LexicalLessThan: BooleanExpression = {
    template: [VALUE, SPACE, [{1: Not}], 'abc<', [{0: OrEqual}], SPACE, VALUE],
    rule: (values: string[]) => values[0] === values[1] ? false : [values[0], values[1]].sort().indexOf(values[0]) === 0
};

export var LengthGreaterThan: BooleanExpression = {
    template: [VALUE, SPACE, [{1: Not}], 'len>', [{0: LengthOrEqual}], SPACE, VALUE],
    rule: (values: string[]) => values[0].length > values[1].length
};

export var LengthLessThan: BooleanExpression = {
    template: [VALUE, SPACE, [{1: Not}], 'len<', [{0: LengthOrEqual}], SPACE, VALUE],
    rule: (values: string[]) => values[0].length < values[1].length
};

export var IsNaN: BooleanExpression = {
    template: [VALUE, SPACE, 'is', SPACE, [{0: Not}], 'NaN'],
    rule: (values: string[]) => isNaN(Number(values[0]))
};

export var Between: BooleanExpression = {
    template: [VALUE, SPACE, VALUE, '>', [{1: Not}], [{0: BetweenOrEqual}], '<', VALUE],
    rule: (values: string[]) => values[1] < values[0] && values[2] > values[0]
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