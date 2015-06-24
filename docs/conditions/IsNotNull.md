<a name="IsNotNull"></a>
## IsNotNull
**Kind**: global class  
**Implements:** <code>ICondition</code>  

* [IsNotNull](#IsNotNull)
  * [new IsNotNull(variable)](#new_IsNotNull_new)
  * _instance_
    * [.perform()](#IsNotNull+perform) ⇒ <code>boolean</code>
  * _static_
    * [.regex](#IsNotNull.regex)

<a name="new_IsNotNull_new"></a>
### new IsNotNull(variable)
The Is Not Null condition


| Param | Type | Description |
| --- | --- | --- |
| variable | <code>string</code> | Variable to test condition against |
|  | <code>IVariables</code> | Variables within the scope of this condition |

<a name="IsNotNull+perform"></a>
### isNotNull.perform() ⇒ <code>boolean</code>
**Kind**: instance method of <code>[IsNotNull](#IsNotNull)</code>  
**Returns**: <code>boolean</code> - Outcome of applying the condition to the variable  
**Access:** public  
<a name="IsNotNull.regex"></a>
### IsNotNull.regex
**Kind**: static property of <code>[IsNotNull](#IsNotNull)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| The | <code>RegExp</code> | regex matcher |

