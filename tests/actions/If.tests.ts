/// <reference path="../../typings/tsd.d.ts" />
import If from '../../src/actions/If';

describe("If", () => {
	it('should have a query that matches if', () => expect(If.regex.test('if something is not null')).toBe(true));
	it('should only match if "if" is first word', () => expect(If.regex.test('nothing if something is not null')).toBe(false));
	it('should not match more than one "if" in the statement', () => expect('if something if something'.match(If.regex).length).toEqual(1));
	it('should not match if "if" is not present', () => expect(If.regex.test('there is no conditional')).toBe(false));
	it('should not match a word only starting with "if"', () => expect(If.regex.test('ifle something is not null')).toBe(false));
	it('should not match a word containing "if"', () => expect(If.regex.test('someifthing is not null')).toBe(false));
});