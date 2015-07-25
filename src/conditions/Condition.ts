import Placeholder from '../Placeholders';
import ConditionResult from './ConditionResult';
import IConditionIndices from './IConditionIndices';
import IConditionDefinition from './IConditionDefinition';
import IVariables from '../IVariables';
import Command from '../Command';
import {Modifier} from '../Modifiers'
import '../Extensions';

export default class Condition {
    private regex: RegExp;
    private indicies: IConditionIndices = {};
    private template: string;
    private items: Array<string | Modifier[]>;
    private rule: (variable: string, comparative: string | string[], variables: IVariables) => boolean;
    constructor(private definition: IConditionDefinition){
        if(!definition) throw 'Attempted to instatiate condition without a definition';
        this.regex = this.translate(this.definition);
        this.template = definition.template;
        this.items = definition.items;
        this.rule = definition.rule;
    }
    
    private translate(definition: IConditionDefinition): RegExp{
        let template = definition.template, item: (string | Modifier[]), name: string, idx=1;
        for(item of definition.items){
            if(!item) throw 'Invalid item in items definition';
            if(item instanceof Array) name = 'modifier';
            else name = <string>item;
            let placeholder = Placeholder(name);
            template = template.replace(placeholder.locator, placeholder.replacement(item instanceof Array ? item : null));
            if(this.indicies[name] instanceof Array) (<number[]>this.indicies[name]).push(idx);
            else if(!isNaN(<any>this.indicies[name])) {
                let array = [];
                array.push(this.indicies[name]);
                array.push(idx);
                this.indicies[name] = array;
            }
            else this.indicies[name] = idx;
            this.indicies[idx] = name;
            idx++;
        }
        template = template.replace(/\s+/g, '\\s+');
        return new RegExp(template, 'i');
    }
    
    private parse(command: Command): ConditionResult {
        let result = new ConditionResult(), match = command.statement.match(this.regex), i, modifier: Modifier;
        result.statement = match[0];
        for(i=1;i<match.length;i++){
            if(this.items[i-1] instanceof Array){
                for(modifier of <Modifier[]>this.items[i-1]){
                    if(modifier.matches(match[i])) result.set(<string>this.indicies[i], modifier);
                }
            }
            else result.set(<string>this.indicies[i], match[i])
        }
        result.variables = command.scope.variables;
        return result;
    }
    
    public perform(command: Command): boolean{
        let parsed = this.parse(command); 
        parsed.pass = this.rule(parsed.variable, parsed.comparative, parsed.variables);
        let mod: Modifier;
        for(mod of <Modifier[]>parsed.modifier){
            if(mod.definition.rule(parsed.pass, parsed.variable, parsed.comparative, parsed.variables)) return true;
        }
        return false;
    }
    
    public matches(statement: string){
        return this.regex.test(statement);
    }
}