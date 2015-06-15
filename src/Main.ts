/// <reference path="IVariables.ts" />
import Parser from './Parser';

export function parse(sql: string, variables?: IVariables): string{
	var parser = new Parser(sql, variables);
	return parser.parse();
}