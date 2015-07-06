import ICondition from './ICondition';
import Condition from './Condition';
import IVariables from '../IVariables';
import {IModifier, Not, OrEqual} from '../Modifiers';

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
export default class Equal extends Condition implements ICondition {
    /**
     * @memberof Equal
     * @static
     * @property {RegExp} The regex matcher
     */
    public static modifiers = [Not, OrEqual];
	public static regex: RegExp = new RegExp(`(\\w+)\\s+((?:${Equal.mods(Equal)}|\\s*))=((?:${Equal.mods(Equal)}|\\s*))\\s+(\\d+)`, 'i');
    public modifiers: IModifier[] = [];
	constructor(public variable: string, public variables: IVariables, public comparative: string, mod1: string, mod2: string){
        super();
        this.modifiers = this.extractModifiers(Equal, mod1, mod2);
    }
    /**
     * @memberof Equal
     * @method
     * @public
     * @returns {boolean} Outcome of applying the condition to the variable
     */
	public perform():boolean{
        let result = this.variables[this.variable] === this.comparative;
        result = this.performModifiers(this.modifiers, result, this.variable, this.variables, this.comparative);
        return result;
	}
}