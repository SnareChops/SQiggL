/// <reference path="../Extensions.ts" />
import IParserDefinition from './IParserDefinition';
import {Runner, ActionRunner} from '../Runners';
import Command from '../Command';
import Scope from '../Scope';
import IVariables from '../IVariables';
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
    public regex: RegExp;
	public commands: Command[] = [];
	public stack: Command[] = [];
    public error: string[] = [];
    public sql: string;
	// constructor(public sql: string, public variables: IVariables){
		// this.commands = this.extract(sql, variables);
		// this.variables = variables;
	// }
    constructor(public definition: IParserDefinition){
        if(!definition) throw 'Attempted to instatiate parser without a definition';
        this.regex = new RegExp(`(?:${this.definition.runners.map(x => x.definition.regex.source).join(')|(')})`);
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
	public parse(sql: string, variables: IVariables){
	    this.commands = [];
        this.stack = [];
        this.sql = sql;
        let match
		// Command.regex.lastIndex = 0;
		while((match = this.regex.exec(sql)) != null){
            let found: Command, runner: Runner;
            for(runner of this.definition.runners){
                if(runner.matches(match[0])){
                    found = new Command(match.index, match.input.length, match[1], match[2], new Scope(), runner);
                }
            }
			if(this.stack.length > 0 && this.stack.last().action.definition.dependents.contains(found.action)){
                // found.action.supporter = stack.last();
				this.stack.last().dependents.push(found);
			}
			else if (this.stack.length > 0 && !this.stack.last().action.definition.terminator) {
				this.stack.push(found);
				this.stack.last().scope.commands.push(found);
			}
			else {
				if(this.stack.length > 0 && this.stack.last().action.definition.terminator) this.stack.pop();
				this.stack.push(found);
				this.commands.push(found);
			}
            // let error = found.action.validate();
            // if(error) return [];
		}
		// return commands;
	}
	/**
     * Run the commands against the string and output the end result
     * @memberof Parser
     * @method
     * @public
     * @returns {string} The end result of running all commands against the SQiggL query
     */
	public perform(): string {
		var query = '', index = 0;
        if(this.commands.length === 0) return this.sql;
		for(var command of this.commands){
			query += this.sql.slice(index, command.index -1);
			query += command.perform(command).result.text;
			index += command.length;
		}
		return query; //TODO
	}
}