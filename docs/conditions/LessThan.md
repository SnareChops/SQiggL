<a name="LessThan"></a>
## LessThan
**Kind**: global class  
**Implements:** <code>ICondition</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| variable | <code>string</code> | Variable to test condition against |
| variables | <code>IVariables</code> | Variables within the scope of this condition |


* [LessThan](#LessThan)
  * [new LessThan(variable, variables)](#new_LessThan_new)
  * _instance_
    * [.perform()](#LessThan+perform) ⇒ <code>boolean</code>
  * _static_
    * [.modifiers](#LessThan.modifiers)

<a name="new_LessThan_new"></a>
### new LessThan(variable, variables)
The < condition


| Param | Type | Description |
| --- | --- | --- |
| variable | <code>string</code> | Variable to test condition against |
| variables | <code>IVariables</code> | Variables within the scope of this condition |

<a name="LessThan+perform"></a>
### lessThan.perform() ⇒ <code>boolean</code>
**Kind**: instance method of <code>[LessThan](#LessThan)</code>  
**Returns**: <code>boolean</code> - Outcome of applying the condition to the variable  
**Access:** public  
<a name="LessThan.modifiers"></a>
### LessThan.modifiers
**Kind**: static property of <code>[LessThan](#LessThan)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| The | <code>RegExp</code> | regex matcher |

