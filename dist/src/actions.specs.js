var actions_1 = require('./actions');
var parser_1 = require('./parser');
var expressions_1 = require('./expressions');
var should = require('should');
describe('Actions', function () {
    describe('If', function () {
        it('should return the inner scope if the expression is true', function () {
            var dsl = [{ text: 'Hello World' }];
            var result = actions_1.If.rule(true, null, dsl, new parser_1.Parser(parser_1.DEFAULT_PARSER_OPTIONS));
            result.should.equal('Hello World');
        });
        it('should return null if the expression is false', function () {
            var dsl = [{ text: 'Hello World' }];
            var result = actions_1.If.rule(false, null, dsl, new parser_1.Parser(parser_1.DEFAULT_PARSER_OPTIONS));
            should(result).equal(null);
        });
    });
    describe('Unless', function () {
        it('should return null if the expression is true', function () {
            var dsl = [{ text: 'Hello World' }];
            var result = actions_1.Unless.rule(true, null, dsl, new parser_1.Parser(parser_1.DEFAULT_PARSER_OPTIONS));
            should(result).equal(null);
        });
        it('should return the inner scope if the expression is false', function () {
            var dsl = [{ text: 'Hello World' }];
            var result = actions_1.Unless.rule(false, null, dsl, new parser_1.Parser(parser_1.DEFAULT_PARSER_OPTIONS));
            result.should.equal('Hello World');
        });
    });
    describe('Else', function () {
        it('should return the inner scope if the expression is true', function () {
            var dsl = [{ text: 'Hello World' }];
            var result = actions_1.Else.rule(true, null, dsl, new parser_1.Parser(parser_1.DEFAULT_PARSER_OPTIONS));
            result.should.equal('Hello World');
        });
        it('should return the inner scope if the expression is false', function () {
            var dsl = [{ text: 'Hello World' }];
            var result = actions_1.Else.rule(false, null, dsl, new parser_1.Parser(parser_1.DEFAULT_PARSER_OPTIONS));
            result.should.equal('Hello World');
        });
    });
    describe('For', function () {
        it('should return the inner scope as many times as there are values and combining them with the joiner', function () {
            var commandDSL = { literal: 'for var of vars using \',\'', action: actions_1.For, expression: expressions_1.IterableOfUsing, local: 'var', joiner: '\',\'', values: [['1', '2', '3']] };
            var dsl = [{ text: 'Hello World' }];
            var result = actions_1.For.rule(['1', '2', '3'], void 0, dsl, new parser_1.Parser(parser_1.DEFAULT_PARSER_OPTIONS), commandDSL);
            result.should.equal('Hello World, Hello World, Hello World');
        });
        it('should iterate the inner scope and correctly replace the inner values using the expressionResult', function () {
            var commandDSL = { literal: 'for var of vars using \',\'', action: actions_1.For, expression: expressions_1.IterableOfUsing, local: 'var', joiner: '\',\'', values: [['1', '2', '3']] };
            var dsl = [{ text: 'Iteration ' }, { replacement: { literal: 'var', expression: null } }];
            var result = actions_1.For.rule(['1', '2', '3'], void 0, dsl, new parser_1.Parser(parser_1.DEFAULT_PARSER_OPTIONS), commandDSL);
            result.should.equal('Iteration 1, Iteration 2, Iteration 3');
        });
    });
});
