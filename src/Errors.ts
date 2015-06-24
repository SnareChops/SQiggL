import {IAction} from 'actions/IAction';
/**
 * Module of error checkers
 * @module Errors
 * @class
 * @static
 */
export default class Errors {
    /**
     * @memberof Errors
     * @method
     * @static
     * @param {IAction} action      - Action to check for an Incorrect Statement error
     * @param {string} statement    - Statement to check for a Incorrect Statement error
     * @returns {string | null}     - The error message if any, otherwise null 
     */
    public static IncorrectStatement(action: IAction, statement: string): string{
        const actions:string = action.command.actions.filter(x => x.dependents.some(y => action instanceof y)).map(x => x.name).join(', ');
        const error: string = `Incorrect statement found at "${statement}". ${action.constructor['name']} must follow ${actions}`
        console.error(error);
        return error;
    }
}