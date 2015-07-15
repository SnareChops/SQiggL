import ICondition from './ICondition';
import IVariables from '../IVariables';
import {IModifier, Not} from '../Modifiers';
import Condition from './Condition';

/**
 * The Is NaN condition
 * @module IsNaN
 * @class
 * @implements {ICondition}
 * @param {string} variable         - Variable to test condition against
 * @param {IVariables} variables    - Variables within the scope of this condition
 * @property {string} variable      - Variable to test condition against
 * @property {IVariables} variables - Variables within the scope of this condition
 */
export default class IsNaN extends Condition implements ICondition {
     public static modifiers = [Not];
    /**
     * @memberof IsNaN
     * @static
     * @property {RegExp} The regex matcher
     */
     public static regex: RegExp = new RegExp(`(\\w+)\\s+is\\s+((?:${IsNaN.mods(IsNaN)}|\\s*))NaN\\s*`, 'i');
     public modifiers: IModifier[] = [];
     constructor(public variable: string, public variables: IVariables, public comparative: string, mod1: string, mod2: string){
         super();
         this.modifiers = super.extractModifiers(IsNaN, mod1, mod2);
     }
     
     public static extract(statement: string, variables: IVariables){
         let match = statement.match(IsNaN.regex);
         if(match && match.length > 0) return new IsNaN(match[1], variables, null, match[2], null);
         return null;
     }
     
     /**
      * @memberof IsNaN
      * @method
      * @public
      * @returns {boolean} Outcome of applying the condition to the variable
      */
      public perform():boolean{
          let result = isNaN(this.variables[this.variable]);
          result = this.performModifiers(this.modifiers, result, this.variable, this.variables, this.comparative);
          return result;
      }
}