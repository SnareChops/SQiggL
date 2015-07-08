/// <reference path="../../typings/tsd.d.ts" />
import LessThan from '../../src/conditions/LessThan';
import {Not, OrEqual} from '../../src/Modifiers';

describe('LessThan', () => {
    describe('regex', () => {
        it('should match a statement containing "<"', () => expect(LessThan.regex.test('something < 12')).toBe(true));
        it('should match a statement containing "<" and a spot 1 modifier', () => expect(LessThan.regex.test('something !< 12')).toBe(true));
        it('should match a statement containing "<" and a spot 2 modifier', () => expect(LessThan.regex.test('something <= 12')).toBe(true));
        it('should match a statement containing "<" and 2 modifiers', () => expect(LessThan.regex.test('something !<= 12')).toBe(true));
        it('should not match a statement missing "<"', () => expect(LessThan.regex.test('something missing less than symbol')).toBe(false));
		it('should match a statement containing "<" anywhere', () => expect(LessThan.regex.test('something is < 12 something')).toBe(true));
		it('should not match a statement containing "<" but in the wrong order', () => expect(LessThan.regex.test('something 12 <')).toBe(false));
        it('should not match a statement missing a variable', () => expect(LessThan.regex.test('< 12')).toBe(false));
        it('should not match a statement missing a comparative', () => expect(LessThan.regex.test('something <')).toBe(false));
		it('should not match a statement containing "<" but with an extra "<"', () => expect(LessThan.regex.test('something << 12')).toBe(false));
		it('should capture a variable in the statement', () => expect('something < 12'.match(LessThan.regex)[1]).toEqual('something'));
        it('should capture the first modifier in the statement', () => expect('something !<= 12'.match(LessThan.regex)[2]).toEqual('!'));
        it('should capture the second modifier in the statement', () => expect('something !<= 12'.match(LessThan.regex)[3]).toEqual('='));
        it('should capture a comparator in the statement', () => expect('something < 12'.match(LessThan.regex)[4]).toEqual('12'));
	});
	
	describe('instance', () => {
		var ltBare, ltNegated, ltEqualed, ltDouble, ltFalse, lteFalse;
		beforeAll(() => {
			ltBare = new LessThan('something', {something: '9', blah: 'red'}, '12', null, null);
            ltNegated = new LessThan('something', {something: '9', blah: 'red'}, '12', '!', null);
            ltEqualed = new LessThan('something', {something: '9', blah: 'red'}, '9', null, '=');
            ltDouble = new LessThan('something', {something: '9', blah: 'red'}, '9', '!', '=');
            ltFalse = new LessThan('something', {something: '9', blah: 'red'}, '9', null, null);
            lteFalse = new LessThan('something', {something: '9', blah: 'red'}, '6', null, '=');
		});
		it('should store the variable', () => expect(ltDouble.variable).toEqual('something'));
		it('should store the variables object', () => expect(ltDouble.variables).toEqual({something: '9', blah: 'red'}));
        it('should store the comparative', () => expect(ltDouble.comparative).toEqual('9'));
        it('should store the first modifier', () => expect(ltDouble.modifiers[0]).toEqual(Not));
        it('should store the second modifier', () => expect(ltDouble.modifiers[1]).toEqual(OrEqual));
		it('should provide a correct result', () => expect(ltBare.perform()).toBe(true));
        it('should provide a correct negated result', () => expect(ltNegated.perform()).toBe(false));
        it('should provide a correct or-equal result', () => expect(ltEqualed.perform()).toBe(true));
        it('should provide a correct double modified result', () => expect(ltDouble.perform()).toBe(false));
		it('should also provide a correct result when variable is not less than', () => expect(ltFalse.perform()).toBe(false));
        it('should also provide a correct result when variable is not less than or equal', () => expect(lteFalse.perform()).toBe(false));
	});
});