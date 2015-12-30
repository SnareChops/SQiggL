import {DEFAULT_LEXER_OPTIONS} from '../lexer';
import {CommandLexer} from './command.lexer';
import {CORE_ACTIONS} from '../actions';
import {CORE_EXPRESSIONS} from '../expressions';

describe('CommandLexer', () => {
    it('should throw an error if the first word of a command is not a known action', () => {
        const lexer = new CommandLexer(DEFAULT_LEXER_OPTIONS, CORE_ACTIONS, CORE_EXPRESSIONS);
        const input = 'not a command';
        const parts = ['not', ' ', 'a', ' ', 'command'];
        (() => lexer.invoke(input, parts)).should.throw('SQiggL No Action Error: Commands require the first word to be a known action. not is not a recognized action.');
    });
});