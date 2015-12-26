import {Equal, GreaterThan, LessThan, IsNull, LexicalGreaterThan, LexicalLessThan, LengthGreaterThan, LengthLessThan, IsNaN, Between} from './expressions';

describe('Expressions', () => {
    describe('Equal', () => {
        it('should return true if expression is true', () => {
            const result = Equal.rule(['13', '13']);
            result.should.equal(true);
        });

        it('should return false if expression if false', () => {
            const result = Equal.rule(['12', '13']);
            result.should.equal(false);
        });
    });

    describe('GreaterThan', () => {
        it('should return true if expression is true', () => {
            const result = GreaterThan.rule(['13', '12']);
            result.should.equal(true);
        });

        it('should return false if expression is false', () => {
            const result = GreaterThan.rule(['12', '13']);
            result.should.equal(false);
        });
    });

    describe('LessThan', () => {
        it('should return true if expression is true', () => {
            const result = LessThan.rule(['12', '13']);
            result.should.equal(true);
        });

        it('should return false if expression is false', () => {
            const result = LessThan.rule(['13', '12']);
            result.should.equal(false);
        });
    });

    describe('IsNull', () => {
        it('should return true if expression is true', () => {
            const result = IsNull.rule([]);
            result.should.equal(true);
        });

        it('should return false if expression is false', () => {
            const result = IsNull.rule(['Hello']);
            result.should.equal(false);
        });
    });

    describe('LexicalGreaterThan', () => {
        it('should return true if expression is true', () => {
            const result = LexicalGreaterThan.rule(['World', 'Hello']);
            result.should.equal(true);
        });

        it('should return false if expression is false', () => {
            const result = LexicalGreaterThan.rule(['Hello', 'World']);
            result.should.equal(false);
        });
    });
});
