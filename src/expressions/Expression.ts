import Placeholder from '../Placeholders';
import ExpressionResult from './ExpressionResult';
import IExpressionIndices from './IExpressionIndices';
import IExpressionDefinition from './IExpressionDefinition';
import IVariables from '../IVariables';
import Command from '../Command';
import {Modifier} from '../Modifiers'
import Value from '../Value';
import '../Extensions';

export default class Expression {
    private regex: RegExp;
    private indicies: IExpressionIndices = {};
    private template: string;
    private items: Array<string | Modifier[]>;
    private rule: (command: Command, values: Value[], variables: IVariables) => any;
    constructor(private definition: IExpressionDefinition){
        if(!definition) throw 'Attempted to instatiate expression without a definition';
        this.regex = this.translate(this.definition);
        this.template = definition.template;
        this.items = definition.items;
        this.rule = definition.rule;
    }
    
    private translate(definition: IExpressionDefinition): RegExp{
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
        template = template.replace(/\s+/g, '(?:\\b|\\s+)');
        return new RegExp(template, 'i');
    }
    
    private parse(command: Command): ExpressionResult {
        let result = new ExpressionResult(), match = command.statement.match(this.regex), i, modifier: Modifier, modNumber: number = -1;
        result.statement = match[0];
        for(i=1;i<match.length;i++){
            if(this.items[i-1] instanceof Array){
                modNumber++;
                for(modifier of <Modifier[]>this.items[i-1]){
                    if(modifier.matches(match[i])) result.set(<string>this.indicies[i], modifier, modNumber);
                }
            }
            else result.set(<string>this.indicies[i], match[i])
        }
        result.variables = command.scope.variables;
        return result;
    }
    
    public evaluate(command: Command): any{
        let parsed = this.parse(command);
        parsed.pass = this.rule(command, parsed.value, parsed.variables);
        let index: number;
        for(index of this.definition.modOrder){
            if(parsed.modifier[index]) parsed.pass = parsed.modifier[index].definition.rule(parsed.pass, parsed.value, parsed.variables);
        }
        return parsed.pass;
    }
    
    public matches(statement: string){
        return this.regex.test(statement);
    }
}