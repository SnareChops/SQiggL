import {DSLExpressionTree} from '../dsl';
import {LexerOptions} from '../lexer';
import {Expression} from '../expressions';
import {Conjunction} from '../conjunctions';

export class ExpressionTreeLexer{

    constructor(private options: LexerOptions, private expressions: Expression[], private conjunctions: Conjunction[]){}

    public invoke<T extends DSLExpressionTree>(parts: string[]): T{

        return null;
    }
}

