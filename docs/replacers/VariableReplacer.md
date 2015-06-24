<a name="VariableReplacer"></a>
## .VariableReplacer
**Kind**: static class  
**Implements:** <code>IReplacer</code>  

* [.VariableReplacer](#VariableReplacer)
  * [new VariableReplacer()](#new_VariableReplacer_new)
  * [.regex](#VariableReplacer.regex)
  * [.replace(text, variables)](#VariableReplacer.replace) ⇒ <code>string</code>

<a name="new_VariableReplacer_new"></a>
### new VariableReplacer()
The variable replacer for embedded SQiggL variables

<a name="VariableReplacer.regex"></a>
### VariableReplacer.regex
**Kind**: static property of <code>[VariableReplacer](#VariableReplacer)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| The | <code>RegExp</code> | regex matcher |

<a name="VariableReplacer.replace"></a>
### VariableReplacer.replace(text, variables) ⇒ <code>string</code>
**Kind**: static method of <code>[VariableReplacer](#VariableReplacer)</code>  
**Returns**: <code>string</code> - - The string with variables replaced  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | Text to search for replacements |
| variables | <code>IVariables</code> | Variables within the scope |

