var modifiers_1 = require('./modifiers');
describe('Modifiers', function () {
    describe('Not', function () {
        it('should negate a true value', function () {
            modifiers_1.Not.rule(true).should.equal(false);
        });
        it('should negate a false value', function () {
            modifiers_1.Not.rule(false).should.equal(true);
        });
    });
    describe('OrEqual', function () {
        it('should return true if the prevResult is true', function () {
            modifiers_1.OrEqual.rule(true, ['12', '13']).should.equal(true);
        });
        it('should return true if the prevResult is false and the values are equal', function () {
            modifiers_1.OrEqual.rule(false, ['12', '12']).should.equal(true);
        });
        it('should return false if the prevResult is false and the values are not equal', function () {
            modifiers_1.OrEqual.rule(false, ['12', '13']).should.equal(false);
        });
    });
    describe('LengthOrEqual', function () {
        it('should return true if the prevResult is true', function () {
            modifiers_1.LengthOrEqual.rule(true, ['Cat', '6']).should.equal(true);
        });
        it('should return true if the prevResult is false and the values are of equal length', function () {
            modifiers_1.LengthOrEqual.rule(false, ['Cat', '3']).should.equal(true);
        });
        it('should return false if the prevResult is false and the values are not of equal length', function () {
            modifiers_1.LengthOrEqual.rule(false, ['Cat', '6']).should.equal(false);
        });
    });
    describe('BetweenOrEqual', function () {
        it('should return true if the prevResult is true', function () {
            modifiers_1.BetweenOrEqual.rule(true, ['10', '12', '15']).should.equal(true);
        });
        it('should return true if the prevResult is false and the first value is equal to the second value', function () {
            modifiers_1.BetweenOrEqual.rule(false, ['10', '10', '15']).should.equal(true);
        });
        it('should return true if the prevResult is false and the first values is equal to the third value', function () {
            modifiers_1.BetweenOrEqual.rule(false, ['10', '5', '10']).should.equal(true);
        });
        it('should return false if the prevResult is false the the first value is not equal to either of the other values', function () {
            modifiers_1.BetweenOrEqual.rule(false, ['10', '12', '15']).should.equal(false);
        });
    });
});
