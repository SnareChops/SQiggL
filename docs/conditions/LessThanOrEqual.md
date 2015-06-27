<a name="LessThanOrEqual"></a>
## LessThanOrEqual
**Kind**: global class  
**Implements:** <code>ICondition</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| variable | <code>string</code> | Variable to test condition against |
| variables | <code>IVariables</code> | Variables within the scope of this condition |


* [LessThanOrEqual](#LessThanOrEqual)
  * [new LessThanOrEqual(variable, variables)](#new_LessThanOrEqual_new)
  * _instance_
    * [.perform()](#LessThanOrEqual+perform) ⇒ <code>boolean</code>
  * _static_
    * [.regex](#LessThanOrEqual.regex)

<a name="new_LessThanOrEqual_new"></a>
### new LessThanOrEqual(variable, variables)
The <= condition


| Param | Type | Description |
| --- | --- | --- |
| variable | <code>string</code> | Variable to test condition against |
| variables | <code>IVariables</code> | Variables within the scope of this condition |

<a name="LessThanOrEqual+perform"></a>
### lessThanOrEqual.perform() ⇒ <code>boolean</code>
**Kind**: instance method of <code>[LessThanOrEqual](#LessThanOrEqual)</code>  
**Returns**: <code>boolean</code> - Outcome of applying the condition to the variable  
**Access:** public  
<a name="LessThanOrEqual.regex"></a>
### LessThanOrEqual.regex
**Kind**: static property of <code>[LessThanOrEqual](#LessThanOrEqual)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| The | <code>RegExp</code> | regex matcher |

