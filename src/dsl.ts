import {Action, StartingAction, DependentAction} from './actions';
import {Expression, BooleanExpression, ValueExpression, IterableExpression} from './expressions';
import {Modifier} from './modifiers';
import {Conjunction} from './conjunctions';
import {ExpressionResult} from "./expressions";

/**
 * @internal
 */
export enum DSLType{
    text,
    variable,
    replacement,
    command,
    comment
}

/**
 * @internal
 */
export enum DSLVariableType{
    key,
    value
}

/**
 * @internal
 */
export interface DSLText{
    text: string;
}

/**
 * @internal
 */
export interface DSLVariable{
    literal: string;
    key?: string;
    value?: string | string[];
    resolved?: string;
}

/**
 * @internal
 */
export interface DSLCommand{
    literal: string;
    action: Action;
    expressions?: DSLCommandExpressionTree;
    literalValue?: string;
    failed?: boolean;
}

/**
 * @internal
 */
export interface DSLReplacement{
    literal: string;
    expressions?: DSLReplacementExpressionTree;
}

/**
 * @internal
 */
export interface DSLExpressionTree{
    branches: DSLExpression[];
    conjunctions?: Conjunction[];
}

/**
 * @internal
 */
export interface DSLReplacementExpressionTree extends DSLExpressionTree{

}

/**
 * @internal
 */
export interface DSLCommandExpressionTree extends DSLExpressionTree{
    branches: (DSLBooleanExpression | DSLIterableExpression)[];
}

/**
 * @internal
 */
export interface DSLExpression{
    literal: string;
    expression: Expression;
    local?: string;
    joiner?: string;
    values?: any[];
    modifiers?: Modifier[];
}

/**
 * @internal
 */
export interface DSLBooleanExpression extends DSLExpression{
    expression: BooleanExpression;
}

/**
 * @internal
 */
export interface DSLIterableExpression extends DSLExpression{
    expression: IterableExpression;
}

/**
 * @internal
 */
export interface DSLValueExpression extends DSLExpression{
    expression: ValueExpression;
}

/**
 * @internal
 */
export interface DSL{
    text?: string;
    variable?: DSLVariable;
    replacement?: DSLReplacement;
    command?: DSLCommand;
    comment?: string;
    scope?: DSL[];
}

/**
 * @internal
 */
export interface LeveledDSL{
    level: number;
    dsl: DSL;
}