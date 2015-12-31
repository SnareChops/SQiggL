import {Not, OrEqual, LengthOrEqual, BetweenOrEqual} from './../src/modifiers';

describe('Modifiers', () => {
    describe('Not', () => {
        it('should negate a true value', () => {
            Not.rule(true).should.equal(false);
        });

        it('should negate a false value', () => {
            Not.rule(false).should.equal(true);
        });
    });

    describe('OrEqual', () => {
        it('should return true if the prevResult is true', () => {
            OrEqual.rule(true, ['12', '13']).should.equal(true);
        });

        it('should return true if the prevResult is false and the values are equal', () => {
            OrEqual.rule(false, ['12', '12']).should.equal(true);
        });

        it('should return false if the prevResult is false and the values are not equal', () => {
            OrEqual.rule(false, ['12', '13']).should.equal(false);
        });
    });

    describe('LengthOrEqual', () => {
        it('should return true if the prevResult is true', () => {
            LengthOrEqual.rule(true, ['Cat', '6']).should.equal(true);
        });

        it('should return true if the prevResult is false and the values are of equal length', () => {
            LengthOrEqual.rule(false, ['Cat', '3']).should.equal(true);
        });

        it('should return false if the prevResult is false and the values are not of equal length', () => {
            LengthOrEqual.rule(false, ['Cat', '6']).should.equal(false);
        });
    });

    describe('BetweenOrEqual', () => {
        it('should return true if the prevResult is true', () => {
            BetweenOrEqual.rule(true, ['10', '12', '15']).should.equal(true);
        });

        it('should return true if the prevResult is false and the first value is equal to the second value', () => {
            BetweenOrEqual.rule(false, ['10', '10', '15']).should.equal(true);
        });

        it('should return true if the prevResult is false and the first values is equal to the third value', () => {
            BetweenOrEqual.rule(false, ['10', '5', '10']).should.equal(true);
        });

        it('should return false if the prevResult is false the the first value is not equal to either of the other values', () => {
            BetweenOrEqual.rule(false, ['10', '12', '15']).should.equal(false);
        });
    })
});