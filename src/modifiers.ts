import {ExpressionResult} from './expressions';

export interface Modifier{
    identifiers: string[],
    rule: (prevResult: ExpressionResult, values?: string[]) => ExpressionResult;
}

export var Not: Modifier = {
    identifiers: ['!', 'not'],
    rule: (prevResult: ExpressionResult, values: string[]) => !prevResult
};

export var OrEqual: Modifier = {
    identifiers: ['='],
    rule: (prevResult: ExpressionResult, values: string[]) => prevResult || values[0] === values[1]
};

export var LengthOrEqual: Modifier = {
    identifiers: ['='],
    rule: (prevResult: ExpressionResult, values: string[]) => prevResult || values[0].length === +values[1]
};

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