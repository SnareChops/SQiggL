/// <reference path="IReplacer.ts" />
import {IVariables} from '../IVariables';

export default class VariableReplacer {
	public static regex: RegExp = /([^{]|^){{(?!{)\s*(\w*)\s*}}(?!})/g;
	
	public static replace(text: string, variables: IVariables): string{
		console.log(variables);
		console.log(text.replace(this.regex, (match, $1, $2) => {
			console.log($1);
			console.log($2);
			return $1+variables[$2]
		}));
		return text.replace(this.regex, (match, $1, $2) => $1+variables[$2]);
	}
}