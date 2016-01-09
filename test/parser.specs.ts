import {Parser} from './../src/parser';
import {DSL} from './../src/dsl';
import * as should from 'should';

describe('Parser', () => {

    describe('comments', () => {
        it('should not output comments by default', () => {
            const parser = new Parser();
            const dsl: DSL[] = [
                {text: 'This is some text'},
                {comment: 'This is a comment'},
            ];
            const result = parser.parse(dsl);
            result.should.equal('This is some text');
        });

        it('should output comments if exportComments option is true', () => {
            const parser = new Parser({exportComments: true});
            const dsl: DSL[] = [
                {text: 'This is some text'},
                {comment: 'This is a comment'}
            ];
            const result = parser.parse(dsl);
            result.should.equal('This is some text/* This is a comment */')
        });
    });

    describe('text', () => {
        it('should output text untouched', () => {
            const parser = new Parser();
            const result = parser.parse([{text: 'this is a test string'}]);
            result.should.equal('this is a test string');
        });
    });

    describe('variable', () => {
        it('should resolve a variable in SQiggL query without an error', () => {
            const parser = new Parser();
            parser.parse([{variable: {literal: 'cat:"meow"', key: 'cat', value: '"meow"'}}]);
        });

        it('should resolve a variable alias in a SQiggL query without an error', () => {
            const parser = new Parser();
            parser.parse([{variable: {literal: 'cat:sound', key: 'cat', value: 'sound'}}], {sound: 'meow'});
        });
    });

    describe('resolveValue', () => {
        it('should correctly output a string literal using single quotes', () => {
            const result = Parser.resolveValue('\'Hello\'', null);
            result.should.equal('Hello');
        });

        it('should correctly output a string literal using double quotes', () => {
            const result = Parser.resolveValue('"Hello"', null);
            result.should.equal('Hello');
        });

        it('should correctly output a number literal', () => {
            const result = Parser.resolveValue('12', null);
            result.should.equal('12');
        });

        it('should correctly output a found variable value', () => {
            const result = Parser.resolveValue('cat', {cat: 'Dragon'});
            result.should.equal('Dragon');
        });

        it('should throw an error if a variable value is undefined', () => {
            (() => Parser.resolveValue('cat', {dragon: 'Fish'})).should.throw('SQiggLError - P1000: cat is not a defined variable in this scope');
        });
    });
});
