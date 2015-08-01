import IVariables from '../IVariables';
import {Modifier} from '../Modifiers';
export default class ConditionResult {
    public pass: boolean;
    public variable: string;
    public comparative: any;
    public variables: IVariables;
    public modifier: Modifier[] = [];
    public statement: string;
    public set(prop: string, value: string | Modifier, index?: number){
        if(this[prop] instanceof Array) {
            if(index) this[prop][index] = value;
            else this[prop].push(value);
        }
        else /^["'].*["']$/i.test(value) ? this[prop] = value.substr(1, value.length - 2) : this[prop] = variables[value];
    }
}