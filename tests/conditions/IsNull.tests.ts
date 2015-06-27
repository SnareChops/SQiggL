/// <reference path="../../typings/tsd.d.ts" />
import IsNull from '../../src/conditions/IsNull';

describe('IsNull', () => {
    describe('regex', () => {
        it('should match a statement containing "is null"', () => expect(IsNull.regex.test('something is null')).toBe(true));
        it('should not match a statement missing "is null"', () => expect(IsNull.regex.test('something without the correct words')).toBe(false));
		it('should match a statement containing "is null" anywhere', () => expect(IsNull.regex.test('something is null something')).toBe(true));
		it('should not match a statement containing "is null" but in the wrong order', () => expect(IsNull.regex.test('something null is')).toBe(false));
		it('should not match a statement containing "is null" but with words in-between', () => expect(IsNull.regex.test('something is blah null')).toBe(false));
		it('should not match a statement containing "is null" but with extra letters on the words', () => expect(IsNull.regex.test('something iss nuull')).toBe(false));
		it('should capture a variable in the statement', () => expect('something is null'.match(IsNull.regex)[1]).toEqual('something'));
	});
	
	describe('instance', () => {
		var isNull;
		beforeAll(() => {
			isNull = new IsNull('something', {nothing: 'green', blah: 'red'}, null);
		});
		it('should store the variable', () => expect(isNull.variable).toEqual('something'));
		it('should store the variables object', () => expect(isNull.variables).toEqual({nothing: 'green', blah: 'red'}));
		it('should provide a correct result', () => expect(isNull.perform()).toBe(true));
		it('should also provide a correct result when variable is not null', () => {
			var otherIsNull = new IsNull('something', {something: 'green', blah: 'red'}, null);
			expect(otherIsNull.perform()).toBe(false);
		});
	});
});