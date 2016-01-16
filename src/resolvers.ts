import {ExpressionValue} from './expressions';
import {ParserOptions} from './parser';
import {DSL} from './dsl';
import {ScopedVariables} from './variables';
import {Parser} from './parser';
import {DSLValue} from './dsl';
import {DSLExpression} from './dsl';
import {ExpressionParser} from './parsers/expression.parser';
import {SQiggLError} from './error';
import {SQiggLValue} from './variables';

export type ScopeResolver = (additionalVariables?: {[key: string]: ExpressionValue}) => string;

export function getScopeResolver(options: ParserOptions, scope: DSL[], variables: ScopedVariables): ScopeResolver{
    return (additionalVariables?: {[key: string]: ExpressionValue}) => {
        const parser = new Parser(options);
        variables.concat(additionalVariables);
        return parser.parse(scope, variables);
    }
}

/**
 * Resolves a value as either a literal string, literal number,
 * or a variable value and then returns that value as a string.
 *
 * - If the value is a DSLExpression, parse the expression and return the result.
 * - If the value is an array, return it unchanged
 * - If the value starts with a quote, then it must be a string literal.
 *   Strip the quotes and return the literal value.
 * - If the value is a number, then it must be a literal number.
 *   Return the number unchanged.
 * - If a variable has the same name as the value, then resolve the
 *   value to the variable and return the value of the variable.
 * - Throw an error if none of the above.
 *
 * @internal
 * @param value {DSLValue} - The value to resolve.
 * @param variables {ScopedVariables} - The list of known variables for this scope.
 * @param options {ParserOptions} - The ParserOptions to use if an expression is found as a value.
 * @param suppressUndefinedVariableError {boolean} - Do not throw an error if a value cannot be resolved.
 * @returns {string} - The resolved value.
 */
export function resolveValue(value: DSLValue, variables: ScopedVariables, options: ParserOptions, suppressUndefinedVariableError: boolean = false): SQiggLValue{
    if(typeof value === 'object' && !!(<DSLExpression>value).expression) return new ExpressionParser(options).parse(<DSLExpression>value, variables).value;
    if(Array.isArray(value)) return value;
    if(value[0] === `'` || value[0] === `"`) return (<string>value).slice(1, (<string>value).length - 1);
    if(!isNaN(+value)) return value.toString();
    if(variables.has(<string>value)) return variables.get(<string>value);
    if(!suppressUndefinedVariableError) throw SQiggLError('P1000', `${value} is not a defined variable in this scope`);
}