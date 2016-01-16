import {CommandParser} from '../../src/parsers/command.parser';
import {DSLCommand, DSL, DSLText, DSLReplacement, DSLBooleanExpression, DSLIterableExpression, DSLCommandExpressionTree} from '../../src/dsl';
import {If, Else, For} from '../../src/actions';
import {GreaterThan, IterableOfUsing} from '../../src/expressions';
import {DEFAULT_PARSER_OPTIONS} from '../../src/parser';
import {ScopedVariables} from '../../src/variables';

describe('CommandParser', () => {
    it('should correctly return a string in a StartingAction that is false', () => {
        const booleanExpression: DSLBooleanExpression = {literal: '12 > 13', expression: GreaterThan, values: ['12', '13']};
        const expressionTree: DSLCommandExpressionTree = {branches: [booleanExpression]};
        const dsl: DSLCommand = {literal: 'if 12 > 13', action: If, expressions: expressionTree};
        const scope: DSL[] = [{text: 'Hello World'}];
        const result = new CommandParser(DEFAULT_PARSER_OPTIONS).parse(dsl, scope, new ScopedVariables());
        result.should.equal('');
    });

    it('should correctly return a string in a StartingAction that is true', () => {
        const booleanExpression: DSLBooleanExpression = {literal: '13 > 12', expression: GreaterThan, values: ['13', '12']};
        const expressionTree: DSLCommandExpressionTree = {branches: [booleanExpression]};
        const dsl: DSLCommand = {literal: 'if 13 > 12', action: If, expressions: expressionTree};
        const scope: DSL[] = [{text: 'Hello World'}];
        const result = new CommandParser(DEFAULT_PARSER_OPTIONS).parse(dsl, scope, new ScopedVariables());
        result.should.equal('Hello World');
    });

    it('should correctly return a string in a DependentAction', () => {
        const dsl: DSLCommand = {literal: 'else', action: Else};
        const scope: DSL[] = [{text: 'Merry Christmas'}];
        const result = new CommandParser(DEFAULT_PARSER_OPTIONS).parse(dsl, scope, new ScopedVariables());
        result.should.equal('Merry Christmas');
    });

    it('should correctly return a string for an IterableCommand', () => {
        const iterableExpression: DSLIterableExpression = {literal: 'cat of catTypes using \',\'', expression: IterableOfUsing, local: 'cat', values: [['hairy', 'furry', 'fuzzy']], joiner: '\',\''};
        const expressionTreeDSL: DSLCommandExpressionTree = {branches: [iterableExpression]};
        const commandDSL: DSLCommand = {literal: 'for cat of catTypes using \', \'', action: For, expressions: expressionTreeDSL};
        const textDSL: DSLText = {text: 'Hello '};
        const replacementDSL: DSLReplacement = {literal: 'cat', expressions: null};
        const scope: DSL[] = [textDSL, {replacement: replacementDSL}];
        const result: string = new CommandParser(DEFAULT_PARSER_OPTIONS).parse(commandDSL, scope, new ScopedVariables());
        result.should.equal('Hello hairy, Hello furry, Hello fuzzy');
    });
});