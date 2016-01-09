import {DSLExpression} from '../../src/dsl';
import {ExpressionLexer} from './../../src/lexers/expression.lexer';
import {DEFAULT_LEXER_OPTIONS} from '../../src/lexer';
import {CORE_EXPRESSIONS, IterableOfUsing} from '../../src/expressions';

describe('ExpressionLexer', () => {
    let instance: ExpressionLexer;
    beforeEach(() => {
        instance = new ExpressionLexer(DEFAULT_LEXER_OPTIONS, CORE_EXPRESSIONS);
    });

    it('should return a DSLExpression with a local if an expression contains a local variable', () => {
        const parts: string[] = ['cat', ' ', 'of', ' ', 'catType', ' ', 'using', ' ', '\',\''];
        const result: DSLExpression = instance.invoke(parts);
        result.local.should.equal('cat');
    });

    it('should return a DSLExpression with a joiner if an expression contains a joiner value', () => {
        const parts: string[] = ['cat', ' ', 'of', ' ', 'catType', ' ', 'using', ' ', '\',\''];
        const result: DSLExpression = instance.invoke(parts);
        result.joiner.should.equal('\',\'');
    });

    it('should throw an error if an expression cannot be found', () => {
        const parts: string[] = ['blah', ' ', 'blah', ' ', 'blah'];
        (() => instance.invoke(parts)).should.throw(`SQiggLError - LE2000: Unable to determine expression type of 'blah blah blah'`);
    });

    it('should return a DSLExpression with conjunctions if an expression contains any conjunctions', () => {

    });

    it('should return a DSLExpression with 2 expressions if an expression statement contains two expressions separated by a conjunction', () => {

    });
});