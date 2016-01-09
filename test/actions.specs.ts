import {If, Unless, Else, For} from './../src/actions';
import {DSL, DSLCommand, DSLExpressionTree} from './../src/dsl';
import {Parser, DEFAULT_PARSER_OPTIONS} from './../src/parser';
import {IterableOfUsing, BooleanExpressionResult} from './../src/expressions';
import * as should from 'should';

describe('Actions', () => {
    describe('If', () => {
        it('should return the inner scope if the expression is true', () => {
            const dsl: DSL[] = [{text: 'Hello World'}];
            const result = If.rule({value: true}, null, dsl, new Parser(DEFAULT_PARSER_OPTIONS));
            result.should.equal('Hello World');
        });

        it('should return null if the expression is false', () => {
            const dsl: DSL[] = [{text: 'Hello World'}];
            const result = If.rule({value: false}, null, dsl, new Parser(DEFAULT_PARSER_OPTIONS));
            should(result).equal(null);
        });
    });

    describe('Unless', () => {
        it('should return null if the expression is true', () => {
            const dsl: DSL[] = [{text: 'Hello World'}];
            const result = Unless.rule({value: true}, null, dsl, new Parser(DEFAULT_PARSER_OPTIONS));
            should(result).equal(null);
        });

        it('should return the inner scope if the expression is false', () => {
            const dsl: DSL[] = [{text: 'Hello World'}];
            const result = Unless.rule({value: false}, null, dsl, new Parser(DEFAULT_PARSER_OPTIONS));
            result.should.equal('Hello World');
        });
    });

    describe('Else', () => {
        it('should return the inner scope if the expression is true', () => {
            const dsl: DSL[] = [{text: 'Hello World'}];
            const result = Else.rule({value: true}, null, dsl, new Parser(DEFAULT_PARSER_OPTIONS));
            result.should.equal('Hello World');
        });

        it('should return the inner scope if the expression is false', () => {
            const dsl: DSL[] = [{text: 'Hello World'}];
            const result = Else.rule({value: false}, null, dsl, new Parser(DEFAULT_PARSER_OPTIONS));
            result.should.equal('Hello World');
        });
    });

    describe('For', () => {
        it('should return the inner scope as many times as there are values and combining them with the joiner', () => {
            const dsl: DSL[] = [{text: 'Hello World'}];
            const result = For.rule({value: ['1', '2', '3'], iterable: {local: 'var', joiner: '\',\''}}, void 0, dsl, new Parser(DEFAULT_PARSER_OPTIONS));
            result.should.equal('Hello World, Hello World, Hello World');
        });

        it('should iterate the inner scope and correctly replace the inner values using the expressionResult', () => {
            const dsl: DSL[] = [{text: 'Iteration '}, {replacement: {literal: 'var'}}];
            const result = For.rule({value: ['1', '2', '3'], iterable: {local: 'var', joiner: '\',\''}}, void 0, dsl, new Parser(DEFAULT_PARSER_OPTIONS));
            result.should.equal('Iteration 1, Iteration 2, Iteration 3');
        });
    });
});