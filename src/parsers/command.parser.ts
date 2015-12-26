import {Parser, ParserOptions, ScopedVariables} from '../parser';
import {DSLCommand, DSL} from '../dsl';
import {ExpressionParser} from './expression.parser';
import {StartingAction, DependentAction} from '../actions';

export class CommandParser {
    constructor(private options:ParserOptions) {}

    /**
     * Take a DSLReplacement, run any expressions against it, and output the final string.
     *
     * @param dsl {DSLReplacement}
     * @param variables {ScopedVariables}
     * @returns {string}
     */
    public parse(dsl:DSL, variables?:ScopedVariables):string {
        const command: DSLCommand = dsl.command;
        const action: StartingAction | DependentAction = <StartingAction | DependentAction>command.action;
        let expressionResult: boolean = null;
        if(!!command.expression) expressionResult = <boolean>new ExpressionParser(this.options).parse(command);
        const result = !!action.rule ? action.rule(expressionResult, variables, dsl.scope, new Parser(this.options)) : '';
        if(result === null) dsl.command.failed = true;
        return result || '';
    }
}