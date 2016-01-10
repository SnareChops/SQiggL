import {ParserOptions, ScopedVariables, Parser} from '../parser';
import {DSLExpression} from '../dsl';
import {ExpressionResult, IterableExpressionResult} from '../expressions';

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
     * @returns {ExpressionResult} - The result of the expression.
     */
    public parse(dsl: DSLExpression, variables: ScopedVariables): ExpressionResult{
        let idx: number,
            result: ExpressionResult = {value: null};
        for (idx=0; idx < dsl.values.length; idx++) {
            dsl.values[idx] = Parser.resolveValue(dsl.values[idx], variables, !!dsl.expression.suppressUndefinedVariableError);
        }
        result.value = dsl.expression.rule(dsl.values, dsl.literal);
        if(!!dsl.modifiers) {
            for (var modifier of dsl.modifiers) {
                // Should remove this <any> cast once possible. This is an ugly hack and should be corrected.
                result.value = modifier.rule(<boolean><any>result.value, dsl.values);
            }
        }
        if(!!dsl.joiner && dsl.local){
            (<IterableExpressionResult>result).iterable = {
                joiner: dsl.joiner,
                local: dsl.local
            }
        }
        return result;
    }
}