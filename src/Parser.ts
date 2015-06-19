/// <reference path="Extensions.ts" />
import Command from './Command';
import {IVariables} from './IVariables';
Array.prototype.last = function(){
	return this[this.length-1];
}
export default class Parser {
	public commands: Command[];
	public stack: Command[];
    public error: string;
	constructor(public sql: string, public variables: IVariables){
		this.commands = this.extract(sql, variables);
		this.variables = variables;
	}
	
	public extract(sql: string, variables: IVariables):Command[]{
		var match, commands: Command[] = [], stack: Command[] = [];
		Command.regex.lastIndex = 0;
		while((match = Command.regex.exec(sql)) != null){
			var found = new Command(match.index, match.input.length, match[1], match[2], variables);
			if(stack.length > 0 && stack.last().dependent(found.action)) {
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
		}
		return commands;
	}
	
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