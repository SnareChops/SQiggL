<a name="IsNull"></a>
## IsNull
**Kind**: global class  
**Implements:** <code>ICondition</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| variable | <code>string</code> | Variable to test condition against |
| variables | <code>IVariables</code> | Variables within the scope of this condition |


* [IsNull](#IsNull)
  * [new IsNull(variable, variables)](#new_IsNull_new)
  * _instance_
    * [.perform()](#IsNull+perform) ⇒ <code>boolean</code>
  * _static_
    * [.modifiers](#IsNull.modifiers)

<a name="new_IsNull_new"></a>
### new IsNull(variable, variables)
The Is Null condition


| Param | Type | Description |
| --- | --- | --- |
| variable | <code>string</code> | Variable to test condition against |
| variables | <code>IVariables</code> | Variables within the scope of this condition |

<a name="IsNull+perform"></a>
### isNull.perform() ⇒ <code>boolean</code>
**Kind**: instance method of <code>[IsNull](#IsNull)</code>  
**Returns**: <code>boolean</code> - Outcome of applying the condition to the variable  
**Access:** public  
<a name="IsNull.modifiers"></a>
### IsNull.modifiers
**Kind**: static property of <code>[IsNull](#IsNull)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| The | <code>RegExp</code> | regex matcher |

