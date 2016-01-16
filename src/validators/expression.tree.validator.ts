import {DSLExpressionTree, DSLExpression} from '../dsl';
import {Conjunction} from '../conjunctions';
import {SQiggLError} from '../error';
import {validateExpression} from './expression.validator';

export function validateExpressionTree(dsl: DSLExpressionTree){
    if(!!dsl.branches) validateBranches(dsl.branches);
    if(dsl.conjunctions.length !== dsl.branches.length - 1) throw SQiggLError('VT3000', `Incorrect number of conjunctions to expressions in statement.`);

    function validateBranches(branches: DSLExpression[]){
        for(var branch of branches){
            validateExpression(branch);
        }
    }
}