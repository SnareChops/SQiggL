import IVariables from './IVariables';
import {RunnerResult} from './Runners'
import Command from './Command';

export default class Scope {
	public variables: IVariables = {};
	public commands: Command[] = [];
	public dependents: Command[] = [];
    
    public perform(prev?: Command): Command {
        let command: Command;
        for(command of this.commands){
            prev = command.perform(prev);
        }
        return prev;
    }
}