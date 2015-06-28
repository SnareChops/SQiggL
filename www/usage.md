#tl;dr;

SQiggL (currently) supports the keywords `if else endif` and the operators `is null, is not null, >, <, >=, <=, ==`

Example:
```
    UPDATE Something SET 
        {{% if myVar is not null %}} 
            FirstName = '{{ myVar }}' 
        {{% else %}} 
            FirstName = 'Default' 
        {{% end %}} 
    WHERE ID = 1 
```

#Usage

SQiggL keywords go between `{{%` and `%}}`. (This will be configurable in the future)

##if, else, endif

Writing an if statement will conditionally include or ignore statements in your SQL based on the variables that have been passed to the parser. For example lets consider the following statement:
```
    UPDATE Something SET 
        {{% if myVar is not null %}} 
            FirstName = '{{ myVar }}'
        {{% else %}} 
            FirstName = 'Default' 
        {{% end %}} 
    WHERE ID = 1 
```
Let's then assume we passed in a value of `Bob` for `myVar`, the output would be the following:
```
    UPDATE Something SET 
        FirstName = 'Bob' 
    WHERE ID = 1 
```
Inversely, if we did not pass a value in for `myVar` then the result would be:
```
    UPDATE Something SET 
        FirstName = 'Default' 
    WHERE ID = 1 
```

##Variables
Currently all variables are global and are passed in as the second argument to the parser:
```
    SQiggL.parse('SELECT {{ myVar }} FROM {{ myTable }}', {myTable: 'Customers', myVar: 'Name'});
```
In future versions there will be ways to declare scoped and global variables within the query.

##> < >= <=
SQiggL supports `> < >= <=` for numbers only currently. There are plans to support unique operators to assist in other situations, for example: `len>` or `abc>` being "length greater than" and "alphabetically greater than" respectively. Have suggestions for operators, or would like to ask questions, please submit [an issue](https://github.com/SnareChops/SQiggL-js/issues) and I'd love to discuss any ideas or complaints.
```
    UPDATE Something SET 
        {{% if myVar > 100 %}} 
            Rank =  {{ myVar }}
        {{% else %}} 
            Rank = 0 
        {{% end %}} 
    WHERE ID = 1
```