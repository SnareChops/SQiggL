/// <reference path="../../typings/tsd.d.ts" />
import IsNotNull from '../../src/conditions/IsNotNull';

describe('IsNotNull', () => {
	it('should match a statement containing "is not null"', () => expect(IsNotNull.regex.test('is not null')).toBe(true));
	it('should not match a statement missing "is not null"', () => expect(IsNotNull.regex.test('something without the correct words')).toBe(false));
	it('should match a statement containing "is not null" anywhere', () => expect(IsNotNull.regex.test('something is not null something')).toBe(true));
	it('should not match a statement containing "is not null" but in the wrong order', () => expect(IsNotNull.regex.test('something not is null')).toBe(false));
	it('should not match a statement containing "is not null" but with words in-between', () => expect(IsNotNull.regex.test('something is blah not blah null')).toBe(false));
	it('should not match a statement containing "is not null" but with extra letters on the words', () => expect(IsNotNull.regex.test('something iss nott nuull')).toBe(false));
});