<a name="EndIf"></a>
## EndIf
**Kind**: global class  
**Implements:** <code>IAction {@link IAction}</code>  
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


* [EndIf](#EndIf)
  * [new EndIf(command, statement, inner, variables)](#new_EndIf_new)
  * _instance_
    * [.validate()](#EndIf+validate) ⇒ <code>string</code> &#124; <code>null</code>
    * [.perform(prevPassed)](#EndIf+perform) ⇒ <code>IPerformResult</code>
  * _static_
    * [.regex](#EndIf.regex)
    * [.conditions](#EndIf.conditions)
    * [.dependents](#EndIf.dependents)

<a name="new_EndIf_new"></a>
### new EndIf(command, statement, inner, variables)
The EndIf action


| Param | Type | Description |
| --- | --- | --- |
| command | <code>Command</code> | Command that contains this action |
| statement | <code>string</code> | Statement that this should take action on |
| inner | <code>string</code> | Text that follows after this action until the next command |
| variables | <code>IVariables</code> | Variables within the scope of this action |

<a name="EndIf+validate"></a>
### endIf.validate() ⇒ <code>string</code> &#124; <code>null</code>
Checks for any known syntax errors regarding this action

**Kind**: instance method of <code>[EndIf](#EndIf)</code>  
**Returns**: <code>string</code> &#124; <code>null</code> - The caught error if any  
**Access:** public  
<a name="EndIf+perform"></a>
### endIf.perform(prevPassed) ⇒ <code>IPerformResult</code>
Perform the action and return the result.

**Kind**: instance method of <code>[EndIf](#EndIf)</code>  
**Returns**: <code>IPerformResult</code> - [IPerformResult](IPerformResult)  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| prevPassed | <code>boolean</code> | If this action is a dependent of another action, did the previous action ran pass or fail. |

<a name="EndIf.regex"></a>
### EndIf.regex
**Kind**: static property of <code>[EndIf](#EndIf)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| The | <code>RegExp</code> | regex matcher |

<a name="EndIf.conditions"></a>
### EndIf.conditions
**Kind**: static property of <code>[EndIf](#EndIf)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| Array | <code>Array.&lt;ICondition&gt;</code> | of conditions available to this action |

<a name="EndIf.dependents"></a>
### EndIf.dependents
**Kind**: static property of <code>[EndIf](#EndIf)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| Array | <code>Array.&lt;IAction&gt;</code> | of dependent actions |

