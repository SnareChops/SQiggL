import {ScopedVariables} from '../variables';
import {DSLExpression} from '../dsl';
import {Expression} from '../expressions';
import {SQiggLError} from '../error';
import {ExpressionValue} from '../expressions';
import {DSLValue} from '../dsl';

export function validateExpression(dsl: DSLExpression): void{
    if(!!dsl.expression) validateExp(dsl.expression);
    if(!!dsl.local) validateLocal(dsl.local);
    if(!!dsl.values) validateValues(dsl.values);

    /**
     * Validates an expression in a DSLExpression.
     *
     * Rules:
     * - Must have a value that is of type Expression
     *
     * @param expression {Expression}
     */
    function validateExp(expression: Expression): void{
        if(!expression.template || !expression.rule){
            throw SQiggLError('VE300', `Invalid Expression found in DSL`, true);
        }
    }

    /**
     * Validates a local variable identifier
     *
     * Rules:
     * - Must not start with a number
     *
     * @param local {string}
     */
    function validateLocal(local: string): void{
        //noinspection JSComparisonWithNaN
        if(parseInt(local) !== NaN) throw SQiggLError('VE3000', `A local variable identifier cannot start with a number. Found ${local}`);
    }

    /**
     * Validates an expression value array.
     *
     * Rules:
     * - Each item must be a string, number, boolean, array, or DSLExpression
     * - If an item is an array, it's contents must be a string, number, or boolean
     *
     * @param values {ExpressionValue[]}
     */
    function validateValues(values: DSLValue[]){
        for(var value of values){
            if(typeof value !== 'string' || typeof value !== 'number' || typeof value !== 'boolean'){
                if(Array.isArray(value)){
                    for(var item of value){
                        if(typeof item !== 'string' || typeof value !== 'number' || typeof value !== 'boolean'){
                            throw SQiggLError('VE3001', `Invalid value found in ${value.toString()}: ${item}.`);
                        }
                    }
                } else {
                    if(!(<DSLExpression>value).expression){
                        throw SQiggLError('VE3002', `Invalid value found ${value}.`);
                    }
                }
            }
        }
    }
}