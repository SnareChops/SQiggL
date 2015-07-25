// /// <reference path="../typings/tsd.d.ts" />
// import Command from '../src/Command';
// import {If} from '../src/Actions';
// import IVariables from '../src/IVariables';

// describe('Command', () => {
// 	describe('regex', () => {
// 		it('should match any strings wrapped in "{{% %}}"', () => expect(Command.regex.test('{{% something %}}')).toBe(true));
// 		it('should not match any strings wrapped in "{{ }}"', () => expect(Command.regex.test('{{ something }}')).toBe(false));
// 		it('should not match any strings wrapped in "{{{ }}}"', () => expect(Command.regex.test('{{{ something }}}')).toBe(false));
// 		it('should match any strings wrapped in "{{% %}}" anywhere', () => expect(Command.regex.test('hello world {{% something %}} from this test')).toBe(true));
// 		// it('should capture the command and inner', () => {
// 		// 	var match, matches: string[][] = [];
// 		// 	while((match = Command.regex.exec('hello world {{% this is the command %}} and this is the inner')) != null){
// 		// 		console.log(match);
// 		// 		matches.push(match);
// 		// 	}
// 		// 	expect(matches).not.toBeNull();
// 		// 	expect(matches).not.toBeUndefined();
// 		// 	expect(matches[0]).not.toBeNull();
// 		// 	expect(matches[0]).not.toBeUndefined();
// 		// 	// expect(matches[0][1]).not.toBeNull();
		
// 		// 	// expect(matches[0][1]).toEqual(' this is the command ');
// 		// 	// expect(matches[0][2]).toEqual(' and this is the inner');
// 		// });
// 	});
	
// 	describe('instance', () => {
// 		let index = 5,
// 			statement = ' if something is not null ',
// 			inner = ' FirstName = {{ something }} ',
// 			variables: IVariables = {something: 'Dragon'},
// 			command: Command,
// 			length: number = `{{%${statement}%}}${inner}`.length; 
// 		beforeAll(() => command = new Command(index, length, statement, inner, variables));
// 		it('should store the index', () => expect(command.index).toEqual(5));
// 		it('should store the statement', () => expect(command.statement).toEqual(statement));
// 		it('should store the inner', () => expect(command.inner).toEqual(inner));
// 		it('should store the variables', () => expect(command.scope.variables).toEqual(variables));
// 	});
	
// 	describe('expect', () => {
// 		let index = 5,
// 			statement = ' if something is not null ',
// 			inner = ' FirstName = {{ something }} ',
// 			variables: IVariables = {something: 'Dragon'},
// 			command: Command,
// 			length: number = `{{%${statement}%}}${inner}`.length; 
// 		beforeAll(() => command = new Command(index, length, statement, inner, variables));
// 		it('should create the correct action', () => expect(command.extract(statement, inner, variables) instanceof If).toBe(true));
// 	});
// });