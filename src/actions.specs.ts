import {If, Unless, Else, For} from './actions';
import {DSL} from './dsl';
import {Parser, DEFAULT_PARSER_OPTIONS} from './parser';
import * as should from 'should';

describe('Actions', () => {
    describe('If', () => {
        it('should return the inner scope if the expression is true', () => {
            const dsl: DSL[] = [{text: 'Hello World'}];
            const result = If.rule(true, null, dsl, new Parser(DEFAULT_PARSER_OPTIONS));
            result.should.equal('Hello World');
        });

        it('should return null if the expression is false', () => {
            const dsl: DSL[] = [{text: 'Hello World'}];
            const result = If.rule(false, null, dsl, new Parser(DEFAULT_PARSER_OPTIONS));
            should(result).equal(null);
        });
    });

    describe('Unless', () => {
        it('should return null if the expression is true', () => {
            const dsl: DSL[] = [{text: 'Hello World'}];
            const result = Unless.rule(true, null, dsl, new Parser(DEFAULT_PARSER_OPTIONS));
            should(result).equal(null);
        });

        it('should return the inner scope if the expression is false', () => {
            const dsl: DSL[] = [{text: 'Hello World'}];
            const result = Unless.rule(false, null, dsl, new Parser(DEFAULT_PARSER_OPTIONS));
            result.should.equal('Hello World');
        });
    });

    describe('Else', () => {
        it('should return the inner scope if the expression is true', () => {
            const dsl: DSL[] = [{text: 'Hello World'}];
            const result = Else.rule(true, null, dsl, new Parser(DEFAULT_PARSER_OPTIONS));
            result.should.equal('Hello World');
        });

        it('should return the inner scope if the expression is false', () => {
            const dsl: DSL[] = [{text: 'Hello World'}];
            const result = Else.rule(false, null, dsl, new Parser(DEFAULT_PARSER_OPTIONS));
            result.should.equal('Hello World');
        });
    });

    //TODO: For
});