/// <reference path="../../typings/tsd.d.ts" />
import If from '../../src/actions/If';
import IsNotNull from '../../src/conditions/IsNotNull';

describe("If", () => {
	describe('regex', () => {
		it('should have a query that matches if', () => expect(If.regex.test('if something is not null')).toBe(true));
		it('should only match if "if" is first word', () => expect(If.regex.test('nothing if something is not null')).toBe(false));
		it('should not match more than one "if" in the statement', () => expect('if something if something'.match(If.regex).length).toEqual(1));
		it('should not match if "if" is not present', () => expect(If.regex.test('there is no conditional')).toBe(false));
		it('should not match a word only starting with "if"', () => expect(If.regex.test('ifle something is not null')).toBe(false));
		it('should not match a word containing "if"', () => expect(If.regex.test('someifthing is not null')).toBe(false));
	});
	
	describe('instance', () => {
		var ifIsNotNull = new If('if something is not null', "SET FirstName = 'Dragon'", {something: 'green'});
		it('should store the statement', () => expect(ifIsNotNull.statement).toEqual('if something is not null'));
		it('should store the inner', () => expect(ifIsNotNull.inner).toEqual("SET FirstName = 'Dragon'"));
		it('should store the variables', () => expect(ifIsNotNull.variables).toEqual({something: 'green'}));
		it('should correctly select the IsNotNull condition', () => expect(ifIsNotNull.parseCondition(ifIsNotNull.statement, ifIsNotNull.variables) instanceof IsNotNull).toBe(true));
	});
});