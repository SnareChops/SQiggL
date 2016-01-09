import {DEFAULT_LEXER_OPTIONS} from '../../src/lexer';
import {CommandLexer} from './../../src/lexers/command.lexer';
import {CORE_ACTIONS} from '../../src/actions';
import {CORE_EXPRESSIONS} from '../../src/expressions';
import {CORE_CONJUNCTIONS} from '../../src/conjunctions';

describe('CommandLexer', () => {
    it('should throw an error if the first word of a command is not a known action', () => {
        const lexer = new CommandLexer(DEFAULT_LEXER_OPTIONS, CORE_ACTIONS, CORE_EXPRESSIONS, CORE_CONJUNCTIONS);
        const input = 'not a command';
        const parts = ['not', ' ', 'a', ' ', 'command'];
        (() => lexer.invoke(input, parts)).should.throw('SQiggLError - LC1000: Commands require the first word to be a known action. not is not a recognized action.');
    });
});