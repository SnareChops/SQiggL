import {ICondition} from '../conditions/ICondition';
import {IVariables} from '../IVariables';

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
export default class IsNull implements ICondition {
    /**
     * @memberof IsNull
     * @static
     * @property {RegExp} The regex matcher
     */
     public static regex: RegExp = /(\w*)\s+is\s+null\s*/i;
     constructor(public variable: string, public variables: IVariables, public comparative: string){}
     /**
      * @memberof IsNull
      * @method
      * @public
      * @returns {boolean} Outcome of applying the condition to the variable
      */
      public perform():boolean{
          return this.variables[this.variable] == null;
      }
}