import ICondition from '../conditions/ICondition';
import IVariables from '../IVariables';

/**
 * The < condition
 * @module LessThan
 * @class
 * @implements {ICondition}
 * @param {string} variable         - Variable to test condition against
 * @param {IVariables} variables    - Variables within the scope of this condition
 * @property {string} variable      - Variable to test condition against
 * @property {IVariables} variables - Variables within the scope of this condition
 */
export default class LessThan implements ICondition {
    /**
     * @memberof LessThan
     * @static
     * @property {RegExp} The regex matcher
     */
	public static regex: RegExp = /(\w+)\s+<\s+(\d+)/i;
	constructor(public variable: string, public variables: IVariables, public comparative: string){}
    /**
     * @memberof LessThan
     * @method
     * @public
     * @returns {boolean} Outcome of applying the condition to the variable
     */
	public perform():boolean{
		return parseInt(this.variables[this.variable]) < parseInt(this.comparative);
	}
}