import {Modifier, Not, OrEqual, LengthOrEqual, BetweenOrEqual} from './modifiers';

export interface OrderedModifier{
    [key: number]: Modifier;
}

export interface Expression{
    template: (string | OrderedModifier[])[];
    regex?: RegExp;
    rule?: Function;
}

export var VALUE: string = '(v)';
export var SPACE: string = ' ';

export var Equal: Expression = {
    template: [VALUE, SPACE,[{1: Not}, {2: OrEqual}], '=', [{0: OrEqual}], SPACE, VALUE]
};

export var GreaterThan: Expression = {
    template: [VALUE, SPACE, [{1: Not}], '>', [{0: OrEqual}], SPACE, VALUE]
};

export var LessThan: Expression = {
    template: [VALUE, SPACE, [{1: Not}], '<', [{0: OrEqual}], SPACE, VALUE]
};

export var IsNull: Expression = {
    template: [VALUE, SPACE, 'is', SPACE, [{0: Not}], SPACE, 'null']
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