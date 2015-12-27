import {LexerOptions} from '../lexer';
import {Expression, OrderedModifier, SPACE, VALUE, LOCALVARIABLE, JOINER} from '../expressions';
import {DSLExpression} from '../dsl';
import {Modifier} from '../modifiers';

/**
 * The lexer responsible for all Expression DSL generation.
 *
 * @internal
 */
export class ExpressionLexer{

    /**
     * Creates a new instance of ExpressionLexer
     *
     * @internal
     * @param options {LexerOptions} - The {@link LexerOptions} for DSL generation.
     * @param expressions {Expression[]} - The list of known expressions for DSL generation.
     */
    constructor(private options: LexerOptions, private expressions: Expression[]){}

    /**
     * Walks the "Parts" of an expression comparing against known Expression templates
     * and rules them out one-by-one until a match is found.
     * **WARNING!** This method is **very** fragile.
     *
     * - Modifiers in expressions are optional, when searching for a modifier, if one is not found
     *   then move to the next part of the template and compare the same "Part" against that.
     *
     * - Modifiers that are directly before operators *may* have an optional space. If a space is found
     *   in the "Part" then splice out the space and compare the next "Part" against the operator.
     *
     * - If no matching expression is found then throw an error.
     *
     * @internal
     * @param dsl {DSLExpression} - The DSL to which to append the found DSLExpression
     * @param parts {string} - The expression "Parts" as found in the replacement or command
     * @returns {DSLExpression} - The appended DSLExpression with all found expression properties.
     */
    public invoke(dsl: DSLExpression, parts: string[]): DSLExpression{
        let expression: Expression,
            pidx: number,
            eidx: number,
            foundOrderedMod: OrderedModifier,
            foundIdentifier: string,
            clone: (string | OrderedModifier)[],
            isMatch: boolean,
            operatorResolved: boolean,
            localVariable: string,
            joiner: string;
        for(expression of this.expressions){
            // Set initial state for matching
            pidx = 0;
            eidx = 0;
            isMatch = true; // Assume is a match until found otherwise
            operatorResolved = false;
            clone = parts.slice(0); // Clone the array to protect original from modifications
            localVariable = null;
            joiner = null;
            let oops: number = 0;
            while(eidx < expression.template.length) {
                var ePart:string | OrderedModifier[] = expression.template[eidx];
                if(ePart === LOCALVARIABLE) {
                    localVariable = <string>clone[pidx];
                    clone.splice(pidx, 1);
                    eidx++;
                } else if(ePart === JOINER) {
                    joiner = <string>clone[pidx];
                    clone.splice(pidx, 1);
                    eidx++;
                } else if(ePart === VALUE) {
                    // Do nothing, can't match on values as they are user defined.
                    eidx++;
                    pidx++;
                } else if(ePart === SPACE){
                    if(<string>clone[pidx] !== ePart) {
                        isMatch = false;
                        break;
                    }
                    clone.splice(pidx, 1); // Remove the space as it is no longer needed for the match
                    eidx++;
                } else if(Array.isArray(ePart)){ // Modifier
                    [foundIdentifier, foundOrderedMod] = this.compareOrderedModifier(<string>clone[pidx], ePart);
                    if(!foundIdentifier) {
                        // Modifiers are optional, stay on same part, move to next ePart
                        eidx++;
                        if(operatorResolved) pidx++;
                        continue;
                    }
                    clone.splice(pidx, 0, foundOrderedMod);
                    pidx++;
                    clone.splice(pidx, 1, (<string>clone[pidx]).slice(foundIdentifier.length));
                    eidx++;
                } else {
                    if(clone[pidx] === SPACE && Array.isArray(expression.template[eidx-1])){
                        clone.splice(pidx, 1); // Modifiers may have an optional space between the modifier and the operator
                    }
                    if(ePart !== (<string>clone[pidx]).slice(0, ePart.length)){
                        isMatch = false;
                        break;
                    }
                    if(ePart.length !== (<string>clone[pidx]).length){
                        clone.splice(pidx, 1, (<string>clone[pidx]).slice(ePart.length, (<string>clone[pidx]).length));
                        if(clone[pidx] === '') clone.splice(pidx, 1);
                    } else {
                        clone.splice(pidx, 1);
                    }
                    eidx++;
                }
                if(oops++ > 100) throw new Error('OOPS Expression');
            }
            if(isMatch){
                if(!!localVariable) dsl.local = localVariable;
                if(!!joiner) dsl.joiner = joiner;
                dsl.expression = expression;
                dsl.values = clone.filter(x => typeof x === 'string');
                dsl.modifiers = this.sortAndExtractModifiers(<OrderedModifier[]>clone.filter(x => typeof x === 'object'));
                break;
            }
        }
        if(!isMatch) throw new Error(`SQiggLLexerError: Unable to determine expression type of '${parts.join('')}'`);
        return dsl;
    }

    /**
     * Compares the "Part" of the expression with the OrderedModifiers in this index of the
     * Expression template. This method will then return both the found identifier in the "Part"
     * and the matching OrderedModifier, or will return [null, null] if not found.
     *
     * {@see Lexer.extractParts} for the definition of a "Part".
     *
     * @internal
     * @param part {string} - The "Part" of the found expression to compare.
     * @param ePart {OrderedModifier[]} - The OrderedModifier collection to compare the "Part" against.
     * @returns {{string, OrderedModifier]} - A tuple of the identifier and matching OrderedModifier found.
     */
    private compareOrderedModifier(part: string, ePart: OrderedModifier[]): [string, OrderedModifier] {
        let ord: OrderedModifier,
            key: string,
            identifier: string;
        for(ord of ePart){
            for(key of Object.keys(ord)){
                for(identifier of ord[key].identifiers){
                    if(part.length >= identifier.length && identifier === part.slice(0, identifier.length)){
                        // match
                        return [identifier, ord];
                    }
                }
            }
        }
        return [null, null];
    }

    /**
     * First sorts the modifiers based on the numbered index property, this is
     * the execution order for the modifiers defined in a Modifier template.
     * The now ordered modifiers are now extracted from the list in order
     * and returned. This is used in the parseReplacement function to create
     * the list of *found* modifiers in the expression that is currently being
     * evaluated.
     *
     * @internal
     * @param ordered: {OrderedModifier[]}
     * @returns {Modifier[]}
     */
    private sortAndExtractModifiers(ordered: OrderedModifier[]): Modifier[]{
        ordered = ordered.sort((a, b) => {
            let aKey: number, bKey: number, key: string;
            for(key in a){
                if(a.hasOwnProperty(key)) aKey = parseInt(key);
            }
            for(key in b){
                if(b.hasOwnProperty(key)) bKey = parseInt(key);
            }
            return aKey < bKey ? -1 : 1;
        });
        return <Modifier[]>ordered.map((x: OrderedModifier) => {
            let key: string;
            for(key in x){
                if(x.hasOwnProperty(key)) return x[key];
            }
        });
    }
}