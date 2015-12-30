import {DSLExpression} from '../dsl';
import {ExpressionLexer} from './expression.lexer';
import {DEFAULT_LEXER_OPTIONS} from '../lexer';
import {CORE_EXPRESSIONS, IterableOfUsing} from '../expressions';

describe('ExpressionLexer', () => {
    it('should return a DSLExpression with a local if an expression contains a local variable', () => {
        const dsl: DSLExpression = {literal: 'cat of catType using \',\'', expression: null};
        const parts: string[] = ['cat', ' ', 'of', ' ', 'catType', ' ', 'using', ' ', '\',\''];
        const result: DSLExpression = new ExpressionLexer(DEFAULT_LEXER_OPTIONS, CORE_EXPRESSIONS).invoke(dsl, parts);
        result.local.should.equal('cat');
    });

    it('should return a DSLExpression with a joiner if an expression contains a joiner value', () => {
        const dsl: DSLExpression = {literal: 'cat of catType using \',\'', expression: null};
        const parts: string[] = ['cat', ' ', 'of', ' ', 'catType', ' ', 'using', ' ', '\',\''];
        const result: DSLExpression = new ExpressionLexer(DEFAULT_LEXER_OPTIONS, CORE_EXPRESSIONS).invoke(dsl, parts);
        result.joiner.should.equal('\',\'');
    });

    it('should throw an error if an expression cannot be found', () => {
        const lexer = new ExpressionLexer(DEFAULT_LEXER_OPTIONS, CORE_EXPRESSIONS);
        const dsl: DSLExpression = {literal: 'blah blah blah', expression: null};
        const parts: string[] = ['blah', ' ', 'blah', ' ', 'blah'];
        (() => lexer.invoke(dsl, parts)).should.throw("SQiggLLexerError: Unable to determine expression type of 'blah blah blah'");
    });
});