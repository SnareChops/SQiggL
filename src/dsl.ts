import {Action, StartingAction, DependentAction} from './actions';
import {Expression, BooleanExpression, ValueExpression, IterableExpression} from './expressions';
import {Modifier} from './modifiers';

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
    value?: string;
    resolved?: string;
}

/**
 * @internal
 */
export interface DSLCommand extends DSLExpression{
    action: Action;
    expression: BooleanExpression | IterableExpression;
    failed?: boolean;
}

/**
 * @internal
 */
export interface DSLReplacement extends DSLExpression{
    expression: Expression;
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