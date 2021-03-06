import {ReplacementParser} from './../../src/parsers/replacement.parser';
import {DSLReplacement} from '../../src/dsl';
import {DEFAULT_PARSER_OPTIONS} from '../../src/parser';
import {GreaterThan} from '../../src/expressions';
import {IterableOfUsing} from "../../src/expressions";
import {DSLValueExpression} from "../../src/dsl";
import {DSLBooleanExpression} from "../../src/dsl";
import {DSLExpressionTree} from "../../src/dsl";
import {DSLIterableExpression} from "../../src/dsl";

describe('ReplacementParser', () => {
    describe('parse', () => {
        it('should output a literal string', () => {
            const dsl: DSLReplacement = {literal: '\'Test string\''};
            const result: string = new ReplacementParser(DEFAULT_PARSER_OPTIONS).parse(dsl);
            result.should.eql('Test string');
        });

        it('should output a literal number', () => {
            const dsl: DSLReplacement = {literal: '12'};
            const result: string = new ReplacementParser(DEFAULT_PARSER_OPTIONS).parse(dsl);
            result.should.eql('12');
        });

        it('should output a variable value', () => {
            const dsl: DSLReplacement = {literal: 'dragon'};
            const result: string = new ReplacementParser(DEFAULT_PARSER_OPTIONS).parse(dsl, {dragon: 'Pet'});
            result.should.eql('Pet');
        });

        it('should output the result of a boolean expression', () => {
            const booleanExpression: DSLBooleanExpression = {literal: '12 > 13', expression: GreaterThan, values: ['12', '13']};
            const expressionTree: DSLExpressionTree = {branches: [booleanExpression]};
            const dsl: DSLReplacement = {literal: '12 > 13', expressions: expressionTree};
            const result: string = new ReplacementParser(DEFAULT_PARSER_OPTIONS).parse(dsl);
            result.should.eql('0');
        });

        it('should output the result of a boolean expression with variables', () => {
            const booleanExpression: DSLBooleanExpression = {literal: 'high > low', expression: GreaterThan, values: ['high', 'low']};
            const expressionTree: DSLExpressionTree = {branches: [booleanExpression]};
            const dsl: DSLReplacement = {literal: 'high > low', expressions: expressionTree};
            const result: string = new ReplacementParser(DEFAULT_PARSER_OPTIONS).parse(dsl, {high: 13, low: 12});
            result.should.eql('1');
        });

        it('should output the result of an IterableExpression correctly', () => {
            const iterableExpression: DSLIterableExpression = {literal: 'cat of catTypes using \',\'', expression: IterableOfUsing, local: 'cat', values: [['hairy', 'furry', 'fuzzy']], joiner: '\',\''};
            const expressionTree: DSLExpressionTree = {branches: [iterableExpression]};
            const dsl: DSLReplacement = {literal: 'cat of catTypes using \',\'', expressions: expressionTree};
            const result: string = new ReplacementParser(DEFAULT_PARSER_OPTIONS).parse(dsl);
            result.should.equal('hairy, furry, fuzzy');
        });

        it('should output the result of an IterableExpression correctly using variables', () => {
            const iterableExpression: DSLIterableExpression = {literal: 'cat of catTypes using \',\'', expression: IterableOfUsing, local: 'cat', values: ['array'], joiner: 'joiner'};
            const expressionTree: DSLExpressionTree = {branches: [iterableExpression]};
            const dsl: DSLReplacement = {literal: 'cat of catTypes using \',\'', expressions: expressionTree};
            const result: string = new ReplacementParser(DEFAULT_PARSER_OPTIONS).parse(dsl, {array: ['hairy', 'furry', 'fuzzy'], joiner: ','});
            result.should.equal('hairy, furry, fuzzy');
        });
    });
});