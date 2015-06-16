/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../src/IVariables.ts" />

import Parser from '../src/Parser';
import Command from '../src/Command';

describe('Parser', () => {
	describe('instance', () => {
		var parser, 
			sql = "UPDATE Something SET {{% if myVar is not null %}} FirstName = {{ myVar }} {{% else %}} FirstName = 'Default' {{% end %}} WHERE ID = 1",
			variables: IVariables = {myVar: 'Dragon'};
		beforeAll(() => parser = new Parser(sql, variables));
		it('should store the sql', () => expect(parser.sql).toEqual(sql));
		it('should store the variables', () => expect(parser.variables).toEqual(variables));
	});
	
	describe('extract', () => {
		var parser, 
			sql = "UPDATE Something SET {{% if myVar is not null %}} FirstName = {{ myVar }} {{% else %}} FirstName = 'Default' {{% end %}} WHERE ID = 1",
			variables: IVariables = {myVar: 'Dragon'};
		beforeAll(() => parser = new Parser(sql, variables));
		it('should return a list of commands', () => expect(parser.extract(sql, variables)[1] instanceof Command).toBe(true));
		it('should contain the correct number of commands', () => expect(parser.extract(sql, variables).length).toEqual(3));
	});
});