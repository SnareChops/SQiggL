import {Action} from '../actions';
import {LexerOptions} from '../lexer';
import {DSLCommand, DSLCommandExpressionTree} from '../dsl';
import {ExpressionLexer} from './expression.lexer';
import {ExpressionTreeLexer} from "./expression.tree.lexer";
import {Expression} from '../expressions';
import {Conjunction} from '../conjunctions';
import {SQiggLError} from '../error';

/**
 * The lexer responsible for all DSL generation of Command statements
 *
 * @internal
 */
export class CommandLexer{

    /**
     * Creates a new instance of CommandLexer
     *
     * @internal
     * @param options {LexerOptions} - The {@link LexerOptions} used for DSL generation.
     * @param actions {Action[]} - List of all known actions for DSL generation.
     * @param expressions {Expression[]} - List of all known expressions for DSL generation.
     * @param conjunctions {Conjunction[]} - List of all known conjunctions for DSL generation.
     */
    constructor(private options: LexerOptions, private actions: Action[], private expressions: Expression[], private conjunctions: Conjunction[]){}

    /**
     * Search for a matching action in the command and return a DSLCommand
     *
     * As a rule all commands must start with an {@link Action} as the first "Part".
     * If an {@link Action} is not found, throw a No Action error
     *
     * - If the action has more that one "Part" then it must have an expression.
     *   Splice off the first two parts from the command, then check if it has more
     *   than one "Part".
     *   - If more than one "Part" then pass the reduced "Parts" to the {@link ExpressionLexer}
     *     and set the DSL equal to the now appended DSL with expression.
     *   - If only one "Part" then set the "Part" as the only value and expression to null.
     *     This is considered a variable and will be attempted to be resolved in the parser
     *     later.
     *
     * @internal
     * @param input {string}
     * @param parts {string[]} - The "Parts" of the input. {@see Lexer.extractParts} for more details on the definition of a "Part".
     * @returns {DSLCommand}
     */
    public invoke(input: string, parts: string[]): DSLCommand{
        const potential = this.actions.map(x => x.key.toLowerCase()).indexOf(parts[0].toLowerCase());
        if(potential < 0) throw SQiggLError('LC1000', `Commands require the first word to be a known action. ${parts[0]} is not a recognized action.`);
        let dsl = this.generateCommandDSL(this.actions[potential], input);
        if(parts.length > 1) {
            parts.splice(0, 2);
            if(parts.length > 1) {
                dsl.expressions = new ExpressionTreeLexer(this.options, this.expressions, this.conjunctions).invoke<DSLCommandExpressionTree>(parts);
            } else {
                dsl.expressions = null;
                dsl.literalValue = parts[0];
            }
        }
        return dsl;
    }

    /**
     * Create a DSL command from the matching Action definition
     *
     * @internal
     * @param definition {Action}
     * @param value {string}
     * @returns {DSLCommand}
     */
    private generateCommandDSL(definition: Action, value: string): DSLCommand{
        return <DSLCommand>{literal: value, action: definition};
    }

    /**
     * Clean and prepare the input for parsing
     *
     * @internal
     * @param input {string}
     * @returns {string}
     */
    public static cleanStringForLexing(input: string): string{
        return input.replace(/\s+/g, ' ').trim();
    }
}