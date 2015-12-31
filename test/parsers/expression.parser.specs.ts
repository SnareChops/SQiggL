import {ExpressionParser} from './../../src/parsers/expression.parser';
import {DSLExpression} from '../../src/dsl';
import {GreaterThan} from '../../src/expressions';
import {DEFAULT_PARSER_OPTIONS} from '../../src/parser';
import {Not} from "../../src/modifiers";

describe('ExpressionParser', () => {
    describe('parse', () => {
        it('should correctly return false if an expression should be false', () => {
            const dsl: DSLExpression = {expression: GreaterThan, values: ['12', '13'], literal: '12 > 13'};
            const result = new ExpressionParser(DEFAULT_PARSER_OPTIONS).parse(dsl);
            result.should.eql(false);
        });

        it('should correctly return true if an expression should be true', () => {
            const dsl: DSLExpression = {literal: '13 > 12', expression: GreaterThan, values: ['13', '12']};
            const result = new ExpressionParser(DEFAULT_PARSER_OPTIONS).parse(dsl);
            result.should.eql(true);
        });

        it('should output the result of a boolean expression with variables', () => {
            const dsl: DSLExpression = {literal: 'high > low', expression: GreaterThan, values: ['high', 'low']};
            const result = new ExpressionParser(DEFAULT_PARSER_OPTIONS).parse(dsl, {high: 13, low: 12});
            result.should.eql(true);
        });

        it('should correctly return true if an expression is false but then negated with a modifier', () => {
            const dsl: DSLExpression = {literal: '12 > 13', expression: GreaterThan, values:['12', '13'], modifiers:[Not]};
            const result = new ExpressionParser(DEFAULT_PARSER_OPTIONS).parse(dsl);
            result.should.equal(true);
        });
    });
});