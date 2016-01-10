# SQiggL Errors

Below you can find a list of known SQiggL errors listed by code, an explanation of what they
mean, and how to correct them. If any of these explanations are unclear please feel free to
contribute to this page by submitting a pull request, or create an issue requesting the
error explanation be improved. We would like the error messages to be descriptive enough that
you never need this page, but in the case that the error is not clear enough we would like this
page to completely clear any confusion. If you are still confused after reading the explanation
here than we have failed you and would love the opportunity to improve the explanation or answer
any questions you may have. Just create an issue and we should get back to you shortly.

### Codes:

* [L1000](#l1000)
* [L1001](#l1001)
* [L1002](#l1002)
* [L1003](#l1003)
* [L1004](#l1004)
* [L1005](#l1005)
* [L1006](#l1006)
* [P1000](#p1000)
* [LC2000](#lc2000)
* [LV2000](#lv2000)
* [LV2001](#lv2001)
* [LV2002](#lv2002)
* [LV2003](#lv2003)
* [LE2000](#le1000)
* [L100](#l100)
* [LV100](#lv100)

### L1000

**Type:** Lexer Error

**Meaning:** Duplicate character found in LexerOptions

**TODO**

### L1001

**Type:** Syntax Error

**Meaning:** A new SQiggL statement was found before the previous closed

**TODO**

### L1002

**Type:** Syntax Error

**Meaning:** EOF was found before a SQiggL statement closed

**TODO**

### L1003

**Type:** Syntax Error

**Meaning:** Expected a terminating action but didn't find one

**TODO**

### L1004

**Type:** Syntax Error

**Meaning:** Not enough terminating actions for the number of starting actions

**TODO**

### L1005

**Type:** Syntax Error

**Meaning:** An escape character was found in a string that does escape anything

**TODO**

### L1006

**Type:** Syntax Error

**Meaning:** A string is missing a closing non-escaped quote

**TODO**

### P1000

**Type:** Parser Error

**Meaning:** An undefined variable was found

**TODO**

### LC2000

**Type:** Command Lexer Error

**Meaning:** No Action found in command

This error occurs when an action is not found as the first word in a command statement.
Commands require the first word be an action so that it can determine what kind of operation
it needs to perform to the inner string. For example `{% 12 > 13}` is missing it's action.
Common cases are that the command was actually intended to be a replacement `{12 > 13}`, or
a search and replace gone wrong.

To correct this error please add an action like `{% if 12 > 13}` or remove the `%` to change
the statement into a replacement rather than a command `{12 > 13}`.

### LV2000

**Type:** Syntax Error

**Meaning:** The `key` to a variable cannot be a string with quotes

**TODO**

### LV2001

**Type:** Syntax Error

**Meaning:** Found a '\[' or '\]' in a variable key

**TODO**

### LV2002

**Type:** Unsupported Error

**Meaning:** Multi-dimensional arrays are not allowed in variables

**TODO**

### LV2003

**Type:** Syntax Error

**Meaning:** Variable that define arrays cannot contain other values

**TODO**

### LE2000

**Type:** Lexer Error

**Meaning:** Unrecognized expression used

**TODO**

### L100

**Type:** Internal Lexer Error

**Meaning:** There is a bug in SQiggL

You should never receive this error, if you do please file an issue on the project with a
reproducible example. This is an internal error that is left in place to help with debugging
for future features. This is not a syntax error on your side, but an error in SQiggL itself.
Please let us know including an example and we will correct the issue and release a patch.

### LV100

**Type:** Internal Lexer Error

**Meaning:** There is a bug in SQiggL

You should never receive this error, if you do please file an issue on the project with a
reproducible example. This is an internal error that is left in place to help with debugging
for future features. This is not a syntax error on your side, but an error in SQiggL itself.
Please let us know including an example and we will correct the issue and release a patch.
