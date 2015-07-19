import IVariables from '../IVariables';
import {Modifier} from '../Modifiers';
export default class ConditionResult {
    public pass: boolean;
    public variable: string;
    public comparative: any;
    public variables: IVariables;
    public modifier: Modifier[] = [];
    public statement: string;
    public set(prop: string, value: string | Modifier){
        if(this[prop] instanceof Array) this[prop].push(value);
        else this[prop] = value;
    }
}