var parser_1 = require('./parser');
describe('Parser', function () {
    describe('comments', function () {
        it('should not output comments by default', function () {
            var parser = new parser_1.Parser();
            var dsl = [
                { text: 'This is some text' },
                { comment: 'This is a comment' },
            ];
            var result = parser.parse(dsl);
            result.should.equal('This is some text');
        });
        it('should output comments if exportComments option is true', function () {
            var parser = new parser_1.Parser({ exportComments: true });
            var dsl = [
                { text: 'This is some text' },
                { comment: 'This is a comment' }
            ];
            var result = parser.parse(dsl);
            result.should.equal('This is some text/* This is a comment */');
        });
    });
    describe('text', function () {
        it('should output text untouched', function () {
            var parser = new parser_1.Parser();
            var result = parser.parse([{ text: 'this is a test string' }]);
            result.should.equal('this is a test string');
        });
    });
    describe('variable', function () {
        it('should resolve a variable in SQiggL query without an error', function () {
            var parser = new parser_1.Parser();
            parser.parse([{ variable: { literal: 'cat:"meow"', key: 'cat', value: '"meow"' } }]);
        });
        it('should resolve a variable alias in a SQiggL query without an error', function () {
            var parser = new parser_1.Parser();
            parser.parse([{ variable: { literal: 'cat:sound', key: 'cat', value: 'sound' } }], { sound: 'meow' });
        });
    });
    describe('resolveValue', function () {
        it('should correctly output a string literal using single quotes', function () {
            var result = parser_1.Parser.resolveValue('\'Hello\'', null);
            result.should.equal('Hello');
        });
        it('should correctly output a string literal using double quotes', function () {
            var result = parser_1.Parser.resolveValue('"Hello"', null);
            result.should.equal('Hello');
        });
        it('should correctly output a number literal', function () {
            var result = parser_1.Parser.resolveValue('12', null);
            result.should.equal('12');
        });
        it('should correctly output a found variable value', function () {
            var result = parser_1.Parser.resolveValue('cat', { cat: 'Dragon' });
            result.should.equal('Dragon');
        });
        it('should throw an error if a variable value is undefined', function () {
            (function () { return parser_1.Parser.resolveValue('cat', { dragon: 'Fish' }); }).should.throw('SQiggLParserError: cat is not a defined variable in this scope');
        });
    });
});
