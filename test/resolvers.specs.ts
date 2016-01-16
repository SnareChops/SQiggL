import {resolveValue} from '../src/resolvers';
import {DEFAULT_PARSER_OPTIONS} from '../src/parser';
import {ScopedVariables} from '../src/variables';
describe('Resolvers', () => {
    it('should correctly output a string literal using single quotes', () => {
        const result = resolveValue('\'Hello\'', void 0, DEFAULT_PARSER_OPTIONS);
        result.should.equal('Hello');
    });

    it('should correctly output a string literal using double quotes', () => {
        const result = resolveValue('"Hello"', void 0, DEFAULT_PARSER_OPTIONS);
        result.should.equal('Hello');
    });

    it('should correctly output a number literal', () => {
        const result = resolveValue('12', void 0, DEFAULT_PARSER_OPTIONS);
        result.should.equal('12');
    });

    it('should correctly output a found variable value', () => {
        const result = resolveValue('cat', new ScopedVariables({cat: 'Dragon'}), DEFAULT_PARSER_OPTIONS);
        result.should.equal('Dragon');
    });

    it('should throw an error if a variable value is undefined', () => {
        (() => resolveValue('cat', new ScopedVariables({dragon: 'Fish'}), DEFAULT_PARSER_OPTIONS)).should.throw('SQiggLError - P1000: cat is not a defined variable in this scope');
    });
});