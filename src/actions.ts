import {Parser} from './parser';
import {ScopedVariables} from './variables';
import {DSL, DSLCommand} from './dsl';
import {ExpressionResult, IterableExpressionResult} from './expressions';
import {ScopeResolver} from './resolvers';

export type ActionRule = (expressionResult:ExpressionResult, variables:ScopedVariables, resolveScope:ScopeResolver) => string;

export abstract class Action {
    public name:string;
    public key:string;
}

export class StartingAction extends Action {
    constructor(public name:string, public key:string, public rule:ActionRule) {super();}
}

export class DependentAction extends Action {
    constructor(public name:string, public key:string, public dependents:StartingAction | IterableAction[], public rule:ActionRule) {super();}
}

export class TerminatingAction extends Action {
    constructor(public name:string, public key:string, public dependents:StartingAction | IterableAction[]) {super();}
}

export class IterableAction extends Action {
    constructor(public name:string, public key:string, public rule:(expressionResult:IterableExpressionResult, variables:ScopedVariables, resolveScope:ScopeResolver) => string) {super();}
}

export var If:StartingAction = new StartingAction('IfAction', 'if', (expressionResult:ExpressionResult, variables:ScopedVariables, resolveScope:ScopeResolver) => {
    return expressionResult.value ? resolveScope() : null
});

export var EndIf:TerminatingAction = new TerminatingAction('EndIfAction', 'endif', [If]);

export var Unless:StartingAction = new StartingAction('UnlessAction', 'unless', (expressionResult:ExpressionResult, variables:ScopedVariables, resolveScope:ScopeResolver) => {
    return !expressionResult.value ? resolveScope() : null
});

export var EndUnless:TerminatingAction = new TerminatingAction('EndUnlessAction', 'endunless', [Unless]);

export var Else:DependentAction = new DependentAction('ElseAction', 'else', [If, Unless], (expressionResult:ExpressionResult, variables:ScopedVariables, resolveScope:ScopeResolver) => {
    return resolveScope();
});

export var For:IterableAction = new IterableAction('ForAction', 'for', (expressionResult:IterableExpressionResult, variables:ScopedVariables, resolveScope:ScopeResolver) => {
    let output:string[] = [],
        additionalVariables:any = {};
    for (var value of expressionResult.value) {
        additionalVariables[expressionResult.iterable.local] = value;
        output.push(resolveScope(additionalVariables));
    }
    return output.join(`${expressionResult.iterable.joiner} `);

});

export var EndFor:TerminatingAction = new TerminatingAction('EndForAction', 'endfor', [For]);

export var End:TerminatingAction = new TerminatingAction('EndAction', 'end', [If, Unless, For]);

export var CORE_ACTIONS:Action[] = [
    If,
    Else,
    EndIf,
    Unless,
    EndUnless,
    For,
    EndFor,
    End
];