<a name="Command"></a>
## Command
**Kind**: global class  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| index | <code>number</code> | Beginning index of the command in the original query string |
| length | <code>number</code> | Length of the section of the original string that this command is responsible for |
| statement | <code>string</code> | Statement within the '{{% %}}' that this command is responsible for |
| inner | <code>string</code> | Text that immediately follows the statement until the next command |
| variables | <code>IVariables</code> | Variables within the scope of this command |
| actions | <code>Array.&lt;IAction&gt;</code> | Array of actions available to SQiggL |
| replacers | <code>Array.&lt;IReplacer&gt;</code> | Array of replacers available to SQiggL |
| scope | <code>CommandScope</code> | Holds information about the scope of this command, such as available variables {@see CommandScope} |
| dependents | <code>[Array.&lt;Command&gt;](#Command)</code> | Array of commands dependent to this command |


* [Command](#Command)
  * [new Command(index, length, statement, inner, variables)](#new_Command_new)
  * _instance_
    * [.extract(statement, inner, variables)](#Command+extract) ⇒ <code>IAction</code> &#124; <code>null</code>
    * [.perform(passed)](#Command+perform) ⇒ <code>IPerformResult</code>
    * [.performScope()](#Command+performScope) ⇒ <code>string</code>
    * [.performDependents(prevPassed)](#Command+performDependents) ⇒ <code>string</code>
    * [.termination()](#Command+termination) ⇒ <code>string</code>
    * [.dependent(action)](#Command+dependent) ⇒ <code>boolean</code>
  * _static_
    * [.regex](#Command.regex)

<a name="new_Command_new"></a>
### new Command(index, length, statement, inner, variables)
Command object responsible for handling all actions, conditions, and variables within it's section of the query


| Param | Type | Description |
| --- | --- | --- |
| index | <code>number</code> | Beginning index of the command in the original query string |
| length | <code>number</code> | Length of the section of the original string that this command is responsible for |
| statement | <code>string</code> | Statement within the '{{% %}}' that this command is responsible for |
| inner | <code>string</code> | Text that immediately follows the statement until the next command |
| variables | <code>IVariables</code> | Variables within the scope of this command |

<a name="Command+extract"></a>
### command.extract(statement, inner, variables) ⇒ <code>IAction</code> &#124; <code>null</code>
Extract actions from the statement

**Kind**: instance method of <code>[Command](#Command)</code>  
**Returns**: <code>IAction</code> &#124; <code>null</code> - - The matching action or null if no action was found  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| statement | <code>string</code> | Statement to extract the actions from |
| inner | <code>string</code> | Inner text for the command |
| variables | <code>IVariables</code> | Variables within the scope of this command |

<a name="Command+perform"></a>
### command.perform(passed) ⇒ <code>IPerformResult</code>
Perform the command and return the result

**Kind**: instance method of <code>[Command](#Command)</code>  
**Returns**: <code>IPerformResult</code> - - The result of the command execution {@see IPerformResult}  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| passed | <code>boolean</code> | If the command is a dependent then this will reflect if the previous command succeeded or failed |

<a name="Command+performScope"></a>
### command.performScope() ⇒ <code>string</code>
Perform commands that are within the scope of this command (sub-commands)

**Kind**: instance method of <code>[Command](#Command)</code>  
**Returns**: <code>string</code> - The result of the sub-command's execution  
**Access:** public  
<a name="Command+performDependents"></a>
### command.performDependents(prevPassed) ⇒ <code>string</code>
Perform commands that are dependent on this command

**Kind**: instance method of <code>[Command](#Command)</code>  
**Returns**: <code>string</code> - The result of the dependent executions (collectively)  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| prevPassed | <code>boolean</code> | If this command is a dependent then this will reflect if the previous command succeeded or failed |

<a name="Command+termination"></a>
### command.termination() ⇒ <code>string</code>
Perform the termination of the command's actions if needed (For example "EndIf" is a terminator of "If", so this essentially means to just print out the string that follows "EndIf")

**Kind**: instance method of <code>[Command](#Command)</code>  
**Returns**: <code>string</code> - The result of the action's terminator  
**Access:** public  
<a name="Command+dependent"></a>
### command.dependent(action) ⇒ <code>boolean</code>
Check if the inputted action is a dependent of the action for this command

**Kind**: instance method of <code>[Command](#Command)</code>  
**Returns**: <code>boolean</code> - Whether the action is a dependent of this command's action  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| action | <code>IAction</code> | The action to check if it is a dependent of this command's action |

<a name="Command.regex"></a>
### Command.regex
**Kind**: static property of <code>[Command](#Command)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| The | <code>RegExp</code> | regex matcher |

