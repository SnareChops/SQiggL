import {Lexer} from '../src/lexer';
import {DSL, DSLCommand} from "../src/dsl";
import {Not} from '../src/modifiers';
const should = require('should');

describe('Lexer', () => {

    describe('options', () => {
        it('should throw an error if any options use the same character', () => {
            (() => new Lexer({leftWrapperChar: '*', rightWrapperChar: '*'})).should.throwError();
        });

        it('should be ok to change the left and right wrappers', () => {
            const lexer = new Lexer({leftWrapperChar: '(', rightWrapperChar: ')'});
            const result = lexer.parse('SELECT * FROM (table)');
            result[0].should.have.property('text');
            result[1].should.have.property('replacement');
        });
    });

    describe('text', () => {
        it('should return a non-special query unaltered', () => {
            const lexer = new Lexer();
            const query = 'SELECT * FROM Table';
            let result = lexer.parse(query);
            result[0].should.have.property('text', query);
        });

        it('should retain whitespace on text', () => {
            const lexer = new Lexer();
            const query = ' SELECT * FROM Table   ';
            const result = lexer.parse(query);
            result[0].should.have.property('text', query);
        });

        it('should respect newlines in non-special areas', () => {
            const lexer = new Lexer();
            const query = 'SELECT * \nFROM Table';
            const result = lexer.parse(query);
            result[0].should.have.property('text', query);
        });
    });

    describe('replacement', () => {
        it('should find a replacement in a given string', () => {
            const lexer = new Lexer();
            const result = lexer.parse('SELECT * FROM {table}');
            result[1].should.have.property('replacement');
        });

        it('should return a literal for a replacement in a given string', () => {
            const lexer = new Lexer();
            const result = lexer.parse('SELECT * FROM {table}');
            result[1].should.have.property('replacement', {literal: 'table'});
        });

        it('should trim whitespace on replacements', () => {
            const lexer = new Lexer();
            const result = lexer.parse('{ table }');
            result[0].should.have.property('replacement', {literal: 'table'});
        });

        it('should remove newlines from replacements', () => {
            const lexer = new Lexer();
            const result = lexer.parse('{\n something }');
            result[0].should.have.property('replacement', {literal: 'something'});
        });
    });

    describe('command', () => {
        it('should find a command in a given string', () => {
            const lexer = new Lexer();
            const result = lexer.parse('{% if command }');
            result[0].should.have.property('command');
        });

        it('should return a literal for a command in a given string', () => {
            const lexer = new Lexer();
            const result = lexer.parse('{%if command}');
            <DSL>result[0].command.should.have.property('literal', 'if command');
        });

        it('should trim whitespace on commands', () => {
            const lexer = new Lexer();
            const result = lexer.parse('{% if command }');
            <DSL>result[0].command.should.have.property('literal', 'if command');
        });

        it('should remove newlines from commands', () => {
            const lexer = new Lexer();
            const result = lexer.parse('{% if\ncommand}');
            <DSL>result[0].command.should.have.property('literal', 'if command');
        });

        it('should reduce multiple whitespace characters to a single space', () => {
            const lexer = new Lexer();
            const result = lexer.parse('{% if      command}');
            <DSL>result[0].command.should.have.property('literal', 'if command');
        });

        it('should find multiple commands in a given string', () => {
            const lexer = new Lexer();
            const result = lexer.parse('SELECT * FROM {% if table = \'Test\' } TestTable {% else } ProdTable {% endif }');
            <DSL>result[1].command.should.have.property('literal', 'if table = \'Test\'');
            <DSL>result[2].command.should.have.property('literal', 'else');
            <DSL>result[3].command.should.have.property('literal', 'endif');
        });

        it('should correctly identify the action of a command in a given string', () => {
            const lexer = new Lexer();
            const result = lexer.parse('SELECT * FROM {% if }');
            const dsl: DSL = result[1];
            const command: DSLCommand = dsl.command;
            command.action.should.have.property('key', 'if');
        });

        it('should correct identify the action of a command despite casing', () => {
            const lexer = new Lexer();
            const result = lexer.parse('SELECT * FROM {% iF }');
            const dsl: DSL = result[1];
            const command: DSLCommand = dsl.command;
            command.action.should.have.property('key', 'if');
        });
    });

    describe('comment', () => {
        it('should find a comment in a given string', () => {
            const lexer = new Lexer();
            const result = lexer.parse('SELECT * FROM {# something }');
            result[1].should.have.property('comment', 'something');
        });

        it('should trim whitespace on comments', () => {
            const lexer = new Lexer();
            const result = lexer.parse('{# test comment }');
            result[0].should.have.property('comment', 'test comment');
        });

    });

    describe('variable', () => {
        it('should find variable declarations in a given string', () => {
            const lexer = new Lexer();
            const result = lexer.parse('{+ key:value }');
            result[0].should.have.property('variable');
        });

        it('should remove all whitespace from variable declarations', () => {
            const lexer = new Lexer();
            const result = lexer.parse('{+ key : value }');
            <DSL>result[0].variable.should.have.property('literal', 'key:value');
        });

        it('should also remove newlines from variable declarations', () => {
            const lexer = new Lexer();
            const result = lexer.parse('{+ key : \n value');
            <DSL>result[0].variable.should.have.property('literal', 'key:value');
        });

        it('should correctly set a key and value', () => {
            const lexer = new Lexer();
            const result = lexer.parse(`{+ dragon:'cat' }`);
            <DSL>result[0].variable.should.have.property('key');
            <DSL>result[0].variable.should.have.property('value');
        });

        it('should correctly set the value of key and value', () => {
            const lexer = new Lexer();
            const result = lexer.parse(`{+ dragon:'cat' }`);
            <DSL>result[0].variable.should.have.property('key', 'dragon');
            <DSL>result[0].variable.should.have.property('value', "'cat'");
        });

        it('should correctly handle a variable with an opposite quote inside a string value', () => {
            const lexer = new Lexer();
            const result = lexer.parse(`{+ dragon: "Felix's pet" }`);
            <DSL>result[0].variable.should.have.property('key', 'dragon');
            <DSL>result[0].variable.should.have.property('value', `"Felix's pet"`);
        });
    });

    describe('scope', () => {
        it('should determine the correct level of items nested in actions', () => {
            const lexer = new Lexer();
            const result = lexer.parse('SELECT * FROM {% if table = \'Test\' } TestTable {% else } ProdTable {% endif }');
            <DSL>result[0].should.have.property('text');
            <DSL>result[1].should.have.property('command');
            <DSL>result[1].should.have.property('scope');
            <DSL>result[1].scope[0].should.have.property('text');
            <DSL>result[2].should.have.property('command');
            <DSL>result[2].should.have.property('scope');
            <DSL>result[2].scope[0].should.have.property('text');
            <DSL>result[3].should.have.property('command');
        });
    });

    describe('expressions', () => {
        it('should detect an expression in a replacement', () => {
            const lexer = new Lexer();
            const result = lexer.parse('{12 > 13}');
            <DSL>result[0].replacement.should.have.property('expression');
        });

        it('should detect an expression in a replacement with a modifier', () => {
            const lexer = new Lexer();
            const result = lexer.parse('{12 !< 13}');
            <DSL>result[0].replacement.should.have.property('expression');
        });

        it('should correctly identify a modifier in an expression', () => {
            const lexer = new Lexer();
            const result = lexer.parse('{12 !> 13}');
            <DSL>result[0].replacement.should.have.property('modifiers');
            <DSL>result[0].replacement.modifiers[0].should.equal(Not)
        });

        it('should correctly identify the values in an expression', () => {
            const lexer = new Lexer();
            const result = lexer.parse('{12 > 13}');
            <DSL>result[0].replacement.values[0].should.equal('12');
            <DSL>result[0].replacement.values[1].should.equal('13');
        });
    });
});