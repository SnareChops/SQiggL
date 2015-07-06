import ICondition from './ICondition';
import IVariables from '../IVariables';
import Condition from './Condition';
import {IModifier, Not, OrEqual} from '../Modifiers';

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
export default class LessThan extends Condition implements ICondition {
    /**
     * @memberof LessThan
     * @static
     * @property {RegExp} The regex matcher
     */
    public static modifiers = [Not, OrEqual];
	public static regex: RegExp = new RegExp(`(\\w+)\\s+((?:${LessThan.mods(LessThan)}|\\s*))<((?:${LessThan.mods(LessThan)}|\\s*))\\s+(\\d+)`, 'i');
    public modifiers: IModifier[] = [];
	constructor(public variable: string, public variables: IVariables, public comparative: string, mod1: string, mod2: string){
        super();
        this.modifiers = this.extractModifiers(LessThan, mod1, mod2);
    }
    /**
     * @memberof LessThan
     * @method
     * @public
     * @returns {boolean} Outcome of applying the condition to the variable
     */
	public perform():boolean{
		let result = parseInt(this.variables[this.variable]) < parseInt(this.comparative);
        result = this.performModifiers(this.modifiers, result, this.variable, this.variables, this.comparative);
        return result;
	}
}