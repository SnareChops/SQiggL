import IModifierDefinition from './IModifierDefinition';
import IVariables from '../IVariables';

export default class Modifier {
    constructor(public definition:IModifierDefinition){
        if(!definition) throw 'Attempted to instatiate modifier without a definition';
    }
    
    public matches(text: string): boolean {
        let identifier;
        for(identifier of this.definition.identifiers){
            if(identifier.test(text)) return true;
        }
        return false;
    }
}