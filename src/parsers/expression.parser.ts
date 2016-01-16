import {ParserOptions, Parser} from '../parser';
import {DSLExpression} from '../dsl';
import {ExpressionResult, IterableExpressionResult, ExpressionValue} from '../expressions';
import {SQiggLError} from '../error';
import {validateExpression} from '../validators/expression.validator';
import {ScopedVariables} from '../variables';
import {resolveValue} from '../resolvers';

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
     * @param dsl {DSLExpression} - The DSL to invoke.
     * @param variables {ScopedVariables} - The list of known variables for this scope.
     * @returns {ExpressionResult} - The result of the expression.
     */
    public parse(dsl: DSLExpression, variables: ScopedVariables): ExpressionResult{
        validateExpression(dsl);
        let idx: number,
            result: ExpressionResult = {value: void 0};
        for (idx=0; idx < dsl.values.length; idx++) {
            dsl.values[idx] = resolveValue(dsl.values[idx], variables, this.options, !!dsl.expression.suppressUndefinedVariableError);
        }
        result.value = dsl.expression.rule(<ExpressionValue[]>dsl.values);
        if(!!dsl.modifiers) {
            for (var modifier of dsl.modifiers) {
                // Should remove this <any> cast once possible. This is an ugly hack and should be corrected.
                result.value = modifier.rule(<boolean><any>result.value, <ExpressionValue[]>dsl.values);
            }
        }
        if(!!dsl.joiner && dsl.local){
            (<IterableExpressionResult>result).iterable = {
                joiner: this.resolveAndTypeCheckJoiner(dsl.joiner, variables, !!dsl.expression.suppressUndefinedVariableError),
                local: dsl.local
            }
        }
        return result;
    }

    /**
     * Resolves the value of a joiner and verifies that it is a valid value
     *
     * Rules:
     * - A joiner must be representable as a string.
     *
     * @param joiner
     * @param variables
     * @param suppressUndefinedVariableError
     * @returns {string}
     */
    private resolveAndTypeCheckJoiner(joiner: any, variables: ScopedVariables, suppressUndefinedVariableError: boolean = false): string{
        const value = resolveValue(joiner, variables, this.options, suppressUndefinedVariableError);
        if(typeof value === 'string') return value;
        else throw SQiggLError('PE2000', `Invalid joiner type. Joiner must be a string, found ${value}.`);
    }
}