/// <reference path="../../typings/tsd.d.ts" />
import GreaterThan from '../../src/conditions/GreaterThan';
import {Not, OrEqual} from '../../src/Modifiers';

describe('GreaterThan', () => {
    describe('regex', () => {
        it('should match a statement containing ">"', () => expect(GreaterThan.regex.test('something > 12')).toBe(true));
        it('should not match a statement missing ">"', () => expect(GreaterThan.regex.test('something missing greater than symbol')).toBe(false));
		it('should match a statement containing ">" anywhere', () => expect(GreaterThan.regex.test('something is > 12 something')).toBe(true));
		it('should not match a statement containing ">" but in the wrong order', () => expect(GreaterThan.regex.test('something 12 >')).toBe(false));
        it('should not match a statement missing a variable', () => expect(GreaterThan.regex.test('> 12')).toBe(false));
        it('should not match a statement missing a comparative', () => expect(GreaterThan.regex.test('something >')).toBe(false));
		it('should not match a statement containing ">" but with an extra ">"', () => expect(GreaterThan.regex.test('something >> 12')).toBe(false));
		it('should capture a variable in the statement', () => expect('something > 12'.match(GreaterThan.regex)[1]).toEqual('something'));
        it('should capture a comparator in the statement', () => expect('something > 12'.match(GreaterThan.regex)[4]).toEqual('12'));
	});
	
	describe('instance', () => {
		var gt;
		beforeAll(() => {
			gt = new GreaterThan('something', {something: '14', blah: 'red'}, '12', '!', '=');
		});
		it('should store the variable', () => expect(gt.variable).toEqual('something'));
		it('should store the variables object', () => expect(gt.variables).toEqual({something: '14', blah: 'red'}));
        it('should store the comparative', () => expect(gt.comparative).toEqual('12'));
        it('should store the first modifier', () => expect(gt.modifiers[0]).toEqual(Not));
        it('should store the second modifier', () => expect(gt.modifiers[1]).toEqual(OrEqual));
		it('should provide a correct result', () => expect(gt.perform()).toBe(true));
		it('should also provide a correct result when variable is not greater then', () => {
			var othergt = new GreaterThan('something', {something: '9', blah: 'red'}, '12', null, null);
			expect(othergt.perform()).toBe(false);
		});
	});
});