import {Modifier, Not, OrEqual, LengthOrEqual, BetweenOrEqual} from './modifiers';
import {ScopedVariables} from './parser';

export interface OrderedModifier{
    [key: number]: Modifier;
}

export interface BaseExpression{
    template: (string | OrderedModifier[])[];
    regex?: RegExp;
    suppressUndefinedVariableError?: boolean;
}

export type ExpressionValue = string | number | boolean | (string | number | boolean)[];

export interface BooleanExpression extends BaseExpression{
    rule: (values?: ExpressionValue[], literal?: string) => boolean;
}

export interface ValueExpression extends BaseExpression{
    rule: (values?: ExpressionValue[], literal?: string) => string;
}

export interface IterableExpression extends BaseExpression{
    rule: (values?: ExpressionValue[], literal?: string) => string[];
}

export type Expression = BooleanExpression | ValueExpression | IterableExpression;

export interface IterableExpressionParts{
    local: string;
    joiner: string;
}

export interface BooleanExpressionResult{
    value: boolean;
}

export interface ValueExpressionResult{
    value: string;
}

export interface IterableExpressionResult{
    value: string[];
    iterable?: IterableExpressionParts;
}

export type ExpressionResult = BooleanExpressionResult | ValueExpressionResult | IterableExpressionResult;

export var VALUE: string = '(v)';
export var LOCALVARIABLE: string = '(l)';
export var JOINER: string = '(j)';
export var SPACE: string = ' ';

/**
 * @internal
 */
export var Equal: BooleanExpression = {
    template: [VALUE, SPACE,[{1: Not}], '=', [{0: OrEqual}], SPACE, VALUE],
    rule: (values: (string | number)[]) => values[0] == values[1]
};

/**
 * @internal
 */
export var GreaterThan: BooleanExpression = {
    template: [VALUE, SPACE, [{1: Not}], '>', [{0: OrEqual}], SPACE, VALUE],
    rule: (values: (string | number)[]) => (+values[0]) > (+values[1])
};

/**
 * @internal
 */
export var LessThan: BooleanExpression = {
    template: [VALUE, SPACE, [{1: Not}], '<', [{0: OrEqual}], SPACE, VALUE],
    rule: (values: (string | number)[]) => (+values[0]) < (+values[1])
};

/**
 * @internal
 */
export var IsNull: BooleanExpression = {
    template: [VALUE, SPACE, 'is', SPACE, [{0: Not}], 'null'],
    rule: (values: (string | number)[]) => values[0] == null,
    suppressUndefinedVariableError: true
};

/**
 * @internal
 */
export var LexicalGreaterThan: BooleanExpression = {
    template: [VALUE, SPACE, [{1: Not}], 'abc>', [{0: OrEqual}], SPACE, VALUE],
    rule: (values: string[]) => [values[0], values[1]].sort().indexOf(values[0]) > 0
};

/**
 * @internal
 */
export var LexicalLessThan: BooleanExpression = {
    template: [VALUE, SPACE, [{1: Not}], 'abc<', [{0: OrEqual}], SPACE, VALUE],
    rule: (values: string[]) => values[0] === values[1] ? false : [values[0], values[1]].sort().indexOf(values[0]) === 0
};

/**
 * @internal
 */
export var LengthGreaterThan: BooleanExpression = {
    template: [VALUE, SPACE, [{1: Not}], 'len>', [{0: LengthOrEqual}], SPACE, VALUE],
    rule: (values: string[]) => values[0].length > +values[1]
};

/**
 * @internal
 */
export var LengthLessThan: BooleanExpression = {
    template: [VALUE, SPACE, [{1: Not}], 'len<', [{0: LengthOrEqual}], SPACE, VALUE],
    rule: (values: string[]) => values[0].length < +values[1]
};

/**
 * @internal
 */
export var IsNaN: BooleanExpression = {
    template: [VALUE, SPACE, 'is', SPACE, [{0: Not}], 'NaN'],
    rule: (values: string[]) => isNaN(Number(values[0]))
};

/**
 * @internal
 */
export var Between: BooleanExpression = {
    template: [VALUE, SPACE, VALUE, SPACE, '>', [{1: Not}], [{0: BetweenOrEqual}], '<', SPACE, VALUE],
    rule: (values: (string | number)[]) => values[1] < values[0] && values[2] > values[0]
};

/**
 * @internal
 */
export var Coalesce: ValueExpression = {
    template: [VALUE, SPACE, '??', SPACE, VALUE],
    rule: (values: (string | number)[]) => (values[0] || values[1]).toString(),
    suppressUndefinedVariableError: true
};

/**
 * @internal
 */
export var IterableOfUsing: IterableExpression = {
    template: [LOCALVARIABLE, SPACE, 'of', SPACE, VALUE, SPACE, 'using', SPACE, JOINER],
    rule: (values: ExpressionValue[]) => <string[]>values[0]
};

export var VerboseTernary: ValueExpression = {
    template: ['if', SPACE, VALUE, SPACE, 'then', SPACE, VALUE, SPACE, 'else', SPACE, VALUE],
    rule: (values: ExpressionValue[]) => values[0] === true ? <string>values[1] : <string>values[2]
};

export var Ternary: ValueExpression = {
    template: [VALUE, SPACE, '?', SPACE, VALUE, SPACE, ':', SPACE, VALUE],
    rule: (values: ExpressionValue[]) => values[0] === true ? <string>values[1] : <string>values[2]
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
    Between,
    Coalesce,
    IterableOfUsing,
    VerboseTernary,
    Ternary
];