import {ExpressionResult, BooleanExpressionResult, ExpressionValue} from './expressions';

export type ModifierRule = (prevResult: boolean, values?: ExpressionValue[]) => boolean;

export abstract class Modifier{
    public identifiers: string[];
    public rule: ModifierRule;
}

export class BooleanModifier extends Modifier{
    constructor(public identifiers: string[], public rule: ModifierRule){super();}
}

export var Not: BooleanModifier = new BooleanModifier(['!', 'not'], (prevResult: boolean) => {
    return !prevResult;
});

export var OrEqual: BooleanModifier = new BooleanModifier(['='], (prevResult: boolean, values: string[]) => {
    return prevResult || values[0] === values[1];
});

export var LengthOrEqual: BooleanModifier = new BooleanModifier(['='], (prevResult: boolean, values: string[]) => {
    return prevResult || values[0].length === +values[1];
});

export var BetweenOrEqual: BooleanModifier = new BooleanModifier(['='], (prevResult: boolean, values: string[]) => {
    return prevResult || +values[0] === +values[1] || +values[0] === +values[2];
});

export var CORE_MODIFIERS: Modifier[] = [
    Not,
    OrEqual,
    LengthOrEqual,
    BetweenOrEqual
];