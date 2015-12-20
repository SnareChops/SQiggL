import {StartingAction, DependentAction} from './actions';
import {Expression, BooleanExpression, ValueExpression} from './expressions';
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
    action: StartingAction | DependentAction;
    expression: BooleanExpression;
}

export interface DSLReplacement extends DSLExpression{
    expression: ValueExpression | BooleanExpression;
}

export interface DSLExpression{
    literal: string;
    expression: Expression;
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