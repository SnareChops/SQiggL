import {ExpressionTreeLexer} from '../../src/lexers/expression.tree.lexer';
import {DSLReplacementExpressionTree} from '../../src/dsl';
import {AndConjunction, OrConjunction} from '../../src/conjunctions';
import {GreaterThan, LessThan, IsNull} from "../../src/expressions";
import {DEFAULT_LEXER_OPTIONS} from '../../src/lexer';
import {CORE_CONJUNCTIONS} from '../../src/conjunctions';
import {CORE_EXPRESSIONS} from '../../src/expressions';

describe('ExpressionTreeLexer', () => {
    let instance: ExpressionTreeLexer;
    beforeEach(() => {
        instance = new ExpressionTreeLexer(DEFAULT_LEXER_OPTIONS, CORE_EXPRESSIONS, CORE_CONJUNCTIONS);
    });

    it('should split expressions by conjunctions and save the conjunctions in order in the DSL', () => {
        const parts = ['12', ' ', '>', ' ', '13', ' ', 'and', ' ', '15', ' ', '<', ' ', '100', ' ', 'or', ' ', 'var', ' ', 'is', ' ', 'null'];
        const result = instance.invoke<DSLReplacementExpressionTree>(parts);
        result.conjunctions[0].should.equal(AndConjunction);
        result.conjunctions[1].should.equal(OrConjunction)
    });

    it('should split expressions by conjunctions and save the expressions in order in the DSL', () => {
        const parts = ['12', ' ', '>', ' ', '13', ' ', 'and', ' ', '15', ' ', '<', ' ', '100', ' ', 'or', ' ', 'var', ' ', 'is', ' ', 'null'];
        const result = instance.invoke<DSLReplacementExpressionTree>(parts);
        result.branches[0].expression.should.equal(GreaterThan);
        result.branches[1].expression.should.equal(LessThan);
        result.branches[2].expression.should.equal(IsNull);
    });
});