import {LexerOptions} from '../lexer';
import {DSLReplacement, DSLReplacementExpressionTree} from '../dsl';
import {Expression, SPACE} from '../expressions';
import {ExpressionTreeLexer} from "./expression.tree.lexer";
import {Conjunction} from "../conjunctions";

/**
 * The lexer responsible for DSL generation of all Replacement statements
 *
 * @internal
 */
export class ReplacementLexer{

    /**
     * Creates a new instance of the Replacement Lexer
     *
     * @internal
     * @param options {LexerOptions} - The LexerOptions to use for all DSL generation.
     * @param expressions {Expression[]} - A list of all known expressions to use when generating DSL.
     * @param conjunctions {Conjunction[]} - A list of all known conjunctions to use when generating DSL.
     */
    constructor(private options: LexerOptions, private expressions: Expression[], private conjunctions: Conjunction[]){}

    /**
     * Split the input into it's respective parts then compare them against expressions
     * or return the input if the contents are literal.
     *
     * TODO: Add Rules
     *
     * @internal
     * @param input {string}
     * @param parts {string[]} - The "Parts" of the input. {@see Lexer.extractParts} for more details on the definition of a "Part".
     * @returns {DSLReplacement}
     */
    public invoke(input: string, parts: string[]): DSLReplacement{
        let dsl: DSLReplacement = <DSLReplacement>{literal: input};
        if(parts.length > 1) dsl.expressions = new ExpressionTreeLexer(this.options, this.expressions, this.conjunctions).invoke<DSLReplacementExpressionTree>(parts);
        else dsl.literal = parts[0];
        return dsl;
    }

    /**
     * Clean and prepare the input for parsing
     *
     * @internal
     * @param input {string}
     * @returns {string}
     */
    public static cleanStringForLexing(input: string): string{
        return input.replace('\n', ' ').trim();
    }
}