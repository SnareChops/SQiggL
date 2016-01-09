import {DSLExpressionTree} from '../dsl';
import {LexerOptions} from '../lexer';
import {Expression} from '../expressions';
import {Conjunction} from '../conjunctions';
import {ExpressionLexer} from './expression.lexer';
import {DSLExpression} from "../dsl";

/**
 * The lexer responsible for all expression tree DSL generation.
 *
 * @internal
 */
export class ExpressionTreeLexer{

    /**
     * Creates a new instance of ExpressionTreeLexer
     *
     * @param options {LexerOptions} - The LexerOptions to use for DSL generation.
     * @param expressions {Expression[]} - List of known expressions to use for DSL generation.
     * @param conjunctions {Conjunction[]} - List of known conjunctions to use for DSL generation.
     */
    constructor(private options: LexerOptions, private expressions: Expression[], private conjunctions: Conjunction[]){}

    /**
     * Determine if any of the parts match a conjunction and split the parts into
     * separate parts arrays (removing the conjunction after identifying and adding to the DSL),
     * feeding the split parts into the {@link ExpressionLexer} and then appending the results
     * onto 'branches'.
     *
     * @param parts {string[]} - The parts to generate DSL for.
     * @returns {T} - The appropriate ExpressionTree that was requested.
     */
    public invoke<T extends DSLExpressionTree>(parts: string[]): T{
        let dsl: T = <any>{},
            idx: number = 0,
            singleExpressionParts: string[];
        while(idx < parts.length){
            for(var con of this.conjunctions){
                for(var key of con.keys){
                    if(parts[idx] === key){
                        if(!dsl.conjunctions) dsl.conjunctions = [];
                        dsl.conjunctions.push(con);

                        singleExpressionParts = parts.splice(0, idx-1);
                        parts.splice(0, 3);

                        if(!dsl.branches) dsl.branches = [];
                        dsl.branches.push(new ExpressionLexer(this.options, this.expressions).invoke(singleExpressionParts));
                        idx = 0;
                    }
                }
            }
            idx++;
        }
        if(!dsl.branches) dsl.branches = [];
        dsl.branches.push(new ExpressionLexer(this.options, this.expressions).invoke(parts));
        return dsl;
    }
}

