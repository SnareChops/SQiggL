import {ParserOptions, ScopedVariables} from '../parser';
import {DSLExpressionTree} from '../dsl';
import {ExpressionResult} from '../expressions';



export class ExpressionTreeParser{
    constructor(private options: ParserOptions){}

    public parse(dsl: DSLExpressionTree, variables: ScopedVariables): ExpressionResult{

        return null;
    }
}