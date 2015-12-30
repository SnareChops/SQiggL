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
   - [VariableLexer](#variablelexer)
   - [CommandLexer](#commandlexer)
   - [ExpressionLexer](#expressionlexer)
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
     - [parse](#expressionparser-parse)
   - [Command Parser](#command-parser)
   - [ReplacementParser](#replacementparser)
     - [parse](#replacementparser-parse)
   - [Parser](#parser)
     - [comments](#parser-comments)
     - [text](#parser-text)
     - [variable](#parser-variable)
     - [resolveValue](#parser-resolvevalue)
   - [Scenarios](#scenarios)
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
var result = expressions_1.Coalesce.rule([null, 'World']);
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
var result = actions_1.If.rule(true, null, dsl, new parser_1.Parser(parser_1.DEFAULT_PARSER_OPTIONS));
result.should.equal('Hello World');
```

should return null if the expression is false.

```js
var dsl = [{ text: 'Hello World' }];
var result = actions_1.If.rule(false, null, dsl, new parser_1.Parser(parser_1.DEFAULT_PARSER_OPTIONS));
should(result).equal(null);
```

<a name="actions-unless"></a>
## Unless
should return null if the expression is true.

```js
var dsl = [{ text: 'Hello World' }];
var result = actions_1.Unless.rule(true, null, dsl, new parser_1.Parser(parser_1.DEFAULT_PARSER_OPTIONS));
should(result).equal(null);
```

should return the inner scope if the expression is false.

```js
var dsl = [{ text: 'Hello World' }];
var result = actions_1.Unless.rule(false, null, dsl, new parser_1.Parser(parser_1.DEFAULT_PARSER_OPTIONS));
result.should.equal('Hello World');
```

<a name="actions-else"></a>
## Else
should return the inner scope if the expression is true.

```js
var dsl = [{ text: 'Hello World' }];
var result = actions_1.Else.rule(true, null, dsl, new parser_1.Parser(parser_1.DEFAULT_PARSER_OPTIONS));
result.should.equal('Hello World');
```

should return the inner scope if the expression is false.

```js
var dsl = [{ text: 'Hello World' }];
var result = actions_1.Else.rule(false, null, dsl, new parser_1.Parser(parser_1.DEFAULT_PARSER_OPTIONS));
result.should.equal('Hello World');
```

<a name="actions-for"></a>
## For
should return the inner scope as many times as there are values and combining them with the joiner.

```js
var commandDSL = { literal: 'for var of vars using \',\'', action: actions_1.For, expression: expressions_1.IterableOfUsing, local: 'var', joiner: '\',\'', values: [['1', '2', '3']] };
var dsl = [{ text: 'Hello World' }];
var result = actions_1.For.rule(['1', '2', '3'], void 0, dsl, new parser_1.Parser(parser_1.DEFAULT_PARSER_OPTIONS), commandDSL);
result.should.equal('Hello World, Hello World, Hello World');
```

should iterate the inner scope and correctly replace the inner values using the expressionResult.

```js
var commandDSL = { literal: 'for var of vars using \',\'', action: actions_1.For, expression: expressions_1.IterableOfUsing, local: 'var', joiner: '\',\'', values: [['1', '2', '3']] };
var dsl = [{ text: 'Iteration ' }, { replacement: { literal: 'var', expression: null } }];
var result = actions_1.For.rule(['1', '2', '3'], void 0, dsl, new parser_1.Parser(parser_1.DEFAULT_PARSER_OPTIONS), commandDSL);
result.should.equal('Iteration 1, Iteration 2, Iteration 3');
```

<a name="variablelexer"></a>
# VariableLexer
should throw an error if a variable key is wrapped in double quotes.

```js
var input = '"key":"value"';
(function () { return lexer.invoke(input); }).should.throw('SQiggL Syntax Error: Variable keys should not be wrapped in quotes.');
```

should throw an error if a variable key is wrapped in single quotes.

```js
var input = "'key':'value'";
(function () { return lexer.invoke(input); }).should.throw('SQiggL Syntax Error: Variable keys should not be wrapped in quotes.');
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

<a name="commandlexer"></a>
# CommandLexer
should throw an error if the first word of a command is not a known action.

```js
var lexer = new command_lexer_1.CommandLexer(lexer_1.DEFAULT_LEXER_OPTIONS, actions_1.CORE_ACTIONS, expressions_1.CORE_EXPRESSIONS);
var input = 'not a command';
var parts = ['not', ' ', 'a', ' ', 'command'];
(function () { return lexer.invoke(input, parts); }).should.throw('SQiggL No Action Error: Commands require the first word to be a known action. not is not a recognized action.');
```

<a name="expressionlexer"></a>
# ExpressionLexer
should return a DSLExpression with a local if an expression contains a local variable.

```js
var dsl = { literal: 'cat of catType using \',\'', expression: null };
var parts = ['cat', ' ', 'of', ' ', 'catType', ' ', 'using', ' ', '\',\''];
var result = new expression_lexer_1.ExpressionLexer(lexer_1.DEFAULT_LEXER_OPTIONS, expressions_1.CORE_EXPRESSIONS).invoke(dsl, parts);
result.local.should.equal('cat');
```

should return a DSLExpression with a joiner if an expression contains a joiner value.

```js
var dsl = { literal: 'cat of catType using \',\'', expression: null };
var parts = ['cat', ' ', 'of', ' ', 'catType', ' ', 'using', ' ', '\',\''];
var result = new expression_lexer_1.ExpressionLexer(lexer_1.DEFAULT_LEXER_OPTIONS, expressions_1.CORE_EXPRESSIONS).invoke(dsl, parts);
result.joiner.should.equal('\',\'');
```

should throw an error if an expression cannot be found.

```js
var lexer = new expression_lexer_1.ExpressionLexer(lexer_1.DEFAULT_LEXER_OPTIONS, expressions_1.CORE_EXPRESSIONS);
var dsl = { literal: 'blah blah blah', expression: null };
var parts = ['blah', ' ', 'blah', ' ', 'blah'];
(function () { return lexer.invoke(dsl, parts); }).should.throw("SQiggLLexerError: Unable to determine expression type of 'blah blah blah'");
```

<a name="lexer"></a>
# Lexer
should throw an error if a query contains an incomplete statement.

```js
var lexer = new lexer_1.Lexer();
(function () { return lexer.parse('SELECT * FROM {Table'); }).should.throw('SQiggLLexerError: Expected statement to complete before end of file.');
```

should throw an throw an error if a query does not close a statement before declaring another.

```js
var lexer = new lexer_1.Lexer();
(function () { return lexer.parse('SELECT * FROM {Table WHERE id = {12}'); }).should.throw('SQiggLLexerError: Unexpected \'{\' found in statement. Expected \'}\'.');
```

should throw an error if a query is incorrectly nested.

```js
var lexer = new lexer_1.Lexer();
var query = 'SELECT * FROM {% if 12 > 13} Test {% endif } {% endif }';
(function () { return lexer.parse(query); }).should.throw('SQiggLLexerError: Your SQiggL is incorrectly nested.');
```

should throw an error if a query is incompletely nested.

```js
var lexer = new lexer_1.Lexer();
var query = 'SELECT * FROM {% if 12 > 13 } Test';
(function () { return lexer.parse(query); }).should.throw('SQiggLLexerError: Your SQiggL query is nested but does not return to the top level before completing. Please check your nesting.');
```

should correctly handle escaped single quotes in strings.

```js
var lexer = new lexer_1.Lexer();
var query = "SELECT * FROM {'Dragon\\'s run'}";
var result = lexer.parse(query);
result[1].replacement.literal.should.equal("'Dragon's run'");
```

should correctly handle escaped double quotes in strings.

```js
var lexer = new lexer_1.Lexer();
var query = "SELECT * FROM {\"Dragon\\\"s run\"}";
var result = lexer.parse(query);
result[1].replacement.literal.should.equal('"Dragon"s run"');
```

should correctly handle an escaped escape character in strings.

```js
var lexer = new lexer_1.Lexer();
var query = "SELECT * FROM {'Me\\\\You'}";
var result = lexer.parse(query);
result[1].replacement.literal.should.equal("'Me\\You'");
```

should throw an error if an illegal escape character exists in a string.

```js
var lexer = new lexer_1.Lexer();
var query = "SELECT * FROM {'\\Something'}";
(function () { return lexer.parse(query); }).should.throw("SQiggLLexerError: Illegal escape character found in string '\\Something' at index 1");
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
var result = lexer.parse('SELECT * FROM (table)');
result[0].should.have.property('text');
result[1].should.have.property('replacement');
```

<a name="lexer-text"></a>
## text
should return a non-special query unaltered.

```js
var lexer = new lexer_1.Lexer();
var query = 'SELECT * FROM Table';
var result = lexer.parse(query);
result[0].should.have.property('text', query);
```

should retain whitespace on text.

```js
var lexer = new lexer_1.Lexer();
var query = ' SELECT * FROM Table   ';
var result = lexer.parse(query);
result[0].should.have.property('text', query);
```

should respect newlines in non-special areas.

```js
var lexer = new lexer_1.Lexer();
var query = 'SELECT * \nFROM Table';
var result = lexer.parse(query);
result[0].should.have.property('text', query);
```

<a name="lexer-replacement"></a>
## replacement
should find a replacement in a given string.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.parse('SELECT * FROM {table}');
result[1].should.have.property('replacement');
```

should return a literal for a replacement in a given string.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.parse('SELECT * FROM {table}');
result[1].should.have.property('replacement', { literal: 'table' });
```

should trim whitespace on replacements.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.parse('{ table }');
result[0].should.have.property('replacement', { literal: 'table' });
```

should remove newlines from replacements.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.parse('{\n something }');
result[0].should.have.property('replacement', { literal: 'something' });
```

<a name="lexer-command"></a>
## command
should find a command in a given string.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.parse('{% if command } {% endif}');
result[0].should.have.property('command');
```

should return a literal for a command in a given string.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.parse('{%if command} {%endif}');
result[0].command.should.have.property('literal', 'if command');
```

should trim whitespace on commands.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.parse('{% if command } {%endif}');
result[0].command.should.have.property('literal', 'if command');
```

should remove newlines from commands.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.parse('{% if\ncommand} {%endif}');
result[0].command.should.have.property('literal', 'if command');
```

should reduce multiple whitespace characters to a single space.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.parse('{% if      command} {%endif}');
result[0].command.should.have.property('literal', 'if command');
```

should find multiple commands in a given string.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.parse('SELECT * FROM {% if table = \'Test\' } TestTable {% else } ProdTable {% endif }');
result[1].command.should.have.property('literal', 'if table = \'Test\'');
result[2].command.should.have.property('literal', 'else');
result[3].command.should.have.property('literal', 'endif');
```

should correctly identify the action of a command in a given string.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.parse('SELECT * FROM {% if } {%endif}');
var dsl = result[1];
var command = dsl.command;
command.action.should.have.property('key', 'if');
```

should correct identify the action of a command despite casing.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.parse('SELECT * FROM {% iF } {%endif}');
var dsl = result[1];
var command = dsl.command;
command.action.should.have.property('key', 'if');
```

<a name="lexer-comment"></a>
## comment
should find a comment in a given string.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.parse('SELECT * FROM {# something }');
result[1].should.have.property('comment', 'something');
```

should trim whitespace on comments.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.parse('{# test comment }');
result[0].should.have.property('comment', 'test comment');
```

<a name="lexer-variable"></a>
## variable
should find variable declarations in a given string.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.parse('{+ key:value }');
result[0].should.have.property('variable');
```

should remove all whitespace from variable declarations.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.parse('{+ key : value }');
result[0].variable.should.have.property('literal', 'key:value');
```

should also remove newlines from variable declarations.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.parse('{+ key : \n value }');
result[0].variable.should.have.property('literal', 'key:value');
```

should correctly set a key and value.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.parse("{+ dragon:'cat' }");
result[0].variable.should.have.property('key');
result[0].variable.should.have.property('value');
```

should correctly set the value of key and value.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.parse("{+ dragon:'cat' }");
result[0].variable.should.have.property('key', 'dragon');
result[0].variable.should.have.property('value', "'cat'");
```

should correctly handle a variable with an opposite quote inside a string value.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.parse("{+ dragon: \"Felix's pet\" }");
result[0].variable.should.have.property('key', 'dragon');
result[0].variable.should.have.property('value', "\"Felix's pet\"");
```

<a name="lexer-scope"></a>
## scope
should determine the correct level of items nested in actions.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.parse('SELECT * FROM {% if table = \'Test\' } TestTable {% else } ProdTable {% endif }');
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
var result = lexer.parse('{12 > 13}');
result[0].replacement.should.have.property('expression');
```

should detect an expression in a replacement with a modifier.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.parse('{12 !< 13}');
result[0].replacement.should.have.property('expression');
```

should correctly identify a modifier in an expression.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.parse('{12 !> 13}');
result[0].replacement.should.have.property('modifiers');
result[0].replacement.modifiers[0].should.equal(modifiers_1.Not);
```

should correctly identify the values in an expression.

```js
var lexer = new lexer_1.Lexer();
var result = lexer.parse('{12 > 13}');
result[0].replacement.values[0].should.equal('12');
result[0].replacement.values[1].should.equal('13');
```

<a name="expressionparser"></a>
# ExpressionParser
<a name="expressionparser-parse"></a>
## parse
should correctly return false if an expression should be false.

```js
var dsl = { expression: expressions_1.GreaterThan, values: ['12', '13'], literal: '12 > 13' };
var result = new expression_parser_1.ExpressionParser(parser_1.DEFAULT_PARSER_OPTIONS).parse(dsl);
result.should.eql(false);
```

should correctly return true if an expression should be true.

```js
var dsl = { literal: '13 > 12', expression: expressions_1.GreaterThan, values: ['13', '12'] };
var result = new expression_parser_1.ExpressionParser(parser_1.DEFAULT_PARSER_OPTIONS).parse(dsl);
result.should.eql(true);
```

should output the result of a boolean expression with variables.

```js
var dsl = { literal: 'high > low', expression: expressions_1.GreaterThan, values: ['high', 'low'] };
var result = new expression_parser_1.ExpressionParser(parser_1.DEFAULT_PARSER_OPTIONS).parse(dsl, { high: 13, low: 12 });
result.should.eql(true);
```

should correctly return true if an expression is false but then negated with a modifier.

```js
var dsl = { literal: '12 > 13', expression: expressions_1.GreaterThan, values: ['12', '13'], modifiers: [modifiers_1.Not] };
var result = new expression_parser_1.ExpressionParser(parser_1.DEFAULT_PARSER_OPTIONS).parse(dsl);
result.should.equal(true);
```

<a name="command-parser"></a>
# Command Parser
should correctly return a string in a StartingAction that is false.

```js
var dsl = { command: { literal: 'if 12 > 13', action: actions_1.If, expression: expressions_1.GreaterThan, values: ['12', '13'] } };
var result = new command_parser_1.CommandParser(parser_1.DEFAULT_PARSER_OPTIONS).parse(dsl);
result.should.equal('');
```

should correctly return a string in a StartingAction that is true.

```js
var dsl = { command: { literal: 'if 13 > 12', action: actions_1.If, expression: expressions_1.GreaterThan, values: ['13', '12'] }, scope: [{ text: 'Hello World' }] };
var result = new command_parser_1.CommandParser(parser_1.DEFAULT_PARSER_OPTIONS).parse(dsl);
result.should.equal('Hello World');
```

should correctly return a string in a DependentAction.

```js
var dsl = { command: { literal: 'else', action: actions_1.Else, expression: null }, scope: [{ text: 'Merry Christmas' }] };
var result = new command_parser_1.CommandParser(parser_1.DEFAULT_PARSER_OPTIONS).parse(dsl);
result.should.equal('Merry Christmas');
```

should correctly return a string for an IterableCommand.

```js
var commandDSL = { literal: 'for cat of catTypes using \', \'', action: actions_1.For, expression: expressions_1.IterableOfUsing, local: 'cat', values: [['hairy', 'furry', 'fuzzy']], joiner: '\',\'' };
var textDSL = { text: 'Hello ' };
var replacementDSL = { literal: 'cat', expression: null };
var dsl = { command: commandDSL, scope: [textDSL, { replacement: replacementDSL }] };
var result = new command_parser_1.CommandParser(parser_1.DEFAULT_PARSER_OPTIONS).parse(dsl);
result.should.equal('Hello hairy, Hello furry, Hello fuzzy');
```

<a name="replacementparser"></a>
# ReplacementParser
<a name="replacementparser-parse"></a>
## parse
should output a literal string.

```js
var dsl = { literal: '\'Test string\'', expression: null };
var result = new replacement_parser_1.ReplacementParser(parser_1.DEFAULT_PARSER_OPTIONS).parse(dsl);
result.should.eql('Test string');
```

should output a literal number.

```js
var dsl = { literal: '12', expression: null };
var result = new replacement_parser_1.ReplacementParser(parser_1.DEFAULT_PARSER_OPTIONS).parse(dsl);
result.should.eql('12');
```

should output a variable value.

```js
var dsl = { literal: 'dragon', expression: null };
var result = new replacement_parser_1.ReplacementParser(parser_1.DEFAULT_PARSER_OPTIONS).parse(dsl, { dragon: 'Pet' });
result.should.eql('Pet');
```

should output the result of a boolean expression.

```js
var dsl = { literal: '12 > 13', expression: expressions_1.GreaterThan, values: ['12', '13'] };
var result = new replacement_parser_1.ReplacementParser(parser_1.DEFAULT_PARSER_OPTIONS).parse(dsl);
result.should.eql('0');
```

should output the result of a boolean expression with variables.

```js
var dsl = { literal: 'high > low', expression: expressions_1.GreaterThan, values: ['high', 'low'] };
var result = new replacement_parser_1.ReplacementParser(parser_1.DEFAULT_PARSER_OPTIONS).parse(dsl, { high: 13, low: 12 });
result.should.eql('1');
```

should output the result of an IterableExpression correctly.

```js
var dsl = { literal: 'cat of catTypes using \',\'', expression: expressions_2.IterableOfUsing, local: 'cat', values: [['hairy', 'furry', 'fuzzy']], joiner: '\',\'' };
var result = new replacement_parser_1.ReplacementParser(parser_1.DEFAULT_PARSER_OPTIONS).parse(dsl);
result.should.equal('hairy, furry, fuzzy');
```

should output the result of an IterableExpression correctly using variables.

```js
var dsl = { literal: 'cat of catTypes using \',\'', expression: expressions_2.IterableOfUsing, local: 'cat', values: ['array'], joiner: 'joiner' };
var result = new replacement_parser_1.ReplacementParser(parser_1.DEFAULT_PARSER_OPTIONS).parse(dsl, { array: ['hairy', 'furry', 'fuzzy'], joiner: ',' });
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
parser.parse([{ variable: { literal: 'cat:sound', key: 'cat', value: 'sound' } }], { sound: 'meow' });
```

<a name="parser-resolvevalue"></a>
## resolveValue
should correctly output a string literal using single quotes.

```js
var result = parser_1.Parser.resolveValue('\'Hello\'', null);
result.should.equal('Hello');
```

should correctly output a string literal using double quotes.

```js
var result = parser_1.Parser.resolveValue('"Hello"', null);
result.should.equal('Hello');
```

should correctly output a number literal.

```js
var result = parser_1.Parser.resolveValue('12', null);
result.should.equal('12');
```

should correctly output a found variable value.

```js
var result = parser_1.Parser.resolveValue('cat', { cat: 'Dragon' });
result.should.equal('Dragon');
```

should throw an error if a variable value is undefined.

```js
(function () { return parser_1.Parser.resolveValue('cat', { dragon: 'Fish' }); }).should.throw('SQiggLParserError: cat is not a defined variable in this scope');
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
var result = SQiggL.parse('SELECT * FROM Table {# this is the client\'s table}', null, { exportComments: true });
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

<a name="full-feature-sweep-query-with-newlines"></a>
## "query with newlines"
should accept newlines in queries.

```js
var sql = "UPDATE Names\n{% if example is not null }\nSET Name = '{example}'\n{% else } SET Name = 'Cow'\n{% endif }\nWHERE Name = 'Awesome'";
var result = "UPDATE Names\n\nSET Name = 'Dragon'\n\nWHERE Name = 'Awesome'";
var actual = SQiggL.parse(sql, { example: 'Dragon' });
actual.should.equal(result);
```

