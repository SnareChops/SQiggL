import {Parser, ParserOptions, ScopedVariables} from '../parser';
import {DSLCommand, DSL} from '../dsl';
import {StartingAction, DependentAction, IterableAction} from '../actions';
import {ExpressionResult, IterableExpressionResult, BooleanExpressionResult} from '../expressions';
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
     * @param dsl {DSLCommand} - The DSL to parse.
     * @param scope {DSL[]} - The scope that is below this command.
     * @param variables {ScopedVariables} - The list of all known variables for this scope.
     * @returns {string} - The final output string for this command.
     */
    public parse(dsl: DSLCommand, scope: DSL[], variables: ScopedVariables):string {
        const action: StartingAction | DependentAction | IterableAction = <StartingAction | DependentAction | IterableAction>dsl.action;
        let expressionResult: ExpressionResult,
            result: string;
        if(!!action.rule){
            if(!!dsl.expressions) {
                expressionResult = new ExpressionTreeParser(this.options).parse(dsl.expressions, variables);
                if(!!(<IterableExpressionResult>expressionResult).iterable) result = (<IterableAction>action).rule(<IterableExpressionResult>expressionResult, variables, scope, new Parser(this.options));
                else result = (<StartingAction | DependentAction>action).rule(<ExpressionResult>expressionResult, variables, scope, new Parser(this.options));
            } else {
                result = action.rule({value: dsl.literalValue}, variables, scope, new Parser(this.options));
            }
        }
        if(result === null) dsl.failed = true;
        return result || '';
    }
}