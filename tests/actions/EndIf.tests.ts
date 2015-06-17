/// <reference path="../../typings/tsd.d.ts" />
import EndIf from '../../src/actions/EndIf';
import Command from '../../src/Command';
import {IVariables} from '../../src/IVariables';

describe("EndIf", () => {
	describe('regex', () => {
		it('should have a query that matches "endif"', () => expect(EndIf.regex.test('endif')).toBe(true));
		it('should only match if "endif" is first word', () => expect(EndIf.regex.test('nothing endif')).toBe(false));
		it('should not match more than one "endif" in the statement', () => expect('endif something endif something'.match(EndIf.regex).length).toEqual(1));
		it('should not match if "endif" is not present', () => expect(EndIf.regex.test('there is no action')).toBe(false));
		it('should not match a word only starting with "endif"', () => expect(EndIf.regex.test('endifll')).toBe(false));
		it('should not match a word containing "endif"', () => expect(EndIf.regex.test('somendifthing')).toBe(false));
	});
	
	describe('instance', () => {
		const index: number = 5, 
			statement = ' endif ',
			inner = ' WHERE FirstName = {{statement}} ',
			length: number = `{{%${statement}%}}${inner}`.length,
			variables: IVariables = {something: 'green'};
		let	command: Command,
			action: EndIf;
		beforeAll(() => {
			command = new Command(index, length, statement, inner, variables);
			action = new EndIf(command, statement, inner, variables);
		});
		it('should store the statement', () => expect(action.statement).toEqual(statement));
		it('should store the inner', () => expect(action.inner).toEqual(inner));
		it('should store the variables', () => expect(action.variables).toEqual(variables));
	});
});