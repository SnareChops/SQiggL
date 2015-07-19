import IModifierDefinition from './IModifierDefinition';
import IVariables from '../IVariables';

export default class Modifier {
    public identifiers: RegExp[];
    public rule: (pass: boolean, variable: string, comparative: string | string[], variables: IVariables) => boolean;
    constructor(private definition:IModifierDefinition){
        this.identifiers = definition.identifiers;
        this.rule = definition.rule
    }
    
    public matches(text: string): boolean {
        let identifier;
        for(identifier of this.identifiers){
            if(identifier.test(text)) return true;
        }
        return false;
    }
}