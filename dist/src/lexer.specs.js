var lexer_1 = require('../src/lexer');
var modifiers_1 = require('../src/modifiers');
var should = require('should');
describe('Lexer', function () {
    it('should throw an error if a query contains an incomplete statement', function () {
        var lexer = new lexer_1.Lexer();
        (function () { return lexer.parse('SELECT * FROM {Table'); }).should.throw('SQiggLLexerError: Expected statement to complete before end of file.');
    });
    it('should throw an throw an error if a query does not close a statement before declaring another', function () {
        var lexer = new lexer_1.Lexer();
        (function () { return lexer.parse('SELECT * FROM {Table WHERE id = {12}'); }).should.throw('SQiggLLexerError: Unexpected \'{\' found in statement. Expected \'}\'.');
    });
    it('should throw an error if a query is incorrectly nested', function () {
        var lexer = new lexer_1.Lexer();
        var query = 'SELECT * FROM {% if 12 > 13} Test {% endif } {% endif }';
        (function () { return lexer.parse(query); }).should.throw('SQiggLLexerError: Your SQiggL is incorrectly nested.');
    });
    it('should throw an error if a query is incompletely nested', function () {
        var lexer = new lexer_1.Lexer();
        var query = 'SELECT * FROM {% if 12 > 13 } Test';
        (function () { return lexer.parse(query); }).should.throw('SQiggLLexerError: Your SQiggL query is nested but does not return to the top level before completing. Please check your nesting.');
    });
    it('should correctly handle escaped single quotes in strings', function () {
        var lexer = new lexer_1.Lexer();
        var query = "SELECT * FROM {'Dragon\\'s run'}";
        var result = lexer.parse(query);
        result[1].replacement.literal.should.equal("'Dragon's run'");
    });
    it('should correctly handle escaped double quotes in strings', function () {
        var lexer = new lexer_1.Lexer();
        var query = "SELECT * FROM {\"Dragon\\\"s run\"}";
        var result = lexer.parse(query);
        result[1].replacement.literal.should.equal('"Dragon"s run"');
    });
    it('should correctly handle an escaped escape character in strings', function () {
        var lexer = new lexer_1.Lexer();
        var query = "SELECT * FROM {'Me\\\\You'}";
        var result = lexer.parse(query);
        result[1].replacement.literal.should.equal("'Me\\You'");
    });
    it('should throw an error if an illegal escape character exists in a string', function () {
        var lexer = new lexer_1.Lexer();
        var query = "SELECT * FROM {'\\Something'}";
        (function () { return lexer.parse(query); }).should.throw("SQiggLLexerError: Illegal escape character found in string '\\Something' at index 1");
    });
    describe('options', function () {
        it('should throw an error if any options use the same character', function () {
            (function () { return new lexer_1.Lexer({ leftWrapperChar: '*', rightWrapperChar: '*' }); }).should.throwError();
        });
        it('should be ok to change the left and right wrappers', function () {
            var lexer = new lexer_1.Lexer({ leftWrapperChar: '(', rightWrapperChar: ')' });
            var result = lexer.parse('SELECT * FROM (table)');
            result[0].should.have.property('text');
            result[1].should.have.property('replacement');
        });
    });
    describe('text', function () {
        it('should return a non-special query unaltered', function () {
            var lexer = new lexer_1.Lexer();
            var query = 'SELECT * FROM Table';
            var result = lexer.parse(query);
            result[0].should.have.property('text', query);
        });
        it('should retain whitespace on text', function () {
            var lexer = new lexer_1.Lexer();
            var query = ' SELECT * FROM Table   ';
            var result = lexer.parse(query);
            result[0].should.have.property('text', query);
        });
        it('should respect newlines in non-special areas', function () {
            var lexer = new lexer_1.Lexer();
            var query = 'SELECT * \nFROM Table';
            var result = lexer.parse(query);
            result[0].should.have.property('text', query);
        });
    });
    describe('replacement', function () {
        it('should find a replacement in a given string', function () {
            var lexer = new lexer_1.Lexer();
            var result = lexer.parse('SELECT * FROM {table}');
            result[1].should.have.property('replacement');
        });
        it('should return a literal for a replacement in a given string', function () {
            var lexer = new lexer_1.Lexer();
            var result = lexer.parse('SELECT * FROM {table}');
            result[1].should.have.property('replacement', { literal: 'table' });
        });
        it('should trim whitespace on replacements', function () {
            var lexer = new lexer_1.Lexer();
            var result = lexer.parse('{ table }');
            result[0].should.have.property('replacement', { literal: 'table' });
        });
        it('should remove newlines from replacements', function () {
            var lexer = new lexer_1.Lexer();
            var result = lexer.parse('{\n something }');
            result[0].should.have.property('replacement', { literal: 'something' });
        });
    });
    describe('command', function () {
        it('should find a command in a given string', function () {
            var lexer = new lexer_1.Lexer();
            var result = lexer.parse('{% if command } {% endif}');
            result[0].should.have.property('command');
        });
        it('should return a literal for a command in a given string', function () {
            var lexer = new lexer_1.Lexer();
            var result = lexer.parse('{%if command} {%endif}');
            result[0].command.should.have.property('literal', 'if command');
        });
        it('should trim whitespace on commands', function () {
            var lexer = new lexer_1.Lexer();
            var result = lexer.parse('{% if command } {%endif}');
            result[0].command.should.have.property('literal', 'if command');
        });
        it('should remove newlines from commands', function () {
            var lexer = new lexer_1.Lexer();
            var result = lexer.parse('{% if\ncommand} {%endif}');
            result[0].command.should.have.property('literal', 'if command');
        });
        it('should reduce multiple whitespace characters to a single space', function () {
            var lexer = new lexer_1.Lexer();
            var result = lexer.parse('{% if      command} {%endif}');
            result[0].command.should.have.property('literal', 'if command');
        });
        it('should find multiple commands in a given string', function () {
            var lexer = new lexer_1.Lexer();
            var result = lexer.parse('SELECT * FROM {% if table = \'Test\' } TestTable {% else } ProdTable {% endif }');
            result[1].command.should.have.property('literal', 'if table = \'Test\'');
            result[2].command.should.have.property('literal', 'else');
            result[3].command.should.have.property('literal', 'endif');
        });
        it('should correctly identify the action of a command in a given string', function () {
            var lexer = new lexer_1.Lexer();
            var result = lexer.parse('SELECT * FROM {% if } {%endif}');
            var dsl = result[1];
            var command = dsl.command;
            command.action.should.have.property('key', 'if');
        });
        it('should correct identify the action of a command despite casing', function () {
            var lexer = new lexer_1.Lexer();
            var result = lexer.parse('SELECT * FROM {% iF } {%endif}');
            var dsl = result[1];
            var command = dsl.command;
            command.action.should.have.property('key', 'if');
        });
    });
    describe('comment', function () {
        it('should find a comment in a given string', function () {
            var lexer = new lexer_1.Lexer();
            var result = lexer.parse('SELECT * FROM {# something }');
            result[1].should.have.property('comment', 'something');
        });
        it('should trim whitespace on comments', function () {
            var lexer = new lexer_1.Lexer();
            var result = lexer.parse('{# test comment }');
            result[0].should.have.property('comment', 'test comment');
        });
    });
    describe('variable', function () {
        it('should find variable declarations in a given string', function () {
            var lexer = new lexer_1.Lexer();
            var result = lexer.parse('{+ key:value }');
            result[0].should.have.property('variable');
        });
        it('should remove all whitespace from variable declarations', function () {
            var lexer = new lexer_1.Lexer();
            var result = lexer.parse('{+ key : value }');
            result[0].variable.should.have.property('literal', 'key:value');
        });
        it('should also remove newlines from variable declarations', function () {
            var lexer = new lexer_1.Lexer();
            var result = lexer.parse('{+ key : \n value }');
            result[0].variable.should.have.property('literal', 'key:value');
        });
        it('should correctly set a key and value', function () {
            var lexer = new lexer_1.Lexer();
            var result = lexer.parse("{+ dragon:'cat' }");
            result[0].variable.should.have.property('key');
            result[0].variable.should.have.property('value');
        });
        it('should correctly set the value of key and value', function () {
            var lexer = new lexer_1.Lexer();
            var result = lexer.parse("{+ dragon:'cat' }");
            result[0].variable.should.have.property('key', 'dragon');
            result[0].variable.should.have.property('value', "'cat'");
        });
        it('should correctly handle a variable with an opposite quote inside a string value', function () {
            var lexer = new lexer_1.Lexer();
            var result = lexer.parse("{+ dragon: \"Felix's pet\" }");
            result[0].variable.should.have.property('key', 'dragon');
            result[0].variable.should.have.property('value', "\"Felix's pet\"");
        });
    });
    describe('scope', function () {
        it('should determine the correct level of items nested in actions', function () {
            var lexer = new lexer_1.Lexer();
            var result = lexer.parse('SELECT * FROM {% if table = \'Test\' } TestTable {% else } ProdTable {% endif }');
            result[0].should.have.property('text');
            result[1].should.have.property('command');
            result[1].should.have.property('scope');
            result[1].scope[0].should.have.property('text');
            result[2].should.have.property('command');
            result[2].should.have.property('scope');
            result[2].scope[0].should.have.property('text');
            result[3].should.have.property('command');
        });
    });
    describe('expressions', function () {
        it('should detect an expression in a replacement', function () {
            var lexer = new lexer_1.Lexer();
            var result = lexer.parse('{12 > 13}');
            result[0].replacement.should.have.property('expression');
        });
        it('should detect an expression in a replacement with a modifier', function () {
            var lexer = new lexer_1.Lexer();
            var result = lexer.parse('{12 !< 13}');
            result[0].replacement.should.have.property('expression');
        });
        it('should correctly identify a modifier in an expression', function () {
            var lexer = new lexer_1.Lexer();
            var result = lexer.parse('{12 !> 13}');
            result[0].replacement.should.have.property('modifiers');
            result[0].replacement.modifiers[0].should.equal(modifiers_1.Not);
        });
        it('should correctly identify the values in an expression', function () {
            var lexer = new lexer_1.Lexer();
            var result = lexer.parse('{12 > 13}');
            result[0].replacement.values[0].should.equal('12');
            result[0].replacement.values[1].should.equal('13');
        });
    });
});
