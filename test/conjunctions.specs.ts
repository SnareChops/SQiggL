import {Conjunction, AndConjunction, OrConjunction} from '../src/conjunctions';

describe('Conjunctions', () => {
    describe('AndConjunction', () => {
        it('should return false if the first expressionResult is false', () => {
            const result = AndConjunction.rule([false, true]);
            result.should.equal(false);
        });

        it('should return false if the second expressionResult is false (and the first is true)', () => {
            const result = AndConjunction.rule([true, false]);
            result.should.equal(false);
        });

        it('should return true if both expressionResults are true', () => {
            const result = AndConjunction.rule([true, true]);
            result.should.equal(true);
        });
    });

    describe('OrConjunction', () => {
        it('should return false if both expressionResults are false', () => {
            const result = OrConjunction.rule([false, false]);
            result.should.equal(false);
        });

        it('should return true if the first expressionResult is true', () => {
            const result = OrConjunction.rule([true, false]);
            result.should.equal(true);
        });

        it('should return true if the first expressionResult is false and the second is true', () => {
            const result = OrConjunction.rule([false, true]);
            result.should.equal(true);
        });
    });
});