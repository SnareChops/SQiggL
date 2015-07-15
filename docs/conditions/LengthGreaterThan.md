<a name="LengthGreaterThan"></a>
## LengthGreaterThan ⇐ <code>Condition</code>
**Kind**: global class  
**Extends:** <code>Condition</code>  
**Implements:** <code>ICondition</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| variable | <code>string</code> | Variable to test condition against |
| variables | <code>IVariables</code> | Variables within the scope of this condition |
| comparative | <code>string</code> | Value to compare variable against |
| mod1 | <code>string</code> | Identifier of first modifier, or null |
| mod2 | <code>string</code> | Identifier of second modifier, or null |
| modifiers | <code>Array.&lt;IModifier&gt;</code> | Array of modifiers found in condition, in order |


* [LengthGreaterThan](#LengthGreaterThan) ⇐ <code>Condition</code>
  * [new LengthGreaterThan(variable, variables, comparative, mod1, mod2)](#new_LengthGreaterThan_new)
  * _instance_
    * [.perform()](#LengthGreaterThan+perform) ⇒ <code>boolean</code>
  * _static_
    * [.modifiers](#LengthGreaterThan.modifiers)
    * [.regex](#LengthGreaterThan.regex)
    * [.extract()](#LengthGreaterThan.extract) ⇒ <code>[LengthGreaterThan](#LengthGreaterThan)</code> &#124; <code>null</code>

<a name="new_LengthGreaterThan_new"></a>
### new LengthGreaterThan(variable, variables, comparative, mod1, mod2)
The len> condition


| Param | Type | Description |
| --- | --- | --- |
| variable | <code>string</code> | Variable to test condition against |
| variables | <code>IVariables</code> | Variables within the scope of this condition |
| comparative | <code>string</code> | Value to compare variable against |
| mod1 | <code>string</code> | Identifier of first modifier, or null |
| mod2 | <code>string</code> | Identifier of second modifier, or null |

<a name="LengthGreaterThan+perform"></a>
### lengthGreaterThan.perform() ⇒ <code>boolean</code>
**Kind**: instance method of <code>[LengthGreaterThan](#LengthGreaterThan)</code>  
**Returns**: <code>boolean</code> - Outcome of applying the condition to the variable  
**Access:** public  
<a name="LengthGreaterThan.modifiers"></a>
### LengthGreaterThan.modifiers
**Kind**: static property of <code>[LengthGreaterThan](#LengthGreaterThan)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| Array | <code>Array.&lt;IModifier&gt;</code> | of possible modifiers to check against |

<a name="LengthGreaterThan.regex"></a>
### LengthGreaterThan.regex
**Kind**: static property of <code>[LengthGreaterThan](#LengthGreaterThan)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| The | <code>RegExp</code> | regex matcher |

<a name="LengthGreaterThan.extract"></a>
### LengthGreaterThan.extract() ⇒ <code>[LengthGreaterThan](#LengthGreaterThan)</code> &#124; <code>null</code>
Extracts the variable, comparative, and any modifiers in the condition

**Kind**: static method of <code>[LengthGreaterThan](#LengthGreaterThan)</code>  
**Returns**: <code>[LengthGreaterThan](#LengthGreaterThan)</code> &#124; <code>null</code> - Instance of LengthGreaterThan ready for execution  
