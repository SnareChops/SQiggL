/// <reference path="../typings/tsd.d.ts" />
import Command from '../src/Command';

describe('Command', () => {
	it('should match any strings wrapped in "{{% %}}"', () => expect(Command.regex.test('{{% something %}}')).toBe(true));
	it('should not match any strings wrapped in "{{ }}"', () => expect(Command.regex.test('{{ something }}')).toBe(false));
	it('should not match any strings wrapped in "{{{ }}}"', () => expect(Command.regex.test('{{{ something }}}')).toBe(false));
	it('should match any strings wrapped in "{{% %}}" anywhere', () => expect(Command.regex.test('hello world {{% something %}} from this test')).toBe(true));
	// it('should capture the command and inner', () => {
	// 	var match, matches: string[][] = [];
	// 	while((match = Command.regex.exec('hello world {{% this is the command %}} and this is the inner')) != null){
	// 		console.log(match);
	// 		matches.push(match);
	// 	}
	// 	expect(matches).not.toBeNull();
	// 	expect(matches).not.toBeUndefined();
	// 	expect(matches[0]).not.toBeNull();
	// 	expect(matches[0]).not.toBeUndefined();
	// 	// expect(matches[0][1]).not.toBeNull();
		
	// 	// expect(matches[0][1]).toEqual(' this is the command ');
	// 	// expect(matches[0][2]).toEqual(' and this is the inner');
	// });
});