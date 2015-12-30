var expressions_1 = require('../expressions');
/**
 * The lexer responsible for all Expression DSL generation.
 *
 * @internal
 */
var ExpressionLexer = (function () {
    /**
     * Creates a new instance of ExpressionLexer
     *
     * @internal
     * @param options {LexerOptions} - The {@link LexerOptions} for DSL generation.
     * @param expressions {Expression[]} - The list of known expressions for DSL generation.
     */
    function ExpressionLexer(options, expressions) {
        this.options = options;
        this.expressions = expressions;
    }
    /**
     * Walks the "Parts" of an expression comparing against known Expression templates
     * and rules them out one-by-one until a match is found.
     * **WARNING!** This method is **very** fragile.
     *
     * Rules: *rules are documented here and then referenced in the below method.*
     *
     * - Rule L1: If the template declares a local variable, save the variable and continue
     *   matching. if the match succeeds then set the local variable on the DSL.
     *
     * - Rule L2: Local variables once found and saved should be spliced from the clone.
     *   This prevents them from being confused with values in the outputted DSL.
     *
     * - Rule J1: If the template declares a joiner, save the joiner and continue matching.
     *   If the match succeeds then set the joiner on the DSL.
     *
     * - Rule J2: Once found and saved Joiners should be spliced from the clone.
     *   This prevents them from being confused with values in the outputted DSL.
     *
     * - Rule V1: If the template declares a VALUE then advance the indexes to the next parts.
     *   Values can't be matched against the template since they are user defined.
     *
     * - Rule S1: If the template declares a SPACE then compare the current item in the clone
     *   with the SPACE. If they are not equal then NO MATCH. Set isMatch to false and break the
     *   loop to try the next expression.
     *
     * - Rule S2: Successful SPACE matches should remove the SPACE from the clone to prevent
     *   it from being confused with the values in the outputted DSL.
     *
     * - Rule M1: Modifiers in expressions are optional, when searching for a modifier, if one is not found
     *   then move to the next part of the template and compare the same "Part" against that.
     *
     * - Rule M2: Modifiers that are directly before operators *may* have an optional space. If a space is found
     *   in the "Part" then splice out the space and compare the next "Part" against the operator.
     *
     * - Rule M3: Due to rule M2, if a Modifier is found check the length of the Modifier
     *   against the length of the "Part". Splice out the "Part" completely if the lengths
     *   are equal, else remove only the characters that represent the Modifier directly
     *
     * - Rule M4: NO LONGER A RULE!! If an operator has already been found in the template and a modifier was not
     *   matched then move to the next "Part" of the clone. This is a side effect of rule M3
     *
     * - Rule M5: If a modifier is successfully matched then inject it into the clone for
     *   eventual output in the DSL.
     *
     * - Rule O1: If an operator is declared in the template compare the "Part" against the
     *   operator. match only the same amount of characters as a modifier may follow the
     *   operator in the same "Part".
     *
     * - Rule O2: If rule O1 fails then NO MATCH. Set isMatch to false and break the loop and
     *   try the next expression.
     *
     * - Rule O3: If the operator and the "Part" are not the same length then splice out the
     *   operator from the "Part" leaving what remains. This is because a modifier may occupy
     *   the same "Part" and that should be matched in the next cycle.
     *
     * - Rule O4: NO LONGER A RULE!! If after applying Rule O3 the remaining "Part" is an empty string then
     *   splice out the "Part" from the clone.
     *
     * - Rule O5: If rule O3 doesn't apply, remove the "Part" from the clone. This prevents
     *   it from being confused with the values in the output DSL.
     *
     * - If no matching expression is found then throw an error.
     *
     * @internal
     * @param dsl {DSLExpression} - The DSL to which to append the found DSLExpression
     * @param parts {string} - The expression "Parts" as found in the replacement or command
     * @returns {DSLExpression} - The appended DSLExpression with all found expression properties.
     */
    ExpressionLexer.prototype.invoke = function (dsl, parts) {
        var expression, pidx, eidx, foundOrderedMod, foundIdentifier, clone, isMatch, operatorResolved, localVariable, joiner;
        for (var _i = 0, _a = this.expressions; _i < _a.length; _i++) {
            expression = _a[_i];
            // Set initial state for matching
            pidx = 0;
            eidx = 0;
            isMatch = true; // Assume is a match until found otherwise
            operatorResolved = false;
            clone = parts.slice(0); // Clone the array to protect original from modifications
            localVariable = null;
            joiner = null;
            while (eidx < expression.template.length) {
                var ePart = expression.template[eidx];
                if (ePart === expressions_1.LOCALVARIABLE) {
                    /* Rule: L1 */
                    localVariable = clone[pidx];
                    /* Rule: L2 */
                    clone.splice(pidx, 1);
                    eidx++;
                }
                else if (ePart === expressions_1.JOINER) {
                    /* Rule: J1 */
                    joiner = clone[pidx];
                    /* Rule: J2 */
                    clone.splice(pidx, 1);
                    eidx++;
                }
                else if (ePart === expressions_1.VALUE) {
                    /* Rule: V1 */
                    eidx++;
                    pidx++;
                }
                else if (ePart === expressions_1.SPACE) {
                    if (clone[pidx] !== ePart) {
                        /* Rule: S1 */
                        isMatch = false;
                        break;
                    }
                    /* Rule: S2 */
                    clone.splice(pidx, 1);
                    eidx++;
                }
                else if (Array.isArray(ePart)) {
                    _b = this.compareOrderedModifier(clone[pidx], ePart), foundIdentifier = _b[0], foundOrderedMod = _b[1];
                    if (!foundIdentifier) {
                        eidx++;
                        continue;
                    }
                    /* Rule: M5 */
                    clone.splice(pidx, 0, foundOrderedMod);
                    pidx++;
                    if (clone[pidx].length === foundIdentifier.length) {
                        /* Rule: M3 */
                        clone.splice(pidx, 1);
                    }
                    else {
                        /* Rule: M3 */
                        clone.splice(pidx, 1, clone[pidx].slice(foundIdentifier.length));
                    }
                    eidx++;
                }
                else {
                    if (clone[pidx] === expressions_1.SPACE && Array.isArray(expression.template[eidx - 1])) {
                        /* Rule: M2 */
                        clone.splice(pidx, 1);
                    }
                    /* Rule: O1 */
                    if (ePart !== clone[pidx].slice(0, ePart.length)) {
                        /* Rule: O2 */
                        isMatch = false;
                        break;
                    }
                    if (ePart.length !== clone[pidx].length) {
                        /* Rule: O3 */
                        clone.splice(pidx, 1, clone[pidx].slice(ePart.length, clone[pidx].length));
                    }
                    else {
                        /* Rule: O5 */
                        clone.splice(pidx, 1);
                    }
                    eidx++;
                }
            }
            if (isMatch) {
                /* Rule: L1 */
                if (!!localVariable)
                    dsl.local = localVariable;
                /* Rule: J1 */
                if (!!joiner)
                    dsl.joiner = joiner;
                dsl.expression = expression;
                dsl.values = clone.filter(function (x) { return typeof x === 'string'; });
                dsl.modifiers = this.sortAndExtractModifiers(clone.filter(function (x) { return typeof x === 'object'; }));
                break;
            }
        }
        if (!isMatch)
            throw new Error("SQiggLLexerError: Unable to determine expression type of '" + parts.join('') + "'");
        return dsl;
        var _b;
    };
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
    ExpressionLexer.prototype.compareOrderedModifier = function (part, ePart) {
        var ord, key, identifier;
        for (var _i = 0; _i < ePart.length; _i++) {
            ord = ePart[_i];
            for (var _a = 0, _b = Object.keys(ord); _a < _b.length; _a++) {
                key = _b[_a];
                for (var _c = 0, _d = ord[key].identifiers; _c < _d.length; _c++) {
                    identifier = _d[_c];
                    if (part.length >= identifier.length && identifier === part.slice(0, identifier.length)) {
                        // match
                        return [identifier, ord];
                    }
                }
            }
        }
        return [null, null];
    };
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
    ExpressionLexer.prototype.sortAndExtractModifiers = function (ordered) {
        ordered = ordered.sort(function (a, b) {
            var aKey, bKey, key;
            for (key in a) {
                if (a.hasOwnProperty(key))
                    aKey = parseInt(key);
            }
            for (key in b) {
                if (b.hasOwnProperty(key))
                    bKey = parseInt(key);
            }
            return aKey < bKey ? -1 : 1;
        });
        return ordered.map(function (x) {
            var key;
            for (key in x) {
                if (x.hasOwnProperty(key))
                    return x[key];
            }
        });
    };
    return ExpressionLexer;
})();
exports.ExpressionLexer = ExpressionLexer;
