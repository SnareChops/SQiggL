import Placeholder from '../placeholders/Placeholders';
import ConditionResult from './ConditionResult';
import IConditionIndices from './IConditionIndices';
import IConditionDefinition from './IConditionDefinition';
import IVariables from '../IVariables';
import '../Extensions';

export default class Condition {
    private regex: RegExp;
    private indicies: IConditionIndices;
    constructor(public definition: IConditionDefinition){
        this.regex = this.translate(this.definition);
    }
    
    private translate(definition: IConditionDefinition): RegExp{
        let template = definition.template, item, idx=1;
        for(item of definition.items){
            if(item instanceof Array) item.name = 'modifier';
            let placeholder = Placeholder(item.name);
            if(!item) throw 'Invalid item in items definition';
            template = template.replace(placeholder.locator, placeholder.replacement(item));
            if(this.indicies[item.name] instanceof Array) (<number[]>this.indicies[item.name]).push(idx);
            else if(this.indicies[item.name] instanceof Number) {
                let array = [];
                array.push(this.indicies[item.name]);
                array.push(idx);
                this.indicies[item.name] = array;
            }
            else this.indicies[item.name] = idx;
            this.indicies[idx] = item.name;
            idx++;
        }
        template = template.replace(/\s+/g, '\\s+');
        return new RegExp(template, 'i');
    }
    
    public parse(statement: string, variables: IVariables): ConditionResult {
        let result = new ConditionResult, match = statement.match(this.regex), i;
        result.statement = match[0];
        for(i=1;i<match.length;i++){
            result.set(<string>this.indicies[i], match[i])
        }
        result.variables = variables;
        return result;
    }
    
    public perform(result: ConditionResult){
        result.pass = this.definition.rule(result.variable, result.comparative, result.variables);
        let mod;
        for(mod of result.modifier){
            result.pass = mod.rule(result.pass, result.variable, result.comparative, result.variables);
        }
        return result.pass;
    }
}