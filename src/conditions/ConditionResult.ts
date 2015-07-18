import IVariables from '../IVariables';
import {IModifier} from '../Modifiers';
export default class ConditionResult {
    public pass: boolean;
    public variable: string;
    public comparative: any;
    public variables: IVariables;
    public modifier: IModifier[] = [];
    public statement: string;
    public set(prop: string, value: string | IModifier){
        if(this[prop] instanceof Array) this[prop].push(value);
        else this[prop] = value;
    }
}