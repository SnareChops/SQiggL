var expression_parser_1 = require('./expression.parser');
var expressions_1 = require('../expressions');
var parser_1 = require('../parser');
var modifiers_1 = require("../modifiers");
describe('ExpressionParser', function () {
    describe('parse', function () {
        it('should correctly return false if an expression should be false', function () {
            var dsl = { expression: expressions_1.GreaterThan, values: ['12', '13'], literal: '12 > 13' };
            var result = new expression_parser_1.ExpressionParser(parser_1.DEFAULT_PARSER_OPTIONS).parse(dsl);
            result.should.eql(false);
        });
        it('should correctly return true if an expression should be true', function () {
            var dsl = { literal: '13 > 12', expression: expressions_1.GreaterThan, values: ['13', '12'] };
            var result = new expression_parser_1.ExpressionParser(parser_1.DEFAULT_PARSER_OPTIONS).parse(dsl);
            result.should.eql(true);
        });
        it('should output the result of a boolean expression with variables', function () {
            var dsl = { literal: 'high > low', expression: expressions_1.GreaterThan, values: ['high', 'low'] };
            var result = new expression_parser_1.ExpressionParser(parser_1.DEFAULT_PARSER_OPTIONS).parse(dsl, { high: 13, low: 12 });
            result.should.eql(true);
        });
        it('should correctly return true if an expression is false but then negated with a modifier', function () {
            var dsl = { literal: '12 > 13', expression: expressions_1.GreaterThan, values: ['12', '13'], modifiers: [modifiers_1.Not] };
            var result = new expression_parser_1.ExpressionParser(parser_1.DEFAULT_PARSER_OPTIONS).parse(dsl);
            result.should.equal(true);
        });
    });
});
