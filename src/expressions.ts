import {Modifier, Not, OrEqual, LengthOrEqual, BetweenOrEqual} from './modifiers';
import {ScopedVariables} from './variables';

export interface OrderedModifier{
    [key: number]: Modifier;
}

export type ExpressionRule = (values: ExpressionValue[]) => boolean | string | string[];
export type ExpressionValue = string | number | boolean | (string | number | boolean)[];
export type ExpressionTemplate = (string | OrderedModifier[])[];

export abstract class Expression{
    public template: ExpressionTemplate;
    public suppressUndefinedVariableError: boolean;
    public rule: ExpressionRule;
}


export class BooleanExpression extends Expression{
    constructor(public template: ExpressionTemplate, public rule: (values: ExpressionValue[]) => boolean, public suppressUndefinedVariableError: boolean = false){super();}
}

export class ValueExpression extends Expression{
    constructor(public template: ExpressionTemplate, public rule: (values: ExpressionValue[]) => string, public suppressUndefinedVariableError: boolean = false){super();}
}

export class IterableExpression extends Expression{
    constructor(public template: ExpressionTemplate, public rule: (values: ExpressionValue[]) => string[], public suppressUndefinedVariableError: boolean = false){super();}
}

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

export var Equal: BooleanExpression = new BooleanExpression([VALUE, SPACE,[{1: Not}], '=', [{0: OrEqual}], SPACE, VALUE], (values: ExpressionValue[]) => {
    return values[0] == values[1];
});

export var GreaterThan: BooleanExpression = new BooleanExpression([VALUE, SPACE, [{1: Not}], '>', [{0: OrEqual}], SPACE, VALUE], (values: ExpressionValue[]) => {
    return (+values[0]) > (+values[1]);
});

export var LessThan: BooleanExpression = new BooleanExpression([VALUE, SPACE, [{1: Not}], '<', [{0: OrEqual}], SPACE, VALUE], (values: ExpressionValue[]) => {
    return (+values[0]) < (+values[1])
});

export var IsNull: BooleanExpression = new BooleanExpression([VALUE, SPACE, 'is', SPACE, [{0: Not}], 'null'], (values: ExpressionValue[]) => {
    return values[0] == null;
}, true);

export var LexicalGreaterThan: BooleanExpression = new BooleanExpression([VALUE, SPACE, [{1: Not}], 'abc>', [{0: OrEqual}], SPACE, VALUE], (values: ExpressionValue[]) => {
    return [values[0], values[1]].sort().indexOf(values[0]) > 0;
});

export var LexicalLessThan: BooleanExpression = new BooleanExpression([VALUE, SPACE, [{1: Not}], 'abc<', [{0: OrEqual}], SPACE, VALUE], (values: ExpressionValue[]) => {
    return values[0] === values[1] ? false : [values[0], values[1]].sort().indexOf(values[0]) === 0;
});

export var LengthGreaterThan: BooleanExpression = new BooleanExpression([VALUE, SPACE, [{1: Not}], 'len>', [{0: LengthOrEqual}], SPACE, VALUE], (values: ExpressionValue[]) => {
    return values[0].toString().length > +values[1];
});

export var LengthLessThan: BooleanExpression = new BooleanExpression([VALUE, SPACE, [{1: Not}], 'len<', [{0: LengthOrEqual}], SPACE, VALUE], (values: ExpressionValue[]) => {
    return values[0].toString().length < +values[1];
});

export var IsNaN: BooleanExpression = new BooleanExpression([VALUE, SPACE, 'is', SPACE, [{0: Not}], 'NaN'], (values: ExpressionValue[]) => {
    return isNaN(Number(values[0]));
});

export var Between: BooleanExpression = new BooleanExpression([VALUE, SPACE, VALUE, SPACE, '>', [{1: Not}], [{0: BetweenOrEqual}], '<', SPACE, VALUE], (values: ExpressionValue[]) => {
    return values[1] < values[0] && values[2] > values[0];
});

export var Coalesce: ValueExpression = new ValueExpression([VALUE, SPACE, '??', SPACE, VALUE], (values: ExpressionValue[]) => {
    return (values[0] || values[1]).toString();
}, true);

export var IterableOfUsing: IterableExpression = new IterableExpression([LOCALVARIABLE, SPACE, 'of', SPACE, VALUE, SPACE, 'using', SPACE, JOINER], (values: ExpressionValue[]) => {
    return <string[]>values[0];
});

export var VerboseTernary: ValueExpression = new ValueExpression(['if', SPACE, VALUE, SPACE, 'then', SPACE, VALUE, SPACE, 'else', SPACE, VALUE], (values: ExpressionValue[]) => {
    return values[0] === true ? values[1].toString() : values[2].toString();
});

export var Ternary: ValueExpression = new ValueExpression([VALUE, SPACE, '?', SPACE, VALUE, SPACE, ':', SPACE, VALUE], (values: ExpressionValue[]) => {
    return values[0] === true ? values[1].toString(): values[2].toString();
});

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