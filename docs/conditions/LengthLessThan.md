<a name="LengthLessThan"></a>
## LengthLessThan ⇐ <code>Condition</code>
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

<a name="new_LengthLessThan_new"></a>
### new LengthLessThan(variable, variables, comparative, mod1, mod2)
The len< condition


| Param | Type | Description |
| --- | --- | --- |
| variable | <code>string</code> | Variable to test condition against |
| variables | <code>IVariables</code> | Variables within the scope of this condition |
| comparative | <code>string</code> | Value to compare variable against |
| mod1 | <code>string</code> | Identifier of first modifier, or null |
| mod2 | <code>string</code> | Identifier of second modifier, or null |

