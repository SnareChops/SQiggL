/// <reference path="../../typings/tsd.d.ts" />
import LessThanOrEqual from '../../src/conditions/LessThanOrEqual';

describe('LessThanOrEqual', () => {
    describe('regex', () => {
        it('should match a statement containing "<="', () => expect(LessThanOrEqual.regex.test('something <= 12')).toBe(true));
        it('should not match a statement missing "<="', () => expect(LessThanOrEqual.regex.test('something missing greater than symbol')).toBe(false));
		it('should match a statement containing "<=" anywhere', () => expect(LessThanOrEqual.regex.test('something is <= 12 something')).toBe(true));
		it('should not match a statement containing "<=" but in the wrong order', () => expect(LessThanOrEqual.regex.test('something 12 <=')).toBe(false));
        it('should not match a statement missing a variable', () => expect(LessThanOrEqual.regex.test('<= 12')).toBe(false));
        it('should not match a statement missing a comparative', () => expect(LessThanOrEqual.regex.test('something <=')).toBe(false));
		it('should capture a variable in the statement', () => expect('something <= 12'.match(LessThanOrEqual.regex)[1]).toEqual('something'));
        it('should capture a comparator in the statement', () => expect('something <= 12'.match(LessThanOrEqual.regex)[2]).toEqual('12'));
	});
	
	describe('instance', () => {
		let lte;
		beforeAll(() => {
			lte = new LessThanOrEqual('something', {something: '9', blah: 'red'}, '12');
		});
		it('should store the variable', () => expect(lte.variable).toEqual('something'));
		it('should store the variables object', () => expect(lte.variables).toEqual({something: '9', blah: 'red'}));
        it('should store the comparative', () => expect(lte.comparative).toEqual('12'));
		it('should provide a correct result', () => expect(lte.perform()).toBe(true));
        it('should also provide a correct result when variable is equal to the comparative', () => {
			var otherlte = new LessThanOrEqual('something', {something: '12', blah: 'red'}, '12');
			expect(otherlte.perform()).toBe(true);
		});
		it('should also provide a correct result when variable is not greater than the comparative', () => {
			var otherlte = new LessThanOrEqual('something', {something: '14', blah: 'red'}, '12');
			expect(otherlte.perform()).toBe(false);
		});
	});
});