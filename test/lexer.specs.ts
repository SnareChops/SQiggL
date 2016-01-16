import {Lexer} from '../src/lexer';
import {DSL, DSLCommand} from "../src/dsl";
import {Not, BooleanModifier} from '../src/modifiers';
import * as should from 'should';
import {StartingAction, TerminatingAction} from '../src/actions';
import {ExpressionResult, BooleanExpression, VALUE, SPACE, ExpressionValue} from '../src/expressions';
import {ScopedVariables} from '../src/variables';
import {Parser} from '../src/parser';
import {Conjunction} from '../src/conjunctions';
import {ScopeResolver} from '../src/resolvers';

describe('Lexer', () => {
    let instance: Lexer;
    beforeEach(() => {
        instance = new Lexer();
    });

    it('should throw an error if a query contains an incomplete statement', () => {
        const lexer = new Lexer();
        (() => lexer.invoke('SELECT * FROM {Table')).should.throw('SQiggLError - L1002: Expected statement to complete before end of file.');
    });

    it('should throw an throw an error if a query does not close a statement before declaring another', () => {
        const lexer = new Lexer();
        (() => lexer.invoke('SELECT * FROM {Table WHERE id = {12}')).should.throw('SQiggLError - L1001: Unexpected \'{\' found in statement. Expected \'}\'.');
    });

    it('should throw an error if a query is incorrectly nested', () => {
        const lexer = new Lexer();
        const query = 'SELECT * FROM {% if 12 > 13} Test {% endif } {% endif }';
        (() => lexer.invoke(query)).should.throw('SQiggLError - L1003: Your SQiggL is incorrectly nested.');
    });

    it('should throw an error if a query is incompletely nested', () => {
        const lexer = new Lexer();
        const query = 'SELECT * FROM {% if 12 > 13 } Test';
        (() => lexer.invoke(query)).should.throw('SQiggLError - L1004: Your SQiggL query is nested but does not return to the top level before completing. Please check your nesting.');
    });

    it('should throw an error if an invalid string is found in a part', () => {
        const query = 'SELECT * FROM {\'Table}';
        (() => instance.invoke(query)).should.throw('SQiggLError - L1006: Invalid string found in \'Table');
    });

    it('should correctly handle a custom action', () => {
        const replaceAction: StartingAction = new StartingAction('ReplaceAction', 'replace', (expressionResult: ExpressionResult, variables: ScopedVariables, resolveScope: ScopeResolver) => {
            return resolveScope();
        });
        const endAction: TerminatingAction = new TerminatingAction('EndReplaceAction', 'endreplace', [replaceAction]);
        const lexer = new Lexer({customActions: [replaceAction, endAction]});
        const query = '{% replace \'Hello World\'} SELECT * FROM Table {%endreplace}';
        const result = lexer.invoke(query);
        result[0].command.action.should.equal(replaceAction);
        result[1].command.action.should.equal(endAction);
    });

    it('should correctly handle a custom expression', () => {
        const testExpression: BooleanExpression = new BooleanExpression([VALUE, SPACE, 'blah', SPACE, VALUE], (values: ExpressionValue[]) => {
            return (+values[0]) > (+values[1]);
        });
        const lexer = new Lexer({customExpressions: [testExpression]});
        const query = '{12 blah 13}';
        const result = lexer.invoke(query);
        result[0].replacement.expressions.branches[0].expression.should.equal(testExpression);
    });

    it('should correctly handle a custom modifier', () => {
        const testModifier: BooleanModifier = new BooleanModifier(['!'], (prevResult: boolean, values: string[]) => {
            return !prevResult;
        });
        const testExpression: BooleanExpression = new BooleanExpression([VALUE, SPACE, [{0: testModifier}], 'blah', SPACE, VALUE], (values: ExpressionValue[]) => {
            return (+values[0]) > (+values[1]);
        });
        const lexer = new Lexer({customExpressions: [testExpression], customModifiers: [testModifier]});
        const query = '{12 !blah 13}';
        const result = lexer.invoke(query);
        result[0].replacement.expressions.branches[0].modifiers[0].should.equal(testModifier);
    });

    it('should correctly handle a custom conjunction', () => {
        const testConjunction: Conjunction = {
            keys: ['blah'],
            rule: (expressionResults: boolean[]) => expressionResults[0] && expressionResults[1]
        };
        const lexer = new Lexer({customConjunctions: [testConjunction]});
        const query = '{12 > 13 blah 13 < 12}';
        const result = lexer.invoke(query);
        result[0].replacement.expressions.conjunctions[0].should.equal(testConjunction);
    });

    it('should correctly handle escaped single quotes in strings', () => {
        const lexer = new Lexer();
        const query = `SELECT * FROM {'Dragon\\'s run'}`;
        const result = lexer.invoke(query);
        result[1].replacement.literal.should.equal("'Dragon's run'");
    });

    it('should correctly handle escaped double quotes in strings', () => {
        const lexer = new Lexer();
        const query = `SELECT * FROM {"Dragon\\"s run"}`;
        const result = lexer.invoke(query);
        result[1].replacement.literal.should.equal('"Dragon"s run"');
    });

    it('should correctly handle an escaped escape character in strings', () => {
        const lexer = new Lexer();
        const query = `SELECT * FROM {'Me\\\\You'}`;
        const result = lexer.invoke(query);
        result[1].replacement.literal.should.equal("'Me\\You'");
    });

    it('should throw an error if an illegal escape character exists in a string', () => {
        const lexer = new Lexer();
        const query = `SELECT * FROM {'\\Something'}`;
        (() => lexer.invoke(query)).should.throw('SQiggLError - L1005: Illegal escape character found in string \'\\Something\' at index 1');
    });

    describe('options', () => {
        it('should throw an error if any options use the same character', () => {
            (() => new Lexer({leftWrapperChar: '*', rightWrapperChar: '*'})).should.throwError();
        });

        it('should be ok to change the left and right wrappers', () => {
            const lexer = new Lexer({leftWrapperChar: '(', rightWrapperChar: ')'});
            const result = lexer.invoke('SELECT * FROM (table)');
            result[0].should.have.property('text');
            result[1].should.have.property('replacement');
        });
    });

    describe('text', () => {
        it('should return a non-special query unaltered', () => {
            const lexer = new Lexer();
            const query = 'SELECT * FROM Table';
            let result = lexer.invoke(query);
            result[0].should.have.property('text', query);
        });

        it('should retain whitespace on text', () => {
            const lexer = new Lexer();
            const query = ' SELECT * FROM Table   ';
            const result = lexer.invoke(query);
            result[0].should.have.property('text', query);
        });

        it('should respect newlines in non-special areas', () => {
            const lexer = new Lexer();
            const query = 'SELECT * \nFROM Table';
            const result = lexer.invoke(query);
            result[0].should.have.property('text', query);
        });
    });

    describe('replacement', () => {
        it('should find a replacement in a given string', () => {
            const lexer = new Lexer();
            const result = lexer.invoke('SELECT * FROM {table}');
            result[1].should.have.property('replacement');
        });

        it('should return a literal for a replacement in a given string', () => {
            const lexer = new Lexer();
            const result = lexer.invoke('SELECT * FROM {table}');
            result[1].should.have.property('replacement', {literal: 'table'});
        });

        it('should trim whitespace on replacements', () => {
            const lexer = new Lexer();
            const result = lexer.invoke('{ table }');
            result[0].should.have.property('replacement', {literal: 'table'});
        });

        it('should remove newlines from replacements', () => {
            const lexer = new Lexer();
            const result = lexer.invoke('{\n something }');
            result[0].should.have.property('replacement', {literal: 'something'});
        });
    });

    describe('command', () => {
        it('should find a command in a given string', () => {
            const lexer = new Lexer();
            const result = lexer.invoke('{% if command } {% endif}');
            result[0].should.have.property('command');
        });

        it('should return a literal for a command in a given string', () => {
            const lexer = new Lexer();
            const result = lexer.invoke('{%if command} {%endif}');
            <DSL>result[0].command.should.have.property('literal', 'if command');
        });

        it('should trim whitespace on commands', () => {
            const lexer = new Lexer();
            const result = lexer.invoke('{% if command } {%endif}');
            <DSL>result[0].command.should.have.property('literal', 'if command');
        });

        it('should remove newlines from commands', () => {
            const lexer = new Lexer();
            const result = lexer.invoke('{% if\ncommand} {%endif}');
            <DSL>result[0].command.should.have.property('literal', 'if command');
        });

        it('should reduce multiple whitespace characters to a single space', () => {
            const lexer = new Lexer();
            const result = lexer.invoke('{% if      command} {%endif}');
            <DSL>result[0].command.should.have.property('literal', 'if command');
        });

        it('should find multiple commands in a given string', () => {
            const lexer = new Lexer();
            const result = lexer.invoke('SELECT * FROM {% if table = \'Test\' } TestTable {% else } ProdTable {% endif }');
            <DSL>result[1].command.should.have.property('literal', 'if table = \'Test\'');
            <DSL>result[2].command.should.have.property('literal', 'else');
            <DSL>result[3].command.should.have.property('literal', 'endif');
        });

        it('should correctly identify the action of a command in a given string', () => {
            const lexer = new Lexer();
            const result = lexer.invoke('SELECT * FROM {% if } {%endif}');
            const dsl: DSL = result[1];
            const command: DSLCommand = dsl.command;
            command.action.should.have.property('key', 'if');
        });

        it('should correct identify the action of a command despite casing', () => {
            const lexer = new Lexer();
            const result = lexer.invoke('SELECT * FROM {% iF } {%endif}');
            const dsl: DSL = result[1];
            const command: DSLCommand = dsl.command;
            command.action.should.have.property('key', 'if');
        });
    });

    describe('comment', () => {
        it('should find a comment in a given string', () => {
            const lexer = new Lexer();
            const result = lexer.invoke('SELECT * FROM {# something }');
            result[1].should.have.property('comment', 'something');
        });

        it('should trim whitespace on comments', () => {
            const lexer = new Lexer();
            const result = lexer.invoke('{# test comment }');
            result[0].should.have.property('comment', 'test comment');
        });

    });

    describe('variable', () => {
        it('should find variable declarations in a given string', () => {
            const lexer = new Lexer();
            const result = lexer.invoke('{+ key:value }');
            result[0].should.have.property('variable');
        });

        it('should remove all whitespace from variable declarations', () => {
            const lexer = new Lexer();
            const result = lexer.invoke('{+ key : value }');
            <DSL>result[0].variable.should.have.property('literal', 'key:value');
        });

        it('should also remove newlines from variable declarations', () => {
            const lexer = new Lexer();
            const result = lexer.invoke('{+ key : \n value }');
            <DSL>result[0].variable.should.have.property('literal', 'key:value');
        });

        it('should correctly set a key and value', () => {
            const lexer = new Lexer();
            const result = lexer.invoke(`{+ dragon:'cat' }`);
            <DSL>result[0].variable.should.have.property('key');
            <DSL>result[0].variable.should.have.property('value');
        });

        it('should correctly set the value of key and value', () => {
            const lexer = new Lexer();
            const result = lexer.invoke(`{+ dragon:'cat' }`);
            <DSL>result[0].variable.should.have.property('key', 'dragon');
            <DSL>result[0].variable.should.have.property('value', "'cat'");
        });

        it('should correctly handle a variable with an opposite quote inside a string value', () => {
            const lexer = new Lexer();
            const result = lexer.invoke(`{+ dragon: "Felix's pet" }`);
            <DSL>result[0].variable.should.have.property('key', 'dragon');
            <DSL>result[0].variable.should.have.property('value', `"Felix's pet"`);
        });
    });

    describe('scope', () => {
        it('should determine the correct level of items nested in actions', () => {
            const lexer = new Lexer();
            const result = lexer.invoke('SELECT * FROM {% if table = \'Test\' } TestTable {% else } ProdTable {% endif }');
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
            const result = lexer.invoke('{12 > 13}');
            <DSL>result[0].replacement.should.have.property('expressions');
        });

        it('should detect an expression in a replacement with a modifier', () => {
            const lexer = new Lexer();
            const result = lexer.invoke('{12 !< 13}');
            <DSL>result[0].replacement.should.have.property('expressions');
        });

        it('should correctly identify a modifier in an expression', () => {
            const lexer = new Lexer();
            const result = lexer.invoke('{12 !> 13}');
            <DSL>result[0].replacement.expressions.branches[0].should.have.property('modifiers');
            <DSL>result[0].replacement.expressions.branches[0].modifiers[0].should.equal(Not)
        });

        it('should correctly identify the values in an expression', () => {
            const lexer = new Lexer();
            const result = lexer.invoke('{12 > 13}');
            <DSL>result[0].replacement.expressions.branches[0].values[0].should.equal('12');
            <DSL>result[0].replacement.expressions.branches[0].values[1].should.equal('13');
        });
    });
});