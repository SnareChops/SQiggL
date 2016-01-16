import {DSLCommand} from '../dsl';
import {Action} from '../actions';
import {validateExpressionTree} from './expression.tree.validator';
import {SQiggLError} from '../error';

export function validateCommand(dsl: DSLCommand){
    if(!!dsl.action && (!!dsl.expressions || !!dsl.literalValue)) return;
    else throw SQiggLError('VC300', `Invalid command found`, true);
}