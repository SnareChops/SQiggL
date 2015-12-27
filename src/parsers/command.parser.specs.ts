import {CommandParser} from './command.parser';
import {DSLCommand, DSL, DSLText, DSLReplacement} from '../dsl';
import {If, Else, For} from '../actions';
import {GreaterThan, IterableOf} from '../expressions';
import {DEFAULT_PARSER_OPTIONS} from '../parser';

describe('Command Parser', () => {
    it('should correctly return a string in a StartingAction that is false', () => {
        const dsl: DSL = {command: {literal: 'if 12 > 13', action: If, expression: GreaterThan, values: ['12', '13']}};
        const result = new CommandParser(DEFAULT_PARSER_OPTIONS).parse(dsl);
        result.should.equal('');
    });

    it('should correctly return a string in a StartingAction that is true', () => {
        const dsl: DSL = {command: {literal: 'if 13 > 12', action: If, expression: GreaterThan, values: ['13', '12']}, scope: [{text: 'Hello World'}]};
        const result = new CommandParser(DEFAULT_PARSER_OPTIONS).parse(dsl);
        result.should.equal('Hello World');
    });

    it('should correctly return a string in a DependentAction', () => {
        const dsl: DSL = {command: {literal: 'else', action: Else, expression: null}, scope: [{text: 'Merry Christmas'}]};
        const result = new CommandParser(DEFAULT_PARSER_OPTIONS).parse(dsl);
        result.should.equal('Merry Christmas');
    });

    it('should correctly return a string for an IterableCommand', () => {
        const commandDSL: DSLCommand = {literal: 'for cat of catTypes using \', \'', action: For, expression: IterableOf, local: 'cat', values: [['hairy', 'furry', 'fuzzy']], joiner: '\',\''};
        const textDSL: DSLText = {text: 'Hello '};
        const replacementDSL: DSLReplacement = {literal: 'cat', expression: null};
        const dsl: DSL = {command: commandDSL, scope: [textDSL, {replacement: replacementDSL}]};
        const result: string = new CommandParser(DEFAULT_PARSER_OPTIONS).parse(dsl);
        result.should.equal('Hello hairy, Hello furry, Hello fuzzy');
    });
});