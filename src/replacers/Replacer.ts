import IReplacerDefinition from './IReplacerDefinition';
import IVariables from '../IVariables';

export default class Replacer {    
    constructor(public definition: IReplacerDefinition){
        if(!definition) throw 'Attempted to instatiate replacer without a definition';
    }
    
    public replace(text: string, variables: IVariables): string{
        return this.definition.rule(this.definition, text, variables);
    }
}