import {Parser, ParserOptions, ScopedVariables} from '../parser';
import {DSLCommand, DSL} from '../dsl';
import {StartingAction, DependentAction, IterableAction} from '../actions';
import {ExpressionResult, IterableExpressionResult} from '../expressions';
import {ExpressionTreeParser} from './expression.tree.parser';

/**
 * The parser responsible for parsing all DSLCommands
 *
 * @internal
 */
export class CommandParser {

    /**
     * Creates a new instance of CommandParser.
     *
     * @internal
     * @param options {ParserOptions} - The {@link ParserOptions} for string output.
     */
    constructor(private options:ParserOptions) {}

    /**
     * Take a DSLReplacement, run any expressions against it, and output the final string.
     *
     * @internal
     * @param dsl {DSL} - The DSL to parse (This is slightly different to the other parsers as this parser needs access to the underlying scope)
     * @param variables {ScopedVariables} - The list of all known variables for this scope.
     * @returns {string} - The final output string for this command.
     */
    public parse(dsl: DSL, variables: ScopedVariables = {}):string {
        const command: DSLCommand = dsl.command;
        const action: StartingAction | DependentAction | IterableAction = <StartingAction | DependentAction | IterableAction>command.action;
        let expressionResult: ExpressionResult | IterableExpressionResult = null;
        if(!!command.expressions) expressionResult = new ExpressionTreeParser(this.options).parse(command.expressions, variables);
        let result: string;
        if(!!action.rule){
            if(!!(<IterableExpressionResult>expressionResult).iterable) result = (<IterableAction>action).rule(<IterableExpressionResult>expressionResult, variables, dsl.scope, new Parser(this.options));
            else result = (<StartingAction | DependentAction>action).rule(<ExpressionResult>expressionResult, variables, dsl.scope, new Parser(this.options));
        }
        if(result === null) dsl.command.failed = true;
        return result || '';
    }
}