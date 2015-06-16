/// <reference path="IVariables.ts" />
/// <reference path="Extensions.ts" />
import Command from './Command';

export default class Parser {
	public commands: Command[];
	public stack: Command[];
	constructor(public sql: string, public variables: IVariables){
		this.commands = this.extract(sql, variables);
		console.log(variables);
		this.variables = variables;
	}
	
	public extract(sql: string, variables: IVariables):Command[]{
		var match, commands: Command[] = [], stack: Command[] = [];
		Command.regex.lastIndex = 0;
		while((match = Command.regex.exec(sql)) != null){
			var found = new Command(match.index, match.input.length, match[1], match[2], variables);
			if(stack.length > 0 && stack.last().dependent(found.action)) {
				console.log('Creating a dependent command: '+found.action.constructor['name']);
				stack.last().dependents.push(found);
			}
			else if (stack.length > 0 && !stack.last().action.terminator) {
				console.log('Creating a sub command: '+found.action.constructor['name']);
				stack.push(found);
				stack.last().scope.commands.push(found);
			}
			else {
				if(stack.length > 0 && stack.last().action.terminator) stack.pop();
				stack.push(found);
				commands.push(found);
			}
		}
		return commands;
	}
	
	public parse(): string {
		var query = '', index = 0;
		for(var command of this.commands){
			query += this.sql.slice(index, command.index -1);
			query += command.perform(false).result;
			index += command.length;
		}
		return query; //TODO
	}
}