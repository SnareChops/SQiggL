# SQiggL

[![Circle CI](https://circleci.com/gh/SnareChops/SQiggL/tree/master.svg?style=svg)](https://circleci.com/gh/SnareChops/SQiggL/tree/master)
[![Code Climate](https://codeclimate.com/github/SnareChops/SQiggL/badges/gpa.svg)](https://codeclimate.com/github/SnareChops/SQiggL)
[![Test Coverage](https://codeclimate.com/github/SnareChops/SQiggL/badges/coverage.svg)](https://codeclimate.com/github/SnareChops/SQiggL/coverage)
[![Issue Count](https://codeclimate.com/github/SnareChops/SQiggL/badges/issue_count.svg)](https://codeclimate.com/github/SnareChops/SQiggL)

## What and Why?!?!?!

SQiggL is in active development to become the best SQL templating tool for DBAs and developers.
While modern ORMs are very feature rich sometimes you just need raw SQL to run, but would like a tool
that can help make those SQL files reusable and add some configuration options to them. SQiggL would
like to become your preferred SQL templating tool to accomplish this goal. Some example use cases could
be customizable SQL seed files for testing and DB setup, or dynamic query generation based on any rules
in your application. In reality SQiggL could be used to template any type of text file, but uses SQL as
it's main target audience.

SQiggL aims to provide a fully functional CLI with multiple file parsing abilities and a feature rich
templating language that is both **extensible** and powerful. It will have a plugin API that can be
used to add any features to the language and will allow for many supporting libraries to support it's core.

Many of these features are not yet available, but are all in active development. Contributions are more
than welcome and encouraged. The source code is **heavily** documented and would be the best place to
get started.

## Getting Started:

First install SQiggL with

```
npm install sqiggl
```

Next `require` it in your node application using

```
var SQiggL = require('sqiggl');
```

Supply a query to be parsed and any variables

```
var result = SQiggL.parse("UPDATE Names {% if example is not null } SET Name = '{example}' {% else } SET Name = 'Cow' {% endif } WHERE Name = 'Awesome'", {example: 'Dragon'});
``` 

Finally log your result, or use it in a database request

```
console.log(result);
```

**SQiggL does NOT protect against SQL injection. Passing a dangerous string into a SQiggL variable will
result in an unsafe query. NEVER trust user input, use SQiggL with caution!**

## Error Support

SQiggL is still young and new so error support is a little rough at the moment. Please create an issue if you receive an
error that you feel is an issue with library or encountered something that SQiggL should have thrown an error for. Help
SQiggL grow to have fantastic error support with error messages that actually help you instead of lead you down the wrong
path.

For the actual SQiggL error that you do receive at the moment, an [Error Guide](https://github.com/SnareChops/SQiggL/blob/master/errors.md)
has been created with all of the errors listed by code and full explanations of what the errors mean as well as common
mistakes that will cause them.

_Error messages are very limited at the moment, but will become a top priority once the API stabilizes at 1.0.0._

## Current Features

### Commands

A Command is a SQiggL statement that has an Action and an [Expression](#expressions). Commands are used to perform
manipulations to the query. For example a command with an `if` Action will conditionally include
text in your query.

Commands are surrounded by `{% }` in SQiggL queries.

SQiggL currently supports the following actions: *with more coming soon*

 action    | example
-----------|---------
`if`       | `{% if <boolean expression> } output this text {% endif }`
`unless`   | `{% unless <boolean expression> } output this text {% endunless }`
`else`     | `{% if <boolean expression> } output this {% else } output that {% endif }`
`for`      | `{% for <iterable expression> } output this {% endfor }`
`endif`    | *see `if` above*
`endunless`| *see `unless` above*
`endfor`   | *see `for` above*
`end`      | A generic `end` that works with all actions above.


`else` works with both `if` and `unless`.

*Notes:*
* An Action **must** be the first word in a command
* Only 1 action/expression pair may be defined in a single `{% }`. *Support for `and`, `or`, and complex expressions coming soon.*
* The `%` character is the default but is customizable. See [Configuration](#configuration) for more information.
* Custom actions may be added to provide more features. See [Extensible](#extensible) for more information.

### Replacements

A Replacement is an [Expression](#expressions) or a [Variable](#variables) that should be evaluated and
then injected into the final output at the location where it was defined.

Replacements are surrounded by `{ }`

 examples       | value of var  | output
--------------- |---------------|-------
`Hello {var}`   |   `World`     | `Hello World`
`Hello {'Cat'}` |               | `Hello Cat`
`Number {12}`   |               | `Number 12`
`{var > 13}`    |   `15`        | `1` *`1` is `true` in SQL*

*Notes:*
* Only 1 replacement is allowed per `{ }`. *Support for `and`, `or`, and complex expressions coming soon.*

### Expressions

Expressions are the main logic of SQiggL and can be used in [Commands](#commands) or [Replacements](#replacements)
and can also have [Modifiers](#modifiers) to extend their functionality.

There are 3 types of expressions:
* Boolean expressions return either `true` or `false`. *(Which resolve to `1` or `0` in the outputted SQL)*
* Value expressions return a value. *(a string or a number)*
* Iterable expressions return a collection of values that can be iterated over by a Replacement or a Command.

The following boolean expressions are supported:

expression| rule                     | example
----------|--------------------------|--------
`is null` | is null                  | `example is null`
`is NaN`  | is not a number          | `example is NaN`
`>`       | greater than             | `13 > 12`
`<`       | less than                | `12 < 13`
`=`       | equal to                 | `example = something`
`len>`    | length greater than      | `'SQiggL' len> 3`
`len<`    | length less than         | `'SQiggL' len< 10`
`abc>`    | lexical greater than     | `'Dragon' abc> 'Cat'`
`abc<`    | lexical less than        | `'Cat' abc< 'Dragon'`
`><`      | between                  | `10 5 >< 15`

The only iterable expression supported at the moment is

```
<var> of <collection> using <joiner>
```

which iterates a collection of values.

In a `For` command the `<var>` will be set as a local variable on the current scope and will contain
the current value of `<collection>`. The output of each iteration of the command will be separated by
the `<joiner>`. See the [Examples](#examples) below for more information.

In a `For` replacement the `<var>` is ignored and will instead output each value in the `<collection>`
separated by the `<joiner>`

*Notes:*
* Arithmetic is not currently supported.
* Expressions cannot currently be grouped or nested at this time

### Conjunctions

A Conjunction is a connector that combines multiple [Expressions](#expressions)
into one outcome. Example: `{% if myVar > 12 || myVar < 3 %}`

conjunction | rule
------------|-----
`and`       | Only true if all conditions pass
`&&`        | Same as `and`
`or`        | True if any of the conditions pass
`||`        | Same as `or`


### Variables

Variables be defined in the SQiggL query, or can be provided as the second argument to `SQiggL.parse`.
Variables also honor their scope within a query. For example a variable defined in an `if` action will
be undefined outside of that action.

Variables are defined in this syntax: `{+ key : 'value' }`
Variables can also be aliased by other variables

### Modifiers

Modifiers add additional features to [Expressions](#expressions). Each expression defines what modifiers
it can use and where they can be located in the expression.

modifier    | general rule (Each implementation may be slightly different) | examples
------------|--------------------------------------------------------------|---------
`=`         | Returns true if the expression is equal                      | `13 >= 13` `10 5 >=< 10`
`!` or `not`| Negates the result of the expression                         | `var is not null` `'it' !len> 3`

### Examples

```
{+ myVar : 'Bob' }
UPDATE Something 
SET
{% if myVar is not null }
    FirstName = '{ myVar }'
{% else }
    FirstName = 'Default' 
{% end }
WHERE ID = 1
```

```
{+ isAdmin: 1 }
{+ fields:['FirstName', 'LastName', 'Birthdate'] }
SELECT {var of fields using ','} FROM TableA;
SELECT {var of fields using ','} FROM TableB WHERE Admin = {isAdmin};
```

This is just a taste of what SQiggL can do and it is already capable of much more but many many more more
features are coming soon.

## Configuration

SQiggL can be configured and includes the following options that can be passed in as an object in the third argument to `parse()`.

 option                  | type            | default | description
-------------------------|-----------------|---------|-
`leftWrapperChar`        | `string`        | `{`     | Sets the left wrapper character to use for SQiggL statements.
`rightWrapperChar`       | `string`        | `}`     | Sets the right wrapper character to use for SQiggL statements.
`commandChar`            | `string`        | `%`     | Sets the character to denote a command statement
`variableChar`           | `string`        | `+`     | Sets the character to denote a variable statement
`commentChar`            | `string`        | `#`     | Sets the character to denote a comment statement
`variableAssignmentChar` | `string`        | `:`     | Sets the character that goes between a variable key and value
`stringEscapeChar`       | `string`        | `\`     | Sets the character to use as the string escape character
`customActions`          | `Action[]`      | `null`  | Sets any custom actions to use
`customExpressions`      | `Expression[]`  | `null`  | Sets any custom expressions to use
`customModifiers`        | `Modifier[]`    | `null`  | Sets any custom modifiers to use
`customConjunctions`     | `Conjunction[]` | `null`  | Sets any custom conjunctions to use
`includeCoreLibrary`     | `boolean`       | `true`  | Set to false to **only** use custom actions, expression, modifiers, and conjunctions.
`exportComments`         | `boolean`       | `false` | Sets whether SQiggL comments should be outputted as SQL comments
`commentBeginning`       | `string`        | `/*`    | Sets the SQL comment beginning string
`commentEnding`          | `string`        | `*/`    | Sets the SQL comment end string
`trueString`             | `string`        | `1`     | Sets the string to use for `true`
`falseString`            | `string`        | `0`     | Sets the string to use for `false`

## Extensible

SQiggL is an extensible language, in the future you will be able to add in new actions, expressions,
modifiers, and other core features. Once the official 1.0 release drops there will be plugin instructions
here explaining how. *Technically it's possible to extend SQiggL now, the hooks are in the options, but
actual support for this will come when the API stabilizes*

## Milestone 0.5 features:

This update will add ternary statements to the language `if myVar > 12 then myVar else otherVar`.
The other common syntax will also be supported `myVar > 12 ? myVar : otherVar`.

## Milestone 0.6 features:

This update will add basic arithmetic to expressions and hopefully the ability to nest expressions within
other expressions.

## Milestone 0.7 features:

This update will add a CLI interface.
