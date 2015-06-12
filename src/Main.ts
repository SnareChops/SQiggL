/// <reference path="IVariable.ts" />
export * from './Actions';
export * from './Conditions';
import Command from './Command';

export var variables: IVariable[] = [];
export function parse(sql: string, variables?: IVariable[]){
	variables = variables;
	console.log(extractCommands(sql));
}
export function extractCommands(sql:string): Command[]{
	var match, commands: Command[] = [];
	while((match = Command.regex.exec(sql)) != null){
		commands.push(new Command(match[1], match[2]));
	}
	return commands;
}