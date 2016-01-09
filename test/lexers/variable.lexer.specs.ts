import {DEFAULT_LEXER_OPTIONS} from "../../src/lexer";
import {VariableLexer} from "../../src/lexers/variable.lexer";
import {DSLVariable} from '../../src/dsl';

describe('VariableLexer', () => {
    let lexer: VariableLexer;
    beforeEach(() => {
        lexer = new VariableLexer(DEFAULT_LEXER_OPTIONS);
    });

    it('should throw an error if a variable key is wrapped in double quotes', () => {
        const input = '"key":"value"';
        (() => lexer.invoke(input)).should.throw('SQiggLError - LV2000: Variable keys should not be wrapped in quotes.');
    });

    it('should throw an error if a variable key is wrapped in single quotes', () => {
        const input = "'key':'value'";
        (() => lexer.invoke(input)).should.throw('SQiggLError - LV2000: Variable keys should not be wrapped in quotes.');
    });

    it('should correctly handle a variable value that has an escaped single quote in the string', () => {
        const input = `key:'Dragon\\'s breath'`;
        const result = lexer.invoke(input);
        result.value.should.equal(`'Dragon's breath'`);
    });

    it('should correctly handle a variable value that has an escaped double quote in the string', () => {
        const input = `key:"Dragon\\"s breath"`;
        const result = lexer.invoke(input);
        result.value.should.equal(`"Dragon"s breath"`);
    });

    it('should correctly handle a variable value of an array of strings', () => {
        const input = `key:['one', 'two', 'three']`;
        const result = lexer.invoke(input);
        result.value[0].should.equal("'one'");
        result.value[1].should.equal("'two'");
        result.value[2].should.equal("'three'");
    });
});