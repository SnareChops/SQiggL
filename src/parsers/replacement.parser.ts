import {ParserOptions, Parser} from '../parser';
import {DSLReplacement} from '../dsl';
import {ExpressionParser} from './expression.parser';
import {ExpressionResult, IterableExpressionResult} from '../expressions';
import {ExpressionTreeParser} from './expression.tree.parser';
import {resolveValue} from '../resolvers';
import {ScopedVariables} from '../variables';

/**
 * The parser responsible for all DSLReplacements.
 *
 * @internal
 */
export class ReplacementParser{

    /**
     * Creates a new instance of ReplacementParser
     *
     * @internal
     * @param options {ParserOptions} - The {@link ParserOptions} for string output.
     */
    constructor(private options: ParserOptions){}

    /**
     * Take a DSLReplacement, run any expressions against it, and output the final string.
     *
     * @internal
     * @param dsl {DSLReplacement} - The DSL to invoke.
     * @param variables {ScopedVariables} - The list of known variables for this scope.
     * @returns {string} - The final output string for this replacement.
     */
    public parse(dsl: DSLReplacement, variables: ScopedVariables): string{
        let output: string | boolean,
            result: ExpressionResult;
        if(!!dsl.expressions) {
            result = new ExpressionTreeParser(this.options).parse(dsl.expressions, variables);
            if(!!(<IterableExpressionResult>result).iterable){
                output = (<string[]>result.value).join(`${(<IterableExpressionResult>result).iterable.joiner} `);
            } else {
                output = <string | boolean>result.value;
            }
        } else {
            output = resolveValue(dsl.literal, variables, this.options).toString();
        }
        if(output === true) return this.options.trueString;
        if(output === false) return this.options.falseString;
        return <string>output;
    }
}