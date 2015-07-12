#SQiggL-js 

[![Build Status](https://travis-ci.org/SnareChops/SQiggL-js.svg?branch=master)](https://travis-ci.org/SnareChops/SQiggL-js)

A javascript version of SQiggL

##Getting Started:

First install SQiggL with

```
npm install sqiggl
```

Next `require` it in your node application using

```
var SQiggL = require('sqiggl').default;
```

Supply a query to be parsed and any variables

```
var result = SQiggL.parse("UPDATE Names {{% if example is not null %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'", {example: 'Dragon'});
```

_Note: All variables must be strings, this is a limitation of the current version and will be resolved in the next version. For example: `{num: '12'}` will behave as expected, `{num: 12}` will not_ 

Finally log your result, or use it in a database request

```
console.log(result);
```

_Note: SQiggL does NOT protect against SQL injection. Passing a dangerous string into a SQiggL variable will result in an unsafe query. NEVER trust user input, use SQiggL with caution!_

##Terminology
Word | Meaning | Examples
-----|---------|---------
Action | This is the main keyword for "doing" something | `if, else, endif, unless, with, ...`
Condition | These are the operators that perform a comparison | `=, >, <, len>, abc>, ...`
Modifier | This is an operator that modifies the result of a condition | `!, =, not, ...`

_`=` is both a condition and a modifier depending on which position it is in, For example `>=` is a modifier, `!=` is a condition. This is because `>` is the condition in the first example and `=` is a modifier that then checks if the result is equal when `>` is false. Also it is good to note that modifiers are executed after the condition and then from right to left. Please see the [SQiggL site](https://snarechops.github.io/SQiggL-js/#/docs/) for a more detailed explanation_

##Current Features 

_If you have not yet read the terminology section above, please do so. SQiggL does not use the standard set of terms for programming languages and there is a fundamental difference in the way the language is parsed that causes this. I feel it is an improvement and allows for some really neat features, that said, it may be a little confusing at first_

SQiggL currently supports the following actions: `if, else, endif`

The following conditions are supported:

condition | rule
---------|-----
is not null | is not null
is null | is null
`>` | greater than
`<` | less than
`>=` | greater than or equal to
`<=` | less than or equal to
`!>` | not greater than
`!<` | not less than
`!>=` | not greater than or equal
`!<=` | not less than or equal
`!=` | not equal to (also "!==" is supported)
`=` | equal to (both "==" and "===" are synonyms for convenience)

_Note: More condition/modifier combinations exist, and are pretty cool, but very uncommon in modern languages. You can find out more about them on the [SQiggL site](https://snarechops.github.io/SQiggL-js/#/docs/)_

Also variables can be replaced in queries using `{{ }}`
```SET Something = '{{ myVar }}'```
with a value of "Hello" for `myVar` will result in
```SET Something = 'Hello'```

Examples: 
```
UPDATE Something 
SET {{% if myVar is not null %}} 
    FirstName = '{{ myVar }}'
{{% else %}}
    FirstName = 'Default' 
{{% end %}}
WHERE ID = 1
```

```
UPDATE Something 
SET {{% if myVar > 12 %}} 
    Value = {{ myVar }} 
{{% else %}}
    Value = {{ minimum }} 
{{% end %}}
WHERE ID = 1
```

This is just a taste of what SQiggL can do, there is a more detailed usage guide on the [SQiggL site](https://snarechops.github.io/SQiggL-js/#/docs/)

##Milestone 0.2 features:

This update will include a new action `unless` as well as the following new conditions:

condition | rule
---------|-----
`len>` | Length of the variable is greater than
`len<` | Length of the variable is less than
`len>=` | Length of the variable is greater than or equal
`len<=` | Length of the variabl is less than or equal
`is NaN` | Variable is not a number
`is not NaN` | Variable is a number
`><` | Value of the variable is between two numbers (ex: `12><14`)

I might also try to sneek coalesce into this update (ex: `myVar ?? otherVar`), but we'll have to see how it goes.

This will be a small update to expand the conditions of the language and fix any found issues.

##Milestone 0.3 features:

This update will include three new actions `with, for, endfor`. There will probably not be any new conditions for this release as it is a fairly large change in the language and I would like to get it done and out to the public before adding more conditions.

##Milestone 0.4 features:

This update will add a new concept to the language (though extremely familiar to us) `and, &&, or, ||`. These will do what you would expect: `{{% if myVar > 12 && myVar < 3 %}}`

new thing | rule
----------|-----
`and` | Only true if all conditions pass
`&&` | Same as `and`
`or` | True if any of the conditions pass
`||` | Same as `or`

##Milestone 0.5 features:

This update will add turnary statements to the language `if myVar > 12 then myVar else otherVar`. The other common syntax will also be supported `myVar > 12 ? myVar : otherVar`

#Extensible

SQiggL is an extensible language, in the future you will be able to add in new actions, conditions, modifiers, and other core features. Once the official 1.0 release drops there will be plugin instructions here explaining how.
