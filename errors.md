# SQiggL Errors

Below you can find a list of known SQiggL errors listed by code, an explanation of what they
mean, and how to correct them.

### Codes:

* [LC1000](#lc1000)


### LC1000

**Type:** Command Lexer Error

**Meaning:** No Action found in command

This error occurs when an action is not found as the first word in a command statement.
Commands require the first word be an action so that it can determine what kind of operation
it needs to perform to the inner string. For example `{% 12 > 13}` is missing it's action.
Common cases are that the command was actually intended to be a replacement `{12 > 13}`, or
a search and replace gone wrong.

To correct this error please add an action like `{% if 12 > 13}` or remove the `%` to change
the statement into a replacement rather than a command `{12 > 13}`.