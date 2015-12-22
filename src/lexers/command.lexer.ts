import {Action} from '../actions';
import {LexerOptions} from '../lexer';
import {DSLCommand} from '../dsl';

export class CommandLexer{
    constructor(private options: LexerOptions, private actions: Action[]){}

    /**
     * Search for a matching action in the command and return a DSLCommand
     *
     * As a rule all commands must start with an action as the first "word".
     * If a command is not found, throw a No Action error
     *
     * @param input {string}
     * @returns {DSLCommand}
     */
    public invoke(input: string): DSLCommand{
        input = this.cleanInput(input);
        const first = input.split(' ')[0];
        const potential = this.actions.map(x => x.key.toLowerCase()).indexOf(first.toLowerCase());
        if(potential < 0) throw new Error('SQiggL No Action Error: Commands require the first word to be a known action.');
        return this.generateCommandDSL(this.actions[potential], input);
    }

    /**
     * Create a DSL command from the matching Action definition
     * @param definition {Action}
     * @param value {string}
     * @returns {DSLCommand}
     */
    private generateCommandDSL(definition: Action, value: string): DSLCommand{
        return <DSLCommand>{literal: value, action: definition};
    }

    /**
     * Clean and prepare the input for parsing
     * @param input {string}
     * @returns {string}
     */
    private cleanInput(input: string): string{
        return input.replace(/\s+/g, ' ').trim();
    }
}