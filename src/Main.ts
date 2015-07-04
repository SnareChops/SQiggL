import Parser from './Parser';
import IVariables from './IVariables';
/**
 * The starting point of the entire SQiggL parser
 * @function
 * @param {string} sql              - The SQL query to run SQiggL against
 * @param {IVariables?} variables   - Optional collection of variables for your SQiggL query
 * @return {string}                 - The fully parsed SQL query
 */
export function parse(sql: string, variables?: IVariables): string{
	var parser = new Parser(sql, variables);
	return parser.parse();
}