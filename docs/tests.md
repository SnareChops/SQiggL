# TOC
   - [Expressions](#expressions)
     - [Equal](#expressions-equal)
     - [GreaterThan](#expressions-greaterthan)
     - [LessThan](#expressions-lessthan)
     - [IsNull](#expressions-isnull)
     - [LexicalGreaterThan](#expressions-lexicalgreaterthan)
     - [LexicalLessThan](#expressions-lexicallessthan)
     - [LengthGreaterThan](#expressions-lengthgreaterthan)
     - [LengthLessThan](#expressions-lengthlessthan)
     - [IsNaN](#expressions-isnan)
     - [Between](#expressions-between)
     - [Coalesce](#expressions-coalesce)
     - [IterableOf](#expressions-iterableof)
     - [VerboseTernary](#expressions-verboseternary)
     - [Ternary](#expressions-ternary)
   - [Modifiers](#modifiers)
     - [Not](#modifiers-not)
     - [OrEqual](#modifiers-orequal)
     - [LengthOrEqual](#modifiers-lengthorequal)
     - [BetweenOrEqual](#modifiers-betweenorequal)
   - [Actions](#actions)
     - [If](#actions-if)
     - [Unless](#actions-unless)
     - [Else](#actions-else)
     - [For](#actions-for)
   - [Conjunctions](#conjunctions)
     - [AndConjunction](#conjunctions-andconjunction)
     - [OrConjunction](#conjunctions-orconjunction)
   - [Resolvers](#resolvers)
   - [ExpressionLexer](#expressionlexer)
   - [ExpressionTreeLexer](#expressiontreelexer)
   - [VariableLexer](#variablelexer)
   - [CommandLexer](#commandlexer)
   - [Lexer](#lexer)
     - [options](#lexer-options)
     - [text](#lexer-text)
     - [replacement](#lexer-replacement)
     - [command](#lexer-command)
     - [comment](#lexer-comment)
     - [variable](#lexer-variable)
     - [scope](#lexer-scope)
     - [expressions](#lexer-expressions)
   - [ExpressionParser](#expressionparser)
     - [invoke](#expressionparser-invoke)
   - [ExpressionTreeParser](#expressiontreeparser)
   - [CommandParser](#commandparser)
   - [ReplacementParser](#replacementparser)
     - [invoke](#replacementparser-invoke)
   - [Parser](#parser)
     - [comments](#parser-comments)
     - [text](#parser-text)
     - [variable](#parser-variable)
   - [Scenarios](#scenarios)
     - [generic 'end'](#scenarios-generic-end)
   - [Full feature sweep: ](#full-feature-sweep-)
     - [if](#full-feature-sweep-if)
       - [is null](#full-feature-sweep-if-is-null)
       - [is not null](#full-feature-sweep-if-is-not-null)
       - [is !null](#full-feature-sweep-if-is-null)
       - [=](#full-feature-sweep-if-)
       - [==](#full-feature-sweep-if-)
       - [!=](#full-feature-sweep-if-)
       - [!==](#full-feature-sweep-if-)
       - [>](#full-feature-sweep-if-)
       - [>=](#full-feature-sweep-if-)
       - [!>](#full-feature-sweep-if-)
       - [!>=](#full-feature-sweep-if-)
       - [<](#full-feature-sweep-if-)
       - [<=](#full-feature-sweep-if-)
       - [!<](#full-feature-sweep-if-)
       - [!<=](#full-feature-sweep-if-)
       - [abc>](#full-feature-sweep-if-abc)
       - [abc>=](#full-feature-sweep-if-abc)
       - [!abc>](#full-feature-sweep-if-abc)
       - [!abc>=](#full-feature-sweep-if-abc)
       - [abc<](#full-feature-sweep-if-abc)
       - [abc<=](#full-feature-sweep-if-abc)
       - [!abc<](#full-feature-sweep-if-abc)
       - [!abc<=](#full-feature-sweep-if-abc)
       - [len>](#full-feature-sweep-if-len)
       - [len>=](#full-feature-sweep-if-len)
       - [!len>](#full-feature-sweep-if-len)
       - [!len>=](#full-feature-sweep-if-len)
       - [len<](#full-feature-sweep-if-len)
       - [len<=](#full-feature-sweep-if-len)
       - [!len<](#full-feature-sweep-if-len)
       - [!len<=](#full-feature-sweep-if-len)
       - [is NaN](#full-feature-sweep-if-is-nan)
       - [is not NaN](#full-feature-sweep-if-is-not-nan)
       - [is !NaN](#full-feature-sweep-if-is-nan)
       - [><](#full-feature-sweep-if-)
       - [>!<](#full-feature-sweep-if-)
       - [>=<](#full-feature-sweep-if-)
     - [unless](#full-feature-sweep-unless)
       - [is null](#full-feature-sweep-unless-is-null)
       - [is not null](#full-feature-sweep-unless-is-not-null)
       - [is !null](#full-feature-sweep-unless-is-null)
       - [=](#full-feature-sweep-unless-)
       - [==](#full-feature-sweep-unless-)
       - [!=](#full-feature-sweep-unless-)
       - [!==](#full-feature-sweep-unless-)
       - [>](#full-feature-sweep-unless-)
       - [>=](#full-feature-sweep-unless-)
       - [!>](#full-feature-sweep-unless-)
       - [!>=](#full-feature-sweep-unless-)
       - [<](#full-feature-sweep-unless-)
       - [<=](#full-feature-sweep-unless-)
       - [!<](#full-feature-sweep-unless-)
       - [!<=](#full-feature-sweep-unless-)
       - [abc>](#full-feature-sweep-unless-abc)
       - [abc>=](#full-feature-sweep-unless-abc)
       - [!abc>](#full-feature-sweep-unless-abc)
       - [!abc>=](#full-feature-sweep-unless-abc)
       - [abc<](#full-feature-sweep-unless-abc)
       - [abc<=](#full-feature-sweep-unless-abc)
       - [!abc<](#full-feature-sweep-unless-abc)
       - [!abc<=](#full-feature-sweep-unless-abc)
       - [len>](#full-feature-sweep-unless-len)
       - [len>=](#full-feature-sweep-unless-len)
       - [!len>](#full-feature-sweep-unless-len)
       - [!len>=](#full-feature-sweep-unless-len)
       - [len<](#full-feature-sweep-unless-len)
       - [len<=](#full-feature-sweep-unless-len)
       - [!len<](#full-feature-sweep-unless-len)
       - [!len<=](#full-feature-sweep-unless-len)
       - [is NaN](#full-feature-sweep-unless-is-nan)
       - [is not NaN](#full-feature-sweep-unless-is-not-nan)
       - [is !NaN](#full-feature-sweep-unless-is-nan)
       - [><](#full-feature-sweep-unless-)
       - [>!<](#full-feature-sweep-unless-)
       - [>=<](#full-feature-sweep-unless-)
     - [Ternaries](#full-feature-sweep-ternaries)
       - [Verbose Ternary](#full-feature-sweep-ternaries-verbose-ternary)
       - [Ternary](#full-feature-sweep-ternaries-ternary)
     - ["query with newlines"](#full-feature-sweep-query-with-newlines)
<a name=""></a>
 
<a name="expressions"></a>
# Expressions
<a name="expressions-equal"></a>
## Equal
should return true if expression is true.

```js
var result = expressions_1.Equal.rule(['13', '13']);
result.should.equal(true);
```

should return false if expression if false.

```js
var result = expressions_1.Equal.rule(['12', '13']);
result.should.equal(false);
```

<a name="expressions-greaterthan"></a>
## GreaterThan
should return true if expression is true.

```js
var result = expressions_1.GreaterThan.rule(['13', '12']);
result.should.equal(true);
```

should return false if expression is false.

```js
var result = expressions_1.GreaterThan.rule(['12', '13']);
result.should.equal(false);
```

<a name="expressions-lessthan"></a>
## LessThan
should return true if expression is true.

```js
var result = expressions_1.LessThan.rule(['12', '13']);
result.should.equal(true);
```

should return false if expression is false.

```js
var result = expressions_1.LessThan.rule(['13', '12']);
result.should.equal(false);
```

<a name="expressions-isnull"></a>
## IsNull
should return true if expression is true.

```js
var result = expressions_1.IsNull.rule([]);
result.should.equal(true);
```

should return false if expression is false.

```js
var result = expressions_1.IsNull.rule(['Hello']);
result.should.equal(false);
```

<a name="expressions-lexicalgreaterthan"></a>
## LexicalGreaterThan
should return true if expression is true.

```js
var result = expressions_1.LexicalGreaterThan.rule(['World', 'Hello']);
result.should.equal(true);
```

should return false if expression is false.

```js
var result = expressions_1.LexicalGreaterThan.rule(['Hello', 'World']);
result.should.equal(false);
```

<a name="expressions-lexicallessthan"></a>
## LexicalLessThan
should return true if expression is true.

```js
var result = expressions_1.LexicalLessThan.rule(['Hello', 'World']);
result.should.equal(true);
```

should return false if expression is false.

```js
var result = expressions_1.LexicalLessThan.rule(['World', 'Hello']);
result.should.equal(false);
```

<a name="expressions-lengthgreaterthan"></a>
## LengthGreaterThan
should return true if expression is true.

```js
var result = expressions_1.LengthGreaterThan.rule(['Dragon', 3]);
result.should.equal(true);
```

should return false if expression is false.

```js
var result = expressions_1.LengthGreaterThan.rule(['Cat', 6]);
result.should.equal(false);
```

<a name="expressions-lengthlessthan"></a>
## LengthLessThan
should return true if expression is true.

```js
var result = expressions_1.LengthLessThan.rule(['Cat', 6]);
result.should.equal(true);
```

should return false if expression is false.

```js
var result = expressions_1.LengthLessThan.rule(['Dragon', 3]);
result.should.equal(false);
```

<a name="expressions-isnan"></a>
## IsNaN
should return true if expression is true.

```js
var result = expressions_1.IsNaN.rule(['Hello']);
result.should.equal(true);
```

should return false if expression is false.

```js
var result = expressions_1.IsNaN.rule(['12']);
result.should.equal(false);
```

<a name="expressions-between"></a>
## Between
should return true if expression is true.

```js
var result = expressions_1.Between.rule(['12', '10', '15']);
result.should.equal(true);
```

should return false if expression is false.

```js
var result = expressions_1.Between.rule(['10', '12', '15']);
result.should.equal(false);
```

<a name="expressions-coalesce"></a>
## Coalesce
should return the first value if it is not null.

```js
var result = expressions_1.Coalesce.rule(['Hello', 'World']);
result.should.equal('Hello');
```

should return the second value if the first is null.

```js
var result = expressions_1.Coalesce.rule([void 0, 'World']);
result.should.equal('World');
```

<a name="expressions-iterableof"></a>
## IterableOf
should return an iterable result.

```js
var result = expressions_1.IterableOfUsing.rule([['hairy', 'furry', 'fuzzy']]);
result[0].should.equal('hairy');
result[1].should.equal('furry');
result[2].should.equal('fuzzy');
```

<a name="expressions-verboseternary"></a>
## VerboseTernary
should return the second value if true.

```js
var result = expressions_1.VerboseTernary.rule([true, 'Hello', 'World']);
result.should.equal('Hello');
```

should return the third value if false.

```js
var result = expressions_1.VerboseTernary.rule([false, 'Hello', 'World']);
result.should.equal('World');
```

<a name="expressions-ternary"></a>
## Ternary
should return the second value if true.

```js
var result = expressions_1.Ternary.rule([true, 'Hello', 'World']);
result.should.equal('Hello');
```

should return the third value if false.

```js
var result = expressions_1.Ternary.rule([false, 'Hello', 'World']);
result.should.equal('World');
```

<a name="modifiers"></a>
# Modifiers
<a name="modifiers-not"></a>
## Not
should negate a true value.

```js
modifiers_1.Not.rule(true).should.equal(false);
```

should negate a false value.

```js
modifiers_1.Not.rule(false).should.equal(true);
```

<a name="modifiers-orequal"></a>
## OrEqual
should return true if the prevResult is true.

```js
modifiers_1.OrEqual.rule(true, ['12', '13']).should.equal(true);
```

should return true if the prevResult is false and the values are equal.

```js
modifiers_1.OrEqual.rule(false, ['12', '12']).should.equal(true);
```

should return false if the prevResult is false and the values are not equal.

```js
modifiers_1.OrEqual.rule(false, ['12', '13']).should.equal(false);
```

<a name="modifiers-lengthorequal"></a>
## LengthOrEqual
should return true if the prevResult is true.

```js
modifiers_1.LengthOrEqual.rule(true, ['Cat', '6']).should.equal(true);
```

should return true if the prevResult is false and the values are of equal length.

```js
modifiers_1.LengthOrEqual.rule(false, ['Cat', '3']).should.equal(true);
```

should return false if the prevResult is false and the values are not of equal length.

```js
modifiers_1.LengthOrEqual.rule(false, ['Cat', '6']).should.equal(false);
```

<a name="modifiers-betweenorequal"></a>
## BetweenOrEqual
should return true if the prevResult is true.

```js
modifiers_1.BetweenOrEqual.rule(true, ['10', '12', '15']).should.equal(true);
```

should return true if the prevResult is false and the first value is equal to the second value.

```js
modifiers_1.BetweenOrEqual.rule(false, ['10', '10', '15']).should.equal(true);
```

should return true if the prevResult is false and the first values is equal to the third value.

```js
modifiers_1.BetweenOrEqual.rule(false, ['10', '5', '10']).should.equal(true);
```

should return false if the prevResult is false the the first value is not equal to either of the other values.

```js
modifiers_1.BetweenOrEqual.rule(false, ['10', '12', '15']).should.equal(false);
```

<a name="actions"></a>
# Actions
<a name="actions-if"></a>
## If
should return the inner scope if the expression is true.

```js
var dsl = [{ text: 'Hello World' }];
var result = actions_1.If.rule({ value: true }, null, resolvers_1.getScopeResolver(parser_1.DEFAULT_PARSER_OPTIONS, dsl, variables));
result.should.equal('Hello World');
```

should return null if the expression is false.

```js
var dsl = [{ text: 'Hello World' }];
var result = actions_1.If.rule({ value: false }, null, resolvers_1.getScopeResolver(parser_1.DEFAULT_PARSER_OPTIONS, dsl, variables));
should(result).equal(null);
```

<a name="actions-unless"></a>
## Unless
should return null if the expression is true.

```js
var dsl = [{ text: 'Hello World' }];
var result = actions_1.Unless.rule({ value: true }, null, resolvers_1.getScopeResolver(parser_1.DEFAULT_PARSER_OPTIONS, dsl, variables));
should(result).equal(null);
```

should return the inner scope if the expression is false.

```js
var dsl = [{ text: 'Hello World' }];
var result = actions_1.Unless.rule({ value: false }, null, resolvers_1.getScopeResolver(parser_1.DEFAULT_PARSER_OPTIONS, dsl, variables));
result.should.equal('Hello World');
```

<a name="actions-else"></a>
## Else
should return the inner scope if the expression is true.

```js
var dsl = [{ text: 'Hello World' }];
var result = actions_1.Else.rule({ value: true }, null, resolvers_1.getScopeResolver(parser_1.DEFAULT_PARSER_OPTIONS, dsl, variables));
result.should.equal('Hello World');
```

should return the inner scope if the expression is false.

```js
var dsl = [{ text: 'Hello World' }];
var result = actions_1.Else.rule({ value: false }, null, resolvers_1.getScopeResolver(parser_1.DEFAULT_PARSER_OPTIONS, dsl, variables));
result.should.equal('Hello World');
```

<a name="actions-for"></a>
## For
should return the inner scope as many times as there are values and combining them with the joiner.

```js
var dsl = [{ text: 'Hello World' }];
var result = actions_1.For.rule({ value: ['1', '2', '3'], iterable: { local: 'var', joiner: ',' } }, variables, resolvers_1.getScopeResolver(parser_1.DEFAULT_PARSER_OPTIONS, dsl, variables));
result.should.equal('Hello World, Hello World, Hello World');
```

should iterate the inner scope and correctly replace the inner values using the expressionResult.

```js
var dsl = [{ text: 'Iteration ' }, { replacement: { literal: 'var' } }];
var result = actions_1.For.rule({ value: ['1', '2', '3'], iterable: { local: 'var', joiner: ',' } }, variables, resolvers_1.getScopeResolver(parser_1.DEFAULT_PARSER_OPTIONS, dsl, variables));
result.should.equal('Iteration 1, Iteration 2, Iteration 3');
```

<a name="conjunctions"></a>
# Conjunctions
<a name="conjunctions-andconjunction"></a>
## AndConjunction
should return false if the first expressionResult is false.

```js
var result = conjunctions_1.AndConjunction.rule([false, true]);
result.should.equal(false);
```

should return false if the second expressionResult is false (and the first is true).

```js
var result = conjunctions_1.AndConjunction.rule([true, false]);
result.should.equal(false);
```

should return true if both expressionResults are true.

```js
var result = conjunctions_1.AndConjunction.rule([true, true]);
result.should.equal(true);
```

<a name="conjunctions-orconjunction"></a>
## OrConjunction
should return false if both expressionResults are false.

```js
var result = conjunctions_1.OrConjunction.rule([false, false]);
result.should.equal(false);
```

should return true if the first expressionResult is true.

```js
var result = conjunctions_1.OrConjunction.rule([true, false]);
result.should.equal(true);
```

should return true if the first expressionResult is false and the second is true.

```js
var result = conjunctions_1.OrConjunction.rule([false, true]);
result.should.equal(true);
```

<a name="resolvers"></a>
# Resolvers
should correctly output a string literal using single quotes.

```js
var result = resolvers_1.resolveValue('\'Hello\'', void 0, parser_1.DEFAULT_PARSER_OPTIONS);
result.should.equal('Hello');
```

should correctly output a string literal using double quotes.

```js
var result = resolvers_1.resolveValue('"Hello"', void 0, parser_1.DEFAULT_PARSER_OPTIONS);
result.should.equal('Hello');
```

should correctly output a number literal.

```js
var result = resolvers_1.resolveValue('12', void 0, parser_1.DEFAULT_PARSER_OPTIONS);
result.should.equal('12');
```

should correctly output a found variable value.

```js
var result = resolvers_1.resolveValue('cat', new variables_1.ScopedVariables({ cat: 'Dragon' }), parser_1.DEFAULT_PARSER_OPTIONS);
result.should.equal('Dragon');
```

should throw an error if a variable value is undefined.

```js
(function () { return resolvers_1.resolveValue('cat', new variables_1.ScopedVariables({ dragon: 'Fish' }), parser_1.DEFAULT_PARSER_OPTIONS); }).should.throw('SQiggLError - P1000: cat is not a defined variable in this scope');
```

<a name="expressionlexer"></a>
# ExpressionLexer
should return a DSLExpression with a local if an expression contains a local variable.

```js
var parts = ['cat', ' ', 'of', ' ', 'catType', ' ', 'using', ' ', '\',\''];
var result = instance.invoke(parts);
result.local.should.equal('cat');
```

should return a DSLExpression with a joiner if an expression contains a joiner value.

```js
var parts = ['cat', ' ', 'of', ' ', 'catType', ' ', 'using', ' ', '\',\''];
var result = instance.invoke(parts);
result.joiner.should.equal('\',\'');
```

should throw an error if an expression cannot be found.

```js
var parts = ['blah', ' ', 'blah', ' ', 'blah'];
(function () { return instance.invoke(parts); }).should.throw("SQiggLError - LE2000: Unable to determine expression type of 'blah blah blah'");
```

should locate a sub expression in a value field and generate the DSL in the values array.

```js
var parts = ['if', ' ', '(', '12', ' ', '>', ' ', '13', ')', ' ', 'then', ' ', '\'Hello\'', ' ', 'else', ' ', '\'World\''];
var result = instance.invoke(parts);
result.values[0].expression.should.not.equal(void 0);
```

<a name="expressiontreelexer"></a>
# ExpressionTreeLexer
should split expressions by conjunctions and save the conjunctions in order in the DSL.

```js
var parts = ['12', ' ', '>', ' ', '13', ' ', 'and', ' ', '15', ' ', '<', ' ', '100', ' ', 'or', ' ', 'var', ' ', 'is', ' ', 'null'];
var result = instance.invoke(parts);
result.conjunctions[0].should.equal(conjunctions_1.AndConjunction);
result.conjunctions[1].should.equal(conjunctions_1.OrConjunction);
```

should split expressions by conjunctions and save the expressions in order in the DSL.

```js
var parts = ['12', ' ', '>', ' ', '13', ' ', 'and', ' ', '15', ' ', '<', ' ', '100', ' ', 'or', ' ', 'var', ' ', 'is', ' ', 'null'];
var result = instance.invoke(parts);
result.branches[0].expression.should.equal(expressions_1.GreaterThan);
result.branches[1].expression.should.equal(expressions_1.LessThan);
result.branches[2].expression.should.equal(expressions_1.IsNull);
```

<a name="variablelexer"></a>
# VariableLexer
should throw an error if a variable key is wrapped in double quotes.

```js
var input = '"key":"value"';
(function () { return lexer.invoke(input); }).should.throw('SQiggLError - LV2000: Variable keys should not be wrapped in quotes.');
```

should throw an error if a variable key is wrapped in single quotes.

```js
var input = "'key':'value'";
(function () { return lexer.invoke(input); }).should.throw('SQiggLError - LV2000: Variable keys should not be wrapped in quotes.');
```

should throw an error if a variable key contains a '['.

```js
var input = 'ke[y:\'value\'';
(function () { return lexer.invoke(input); }).should.throw("SQiggLError - LV2001: Invalid character '[' found in variable key: 'ke[y:'value''.");
```

should throw an error if a variable key contains a ']'.

```js
var input = 'ke]y:\'value\'';
(function () { return lexer.invoke(input); }).should.throw("SQiggLError - LV2001: Invalid character ']' found in variable key: 'ke]y:'value''.");
```

should throw an error if a variable value contains a multi-dimensional array.

```js
var input = 'key: [[\'hello\']]';
(function () { return lexer.invoke(input); }).should.throw("SQiggLError - LV2002: Arrays in variables cannot be nested. At 'key: [['hello']]'.");
```

should throw an error if a variable value that contains an array contains other values.

```js
var input = 'key: [\'hello\'], \'test\'';
(function () { return lexer.invoke(input); }).should.throw("SQiggLError - LV2002: Arrays in variables cannot be nested. At 'key: ['hello'], 'test''.");
```

should correctly handle a variable value that has an escaped single quote in the string.

```js
var input = "key:'Dragon\\'s breath'";
var result = lexer.invoke(input);
result.value.should.equal("'Dragon's breath'");
```

should correctly handle a variable value that has an escaped double quote in the string.

```js
var input = "key:\"Dragon\\\"s breath\"";
var result = lexer.invoke(input);
result.value.should.equal("\"Dragon\"s breath\"");
```

should correctly handle a variable value of an array of strings.

```js
var input = "key:['one', 'two', 'three']";
var result = lexer.invoke(input);
result.value[0].should.equal("'one'");
result.value[1].should.equal("'two'");
result.value[2].should.equal("'three'");
```

<a name="commandlexer"></a>
# CommandLexer
should throw an error if the first word of a command is not a known action.

```js
var lexer = new command_lexer_1.CommandLexer(lexer_1.DEFAULT_LEXER_OPTIONS, actions_1.CORE_ACTIONS, expressions_1.CORE_EXPRESSIONS, conjunctions_1.CORE_CONJUNCTIONS);
var input = 'not a command';
var parts = ['not', ' ', 'a', ' ', 'command'];
(function () { return lexer.invoke(input, parts); }).should.throw('SQiggLError - LC1000: Commands require the first word to be a known action. not is not a recognized action.');
```

<a name="lexer"></a>
# Lexer
should throw an error if a query contains an incomplete statement.

```js
var lexer = new lexer_1.Lexer();
(function () { return lexer.invoke('SELECT * FROM {Table'); }).should.throw('SQiggLError - L1002: Expected statement to complete before end of file.');
```

should throw an throw an error if a query does not close a statement before declaring another.

```js
var lexer = new lexer_1.Lexer();
(function () { return lexer.invoke('SELECT * FROM {Table WHERE id = {12}'); }).should.throw('SQiggLError - L1001: Unexpected \'{\' found in statement. Expected \'}\'.');
```

should throw an error if a query is incorrectly nested.

```js
var lexer = new lexer_1.Lexer();
var query = 'SELECT * FROM {% if 12 > 13} Test {% endif } {% endif }';
(function () { return lexer.invoke(query); }).should.throw('SQiggLError - L1003: Your SQiggL is incorrectly nested.');
```

should throw an error if a query is incompletely nested.

```js
var lexer = new lexer_1.Lexer();
var query = 'SELECT * FROM {% if 12 > 13 } Test';
(function () { return lexer.invoke(query); }).should.throw('SQiggLError - L1004: Your SQiggL query is nested but does not return to the top level before completing. Please check your nesting.');
```

should throw an error if an invalid string is found in a part.

```js
var query = 'SELECT * FROM {\'Table}';
(function () { return instance.invoke(query); }).should.throw('SQiggLError - L1006: Invalid string found in \'Table');
```

should correctly handle a custom action.

```js
var replaceAction = new actions_1.StartingAction('ReplaceAction', 'replace', function (expressionResult, variables, resolveScope) {
    return resolveScope();
});
var endAction = new actions_1.TerminatingAction('EndReplaceAction', 'endreplace', [replaceAction]);
var lexer = new lexer_1.Lexer({ customActions: [replaceAction, endAction] });
var query = '{% replace \'Hello World\'} SELECT * FROM Table {%endreplace}';
var result = lexer.invoke(query);
result[0].command.action.should.equal(replaceAction);
result[1].command.action.should.equal(endAction);
```

should correctly handle a custom expression.

```js
var testExpression = new expressions_1.BooleanExpression([expressions_1.VALUE, expressions_1.SPACE, 'blah', expressions_1.SPACE, expressions_1.VALUE], function (values) {
    return (+values[0]) > (+values[1]);
});
var lexer = new lexer_1.Lexer({ customExpressions: [testExpression] });
var query = '{12 blah 13}';
var result = lexer.invoke(query);
result[0].replacement.expressions.branches[0].expression.should.equal(testExpression);
```

should correctly handle a custom modifier.

```js
var testModifier = new modifiers_1.BooleanModifier(['!'], function (prevResult, values) {
    return !prevResult;
});
var testExpression = new expressions_1.BooleanExpression([expressions_1.VALUE, expressions_1.SPACE, [{ 0: testModifier }], 'blah', expressions_1.SPACE, expressions_1.VALUE], function (values) {
    return (+values[0]) > (+values[1]);
});
var lexer = new lexer_1.Lexer({ customExpressions: [testExpression], customModifiers: [testModifier] });
var query = '{12 !blah 13}';
var result = lexer.invoke(query);
result[0].replacement.expressions.branches[0].modifiers[0].should.equal(testModifier);
```

should correctly handle a custom conjunction.

```js
var testConjunction = {
    keys: ['blah'],
    rule: function (expressionResults) { return expressionResults[0] && expressionResults[1]; }
};
var lexer = new lexer_1.Lexer({ customConjunctions: [testConjunction] });
var query = '{12 > 13 blah 13 < 12}';
var result = lexer.invoke(query);
result[0].replacement.expressions.conjunctions[0].should.equal(testConjunction);
```

should correctly handle escaped single quotes in strings.

```js
var lexer = new lexer_1.Lexer();
var query = "SELECT * FROM {'Dragon\\'s run'}";
var result = lexer.invoke(query);
result[1].replacement.literal.should.equal("'Dragon's run'");
```

should correctly handle escaped double quotes in strings.

```js
var lexer = new lexer_1.Lexer();
var query = "SELECT * FROM {\"Dragon\\\"s run\"}";
var result = lexer.invoke(query);
result[1].replacement.literal.should.equal('"Dragon"s run"');
```

should correctly handle an escaped escape character in strings.

```js
var lexer = new lexer_1.Lexer();
var query = "SELECT * FROM {'Me\\\\You'}";
var result = lexer.invoke(query);
result[1].replacement.literal.should.equal("'Me\\You'");
```

should throw an error if an illegal escape character exists in a string.

```js
var lexer = new lexer_1.Lexer();
var query = "SELECT * FROM {'\\Something'}";
(function () { return lexer.invoke(query); }).should.throw('SQiggLError - L1005: Illegal escape character found in string \'\\Something\' at index 1');
```

<a name="lexer-options"></a>
## options
should throw an error if any options use the same character.

```js
(function () { return new lexer_1.Lexer({ leftWrapperChar: '*', rightWrapperChar: '*' }); }).should.throwError();
```

should be ok to change the left and right wrappers.

```js
var lexer = new lexer_1.Lexer({ leftWrapperChar: '(', rightWrapperChar: ')' });
var result = lexer.invoke('SELECT * FROM (table)');
result[0].should.have.property('text');
result[1].should.have.property('replacement');
```

<a name="lexer-text"></a>
## text
should return a non-special query unaltered.

```js
var lexer = new lexer_1.Lexer();
var query = 'SELECT * FROM Table';
var result = lexer.invoke(query);
result[0].should.have.property('text', query);
```

should retain whitespace on text.

```js
var lexer = new lexer_1.Lexer();
var query = ' SELECT * FROM Table   ';
var result = lexer.invoke(query);
result[0].should.have.property('text', query);
```

should respect newlines in non-special areas.

```js
var lexer = new lexer_1.Lexer();
var query = 'SELECT * \nFROM Table';
var result = lexer.invoke(query);
result[0].should.have.property('text', query);
```

<a name="lexer-replacement"></a>
## replacement
should find a replacement in a given string.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.invoke('SELECT * FROM {table}');
result[1].should.have.property('replacement');
```

should return a literal for a replacement in a given string.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.invoke('SELECT * FROM {table}');
result[1].should.have.property('replacement', { literal: 'table' });
```

should trim whitespace on replacements.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.invoke('{ table }');
result[0].should.have.property('replacement', { literal: 'table' });
```

should remove newlines from replacements.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.invoke('{\n something }');
result[0].should.have.property('replacement', { literal: 'something' });
```

<a name="lexer-command"></a>
## command
should find a command in a given string.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.invoke('{% if command } {% endif}');
result[0].should.have.property('command');
```

should return a literal for a command in a given string.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.invoke('{%if command} {%endif}');
result[0].command.should.have.property('literal', 'if command');
```

should trim whitespace on commands.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.invoke('{% if command } {%endif}');
result[0].command.should.have.property('literal', 'if command');
```

should remove newlines from commands.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.invoke('{% if\ncommand} {%endif}');
result[0].command.should.have.property('literal', 'if command');
```

should reduce multiple whitespace characters to a single space.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.invoke('{% if      command} {%endif}');
result[0].command.should.have.property('literal', 'if command');
```

should find multiple commands in a given string.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.invoke('SELECT * FROM {% if table = \'Test\' } TestTable {% else } ProdTable {% endif }');
result[1].command.should.have.property('literal', 'if table = \'Test\'');
result[2].command.should.have.property('literal', 'else');
result[3].command.should.have.property('literal', 'endif');
```

should correctly identify the action of a command in a given string.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.invoke('SELECT * FROM {% if } {%endif}');
var dsl = result[1];
var command = dsl.command;
command.action.should.have.property('key', 'if');
```

should correct identify the action of a command despite casing.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.invoke('SELECT * FROM {% iF } {%endif}');
var dsl = result[1];
var command = dsl.command;
command.action.should.have.property('key', 'if');
```

<a name="lexer-comment"></a>
## comment
should find a comment in a given string.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.invoke('SELECT * FROM {# something }');
result[1].should.have.property('comment', 'something');
```

should trim whitespace on comments.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.invoke('{# test comment }');
result[0].should.have.property('comment', 'test comment');
```

<a name="lexer-variable"></a>
## variable
should find variable declarations in a given string.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.invoke('{+ key:value }');
result[0].should.have.property('variable');
```

should remove all whitespace from variable declarations.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.invoke('{+ key : value }');
result[0].variable.should.have.property('literal', 'key:value');
```

should also remove newlines from variable declarations.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.invoke('{+ key : \n value }');
result[0].variable.should.have.property('literal', 'key:value');
```

should correctly set a key and value.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.invoke("{+ dragon:'cat' }");
result[0].variable.should.have.property('key');
result[0].variable.should.have.property('value');
```

should correctly set the value of key and value.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.invoke("{+ dragon:'cat' }");
result[0].variable.should.have.property('key', 'dragon');
result[0].variable.should.have.property('value', "'cat'");
```

should correctly handle a variable with an opposite quote inside a string value.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.invoke("{+ dragon: \"Felix's pet\" }");
result[0].variable.should.have.property('key', 'dragon');
result[0].variable.should.have.property('value', "\"Felix's pet\"");
```

<a name="lexer-scope"></a>
## scope
should determine the correct level of items nested in actions.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.invoke('SELECT * FROM {% if table = \'Test\' } TestTable {% else } ProdTable {% endif }');
result[0].should.have.property('text');
result[1].should.have.property('command');
result[1].should.have.property('scope');
result[1].scope[0].should.have.property('text');
result[2].should.have.property('command');
result[2].should.have.property('scope');
result[2].scope[0].should.have.property('text');
result[3].should.have.property('command');
```

<a name="lexer-expressions"></a>
## expressions
should detect an expression in a replacement.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.invoke('{12 > 13}');
result[0].replacement.should.have.property('expressions');
```

should detect an expression in a replacement with a modifier.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.invoke('{12 !< 13}');
result[0].replacement.should.have.property('expressions');
```

should correctly identify a modifier in an expression.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.invoke('{12 !> 13}');
result[0].replacement.expressions.branches[0].should.have.property('modifiers');
result[0].replacement.expressions.branches[0].modifiers[0].should.equal(modifiers_1.Not);
```

should correctly identify the values in an expression.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.invoke('{12 > 13}');
result[0].replacement.expressions.branches[0].values[0].should.equal('12');
result[0].replacement.expressions.branches[0].values[1].should.equal('13');
```

<a name="expressionparser"></a>
# ExpressionParser
<a name="expressionparser-invoke"></a>
## invoke
should correctly return false if an expression should be false.

```js
var dsl = { expression: expressions_1.GreaterThan, values: ['12', '13'], literal: '12 > 13' };
var result = new expression_parser_1.ExpressionParser(parser_1.DEFAULT_PARSER_OPTIONS).parse(dsl, new variables_1.ScopedVariables());
result.value.should.equal(false);
```

should correctly return true if an expression should be true.

```js
var dsl = { literal: '13 > 12', expression: expressions_1.GreaterThan, values: ['13', '12'] };
var result = new expression_parser_1.ExpressionParser(parser_1.DEFAULT_PARSER_OPTIONS).parse(dsl, new variables_1.ScopedVariables());
result.value.should.eql(true);
```

should output the result of a boolean expression with variables.

```js
var dsl = { literal: 'high > low', expression: expressions_1.GreaterThan, values: ['high', 'low'] };
var result = new expression_parser_1.ExpressionParser(parser_1.DEFAULT_PARSER_OPTIONS).parse(dsl, new variables_1.ScopedVariables({ high: 13, low: 12 }));
result.value.should.eql(true);
```

should correctly return true if an expression is false but then negated with a modifier.

```js
var dsl = { literal: '12 > 13', expression: expressions_1.GreaterThan, values: ['12', '13'], modifiers: [modifiers_1.Not] };
var result = new expression_parser_1.ExpressionParser(parser_1.DEFAULT_PARSER_OPTIONS).parse(dsl, new variables_1.ScopedVariables());
result.value.should.eql(true);
```

<a name="expressiontreeparser"></a>
# ExpressionTreeParser
should return an ExpressionResult.

```js
var expression = { literal: '13 > 12', expression: expressions_1.GreaterThan, values: ['13', '12'] };
var dsl = { branches: [expression] };
var result = instance.parse(dsl, new variables_1.ScopedVariables());
result.value.should.equal(true);
```

should return a correct result of an expression with a conjunction.

```js
var expression1 = { literal: '13 > 12', expression: expressions_1.GreaterThan, values: ['13', '12'] };
var expression2 = { literal: '13 < 12', expression: expressions_1.LessThan, values: ['13', '12'] };
var dsl = { branches: [expression1, expression2], conjunctions: [conjunctions_1.AndConjunction] };
var result = instance.parse(dsl, new variables_1.ScopedVariables());
result.value.should.equal(false);
```

<a name="commandparser"></a>
# CommandParser
should correctly return a string in a StartingAction that is false.

```js
var booleanExpression = { literal: '12 > 13', expression: expressions_1.GreaterThan, values: ['12', '13'] };
var expressionTree = { branches: [booleanExpression] };
var dsl = { literal: 'if 12 > 13', action: actions_1.If, expressions: expressionTree };
var scope = [{ text: 'Hello World' }];
var result = new command_parser_1.CommandParser(parser_1.DEFAULT_PARSER_OPTIONS).parse(dsl, scope, new variables_1.ScopedVariables());
result.should.equal('');
```

should correctly return a string in a StartingAction that is true.

```js
var booleanExpression = { literal: '13 > 12', expression: expressions_1.GreaterThan, values: ['13', '12'] };
var expressionTree = { branches: [booleanExpression] };
var dsl = { literal: 'if 13 > 12', action: actions_1.If, expressions: expressionTree };
var scope = [{ text: 'Hello World' }];
var result = new command_parser_1.CommandParser(parser_1.DEFAULT_PARSER_OPTIONS).parse(dsl, scope, new variables_1.ScopedVariables());
result.should.equal('Hello World');
```

should correctly return a string in a DependentAction.

```js
var dsl = { literal: 'else', action: actions_1.Else };
var scope = [{ text: 'Merry Christmas' }];
var result = new command_parser_1.CommandParser(parser_1.DEFAULT_PARSER_OPTIONS).parse(dsl, scope, new variables_1.ScopedVariables());
result.should.equal('Merry Christmas');
```

should correctly return a string for an IterableCommand.

```js
var iterableExpression = { literal: 'cat of catTypes using \',\'', expression: expressions_1.IterableOfUsing, local: 'cat', values: [['hairy', 'furry', 'fuzzy']], joiner: '\',\'' };
var expressionTreeDSL = { branches: [iterableExpression] };
var commandDSL = { literal: 'for cat of catTypes using \', \'', action: actions_1.For, expressions: expressionTreeDSL };
var textDSL = { text: 'Hello ' };
var replacementDSL = { literal: 'cat', expressions: null };
var scope = [textDSL, { replacement: replacementDSL }];
var result = new command_parser_1.CommandParser(parser_1.DEFAULT_PARSER_OPTIONS).parse(commandDSL, scope, new variables_1.ScopedVariables());
result.should.equal('Hello hairy, Hello furry, Hello fuzzy');
```

<a name="replacementparser"></a>
# ReplacementParser
<a name="replacementparser-invoke"></a>
## invoke
should output a literal string.

```js
var dsl = { literal: '\'Test string\'' };
var result = new replacement_parser_1.ReplacementParser(parser_1.DEFAULT_PARSER_OPTIONS).parse(dsl, new variables_1.ScopedVariables());
result.should.eql('Test string');
```

should output a literal number.

```js
var dsl = { literal: '12' };
var result = new replacement_parser_1.ReplacementParser(parser_1.DEFAULT_PARSER_OPTIONS).parse(dsl, new variables_1.ScopedVariables());
result.should.eql('12');
```

should output a variable value.

```js
var dsl = { literal: 'dragon' };
var result = new replacement_parser_1.ReplacementParser(parser_1.DEFAULT_PARSER_OPTIONS).parse(dsl, new variables_1.ScopedVariables({ dragon: 'Pet' }));
result.should.eql('Pet');
```

should output the result of a boolean expression.

```js
var booleanExpression = { literal: '12 > 13', expression: expressions_1.GreaterThan, values: ['12', '13'] };
var expressionTree = { branches: [booleanExpression] };
var dsl = { literal: '12 > 13', expressions: expressionTree };
var result = new replacement_parser_1.ReplacementParser(parser_1.DEFAULT_PARSER_OPTIONS).parse(dsl, new variables_1.ScopedVariables());
result.should.eql('0');
```

should output the result of a boolean expression with variables.

```js
var booleanExpression = { literal: 'high > low', expression: expressions_1.GreaterThan, values: ['high', 'low'] };
var expressionTree = { branches: [booleanExpression] };
var dsl = { literal: 'high > low', expressions: expressionTree };
var result = new replacement_parser_1.ReplacementParser(parser_1.DEFAULT_PARSER_OPTIONS).parse(dsl, new variables_1.ScopedVariables({ high: 13, low: 12 }));
result.should.eql('1');
```

should output the result of an IterableExpression correctly.

```js
var iterableExpression = { literal: 'cat of catTypes using \',\'', expression: expressions_1.IterableOfUsing, local: 'cat', values: [['hairy', 'furry', 'fuzzy']], joiner: '\',\'' };
var expressionTree = { branches: [iterableExpression] };
var dsl = { literal: 'cat of catTypes using \',\'', expressions: expressionTree };
var result = new replacement_parser_1.ReplacementParser(parser_1.DEFAULT_PARSER_OPTIONS).parse(dsl, new variables_1.ScopedVariables());
result.should.equal('hairy, furry, fuzzy');
```

should output the result of an IterableExpression correctly using variables.

```js
var iterableExpression = { literal: 'cat of catTypes using \',\'', expression: expressions_1.IterableOfUsing, local: 'cat', values: ['array'], joiner: 'joiner' };
var expressionTree = { branches: [iterableExpression] };
var dsl = { literal: 'cat of catTypes using \',\'', expressions: expressionTree };
var result = new replacement_parser_1.ReplacementParser(parser_1.DEFAULT_PARSER_OPTIONS).parse(dsl, new variables_1.ScopedVariables({ array: ['hairy', 'furry', 'fuzzy'], joiner: ',' }));
result.should.equal('hairy, furry, fuzzy');
```

<a name="parser"></a>
# Parser
<a name="parser-comments"></a>
## comments
should not output comments by default.

```js
var parser = new parser_1.Parser();
var dsl = [
    { text: 'This is some text' },
    { comment: 'This is a comment' },
];
var result = parser.parse(dsl);
result.should.equal('This is some text');
```

should output comments if exportComments option is true.

```js
var parser = new parser_1.Parser({ exportComments: true });
var dsl = [
    { text: 'This is some text' },
    { comment: 'This is a comment' }
];
var result = parser.parse(dsl);
result.should.equal('This is some text/* This is a comment */');
```

<a name="parser-text"></a>
## text
should output text untouched.

```js
var parser = new parser_1.Parser();
var result = parser.parse([{ text: 'this is a test string' }]);
result.should.equal('this is a test string');
```

<a name="parser-variable"></a>
## variable
should resolve a variable in SQiggL query without an error.

```js
var parser = new parser_1.Parser();
parser.parse([{ variable: { literal: 'cat:"meow"', key: 'cat', value: '"meow"' } }]);
```

should resolve a variable alias in a SQiggL query without an error.

```js
var parser = new parser_1.Parser();
parser.parse([{ variable: { literal: 'cat:sound', key: 'cat', value: 'sound' } }], new variables_1.ScopedVariables({ sound: 'meow' }));
```

<a name="scenarios"></a>
# Scenarios
should correctly output a completely non-special query untouched.

```js
var result = SQiggL.parse('SELECT * FROM Table');
result.should.equal('SELECT * FROM Table');
```

should correctly output a SQiggL query containing a comment (default).

```js
var result = SQiggL.parse('SELECT * FROM Table {# this is the client\'s table}');
result.should.equal('SELECT * FROM Table ');
```

should correctly output a SQiggL query containing a comment (export true).

```js
var result = SQiggL.parse('SELECT * FROM Table {# this is the client\'s table}', void 0, { exportComments: true });
result.should.equal('SELECT * FROM Table /* this is the client\'s table */');
```

should correctly output a SQiggL query containing a string literal replacement.

```js
var result = SQiggL.parse('SELECT * FROM {\'Table\'}');
result.should.equal('SELECT * FROM Table');
```

should correctly output a SQiggL query containing a number literal replacement.

```js
var result = SQiggL.parse('SELECT * FROM Table WHERE ID = {12}');
result.should.equal('SELECT * FROM Table WHERE ID = 12');
```

should correctly output a SQiggL query containing a variable replacement.

```js
var result = SQiggL.parse('SELECT * FROM Table WHERE ID = {id}', { id: 12 });
result.should.equal('SELECT * FROM Table WHERE ID = 12');
```

should correctly output a SQiggL query containing a boolean expression with numbers.

```js
var result = SQiggL.parse('SELECT * FROM Table WHERE status = {12 > 13}');
result.should.equal('SELECT * FROM Table WHERE status = 0');
```

should correctly output a SQiggL query containing a boolean expression with strings.

```js
var result = SQiggL.parse('SELECT * FROM Table WHERE status = {\'yes\' abc> \'no\'}');
result.should.equal('SELECT * FROM Table WHERE status = 1');
```

should correctly output a SQiggL query containing a value expression.

```js
var result = SQiggL.parse('SELECT * FROM {dev ?? prod}', { dev: 'DevTable' });
result.should.equal('SELECT * FROM DevTable');
```

should correctly output a SQiggL query containing a coalesce.

```js
var result = SQiggL.parse('SELECT * FROM {dev ?? prod}', { prod: 'ProdTable' });
result.should.equal('SELECT * FROM ProdTable');
```

should correctly output a SQiggL query containing a StartingAction/TerminatingAction pair.

```js
var result = SQiggL.parse('SELECT * FROM Table {% if 13 > 12 } WHERE status = 1 {% endif }');
result.should.equal('SELECT * FROM Table  WHERE status = 1 ');
```

should correctly output a SQiggL query containing a StartingAction, DependentAction, and TerminatingAction chain.

```js
var result = SQiggL.parse('SELECT * FROM Table {% if 12 > 13 } WHERE status = 1 {% else } WHERE status = 0 {% endif }');
result.should.equal('SELECT * FROM Table  WHERE status = 0 ');
```

should correctly output a SQiggL query containing a conjunction in an expression.

```js
var result = SQiggL.parse('SELECT * FROM Table {% if 13 > 12 and 15 < 100 } WHERE Status = 1 {% endif }');
result.should.equal('SELECT * FROM Table  WHERE Status = 1 ');
```

<a name="scenarios-generic-end"></a>
## generic 'end'
should work with 'if'.

```js
var result = SQiggL.parse('SELECT * FROM Table {% if 13 > 12} WHERE status = 0 {% end }');
result.should.equal('SELECT * FROM Table  WHERE status = 0 ');
```

should work with 'unless'.

```js
var result = SQiggL.parse('SELECT * FROM Table {% unless 13 < 12} WHERE status = 0 {% end }');
result.should.equal('SELECT * FROM Table  WHERE status = 0 ');
```

should work with 'for'.

```js
var result = SQiggL.parse('SELECT * FROM Table WHERE {% for var of array using \'AND\'} id = {var} {% end }', { array: ['1', '2', '3'] });
result.should.equal('SELECT * FROM Table WHERE  id = 1 AND  id = 2 AND  id = 3 ');
```

<a name="full-feature-sweep-"></a>
# Full feature sweep: 
<a name="full-feature-sweep-if"></a>
## if
<a name="full-feature-sweep-if-is-null"></a>
### is null
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { penny: '12' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: '12' });
result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-if-is-not-null"></a>
### is not null
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: '12' });
result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { penny: '14' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-if-is-null"></a>
### is !null
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: '12' });
result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { penny: '14' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-if-"></a>
### =
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: '12' });
result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: '14' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-if-"></a>
### ==
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: '12' });
result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: '14' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-if-"></a>
### !=
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: '12' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: '14' });
result.should.equal("UPDATE Names  SET Name = '14'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-if-"></a>
### !==
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: '12' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: '14' });
result.should.equal("UPDATE Names  SET Name = '14'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-if-"></a>
### >
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: '14' });
result.should.equal("UPDATE Names  SET Name = '14'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: '12' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: '9' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-if-"></a>
### >=
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: '14' });
result.should.equal("UPDATE Names  SET Name = '14'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: '12' });
result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: '9' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-if-"></a>
### !>
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: '14' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: '12' });
result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: '9' });
result.should.equal("UPDATE Names  SET Name = '9'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-if-"></a>
### !>=
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: '14' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: '12' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: '9' });
result.should.equal("UPDATE Names  SET Name = '9'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-if-"></a>
### <
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: '9' });
result.should.equal("UPDATE Names  SET Name = '9'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: '12' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: '14' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-if-"></a>
### <=
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: '9' });
result.should.equal("UPDATE Names  SET Name = '9'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: '12' });
result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: '14' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-if-"></a>
### !<
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: '9' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: '12' });
result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: '14' });
result.should.equal("UPDATE Names  SET Name = '14'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-if-"></a>
### !<=
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: '9' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: '12' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: '14' });
result.should.equal("UPDATE Names  SET Name = '14'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-if-abc"></a>
### abc>
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: 'hello' });
result.should.equal("UPDATE Names  SET Name = 'hello'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: 'dragon' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: 'awkward' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-if-abc"></a>
### abc>=
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: 'hello' });
result.should.equal("UPDATE Names  SET Name = 'hello'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: 'dragon' });
result.should.equal("UPDATE Names  SET Name = 'dragon'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: 'awkward' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-if-abc"></a>
### !abc>
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: 'hello' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: 'dragon' });
result.should.equal("UPDATE Names  SET Name = 'dragon'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: 'awkward' });
result.should.equal("UPDATE Names  SET Name = 'awkward'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-if-abc"></a>
### !abc>=
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: 'hello' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: 'dragon' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: 'awkward' });
result.should.equal("UPDATE Names  SET Name = 'awkward'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-if-abc"></a>
### abc<
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: 'awkward' });
result.should.equal("UPDATE Names  SET Name = 'awkward'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: 'dragon' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: 'hello' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-if-abc"></a>
### abc<=
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: 'awkward' });
result.should.equal("UPDATE Names  SET Name = 'awkward'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: 'dragon' });
result.should.equal("UPDATE Names  SET Name = 'dragon'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: 'hello' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-if-abc"></a>
### !abc<
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: 'awkward' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: 'dragon' });
result.should.equal("UPDATE Names  SET Name = 'dragon'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: 'hello' });
result.should.equal("UPDATE Names  SET Name = 'hello'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-if-abc"></a>
### !abc<=
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: 'awkward' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: 'dragon' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: 'hello' });
result.should.equal("UPDATE Names  SET Name = 'hello'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-if-len"></a>
### len>
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: 'palooza' });
result.should.equal("UPDATE Names  SET Name = 'palooza'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: 'sqiggl' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: 'fun' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-if-len"></a>
### len>=
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: 'palooza' });
result.should.equal("UPDATE Names  SET Name = 'palooza'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: 'sqiggl' });
result.should.equal("UPDATE Names  SET Name = 'sqiggl'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: 'fun' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-if-len"></a>
### !len>
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: 'palooza' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: 'sqiggl' });
result.should.equal("UPDATE Names  SET Name = 'sqiggl'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: 'fun' });
result.should.equal("UPDATE Names  SET Name = 'fun'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-if-len"></a>
### !len>=
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: 'palooza' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: 'sqiggl' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: 'fun' });
result.should.equal("UPDATE Names  SET Name = 'fun'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-if-len"></a>
### len<
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: 'fun' });
result.should.equal("UPDATE Names  SET Name = 'fun'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: 'sqiggl' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: 'palooza' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-if-len"></a>
### len<=
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: 'fun' });
result.should.equal("UPDATE Names  SET Name = 'fun'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: 'sqiggl' });
result.should.equal("UPDATE Names  SET Name = 'sqiggl'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: 'palooza' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-if-len"></a>
### !len<
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: 'fun' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: 'sqiggl' });
result.should.equal("UPDATE Names  SET Name = 'sqiggl'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: 'palooza' });
result.should.equal("UPDATE Names  SET Name = 'palooza'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-if-len"></a>
### !len<=
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: 'fun' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: 'sqiggl' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: 'palooza' });
result.should.equal("UPDATE Names  SET Name = 'palooza'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-if-is-nan"></a>
### is NaN
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: 'dragon' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: '12' });
result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-if-is-not-nan"></a>
### is not NaN
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: '12' });
result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: 'dragon' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-if-is-nan"></a>
### is !NaN
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: '12' });
result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: 'dragon' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-if-"></a>
### ><
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: 15 });
result.should.equal("UPDATE Names  SET Name = '15'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal to the low number.

```js
var result = SQiggL.parse(query, { example: 10 });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal to the high number.

```js
var result = SQiggL.parse(query, { example: 20 });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if below the low number.

```js
var result = SQiggL.parse(query, { example: 5 });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if above the high number.

```js
var result = SQiggL.parse(query, { example: 25 });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-if-"></a>
### >!<
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: 15 });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal to the low number.

```js
var result = SQiggL.parse(query, { example: 10 });
result.should.equal("UPDATE Names  SET Name = '10'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal to the high number.

```js
var result = SQiggL.parse(query, { example: 20 });
result.should.equal("UPDATE Names  SET Name = '20'  WHERE Name = 'Awesome'");
```

should provide a correct result if below the low number.

```js
var result = SQiggL.parse(query, { example: 5 });
result.should.equal("UPDATE Names  SET Name = '5'  WHERE Name = 'Awesome'");
```

should provide a correct result if above the high number.

```js
var result = SQiggL.parse(query, { example: 25 });
result.should.equal("UPDATE Names  SET Name = '25'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-if-"></a>
### >=<
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: 15 });
result.should.equal("UPDATE Names  SET Name = '15'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal to the low number.

```js
var result = SQiggL.parse(query, { example: 10 });
result.should.equal("UPDATE Names  SET Name = '10'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal to the high number.

```js
var result = SQiggL.parse(query, { example: 20 });
result.should.equal("UPDATE Names  SET Name = '20'  WHERE Name = 'Awesome'");
```

should provide a correct result if below the low number.

```js
var result = SQiggL.parse(query, { example: 5 });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if above the high number.

```js
var result = SQiggL.parse(query, { example: 25 });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-unless"></a>
## unless
<a name="full-feature-sweep-unless-is-null"></a>
### is null
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { penny: '12' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: '12' });
result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-unless-is-not-null"></a>
### is not null
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: '12' });
result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { penny: '14' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-unless-is-null"></a>
### is !null
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: '12' });
result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { penny: '14' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-unless-"></a>
### =
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: '12' });
result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: '14' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-unless-"></a>
### ==
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: '12' });
result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: '14' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-unless-"></a>
### !=
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: '12' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: '14' });
result.should.equal("UPDATE Names  SET Name = '14'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-unless-"></a>
### !==
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: '12' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: '14' });
result.should.equal("UPDATE Names  SET Name = '14'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-unless-"></a>
### >
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: '14' });
result.should.equal("UPDATE Names  SET Name = '14'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: '12' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: '9' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-unless-"></a>
### >=
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: '14' });
result.should.equal("UPDATE Names  SET Name = '14'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: '12' });
result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: '9' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-unless-"></a>
### !>
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: '14' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: '12' });
result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: '9' });
result.should.equal("UPDATE Names  SET Name = '9'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-unless-"></a>
### !>=
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: '14' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: '12' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: '9' });
result.should.equal("UPDATE Names  SET Name = '9'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-unless-"></a>
### <
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: '9' });
result.should.equal("UPDATE Names  SET Name = '9'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: '12' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: '14' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-unless-"></a>
### <=
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: '9' });
result.should.equal("UPDATE Names  SET Name = '9'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: '12' });
result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: '14' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-unless-"></a>
### !<
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: '9' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: '12' });
result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: '14' });
result.should.equal("UPDATE Names  SET Name = '14'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-unless-"></a>
### !<=
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: '9' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: '12' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: '14' });
result.should.equal("UPDATE Names  SET Name = '14'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-unless-abc"></a>
### abc>
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: 'hello' });
result.should.equal("UPDATE Names  SET Name = 'hello'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: 'dragon' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: 'awkward' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-unless-abc"></a>
### abc>=
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: 'hello' });
result.should.equal("UPDATE Names  SET Name = 'hello'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: 'dragon' });
result.should.equal("UPDATE Names  SET Name = 'dragon'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: 'awkward' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-unless-abc"></a>
### !abc>
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: 'hello' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: 'dragon' });
result.should.equal("UPDATE Names  SET Name = 'dragon'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: 'awkward' });
result.should.equal("UPDATE Names  SET Name = 'awkward'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-unless-abc"></a>
### !abc>=
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: 'hello' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: 'dragon' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: 'awkward' });
result.should.equal("UPDATE Names  SET Name = 'awkward'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-unless-abc"></a>
### abc<
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: 'awkward' });
result.should.equal("UPDATE Names  SET Name = 'awkward'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: 'dragon' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: 'hello' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-unless-abc"></a>
### abc<=
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: 'awkward' });
result.should.equal("UPDATE Names  SET Name = 'awkward'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: 'dragon' });
result.should.equal("UPDATE Names  SET Name = 'dragon'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: 'hello' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-unless-abc"></a>
### !abc<
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: 'awkward' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: 'dragon' });
result.should.equal("UPDATE Names  SET Name = 'dragon'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: 'hello' });
result.should.equal("UPDATE Names  SET Name = 'hello'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-unless-abc"></a>
### !abc<=
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: 'awkward' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: 'dragon' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: 'hello' });
result.should.equal("UPDATE Names  SET Name = 'hello'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-unless-len"></a>
### len>
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: 'palooza' });
result.should.equal("UPDATE Names  SET Name = 'palooza'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: 'sqiggl' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: 'fun' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-unless-len"></a>
### len>=
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: 'palooza' });
result.should.equal("UPDATE Names  SET Name = 'palooza'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: 'sqiggl' });
result.should.equal("UPDATE Names  SET Name = 'sqiggl'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: 'fun' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-unless-len"></a>
### !len>
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: 'palooza' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: 'sqiggl' });
result.should.equal("UPDATE Names  SET Name = 'sqiggl'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: 'fun' });
result.should.equal("UPDATE Names  SET Name = 'fun'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-unless-len"></a>
### !len>=
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: 'palooza' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: 'sqiggl' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: 'fun' });
result.should.equal("UPDATE Names  SET Name = 'fun'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-unless-len"></a>
### len<
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: 'fun' });
result.should.equal("UPDATE Names  SET Name = 'fun'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: 'sqiggl' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: 'palooza' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-unless-len"></a>
### len<=
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: 'fun' });
result.should.equal("UPDATE Names  SET Name = 'fun'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: 'sqiggl' });
result.should.equal("UPDATE Names  SET Name = 'sqiggl'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: 'palooza' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-unless-len"></a>
### !len<
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: 'fun' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: 'sqiggl' });
result.should.equal("UPDATE Names  SET Name = 'sqiggl'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: 'palooza' });
result.should.equal("UPDATE Names  SET Name = 'palooza'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-unless-len"></a>
### !len<=
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: 'fun' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal.

```js
var result = SQiggL.parse(query, { example: 'sqiggl' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: 'palooza' });
result.should.equal("UPDATE Names  SET Name = 'palooza'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-unless-is-nan"></a>
### is NaN
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: 'dragon' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: '12' });
result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-unless-is-not-nan"></a>
### is not NaN
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: '12' });
result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: 'dragon' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-unless-is-nan"></a>
### is !NaN
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: '12' });
result.should.equal("UPDATE Names  SET Name = '12'  WHERE Name = 'Awesome'");
```

should provide a correct result if false.

```js
var result = SQiggL.parse(query, { example: 'dragon' });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-unless-"></a>
### ><
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: 15 });
result.should.equal("UPDATE Names  SET Name = '15'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal to the low number.

```js
var result = SQiggL.parse(query, { example: 10 });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal to the high number.

```js
var result = SQiggL.parse(query, { example: 20 });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if below the low number.

```js
var result = SQiggL.parse(query, { example: 5 });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if above the high number.

```js
var result = SQiggL.parse(query, { example: 25 });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-unless-"></a>
### >!<
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: 15 });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal to the low number.

```js
var result = SQiggL.parse(query, { example: 10 });
result.should.equal("UPDATE Names  SET Name = '10'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal to the high number.

```js
var result = SQiggL.parse(query, { example: 20 });
result.should.equal("UPDATE Names  SET Name = '20'  WHERE Name = 'Awesome'");
```

should provide a correct result if below the low number.

```js
var result = SQiggL.parse(query, { example: 5 });
result.should.equal("UPDATE Names  SET Name = '5'  WHERE Name = 'Awesome'");
```

should provide a correct result if above the high number.

```js
var result = SQiggL.parse(query, { example: 25 });
result.should.equal("UPDATE Names  SET Name = '25'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-unless-"></a>
### >=<
should provide a correct result if true.

```js
var result = SQiggL.parse(query, { example: 15 });
result.should.equal("UPDATE Names  SET Name = '15'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal to the low number.

```js
var result = SQiggL.parse(query, { example: 10 });
result.should.equal("UPDATE Names  SET Name = '10'  WHERE Name = 'Awesome'");
```

should provide a correct result if equal to the high number.

```js
var result = SQiggL.parse(query, { example: 20 });
result.should.equal("UPDATE Names  SET Name = '20'  WHERE Name = 'Awesome'");
```

should provide a correct result if below the low number.

```js
var result = SQiggL.parse(query, { example: 5 });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

should provide a correct result if above the high number.

```js
var result = SQiggL.parse(query, { example: 25 });
result.should.equal("UPDATE Names  SET Name = 'Cow'  WHERE Name = 'Awesome'");
```

<a name="full-feature-sweep-ternaries"></a>
## Ternaries
<a name="full-feature-sweep-ternaries-verbose-ternary"></a>
### Verbose Ternary
should return the first value if true.

```js
var query = "SELECT * FROM {if (13 > 12) then 'Dev' else 'Prod'}";
var result = SQiggL.parse(query);
result.should.equal("SELECT * FROM Dev");
```

should return the last value if false.

```js
var query = "SELECT * FROM {if (12 > 13) then 'Dev' else 'Prod'}";
var result = SQiggL.parse(query);
result.should.equal("SELECT * FROM Prod");
```

<a name="full-feature-sweep-ternaries-ternary"></a>
### Ternary
should return the first value if true.

```js
var query = "SELECT * FROM {(13 > 12) ? 'Dev' : 'Prod'}";
var result = SQiggL.parse(query);
result.should.equal("SELECT * FROM Dev");
```

should return the last value if false.

```js
var query = "SELECT * FROM {(12 > 13) ? 'Dev' : 'Prod'}";
var result = SQiggL.parse(query);
result.should.equal("SELECT * FROM Prod");
```

<a name="full-feature-sweep-query-with-newlines"></a>
## "query with newlines"
should accept newlines in queries.

```js
var sql = "UPDATE Names\n{% if example is not null }\nSET Name = '{example}'\n{% else } SET Name = 'Cow'\n{% endif }\nWHERE Name = 'Awesome'";
var result = "UPDATE Names\n\nSET Name = 'Dragon'\n\nWHERE Name = 'Awesome'";
var actual = SQiggL.parse(sql, { example: 'Dragon' });
actual.should.equal(result);
```

