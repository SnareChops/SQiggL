var replacement_parser_1 = require('./replacement.parser');
var parser_1 = require('../parser');
var expressions_1 = require('../expressions');
var expressions_2 = require("../expressions");
describe('ReplacementParser', function () {
    describe('parse', function () {
        it('should output a literal string', function () {
            var dsl = { literal: '\'Test string\'', expression: null };
            var result = new replacement_parser_1.ReplacementParser(parser_1.DEFAULT_PARSER_OPTIONS).parse(dsl);
            result.should.eql('Test string');
        });
        it('should output a literal number', function () {
            var dsl = { literal: '12', expression: null };
            var result = new replacement_parser_1.ReplacementParser(parser_1.DEFAULT_PARSER_OPTIONS).parse(dsl);
            result.should.eql('12');
        });
        it('should output a variable value', function () {
            var dsl = { literal: 'dragon', expression: null };
            var result = new replacement_parser_1.ReplacementParser(parser_1.DEFAULT_PARSER_OPTIONS).parse(dsl, { dragon: 'Pet' });
            result.should.eql('Pet');
        });
        it('should output the result of a boolean expression', function () {
            var dsl = { literal: '12 > 13', expression: expressions_1.GreaterThan, values: ['12', '13'] };
            var result = new replacement_parser_1.ReplacementParser(parser_1.DEFAULT_PARSER_OPTIONS).parse(dsl);
            result.should.eql('0');
        });
        it('should output the result of a boolean expression with variables', function () {
            var dsl = { literal: 'high > low', expression: expressions_1.GreaterThan, values: ['high', 'low'] };
            var result = new replacement_parser_1.ReplacementParser(parser_1.DEFAULT_PARSER_OPTIONS).parse(dsl, { high: 13, low: 12 });
            result.should.eql('1');
        });
        it('should output the result of an IterableExpression correctly', function () {
            var dsl = { literal: 'cat of catTypes using \',\'', expression: expressions_2.IterableOfUsing, local: 'cat', values: [['hairy', 'furry', 'fuzzy']], joiner: '\',\'' };
            var result = new replacement_parser_1.ReplacementParser(parser_1.DEFAULT_PARSER_OPTIONS).parse(dsl);
            result.should.equal('hairy, furry, fuzzy');
        });
        it('should output the result of an IterableExpression correctly using variables', function () {
            var dsl = { literal: 'cat of catTypes using \',\'', expression: expressions_2.IterableOfUsing, local: 'cat', values: ['array'], joiner: 'joiner' };
            var result = new replacement_parser_1.ReplacementParser(parser_1.DEFAULT_PARSER_OPTIONS).parse(dsl, { array: ['hairy', 'furry', 'fuzzy'], joiner: ',' });
            result.should.equal('hairy, furry, fuzzy');
        });
    });
});
