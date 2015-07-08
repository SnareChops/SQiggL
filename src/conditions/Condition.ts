import {IModifier} from '../Modifiers';
import IVariables from '../IVariables';

export default class Condition {
    public static mods(klass){
        return klass.modifiers.map(x => `${x.identifiers.map(id => id.source).join('|')}`).join('|');
    }
    public extractModifiers(klass, mod1: string, mod2: string): any[]{
        if(mod1 == null && mod2 == null) return [];
        let array = [], count = 0;
        if(mod1 != null) count++;
        if(mod2 != null) count++;
        for(let mod of klass.modifiers){
            for(let identifier of mod.identifiers){
                if(mod1 != null && identifier.test(mod1)) array[0] = mod;
                if(mod2 != null && identifier.test(mod2)) {
                    array[mod1 == null ? 0 : 1] = mod;
                }
                if(array.length === count) return array;
            }
        }
        return array;
    }
    public performModifiers(modifiers: IModifier[], result: boolean, variable: string, variables: IVariables, comparative: string): boolean{
        if(modifiers.length === 0) return result;
        let i;
        for(i=modifiers.length - 1;i>-1;i--){
            result = modifiers[i].perform(result, variable, variables, comparative);
        }
        return result;
    }
}