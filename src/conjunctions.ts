export interface Conjunction{
    keys: string[];
    rule: (expressionResults: boolean[]) => boolean;
}

/**
 * @internal
 */
export var AndConjunction: Conjunction = {
    keys: ['and', '&&'],
    rule: (expressionResults: boolean[]) => expressionResults[0] && expressionResults[1]
};

/**
 * @internal
 */
export var OrConjunction: Conjunction = {
    keys: ['or', '||'],
    rule: (expressionResults: boolean[]) => expressionResults[0] || expressionResults[1]
};

export var CORE_CONJUNCTIONS: Conjunction[] = [
    AndConjunction,
    OrConjunction
];
