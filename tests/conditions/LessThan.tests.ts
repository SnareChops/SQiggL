/// <reference path="../../typings/tsd.d.ts" />
import LessThan from '../../src/conditions/LessThan';
import {Not, OrEqual} from '../../src/Modifiers';

describe('LessThan', () => {
    describe('regex', () => {
        it('should match a statement containing "<"', () => expect(LessThan.regex.test('something < 12')).toBe(true));
        it('should not match a statement missing "<"', () => expect(LessThan.regex.test('something missing greater than symbol')).toBe(false));
		it('should match a statement containing "<" anywhere', () => expect(LessThan.regex.test('something is < 12 something')).toBe(true));
		it('should not match a statement containing "<" but in the wrong order', () => expect(LessThan.regex.test('something 12 <')).toBe(false));
        it('should not match a statement missing a variable', () => expect(LessThan.regex.test('< 12')).toBe(false));
        it('should not match a statement missing a comparative', () => expect(LessThan.regex.test('something <')).toBe(false));
		it('should not match a statement containing "<" but with an extra "<"', () => expect(LessThan.regex.test('something << 12')).toBe(false));
		it('should capture a variable in the statement', () => expect('something < 12'.match(LessThan.regex)[1]).toEqual('something'));
        it('should capture a comparator in the statement', () => expect('something < 12'.match(LessThan.regex)[4]).toEqual('12'));
	});
	
	describe('instance', () => {
		var lt;
		beforeAll(() => {
			lt = new LessThan('something', {something: '9', blah: 'red'}, '12', '!', '=');
		});
		it('should store the variable', () => expect(lt.variable).toEqual('something'));
		it('should store the variables object', () => expect(lt.variables).toEqual({something: '9', blah: 'red'}));
        it('should store the comparative', () => expect(lt.comparative).toEqual('12'));
        it('should store the first modifier', () => expect(lt.modifiers[0]).toEqual(Not));
        it('should store the second modifier', () => expect(lt.modifiers[1]).toEqual(OrEqual));
		it('should provide a correct result', () => expect(lt.perform()).toBe(true));
		it('should also provide a correct result when variable is not greater then', () => {
			var otherlt = new LessThan('something', {something: '14', blah: 'red'}, '12', null, null);
			expect(otherlt.perform()).toBe(false);
		});
	});
});