<a name="Parser"></a>
## Parser
**Kind**: global class  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| sql | <code>string</code> | The SQiggL query to run the parser against |
| variables | <code>IVariables</code> | Any variables passed to the SQiggL parser |
| commands | <code>Array.&lt;Command&gt;</code> | Array of commands found in the SQiggL query |
| stack | <code>Array.&lt;Command&gt;</code> | Command stack for storing current position in the parsing process |
| error | <code>string</code> | Error string if any errors are found in the parsing process |


* [Parser](#Parser)
  * [new Parser(sql, variables)](#new_Parser_new)
  * [.extract(sql, variables)](#Parser+extract) ⇒ <code>Array.&lt;Command&gt;</code>
  * [.parse()](#Parser+parse) ⇒ <code>string</code>

<a name="new_Parser_new"></a>
### new Parser(sql, variables)
The SQiggL parser


| Param | Type | Description |
| --- | --- | --- |
| sql | <code>string</code> | The SQiggL query to run the parser against |
| variables | <code>IVariables</code> | Any variables passed to the SQiggL parser |

<a name="Parser+extract"></a>
### parser.extract(sql, variables) ⇒ <code>Array.&lt;Command&gt;</code>
Extract any commands out of the SQiggL query and determine their order, nesting, and type

**Kind**: instance method of <code>[Parser](#Parser)</code>  
**Returns**: <code>Array.&lt;Command&gt;</code> - - Array of fully parsed commands, ready for execution  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| sql | <code>string</code> | SQiggL query to extract commands from |
| variables | <code>IVariables</code> | Any global variables passed in to SQiggL |

<a name="Parser+parse"></a>
### parser.parse() ⇒ <code>string</code>
Run the commands against the string and output the end result

**Kind**: instance method of <code>[Parser](#Parser)</code>  
**Returns**: <code>string</code> - The end result of running all commands against the SQiggL query  
**Access:** public  
