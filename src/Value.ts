import ValueType from './ValueType';
import IVariables from './IVariables';
export default class Value {
    public type: ValueType;
    public value: string | number;
    constructor(item){
        if(/("|')[\w\d]+(\1)/.test(item)) {
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
    
    public evaluate(variables: IVariables): string | number{
        return this.type === ValueType.variable ? isNaN(variables[this.value]) ? variables[this.value] : parseFloat(variables[this.value]) : this.value;
    }
}