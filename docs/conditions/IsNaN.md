<a name="IsNaN"></a>
## IsNaN
**Kind**: global class  
**Implements:** <code>ICondition</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| variable | <code>string</code> | Variable to test condition against |
| variables | <code>IVariables</code> | Variables within the scope of this condition |


* [IsNaN](#IsNaN)
  * [new IsNaN(variable, variables)](#new_IsNaN_new)
  * _instance_
    * [.perform()](#IsNaN+perform) ⇒ <code>boolean</code>
  * _static_
    * [.regex](#IsNaN.regex)

<a name="new_IsNaN_new"></a>
### new IsNaN(variable, variables)
The Is NaN condition


| Param | Type | Description |
| --- | --- | --- |
| variable | <code>string</code> | Variable to test condition against |
| variables | <code>IVariables</code> | Variables within the scope of this condition |

<a name="IsNaN+perform"></a>
### isNaN.perform() ⇒ <code>boolean</code>
**Kind**: instance method of <code>[IsNaN](#IsNaN)</code>  
**Returns**: <code>boolean</code> - Outcome of applying the condition to the variable  
**Access:** public  
<a name="IsNaN.regex"></a>
### IsNaN.regex
**Kind**: static property of <code>[IsNaN](#IsNaN)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| The | <code>RegExp</code> | regex matcher |

