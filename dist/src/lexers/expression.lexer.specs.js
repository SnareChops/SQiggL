var expression_lexer_1 = require('./expression.lexer');
var lexer_1 = require('../lexer');
var expressions_1 = require('../expressions');
describe('ExpressionLexer', function () {
    it('should return a DSLExpression with a local if an expression contains a local variable', function () {
        var dsl = { literal: 'cat of catType using \',\'', expression: null };
        var parts = ['cat', ' ', 'of', ' ', 'catType', ' ', 'using', ' ', '\',\''];
        var result = new expression_lexer_1.ExpressionLexer(lexer_1.DEFAULT_LEXER_OPTIONS, expressions_1.CORE_EXPRESSIONS).invoke(dsl, parts);
        result.local.should.equal('cat');
    });
    it('should return a DSLExpression with a joiner if an expression contains a joiner value', function () {
        var dsl = { literal: 'cat of catType using \',\'', expression: null };
        var parts = ['cat', ' ', 'of', ' ', 'catType', ' ', 'using', ' ', '\',\''];
        var result = new expression_lexer_1.ExpressionLexer(lexer_1.DEFAULT_LEXER_OPTIONS, expressions_1.CORE_EXPRESSIONS).invoke(dsl, parts);
        result.joiner.should.equal('\',\'');
    });
    it('should throw an error if an expression cannot be found', function () {
        var lexer = new expression_lexer_1.ExpressionLexer(lexer_1.DEFAULT_LEXER_OPTIONS, expressions_1.CORE_EXPRESSIONS);
        var dsl = { literal: 'blah blah blah', expression: null };
        var parts = ['blah', ' ', 'blah', ' ', 'blah'];
        (function () { return lexer.invoke(dsl, parts); }).should.throw("SQiggLLexerError: Unable to determine expression type of 'blah blah blah'");
    });
});
