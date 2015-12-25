import {CommandParser} from './command.parser';
import {DSLCommand, DSL} from '../dsl';
import {If} from '../actions';
import {GreaterThan} from '../expressions';
import {DEFAULT_PARSER_OPTIONS} from '../parser';

describe('Command Parser', () => {
    it('should correctly return a string in an if action that is false', () => {
        const dsl: DSL = {command: {literal: 'if 12 > 13', action: If, expression: GreaterThan, values: ['12', '13']}};
        const result = new CommandParser(DEFAULT_PARSER_OPTIONS).parse(dsl);
        result.should.equal('');
    });

    it('should correctly return a string in an if action that is true', () => {
        const dsl: DSL = {command: {literal: 'if 13 > 12', action: If, expression: GreaterThan, values: ['13', '12']}, scope: [{text: 'Hello World'}]};
        const result = new CommandParser(DEFAULT_PARSER_OPTIONS).parse(dsl);
        result.should.equal('Hello World');
    });
});