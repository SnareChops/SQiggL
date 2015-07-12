import ICondition from './ICondition';
import IVariables from '../IVariables';
import {IModifier, Not} from '../Modifiers';
import Condition from './Condition';

/**
 * The Is Null condition
 * @module IsNull
 * @class
 * @implements {ICondition}
 * @param {string} variable         - Variable to test condition against
 * @param {IVariables} variables    - Variables within the scope of this condition
 * @property {string} variable      - Variable to test condition against
 * @property {IVariables} variables - Variables within the scope of this condition
 */
export default class IsNull extends Condition implements ICondition {
    /**
     * @memberof IsNull
     * @static
     * @property {RegExp} The regex matcher
     */
     public static modifiers = [Not];
     public static regex: RegExp = new RegExp(`(\\w+)\\s+is\\s+((?:${IsNull.mods(IsNull)}|\\s*))null\\s*`, 'i');
     public modifiers: IModifier[] = [];
     constructor(public variable: string, public variables: IVariables, public comparative: string, mod1: string, mod2: string){
         super();
         this.modifiers = super.extractModifiers(IsNull, mod1, mod2);
     }
     
     public static extract(statement: string, variables: IVariables){
         let match = statement.match(IsNull.regex);
         if(match && match.length > 0) return new IsNull(match[1], variables, null, match[2], null);
         return null;
     }
     
     /**
      * @memberof IsNull
      * @method
      * @public
      * @returns {boolean} Outcome of applying the condition to the variable
      */
      public perform():boolean{
          let result = this.variables[this.variable] == null;
          result = this.performModifiers(this.modifiers, result, this.variable, this.variables, this.comparative);
          return result;
      }
}