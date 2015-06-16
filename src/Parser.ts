/// <reference path="IVariables.ts" />
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
		var match, commands: Command[] = [];
		while((match = Command.regex.exec(sql)) != null){
			commands.push(new Command(match.index, match[1], match[2], variables));
		}
		return commands;
	}
	
	public parse(): string {
		var query = '',
			index = 0;
		for(var command of this.commands){
			query += this.sql.slice(index, command.index -1);
			query += command.perform();
		}
		return query; //TODO
	}
}