import {ExpressionResult} from './expressions';

export interface BaseModifier{
    identifiers: string[],
}

export interface BooleanModifier extends BaseModifier{
    rule: (prevResult: ExpressionResult, values?: string[]) => boolean;
}

export type Modifier = BooleanModifier;

/**
 * @internal
 */
export var Not: BooleanModifier = {
    identifiers: ['!', 'not'],
    rule: (prevResult: ExpressionResult, values: string[]) => !prevResult
};

/**
 * @internal
 */
export var OrEqual: BooleanModifier = {
    identifiers: ['='],
    rule: (prevResult: ExpressionResult, values: string[]) => prevResult || values[0] === values[1]
};

/**
 * @internal
 */
export var LengthOrEqual: BooleanModifier = {
    identifiers: ['='],
    rule: (prevResult: ExpressionResult, values: string[]) => prevResult || values[0].length === +values[1]
};

/**
 * @internal
 */
export var BetweenOrEqual: BooleanModifier = {
    identifiers: ['='],
    rule: (prevResult: ExpressionResult, values: string[]) => prevResult || +values[0] === +values[1] || +values[0] === +values[2]
};

export var CORE_MODIFIERS: Modifier[] = [
    Not,
    OrEqual,
    LengthOrEqual,
    BetweenOrEqual
];