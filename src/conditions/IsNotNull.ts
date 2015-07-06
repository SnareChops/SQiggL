import ICondition from './ICondition';
import IVariables from '../IVariables';
import {IModifier} from '../Modifiers';
import Condition from './Condition';

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
export default class IsNotNull extends Condition implements ICondition {
    /**
     * @memberof IsNotNull
     * @static
     * @property {RegExp} The regex matcher
     */
    public static modifiers = [];
	public static regex: RegExp = /(\w+)\s+is\s+not\s+null\s*/i;
    public modifiers: IModifier[] = [];
	constructor(public variable: string, public variables: IVariables, public comparative: string, mod1: string, mod2: string){
        super();
        this.modifiers = super.extractModifiers(IsNotNull, mod1, mod2);
    }
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