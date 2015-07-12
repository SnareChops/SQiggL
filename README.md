#SQiggL-js 

[![Build Status](https://travis-ci.org/SnareChops/SQiggL-js.svg?branch=master)](https://travis-ci.org/SnareChops/SQiggL-js)

A javascript version of SQiggL

`npm install sqiggl`

##Milestone 0.1 features:

`if, else, endif`

operator | rule
---------|-----
is not null |  
is null |
> | greater than
< | less than
>= | greater than or equal to
<= | less than or equal to
!> | not greater than
!< | not less than
!= | not equal to
= | equal to (both "==" and "===" are synonyms for convenience)

examples: 
```
UPDATE Something 
SET {{% if myVar is not null %}} 
    FirstName = {{ myVar }} 
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

##Milestone 0.2 features:

```
	if
		len>
		len<
		len>=
		len<=
		is NaN
		is not NaN
		exists
		!exists
	unless
	for
```


##Milestone 0.3 features:

```
	if
		12><14	#between 12 and 14
	&&
	and
	||
	or
	if then
	??
```
#Extensible

SQiggL is an extensible language, in the future you will be able to add in new operators and core features. Once the official release drops there will be plugin instructions here explaining how.
