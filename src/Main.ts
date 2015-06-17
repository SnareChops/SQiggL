import Parser from './Parser';
import {IVariables} from './IVariables';

export function parse(sql: string, variables?: IVariables): string{
	var parser = new Parser(sql, variables);
	return parser.parse();
}