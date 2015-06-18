/// <reference path="IReplacer.ts" />
import {IVariables} from '../IVariables';

export default class VariableReplacer {
	public static regex: RegExp = /([^{]|^){{(?!{)\s*(\w*)\s*}}(?!})/g;
	
	public static replace(text: string, variables: IVariables): string{
		return text.replace(this.regex, (match, $1, $2) => $1+variables[$2]);
	}
}