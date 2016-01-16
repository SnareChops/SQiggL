import {ExpressionTreeParser} from '../../src/parsers/expression.tree.parser';
import {DEFAULT_PARSER_OPTIONS} from '../../src/parser';
import {DSLExpressionTree, DSLExpression} from '../../src/dsl';
import {ExpressionResult, GreaterThan, LessThan} from '../../src/expressions';
import {AndConjunction} from '../../src/conjunctions';
import {ScopedVariables} from '../../src/variables';

describe('ExpressionTreeParser', () => {
    let instance: ExpressionTreeParser;
    beforeEach(() => {
        instance = new ExpressionTreeParser(DEFAULT_PARSER_OPTIONS);
    });

    it('should return an ExpressionResult', () => {
        const expression: DSLExpression = {literal: '13 > 12', expression: GreaterThan, values: ['13', '12']};
        const dsl: DSLExpressionTree = {branches: [expression]};
        const result: ExpressionResult = instance.parse(dsl, new ScopedVariables());
        result.value.should.equal(true);
    });

    it('should return a correct result of an expression with a conjunction', () => {
        const expression1: DSLExpression = {literal: '13 > 12', expression: GreaterThan, values: ['13', '12']};
        const expression2: DSLExpression = {literal: '13 < 12', expression: LessThan, values: ['13', '12']};
        const dsl: DSLExpressionTree = {branches: [expression1, expression2], conjunctions: [AndConjunction]};
        const result: ExpressionResult = instance.parse(dsl, new ScopedVariables());
        result.value.should.equal(false);
    });
});