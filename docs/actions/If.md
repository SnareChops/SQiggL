<a name="If"></a>
## If
**Kind**: global class  
**Implements:** <code>{@link IAction}</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| command | <code>Command</code> | Parent command of this action |
| statement | <code>string</code> | Statement that this should take action on |
| inner | <code>string</code> | Text that follows after this action until the next command |
| variables | <code>IVariables</code> | Variables within the scope of this action |
| terminator | <code>boolean</code> | Defines if this action is a terminator |
| variable | <code>IVariable</code> | Variable that this should take action on depending on the result of the condition |
| conditions | <code>Array.&lt;ICondition&gt;</code> | Array of conditions that this action supports (if any) |
| condition | <code>ICondition</code> | Condition that was found as a match for this action |
| dependents | <code>Array.&lt;IAction&gt;</code> | Array of actions that are dependent on this action's result |

<a name="new_If_new"></a>
### new If(command, statement, inner, variables)
The If action


| Param | Type | Description |
| --- | --- | --- |
| command | <code>Command</code> | Parent command of this action |
| statement | <code>string</code> | Statement that this should take action on |
| inner | <code>string</code> | Text that follows after this action until the next command |
| variables | <code>IVariables</code> | Variables within the scope of this action |

