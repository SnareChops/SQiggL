import {IAction} from 'actions/IAction';

export default class Errors {
    public static IncorrectStatement(action: IAction, statement: string): void{
        const actions:string = action.command.actions.filter(x => x.dependents.some(y => action instanceof y)).map(x => x.constructor['name']).join(', ');
        console.error(`Incorrect statement found at "${statement}". ${action.constructor['name']} must follow ${actions}`);
    }
}