// /// <reference path="../../typings/tsd.d.ts" />
// import Else from '../../src/actions/Else';
// import Command from '../../src/Command';
// import IVariables from '../../src/IVariables';

// describe("Else", () => {
// 	describe('regex', () => {
// 		it('should have a query that matches else', () => expect(Else.regex.test('else')).toBe(true));
// 		it('should only match if "else" is first word', () => expect(Else.regex.test('nothing else')).toBe(false));
// 		it('should not match more than one "else" in the statement', () => expect('else something else something'.match(Else.regex).length).toEqual(1));
// 		it('should not match if "else" is not present', () => expect(Else.regex.test('there is no action')).toBe(false));
// 		it('should not match a word only starting with "else"', () => expect(Else.regex.test('elsell')).toBe(false));
// 		it('should not match a word containing "else"', () => expect(Else.regex.test('somelsething')).toBe(false));
// 	});
	
// 	describe('instance', () => {
// 		const index: number = 5, 
// 			statement = ' else ',
// 			inner = ' SET FirstName = {{something}} ',
// 			length: number = `{{%${statement}%}}${inner}`.length,
// 			variables: IVariables = {something: 'green'};
// 		let	command: Command,
// 			action: Else;
// 		beforeAll(() => {
// 			command = new Command(index, length, statement, inner, variables);
// 			action = new Else(command, statement, inner, variables);
// 		});
// 		it('should store the statement', () => expect(action.statement).toEqual(statement));
// 		it('should store the inner', () => expect(action.inner).toEqual(inner));
// 		it('should store the variables', () => expect(action.variables).toEqual(variables));
// 	});
// });