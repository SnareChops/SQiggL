var expressions_1 = require('./expressions');
describe('Expressions', function () {
    describe('Equal', function () {
        it('should return true if expression is true', function () {
            var result = expressions_1.Equal.rule(['13', '13']);
            result.should.equal(true);
        });
        it('should return false if expression if false', function () {
            var result = expressions_1.Equal.rule(['12', '13']);
            result.should.equal(false);
        });
    });
    describe('GreaterThan', function () {
        it('should return true if expression is true', function () {
            var result = expressions_1.GreaterThan.rule(['13', '12']);
            result.should.equal(true);
        });
        it('should return false if expression is false', function () {
            var result = expressions_1.GreaterThan.rule(['12', '13']);
            result.should.equal(false);
        });
    });
    describe('LessThan', function () {
        it('should return true if expression is true', function () {
            var result = expressions_1.LessThan.rule(['12', '13']);
            result.should.equal(true);
        });
        it('should return false if expression is false', function () {
            var result = expressions_1.LessThan.rule(['13', '12']);
            result.should.equal(false);
        });
    });
    describe('IsNull', function () {
        it('should return true if expression is true', function () {
            var result = expressions_1.IsNull.rule([]);
            result.should.equal(true);
        });
        it('should return false if expression is false', function () {
            var result = expressions_1.IsNull.rule(['Hello']);
            result.should.equal(false);
        });
    });
    describe('LexicalGreaterThan', function () {
        it('should return true if expression is true', function () {
            var result = expressions_1.LexicalGreaterThan.rule(['World', 'Hello']);
            result.should.equal(true);
        });
        it('should return false if expression is false', function () {
            var result = expressions_1.LexicalGreaterThan.rule(['Hello', 'World']);
            result.should.equal(false);
        });
    });
    describe('LexicalLessThan', function () {
        it('should return true if expression is true', function () {
            var result = expressions_1.LexicalLessThan.rule(['Hello', 'World']);
            result.should.equal(true);
        });
        it('should return false if expression is false', function () {
            var result = expressions_1.LexicalLessThan.rule(['World', 'Hello']);
            result.should.equal(false);
        });
    });
    describe('LengthGreaterThan', function () {
        it('should return true if expression is true', function () {
            var result = expressions_1.LengthGreaterThan.rule(['Dragon', 3]);
            result.should.equal(true);
        });
        it('should return false if expression is false', function () {
            var result = expressions_1.LengthGreaterThan.rule(['Cat', 6]);
            result.should.equal(false);
        });
    });
    describe('LengthLessThan', function () {
        it('should return true if expression is true', function () {
            var result = expressions_1.LengthLessThan.rule(['Cat', 6]);
            result.should.equal(true);
        });
        it('should return false if expression is false', function () {
            var result = expressions_1.LengthLessThan.rule(['Dragon', 3]);
            result.should.equal(false);
        });
    });
    describe('IsNaN', function () {
        it('should return true if expression is true', function () {
            var result = expressions_1.IsNaN.rule(['Hello']);
            result.should.equal(true);
        });
        it('should return false if expression is false', function () {
            var result = expressions_1.IsNaN.rule(['12']);
            result.should.equal(false);
        });
    });
    describe('Between', function () {
        it('should return true if expression is true', function () {
            var result = expressions_1.Between.rule(['12', '10', '15']);
            result.should.equal(true);
        });
        it('should return false if expression is false', function () {
            var result = expressions_1.Between.rule(['10', '12', '15']);
            result.should.equal(false);
        });
    });
    describe('Coalesce', function () {
        it('should return the first value if it is not null', function () {
            var result = expressions_1.Coalesce.rule(['Hello', 'World']);
            result.should.equal('Hello');
        });
        it('should return the second value if the first is null', function () {
            var result = expressions_1.Coalesce.rule([null, 'World']);
            result.should.equal('World');
        });
    });
    describe('IterableOf', function () {
        it('should return an iterable result', function () {
            var result = expressions_1.IterableOfUsing.rule([['hairy', 'furry', 'fuzzy']]);
            result[0].should.equal('hairy');
            result[1].should.equal('furry');
            result[2].should.equal('fuzzy');
        });
    });
});
