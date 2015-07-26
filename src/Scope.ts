import IVariables from './IVariables';
import Command from './Command';

export default class Scope {
	public variables: IVariables = {};
	public commands: Command[] = [];
	public dependents: Command[] = [];
    
    public perform(): string {
        let command: Command, text: string = '';
        for(command of this.commands){
            text += command.perform().result.text;
        }
        return text;
    }
}