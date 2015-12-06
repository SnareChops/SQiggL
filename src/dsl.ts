import {Action} from './actions';
import {Expression} from './expressions';

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

export interface DSLVariable{
    literal: string;
    key?: string;
    value?: string;
}

export interface DSLCommand{
    literal: string;
    action?: Action;
    values?: string[];
    modifiers?: string[];
}

export interface DSLReplacement{
    literal: string;
    expression?: Expression;
    values?: string[];
    modifiers?: string[];
}

export interface DSL{
    text?: string;
    variable?: DSLVariable;
    replacement?: DSLReplacement;
    command?: DSLCommand;
    comment?: string;
}