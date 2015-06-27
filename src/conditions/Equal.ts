import {ICondition} from '../conditions/ICondition';
import {IVariables} from '../IVariables';

/**
 * The == condition
 * @module Equal
 * @class
 * @implements {ICondition}
 * @param {string} variable         - Variable to test condition against
 * @param {IVariables} variables    - Variables within the scope of this condition
 * @property {string} variable      - Variable to test condition against
 * @property {IVariables} variables - Variables within the scope of this condition
 */
export default class Equal implements ICondition {
    /**
     * @memberof Equal
     * @static
     * @property {RegExp} The regex matcher
     */
	public static regex: RegExp = /(\w+)\s+==\s+(\d+)/i;
	constructor(public variable: string, public variables: IVariables, public comparative: string){}
    /**
     * @memberof Equal
     * @method
     * @public
     * @returns {boolean} Outcome of applying the condition to the variable
     */
	public perform():boolean{
		return this.variables[this.variable] === this.comparative;
	}
}