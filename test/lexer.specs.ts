import {Lexer} from '../src/lexer';
import {DSL, DSLCommand} from "../src/dsl";
import {Not} from '../src/modifiers';
import * as should from 'should';
import {StartingAction} from "../src/actions";
import {ExpressionResult} from "../src/expressions";
import {ScopedVariables} from "../src/parser";
import {Parser} from "../src/parser";
import {TerminatingAction} from "../src/actions";
import {BooleanExpression} from "../src/expressions";
import {VALUE} from "../src/expressions";
import {SPACE} from "../src/expressions";
import {ExpressionValue} from "../src/expressions";
import {BooleanModifier} from "../src/modifiers";
import {Conjunction} from "../src/conjunctions";

describe('Lexer', () => {
    let instance: Lexer;
    beforeEach(() => {
        instance = new Lexer();
    });

    it('should throw an error if a query contains an incomplete statement', () => {
        const lexer = new Lexer();
        (() => lexer.parse('SELECT * FROM {Table')).should.throw('SQiggLError - L1002: Expected statement to complete before end of file.');
    });

    it('should throw an throw an error if a query does not close a statement before declaring another', () => {
        const lexer = new Lexer();
        (() => lexer.parse('SELECT * FROM {Table WHERE id = {12}')).should.throw('SQiggLError - L1001: Unexpected \'{\' found in statement. Expected \'}\'.');
    });

    it('should throw an error if a query is incorrectly nested', () => {
        const lexer = new Lexer();
        const query = 'SELECT * FROM {% if 12 > 13} Test {% endif } {% endif }';
        (() => lexer.parse(query)).should.throw('SQiggLError - L1003: Your SQiggL is incorrectly nested.');
    });

    it('should throw an error if a query is incompletely nested', () => {
        const lexer = new Lexer();
        const query = 'SELECT * FROM {% if 12 > 13 } Test';
        (() => lexer.parse(query)).should.throw('SQiggLError - L1004: Your SQiggL query is nested but does not return to the top level before completing. Please check your nesting.');
    });

    it('should throw an error if an invalid string is found in a part', () => {
        const query = 'SELECT * FROM {\'Table}';
        (() => instance.parse(query)).should.throw('SQiggLError - L1006: Invalid string found in \'Table');
    });

    it('should correctly handle a custom action', () => {
        const replaceAction: StartingAction = {
            key: 'replace',
            rule: (expressionResult: ExpressionResult, variables: ScopedVariables, scope: DSL[], parser: Parser) => {
                return parser.parse([{text: <string>expressionResult.value}]);
            }
        };
        const endAction: TerminatingAction = {key: 'endreplace', dependents: [replaceAction]};
        const lexer = new Lexer({customActions: [replaceAction, endAction]});
        const query = '{% replace \'Hello World\'} SELECT * FROM Table {%endreplace}';
        const result = lexer.parse(query);
        result[0].command.action.should.equal(replaceAction);
        result[1].command.action.should.equal(endAction);
    });

    it('should correctly handle a custom expression', () => {
        const testExpression: BooleanExpression = {
            template: [VALUE, SPACE, 'blah', SPACE, VALUE],
            rule: (values: ExpressionValue[]) => (+values[0]) > (+values[1])
        };
        const lexer = new Lexer({customExpressions: [testExpression]});
        const query = '{12 blah 13}';
        const result = lexer.parse(query);
        result[0].replacement.expressions.branches[0].expression.should.equal(testExpression);
    });

    it('should correctly handle a custom modifier', () => {
        const testModifier: BooleanModifier = {
            identifiers: ['!'],
            rule: (prevResult: boolean, values: string[]) => !prevResult
        };
        const testExpression: BooleanExpression = {
            template: [VALUE, SPACE, [{0: testModifier}], 'blah', SPACE, VALUE],
            rule: (values: ExpressionValue[]) => (+values[0]) > (+values[1])
        };
        const lexer = new Lexer({customExpressions: [testExpression], customModifiers: [testModifier]});
        const query = '{12 !blah 13}';
        const result = lexer.parse(query);
        result[0].replacement.expressions.branches[0].modifiers[0].should.equal(testModifier);
    });

    it('should correctly handle a custom conjunction', () => {
        const testConjunction: Conjunction = {
            keys: ['blah'],
            rule: (expressionResults: boolean[]) => expressionResults[0] && expressionResults[1]
        };
        const lexer = new Lexer({customConjunctions: [testConjunction]});
        const query = '{12 > 13 blah 13 < 12}';
        const result = lexer.parse(query);
        result[0].replacement.expressions.conjunctions[0].should.equal(testConjunction);
    });

    it('should correctly handle escaped single quotes in strings', () => {
        const lexer = new Lexer();
        const query = `SELECT * FROM {'Dragon\\'s run'}`;
        const result = lexer.parse(query);
        result[1].replacement.literal.should.equal("'Dragon's run'");
    });

    it('should correctly handle escaped double quotes in strings', () => {
        const lexer = new Lexer();
        const query = `SELECT * FROM {"Dragon\\"s run"}`;
        const result = lexer.parse(query);
        result[1].replacement.literal.should.equal('"Dragon"s run"');
    });

    it('should correctly handle an escaped escape character in strings', () => {
        const lexer = new Lexer();
        const query = `SELECT * FROM {'Me\\\\You'}`;
        const result = lexer.parse(query);
        result[1].replacement.literal.should.equal("'Me\\You'");
    });

    it('should throw an error if an illegal escape character exists in a string', () => {
        const lexer = new Lexer();
        const query = `SELECT * FROM {'\\Something'}`;
        (() => lexer.parse(query)).should.throw('SQiggLError - L1005: Illegal escape character found in string \'\\Something\' at index 1');
    });

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
            const result = lexer.parse('{% if command } {% endif}');
            result[0].should.have.property('command');
        });

        it('should return a literal for a command in a given string', () => {
            const lexer = new Lexer();
            const result = lexer.parse('{%if command} {%endif}');
            <DSL>result[0].command.should.have.property('literal', 'if command');
        });

        it('should trim whitespace on commands', () => {
            const lexer = new Lexer();
            const result = lexer.parse('{% if command } {%endif}');
            <DSL>result[0].command.should.have.property('literal', 'if command');
        });

        it('should remove newlines from commands', () => {
            const lexer = new Lexer();
            const result = lexer.parse('{% if\ncommand} {%endif}');
            <DSL>result[0].command.should.have.property('literal', 'if command');
        });

        it('should reduce multiple whitespace characters to a single space', () => {
            const lexer = new Lexer();
            const result = lexer.parse('{% if      command} {%endif}');
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
            const result = lexer.parse('SELECT * FROM {% if } {%endif}');
            const dsl: DSL = result[1];
            const command: DSLCommand = dsl.command;
            command.action.should.have.property('key', 'if');
        });

        it('should correct identify the action of a command despite casing', () => {
            const lexer = new Lexer();
            const result = lexer.parse('SELECT * FROM {% iF } {%endif}');
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
            const result = lexer.parse('{+ key : \n value }');
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
            <DSL>result[0].replacement.should.have.property('expressions');
        });

        it('should detect an expression in a replacement with a modifier', () => {
            const lexer = new Lexer();
            const result = lexer.parse('{12 !< 13}');
            <DSL>result[0].replacement.should.have.property('expressions');
        });

        it('should correctly identify a modifier in an expression', () => {
            const lexer = new Lexer();
            const result = lexer.parse('{12 !> 13}');
            <DSL>result[0].replacement.expressions.branches[0].should.have.property('modifiers');
            <DSL>result[0].replacement.expressions.branches[0].modifiers[0].should.equal(Not)
        });

        it('should correctly identify the values in an expression', () => {
            const lexer = new Lexer();
            const result = lexer.parse('{12 > 13}');
            <DSL>result[0].replacement.expressions.branches[0].values[0].should.equal('12');
            <DSL>result[0].replacement.expressions.branches[0].values[1].should.equal('13');
        });
    });
});