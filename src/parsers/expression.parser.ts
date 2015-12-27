import {ParserOptions, ScopedVariables, Parser} from '../parser';
import {DSLExpression} from '../dsl';
import {ExpressionResult} from '../expressions';

/**
 * The parser responsible for parsing all DSLExpressions.
 *
 * @internal
 */
export class ExpressionParser {

    /**
     * Creates a new instance of ExpressionParser.
     *
     * @internal
     * @param options {ParserOptions} - The {@link ParserOptions} for string output.
     */
    constructor(private options:ParserOptions) {}

    /**
     * Take a DSLExpression and output the final string or boolean.
     *
     * @internal
     * @param dsl {DSLExpression} - The DSL to parse.
     * @param variables {ScopedVariables} - The list of known variables for this scope.
     * @returns {ExpressionResult} - A string | boolean | string[]
     */
    public parse(dsl: DSLExpression, variables: ScopedVariables = {}): ExpressionResult{
        let idx: number;
        for (idx=0; idx < dsl.values.length; idx++) {
            dsl.values[idx] = Parser.resolveValue(dsl.values[idx], variables, !!dsl.expression.suppressUndefinedVariableError);
        }
        let result = dsl.expression.rule(dsl.values, dsl.literal);
        if(!!dsl.modifiers) {
            for (var modifier of dsl.modifiers) {
                result = modifier.rule(result, dsl.values);
            }
        }
        return result;
    }
}