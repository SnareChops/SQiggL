<a name="If"></a>
## If
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


* [If](#If)
  * [new If(command, statement, inner, variables)](#new_If_new)
  * _instance_
    * [.parseCondition(statement, variables)](#If+parseCondition) ⇒ <code>ICondition</code> &#124; <code>null</code>
    * [.validate()](#If+validate) ⇒ <code>string</code> &#124; <code>null</code>
    * [.perform(prevPassed)](#If+perform) ⇒ <code>IPerformResult</code>
  * _static_
    * [.regex](#If.regex)
    * [.conditions](#If.conditions)
    * [.dependents](#If.dependents)

<a name="new_If_new"></a>
### new If(command, statement, inner, variables)
The If action


| Param | Type | Description |
| --- | --- | --- |
| command | <code>Command</code> | Command that contains this action |
| statement | <code>string</code> | Statement that this should take action on |
| inner | <code>string</code> | Text that follows after this action until the next command |
| variables | <code>IVariables</code> | Variables within the scope of this action |

<a name="If+parseCondition"></a>
### if.parseCondition(statement, variables) ⇒ <code>ICondition</code> &#124; <code>null</code>
Try and locate a matching condition from the available conditions for this action. If no match is found, return null.

**Kind**: instance method of <code>[If](#If)</code>  
**Returns**: <code>ICondition</code> &#124; <code>null</code> - - Condition that matches within the statement  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| statement | <code>string</code> | Statement to check conditions against |
| variables | <code>IVariables</code> | List of variables within the scope of this action |

<a name="If+validate"></a>
### if.validate() ⇒ <code>string</code> &#124; <code>null</code>
Checks for any known syntax errors regarding this action

**Kind**: instance method of <code>[If](#If)</code>  
**Returns**: <code>string</code> &#124; <code>null</code> - The caught error if any  
**Access:** public  
<a name="If+perform"></a>
### if.perform(prevPassed) ⇒ <code>IPerformResult</code>
Perform the action and return the result.

**Kind**: instance method of <code>[If](#If)</code>  
**Returns**: <code>IPerformResult</code> - [IPerformResult](IPerformResult)  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| prevPassed | <code>boolean</code> | If this action is a dependent of another action, did the previous action ran pass or fail. |

<a name="If.regex"></a>
### If.regex
**Kind**: static property of <code>[If](#If)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| The | <code>RegExp</code> | regex matcher |

<a name="If.conditions"></a>
### If.conditions
**Kind**: static property of <code>[If](#If)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| Array | <code>Array.&lt;ICondition&gt;</code> | of conditions available to this action |

<a name="If.dependents"></a>
### If.dependents
**Kind**: static property of <code>[If](#If)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| Array | <code>Array.&lt;IAction&gt;</code> | of dependent actions |

