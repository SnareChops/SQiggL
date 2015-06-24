/// <reference path="Extensions.ts" />
import Command from './Command';
import {IVariables} from './IVariables';
Array.prototype.last = function(){
	return this[this.length-1];
}
/**
 * The SQiggL parser
 * @module Parser
 * @class
 * @param {string} sql              - The SQiggL query to run the parser against
 * @param {IVariables} variables    - Any variables passed to the SQiggL parser
 * @property {string} sql           - The SQiggL query to run the parser against
 * @property {IVariables} variables - Any variables passed to the SQiggL parser
 * @property {Command[]} commands   - Array of commands found in the SQiggL query
 * @property {Command[]} stack      - Command stack for storing current position in the parsing process
 * @property {string} error         - Error string if any errors are found in the parsing process
 */
export default class Parser {
	public commands: Command[];
	public stack: Command[];
    public error: string;
	constructor(public sql: string, public variables: IVariables){
		this.commands = this.extract(sql, variables);
		this.variables = variables;
	}
	/**
     * Extract any commands out of the SQiggL query and determine their order, nesting, and type
     * @memberof Parser
     * @method
     * @public
     * @param {string} sql              - SQiggL query to extract commands from
     * @param {IVariables} variables    - Any global variables passed in to SQiggL
     * @returns {Command[]}             - Array of fully parsed commands, ready for execution
     */
	public extract(sql: string, variables: IVariables):Command[]{
		var match, commands: Command[] = [], stack: Command[] = [];
		Command.regex.lastIndex = 0;
		while((match = Command.regex.exec(sql)) != null){
			var found = new Command(match.index, match.input.length, match[1], match[2], variables);
			if(stack.length > 0 && stack.last().dependent(found.action)) {
                found.action.supporter = stack.last();
				stack.last().dependents.push(found);
			}
			else if (stack.length > 0 && !stack.last().action.terminator) {
				stack.push(found);
				stack.last().scope.commands.push(found);
			}
			else {
				if(stack.length > 0 && stack.last().action.terminator) stack.pop();
				stack.push(found);
				commands.push(found);
			}
            let error = found.action.validate();
            if(error) return [];
		}
		return commands;
	}
	/**
     * Run the commands against the string and output the end result
     * @memberof Parser
     * @method
     * @public
     * @returns {string} The end result of running all commands against the SQiggL query
     */
	public parse(): string {
		var query = '', index = 0;
        if(this.commands.length === 0) return this.sql;
		for(var command of this.commands){
			query += this.sql.slice(index, command.index -1);
			query += command.perform(false).result;
			index += command.length;
		}
		return query; //TODO
	}
}