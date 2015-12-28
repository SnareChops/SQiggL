import {Equal, GreaterThan, LessThan, IsNull, LexicalGreaterThan, LexicalLessThan, LengthGreaterThan, LengthLessThan, IsNaN, Between, IterableOf} from './expressions';

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

    describe('LexicalLessThan', () => {
        it('should return true if expression is true', () => {
            const result = LexicalLessThan.rule(['Hello', 'World']);
            result.should.equal(true);
         });

        it('should return false if expression is false', () => {
            const result = LexicalLessThan.rule(['World', 'Hello']);
            result.should.equal(false);
        });
    });

    describe('LengthGreaterThan', () => {
        it('should return true if expression is true', () => {
            const result = LengthGreaterThan.rule(['Dragon', 3]);
            result.should.equal(true);
        });

        it('should return false if expression is false', () => {
            const result = LengthGreaterThan.rule(['Cat', 6]);
            result.should.equal(false);
        });
    });

    describe('LengthLessThan', () => {
        it('should return true if expression is true', () => {
            const result = LengthLessThan.rule(['Cat', 6]);
            result.should.equal(true);
        });

        it('should return false if expression is false', () => {
            const result = LengthLessThan.rule(['Dragon', 3]);
            result.should.equal(false);
        });
    });

    describe('IsNaN', () => {
        it('should return true if expression is true', () => {
            const result = IsNaN.rule(['Hello']);
            result.should.equal(true);
        });

        it('should return false if expression is false', () => {
            const result = IsNaN.rule(['12']);
            result.should.equal(false);
        });
    });

    describe('Between', () => {
        it('should return true if expression is true', () => {
            const result = Between.rule(['12', '10', '15']);
            result.should.equal(true);
        });

        it('should return false if expression is false', () => {
            const result = Between.rule(['10', '12', '15']);
            result.should.equal(false);
        });
    });

    describe('IterableOf', () => {
        it('should return an iterable result', () => {
            const result = IterableOf.rule([['hairy', 'furry', 'fuzzy']]);
            result[0].should.equal('hairy');
            result[1].should.equal('furry');
            result[2].should.equal('fuzzy');
        });
    });
});
