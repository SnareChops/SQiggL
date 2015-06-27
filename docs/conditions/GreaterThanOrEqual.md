<a name="GreaterThanOrEqual"></a>
## GreaterThanOrEqual
**Kind**: global class  
**Implements:** <code>ICondition</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| variable | <code>string</code> | Variable to test condition against |
| variables | <code>IVariables</code> | Variables within the scope of this condition |


* [GreaterThanOrEqual](#GreaterThanOrEqual)
  * [new GreaterThanOrEqual(variable, variables)](#new_GreaterThanOrEqual_new)
  * _instance_
    * [.perform()](#GreaterThanOrEqual+perform) ⇒ <code>boolean</code>
  * _static_
    * [.regex](#GreaterThanOrEqual.regex)

<a name="new_GreaterThanOrEqual_new"></a>
### new GreaterThanOrEqual(variable, variables)
The >= condition


| Param | Type | Description |
| --- | --- | --- |
| variable | <code>string</code> | Variable to test condition against |
| variables | <code>IVariables</code> | Variables within the scope of this condition |

<a name="GreaterThanOrEqual+perform"></a>
### greaterThanOrEqual.perform() ⇒ <code>boolean</code>
**Kind**: instance method of <code>[GreaterThanOrEqual](#GreaterThanOrEqual)</code>  
**Returns**: <code>boolean</code> - Outcome of applying the condition to the variable  
**Access:** public  
<a name="GreaterThanOrEqual.regex"></a>
### GreaterThanOrEqual.regex
**Kind**: static property of <code>[GreaterThanOrEqual](#GreaterThanOrEqual)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| The | <code>RegExp</code> | regex matcher |

