var command_parser_1 = require('./command.parser');
var actions_1 = require('../actions');
var expressions_1 = require('../expressions');
var parser_1 = require('../parser');
describe('Command Parser', function () {
    it('should correctly return a string in a StartingAction that is false', function () {
        var dsl = { command: { literal: 'if 12 > 13', action: actions_1.If, expression: expressions_1.GreaterThan, values: ['12', '13'] } };
        var result = new command_parser_1.CommandParser(parser_1.DEFAULT_PARSER_OPTIONS).parse(dsl);
        result.should.equal('');
    });
    it('should correctly return a string in a StartingAction that is true', function () {
        var dsl = { command: { literal: 'if 13 > 12', action: actions_1.If, expression: expressions_1.GreaterThan, values: ['13', '12'] }, scope: [{ text: 'Hello World' }] };
        var result = new command_parser_1.CommandParser(parser_1.DEFAULT_PARSER_OPTIONS).parse(dsl);
        result.should.equal('Hello World');
    });
    it('should correctly return a string in a DependentAction', function () {
        var dsl = { command: { literal: 'else', action: actions_1.Else, expression: null }, scope: [{ text: 'Merry Christmas' }] };
        var result = new command_parser_1.CommandParser(parser_1.DEFAULT_PARSER_OPTIONS).parse(dsl);
        result.should.equal('Merry Christmas');
    });
    it('should correctly return a string for an IterableCommand', function () {
        var commandDSL = { literal: 'for cat of catTypes using \', \'', action: actions_1.For, expression: expressions_1.IterableOfUsing, local: 'cat', values: [['hairy', 'furry', 'fuzzy']], joiner: '\',\'' };
        var textDSL = { text: 'Hello ' };
        var replacementDSL = { literal: 'cat', expression: null };
        var dsl = { command: commandDSL, scope: [textDSL, { replacement: replacementDSL }] };
        var result = new command_parser_1.CommandParser(parser_1.DEFAULT_PARSER_OPTIONS).parse(dsl);
        result.should.equal('Hello hairy, Hello furry, Hello fuzzy');
    });
});
