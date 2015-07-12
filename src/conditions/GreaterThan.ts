import ICondition from './ICondition';
import Condition from './Condition'
import IVariables from '../IVariables';
import {IModifier, Not, OrEqual} from '../Modifiers';

/**
 * The > condition
 * @module GreaterThan
 * @class
 * @implements {ICondition}
 * @param {string} variable         - Variable to test condition against
 * @param {IVariables} variables    - Variables within the scope of this condition
 * @property {string} variable      - Variable to test condition against
 * @property {IVariables} variables - Variables within the scope of this condition
 */
export default class GreaterThan extends Condition implements ICondition {
    /**
     * @memberof GreaterThan
     * @static
     * @property {RegExp} The regex matcher
     */
    public static modifiers = [Not, OrEqual];
	public static regex: RegExp = new RegExp(`(\\w+)\\s+((?:${GreaterThan.mods(GreaterThan)}|\\s*))>((?:${GreaterThan.mods(GreaterThan)}|\\s*))\\s+(\\d+)`, 'i');
    public modifiers: IModifier[] = [];
	constructor(public variable: string, public variables: IVariables, public comparative: string, mod1: string, mod2: string){
        super();
        this.modifiers = super.extractModifiers(GreaterThan, mod1, mod2);
    }
    
    public static extract(statement: string, variables: IVariables){
        let match = statement.match(GreaterThan.regex);
        if(match && match.length > 0) return new GreaterThan(match[1], variables, match[4], match[2], match[3]);
        return null;
    }
    
    /**
     * @memberof GreaterThan
     * @method
     * @public
     * @returns {boolean} Outcome of applying the condition to the variable
     */
	public perform():boolean{
        let result = parseInt(this.variables[this.variable]) > parseInt(this.comparative);
        result = this.performModifiers(this.modifiers, result, this.variable, this.variables, this.comparative);
        return result; 
	}
}