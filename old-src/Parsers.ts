import IParserDefinition from './parsers/IParserDefinition';
import Parser from './parsers/Parser';
import {Runner, ActionRunner} from './Runners';

let SQiggLParserDefinition: IParserDefinition = {
    runners: [ActionRunner]
}
export let SQiggLParser = new Parser(SQiggLParserDefinition); 

export {default as IParserDefinition} from './parsers/IParserDefinition';