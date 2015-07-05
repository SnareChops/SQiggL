<a name="Equal"></a>
## Equal
**Kind**: global class  
**Implements:** <code>ICondition</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| variable | <code>string</code> | Variable to test condition against |
| variables | <code>IVariables</code> | Variables within the scope of this condition |


* [Equal](#Equal)
  * [new Equal(variable, variables)](#new_Equal_new)
  * _instance_
    * [.perform()](#Equal+perform) ⇒ <code>boolean</code>
  * _static_
    * [.modifiers](#Equal.modifiers)

<a name="new_Equal_new"></a>
### new Equal(variable, variables)
The == condition


| Param | Type | Description |
| --- | --- | --- |
| variable | <code>string</code> | Variable to test condition against |
| variables | <code>IVariables</code> | Variables within the scope of this condition |

<a name="Equal+perform"></a>
### equal.perform() ⇒ <code>boolean</code>
**Kind**: instance method of <code>[Equal](#Equal)</code>  
**Returns**: <code>boolean</code> - Outcome of applying the condition to the variable  
**Access:** public  
<a name="Equal.modifiers"></a>
### Equal.modifiers
**Kind**: static property of <code>[Equal](#Equal)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| The | <code>RegExp</code> | regex matcher |

