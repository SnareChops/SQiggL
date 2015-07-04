<a name="GreaterThan"></a>
## GreaterThan
**Kind**: global class  
**Implements:** <code>ICondition</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| variable | <code>string</code> | Variable to test condition against |
| variables | <code>IVariables</code> | Variables within the scope of this condition |


* [GreaterThan](#GreaterThan)
  * [new GreaterThan(variable, variables)](#new_GreaterThan_new)
  * _instance_
    * [.perform()](#GreaterThan+perform) ⇒ <code>boolean</code>
  * _static_
    * [.modifiers](#GreaterThan.modifiers)

<a name="new_GreaterThan_new"></a>
### new GreaterThan(variable, variables)
The > condition


| Param | Type | Description |
| --- | --- | --- |
| variable | <code>string</code> | Variable to test condition against |
| variables | <code>IVariables</code> | Variables within the scope of this condition |

<a name="GreaterThan+perform"></a>
### greaterThan.perform() ⇒ <code>boolean</code>
**Kind**: instance method of <code>[GreaterThan](#GreaterThan)</code>  
**Returns**: <code>boolean</code> - Outcome of applying the condition to the variable  
**Access:** public  
<a name="GreaterThan.modifiers"></a>
### GreaterThan.modifiers
**Kind**: static property of <code>[GreaterThan](#GreaterThan)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| The | <code>RegExp</code> | regex matcher |

