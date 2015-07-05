import {IModifier} from '../Modifiers';
import IVariables from '../IVariables';

export default class Condition {
    public static mods(klass){
        return klass.modifiers.map(x => `${x.identifiers.join('|')}`);
    }
    public extractModifiers(klass, mod1: string, mod2: string): any[]{
        if(!mod1 && !mod2) return [];
        let array = [], count = 0;
        if(mod1) count++;
        if(mod2) count++;        
        for(let mod of klass.modifiers){
            for(let identifier of mod.identifiers){
                if(mod1 && mod1.match(`/${identifier}/i`)) array[0] = mod;
                if(mod2 && mod2.match(`/${identifier}/i`)) array[!mod1 ? 0 : 1] = mod;
                if(array.length === count) return array;
            }
        }
        return array;
    }
    public performModifiers(modifiers: IModifier[], result: boolean, variable: string, variables: IVariables, comparative: string): boolean{
        for(let mod of modifiers){
            result = mod.perform(result, variable, variables, comparative);
        }
        return result;
    }
}