import ICondition from '../conditions/ICondition';
import IVariables from '../IVariables';

/**
 * The Is Not Null condition
 * @module IsNotNull
 * @class
 * @implements {ICondition}
 * @param {string} variable         - Variable to test condition against
 * @param {IVariables} variables    - Variables within the scope of this condition
 * @property {string} variable      - Variable to test condition against
 * @property {IVariables} variables - Variables within the scope of this condition
 */
export default class IsNotNull implements ICondition {
    /**
     * @memberof IsNotNull
     * @static
     * @property {RegExp} The regex matcher
     */
	public static regex: RegExp = /(\w+)\s+is\s+not\s+null\s*/i;
	constructor(public variable: string, public variables: IVariables, public comparative: string){}
    /**
     * @memberof IsNotNull
     * @method
     * @public
     * @returns {boolean} Outcome of applying the condition to the variable
     */
	public perform():boolean{
		return this.variables[this.variable] != null;
	}
}