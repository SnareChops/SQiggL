import {ParserOptions, ScopedVariables} from '../parser';
import {DSLExpressionTree} from '../dsl';
import {ExpressionResult, BooleanExpressionResult, ValueExpressionResult, IterableExpressionResult} from '../expressions';
import {ExpressionParser} from './expression.parser';

/**
 * The parser responsible for parsing all DSLExpressionTrees
 *
 * @internal
 */
export class ExpressionTreeParser{

    /**
     * Creates a new instance of ExpressionTreeParser
     *
     * @param options {ParserOptions} - The {@link ParserOptions} used for string output.
     */
    constructor(private options: ParserOptions){}

    /**
     * Take a DSLExpressionTree and parse each of the expressions contained in it, joining the
     * results with the conjunctions used and outputting an ExpressionResult to be used by a
     * {@link Replacement} or a {@link Command}
     *
     * @param dsl {DSLExpressionTree} - The DSLExpressionTree to parse.
     * @param variables {ScopedVariables} - The ScopedVariables to use for parsing.
     * @returns {ExpressionResult} - The final result of evaluating the expression tree.
     */
    public parse(dsl: DSLExpressionTree, variables: ScopedVariables): ExpressionResult{
        let result: ExpressionResult,
            idx: number = 0;
        while(idx < dsl.branches.length){
            var current: ExpressionResult = new ExpressionParser(this.options).parse(dsl.branches[idx], variables);
            if(idx > 0 && dsl.conjunctions[idx-1]) {
                result.value = dsl.conjunctions[idx-1].rule([(<BooleanExpressionResult>result).value, (<BooleanExpressionResult>current).value]);
            }
            else result = current;
            idx++;
        }
        return result;
    }
}