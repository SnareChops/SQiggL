import IVariables from '../IVariables';
import {Modifier} from '../Modifiers';
import Value from '../Value';
export default class ConditionResult {
    public pass: boolean;
    public value: Value[] = [];
    public variables: IVariables;
    public modifier: Modifier[] = [];
    public statement: string;
    public set(prop: string, value: string | Modifier, index?: number){
        if(this[prop] instanceof Array) {
            if(index) this[prop][index] = prop === 'value' ? new Value(value) : value;
            else this[prop].push(prop === 'value' ? new Value(value) : value);
        }
        else this[prop] = prop === 'value' ? new Value(value) : value;
    }
}