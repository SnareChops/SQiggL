import {ReplacementParser} from './replacement.parser';
import {DSLReplacement} from '../dsl';
import {DEFAULT_PARSER_OPTIONS} from '../parser';
import {GreaterThan} from '../expressions';
import {IterableOf} from "../expressions";

describe('ReplacementParser', () => {
    describe('parse', () => {
        it('should output a literal string', () => {
            const dsl: DSLReplacement = {literal: '\'Test string\'', expression: null};
            const result: string = new ReplacementParser(DEFAULT_PARSER_OPTIONS).parse(dsl);
            result.should.eql('Test string');
        });

        it('should output a literal number', () => {
            const dsl: DSLReplacement = {literal: '12', expression: null};
            const result: string = new ReplacementParser(DEFAULT_PARSER_OPTIONS).parse(dsl);
            result.should.eql('12');
        });

        it('should output a variable value', () => {
            const dsl: DSLReplacement = {literal: 'dragon', expression: null};
            const result: string = new ReplacementParser(DEFAULT_PARSER_OPTIONS).parse(dsl, {dragon: 'Pet'});
            result.should.eql('Pet');
        });

        it('should output the result of a boolean expression', () => {
            const dsl: DSLReplacement = {literal: '12 > 13', expression: GreaterThan, values: ['12', '13']};
            const result: string = new ReplacementParser(DEFAULT_PARSER_OPTIONS).parse(dsl);
            result.should.eql('0');
        });

        it('should output the result of a boolean expression with variables', () => {
            const dsl: DSLReplacement = {literal: 'high > low', expression: GreaterThan, values: ['high', 'low']};
            const result: string = new ReplacementParser(DEFAULT_PARSER_OPTIONS).parse(dsl, {high: 13, low: 12});
            result.should.eql('1');
        });

        it('should output the result of an IterableExpression correctly', () => {
            const dsl: DSLReplacement = {literal: 'cat of catTypes using \',\'', expression: IterableOf, local: 'cat', values: [['hairy', 'furry', 'fuzzy']], joiner: '\',\''};
            const result: string = new ReplacementParser(DEFAULT_PARSER_OPTIONS).parse(dsl);
            result.should.equal('hairy, furry, fuzzy');
        });

        it('should output the result of an IterableExpression correctly using variables', () => {
            const dsl: DSLReplacement = {literal: 'cat of catTypes using \',\'', expression: IterableOf, local: 'cat', values: ['array'], joiner: 'joiner'};
            const result: string = new ReplacementParser(DEFAULT_PARSER_OPTIONS).parse(dsl, {array: ['hairy', 'furry', 'fuzzy'], joiner: ','});
            result.should.equal('hairy, furry, fuzzy');
        });
    });
});