// /// <reference path="../../typings/tsd.d.ts" />
// import If from '../../src/actions/If';
// import {IsNull} from '../../src/Conditions';
// import Command from '../../src/Command';
// import IVariables from '../../src/IVariables';

// describe("If", () => {
// 	describe('regex', () => {
// 		it('should have a query that matches if', () => expect(If.regex.test('if something is not null')).toBe(true));
// 		it('should only match if "if" is first word', () => expect(If.regex.test('nothing if something is not null')).toBe(false));
// 		it('should not match more than one "if" in the statement', () => expect('if something if something'.match(If.regex).length).toEqual(1));
// 		it('should not match if "if" is not present', () => expect(If.regex.test('there is no conditional')).toBe(false));
// 		it('should not match a word only starting with "if"', () => expect(If.regex.test('ifle something is not null')).toBe(false));
// 		it('should not match a word containing "if"', () => expect(If.regex.test('someifthing is not null')).toBe(false));
// 	});
	
// 	describe('instance', () => {
// 		const index: number = 5, 
// 			statement = ' if something is null ',
// 			inner = ' SET FirstName = {{something}} ',
// 			length: number = `{{%${statement}%}}${inner}`.length,
// 			variables: IVariables = {something: 'green'};
// 		let	command: Command,
// 			ifIsNotNull: If;
// 		beforeAll(() => {
// 			command = new Command(index, length, statement, inner, variables);
// 			ifIsNotNull = new If(command, statement, inner, variables);
// 		});
// 		it('should store the statement', () => expect(ifIsNotNull.statement).toEqual(statement));
// 		it('should store the inner', () => expect(ifIsNotNull.inner).toEqual(inner));
// 		it('should store the variables', () => expect(ifIsNotNull.variables).toEqual(variables));
// 		it('should correctly select the IsNull condition', () => expect(ifIsNotNull.extractCondition(ifIsNotNull.statement, ifIsNotNull.variables) instanceof IsNull).toBe(true));
// 	});
// });