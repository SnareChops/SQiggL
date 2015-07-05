/// <reference path="../../typings/tsd.d.ts" />
import IsNotNull from '../../src/conditions/IsNotNull';

describe('IsNotNull', () => {
	describe('regex', () => {
		it('should match a statement containing "is not null"', () => expect(IsNotNull.regex.test('something is not null')).toBe(true));
		it('should not match a statement missing "is not null"', () => expect(IsNotNull.regex.test('something without the correct words')).toBe(false));
		it('should match a statement containing "is not null" anywhere', () => expect(IsNotNull.regex.test('something is not null something')).toBe(true));
		it('should not match a statement containing "is not null" but in the wrong order', () => expect(IsNotNull.regex.test('something not is null')).toBe(false));
		it('should not match a statement containing "is not null" but with words in-between', () => expect(IsNotNull.regex.test('something is blah not blah null')).toBe(false));
		it('should not match a statement containing "is not null" but with extra letters on the words', () => expect(IsNotNull.regex.test('something iss nott nuull')).toBe(false));
		it('should capture a variable in the statement', () => expect('something is not null'.match(IsNotNull.regex)[1]).toEqual('something'));
	});
	
	describe('instance', () => {
		var isNotNull;
		beforeAll(() => {
			isNotNull = new IsNotNull('something', {something: 'green', blah: 'red'}, null, null, null);
		});
		it('should store the variable', () => expect(isNotNull.variable).toEqual('something'));
		it('should store the variables object', () => expect(isNotNull.variables).toEqual({something: 'green', blah: 'red'}));
		it('should provide a correct result', () => expect(isNotNull.perform()).toBe(true));
		it('should also provide a correct result when variable is null', () => {
			var otherIsNotNull = new IsNotNull('something', {nothing: 'green', blah: 'red'}, null, null, null);
			expect(otherIsNotNull.perform()).toBe(false);
		});
	});
});