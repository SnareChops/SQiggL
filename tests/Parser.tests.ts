/// <reference path="../typings/tsd.d.ts" />
import {IVariables} from '../src/IVariables';
import Parser from '../src/Parser';
import Command from '../src/Command';

describe('Parser', () => {
	describe('instance', () => {
		var parser, 
			sql = "UPDATE Something SET {{% if myVar is not null %}} FirstName = {{ myVar }} {{% else %}} FirstName = 'Default' {{% endif %}} WHERE ID = 1",
			variables: IVariables = {myVar: 'Dragon'};
		beforeAll(() => parser = new Parser(sql, variables));
		it('should store the sql', () => expect(parser.sql).toEqual(sql));
		it('should store the variables', () => expect(parser.variables).toEqual(variables));
	});
	
	describe('extract', () => {
		var parser, 
			sql = "UPDATE Something SET {{% if myVar is not null %}} FirstName = {{ myVar }} {{% else %}} FirstName = 'Default' {{% endif %}} WHERE ID = 1",
			variables: IVariables = {myVar: 'Dragon'};
		beforeAll(() => parser = new Parser(sql, variables));
		it('should return a list of commands', () => expect(parser.extract(sql, variables)[0] instanceof Command).toBe(true));
		it('should contain the correct number of commands', () => expect(parser.extract(sql, variables).length).toEqual(1));
		it('should contain dependent commands', () => expect(parser.extract(sql, variables)[0].dependents[0] instanceof Command).toBe(true));
		it('should contain the correct number of dependent commands', () => expect(parser.extract(sql, variables)[0].dependents.length).toEqual(2));
	});
});