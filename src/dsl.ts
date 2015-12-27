import {Action, StartingAction, DependentAction} from './actions';
import {Expression, BooleanExpression, ValueExpression, IterableExpression} from './expressions';
import {Modifier} from './modifiers';

export enum DSLType{
    text,
    variable,
    replacement,
    command,
    comment
}

export enum DSLVariableType{
    key,
    value
}

export interface DSLText{
    text: string;
}

export interface DSLVariable{
    literal: string;
    key?: string;
    value?: string;
    resolved?: string;
}

export interface DSLCommand extends DSLExpression{
    action: Action;
    expression: BooleanExpression | IterableExpression;
    failed?: boolean;
}

export interface DSLReplacement extends DSLExpression{
    expression: Expression;
}

export interface DSLExpression{
    literal: string;
    expression: Expression;
    local?: string;
    joiner?: string;
    values?: any[];
    modifiers?: Modifier[];
}

export interface DSL{
    text?: string;
    variable?: DSLVariable;
    replacement?: DSLReplacement;
    command?: DSLCommand;
    comment?: string;
    scope?: DSL[];
}

export interface LeveledDSL{
    level: number;
    dsl: DSL;
}