import {ParserOptions, ScopedVariables, Parser} from '../parser';
import {DSLReplacement} from '../dsl';
import {ExpressionParser} from './expression.parser';
import {ExpressionResult} from '../expressions';

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
     * @param dsl {DSLReplacement} - The DSL to parse.
     * @param variables {ScopedVariables} - The list of known variables for this scope.
     * @returns {string} - The final output string for this replacement.
     */
    public parse(dsl: DSLReplacement, variables?: ScopedVariables): string{
        let result: ExpressionResult;
        if(!!dsl.expression) {
            result = new ExpressionParser(this.options).parse(dsl, variables);
            if(Array.isArray(result)){
                result = (<string[]>result).join(`${Parser.resolveValue(dsl.joiner, variables)} `);
            }
        } else {
            result = Parser.resolveValue(dsl.literal, variables).toString();
        }
        if(result === true) return this.options.trueString;
        if(result === false) return this.options.falseString;
        return <string>result;
    }
}