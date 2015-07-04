import IReplacer from './IReplacer';
import IVariables from '../IVariables';

/**
 * The variable replacer for embedded SQiggL variables
 * @module VariableReplacer
 * @static
 * @class
 * @implements {IReplacer}
 */
export default class VariableReplacer implements IReplacer {
    /**
     * @memberof VariableReplacer
     * @static
     * @property {RegExp} The regex matcher
     */
	public static regex: RegExp = /([^{]|^){{(?!{)\s*(\w*)\s*}}(?!})/g;
	/**
     * @memberof VariableReplacer
     * @static
     * @method
     * @param {string} text             - Text to search for replacements
     * @param {IVariables} variables    - Variables within the scope
     * @returns {string}                - The string with variables replaced 
     */
	public static replace(text: string, variables: IVariables): string{
		return text.replace(this.regex, (match, $1, $2) => $1+variables[$2]);
	}
}