import {ParserOptions, ScopedVariables} from '../parser';
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
     * @param variables {ScopedVariables} - The list of known variables for this scope
     * @returns {ExpressionResult} - A string | boolean | string[]
     */
    public parse(dsl: DSLExpression, variables?: ScopedVariables): ExpressionResult{
        let idx: number;
        for (idx=0; idx < dsl.values.length; idx++) {
            if (dsl.values[idx][0] === "'" || dsl.values[idx][0] === '"') dsl.values[idx] = dsl.values[idx].slice(1, dsl.values[idx].length - 1);
            else if (Array.isArray(dsl.values[idx])) return dsl.values[idx];
            else if (isNaN(+dsl.values[idx])) {
                if (!!variables && variables.hasOwnProperty(dsl.values[idx])) dsl.values[idx] = variables[dsl.values[idx]];
                else throw new Error(`SQiggLParserError: ${dsl.values[idx]} is not a defined variable in this scope`);
            }
        }
        return dsl.expression.rule(dsl.values, dsl.literal);
    }
}