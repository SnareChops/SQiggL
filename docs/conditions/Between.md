<a name="Between"></a>
## Between
**Kind**: global class  
**Implements:** <code>ICondition</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| variable | <code>string</code> | Variable to test condition against |
| variables | <code>IVariables</code> | Variables within the scope of this condition |


* [Between](#Between)
  * [new Between(variable, variables)](#new_Between_new)
  * _instance_
    * [.perform()](#Between+perform) ⇒ <code>boolean</code>
  * _static_
    * [.regex](#Between.regex)

<a name="new_Between_new"></a>
### new Between(variable, variables)
The Is Null condition


| Param | Type | Description |
| --- | --- | --- |
| variable | <code>string</code> | Variable to test condition against |
| variables | <code>IVariables</code> | Variables within the scope of this condition |

<a name="Between+perform"></a>
### between.perform() ⇒ <code>boolean</code>
**Kind**: instance method of <code>[Between](#Between)</code>  
**Returns**: <code>boolean</code> - Outcome of applying the condition to the variable  
**Access:** public  
<a name="Between.regex"></a>
### Between.regex
**Kind**: static property of <code>[Between](#Between)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| The | <code>RegExp</code> | regex matcher |

