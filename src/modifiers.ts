import {ExpressionResult} from './expressions';

export interface Modifier{
    identifiers: string[],
    rule: (prevResult: ExpressionResult, values?: string[]) => ExpressionResult;
}

/**
 * @internal
 */
export var Not: Modifier = {
    identifiers: ['!', 'not'],
    rule: (prevResult: ExpressionResult, values: string[]) => !prevResult
};

/**
 * @internal
 */
export var OrEqual: Modifier = {
    identifiers: ['='],
    rule: (prevResult: ExpressionResult, values: string[]) => prevResult || values[0] === values[1]
};

/**
 * @internal
 */
export var LengthOrEqual: Modifier = {
    identifiers: ['='],
    rule: (prevResult: ExpressionResult, values: string[]) => prevResult || values[0].length === +values[1]
};

/**
 * @internal
 */
export var BetweenOrEqual: Modifier = {
    identifiers: ['='],
    rule: (prevResult: ExpressionResult, values: string[]) => prevResult || +values[0] === +values[1] || +values[0] === +values[2]
};

export var CORE_MODIFIERS: Modifier[] = [
    Not,
    OrEqual,
    LengthOrEqual,
    BetweenOrEqual
];