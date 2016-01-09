import {ParserOptions, ScopedVariables, Parser} from '../parser';
import {DSLReplacement} from '../dsl';
import {ExpressionParser} from './expression.parser';
import {ExpressionResult} from '../expressions';
import {ExpressionTreeParser} from "./expression.tree.parser";

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
        let output: string, result = ExpressionResult;
        if(!!dsl.expressions) {
            result = new ExpressionTreeParser(this.options).parse(dsl.expressions, variables);
            if(!!result.iterable){
                output = (<string[]>result.value).join(`${Parser.resolveValue(result.iterable.joiner, variables)} `);
            } else {
                output = result.value;
            }
        } else {
            output = Parser.resolveValue(dsl.literal, variables).toString();
        }
        if(output === true) return this.options.trueString;
        if(output === false) return this.options.falseString;
        return output;
    }
}