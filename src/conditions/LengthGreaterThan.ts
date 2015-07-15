import ICondition from './ICondition';
import Condition from './Condition'
import IVariables from '../IVariables';
import {IModifier, Not, OrEqual} from '../Modifiers';

/**
 * The len> condition
 * @module LengthGreaterThan
 * @class
 * @extends {Condition}
 * @implements {ICondition}
 * @param {string} variable             - Variable to test condition against
 * @param {IVariables} variables        - Variables within the scope of this condition
 * @param {string} comparative          - Value to compare variable against
 * @param {string} mod1                 - Identifier of first modifier, or null
 * @param {string} mod2                 - Identifier of second modifier, or null
 * @property {string} variable          - Variable to test condition against
 * @property {IVariables} variables     - Variables within the scope of this condition
 * @property {string} comparative       - Value to compare variable against
 * @property {string} mod1              - Identifier of first modifier, or null
 * @property {string} mod2              - Identifier of second modifier, or null
 * @property {IModifier[]} modifiers    - Array of modifiers found in condition, in order
 */
export default class LengthGreaterThan extends Condition implements ICondition {
    /** 
     * @memberof LengthGreaterThan
     * @static
     * @property {IModifier[]} Array of possible modifiers to check against
     */
    public static modifiers: IModifier[] = [Not, OrEqual];
    /**
     * @memberof LengthGreaterThan
     * @static
     * @property {RegExp} The regex matcher
     */
	public static regex: RegExp = new RegExp(`(\\w+)\\s+((?:${LengthGreaterThan.mods(LengthGreaterThan)}|\\s*))len>((?:${LengthGreaterThan.mods(LengthGreaterThan)}|\\s*))\\s+(\\d+)`, 'i');
    public modifiers: IModifier[] = [];
	constructor(public variable: string, public variables: IVariables, public comparative: string, mod1?: string, mod2?: string){
        super();
        this.modifiers = super.extractModifiers(LengthGreaterThan, mod1, mod2);
    }
    /**
     * Extracts the variable, comparative, and any modifiers in the condition
     * @memberof LengthGreaterThan
     * @static
     * @method
     * @returns {LengthGreaterThan | null} Instance of LengthGreaterThan ready for execution
     */
    public static extract(statement: string, variables: IVariables){
        let match = statement.match(LengthGreaterThan.regex);
        if(match && match.length > 0) return new LengthGreaterThan(match[1], variables, match[4], match[2], match[3]);
        return null;
    }
    
    /**
     * @memberof LengthGreaterThan
     * @method
     * @public
     * @returns {boolean} Outcome of applying the condition to the variable
     */
	public perform():boolean{
        let result = this.variables[this.variable].length > parseInt(this.comparative);
        result = this.performModifiers(this.modifiers, result, this.variable, this.variables, this.comparative);
        return result; 
	}
}