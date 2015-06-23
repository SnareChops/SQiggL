<a name="Else"></a>
## Else
**Kind**: global class  
**Implements:** <code>{@link IAction}</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| command | <code>Command</code> | Command that contains this action |
| statement | <code>string</code> | Statement that this should take action on |
| inner | <code>string</code> | Text that follows after this action until the next command |
| variables | <code>IVariables</code> | Variables within the scope of this action |
| terminator | <code>boolean</code> | Defines if this action is a terminator |
| variable | <code>IVariable</code> | Variable that this should take action on depending on the result of the condition |
| conditions | <code>Array.&lt;ICondition&gt;</code> | Array of conditions that this action supports (if any) |
| condition | <code>ICondition</code> | Condition that was found as a match for this action |
| dependents | <code>Array.&lt;IAction&gt;</code> | Array of actions that are dependent on this action's result |


* [Else](#Else)
  * [new Else(command, statement, inner, variables)](#new_Else_new)
  * _instance_
    * [.validate()](#Else+validate) ⇒ <code>string</code> &#124; <code>null</code>
    * [.perform(prevPassed)](#Else+perform) ⇒ <code>IPerformResult</code>
  * _static_
    * [.regex](#Else.regex)
    * [.conditions](#Else.conditions)
    * [.dependents](#Else.dependents)

<a name="new_Else_new"></a>
### new Else(command, statement, inner, variables)
The Else action


| Param | Type | Description |
| --- | --- | --- |
| command | <code>Command</code> | Command that contains this action |
| statement | <code>string</code> | Statement that this should take action on |
| inner | <code>string</code> | Text that follows after this action until the next command |
| variables | <code>IVariables</code> | Variables within the scope of this action |

<a name="Else+validate"></a>
### else.validate() ⇒ <code>string</code> &#124; <code>null</code>
Checks for any known syntax errors regarding this action

**Kind**: instance method of <code>[Else](#Else)</code>  
**Returns**: <code>string</code> &#124; <code>null</code> - The caught error if any  
**Access:** public  
<a name="Else+perform"></a>
### else.perform(prevPassed) ⇒ <code>IPerformResult</code>
Perform the action and return the result.

**Kind**: instance method of <code>[Else](#Else)</code>  
**Returns**: <code>IPerformResult</code> - [IPerformResult](IPerformResult)  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| prevPassed | <code>boolean</code> | If this action is a dependent of another action, did the previous action ran pass or fail. |

<a name="Else.regex"></a>
### Else.regex
**Kind**: static property of <code>[Else](#Else)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| The | <code>RegExp</code> | regex matcher |

<a name="Else.conditions"></a>
### Else.conditions
**Kind**: static property of <code>[Else](#Else)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| Array | <code>Array.&lt;ICondition&gt;</code> | of conditions available to this action |

<a name="Else.dependents"></a>
### Else.dependents
**Kind**: static property of <code>[Else](#Else)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| Array | <code>Array.&lt;IAction&gt;</code> | of dependent actions |

