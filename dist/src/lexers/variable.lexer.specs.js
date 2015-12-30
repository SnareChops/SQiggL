var lexer_1 = require("../lexer");
var variable_lexer_1 = require("./variable.lexer");
describe('VariableLexer', function () {
    var lexer;
    beforeEach(function () {
        lexer = new variable_lexer_1.VariableLexer(lexer_1.DEFAULT_LEXER_OPTIONS);
    });
    it('should throw an error if a variable key is wrapped in double quotes', function () {
        var input = '"key":"value"';
        (function () { return lexer.invoke(input); }).should.throw('SQiggL Syntax Error: Variable keys should not be wrapped in quotes.');
    });
    it('should throw an error if a variable key is wrapped in single quotes', function () {
        var input = "'key':'value'";
        (function () { return lexer.invoke(input); }).should.throw('SQiggL Syntax Error: Variable keys should not be wrapped in quotes.');
    });
    it('should correctly handle a variable value that has an escaped single quote in the string', function () {
        var input = "key:'Dragon\\'s breath'";
        var result = lexer.invoke(input);
        result.value.should.equal("'Dragon's breath'");
    });
    it('should correctly handle a variable value that has an escaped double quote in the string', function () {
        var input = "key:\"Dragon\\\"s breath\"";
        var result = lexer.invoke(input);
        result.value.should.equal("\"Dragon\"s breath\"");
    });
});
