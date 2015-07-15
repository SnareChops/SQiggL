<a name="AlphabeticallyGreaterThan"></a>
## AlphabeticallyGreaterThan ⇐ <code>Condition</code>
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


* [AlphabeticallyGreaterThan](#AlphabeticallyGreaterThan) ⇐ <code>Condition</code>
  * [new AlphabeticallyGreaterThan(variable, variables, comparative, mod1, mod2)](#new_AlphabeticallyGreaterThan_new)
  * _instance_
    * [.perform()](#AlphabeticallyGreaterThan+perform) ⇒ <code>boolean</code>
  * _static_
    * [.modifiers](#AlphabeticallyGreaterThan.modifiers)
    * [.regex](#AlphabeticallyGreaterThan.regex)
    * [.extract()](#AlphabeticallyGreaterThan.extract) ⇒ <code>LengthGreaterThan</code> &#124; <code>null</code>

<a name="new_AlphabeticallyGreaterThan_new"></a>
### new AlphabeticallyGreaterThan(variable, variables, comparative, mod1, mod2)
The abc> condition


| Param | Type | Description |
| --- | --- | --- |
| variable | <code>string</code> | Variable to test condition against |
| variables | <code>IVariables</code> | Variables within the scope of this condition |
| comparative | <code>string</code> | Value to compare variable against |
| mod1 | <code>string</code> | Identifier of first modifier, or null |
| mod2 | <code>string</code> | Identifier of second modifier, or null |

<a name="AlphabeticallyGreaterThan+perform"></a>
### alphabeticallyGreaterThan.perform() ⇒ <code>boolean</code>
**Kind**: instance method of <code>[AlphabeticallyGreaterThan](#AlphabeticallyGreaterThan)</code>  
**Returns**: <code>boolean</code> - Outcome of applying the condition to the variable  
**Access:** public  
<a name="AlphabeticallyGreaterThan.modifiers"></a>
### AlphabeticallyGreaterThan.modifiers
**Kind**: static property of <code>[AlphabeticallyGreaterThan](#AlphabeticallyGreaterThan)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| Array | <code>Array.&lt;IModifier&gt;</code> | of possible modifiers to check against |

<a name="AlphabeticallyGreaterThan.regex"></a>
### AlphabeticallyGreaterThan.regex
**Kind**: static property of <code>[AlphabeticallyGreaterThan](#AlphabeticallyGreaterThan)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| The | <code>RegExp</code> | regex matcher |

<a name="AlphabeticallyGreaterThan.extract"></a>
### AlphabeticallyGreaterThan.extract() ⇒ <code>LengthGreaterThan</code> &#124; <code>null</code>
Extracts the variable, comparative, and any modifiers in the condition

**Kind**: static method of <code>[AlphabeticallyGreaterThan](#AlphabeticallyGreaterThan)</code>  
**Returns**: <code>LengthGreaterThan</code> &#124; <code>null</code> - Instance of LengthGreaterThan ready for execution  
