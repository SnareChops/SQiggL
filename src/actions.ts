import {Parser} from './parser';
import {ScopedVariables} from './parser';
import {DSL, DSLCommand} from './dsl';
interface BaseAction{
    name?: string;
    key: string;
}
export interface StartingAction extends BaseAction{
    rule: (expressionResult: string | boolean, variables: ScopedVariables, scope: DSL[], parser: Parser) => string;
}

export interface DependentAction extends BaseAction{
    dependents: StartingAction[];
    rule: (expressionResult: string | boolean, variables: ScopedVariables, scope: DSL[], parser: Parser) => string;
}

export interface TerminatingAction extends BaseAction{
    dependents: (StartingAction | IterableAction)[];
}

export interface IterableAction extends BaseAction{
    rule: (expressionResult: string[], variables: ScopedVariables, scope: DSL[], parser: Parser, commandDSL: DSLCommand) => string;
}


export type Action = StartingAction | DependentAction | TerminatingAction | IterableAction;

export var If: StartingAction = {
    key: 'if',
    rule: (expressionResult: boolean, variables: ScopedVariables, scope: DSL[], parser: Parser) => expressionResult ? parser.parse(scope, variables) : null
};

export var EndIf: TerminatingAction = {
    key: 'endif',
    dependents: [If],
};

export var Unless: StartingAction = {
    key: 'unless',
    rule: (expressionResult: boolean, variables: ScopedVariables, scope: DSL[], parser: Parser) => !expressionResult ? parser.parse(scope, variables) : null
};

export var EndUnless: TerminatingAction = {
    key: 'endunless',
    dependents: [Unless],
};

export var Else: DependentAction = {
    key: 'else',
    dependents: [If, Unless],
    rule: (expressionResult: boolean, variables: ScopedVariables, scope: DSL[], parser: Parser) => parser.parse(scope, variables)
};

export var For: IterableAction = {
    key: 'for',
    rule: (expressionResult: string[], variables: ScopedVariables, scope: DSL[], parser: Parser, commandDSL: DSLCommand) => {
        let result: string[] = [];
        for(var value of expressionResult){
            variables[commandDSL.local] = value;
            result.push(parser.parse(scope, variables));
        }
        return result.join(`${Parser.resolveValue(commandDSL.joiner, variables)} `);
    }
};

export var EndFor: TerminatingAction = {
    key: 'endfor',
    dependents: [For]
};

export var CORE_ACTIONS: Action[] = [
    If,
    Else,
    EndIf,
    Unless,
    EndUnless,
    For,
    EndFor
];