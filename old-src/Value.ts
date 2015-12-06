import ValueType from './ValueType';
import IVariables from './IVariables';
export default class Value {
    public type: ValueType;
    public value: any;
    constructor(item: any){
        if(item instanceof Array){
            this.type = ValueType.array;
        } else if(/("|')[\w\d]+(\1)/.test(item)) {
            this.type = ValueType.string;
            this.value = item.substr(1, item.length - 2);
        } else if(!isNaN(item)) {
            this.type = ValueType.number;
            this.value = parseFloat(item);
        } else {
            this.type = ValueType.variable;
            this.value = item;
        }
    }
    
    public evaluate(variables: IVariables): any{
        if(this.type === ValueType.variable){
            if(isNaN(variables[<string>this.value])){
                return variables[<string>this.value]
            } else {
                return parseFloat(variables[<string>this.value]);
            }
        } else {
            return this.value;
        }
    }
}