/// <reference path="IReplacer.ts" />
/// <reference path="../IVariables.ts" />

export default class VariableReplacer {
	public static regex: RegExp = /{{\s*(\w*)\s*}}/g;
	
	public static replace(text: string, variables: IVariables): string{
		console.log(variables);
		return text.replace(this.regex, (match, $1) => variables[$1]);
	}
}