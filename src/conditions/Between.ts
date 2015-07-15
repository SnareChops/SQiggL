import ICondition from './ICondition';
import IVariables from '../IVariables';
import {IModifier, Not} from '../Modifiers';
import Condition from './Condition';

/**
 * The Is Null condition
 * @module Between
 * @class
 * @implements {ICondition}
 * @param {string} variable         - Variable to test condition against
 * @param {IVariables} variables    - Variables within the scope of this condition
 * @property {string} variable      - Variable to test condition against
 * @property {IVariables} variables - Variables within the scope of this condition
 */
export default class Between extends Condition implements ICondition {
     public static modifiers = [Not];
    /**
     * @memberof Between
     * @static
     * @property {RegExp} The regex matcher
     */
     public static regex: RegExp = new RegExp(`(\\w+)\\s+((?:${Between.mods(Between)}|\\s*))(\\d+)><(\d+)`, 'i');
     public modifiers: IModifier[] = [];
     constructor(public variable: string, public variables: IVariables, public comparative: string, mod1: string, mod2: string){
         super();
         this.modifiers = super.extractModifiers(Between, mod1, mod2);
     }
     
     public static extract(statement: string, variables: IVariables){
         let match = statement.match(Between.regex);
         if(match && match.length > 0) return new Between(match[1], variables, null, match[2], null);
         return null;
     }
     
     /**
      * @memberof Between
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