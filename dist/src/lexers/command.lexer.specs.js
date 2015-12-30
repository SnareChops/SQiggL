var lexer_1 = require('../lexer');
var command_lexer_1 = require('./command.lexer');
var actions_1 = require('../actions');
var expressions_1 = require('../expressions');
describe('CommandLexer', function () {
    it('should throw an error if the first word of a command is not a known action', function () {
        var lexer = new command_lexer_1.CommandLexer(lexer_1.DEFAULT_LEXER_OPTIONS, actions_1.CORE_ACTIONS, expressions_1.CORE_EXPRESSIONS);
        var input = 'not a command';
        var parts = ['not', ' ', 'a', ' ', 'command'];
        (function () { return lexer.invoke(input, parts); }).should.throw('SQiggL No Action Error: Commands require the first word to be a known action. not is not a recognized action.');
    });
});
