(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var CommandResult_1 = require('./commands/CommandResult');
var Action_1 = require('./actions/Action');
var Expressions_1 = require('./Expressions');
var EndIfDefinition = {
    regex: /^\s*endif\b/i,
    expressions: [],
    dependents: [],
    terminator: true,
    rule: function (command, prev) {
        command.result = new CommandResult_1.default(command.inner, true);
        return command;
    }
};
exports.EndIf = new Action_1.default(EndIfDefinition);
var ElseDefinition = {
    regex: /^\s*else\b/i,
    expressions: [],
    dependents: [],
    terminator: false,
    rule: function (command, prev) {
        if (!prev.result.passed)
            command.result = new CommandResult_1.default(command.inner + command.scope.perform(), true);
        else
            command.result = new CommandResult_1.default('', false);
        return command;
    }
};
exports.Else = new Action_1.default(ElseDefinition);
var IfDefinition = {
    regex: /^\s*if\b/i,
    expressions: [Expressions_1.Equal, Expressions_1.GreaterThan, Expressions_1.LessThan, Expressions_1.IsNull, Expressions_1.AlphabeticallyGreaterThan, Expressions_1.AlphabeticallyLessThan, Expressions_1.LengthGreaterThan, Expressions_1.LengthLessThan, Expressions_1.IsNaN, Expressions_1.Between],
    dependents: [exports.Else, exports.EndIf],
    terminator: false,
    rule: function (command, prev) {
        if (command.expression.evaluate(command)) {
            command.result = new CommandResult_1.default(command.inner + command.scope.perform() + command.terminate(), true);
        }
        else
            command.result = new CommandResult_1.default(command.defer(false), false);
        return command;
    }
};
exports.If = new Action_1.default(IfDefinition);
var EndUnlessDefinition = {
    regex: /^\s*endunless\b/i,
    expressions: [],
    dependents: [],
    terminator: true,
    rule: function (command, prev) {
        command.result = new CommandResult_1.default(command.inner, true);
        return command;
    }
};
exports.EndUnless = new Action_1.default(EndUnlessDefinition);
var UnlessDefinition = {
    regex: /^\s*unless\b/i,
    expressions: [Expressions_1.Equal, Expressions_1.GreaterThan, Expressions_1.LessThan, Expressions_1.IsNull, Expressions_1.AlphabeticallyGreaterThan, Expressions_1.AlphabeticallyLessThan, Expressions_1.LengthGreaterThan, Expressions_1.LengthLessThan, Expressions_1.IsNaN, Expressions_1.Between],
    dependents: [exports.Else, exports.EndUnless],
    terminator: false,
    rule: function (command, prev) {
        if (!command.expression.evaluate(command)) {
            command.result = new CommandResult_1.default(command.inner + command.scope.perform() + command.terminate(), true);
        }
        else
            command.result = new CommandResult_1.default(command.defer(false), false);
        return command;
    }
};
exports.Unless = new Action_1.default(UnlessDefinition);
var EndForDefinition = {
    regex: /^\s*endfor\b/i,
    expressions: [],
    dependents: [],
    terminator: true,
    rule: function (command, prev) {
        command.result = new CommandResult_1.default(command.inner, true);
        return command;
    }
};
exports.EndFor = new Action_1.default(EndForDefinition);
var ForDefinition = {
    regex: /^\s*for\b/i,
    expressions: [Expressions_1.ForInUsing],
    dependents: [exports.EndFor],
    terminator: false,
    rule: function (command, prev) {
        command.result = new CommandResult_1.default(command.expression.evaluate(command));
        return command;
    }
};
var Action_2 = require('./actions/Action');
exports.Action = Action_2.default;

},{"./Expressions":4,"./actions/Action":17,"./commands/CommandResult":19}],2:[function(require,module,exports){
var CommandResult_1 = require('./commands/CommandResult');
var Command = (function () {
    function Command(index, length, statement, inner, scope, runner) {
        this.index = index;
        this.length = length;
        this.statement = statement;
        this.inner = inner;
        this.scope = scope;
        this.runner = runner;
        this.dependents = [];
        this.modifiers = [];
        this.result = new CommandResult_1.default('', false);
        var action;
        for (var _i = 0, _a = runner.definition.actions; _i < _a.length; _i++) {
            action = _a[_i];
            if (action.matches(statement)) {
                this.action = action;
                break;
            }
        }
    }
    Command.prototype.perform = function (prev) {
        return this.runner.perform(this, prev);
    };
    Command.prototype.replace = function (replacer) {
        this.result.text = replacer.replace(this.result.text, this.scope.variables);
    };
    Command.prototype.defer = function (passed) {
        var dependent, text = '';
        for (var _i = 0, _a = this.dependents; _i < _a.length; _i++) {
            dependent = _a[_i];
            text += dependent.perform(this).result.text;
        }
        return text;
    };
    Command.prototype.terminate = function () {
        return this.dependents.some(function (command) { return command.action.definition.terminator; })
            ? this.dependents.filter(function (command) { return command.action.definition.terminator; })[0].perform().result.text
            : '';
    };
    return Command;
})();
exports.default = Command;

},{"./commands/CommandResult":19}],3:[function(require,module,exports){
// import IAction from 'actions/IAction';
// /**
//  * Module of error checkers
//  * @module Errors
//  * @class
//  * @static
//  */
// export default class Errors {
//     /**
//      * @memberof Errors
//      * @method
//      * @static
//      * @param {IAction} action      - Action to check for an Incorrect Statement error
//      * @param {string} statement    - Statement to check for a Incorrect Statement error
//      * @returns {string | null}     - The error message if any, otherwise null 
//      */
//     public static IncorrectStatement(action: IAction, statement: string): string{
//         const actions:string = action.command.actions.filter(x => x.dependents.some(y => action instanceof y)).map(x => x.name).join(', ');
//         const error: string = `Incorrect statement found at "${statement}". ${action.constructor['name']} must follow ${actions}`
//         console.error(error);
//         return error;
//     }
// } 

},{}],4:[function(require,module,exports){
var Expression_1 = require('./expressions/Expression');
var Modifiers_1 = require('./Modifiers');
var EqualDefinition = {
    template: '(v) (m)=(m) (v)',
    items: ['value', [Modifiers_1.Not, Modifiers_1.OrEqual], [Modifiers_1.OrEqual], 'value'],
    modOrder: [1, 0],
    rule: function (command, values, variables) { return values[0].evaluate(variables) === values[1].evaluate(variables); }
};
exports.Equal = new Expression_1.default(EqualDefinition);
var GreaterThanDefinition = {
    template: '(v) (m)>(m) (v)',
    items: ['value', [Modifiers_1.Not], [Modifiers_1.OrEqual], 'value'],
    modOrder: [1, 0],
    rule: function (command, values, variables) { return values[0].evaluate(variables) > values[1].evaluate(variables); }
};
exports.GreaterThan = new Expression_1.default(GreaterThanDefinition);
var LessThanDefinition = {
    template: '(v) (m)<(m) (v)',
    items: ['value', [Modifiers_1.Not], [Modifiers_1.OrEqual], 'value'],
    modOrder: [1, 0],
    rule: function (command, values, variables) { return values[0].evaluate(variables) < values[1].evaluate(variables); }
};
exports.LessThan = new Expression_1.default(LessThanDefinition);
var IsNullDefinition = {
    template: '(v) is (m) null',
    items: ['value', [Modifiers_1.Not]],
    modOrder: [0],
    rule: function (command, values, variables) { return values[0].evaluate(variables) == null; }
};
exports.IsNull = new Expression_1.default(IsNullDefinition);
var AlphabeticallyGreaterThanDefinition = {
    template: '(v) (m)abc>(m) (v)',
    items: ['value', [Modifiers_1.Not], [Modifiers_1.OrEqual], 'value'],
    modOrder: [1, 0],
    rule: function (command, values, variables) { return [values[0].evaluate(variables), values[1].evaluate(variables)].sort().indexOf(values[0].evaluate(variables)) > 0; }
};
exports.AlphabeticallyGreaterThan = new Expression_1.default(AlphabeticallyGreaterThanDefinition);
var AlphabeticallyLessThanDefinition = {
    template: '(v) (m)abc<(m) (v)',
    items: ['value', [Modifiers_1.Not], [Modifiers_1.OrEqual], 'value'],
    modOrder: [1, 0],
    rule: function (command, values, variables) { return values[0].evaluate(variables) === values[1].evaluate(variables) ? false : [values[0].evaluate(variables), values[1].evaluate(variables)].sort().indexOf(values[0].evaluate(variables)) === 0; }
};
exports.AlphabeticallyLessThan = new Expression_1.default(AlphabeticallyLessThanDefinition);
var LengthGreaterThanDefinition = {
    template: '(v) (m)len>(m) (v)',
    items: ['value', [Modifiers_1.Not], [Modifiers_1.LengthOrEqual], 'value'],
    modOrder: [1, 0],
    rule: function (command, values, variables) { return values[0].evaluate(variables).length > values[1].evaluate(variables); }
};
exports.LengthGreaterThan = new Expression_1.default(LengthGreaterThanDefinition);
var LengthLessThanDefinition = {
    template: '(v) (m)len<(m) (v)',
    items: ['value', [Modifiers_1.Not], [Modifiers_1.LengthOrEqual], 'value'],
    modOrder: [1, 0],
    rule: function (command, values, variables) { return values[0].evaluate(variables).length < values[1].evaluate(variables); }
};
exports.LengthLessThan = new Expression_1.default(LengthLessThanDefinition);
var IsNaNDefinition = {
    template: '(v) is (m)NaN',
    items: ['value', [Modifiers_1.Not]],
    modOrder: [0],
    rule: function (command, values, variables) { return isNaN(values[0].evaluate(variables)); }
};
exports.IsNaN = new Expression_1.default(IsNaNDefinition);
var BetweenDefinition = {
    template: '(v) (v)>(m)<(v)',
    items: ['value', 'value', [Modifiers_1.Not, Modifiers_1.BetweenOrEqual], 'value'],
    modOrder: [0],
    rule: function (command, values, variables) { return values[1].evaluate(variables) < values[0].evaluate(variables) && values[2].evaluate(variables) > values[0].evaluate(variables); }
};
exports.Between = new Expression_1.default(BetweenDefinition);
var ForInUsingDefinition = {
    template: '(v) in (c) using (j)',
    items: ['value', 'collection', 'joiner'],
    modOrder: [],
    rule: function (command, values, variables) {
        var i = 0, result = '';
        for (i = 0; i < values[1].evaluate(variables).length; i++) {
            variables[values[0].value] = values[1].evaluate(variables)[i];
            result += "" + command.scope.perform();
        }
        return result;
    }
};
exports.ForInUsing = new Expression_1.default(ForInUsingDefinition);
var Expression_2 = require('./expressions/Expression');
exports.Expression = Expression_2.default;

},{"./Modifiers":8,"./expressions/Expression":20}],5:[function(require,module,exports){
Array.prototype.last = function () {
    return this[this.length - 1];
};
Array.prototype.isFull = function () {
    for (var i = 0; i < this.length; i++) {
        if (i == null)
            return false;
    }
};
Array.prototype.contains = function (T) {
    return this.some(function (x) { return x === T; });
};

},{}],6:[function(require,module,exports){

},{}],7:[function(require,module,exports){
var Parsers_1 = require('./Parsers');
/**
 * The starting point of the entire SQiggL parser
 * @function
 * @param {string} sql              - The SQL query to run SQiggL against
 * @param {IVariables?} variables   - Optional collection of variables for your SQiggL query
 * @return {string}                 - The fully parsed SQL query
 */
function parse(sql, variables) {
    Parsers_1.SQiggLParser.parse(sql, variables);
    return Parsers_1.SQiggLParser.perform();
}
exports.parse = parse;

},{"./Parsers":9}],8:[function(require,module,exports){
var Modifier_1 = require('./modifiers/Modifier');
var NotDefinition = {
    identifiers: [/!/i, /(?:\b|\s+)not(?:\b|\s+)/i],
    rule: function (pass, values, variables) { return !pass; }
};
exports.Not = new Modifier_1.default(NotDefinition);
var OrEqualDefinition = {
    identifiers: [/=/i],
    rule: function (pass, values, variables) { return pass || values[0].evaluate(variables) === values[1].evaluate(variables); }
};
exports.OrEqual = new Modifier_1.default(OrEqualDefinition);
var LengthOrEqualDefinition = {
    identifiers: [/=/i],
    rule: function (pass, values, variables) { return pass || values[0].evaluate(variables).length === values[1].evaluate(variables); }
};
exports.LengthOrEqual = new Modifier_1.default(LengthOrEqualDefinition);
var BetweenOrEqualDefinition = {
    identifiers: [/=/i],
    rule: function (pass, values, variables) { return pass || values[0].evaluate(variables) === values[1].evaluate(variables) || values[0].evaluate(variables) === values[2].evaluate(variables); }
};
exports.BetweenOrEqual = new Modifier_1.default(BetweenOrEqualDefinition);
var Modifier_2 = require('./modifiers/Modifier');
exports.Modifier = Modifier_2.default;

},{"./modifiers/Modifier":25}],9:[function(require,module,exports){
var Parser_1 = require('./parsers/Parser');
var Runners_1 = require('./Runners');
var SQiggLParserDefinition = {
    runners: [Runners_1.ActionRunner]
};
exports.SQiggLParser = new Parser_1.default(SQiggLParserDefinition);

},{"./Runners":12,"./parsers/Parser":27}],10:[function(require,module,exports){
exports.Placeholders = [
    {
        name: 'value',
        locator: /\(v\)/i,
        replacement: function () { return "((?:\"|')?[\\w\\d]+(?:\"|')?)"; }
    },
    {
        name: 'modifier',
        locator: /\(m\)/i,
        replacement: function (item) { return ("((?:" + item.map(function (modifier) { return modifier.definition.identifiers.map(function (identifier) { return identifier.source; }).join('|'); }).join('|') + "|\\s*))"); }
    },
    {
        name: 'collection',
        locator: /\(c\)/i,
        replacement: function () { return "([\\w\\d]+)"; },
    },
    {
        name: 'joiner',
        locator: /\(j\)/i,
        replacement: function () { return "(.+)"; }
    }
];
function Placeholder(name) {
    return exports.Placeholders.filter(function (x) { return x.name === name; })[0];
}
exports.default = Placeholder;

},{}],11:[function(require,module,exports){
var Replacer_1 = require('./replacers/Replacer');
var VariableDefinition = {
    regex: /([^{]|^){{(?!{)\s*(\w*)\s*}}(?!})/g,
    rule: function (definition, text, variables) { return text.replace(definition.regex, function (match, $1, $2) { return $1 + variables[$2]; }); }
};
exports.Variable = new Replacer_1.default(VariableDefinition);
var Replacer_2 = require('./replacers/Replacer');
exports.Replacer = Replacer_2.default;

},{"./replacers/Replacer":30}],12:[function(require,module,exports){
var Runner_1 = require('./runners/Runner');
var Actions_1 = require('./Actions');
var Replacers_1 = require('./Replacers');
var ActionRunnerDefinition = {
    regex: /{{%(.*?)%}}([\s\S]*?)?(?=(?:{{%|$))/gm,
    actions: [Actions_1.If, Actions_1.Else, Actions_1.EndIf, Actions_1.Unless, Actions_1.EndUnless],
    replacers: [Replacers_1.Variable]
};
exports.ActionRunner = new Runner_1.default(ActionRunnerDefinition);
var Runner_2 = require('./runners/Runner');
exports.Runner = Runner_2.default;

},{"./Actions":1,"./Replacers":11,"./runners/Runner":32}],13:[function(require,module,exports){
var Main_1 = require('./Main');
var SQiggL = {
    parse: Main_1.parse,
    version: '0.1.0',
};
if (typeof window !== 'undefined')
    window['SQiggL'] = SQiggL;
exports.default = SQiggL;

},{"./Main":7}],14:[function(require,module,exports){
var Scope = (function () {
    function Scope() {
        this.variables = {};
        this.commands = [];
        this.dependents = [];
    }
    Scope.prototype.perform = function () {
        var command, text = '';
        for (var _i = 0, _a = this.commands; _i < _a.length; _i++) {
            command = _a[_i];
            text += command.perform().result.text;
        }
        return text;
    };
    return Scope;
})();
exports.default = Scope;

},{}],15:[function(require,module,exports){
var ValueType_1 = require('./ValueType');
var Value = (function () {
    function Value(item) {
        if (item instanceof Array) {
            this.type = ValueType_1.default.array;
        }
        else if (/("|')[\w\d]+(\1)/.test(item)) {
            this.type = ValueType_1.default.string;
            this.value = item.substr(1, item.length - 2);
        }
        else if (!isNaN(item)) {
            this.type = ValueType_1.default.number;
            this.value = parseFloat(item);
        }
        else {
            this.type = ValueType_1.default.variable;
            this.value = item;
        }
    }
    Value.prototype.evaluate = function (variables) {
        if (this.type === ValueType_1.default.variable) {
            if (isNaN(variables[this.value])) {
                return variables[this.value];
            }
            else {
                return parseFloat(variables[this.value]);
            }
        }
        else {
            return this.value;
        }
    };
    return Value;
})();
exports.default = Value;

},{"./ValueType":16}],16:[function(require,module,exports){
var ValueType;
(function (ValueType) {
    ValueType[ValueType["string"] = 0] = "string";
    ValueType[ValueType["number"] = 1] = "number";
    ValueType[ValueType["array"] = 2] = "array";
    ValueType[ValueType["variable"] = 3] = "variable";
})(ValueType || (ValueType = {}));
exports.default = ValueType;

},{}],17:[function(require,module,exports){
// DO NOT PUT INSTANCE ITEMS IN THIS CLASS, DUMMY
var Action = (function () {
    function Action(definition) {
        this.definition = definition;
        if (!definition)
            throw 'Attempted to instatiate action without a definition';
    }
    Action.prototype.matches = function (statement) {
        return this.definition.regex.test(statement);
    };
    Action.prototype.parse = function (command) {
        var expression;
        for (var _i = 0, _a = this.definition.expressions; _i < _a.length; _i++) {
            expression = _a[_i];
            if (expression.matches(command.statement)) {
                command.expression = expression;
            }
        }
    };
    Action.prototype.perform = function (command, prev) {
        return this.definition.rule(command, prev);
    };
    return Action;
})();
exports.default = Action;

},{}],18:[function(require,module,exports){

},{}],19:[function(require,module,exports){
var CommandResult = (function () {
    function CommandResult(text, passed) {
        this.text = text;
        this.passed = passed;
    }
    return CommandResult;
})();
exports.default = CommandResult;

},{}],20:[function(require,module,exports){
var Placeholders_1 = require('../Placeholders');
var ExpressionResult_1 = require('./ExpressionResult');
require('../Extensions');
var Expression = (function () {
    function Expression(definition) {
        this.definition = definition;
        this.indicies = {};
        if (!definition)
            throw 'Attempted to instatiate expression without a definition';
        this.regex = this.translate(this.definition);
        this.template = definition.template;
        this.items = definition.items;
        this.rule = definition.rule;
    }
    Expression.prototype.translate = function (definition) {
        var template = definition.template, item, name, idx = 1;
        for (var _i = 0, _a = definition.items; _i < _a.length; _i++) {
            item = _a[_i];
            if (!item)
                throw 'Invalid item in items definition';
            if (item instanceof Array)
                name = 'modifier';
            else
                name = item;
            var placeholder = Placeholders_1.default(name);
            template = template.replace(placeholder.locator, placeholder.replacement(item instanceof Array ? item : null));
            if (this.indicies[name] instanceof Array)
                this.indicies[name].push(idx);
            else if (!isNaN(this.indicies[name])) {
                var array = [];
                array.push(this.indicies[name]);
                array.push(idx);
                this.indicies[name] = array;
            }
            else
                this.indicies[name] = idx;
            this.indicies[idx] = name;
            idx++;
        }
        template = template.replace(/\s+/g, '(?:\\b|\\s+)');
        return new RegExp(template, 'i');
    };
    Expression.prototype.parse = function (command) {
        var result = new ExpressionResult_1.default(), match = command.statement.match(this.regex), i, modifier, modNumber = -1;
        result.statement = match[0];
        for (i = 1; i < match.length; i++) {
            if (this.items[i - 1] instanceof Array) {
                modNumber++;
                for (var _i = 0, _a = this.items[i - 1]; _i < _a.length; _i++) {
                    modifier = _a[_i];
                    if (modifier.matches(match[i]))
                        result.set(this.indicies[i], modifier, modNumber);
                }
            }
            else
                result.set(this.indicies[i], match[i]);
        }
        result.variables = command.scope.variables;
        return result;
    };
    Expression.prototype.evaluate = function (command) {
        var parsed = this.parse(command);
        parsed.pass = this.rule(command, parsed.value, parsed.variables);
        var index;
        for (var _i = 0, _a = this.definition.modOrder; _i < _a.length; _i++) {
            index = _a[_i];
            if (parsed.modifier[index])
                parsed.pass = parsed.modifier[index].definition.rule(parsed.pass, parsed.value, parsed.variables);
        }
        return parsed.pass;
    };
    Expression.prototype.matches = function (statement) {
        return this.regex.test(statement);
    };
    return Expression;
})();
exports.default = Expression;

},{"../Extensions":5,"../Placeholders":10,"./ExpressionResult":21}],21:[function(require,module,exports){
var Value_1 = require('../Value');
var ExpressionResult = (function () {
    function ExpressionResult() {
        this.value = [];
        this.modifier = [];
    }
    ExpressionResult.prototype.set = function (prop, value, index) {
        if (this[prop] instanceof Array) {
            if (index)
                this[prop][index] = prop === 'value' ? new Value_1.default(value) : value;
            else
                this[prop].push(prop === 'value' ? new Value_1.default(value) : value);
        }
        else
            this[prop] = prop === 'value' ? new Value_1.default(value) : value;
    };
    return ExpressionResult;
})();
exports.default = ExpressionResult;

},{"../Value":15}],22:[function(require,module,exports){

},{}],23:[function(require,module,exports){

},{}],24:[function(require,module,exports){

},{}],25:[function(require,module,exports){
var Modifier = (function () {
    function Modifier(definition) {
        this.definition = definition;
        if (!definition)
            throw 'Attempted to instatiate modifier without a definition';
    }
    Modifier.prototype.matches = function (text) {
        var identifier;
        for (var _i = 0, _a = this.definition.identifiers; _i < _a.length; _i++) {
            identifier = _a[_i];
            if (identifier.test(text))
                return true;
        }
        return false;
    };
    return Modifier;
})();
exports.default = Modifier;

},{}],26:[function(require,module,exports){

},{}],27:[function(require,module,exports){
var Command_1 = require('../Command');
var Scope_1 = require('../Scope');
Array.prototype.last = function () {
    return this[this.length - 1];
};
/**
 * The SQiggL parser
 * @module Parser
 * @class
 * @param {string} sql              - The SQiggL query to run the parser against
 * @param {IVariables} variables    - Any variables passed to the SQiggL parser
 * @property {string} sql           - The SQiggL query to run the parser against
 * @property {IVariables} variables - Any variables passed to the SQiggL parser
 * @property {Command[]} commands   - Array of commands found in the SQiggL query
 * @property {Command[]} stack      - Command stack for storing current position in the parsing process
 * @property {string} error         - Error string if any errors are found in the parsing process
 */
var Parser = (function () {
    // constructor(public sql: string, public variables: IVariables){
    // this.commands = this.extract(sql, variables);
    // this.variables = variables;
    // }
    function Parser(definition) {
        this.definition = definition;
        this.commands = [];
        this.stack = [];
        this.error = [];
        if (!definition)
            throw 'Attempted to instatiate parser without a definition';
        this.regex = new RegExp("(?:" + this.definition.runners.map(function (x) { return x.definition.regex.source; }).join(')|(') + ")", 'gm');
    }
    /**
     * Extract any commands out of the SQiggL query and determine their order, nesting, and type
     * @memberof Parser
     * @method
     * @public
     * @param {string} sql              - SQiggL query to extract commands from
     * @param {IVariables} variables    - Any global variables passed in to SQiggL
     * @returns {Command[]}             - Array of fully parsed commands, ready for execution
     */
    Parser.prototype.parse = function (sql, variables) {
        this.commands = [];
        this.stack = [];
        this.sql = sql;
        var match;
        // Command.regex.lastIndex = 0;
        while ((match = this.regex.exec(sql)) != null) {
            var found = void 0, runner = void 0;
            for (var _i = 0, _a = this.definition.runners; _i < _a.length; _i++) {
                runner = _a[_i];
                if (runner.matches(match[0])) {
                    found = new Command_1.default(match.index, match.input.length, match[1], match[2], new Scope_1.default(), runner);
                    found.scope.variables = variables;
                    runner.parse(found);
                }
            }
            if (this.stack.length > 0 && this.stack.last().action.definition.dependents.contains(found.action)) {
                // found.action.supporter = stack.last();
                this.stack.last().dependents.push(found);
            }
            else if (this.stack.length > 0 && !this.stack.last().action.definition.terminator) {
                this.stack.push(found);
                this.stack.last().scope.commands.push(found);
            }
            else {
                if (this.stack.length > 0 && this.stack.last().action.definition.terminator)
                    this.stack.pop();
                this.stack.push(found);
                this.commands.push(found);
            }
        }
        // return commands;
    };
    /**
     * Run the commands against the string and output the end result
     * @memberof Parser
     * @method
     * @public
     * @returns {string} The end result of running all commands against the SQiggL query
     */
    Parser.prototype.perform = function () {
        var query = '', index = 0;
        if (this.commands.length === 0)
            return this.sql;
        for (var _i = 0, _a = this.commands; _i < _a.length; _i++) {
            var command = _a[_i];
            query += this.sql.slice(index, command.index - 1);
            query += command.perform(command).result.text;
            index += command.length;
        }
        return query; //TODO
    };
    return Parser;
})();
exports.default = Parser;

},{"../Command":2,"../Scope":14}],28:[function(require,module,exports){

},{}],29:[function(require,module,exports){

},{}],30:[function(require,module,exports){
var Replacer = (function () {
    function Replacer(definition) {
        this.definition = definition;
        if (!definition)
            throw 'Attempted to instatiate replacer without a definition';
    }
    Replacer.prototype.replace = function (text, variables) {
        return this.definition.rule(this.definition, text, variables);
    };
    return Replacer;
})();
exports.default = Replacer;

},{}],31:[function(require,module,exports){

},{}],32:[function(require,module,exports){
var Runner = (function () {
    function Runner(definition) {
        this.definition = definition;
        if (!definition)
            throw 'Attempted to instatiate runner without a definition';
    }
    Runner.prototype.parse = function (command) {
        var action;
        for (var _i = 0, _a = this.definition.actions; _i < _a.length; _i++) {
            action = _a[_i];
            if (action.matches(command.statement)) {
                command.action = action;
                command.action.parse(command);
            }
        }
    };
    Runner.prototype.perform = function (command, prev) {
        command.result = command.action.perform(command, prev).result;
        // command.result.dependent = command.scope.perform(command).result;
        var replacer;
        for (var _i = 0, _a = this.definition.replacers; _i < _a.length; _i++) {
            replacer = _a[_i];
            command.replace(replacer);
        }
        return command;
    };
    Runner.prototype.matches = function (text) {
        this.definition.regex.lastIndex = 0;
        return this.definition.regex.test(text);
    };
    return Runner;
})();
exports.default = Runner;

},{}]},{},[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQWN0aW9ucy50cyIsInNyYy9Db21tYW5kLnRzIiwic3JjL0Vycm9ycy50cyIsInNyYy9FeHByZXNzaW9ucy50cyIsInNyYy9FeHRlbnNpb25zLnRzIiwic3JjL0lWYXJpYWJsZXMudHMiLCJzcmMvTWFpbi50cyIsInNyYy9Nb2RpZmllcnMudHMiLCJzcmMvUGFyc2Vycy50cyIsInNyYy9QbGFjZWhvbGRlcnMudHMiLCJzcmMvUmVwbGFjZXJzLnRzIiwic3JjL1J1bm5lcnMudHMiLCJzcmMvU1FpZ2dMLnRzIiwic3JjL1Njb3BlLnRzIiwic3JjL1ZhbHVlLnRzIiwic3JjL1ZhbHVlVHlwZS50cyIsInNyYy9hY3Rpb25zL0FjdGlvbi50cyIsInNyYy9hY3Rpb25zL0lBY3Rpb25EZWZpbml0aW9uLnRzIiwic3JjL2NvbW1hbmRzL0NvbW1hbmRSZXN1bHQudHMiLCJzcmMvZXhwcmVzc2lvbnMvRXhwcmVzc2lvbi50cyIsInNyYy9leHByZXNzaW9ucy9FeHByZXNzaW9uUmVzdWx0LnRzIiwic3JjL2V4cHJlc3Npb25zL0lFeHByZXNzaW9uRGVmaW5pdGlvbi50cyIsInNyYy9leHByZXNzaW9ucy9JRXhwcmVzc2lvbkluZGljZXMudHMiLCJzcmMvbW9kaWZpZXJzL0lNb2RpZmllckRlZmluaXRpb24udHMiLCJzcmMvbW9kaWZpZXJzL01vZGlmaWVyLnRzIiwic3JjL3BhcnNlcnMvSVBhcnNlckRlZmluaXRpb24udHMiLCJzcmMvcGFyc2Vycy9QYXJzZXIudHMiLCJzcmMvcGxhY2Vob2xkZXJzL0lQbGFjZWhvbGRlci50cyIsInNyYy9yZXBsYWNlcnMvSVJlcGxhY2VyRGVmaW5pdGlvbi50cyIsInNyYy9yZXBsYWNlcnMvUmVwbGFjZXIudHMiLCJzcmMvcnVubmVycy9JUnVubmVyRGVmaW5pdGlvbi50cyIsInNyYy9ydW5uZXJzL1J1bm5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0NBLDhCQUEwQiwwQkFBMEIsQ0FBQyxDQUFBO0FBQ3JELHVCQUFtQixrQkFBa0IsQ0FBQyxDQUFBO0FBRXRDLDRCQUFpTCxlQUFlLENBQUMsQ0FBQTtBQUdqTSxJQUFJLGVBQWUsR0FBc0I7SUFDckMsS0FBSyxFQUFFLGNBQWM7SUFDckIsV0FBVyxFQUFFLEVBQUU7SUFDZixVQUFVLEVBQUUsRUFBRTtJQUNkLFVBQVUsRUFBRSxJQUFJO0lBQ2hCLElBQUksRUFBRSxVQUFDLE9BQWdCLEVBQUUsSUFBYztRQUNuQyxPQUFPLENBQUMsTUFBTSxHQUFHLElBQUksdUJBQWEsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3hELE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDbkIsQ0FBQztDQUNKLENBQUM7QUFDUyxhQUFLLEdBQUcsSUFBSSxnQkFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBRS9DLElBQUksY0FBYyxHQUFzQjtJQUNwQyxLQUFLLEVBQUUsYUFBYTtJQUNwQixXQUFXLEVBQUUsRUFBRTtJQUNmLFVBQVUsRUFBRSxFQUFFO0lBQ2QsVUFBVSxFQUFFLEtBQUs7SUFDakIsSUFBSSxFQUFFLFVBQUMsT0FBZ0IsRUFBRSxJQUFjO1FBQ25DLEVBQUUsQ0FBQSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7WUFBQyxPQUFPLENBQUMsTUFBTSxHQUFHLElBQUksdUJBQWEsQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDMUcsSUFBSTtZQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsSUFBSSx1QkFBYSxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNuRCxNQUFNLENBQUMsT0FBTyxDQUFDO0lBQ25CLENBQUM7Q0FDSixDQUFDO0FBQ1MsWUFBSSxHQUFHLElBQUksZ0JBQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUU3QyxJQUFJLFlBQVksR0FBc0I7SUFDbEMsS0FBSyxFQUFFLFdBQVc7SUFDbEIsV0FBVyxFQUFFLENBQUMsbUJBQUssRUFBRSx5QkFBVyxFQUFFLHNCQUFRLEVBQUUsb0JBQU0sRUFBRSx1Q0FBeUIsRUFBRSxvQ0FBc0IsRUFBRSwrQkFBaUIsRUFBRSw0QkFBYyxFQUFFLG1CQUFLLEVBQUUscUJBQU8sQ0FBQztJQUN6SixVQUFVLEVBQUUsQ0FBQyxZQUFJLEVBQUUsYUFBSyxDQUFDO0lBQ3pCLFVBQVUsRUFBRSxLQUFLO0lBQ2pCLElBQUksRUFBRSxVQUFDLE9BQWdCLEVBQUUsSUFBYztRQUNuQyxFQUFFLENBQUEsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEMsT0FBTyxDQUFDLE1BQU0sR0FBRyxJQUFJLHVCQUFhLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxHQUFHLE9BQU8sQ0FBQyxTQUFTLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM1RyxDQUFDO1FBQ0QsSUFBSTtZQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsSUFBSSx1QkFBYSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDckUsTUFBTSxDQUFDLE9BQU8sQ0FBQztJQUNuQixDQUFDO0NBQ0osQ0FBQztBQUNTLFVBQUUsR0FBRyxJQUFJLGdCQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7QUFFekMsSUFBSSxtQkFBbUIsR0FBc0I7SUFDekMsS0FBSyxFQUFFLGtCQUFrQjtJQUN6QixXQUFXLEVBQUUsRUFBRTtJQUNmLFVBQVUsRUFBRSxFQUFFO0lBQ2QsVUFBVSxFQUFFLElBQUk7SUFDaEIsSUFBSSxFQUFFLFVBQUMsT0FBZ0IsRUFBRSxJQUFjO1FBQ25DLE9BQU8sQ0FBQyxNQUFNLEdBQUcsSUFBSSx1QkFBYSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDeEQsTUFBTSxDQUFDLE9BQU8sQ0FBQztJQUNuQixDQUFDO0NBQ0osQ0FBQTtBQUNVLGlCQUFTLEdBQUcsSUFBSSxnQkFBTSxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFFdkQsSUFBSSxnQkFBZ0IsR0FBc0I7SUFDdEMsS0FBSyxFQUFFLGVBQWU7SUFDdEIsV0FBVyxFQUFFLENBQUMsbUJBQUssRUFBRSx5QkFBVyxFQUFFLHNCQUFRLEVBQUUsb0JBQU0sRUFBRSx1Q0FBeUIsRUFBRSxvQ0FBc0IsRUFBRSwrQkFBaUIsRUFBRSw0QkFBYyxFQUFFLG1CQUFLLEVBQUUscUJBQU8sQ0FBQztJQUN6SixVQUFVLEVBQUUsQ0FBQyxZQUFJLEVBQUUsaUJBQVMsQ0FBQztJQUM3QixVQUFVLEVBQUUsS0FBSztJQUNqQixJQUFJLEVBQUUsVUFBQyxPQUFnQixFQUFFLElBQWM7UUFDbkMsRUFBRSxDQUFBLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFBLENBQUM7WUFDdEMsT0FBTyxDQUFDLE1BQU0sR0FBRyxJQUFJLHVCQUFhLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxHQUFHLE9BQU8sQ0FBQyxTQUFTLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM1RyxDQUFDO1FBQ0QsSUFBSTtZQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsSUFBSSx1QkFBYSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDckUsTUFBTSxDQUFDLE9BQU8sQ0FBQztJQUNuQixDQUFDO0NBQ0osQ0FBQTtBQUNVLGNBQU0sR0FBRyxJQUFJLGdCQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUVqRCxJQUFJLGdCQUFnQixHQUFzQjtJQUN0QyxLQUFLLEVBQUUsZUFBZTtJQUN0QixXQUFXLEVBQUUsRUFBRTtJQUNmLFVBQVUsRUFBRSxFQUFFO0lBQ2QsVUFBVSxFQUFFLElBQUk7SUFDaEIsSUFBSSxFQUFFLFVBQUMsT0FBZ0IsRUFBRSxJQUFjO1FBQ25DLE9BQU8sQ0FBQyxNQUFNLEdBQUcsSUFBSSx1QkFBYSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDeEQsTUFBTSxDQUFDLE9BQU8sQ0FBQztJQUNuQixDQUFDO0NBQ0osQ0FBQTtBQUNVLGNBQU0sR0FBRyxJQUFJLGdCQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUVqRCxJQUFJLGFBQWEsR0FBc0I7SUFDbkMsS0FBSyxFQUFFLFlBQVk7SUFDbkIsV0FBVyxFQUFFLENBQUMsd0JBQVUsQ0FBQztJQUN6QixVQUFVLEVBQUUsQ0FBQyxjQUFNLENBQUM7SUFDcEIsVUFBVSxFQUFFLEtBQUs7SUFDakIsSUFBSSxFQUFFLFVBQUMsT0FBZ0IsRUFBRSxJQUFjO1FBQ25DLE9BQU8sQ0FBQyxNQUFNLEdBQUcsSUFBSSx1QkFBYSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDekUsTUFBTSxDQUFDLE9BQU8sQ0FBQztJQUNuQixDQUFDO0NBQ0osQ0FBQTtBQUdELHVCQUFnQyxrQkFBa0IsQ0FBQztBQUEzQyxrQ0FBMkM7OztBQzdGbkQsOEJBQTBCLDBCQUEwQixDQUFDLENBQUE7QUFHckQ7SUFNSSxpQkFBbUIsS0FBYSxFQUFTLE1BQWMsRUFBUyxTQUFpQixFQUFTLEtBQWEsRUFBUyxLQUFZLEVBQVUsTUFBYztRQUFqSSxVQUFLLEdBQUwsS0FBSyxDQUFRO1FBQVMsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUFTLGNBQVMsR0FBVCxTQUFTLENBQVE7UUFBUyxVQUFLLEdBQUwsS0FBSyxDQUFRO1FBQVMsVUFBSyxHQUFMLEtBQUssQ0FBTztRQUFVLFdBQU0sR0FBTixNQUFNLENBQVE7UUFMN0ksZUFBVSxHQUFjLEVBQUUsQ0FBQztRQUczQixjQUFTLEdBQWUsRUFBRSxDQUFDO1FBQzNCLFdBQU0sR0FBa0IsSUFBSSx1QkFBYSxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4RCxJQUFJLE1BQWMsQ0FBQztRQUNuQixHQUFHLENBQUEsQ0FBVyxVQUF5QixFQUF6QixLQUFBLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFuQyxjQUFNLEVBQU4sSUFBbUMsQ0FBQztZQUFwQyxNQUFNLFNBQUE7WUFDTixFQUFFLENBQUEsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDM0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7Z0JBQ3JCLEtBQUssQ0FBQztZQUNWLENBQUM7U0FDSjtJQUNMLENBQUM7SUFFTSx5QkFBTyxHQUFkLFVBQWUsSUFBYztRQUN6QixNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFFTSx5QkFBTyxHQUFkLFVBQWUsUUFBa0I7UUFDN0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ2hGLENBQUM7SUFFTSx1QkFBSyxHQUFaLFVBQWEsTUFBZTtRQUN4QixJQUFJLFNBQWlCLEVBQUUsSUFBSSxHQUFXLEVBQUUsQ0FBQztRQUN6QyxHQUFHLENBQUEsQ0FBYyxVQUFlLEVBQWYsS0FBQSxJQUFJLENBQUMsVUFBVSxFQUE1QixjQUFTLEVBQVQsSUFBNEIsQ0FBQztZQUE3QixTQUFTLFNBQUE7WUFDVCxJQUFJLElBQUksU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1NBQy9DO1FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRU0sMkJBQVMsR0FBaEI7UUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsVUFBQSxPQUFPLElBQUksT0FBQSxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQXBDLENBQW9DLENBQUM7Y0FDOUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsVUFBQSxPQUFPLElBQUksT0FBQSxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQXBDLENBQW9DLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSTtjQUNoRyxFQUFFLENBQUM7SUFDTCxDQUFDO0lBQ0wsY0FBQztBQUFELENBckNBLEFBcUNDLElBQUE7QUFyQ0QseUJBcUNDLENBQUE7OztBQzdDRCx5Q0FBeUM7QUFDekMsTUFBTTtBQUNOLDhCQUE4QjtBQUM5QixvQkFBb0I7QUFDcEIsWUFBWTtBQUNaLGFBQWE7QUFDYixNQUFNO0FBQ04sZ0NBQWdDO0FBQ2hDLFVBQVU7QUFDViwwQkFBMEI7QUFDMUIsaUJBQWlCO0FBQ2pCLGlCQUFpQjtBQUNqQix5RkFBeUY7QUFDekYsMkZBQTJGO0FBQzNGLGtGQUFrRjtBQUNsRixVQUFVO0FBQ1Ysb0ZBQW9GO0FBQ3BGLDhJQUE4STtBQUM5SSxvSUFBb0k7QUFDcEksZ0NBQWdDO0FBQ2hDLHdCQUF3QjtBQUN4QixRQUFRO0FBQ1IsSUFBSTs7O0FDcEJKLDJCQUF1QiwwQkFBMEIsQ0FBQyxDQUFBO0FBQ2xELDBCQUEwRCxhQUFhLENBQUMsQ0FBQTtBQUd4RSxJQUFJLGVBQWUsR0FBMEI7SUFDekMsUUFBUSxFQUFFLGlCQUFpQjtJQUMzQixLQUFLLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxlQUFHLEVBQUUsbUJBQU8sQ0FBQyxFQUFFLENBQUMsbUJBQU8sQ0FBQyxFQUFFLE9BQU8sQ0FBQztJQUNwRCxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQ2YsSUFBSSxFQUFFLFVBQUMsT0FBZ0IsRUFBRSxNQUFlLEVBQUUsU0FBcUIsSUFBYyxPQUFBLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBL0QsQ0FBK0Q7Q0FDL0ksQ0FBQTtBQUNVLGFBQUssR0FBRyxJQUFJLG9CQUFVLENBQUMsZUFBZSxDQUFDLENBQUM7QUFFbkQsSUFBSSxxQkFBcUIsR0FBMEI7SUFDL0MsUUFBUSxFQUFFLGlCQUFpQjtJQUMzQixLQUFLLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxlQUFHLENBQUMsRUFBRSxDQUFDLG1CQUFPLENBQUMsRUFBRSxPQUFPLENBQUM7SUFDM0MsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztJQUNmLElBQUksRUFBRSxVQUFDLE9BQWdCLEVBQUUsTUFBZSxFQUFFLFNBQXFCLElBQWMsT0FBQSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQTdELENBQTZEO0NBQzdJLENBQUE7QUFDVSxtQkFBVyxHQUFHLElBQUksb0JBQVUsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0FBRS9ELElBQUksa0JBQWtCLEdBQTBCO0lBQzVDLFFBQVEsRUFBRSxpQkFBaUI7SUFDM0IsS0FBSyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsZUFBRyxDQUFDLEVBQUUsQ0FBQyxtQkFBTyxDQUFDLEVBQUUsT0FBTyxDQUFDO0lBQzNDLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFDZixJQUFJLEVBQUUsVUFBQyxPQUFnQixFQUFFLE1BQWUsRUFBRSxTQUFxQixJQUFjLE9BQUEsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUE3RCxDQUE2RDtDQUM3SSxDQUFBO0FBQ1UsZ0JBQVEsR0FBRyxJQUFJLG9CQUFVLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUV6RCxJQUFJLGdCQUFnQixHQUEwQjtJQUMxQyxRQUFRLEVBQUUsaUJBQWlCO0lBQzNCLEtBQUssRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLGVBQUcsQ0FBQyxDQUFDO0lBQ3ZCLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNiLElBQUksRUFBRSxVQUFDLE9BQWdCLEVBQUUsTUFBZSxFQUFFLFNBQXFCLElBQWMsT0FBQSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLElBQUksRUFBckMsQ0FBcUM7Q0FDckgsQ0FBQTtBQUNVLGNBQU0sR0FBRyxJQUFJLG9CQUFVLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUVyRCxJQUFJLG1DQUFtQyxHQUEwQjtJQUM3RCxRQUFRLEVBQUUsb0JBQW9CO0lBQzlCLEtBQUssRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLGVBQUcsQ0FBQyxFQUFFLENBQUMsbUJBQU8sQ0FBQyxFQUFFLE9BQU8sQ0FBQztJQUMzQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQ2YsSUFBSSxFQUFFLFVBQUMsT0FBZ0IsRUFBRSxNQUFlLEVBQUUsU0FBcUIsSUFBYyxPQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQWhILENBQWdIO0NBQ2hNLENBQUE7QUFDVSxpQ0FBeUIsR0FBRyxJQUFJLG9CQUFVLENBQUMsbUNBQW1DLENBQUMsQ0FBQztBQUUzRixJQUFJLGdDQUFnQyxHQUEwQjtJQUMxRCxRQUFRLEVBQUUsb0JBQW9CO0lBQzlCLEtBQUssRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLGVBQUcsQ0FBQyxFQUFFLENBQUMsbUJBQU8sQ0FBQyxFQUFFLE9BQU8sQ0FBQztJQUMzQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQ2YsSUFBSSxFQUFFLFVBQUMsT0FBZ0IsRUFBRSxNQUFlLEVBQUUsU0FBcUIsSUFBYyxPQUFBLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBNUwsQ0FBNEw7Q0FDNVEsQ0FBQTtBQUNVLDhCQUFzQixHQUFHLElBQUksb0JBQVUsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO0FBRXJGLElBQUksMkJBQTJCLEdBQTBCO0lBQ3JELFFBQVEsRUFBRSxvQkFBb0I7SUFDOUIsS0FBSyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsZUFBRyxDQUFDLEVBQUUsQ0FBQyx5QkFBYSxDQUFDLEVBQUUsT0FBTyxDQUFDO0lBQ2pELFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFDZixJQUFJLEVBQUUsVUFBQyxPQUFnQixFQUFFLE1BQWUsRUFBRSxTQUFxQixJQUFjLE9BQVMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUUsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBOUUsQ0FBOEU7Q0FDOUosQ0FBQTtBQUNVLHlCQUFpQixHQUFHLElBQUksb0JBQVUsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO0FBRTNFLElBQUksd0JBQXdCLEdBQTBCO0lBQ2xELFFBQVEsRUFBRSxvQkFBb0I7SUFDOUIsS0FBSyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsZUFBRyxDQUFDLEVBQUUsQ0FBQyx5QkFBYSxDQUFDLEVBQUUsT0FBTyxDQUFDO0lBQ2pELFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFDZixJQUFJLEVBQUUsVUFBQyxPQUFnQixFQUFFLE1BQWUsRUFBRSxTQUFxQixJQUFjLE9BQVMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUUsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBOUUsQ0FBOEU7Q0FDOUosQ0FBQTtBQUNVLHNCQUFjLEdBQUcsSUFBSSxvQkFBVSxDQUFDLHdCQUF3QixDQUFDLENBQUM7QUFFckUsSUFBSSxlQUFlLEdBQTBCO0lBQ3pDLFFBQVEsRUFBRSxlQUFlO0lBQ3pCLEtBQUssRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLGVBQUcsQ0FBQyxDQUFDO0lBQ3ZCLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNiLElBQUksRUFBRSxVQUFDLE9BQWdCLEVBQUUsTUFBZSxFQUFFLFNBQXFCLElBQWMsT0FBQSxLQUFLLENBQVUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUUsQ0FBQyxFQUE5QyxDQUE4QztDQUM5SCxDQUFBO0FBQ1UsYUFBSyxHQUFHLElBQUksb0JBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUVuRCxJQUFJLGlCQUFpQixHQUEwQjtJQUMzQyxRQUFRLEVBQUUsaUJBQWlCO0lBQzNCLEtBQUssRUFBRSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsQ0FBQyxlQUFHLEVBQUUsMEJBQWMsQ0FBQyxFQUFFLE9BQU8sQ0FBQztJQUN6RCxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDYixJQUFJLEVBQUUsVUFBQyxPQUFnQixFQUFFLE1BQWUsRUFBRSxTQUFxQixJQUFjLE9BQUEsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBOUgsQ0FBOEg7Q0FDOU0sQ0FBQTtBQUNVLGVBQU8sR0FBRyxJQUFJLG9CQUFVLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUV2RCxJQUFJLG9CQUFvQixHQUEwQjtJQUM5QyxRQUFRLEVBQUUsc0JBQXNCO0lBQ2hDLEtBQUssRUFBRSxDQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsUUFBUSxDQUFDO0lBQ3hDLFFBQVEsRUFBRSxFQUFFO0lBQ1osSUFBSSxFQUFFLFVBQUMsT0FBZ0IsRUFBRSxNQUFlLEVBQUUsU0FBcUI7UUFDM0QsSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFFLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDckIsR0FBRyxDQUFBLENBQUMsQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEdBQVMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUUsQ0FBQyxNQUFNLEVBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQztZQUN6RCxTQUFTLENBQVMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEUsTUFBTSxJQUFJLEtBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUksQ0FBQTtRQUMxQyxDQUFDO1FBQ0QsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUNsQixDQUFDO0NBQ0osQ0FBQTtBQUNVLGtCQUFVLEdBQUcsSUFBSSxvQkFBVSxDQUFDLG9CQUFvQixDQUFDLENBQUM7QUFFN0QsMkJBQW9DLDBCQUEwQixDQUFDO0FBQXZELDBDQUF1RDs7O0FDaEcvRCxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRztJQUN0QixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUIsQ0FBQyxDQUFBO0FBRUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUc7SUFDckIsR0FBRyxDQUFBLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxNQUFNLEVBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQztRQUMzQixFQUFFLENBQUEsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDO1lBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUMvQixDQUFDO0FBQ0wsQ0FBQyxDQUFBO0FBRUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsVUFBUyxDQUFDO0lBQ2pDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxLQUFLLENBQUMsRUFBUCxDQUFPLENBQUMsQ0FBQztBQUNuQyxDQUFDLENBQUE7OztBQ2R5Qjs7QUNIMUIsd0JBQTJCLFdBQVcsQ0FBQyxDQUFBO0FBRXZDOzs7Ozs7R0FNRztBQUNILGVBQXNCLEdBQVcsRUFBRSxTQUFzQjtJQUN4RCxzQkFBWSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDaEMsTUFBTSxDQUFDLHNCQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDbEMsQ0FBQztBQUhlLGFBQUssUUFHcEIsQ0FBQTs7O0FDWEQseUJBQXFCLHNCQUFzQixDQUFDLENBQUE7QUFJNUMsSUFBSSxhQUFhLEdBQXdCO0lBQ3JDLFdBQVcsRUFBRSxDQUFDLElBQUksRUFBRSwwQkFBMEIsQ0FBQztJQUMvQyxJQUFJLEVBQUUsVUFBQyxJQUFhLEVBQUUsTUFBZSxFQUFFLFNBQXFCLElBQWMsT0FBQSxDQUFDLElBQUksRUFBTCxDQUFLO0NBQ2xGLENBQUE7QUFDVSxXQUFHLEdBQUcsSUFBSSxrQkFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBRTdDLElBQUksaUJBQWlCLEdBQXdCO0lBQ3pDLFdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQztJQUNuQixJQUFJLEVBQUUsVUFBQyxJQUFhLEVBQUUsTUFBZSxFQUFFLFNBQXFCLElBQWMsT0FBQSxJQUFJLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUF2RSxDQUF1RTtDQUNwSixDQUFBO0FBQ1UsZUFBTyxHQUFHLElBQUksa0JBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBRXJELElBQUksdUJBQXVCLEdBQXdCO0lBQy9DLFdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQztJQUNuQixJQUFJLEVBQUUsVUFBQyxJQUFhLEVBQUUsTUFBZSxFQUFFLFNBQXFCLElBQWMsT0FBQSxJQUFJLElBQWEsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUUsQ0FBQyxNQUFNLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBeEYsQ0FBd0Y7Q0FDckssQ0FBQTtBQUNVLHFCQUFhLEdBQUcsSUFBSSxrQkFBUSxDQUFDLHVCQUF1QixDQUFDLENBQUM7QUFFakUsSUFBSSx3QkFBd0IsR0FBd0I7SUFDaEQsV0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDO0lBQ25CLElBQUksRUFBRSxVQUFDLElBQWEsRUFBRSxNQUFlLEVBQUUsU0FBcUIsSUFBYyxPQUFBLElBQUksSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUExSSxDQUEwSTtDQUN2TixDQUFBO0FBQ1Usc0JBQWMsR0FBRyxJQUFJLGtCQUFRLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQUduRSx5QkFBa0Msc0JBQXNCLENBQUM7QUFBakQsc0NBQWlEOzs7QUM3QnpELHVCQUFtQixrQkFBa0IsQ0FBQyxDQUFBO0FBQ3RDLHdCQUFtQyxXQUFXLENBQUMsQ0FBQTtBQUUvQyxJQUFJLHNCQUFzQixHQUFzQjtJQUM1QyxPQUFPLEVBQUUsQ0FBQyxzQkFBWSxDQUFDO0NBQzFCLENBQUE7QUFDVSxvQkFBWSxHQUFHLElBQUksZ0JBQU0sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0FBRVk7O0FDUDlELG9CQUFZLEdBQW1CO0lBQ3RDO1FBQ0ksSUFBSSxFQUFFLE9BQU87UUFDYixPQUFPLEVBQUUsUUFBUTtRQUNqQixXQUFXLEVBQUUsY0FBTSxPQUFBLCtCQUE2QixFQUE3QixDQUE2QjtLQUNuRDtJQUNEO1FBQ0ksSUFBSSxFQUFFLFVBQVU7UUFDaEIsT0FBTyxFQUFFLFFBQVE7UUFDakIsV0FBVyxFQUFFLFVBQUMsSUFBaUIsSUFBSyxPQUFBLFVBQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFBLFFBQVEsSUFBSSxPQUFBLFFBQVEsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxVQUFBLFVBQVUsSUFBSSxPQUFBLFVBQVUsQ0FBQyxNQUFNLEVBQWpCLENBQWlCLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQTlFLENBQThFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQVMsRUFBOUgsQ0FBOEg7S0FDcks7SUFDRDtRQUNJLElBQUksRUFBRSxZQUFZO1FBQ2xCLE9BQU8sRUFBRSxRQUFRO1FBQ2pCLFdBQVcsRUFBRSxjQUFNLE9BQUEsYUFBYSxFQUFiLENBQWE7S0FDbkM7SUFDRDtRQUNJLElBQUksRUFBRSxRQUFRO1FBQ2QsT0FBTyxFQUFFLFFBQVE7UUFDakIsV0FBVyxFQUFFLGNBQU0sT0FBQSxNQUFNLEVBQU4sQ0FBTTtLQUM1QjtDQUNKLENBQUM7QUFDRixxQkFBb0MsSUFBWTtJQUM1QyxNQUFNLENBQUMsb0JBQVksQ0FBQyxNQUFNLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsSUFBSSxLQUFLLElBQUksRUFBZixDQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN4RCxDQUFDO0FBRkQsNkJBRUMsQ0FBQTs7O0FDekJELHlCQUFxQixzQkFBc0IsQ0FBQyxDQUFBO0FBRzVDLElBQUksa0JBQWtCLEdBQXdCO0lBQzFDLEtBQUssRUFBRSxvQ0FBb0M7SUFDM0MsSUFBSSxFQUFFLFVBQUMsVUFBK0IsRUFBRSxJQUFZLEVBQUUsU0FBcUIsSUFBYSxPQUFBLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxVQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFLLE9BQUEsRUFBRSxHQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsRUFBaEIsQ0FBZ0IsQ0FBQyxFQUFuRSxDQUFtRTtDQUM5SixDQUFBO0FBQ1UsZ0JBQVEsR0FBRyxJQUFJLGtCQUFRLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUd2RCx5QkFBa0Msc0JBQXNCLENBQUM7QUFBakQsc0NBQWlEOzs7QUNWekQsdUJBQW1CLGtCQUFrQixDQUFDLENBQUE7QUFDdEMsd0JBQXlELFdBQVcsQ0FBQyxDQUFBO0FBQ3JFLDBCQUFpQyxhQUFhLENBQUMsQ0FBQTtBQUUvQyxJQUFJLHNCQUFzQixHQUFzQjtJQUM1QyxLQUFLLEVBQUUsdUNBQXVDO0lBQzlDLE9BQU8sRUFBRSxDQUFDLFlBQUUsRUFBRSxjQUFJLEVBQUUsZUFBSyxFQUFFLGdCQUFNLEVBQUUsbUJBQVMsQ0FBQztJQUM3QyxTQUFTLEVBQUUsQ0FBQyxvQkFBUSxDQUFDO0NBQ3hCLENBQUE7QUFDVSxvQkFBWSxHQUFHLElBQUksZ0JBQU0sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0FBRzdELHVCQUFnQyxrQkFBa0IsQ0FBQztBQUEzQyxrQ0FBMkM7OztBQ2JuRCxxQkFBNkIsUUFBUSxDQUFDLENBQUE7QUFDdEMsSUFBSSxNQUFNLEdBQUc7SUFDVCxLQUFLLEVBQUUsWUFBSztJQUNaLE9BQU8sRUFBRSxPQUFPO0NBRW5CLENBQUM7QUFDRixFQUFFLENBQUEsQ0FBQyxPQUFPLE1BQU0sS0FBSyxXQUFXLENBQUM7SUFBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsTUFBTSxDQUFDO0FBQzVELGtCQUFlLE1BQU0sQ0FBQzs7O0FDSnRCO0lBQUE7UUFDUSxjQUFTLEdBQWUsRUFBRSxDQUFDO1FBQzNCLGFBQVEsR0FBYyxFQUFFLENBQUM7UUFDekIsZUFBVSxHQUFjLEVBQUUsQ0FBQztJQVNuQyxDQUFDO0lBUFUsdUJBQU8sR0FBZDtRQUNJLElBQUksT0FBZ0IsRUFBRSxJQUFJLEdBQVcsRUFBRSxDQUFDO1FBQ3hDLEdBQUcsQ0FBQSxDQUFZLFVBQWEsRUFBYixLQUFBLElBQUksQ0FBQyxRQUFRLEVBQXhCLGNBQU8sRUFBUCxJQUF3QixDQUFDO1lBQXpCLE9BQU8sU0FBQTtZQUNQLElBQUksSUFBSSxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztTQUN6QztRQUNELE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUNMLFlBQUM7QUFBRCxDQVpBLEFBWUMsSUFBQTtBQVpELHVCQVlDLENBQUE7OztBQ2ZELDBCQUFzQixhQUFhLENBQUMsQ0FBQTtBQUVwQztJQUdJLGVBQVksSUFBUztRQUNqQixFQUFFLENBQUEsQ0FBQyxJQUFJLFlBQVksS0FBSyxDQUFDLENBQUEsQ0FBQztZQUN0QixJQUFJLENBQUMsSUFBSSxHQUFHLG1CQUFTLENBQUMsS0FBSyxDQUFDO1FBQ2hDLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFBLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0QyxJQUFJLENBQUMsSUFBSSxHQUFHLG1CQUFTLENBQUMsTUFBTSxDQUFDO1lBQzdCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNqRCxDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQixJQUFJLENBQUMsSUFBSSxHQUFHLG1CQUFTLENBQUMsTUFBTSxDQUFDO1lBQzdCLElBQUksQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xDLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQyxJQUFJLEdBQUcsbUJBQVMsQ0FBQyxRQUFRLENBQUM7WUFDL0IsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDdEIsQ0FBQztJQUNMLENBQUM7SUFFTSx3QkFBUSxHQUFmLFVBQWdCLFNBQXFCO1FBQ2pDLEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssbUJBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQSxDQUFDO1lBQ2pDLEVBQUUsQ0FBQSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQVMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQSxDQUFDO2dCQUNyQyxNQUFNLENBQUMsU0FBUyxDQUFTLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtZQUN4QyxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osTUFBTSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQVMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDckQsQ0FBQztRQUNMLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3RCLENBQUM7SUFDTCxDQUFDO0lBQ0wsWUFBQztBQUFELENBN0JBLEFBNkJDLElBQUE7QUE3QkQsdUJBNkJDLENBQUE7OztBQy9CRCxJQUFLLFNBS0o7QUFMRCxXQUFLLFNBQVM7SUFDViw2Q0FBTSxDQUFBO0lBQ04sNkNBQU0sQ0FBQTtJQUNOLDJDQUFLLENBQUE7SUFDTCxpREFBUSxDQUFBO0FBQ1osQ0FBQyxFQUxJLFNBQVMsS0FBVCxTQUFTLFFBS2I7QUFDRCxrQkFBZSxTQUFTLENBQUM7OztBQ0R6QixpREFBaUQ7QUFDakQ7SUFDSSxnQkFBbUIsVUFBNkI7UUFBN0IsZUFBVSxHQUFWLFVBQVUsQ0FBbUI7UUFDNUMsRUFBRSxDQUFBLENBQUMsQ0FBQyxVQUFVLENBQUM7WUFBQyxNQUFNLHFEQUFxRCxDQUFDO0lBQ2hGLENBQUM7SUFFTSx3QkFBTyxHQUFkLFVBQWUsU0FBaUI7UUFDNUIsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBRU0sc0JBQUssR0FBWixVQUFhLE9BQWdCO1FBQ3pCLElBQUksVUFBc0IsQ0FBQztRQUMzQixHQUFHLENBQUEsQ0FBZSxVQUEyQixFQUEzQixLQUFBLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUF6QyxjQUFVLEVBQVYsSUFBeUMsQ0FBQztZQUExQyxVQUFVLFNBQUE7WUFDVixFQUFFLENBQUEsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZDLE9BQU8sQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1lBQ3BDLENBQUM7U0FDSjtJQUNMLENBQUM7SUFFTSx3QkFBTyxHQUFkLFVBQWUsT0FBZ0IsRUFBRSxJQUFjO1FBQzNDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUNMLGFBQUM7QUFBRCxDQXJCQSxBQXFCQyxJQUFBO0FBckJELHdCQXFCQyxDQUFBOzs7QUNmZ0M7O0FDWGpDO0lBRUksdUJBQW1CLElBQVksRUFBUyxNQUFnQjtRQUFyQyxTQUFJLEdBQUosSUFBSSxDQUFRO1FBQVMsV0FBTSxHQUFOLE1BQU0sQ0FBVTtJQUFFLENBQUM7SUFDL0Qsb0JBQUM7QUFBRCxDQUhBLEFBR0MsSUFBQTtBQUhELCtCQUdDLENBQUE7OztBQ0pELDZCQUF3QixpQkFBaUIsQ0FBQyxDQUFBO0FBQzFDLGlDQUE2QixvQkFBb0IsQ0FBQyxDQUFBO0FBT2xELFFBQU8sZUFBZSxDQUFDLENBQUE7QUFFdkI7SUFNSSxvQkFBb0IsVUFBaUM7UUFBakMsZUFBVSxHQUFWLFVBQVUsQ0FBdUI7UUFKN0MsYUFBUSxHQUF1QixFQUFFLENBQUM7UUFLdEMsRUFBRSxDQUFBLENBQUMsQ0FBQyxVQUFVLENBQUM7WUFBQyxNQUFNLHlEQUF5RCxDQUFDO1FBQ2hGLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDO1FBQ3BDLElBQUksQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQztRQUM5QixJQUFJLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUM7SUFDaEMsQ0FBQztJQUVPLDhCQUFTLEdBQWpCLFVBQWtCLFVBQWlDO1FBQy9DLElBQUksUUFBUSxHQUFHLFVBQVUsQ0FBQyxRQUFRLEVBQUUsSUFBMkIsRUFBRSxJQUFZLEVBQUUsR0FBRyxHQUFDLENBQUMsQ0FBQztRQUNyRixHQUFHLENBQUEsQ0FBUyxVQUFnQixFQUFoQixLQUFBLFVBQVUsQ0FBQyxLQUFLLEVBQXhCLGNBQUksRUFBSixJQUF3QixDQUFDO1lBQXpCLElBQUksU0FBQTtZQUNKLEVBQUUsQ0FBQSxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUFDLE1BQU0sa0NBQWtDLENBQUM7WUFDbkQsRUFBRSxDQUFBLENBQUMsSUFBSSxZQUFZLEtBQUssQ0FBQztnQkFBQyxJQUFJLEdBQUcsVUFBVSxDQUFDO1lBQzVDLElBQUk7Z0JBQUMsSUFBSSxHQUFXLElBQUksQ0FBQztZQUN6QixJQUFJLFdBQVcsR0FBRyxzQkFBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3BDLFFBQVEsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLFdBQVcsQ0FBQyxJQUFJLFlBQVksS0FBSyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQy9HLEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFlBQVksS0FBSyxDQUFDO2dCQUFZLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ25GLElBQUksQ0FBQyxFQUFFLENBQUEsQ0FBQyxDQUFDLEtBQUssQ0FBTSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN2QyxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7Z0JBQ2YsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ2hDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ2hCLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDO1lBQ2hDLENBQUM7WUFDRCxJQUFJO2dCQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDO1lBQy9CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBQzFCLEdBQUcsRUFBRSxDQUFDO1NBQ1Q7UUFDRCxRQUFRLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDcEQsTUFBTSxDQUFDLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRU8sMEJBQUssR0FBYixVQUFjLE9BQWdCO1FBQzFCLElBQUksTUFBTSxHQUFHLElBQUksMEJBQWdCLEVBQUUsRUFBRSxLQUFLLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFrQixFQUFFLFNBQVMsR0FBVyxDQUFDLENBQUMsQ0FBQztRQUNoSSxNQUFNLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1QixHQUFHLENBQUEsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxLQUFLLENBQUMsTUFBTSxFQUFDLENBQUMsRUFBRSxFQUFDLENBQUM7WUFDeEIsRUFBRSxDQUFBLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLFlBQVksS0FBSyxDQUFDLENBQUEsQ0FBQztnQkFDakMsU0FBUyxFQUFFLENBQUM7Z0JBQ1osR0FBRyxDQUFBLENBQWEsVUFBMkIsRUFBM0IsS0FBWSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsRUFBdkMsY0FBUSxFQUFSLElBQXVDLENBQUM7b0JBQXhDLFFBQVEsU0FBQTtvQkFDUixFQUFFLENBQUEsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUFDLE1BQU0sQ0FBQyxHQUFHLENBQVMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUM7aUJBQzVGO1lBQ0wsQ0FBQztZQUNELElBQUk7Z0JBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBUyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3ZELENBQUM7UUFDRCxNQUFNLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDO1FBQzNDLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVNLDZCQUFRLEdBQWYsVUFBZ0IsT0FBZ0I7UUFDNUIsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNqQyxNQUFNLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2pFLElBQUksS0FBYSxDQUFDO1FBQ2xCLEdBQUcsQ0FBQSxDQUFVLFVBQXdCLEVBQXhCLEtBQUEsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQWpDLGNBQUssRUFBTCxJQUFpQyxDQUFDO1lBQWxDLEtBQUssU0FBQTtZQUNMLEVBQUUsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUNoSTtRQUNELE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ3ZCLENBQUM7SUFFTSw0QkFBTyxHQUFkLFVBQWUsU0FBaUI7UUFDNUIsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFDTCxpQkFBQztBQUFELENBbEVBLEFBa0VDLElBQUE7QUFsRUQsNEJBa0VDLENBQUE7OztBQzFFRCxzQkFBa0IsVUFBVSxDQUFDLENBQUE7QUFDN0I7SUFBQTtRQUVXLFVBQUssR0FBWSxFQUFFLENBQUM7UUFFcEIsYUFBUSxHQUFlLEVBQUUsQ0FBQztJQVNyQyxDQUFDO0lBUFUsOEJBQUcsR0FBVixVQUFXLElBQVksRUFBRSxLQUF3QixFQUFFLEtBQWM7UUFDN0QsRUFBRSxDQUFBLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDN0IsRUFBRSxDQUFBLENBQUMsS0FBSyxDQUFDO2dCQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLEtBQUssT0FBTyxHQUFHLElBQUksZUFBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLEtBQUssQ0FBQztZQUMxRSxJQUFJO2dCQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLE9BQU8sR0FBRyxJQUFJLGVBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQztRQUN0RSxDQUFDO1FBQ0QsSUFBSTtZQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLEtBQUssT0FBTyxHQUFHLElBQUksZUFBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLEtBQUssQ0FBQztJQUNsRSxDQUFDO0lBQ0wsdUJBQUM7QUFBRCxDQWJBLEFBYUMsSUFBQTtBQWJELGtDQWFDLENBQUE7OztBQ05vQzs7QUNOSDs7QUNHQzs7QUNKbkM7SUFDSSxrQkFBbUIsVUFBOEI7UUFBOUIsZUFBVSxHQUFWLFVBQVUsQ0FBb0I7UUFDN0MsRUFBRSxDQUFBLENBQUMsQ0FBQyxVQUFVLENBQUM7WUFBQyxNQUFNLHVEQUF1RCxDQUFDO0lBQ2xGLENBQUM7SUFFTSwwQkFBTyxHQUFkLFVBQWUsSUFBWTtRQUN2QixJQUFJLFVBQVUsQ0FBQztRQUNmLEdBQUcsQ0FBQSxDQUFlLFVBQTJCLEVBQTNCLEtBQUEsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQXpDLGNBQVUsRUFBVixJQUF5QyxDQUFDO1lBQTFDLFVBQVUsU0FBQTtZQUNWLEVBQUUsQ0FBQSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztTQUN6QztRQUNELE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUNMLGVBQUM7QUFBRCxDQVpBLEFBWUMsSUFBQTtBQVpELDBCQVlDLENBQUE7OztBQ1ZnQzs7QUNGakMsd0JBQW9CLFlBQVksQ0FBQyxDQUFBO0FBQ2pDLHNCQUFrQixVQUFVLENBQUMsQ0FBQTtBQUU3QixLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRztJQUN0QixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUIsQ0FBQyxDQUFBO0FBQ0Q7Ozs7Ozs7Ozs7O0dBV0c7QUFDSDtJQU1DLGlFQUFpRTtJQUNoRSxnREFBZ0Q7SUFDaEQsOEJBQThCO0lBQy9CLElBQUk7SUFDRCxnQkFBbUIsVUFBNkI7UUFBN0IsZUFBVSxHQUFWLFVBQVUsQ0FBbUI7UUFSNUMsYUFBUSxHQUFjLEVBQUUsQ0FBQztRQUN6QixVQUFLLEdBQWMsRUFBRSxDQUFDO1FBQ25CLFVBQUssR0FBYSxFQUFFLENBQUM7UUFPeEIsRUFBRSxDQUFBLENBQUMsQ0FBQyxVQUFVLENBQUM7WUFBQyxNQUFNLHFEQUFxRCxDQUFDO1FBQzVFLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQXpCLENBQXlCLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNwSCxDQUFDO0lBQ0o7Ozs7Ozs7O09BUU07SUFDQyxzQkFBSyxHQUFaLFVBQWEsR0FBVyxFQUFFLFNBQXFCO1FBQzNDLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ2hCLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ2hCLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ2YsSUFBSSxLQUFLLENBQUM7UUFDaEIsK0JBQStCO1FBQy9CLE9BQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUMsQ0FBQztZQUNwQyxJQUFJLEtBQUssU0FBUyxFQUFFLE1BQU0sU0FBUSxDQUFDO1lBQ25DLEdBQUcsQ0FBQSxDQUFXLFVBQXVCLEVBQXZCLEtBQUEsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQWpDLGNBQU0sRUFBTixJQUFpQyxDQUFDO2dCQUFsQyxNQUFNLFNBQUE7Z0JBQ04sRUFBRSxDQUFBLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLENBQUM7b0JBQ3pCLEtBQUssR0FBRyxJQUFJLGlCQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksZUFBSyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7b0JBQzlGLEtBQUssQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztvQkFDbEMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDeEIsQ0FBQzthQUNKO1lBQ1YsRUFBRSxDQUFBLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFBLENBQUM7Z0JBQ3RGLHlDQUF5QztnQkFDckQsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzFDLENBQUM7WUFDRCxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7Z0JBQ25GLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUN2QixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzlDLENBQUM7WUFDRCxJQUFJLENBQUMsQ0FBQztnQkFDTCxFQUFFLENBQUEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQztvQkFBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUM3RixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDdkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDM0IsQ0FBQztRQUdGLENBQUM7UUFDRCxtQkFBbUI7SUFDcEIsQ0FBQztJQUNEOzs7Ozs7T0FNTTtJQUNDLHdCQUFPLEdBQWQ7UUFDQyxJQUFJLEtBQUssR0FBRyxFQUFFLEVBQUUsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNwQixFQUFFLENBQUEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7WUFBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUNyRCxHQUFHLENBQUEsQ0FBZ0IsVUFBYSxFQUFiLEtBQUEsSUFBSSxDQUFDLFFBQVEsRUFBNUIsY0FBVyxFQUFYLElBQTRCLENBQUM7WUFBN0IsSUFBSSxPQUFPLFNBQUE7WUFDZCxLQUFLLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLLEdBQUUsQ0FBQyxDQUFDLENBQUM7WUFDakQsS0FBSyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztZQUM5QyxLQUFLLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQztTQUN4QjtRQUNELE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNO0lBQ3JCLENBQUM7SUFDRixhQUFDO0FBQUQsQ0F6RUEsQUF5RUMsSUFBQTtBQXpFRCx3QkF5RUMsQ0FBQTs7O0FDeEYyQjs7QUNBTzs7QUNIbkM7SUFDSSxrQkFBbUIsVUFBK0I7UUFBL0IsZUFBVSxHQUFWLFVBQVUsQ0FBcUI7UUFDOUMsRUFBRSxDQUFBLENBQUMsQ0FBQyxVQUFVLENBQUM7WUFBQyxNQUFNLHVEQUF1RCxDQUFDO0lBQ2xGLENBQUM7SUFFTSwwQkFBTyxHQUFkLFVBQWUsSUFBWSxFQUFFLFNBQXFCO1FBQzlDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztJQUNsRSxDQUFDO0lBQ0wsZUFBQztBQUFELENBUkEsQUFRQyxJQUFBO0FBUkQsMEJBUUMsQ0FBQTs7O0FDSGdDOztBQ0RqQztJQUNJLGdCQUFtQixVQUE2QjtRQUE3QixlQUFVLEdBQVYsVUFBVSxDQUFtQjtRQUM1QyxFQUFFLENBQUEsQ0FBQyxDQUFDLFVBQVUsQ0FBQztZQUFDLE1BQU0scURBQXFELENBQUM7SUFDaEYsQ0FBQztJQUVNLHNCQUFLLEdBQVosVUFBYSxPQUFnQjtRQUN6QixJQUFJLE1BQWMsQ0FBQztRQUNuQixHQUFHLENBQUEsQ0FBVyxVQUF1QixFQUF2QixLQUFBLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFqQyxjQUFNLEVBQU4sSUFBaUMsQ0FBQztZQUFsQyxNQUFNLFNBQUE7WUFDTixFQUFFLENBQUEsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ25DLE9BQU8sQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO2dCQUN4QixPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNsQyxDQUFDO1NBQ0o7SUFDTCxDQUFDO0lBRU0sd0JBQU8sR0FBZCxVQUFlLE9BQWdCLEVBQUUsSUFBYztRQUMzQyxPQUFPLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFDOUQsb0VBQW9FO1FBQ3BFLElBQUksUUFBa0IsQ0FBQztRQUN2QixHQUFHLENBQUEsQ0FBYSxVQUF5QixFQUF6QixLQUFBLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFyQyxjQUFRLEVBQVIsSUFBcUMsQ0FBQztZQUF0QyxRQUFRLFNBQUE7WUFDUixPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQzdCO1FBQ0QsTUFBTSxDQUFDLE9BQU8sQ0FBQztJQUNuQixDQUFDO0lBRU0sd0JBQU8sR0FBZCxVQUFlLElBQVk7UUFDdkIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztRQUNwQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFDTCxhQUFDO0FBQUQsQ0E3QkEsQUE2QkMsSUFBQTtBQTdCRCx3QkE2QkMsQ0FBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQge2RlZmF1bHQgYXMgSUFjdGlvbkRlZmluaXRpb259IGZyb20gJy4vYWN0aW9ucy9JQWN0aW9uRGVmaW5pdGlvbic7XG5pbXBvcnQgQ29tbWFuZFJlc3VsdCBmcm9tICcuL2NvbW1hbmRzL0NvbW1hbmRSZXN1bHQnO1xuaW1wb3J0IEFjdGlvbiBmcm9tICcuL2FjdGlvbnMvQWN0aW9uJztcbmltcG9ydCBDb21tYW5kIGZyb20gJy4vQ29tbWFuZCc7XG5pbXBvcnQge0V4cHJlc3Npb24sIEVxdWFsLCBHcmVhdGVyVGhhbiwgTGVzc1RoYW4sIElzTnVsbCwgQWxwaGFiZXRpY2FsbHlHcmVhdGVyVGhhbiwgQWxwaGFiZXRpY2FsbHlMZXNzVGhhbiwgTGVuZ3RoR3JlYXRlclRoYW4sIExlbmd0aExlc3NUaGFuLCBJc05hTiwgQmV0d2VlbiwgRm9ySW5Vc2luZ30gZnJvbSAnLi9FeHByZXNzaW9ucyc7XG5pbXBvcnQgU2NvcGUgZnJvbSAnLi9TY29wZSc7XG5cbmxldCBFbmRJZkRlZmluaXRpb246IElBY3Rpb25EZWZpbml0aW9uID0ge1xuICAgIHJlZ2V4OiAvXlxccyplbmRpZlxcYi9pLFxuICAgIGV4cHJlc3Npb25zOiBbXSxcbiAgICBkZXBlbmRlbnRzOiBbXSxcbiAgICB0ZXJtaW5hdG9yOiB0cnVlLFxuICAgIHJ1bGU6IChjb21tYW5kOiBDb21tYW5kLCBwcmV2PzogQ29tbWFuZCk6IENvbW1hbmQgPT4ge1xuICAgICAgICBjb21tYW5kLnJlc3VsdCA9IG5ldyBDb21tYW5kUmVzdWx0KGNvbW1hbmQuaW5uZXIsIHRydWUpO1xuICAgICAgICByZXR1cm4gY29tbWFuZDtcbiAgICB9XG59O1xuZXhwb3J0IGxldCBFbmRJZiA9IG5ldyBBY3Rpb24oRW5kSWZEZWZpbml0aW9uKTtcblxubGV0IEVsc2VEZWZpbml0aW9uOiBJQWN0aW9uRGVmaW5pdGlvbiA9IHtcbiAgICByZWdleDogL15cXHMqZWxzZVxcYi9pLFxuICAgIGV4cHJlc3Npb25zOiBbXSxcbiAgICBkZXBlbmRlbnRzOiBbXSxcbiAgICB0ZXJtaW5hdG9yOiBmYWxzZSxcbiAgICBydWxlOiAoY29tbWFuZDogQ29tbWFuZCwgcHJldj86IENvbW1hbmQpOiBDb21tYW5kID0+IHtcbiAgICAgICAgaWYoIXByZXYucmVzdWx0LnBhc3NlZCkgY29tbWFuZC5yZXN1bHQgPSBuZXcgQ29tbWFuZFJlc3VsdChjb21tYW5kLmlubmVyICsgY29tbWFuZC5zY29wZS5wZXJmb3JtKCksIHRydWUpO1xuICAgICAgICBlbHNlIGNvbW1hbmQucmVzdWx0ID0gbmV3IENvbW1hbmRSZXN1bHQoJycsIGZhbHNlKTtcbiAgICAgICAgcmV0dXJuIGNvbW1hbmQ7XG4gICAgfVxufTtcbmV4cG9ydCBsZXQgRWxzZSA9IG5ldyBBY3Rpb24oRWxzZURlZmluaXRpb24pO1xuXG5sZXQgSWZEZWZpbml0aW9uOiBJQWN0aW9uRGVmaW5pdGlvbiA9IHtcbiAgICByZWdleDogL15cXHMqaWZcXGIvaSxcbiAgICBleHByZXNzaW9uczogW0VxdWFsLCBHcmVhdGVyVGhhbiwgTGVzc1RoYW4sIElzTnVsbCwgQWxwaGFiZXRpY2FsbHlHcmVhdGVyVGhhbiwgQWxwaGFiZXRpY2FsbHlMZXNzVGhhbiwgTGVuZ3RoR3JlYXRlclRoYW4sIExlbmd0aExlc3NUaGFuLCBJc05hTiwgQmV0d2Vlbl0sXG4gICAgZGVwZW5kZW50czogW0Vsc2UsIEVuZElmXSxcbiAgICB0ZXJtaW5hdG9yOiBmYWxzZSxcbiAgICBydWxlOiAoY29tbWFuZDogQ29tbWFuZCwgcHJldj86IENvbW1hbmQpOiBDb21tYW5kID0+IHtcbiAgICAgICAgaWYoY29tbWFuZC5leHByZXNzaW9uLmV2YWx1YXRlKGNvbW1hbmQpKSB7XG4gICAgICAgICAgICBjb21tYW5kLnJlc3VsdCA9IG5ldyBDb21tYW5kUmVzdWx0KGNvbW1hbmQuaW5uZXIgKyBjb21tYW5kLnNjb3BlLnBlcmZvcm0oKSArIGNvbW1hbmQudGVybWluYXRlKCksIHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgY29tbWFuZC5yZXN1bHQgPSBuZXcgQ29tbWFuZFJlc3VsdChjb21tYW5kLmRlZmVyKGZhbHNlKSwgZmFsc2UpO1xuICAgICAgICByZXR1cm4gY29tbWFuZDtcbiAgICB9IFxufTtcbmV4cG9ydCBsZXQgSWYgPSBuZXcgQWN0aW9uKElmRGVmaW5pdGlvbik7XG5cbmxldCBFbmRVbmxlc3NEZWZpbml0aW9uOiBJQWN0aW9uRGVmaW5pdGlvbiA9IHtcbiAgICByZWdleDogL15cXHMqZW5kdW5sZXNzXFxiL2ksXG4gICAgZXhwcmVzc2lvbnM6IFtdLFxuICAgIGRlcGVuZGVudHM6IFtdLFxuICAgIHRlcm1pbmF0b3I6IHRydWUsXG4gICAgcnVsZTogKGNvbW1hbmQ6IENvbW1hbmQsIHByZXY/OiBDb21tYW5kKTogQ29tbWFuZCA9PiB7XG4gICAgICAgIGNvbW1hbmQucmVzdWx0ID0gbmV3IENvbW1hbmRSZXN1bHQoY29tbWFuZC5pbm5lciwgdHJ1ZSk7XG4gICAgICAgIHJldHVybiBjb21tYW5kO1xuICAgIH1cbn1cbmV4cG9ydCBsZXQgRW5kVW5sZXNzID0gbmV3IEFjdGlvbihFbmRVbmxlc3NEZWZpbml0aW9uKTtcblxubGV0IFVubGVzc0RlZmluaXRpb246IElBY3Rpb25EZWZpbml0aW9uID0ge1xuICAgIHJlZ2V4OiAvXlxccyp1bmxlc3NcXGIvaSxcbiAgICBleHByZXNzaW9uczogW0VxdWFsLCBHcmVhdGVyVGhhbiwgTGVzc1RoYW4sIElzTnVsbCwgQWxwaGFiZXRpY2FsbHlHcmVhdGVyVGhhbiwgQWxwaGFiZXRpY2FsbHlMZXNzVGhhbiwgTGVuZ3RoR3JlYXRlclRoYW4sIExlbmd0aExlc3NUaGFuLCBJc05hTiwgQmV0d2Vlbl0sXG4gICAgZGVwZW5kZW50czogW0Vsc2UsIEVuZFVubGVzc10sXG4gICAgdGVybWluYXRvcjogZmFsc2UsXG4gICAgcnVsZTogKGNvbW1hbmQ6IENvbW1hbmQsIHByZXY/OiBDb21tYW5kKTogQ29tbWFuZCA9PiB7XG4gICAgICAgIGlmKCFjb21tYW5kLmV4cHJlc3Npb24uZXZhbHVhdGUoY29tbWFuZCkpe1xuICAgICAgICAgICAgY29tbWFuZC5yZXN1bHQgPSBuZXcgQ29tbWFuZFJlc3VsdChjb21tYW5kLmlubmVyICsgY29tbWFuZC5zY29wZS5wZXJmb3JtKCkgKyBjb21tYW5kLnRlcm1pbmF0ZSgpLCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGNvbW1hbmQucmVzdWx0ID0gbmV3IENvbW1hbmRSZXN1bHQoY29tbWFuZC5kZWZlcihmYWxzZSksIGZhbHNlKTtcbiAgICAgICAgcmV0dXJuIGNvbW1hbmQ7XG4gICAgfVxufVxuZXhwb3J0IGxldCBVbmxlc3MgPSBuZXcgQWN0aW9uKFVubGVzc0RlZmluaXRpb24pO1xuXG5sZXQgRW5kRm9yRGVmaW5pdGlvbjogSUFjdGlvbkRlZmluaXRpb24gPSB7XG4gICAgcmVnZXg6IC9eXFxzKmVuZGZvclxcYi9pLFxuICAgIGV4cHJlc3Npb25zOiBbXSxcbiAgICBkZXBlbmRlbnRzOiBbXSxcbiAgICB0ZXJtaW5hdG9yOiB0cnVlLFxuICAgIHJ1bGU6IChjb21tYW5kOiBDb21tYW5kLCBwcmV2PzogQ29tbWFuZCk6IENvbW1hbmQgPT4ge1xuICAgICAgICBjb21tYW5kLnJlc3VsdCA9IG5ldyBDb21tYW5kUmVzdWx0KGNvbW1hbmQuaW5uZXIsIHRydWUpO1xuICAgICAgICByZXR1cm4gY29tbWFuZDtcbiAgICB9XG59XG5leHBvcnQgbGV0IEVuZEZvciA9IG5ldyBBY3Rpb24oRW5kRm9yRGVmaW5pdGlvbik7XG5cbmxldCBGb3JEZWZpbml0aW9uOiBJQWN0aW9uRGVmaW5pdGlvbiA9IHtcbiAgICByZWdleDogL15cXHMqZm9yXFxiL2ksXG4gICAgZXhwcmVzc2lvbnM6IFtGb3JJblVzaW5nXSxcbiAgICBkZXBlbmRlbnRzOiBbRW5kRm9yXSxcbiAgICB0ZXJtaW5hdG9yOiBmYWxzZSxcbiAgICBydWxlOiAoY29tbWFuZDogQ29tbWFuZCwgcHJldj86IENvbW1hbmQpOiBDb21tYW5kID0+IHtcbiAgICAgICAgY29tbWFuZC5yZXN1bHQgPSBuZXcgQ29tbWFuZFJlc3VsdChjb21tYW5kLmV4cHJlc3Npb24uZXZhbHVhdGUoY29tbWFuZCkpO1xuICAgICAgICByZXR1cm4gY29tbWFuZDtcbiAgICB9XG59XG5cbmV4cG9ydCB7ZGVmYXVsdCBhcyBJQWN0aW9uRGVmaW5pdGlvbn0gZnJvbSAnLi9hY3Rpb25zL0lBY3Rpb25EZWZpbml0aW9uJztcbmV4cG9ydCB7ZGVmYXVsdCBhcyBBY3Rpb259IGZyb20gJy4vYWN0aW9ucy9BY3Rpb24nOyIsImltcG9ydCB7UnVubmVyfSBmcm9tICcuL1J1bm5lcnMnO1xuaW1wb3J0IHtBY3Rpb259IGZyb20gJy4vQWN0aW9ucyc7XG5pbXBvcnQge0V4cHJlc3Npb259IGZyb20gJy4vRXhwcmVzc2lvbnMnO1xuaW1wb3J0IHtNb2RpZmllcn0gZnJvbSAnLi9Nb2RpZmllcnMnO1xuaW1wb3J0IHtSZXBsYWNlcn0gZnJvbSAnLi9SZXBsYWNlcnMnO1xuaW1wb3J0IENvbW1hbmRSZXN1bHQgZnJvbSAnLi9jb21tYW5kcy9Db21tYW5kUmVzdWx0JztcbmltcG9ydCBTY29wZSBmcm9tICcuL1Njb3BlJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tbWFuZCB7XG4gICAgcHVibGljIGRlcGVuZGVudHM6IENvbW1hbmRbXSA9IFtdO1xuICAgIHB1YmxpYyBhY3Rpb246IEFjdGlvbjtcbiAgICBwdWJsaWMgZXhwcmVzc2lvbjogRXhwcmVzc2lvbjtcbiAgICBwdWJsaWMgbW9kaWZpZXJzOiBNb2RpZmllcltdID0gW107XG4gICAgcHVibGljIHJlc3VsdDogQ29tbWFuZFJlc3VsdCA9IG5ldyBDb21tYW5kUmVzdWx0KCcnLCBmYWxzZSk7XG4gICAgY29uc3RydWN0b3IocHVibGljIGluZGV4OiBudW1iZXIsIHB1YmxpYyBsZW5ndGg6IG51bWJlciwgcHVibGljIHN0YXRlbWVudDogc3RyaW5nLCBwdWJsaWMgaW5uZXI6IHN0cmluZywgcHVibGljIHNjb3BlOiBTY29wZSwgcHJpdmF0ZSBydW5uZXI6IFJ1bm5lcil7XG4gICAgICAgIGxldCBhY3Rpb246IEFjdGlvbjtcbiAgICAgICAgZm9yKGFjdGlvbiBvZiBydW5uZXIuZGVmaW5pdGlvbi5hY3Rpb25zKXtcbiAgICAgICAgICAgIGlmKGFjdGlvbi5tYXRjaGVzKHN0YXRlbWVudCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGlvbiA9IGFjdGlvbjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgcGVyZm9ybShwcmV2PzogQ29tbWFuZCk6IENvbW1hbmQge1xuICAgICAgICByZXR1cm4gdGhpcy5ydW5uZXIucGVyZm9ybSh0aGlzLCBwcmV2KTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHJlcGxhY2UocmVwbGFjZXI6IFJlcGxhY2VyKXtcbiAgICAgICAgdGhpcy5yZXN1bHQudGV4dCA9IHJlcGxhY2VyLnJlcGxhY2UodGhpcy5yZXN1bHQudGV4dCwgdGhpcy5zY29wZS52YXJpYWJsZXMpO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgZGVmZXIocGFzc2VkOiBib29sZWFuKTogc3RyaW5nIHtcbiAgICAgICAgbGV0IGRlcGVuZGVudDpDb21tYW5kLCB0ZXh0OiBzdHJpbmcgPSAnJztcbiAgICAgICAgZm9yKGRlcGVuZGVudCBvZiB0aGlzLmRlcGVuZGVudHMpe1xuICAgICAgICAgICAgdGV4dCArPSBkZXBlbmRlbnQucGVyZm9ybSh0aGlzKS5yZXN1bHQudGV4dDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGV4dDtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHRlcm1pbmF0ZSgpOiBzdHJpbmd7XG4gICAgICAgIHJldHVybiB0aGlzLmRlcGVuZGVudHMuc29tZShjb21tYW5kID0+IGNvbW1hbmQuYWN0aW9uLmRlZmluaXRpb24udGVybWluYXRvcilcblx0XHQgID8gdGhpcy5kZXBlbmRlbnRzLmZpbHRlcihjb21tYW5kID0+IGNvbW1hbmQuYWN0aW9uLmRlZmluaXRpb24udGVybWluYXRvcilbMF0ucGVyZm9ybSgpLnJlc3VsdC50ZXh0XG5cdFx0ICA6ICcnO1xuICAgIH1cbn0iLCIvLyBpbXBvcnQgSUFjdGlvbiBmcm9tICdhY3Rpb25zL0lBY3Rpb24nO1xuLy8gLyoqXG4vLyAgKiBNb2R1bGUgb2YgZXJyb3IgY2hlY2tlcnNcbi8vICAqIEBtb2R1bGUgRXJyb3JzXG4vLyAgKiBAY2xhc3Ncbi8vICAqIEBzdGF0aWNcbi8vICAqL1xuLy8gZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXJyb3JzIHtcbi8vICAgICAvKipcbi8vICAgICAgKiBAbWVtYmVyb2YgRXJyb3JzXG4vLyAgICAgICogQG1ldGhvZFxuLy8gICAgICAqIEBzdGF0aWNcbi8vICAgICAgKiBAcGFyYW0ge0lBY3Rpb259IGFjdGlvbiAgICAgIC0gQWN0aW9uIHRvIGNoZWNrIGZvciBhbiBJbmNvcnJlY3QgU3RhdGVtZW50IGVycm9yXG4vLyAgICAgICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlbWVudCAgICAtIFN0YXRlbWVudCB0byBjaGVjayBmb3IgYSBJbmNvcnJlY3QgU3RhdGVtZW50IGVycm9yXG4vLyAgICAgICogQHJldHVybnMge3N0cmluZyB8IG51bGx9ICAgICAtIFRoZSBlcnJvciBtZXNzYWdlIGlmIGFueSwgb3RoZXJ3aXNlIG51bGwgXG4vLyAgICAgICovXG4vLyAgICAgcHVibGljIHN0YXRpYyBJbmNvcnJlY3RTdGF0ZW1lbnQoYWN0aW9uOiBJQWN0aW9uLCBzdGF0ZW1lbnQ6IHN0cmluZyk6IHN0cmluZ3tcbi8vICAgICAgICAgY29uc3QgYWN0aW9uczpzdHJpbmcgPSBhY3Rpb24uY29tbWFuZC5hY3Rpb25zLmZpbHRlcih4ID0+IHguZGVwZW5kZW50cy5zb21lKHkgPT4gYWN0aW9uIGluc3RhbmNlb2YgeSkpLm1hcCh4ID0+IHgubmFtZSkuam9pbignLCAnKTtcbi8vICAgICAgICAgY29uc3QgZXJyb3I6IHN0cmluZyA9IGBJbmNvcnJlY3Qgc3RhdGVtZW50IGZvdW5kIGF0IFwiJHtzdGF0ZW1lbnR9XCIuICR7YWN0aW9uLmNvbnN0cnVjdG9yWyduYW1lJ119IG11c3QgZm9sbG93ICR7YWN0aW9uc31gXG4vLyAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuLy8gICAgICAgICByZXR1cm4gZXJyb3I7XG4vLyAgICAgfVxuLy8gfSIsImltcG9ydCBJRXhwcmVzc2lvbkRlZmluaXRpb24gZnJvbSAnLi9leHByZXNzaW9ucy9JRXhwcmVzc2lvbkRlZmluaXRpb24nO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi9JVmFyaWFibGVzJztcbmltcG9ydCBFeHByZXNzaW9uIGZyb20gJy4vZXhwcmVzc2lvbnMvRXhwcmVzc2lvbic7XG5pbXBvcnQge05vdCwgT3JFcXVhbCwgTGVuZ3RoT3JFcXVhbCwgQmV0d2Vlbk9yRXF1YWx9IGZyb20gJy4vTW9kaWZpZXJzJztcbmltcG9ydCBWYWx1ZSBmcm9tICcuL1ZhbHVlJztcbmltcG9ydCBDb21tYW5kIGZyb20gJy4vQ29tbWFuZCc7XG5sZXQgRXF1YWxEZWZpbml0aW9uOiBJRXhwcmVzc2lvbkRlZmluaXRpb24gPSB7XG4gICAgdGVtcGxhdGU6ICcodikgKG0pPShtKSAodiknLFxuICAgIGl0ZW1zOiBbJ3ZhbHVlJywgW05vdCwgT3JFcXVhbF0sIFtPckVxdWFsXSwgJ3ZhbHVlJ10sXG4gICAgbW9kT3JkZXI6IFsxLDBdLFxuICAgIHJ1bGU6IChjb21tYW5kOiBDb21tYW5kLCB2YWx1ZXM6IFZhbHVlW10sIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IGJvb2xlYW4gPT4gdmFsdWVzWzBdLmV2YWx1YXRlKHZhcmlhYmxlcykgPT09IHZhbHVlc1sxXS5ldmFsdWF0ZSh2YXJpYWJsZXMpXG59XG5leHBvcnQgbGV0IEVxdWFsID0gbmV3IEV4cHJlc3Npb24oRXF1YWxEZWZpbml0aW9uKTtcblxubGV0IEdyZWF0ZXJUaGFuRGVmaW5pdGlvbjogSUV4cHJlc3Npb25EZWZpbml0aW9uID0ge1xuICAgIHRlbXBsYXRlOiAnKHYpIChtKT4obSkgKHYpJyxcbiAgICBpdGVtczogWyd2YWx1ZScsIFtOb3RdLCBbT3JFcXVhbF0sICd2YWx1ZSddLFxuICAgIG1vZE9yZGVyOiBbMSwwXSxcbiAgICBydWxlOiAoY29tbWFuZDogQ29tbWFuZCwgdmFsdWVzOiBWYWx1ZVtdLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBib29sZWFuID0+IHZhbHVlc1swXS5ldmFsdWF0ZSh2YXJpYWJsZXMpID4gdmFsdWVzWzFdLmV2YWx1YXRlKHZhcmlhYmxlcylcbn1cbmV4cG9ydCBsZXQgR3JlYXRlclRoYW4gPSBuZXcgRXhwcmVzc2lvbihHcmVhdGVyVGhhbkRlZmluaXRpb24pO1xuXG5sZXQgTGVzc1RoYW5EZWZpbml0aW9uOiBJRXhwcmVzc2lvbkRlZmluaXRpb24gPSB7XG4gICAgdGVtcGxhdGU6ICcodikgKG0pPChtKSAodiknLFxuICAgIGl0ZW1zOiBbJ3ZhbHVlJywgW05vdF0sIFtPckVxdWFsXSwgJ3ZhbHVlJ10sXG4gICAgbW9kT3JkZXI6IFsxLDBdLFxuICAgIHJ1bGU6IChjb21tYW5kOiBDb21tYW5kLCB2YWx1ZXM6IFZhbHVlW10sIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IGJvb2xlYW4gPT4gdmFsdWVzWzBdLmV2YWx1YXRlKHZhcmlhYmxlcykgPCB2YWx1ZXNbMV0uZXZhbHVhdGUodmFyaWFibGVzKVxufVxuZXhwb3J0IGxldCBMZXNzVGhhbiA9IG5ldyBFeHByZXNzaW9uKExlc3NUaGFuRGVmaW5pdGlvbik7XG5cbmxldCBJc051bGxEZWZpbml0aW9uOiBJRXhwcmVzc2lvbkRlZmluaXRpb24gPSB7XG4gICAgdGVtcGxhdGU6ICcodikgaXMgKG0pIG51bGwnLFxuICAgIGl0ZW1zOiBbJ3ZhbHVlJywgW05vdF1dLFxuICAgIG1vZE9yZGVyOiBbMF0sXG4gICAgcnVsZTogKGNvbW1hbmQ6IENvbW1hbmQsIHZhbHVlczogVmFsdWVbXSwgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogYm9vbGVhbiA9PiB2YWx1ZXNbMF0uZXZhbHVhdGUodmFyaWFibGVzKSA9PSBudWxsXG59XG5leHBvcnQgbGV0IElzTnVsbCA9IG5ldyBFeHByZXNzaW9uKElzTnVsbERlZmluaXRpb24pO1xuXG5sZXQgQWxwaGFiZXRpY2FsbHlHcmVhdGVyVGhhbkRlZmluaXRpb246IElFeHByZXNzaW9uRGVmaW5pdGlvbiA9IHtcbiAgICB0ZW1wbGF0ZTogJyh2KSAobSlhYmM+KG0pICh2KScsXG4gICAgaXRlbXM6IFsndmFsdWUnLCBbTm90XSwgW09yRXF1YWxdLCAndmFsdWUnXSxcbiAgICBtb2RPcmRlcjogWzEsMF0sXG4gICAgcnVsZTogKGNvbW1hbmQ6IENvbW1hbmQsIHZhbHVlczogVmFsdWVbXSwgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogYm9vbGVhbiA9PiBbdmFsdWVzWzBdLmV2YWx1YXRlKHZhcmlhYmxlcyksIHZhbHVlc1sxXS5ldmFsdWF0ZSh2YXJpYWJsZXMpXS5zb3J0KCkuaW5kZXhPZih2YWx1ZXNbMF0uZXZhbHVhdGUodmFyaWFibGVzKSkgPiAwXG59XG5leHBvcnQgbGV0IEFscGhhYmV0aWNhbGx5R3JlYXRlclRoYW4gPSBuZXcgRXhwcmVzc2lvbihBbHBoYWJldGljYWxseUdyZWF0ZXJUaGFuRGVmaW5pdGlvbik7XG5cbmxldCBBbHBoYWJldGljYWxseUxlc3NUaGFuRGVmaW5pdGlvbjogSUV4cHJlc3Npb25EZWZpbml0aW9uID0ge1xuICAgIHRlbXBsYXRlOiAnKHYpIChtKWFiYzwobSkgKHYpJyxcbiAgICBpdGVtczogWyd2YWx1ZScsIFtOb3RdLCBbT3JFcXVhbF0sICd2YWx1ZSddLFxuICAgIG1vZE9yZGVyOiBbMSwwXSxcbiAgICBydWxlOiAoY29tbWFuZDogQ29tbWFuZCwgdmFsdWVzOiBWYWx1ZVtdLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBib29sZWFuID0+IHZhbHVlc1swXS5ldmFsdWF0ZSh2YXJpYWJsZXMpID09PSB2YWx1ZXNbMV0uZXZhbHVhdGUodmFyaWFibGVzKSA/IGZhbHNlIDogW3ZhbHVlc1swXS5ldmFsdWF0ZSh2YXJpYWJsZXMpLCB2YWx1ZXNbMV0uZXZhbHVhdGUodmFyaWFibGVzKV0uc29ydCgpLmluZGV4T2YodmFsdWVzWzBdLmV2YWx1YXRlKHZhcmlhYmxlcykpID09PSAwXG59XG5leHBvcnQgbGV0IEFscGhhYmV0aWNhbGx5TGVzc1RoYW4gPSBuZXcgRXhwcmVzc2lvbihBbHBoYWJldGljYWxseUxlc3NUaGFuRGVmaW5pdGlvbik7XG5cbmxldCBMZW5ndGhHcmVhdGVyVGhhbkRlZmluaXRpb246IElFeHByZXNzaW9uRGVmaW5pdGlvbiA9IHtcbiAgICB0ZW1wbGF0ZTogJyh2KSAobSlsZW4+KG0pICh2KScsXG4gICAgaXRlbXM6IFsndmFsdWUnLCBbTm90XSwgW0xlbmd0aE9yRXF1YWxdLCAndmFsdWUnXSxcbiAgICBtb2RPcmRlcjogWzEsMF0sXG4gICAgcnVsZTogKGNvbW1hbmQ6IENvbW1hbmQsIHZhbHVlczogVmFsdWVbXSwgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogYm9vbGVhbiA9PiAoPHN0cmluZz52YWx1ZXNbMF0uZXZhbHVhdGUodmFyaWFibGVzKSkubGVuZ3RoID4gdmFsdWVzWzFdLmV2YWx1YXRlKHZhcmlhYmxlcylcbn1cbmV4cG9ydCBsZXQgTGVuZ3RoR3JlYXRlclRoYW4gPSBuZXcgRXhwcmVzc2lvbihMZW5ndGhHcmVhdGVyVGhhbkRlZmluaXRpb24pO1xuXG5sZXQgTGVuZ3RoTGVzc1RoYW5EZWZpbml0aW9uOiBJRXhwcmVzc2lvbkRlZmluaXRpb24gPSB7XG4gICAgdGVtcGxhdGU6ICcodikgKG0pbGVuPChtKSAodiknLFxuICAgIGl0ZW1zOiBbJ3ZhbHVlJywgW05vdF0sIFtMZW5ndGhPckVxdWFsXSwgJ3ZhbHVlJ10sXG4gICAgbW9kT3JkZXI6IFsxLDBdLFxuICAgIHJ1bGU6IChjb21tYW5kOiBDb21tYW5kLCB2YWx1ZXM6IFZhbHVlW10sIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IGJvb2xlYW4gPT4gKDxzdHJpbmc+dmFsdWVzWzBdLmV2YWx1YXRlKHZhcmlhYmxlcykpLmxlbmd0aCA8IHZhbHVlc1sxXS5ldmFsdWF0ZSh2YXJpYWJsZXMpXG59XG5leHBvcnQgbGV0IExlbmd0aExlc3NUaGFuID0gbmV3IEV4cHJlc3Npb24oTGVuZ3RoTGVzc1RoYW5EZWZpbml0aW9uKTtcblxubGV0IElzTmFORGVmaW5pdGlvbjogSUV4cHJlc3Npb25EZWZpbml0aW9uID0ge1xuICAgIHRlbXBsYXRlOiAnKHYpIGlzIChtKU5hTicsXG4gICAgaXRlbXM6IFsndmFsdWUnLCBbTm90XV0sXG4gICAgbW9kT3JkZXI6IFswXSxcbiAgICBydWxlOiAoY29tbWFuZDogQ29tbWFuZCwgdmFsdWVzOiBWYWx1ZVtdLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBib29sZWFuID0+IGlzTmFOKCg8bnVtYmVyPnZhbHVlc1swXS5ldmFsdWF0ZSh2YXJpYWJsZXMpKSlcbn1cbmV4cG9ydCBsZXQgSXNOYU4gPSBuZXcgRXhwcmVzc2lvbihJc05hTkRlZmluaXRpb24pO1xuXG5sZXQgQmV0d2VlbkRlZmluaXRpb246IElFeHByZXNzaW9uRGVmaW5pdGlvbiA9IHtcbiAgICB0ZW1wbGF0ZTogJyh2KSAodik+KG0pPCh2KScsXG4gICAgaXRlbXM6IFsndmFsdWUnLCAndmFsdWUnLCBbTm90LCBCZXR3ZWVuT3JFcXVhbF0sICd2YWx1ZSddLFxuICAgIG1vZE9yZGVyOiBbMF0sXG4gICAgcnVsZTogKGNvbW1hbmQ6IENvbW1hbmQsIHZhbHVlczogVmFsdWVbXSwgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogYm9vbGVhbiA9PiB2YWx1ZXNbMV0uZXZhbHVhdGUodmFyaWFibGVzKSA8IHZhbHVlc1swXS5ldmFsdWF0ZSh2YXJpYWJsZXMpICYmIHZhbHVlc1syXS5ldmFsdWF0ZSh2YXJpYWJsZXMpID4gdmFsdWVzWzBdLmV2YWx1YXRlKHZhcmlhYmxlcykgXG59XG5leHBvcnQgbGV0IEJldHdlZW4gPSBuZXcgRXhwcmVzc2lvbihCZXR3ZWVuRGVmaW5pdGlvbik7XG5cbmxldCBGb3JJblVzaW5nRGVmaW5pdGlvbjogSUV4cHJlc3Npb25EZWZpbml0aW9uID0ge1xuICAgIHRlbXBsYXRlOiAnKHYpIGluIChjKSB1c2luZyAoaiknLFxuICAgIGl0ZW1zOiBbJ3ZhbHVlJywgJ2NvbGxlY3Rpb24nLCAnam9pbmVyJ10sXG4gICAgbW9kT3JkZXI6IFtdLFxuICAgIHJ1bGU6IChjb21tYW5kOiBDb21tYW5kLCB2YWx1ZXM6IFZhbHVlW10sIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IHN0cmluZyA9PiB7XG4gICAgICAgIGxldCBpPTAsIHJlc3VsdCA9ICcnO1xuICAgICAgICBmb3IoaT0wO2k8KDxhbnlbXT52YWx1ZXNbMV0uZXZhbHVhdGUodmFyaWFibGVzKSkubGVuZ3RoO2krKyl7XG4gICAgICAgICAgICB2YXJpYWJsZXNbPHN0cmluZz52YWx1ZXNbMF0udmFsdWVdID0gdmFsdWVzWzFdLmV2YWx1YXRlKHZhcmlhYmxlcylbaV07XG4gICAgICAgICAgICByZXN1bHQgKz0gYCR7Y29tbWFuZC5zY29wZS5wZXJmb3JtKCl9YFxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxufVxuZXhwb3J0IGxldCBGb3JJblVzaW5nID0gbmV3IEV4cHJlc3Npb24oRm9ySW5Vc2luZ0RlZmluaXRpb24pO1xuXG5leHBvcnQge2RlZmF1bHQgYXMgRXhwcmVzc2lvbn0gZnJvbSAnLi9leHByZXNzaW9ucy9FeHByZXNzaW9uJztcbiIsImludGVyZmFjZSBBcnJheTxUPntcblx0bGFzdCgpOiBUO1xuICAgIGlzRnVsbCgpOiBib29sZWFuO1xuICAgIGNvbnRhaW5zKFQpOiBib29sZWFuO1xufVxuQXJyYXkucHJvdG90eXBlLmxhc3QgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gdGhpc1t0aGlzLmxlbmd0aC0xXTtcbn1cblxuQXJyYXkucHJvdG90eXBlLmlzRnVsbCA9IGZ1bmN0aW9uKCl7XG4gICAgZm9yKGxldCBpPTA7aTx0aGlzLmxlbmd0aDtpKyspe1xuICAgICAgICBpZihpID09IG51bGwpIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5cbkFycmF5LnByb3RvdHlwZS5jb250YWlucyA9IGZ1bmN0aW9uKFQpe1xuICAgIHJldHVybiB0aGlzLnNvbWUoeCA9PiB4ID09PSBUKTtcbn0iLCJpbnRlcmZhY2UgSVZhcmlhYmxlcyB7XG5cdFtrZXk6IHN0cmluZ106IGFueTtcbn1cbmV4cG9ydCBkZWZhdWx0IElWYXJpYWJsZXM7IiwiaW1wb3J0IHtTUWlnZ0xQYXJzZXJ9IGZyb20gJy4vUGFyc2Vycyc7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuL0lWYXJpYWJsZXMnO1xuLyoqXG4gKiBUaGUgc3RhcnRpbmcgcG9pbnQgb2YgdGhlIGVudGlyZSBTUWlnZ0wgcGFyc2VyXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBzcWwgICAgICAgICAgICAgIC0gVGhlIFNRTCBxdWVyeSB0byBydW4gU1FpZ2dMIGFnYWluc3RcbiAqIEBwYXJhbSB7SVZhcmlhYmxlcz99IHZhcmlhYmxlcyAgIC0gT3B0aW9uYWwgY29sbGVjdGlvbiBvZiB2YXJpYWJsZXMgZm9yIHlvdXIgU1FpZ2dMIHF1ZXJ5XG4gKiBAcmV0dXJuIHtzdHJpbmd9ICAgICAgICAgICAgICAgICAtIFRoZSBmdWxseSBwYXJzZWQgU1FMIHF1ZXJ5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZShzcWw6IHN0cmluZywgdmFyaWFibGVzPzogSVZhcmlhYmxlcyk6IHN0cmluZ3tcblx0U1FpZ2dMUGFyc2VyLnBhcnNlKHNxbCwgdmFyaWFibGVzKTtcbiAgICByZXR1cm4gU1FpZ2dMUGFyc2VyLnBlcmZvcm0oKTtcbn0iLCJpbXBvcnQgSU1vZGlmaWVyRGVmaW5pdGlvbiBmcm9tICcuL21vZGlmaWVycy9JTW9kaWZpZXJEZWZpbml0aW9uJztcbmltcG9ydCBNb2RpZmllciBmcm9tICcuL21vZGlmaWVycy9Nb2RpZmllcic7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuL0lWYXJpYWJsZXMnO1xuaW1wb3J0IFZhbHVlIGZyb20gJy4vVmFsdWUnO1xuXG5sZXQgTm90RGVmaW5pdGlvbjogSU1vZGlmaWVyRGVmaW5pdGlvbiA9IHtcbiAgICBpZGVudGlmaWVyczogWy8hL2ksIC8oPzpcXGJ8XFxzKylub3QoPzpcXGJ8XFxzKykvaV0sXG4gICAgcnVsZTogKHBhc3M6IGJvb2xlYW4sIHZhbHVlczogVmFsdWVbXSwgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogYm9vbGVhbiA9PiAhcGFzc1xufVxuZXhwb3J0IGxldCBOb3QgPSBuZXcgTW9kaWZpZXIoTm90RGVmaW5pdGlvbik7XG5cbmxldCBPckVxdWFsRGVmaW5pdGlvbjogSU1vZGlmaWVyRGVmaW5pdGlvbiA9IHtcbiAgICBpZGVudGlmaWVyczogWy89L2ldLFxuICAgIHJ1bGU6IChwYXNzOiBib29sZWFuLCB2YWx1ZXM6IFZhbHVlW10sIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IGJvb2xlYW4gPT4gcGFzcyB8fCB2YWx1ZXNbMF0uZXZhbHVhdGUodmFyaWFibGVzKSA9PT0gdmFsdWVzWzFdLmV2YWx1YXRlKHZhcmlhYmxlcylcbn1cbmV4cG9ydCBsZXQgT3JFcXVhbCA9IG5ldyBNb2RpZmllcihPckVxdWFsRGVmaW5pdGlvbik7XG5cbmxldCBMZW5ndGhPckVxdWFsRGVmaW5pdGlvbjogSU1vZGlmaWVyRGVmaW5pdGlvbiA9IHtcbiAgICBpZGVudGlmaWVyczogWy89L2ldLFxuICAgIHJ1bGU6IChwYXNzOiBib29sZWFuLCB2YWx1ZXM6IFZhbHVlW10sIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IGJvb2xlYW4gPT4gcGFzcyB8fCAoPHN0cmluZz52YWx1ZXNbMF0uZXZhbHVhdGUodmFyaWFibGVzKSkubGVuZ3RoID09PSB2YWx1ZXNbMV0uZXZhbHVhdGUodmFyaWFibGVzKVxufVxuZXhwb3J0IGxldCBMZW5ndGhPckVxdWFsID0gbmV3IE1vZGlmaWVyKExlbmd0aE9yRXF1YWxEZWZpbml0aW9uKTtcblxubGV0IEJldHdlZW5PckVxdWFsRGVmaW5pdGlvbjogSU1vZGlmaWVyRGVmaW5pdGlvbiA9IHtcbiAgICBpZGVudGlmaWVyczogWy89L2ldLFxuICAgIHJ1bGU6IChwYXNzOiBib29sZWFuLCB2YWx1ZXM6IFZhbHVlW10sIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IGJvb2xlYW4gPT4gcGFzcyB8fCB2YWx1ZXNbMF0uZXZhbHVhdGUodmFyaWFibGVzKSA9PT0gdmFsdWVzWzFdLmV2YWx1YXRlKHZhcmlhYmxlcykgfHwgdmFsdWVzWzBdLmV2YWx1YXRlKHZhcmlhYmxlcykgPT09IHZhbHVlc1syXS5ldmFsdWF0ZSh2YXJpYWJsZXMpXG59XG5leHBvcnQgbGV0IEJldHdlZW5PckVxdWFsID0gbmV3IE1vZGlmaWVyKEJldHdlZW5PckVxdWFsRGVmaW5pdGlvbik7XG5cbmV4cG9ydCB7ZGVmYXVsdCBhcyBJTW9kaWZpZXJEZWZpbml0aW9ufSBmcm9tICcuL21vZGlmaWVycy9JTW9kaWZpZXJEZWZpbml0aW9uJztcbmV4cG9ydCB7ZGVmYXVsdCBhcyBNb2RpZmllcn0gZnJvbSAnLi9tb2RpZmllcnMvTW9kaWZpZXInOyAiLCJpbXBvcnQgSVBhcnNlckRlZmluaXRpb24gZnJvbSAnLi9wYXJzZXJzL0lQYXJzZXJEZWZpbml0aW9uJztcbmltcG9ydCBQYXJzZXIgZnJvbSAnLi9wYXJzZXJzL1BhcnNlcic7XG5pbXBvcnQge1J1bm5lciwgQWN0aW9uUnVubmVyfSBmcm9tICcuL1J1bm5lcnMnO1xuXG5sZXQgU1FpZ2dMUGFyc2VyRGVmaW5pdGlvbjogSVBhcnNlckRlZmluaXRpb24gPSB7XG4gICAgcnVubmVyczogW0FjdGlvblJ1bm5lcl1cbn1cbmV4cG9ydCBsZXQgU1FpZ2dMUGFyc2VyID0gbmV3IFBhcnNlcihTUWlnZ0xQYXJzZXJEZWZpbml0aW9uKTsgXG5cbmV4cG9ydCB7ZGVmYXVsdCBhcyBJUGFyc2VyRGVmaW5pdGlvbn0gZnJvbSAnLi9wYXJzZXJzL0lQYXJzZXJEZWZpbml0aW9uJzsiLCJpbXBvcnQgSVBsYWNlaG9sZGVyIGZyb20gJy4vcGxhY2Vob2xkZXJzL0lQbGFjZWhvbGRlcic7XG5pbXBvcnQge01vZGlmaWVyfSBmcm9tICcuL01vZGlmaWVycyc7XG5leHBvcnQgbGV0IFBsYWNlaG9sZGVyczogSVBsYWNlaG9sZGVyW10gPSBbXG4gICAge1xuICAgICAgICBuYW1lOiAndmFsdWUnLFxuICAgICAgICBsb2NhdG9yOiAvXFwodlxcKS9pLFxuICAgICAgICByZXBsYWNlbWVudDogKCkgPT4gYCgoPzpcInwnKT9bXFxcXHdcXFxcZF0rKD86XCJ8Jyk/KWBcbiAgICB9LFxuICAgIHtcbiAgICAgICAgbmFtZTogJ21vZGlmaWVyJyxcbiAgICAgICAgbG9jYXRvcjogL1xcKG1cXCkvaSxcbiAgICAgICAgcmVwbGFjZW1lbnQ6IChpdGVtPzogTW9kaWZpZXJbXSkgPT4gYCgoPzoke2l0ZW0ubWFwKG1vZGlmaWVyID0+IG1vZGlmaWVyLmRlZmluaXRpb24uaWRlbnRpZmllcnMubWFwKGlkZW50aWZpZXIgPT4gaWRlbnRpZmllci5zb3VyY2UpLmpvaW4oJ3wnKSkuam9pbignfCcpfXxcXFxccyopKWBcbiAgICB9LFxuICAgIHtcbiAgICAgICAgbmFtZTogJ2NvbGxlY3Rpb24nLFxuICAgICAgICBsb2NhdG9yOiAvXFwoY1xcKS9pLFxuICAgICAgICByZXBsYWNlbWVudDogKCkgPT4gYChbXFxcXHdcXFxcZF0rKWAsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIG5hbWU6ICdqb2luZXInLFxuICAgICAgICBsb2NhdG9yOiAvXFwoalxcKS9pLFxuICAgICAgICByZXBsYWNlbWVudDogKCkgPT4gYCguKylgXG4gICAgfVxuXTtcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFBsYWNlaG9sZGVyKG5hbWU6IHN0cmluZyl7XG4gICAgcmV0dXJuIFBsYWNlaG9sZGVycy5maWx0ZXIoeCA9PiB4Lm5hbWUgPT09IG5hbWUpWzBdO1xufSIsImltcG9ydCBJUmVwbGFjZXJEZWZpbml0aW9uIGZyb20gJy4vcmVwbGFjZXJzL0lSZXBsYWNlckRlZmluaXRpb24nO1xuaW1wb3J0IFJlcGxhY2VyIGZyb20gJy4vcmVwbGFjZXJzL1JlcGxhY2VyJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4vSVZhcmlhYmxlcyc7XG5cbmxldCBWYXJpYWJsZURlZmluaXRpb246IElSZXBsYWNlckRlZmluaXRpb24gPSB7XG4gICAgcmVnZXg6IC8oW157XXxeKXt7KD8heylcXHMqKFxcdyopXFxzKn19KD8hfSkvZyxcbiAgICBydWxlOiAoZGVmaW5pdGlvbjogSVJlcGxhY2VyRGVmaW5pdGlvbiwgdGV4dDogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBzdHJpbmcgPT4gdGV4dC5yZXBsYWNlKGRlZmluaXRpb24ucmVnZXgsIChtYXRjaCwgJDEsICQyKSA9PiAkMSt2YXJpYWJsZXNbJDJdKVxufVxuZXhwb3J0IGxldCBWYXJpYWJsZSA9IG5ldyBSZXBsYWNlcihWYXJpYWJsZURlZmluaXRpb24pO1xuXG5leHBvcnQge2RlZmF1bHQgYXMgSVJlcGxhY2VyRGVmaW5pdGlvbn0gZnJvbSAnLi9yZXBsYWNlcnMvSVJlcGxhY2VyRGVmaW5pdGlvbic7XG5leHBvcnQge2RlZmF1bHQgYXMgUmVwbGFjZXJ9IGZyb20gJy4vcmVwbGFjZXJzL1JlcGxhY2VyJzsiLCJpbXBvcnQgSVJ1bm5lckRlZmluaXRpb24gZnJvbSAnLi9ydW5uZXJzL0lSdW5uZXJEZWZpbml0aW9uJztcbmltcG9ydCBSdW5uZXIgZnJvbSAnLi9ydW5uZXJzL1J1bm5lcic7XG5pbXBvcnQge0FjdGlvbiwgSWYsIEVsc2UsIEVuZElmLCBVbmxlc3MsIEVuZFVubGVzc30gZnJvbSAnLi9BY3Rpb25zJztcbmltcG9ydCB7UmVwbGFjZXIsIFZhcmlhYmxlfSBmcm9tICcuL1JlcGxhY2Vycyc7XG5cbmxldCBBY3Rpb25SdW5uZXJEZWZpbml0aW9uOiBJUnVubmVyRGVmaW5pdGlvbiA9IHtcbiAgICByZWdleDogL3t7JSguKj8pJX19KFtcXHNcXFNdKj8pPyg/PSg/Ont7JXwkKSkvZ20sXG4gICAgYWN0aW9uczogW0lmLCBFbHNlLCBFbmRJZiwgVW5sZXNzLCBFbmRVbmxlc3NdLFxuICAgIHJlcGxhY2VyczogW1ZhcmlhYmxlXVxufVxuZXhwb3J0IGxldCBBY3Rpb25SdW5uZXIgPSBuZXcgUnVubmVyKEFjdGlvblJ1bm5lckRlZmluaXRpb24pO1xuXG5leHBvcnQge2RlZmF1bHQgYXMgSVJ1bm5lckRlZmluaXRpb259IGZyb20gJy4vcnVubmVycy9JUnVubmVyRGVmaW5pdGlvbic7XG5leHBvcnQge2RlZmF1bHQgYXMgUnVubmVyfSBmcm9tICcuL3J1bm5lcnMvUnVubmVyJzsiLCJpbXBvcnQge3BhcnNlIGFzIFBhcnNlfSBmcm9tICcuL01haW4nO1xubGV0IFNRaWdnTCA9IHtcbiAgICBwYXJzZTogUGFyc2UsXG4gICAgdmVyc2lvbjogJzAuMS4wJyxcbiAgICAvL2V4dGVuZDogRXh0ZW5kXG59O1xuaWYodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHdpbmRvd1snU1FpZ2dMJ10gPSBTUWlnZ0w7XG5leHBvcnQgZGVmYXVsdCBTUWlnZ0w7IiwiaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi9JVmFyaWFibGVzJztcbmltcG9ydCBDb21tYW5kIGZyb20gJy4vQ29tbWFuZCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNjb3BlIHtcblx0cHVibGljIHZhcmlhYmxlczogSVZhcmlhYmxlcyA9IHt9O1xuXHRwdWJsaWMgY29tbWFuZHM6IENvbW1hbmRbXSA9IFtdO1xuXHRwdWJsaWMgZGVwZW5kZW50czogQ29tbWFuZFtdID0gW107XG4gICAgXG4gICAgcHVibGljIHBlcmZvcm0oKTogc3RyaW5nIHtcbiAgICAgICAgbGV0IGNvbW1hbmQ6IENvbW1hbmQsIHRleHQ6IHN0cmluZyA9ICcnO1xuICAgICAgICBmb3IoY29tbWFuZCBvZiB0aGlzLmNvbW1hbmRzKXtcbiAgICAgICAgICAgIHRleHQgKz0gY29tbWFuZC5wZXJmb3JtKCkucmVzdWx0LnRleHQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxufSIsImltcG9ydCBWYWx1ZVR5cGUgZnJvbSAnLi9WYWx1ZVR5cGUnO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi9JVmFyaWFibGVzJztcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFZhbHVlIHtcbiAgICBwdWJsaWMgdHlwZTogVmFsdWVUeXBlO1xuICAgIHB1YmxpYyB2YWx1ZTogYW55O1xuICAgIGNvbnN0cnVjdG9yKGl0ZW06IGFueSl7XG4gICAgICAgIGlmKGl0ZW0gaW5zdGFuY2VvZiBBcnJheSl7XG4gICAgICAgICAgICB0aGlzLnR5cGUgPSBWYWx1ZVR5cGUuYXJyYXk7XG4gICAgICAgIH0gZWxzZSBpZigvKFwifCcpW1xcd1xcZF0rKFxcMSkvLnRlc3QoaXRlbSkpIHtcbiAgICAgICAgICAgIHRoaXMudHlwZSA9IFZhbHVlVHlwZS5zdHJpbmc7XG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gaXRlbS5zdWJzdHIoMSwgaXRlbS5sZW5ndGggLSAyKTtcbiAgICAgICAgfSBlbHNlIGlmKCFpc05hTihpdGVtKSkge1xuICAgICAgICAgICAgdGhpcy50eXBlID0gVmFsdWVUeXBlLm51bWJlcjtcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSBwYXJzZUZsb2F0KGl0ZW0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy50eXBlID0gVmFsdWVUeXBlLnZhcmlhYmxlO1xuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IGl0ZW07XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgcHVibGljIGV2YWx1YXRlKHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IGFueXtcbiAgICAgICAgaWYodGhpcy50eXBlID09PSBWYWx1ZVR5cGUudmFyaWFibGUpe1xuICAgICAgICAgICAgaWYoaXNOYU4odmFyaWFibGVzWzxzdHJpbmc+dGhpcy52YWx1ZV0pKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFyaWFibGVzWzxzdHJpbmc+dGhpcy52YWx1ZV1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQodmFyaWFibGVzWzxzdHJpbmc+dGhpcy52YWx1ZV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG59IiwiZW51bSBWYWx1ZVR5cGUge1xuICAgIHN0cmluZyxcbiAgICBudW1iZXIsXG4gICAgYXJyYXksXG4gICAgdmFyaWFibGVcbn1cbmV4cG9ydCBkZWZhdWx0IFZhbHVlVHlwZTsiLCJpbXBvcnQgSUFjdGlvbkRlZmluaXRpb24gZnJvbSAnLi9JQWN0aW9uRGVmaW5pdGlvbic7XG5pbXBvcnQge0V4cHJlc3Npb259IGZyb20gJy4uL0V4cHJlc3Npb25zJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuaW1wb3J0IENvbW1hbmQgZnJvbSAnLi4vQ29tbWFuZCc7XG5pbXBvcnQgU2NvcGUgZnJvbSAnLi4vU2NvcGUnO1xuLy8gRE8gTk9UIFBVVCBJTlNUQU5DRSBJVEVNUyBJTiBUSElTIENMQVNTLCBEVU1NWVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWN0aW9uIHtcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgZGVmaW5pdGlvbjogSUFjdGlvbkRlZmluaXRpb24pe1xuICAgICAgICBpZighZGVmaW5pdGlvbikgdGhyb3cgJ0F0dGVtcHRlZCB0byBpbnN0YXRpYXRlIGFjdGlvbiB3aXRob3V0IGEgZGVmaW5pdGlvbic7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBtYXRjaGVzKHN0YXRlbWVudDogc3RyaW5nKTogYm9vbGVhbntcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVmaW5pdGlvbi5yZWdleC50ZXN0KHN0YXRlbWVudCk7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBwYXJzZShjb21tYW5kOiBDb21tYW5kKXtcbiAgICAgICAgbGV0IGV4cHJlc3Npb246IEV4cHJlc3Npb247XG4gICAgICAgIGZvcihleHByZXNzaW9uIG9mIHRoaXMuZGVmaW5pdGlvbi5leHByZXNzaW9ucyl7XG4gICAgICAgICAgICBpZihleHByZXNzaW9uLm1hdGNoZXMoY29tbWFuZC5zdGF0ZW1lbnQpKSB7XG4gICAgICAgICAgICAgICAgY29tbWFuZC5leHByZXNzaW9uID0gZXhwcmVzc2lvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgcGVyZm9ybShjb21tYW5kOiBDb21tYW5kLCBwcmV2PzogQ29tbWFuZCk6IENvbW1hbmQge1xuICAgICAgICByZXR1cm4gdGhpcy5kZWZpbml0aW9uLnJ1bGUoY29tbWFuZCwgcHJldik7XG4gICAgfVxufSIsImltcG9ydCBBY3Rpb24gZnJvbSAnLi9BY3Rpb24nO1xuaW1wb3J0IHtFeHByZXNzaW9ufSBmcm9tICcuLi9FeHByZXNzaW9ucyc7XG5pbXBvcnQgQ29tbWFuZCBmcm9tICcuLi9Db21tYW5kJztcbmltcG9ydCBTY29wZSBmcm9tICcuLi9TY29wZSc7XG5cbmludGVyZmFjZSBJQWN0aW9uRGVmaW5pdGlvbiB7XG4gICAgcmVnZXg6IFJlZ0V4cDtcbiAgICBleHByZXNzaW9uczogRXhwcmVzc2lvbltdXG4gICAgZGVwZW5kZW50czogQWN0aW9uW107XG4gICAgdGVybWluYXRvcjogYm9vbGVhbjtcbiAgICBydWxlOiAoY29tbWFuZDogQ29tbWFuZCwgcHJldj86IENvbW1hbmQpID0+IENvbW1hbmQ7XG59XG5leHBvcnQgZGVmYXVsdCBJQWN0aW9uRGVmaW5pdGlvbjsiLCJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbW1hbmRSZXN1bHQge1xuICAgIHB1YmxpYyBkZXBlbmRlbnQ6IENvbW1hbmRSZXN1bHQ7XG4gICAgY29uc3RydWN0b3IocHVibGljIHRleHQ6IHN0cmluZywgcHVibGljIHBhc3NlZD86IGJvb2xlYW4pe31cbn0iLCJpbXBvcnQgUGxhY2Vob2xkZXIgZnJvbSAnLi4vUGxhY2Vob2xkZXJzJztcbmltcG9ydCBFeHByZXNzaW9uUmVzdWx0IGZyb20gJy4vRXhwcmVzc2lvblJlc3VsdCc7XG5pbXBvcnQgSUV4cHJlc3Npb25JbmRpY2VzIGZyb20gJy4vSUV4cHJlc3Npb25JbmRpY2VzJztcbmltcG9ydCBJRXhwcmVzc2lvbkRlZmluaXRpb24gZnJvbSAnLi9JRXhwcmVzc2lvbkRlZmluaXRpb24nO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5pbXBvcnQgQ29tbWFuZCBmcm9tICcuLi9Db21tYW5kJztcbmltcG9ydCB7TW9kaWZpZXJ9IGZyb20gJy4uL01vZGlmaWVycydcbmltcG9ydCBWYWx1ZSBmcm9tICcuLi9WYWx1ZSc7XG5pbXBvcnQgJy4uL0V4dGVuc2lvbnMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFeHByZXNzaW9uIHtcbiAgICBwcml2YXRlIHJlZ2V4OiBSZWdFeHA7XG4gICAgcHJpdmF0ZSBpbmRpY2llczogSUV4cHJlc3Npb25JbmRpY2VzID0ge307XG4gICAgcHJpdmF0ZSB0ZW1wbGF0ZTogc3RyaW5nO1xuICAgIHByaXZhdGUgaXRlbXM6IEFycmF5PHN0cmluZyB8IE1vZGlmaWVyW10+O1xuICAgIHByaXZhdGUgcnVsZTogKGNvbW1hbmQ6IENvbW1hbmQsIHZhbHVlczogVmFsdWVbXSwgdmFyaWFibGVzOiBJVmFyaWFibGVzKSA9PiBhbnk7XG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBkZWZpbml0aW9uOiBJRXhwcmVzc2lvbkRlZmluaXRpb24pe1xuICAgICAgICBpZighZGVmaW5pdGlvbikgdGhyb3cgJ0F0dGVtcHRlZCB0byBpbnN0YXRpYXRlIGV4cHJlc3Npb24gd2l0aG91dCBhIGRlZmluaXRpb24nO1xuICAgICAgICB0aGlzLnJlZ2V4ID0gdGhpcy50cmFuc2xhdGUodGhpcy5kZWZpbml0aW9uKTtcbiAgICAgICAgdGhpcy50ZW1wbGF0ZSA9IGRlZmluaXRpb24udGVtcGxhdGU7XG4gICAgICAgIHRoaXMuaXRlbXMgPSBkZWZpbml0aW9uLml0ZW1zO1xuICAgICAgICB0aGlzLnJ1bGUgPSBkZWZpbml0aW9uLnJ1bGU7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgdHJhbnNsYXRlKGRlZmluaXRpb246IElFeHByZXNzaW9uRGVmaW5pdGlvbik6IFJlZ0V4cHtcbiAgICAgICAgbGV0IHRlbXBsYXRlID0gZGVmaW5pdGlvbi50ZW1wbGF0ZSwgaXRlbTogKHN0cmluZyB8IE1vZGlmaWVyW10pLCBuYW1lOiBzdHJpbmcsIGlkeD0xO1xuICAgICAgICBmb3IoaXRlbSBvZiBkZWZpbml0aW9uLml0ZW1zKXtcbiAgICAgICAgICAgIGlmKCFpdGVtKSB0aHJvdyAnSW52YWxpZCBpdGVtIGluIGl0ZW1zIGRlZmluaXRpb24nO1xuICAgICAgICAgICAgaWYoaXRlbSBpbnN0YW5jZW9mIEFycmF5KSBuYW1lID0gJ21vZGlmaWVyJztcbiAgICAgICAgICAgIGVsc2UgbmFtZSA9IDxzdHJpbmc+aXRlbTtcbiAgICAgICAgICAgIGxldCBwbGFjZWhvbGRlciA9IFBsYWNlaG9sZGVyKG5hbWUpO1xuICAgICAgICAgICAgdGVtcGxhdGUgPSB0ZW1wbGF0ZS5yZXBsYWNlKHBsYWNlaG9sZGVyLmxvY2F0b3IsIHBsYWNlaG9sZGVyLnJlcGxhY2VtZW50KGl0ZW0gaW5zdGFuY2VvZiBBcnJheSA/IGl0ZW0gOiBudWxsKSk7XG4gICAgICAgICAgICBpZih0aGlzLmluZGljaWVzW25hbWVdIGluc3RhbmNlb2YgQXJyYXkpICg8bnVtYmVyW10+dGhpcy5pbmRpY2llc1tuYW1lXSkucHVzaChpZHgpO1xuICAgICAgICAgICAgZWxzZSBpZighaXNOYU4oPGFueT50aGlzLmluZGljaWVzW25hbWVdKSkge1xuICAgICAgICAgICAgICAgIGxldCBhcnJheSA9IFtdO1xuICAgICAgICAgICAgICAgIGFycmF5LnB1c2godGhpcy5pbmRpY2llc1tuYW1lXSk7XG4gICAgICAgICAgICAgICAgYXJyYXkucHVzaChpZHgpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5kaWNpZXNbbmFtZV0gPSBhcnJheTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgdGhpcy5pbmRpY2llc1tuYW1lXSA9IGlkeDtcbiAgICAgICAgICAgIHRoaXMuaW5kaWNpZXNbaWR4XSA9IG5hbWU7XG4gICAgICAgICAgICBpZHgrKztcbiAgICAgICAgfVxuICAgICAgICB0ZW1wbGF0ZSA9IHRlbXBsYXRlLnJlcGxhY2UoL1xccysvZywgJyg/OlxcXFxifFxcXFxzKyknKTtcbiAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAodGVtcGxhdGUsICdpJyk7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgcGFyc2UoY29tbWFuZDogQ29tbWFuZCk6IEV4cHJlc3Npb25SZXN1bHQge1xuICAgICAgICBsZXQgcmVzdWx0ID0gbmV3IEV4cHJlc3Npb25SZXN1bHQoKSwgbWF0Y2ggPSBjb21tYW5kLnN0YXRlbWVudC5tYXRjaCh0aGlzLnJlZ2V4KSwgaSwgbW9kaWZpZXI6IE1vZGlmaWVyLCBtb2ROdW1iZXI6IG51bWJlciA9IC0xO1xuICAgICAgICByZXN1bHQuc3RhdGVtZW50ID0gbWF0Y2hbMF07XG4gICAgICAgIGZvcihpPTE7aTxtYXRjaC5sZW5ndGg7aSsrKXtcbiAgICAgICAgICAgIGlmKHRoaXMuaXRlbXNbaS0xXSBpbnN0YW5jZW9mIEFycmF5KXtcbiAgICAgICAgICAgICAgICBtb2ROdW1iZXIrKztcbiAgICAgICAgICAgICAgICBmb3IobW9kaWZpZXIgb2YgPE1vZGlmaWVyW10+dGhpcy5pdGVtc1tpLTFdKXtcbiAgICAgICAgICAgICAgICAgICAgaWYobW9kaWZpZXIubWF0Y2hlcyhtYXRjaFtpXSkpIHJlc3VsdC5zZXQoPHN0cmluZz50aGlzLmluZGljaWVzW2ldLCBtb2RpZmllciwgbW9kTnVtYmVyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHJlc3VsdC5zZXQoPHN0cmluZz50aGlzLmluZGljaWVzW2ldLCBtYXRjaFtpXSlcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQudmFyaWFibGVzID0gY29tbWFuZC5zY29wZS52YXJpYWJsZXM7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBldmFsdWF0ZShjb21tYW5kOiBDb21tYW5kKTogYW55e1xuICAgICAgICBsZXQgcGFyc2VkID0gdGhpcy5wYXJzZShjb21tYW5kKTtcbiAgICAgICAgcGFyc2VkLnBhc3MgPSB0aGlzLnJ1bGUoY29tbWFuZCwgcGFyc2VkLnZhbHVlLCBwYXJzZWQudmFyaWFibGVzKTtcbiAgICAgICAgbGV0IGluZGV4OiBudW1iZXI7XG4gICAgICAgIGZvcihpbmRleCBvZiB0aGlzLmRlZmluaXRpb24ubW9kT3JkZXIpe1xuICAgICAgICAgICAgaWYocGFyc2VkLm1vZGlmaWVyW2luZGV4XSkgcGFyc2VkLnBhc3MgPSBwYXJzZWQubW9kaWZpZXJbaW5kZXhdLmRlZmluaXRpb24ucnVsZShwYXJzZWQucGFzcywgcGFyc2VkLnZhbHVlLCBwYXJzZWQudmFyaWFibGVzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGFyc2VkLnBhc3M7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBtYXRjaGVzKHN0YXRlbWVudDogc3RyaW5nKXtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVnZXgudGVzdChzdGF0ZW1lbnQpO1xuICAgIH1cbn0iLCJpbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcbmltcG9ydCB7TW9kaWZpZXJ9IGZyb20gJy4uL01vZGlmaWVycyc7XG5pbXBvcnQgVmFsdWUgZnJvbSAnLi4vVmFsdWUnO1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXhwcmVzc2lvblJlc3VsdCB7XG4gICAgcHVibGljIHBhc3M6IGJvb2xlYW47XG4gICAgcHVibGljIHZhbHVlOiBWYWx1ZVtdID0gW107XG4gICAgcHVibGljIHZhcmlhYmxlczogSVZhcmlhYmxlcztcbiAgICBwdWJsaWMgbW9kaWZpZXI6IE1vZGlmaWVyW10gPSBbXTtcbiAgICBwdWJsaWMgc3RhdGVtZW50OiBzdHJpbmc7XG4gICAgcHVibGljIHNldChwcm9wOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcgfCBNb2RpZmllciwgaW5kZXg/OiBudW1iZXIpe1xuICAgICAgICBpZih0aGlzW3Byb3BdIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgIGlmKGluZGV4KSB0aGlzW3Byb3BdW2luZGV4XSA9IHByb3AgPT09ICd2YWx1ZScgPyBuZXcgVmFsdWUodmFsdWUpIDogdmFsdWU7XG4gICAgICAgICAgICBlbHNlIHRoaXNbcHJvcF0ucHVzaChwcm9wID09PSAndmFsdWUnID8gbmV3IFZhbHVlKHZhbHVlKSA6IHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHRoaXNbcHJvcF0gPSBwcm9wID09PSAndmFsdWUnID8gbmV3IFZhbHVlKHZhbHVlKSA6IHZhbHVlO1xuICAgIH1cbn0iLCJpbXBvcnQge01vZGlmaWVyfSBmcm9tICcuLi9Nb2RpZmllcnMnO1xuaW1wb3J0IENvbW1hbmQgZnJvbSAnLi4vQ29tbWFuZCc7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcbmltcG9ydCBWYWx1ZSBmcm9tICcuLi9WYWx1ZSc7XG5pbnRlcmZhY2UgSUV4cHJlc3Npb25EZWZpbml0aW9uIHtcbiAgICB0ZW1wbGF0ZTogc3RyaW5nO1xuICAgIGl0ZW1zOiBBcnJheTxzdHJpbmcgfCBNb2RpZmllcltdPjtcbiAgICBtb2RPcmRlcjogbnVtYmVyW107XG4gICAgcnVsZTogKGNvbW1hbmQ6IENvbW1hbmQsIHZhbHVlczogVmFsdWVbXSwgdmFyaWFibGVzOiBJVmFyaWFibGVzKSA9PiBhbnk7XG59XG5leHBvcnQgZGVmYXVsdCBJRXhwcmVzc2lvbkRlZmluaXRpb247IiwiaW50ZXJmYWNlIElFeHByZXNzaW9uSW5kaWNlcyB7XG4gICAgW2tleTogc3RyaW5nXTogKG51bWJlcltdIHwgbnVtYmVyIHwgc3RyaW5nKTtcbiAgICBba2V5OiBudW1iZXJdOiBzdHJpbmcgfCBudW1iZXIgfCBudW1iZXJbXTtcbn1cbmV4cG9ydCBkZWZhdWx0IElFeHByZXNzaW9uSW5kaWNlczsiLCJpbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcbmltcG9ydCBWYWx1ZSBmcm9tICcuLi9WYWx1ZSc7XG5cbmludGVyZmFjZSBJTW9kaWZpZXJEZWZpbml0aW9uIHtcbiAgICBpZGVudGlmaWVyczogUmVnRXhwW107XG4gICAgcnVsZTogKHBhc3M6IGJvb2xlYW4sIHZhbHVlczogVmFsdWVbXSwgdmFyaWFibGVzOiBJVmFyaWFibGVzKSA9PiBib29sZWFuO1xufVxuZXhwb3J0IGRlZmF1bHQgSU1vZGlmaWVyRGVmaW5pdGlvbjsiLCJpbXBvcnQgSU1vZGlmaWVyRGVmaW5pdGlvbiBmcm9tICcuL0lNb2RpZmllckRlZmluaXRpb24nO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vZGlmaWVyIHtcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgZGVmaW5pdGlvbjpJTW9kaWZpZXJEZWZpbml0aW9uKXtcbiAgICAgICAgaWYoIWRlZmluaXRpb24pIHRocm93ICdBdHRlbXB0ZWQgdG8gaW5zdGF0aWF0ZSBtb2RpZmllciB3aXRob3V0IGEgZGVmaW5pdGlvbic7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBtYXRjaGVzKHRleHQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgaWRlbnRpZmllcjtcbiAgICAgICAgZm9yKGlkZW50aWZpZXIgb2YgdGhpcy5kZWZpbml0aW9uLmlkZW50aWZpZXJzKXtcbiAgICAgICAgICAgIGlmKGlkZW50aWZpZXIudGVzdCh0ZXh0KSkgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn0iLCJpbXBvcnQge1J1bm5lcn0gZnJvbSAnLi4vUnVubmVycyc7XG5cbmludGVyZmFjZSBJUGFyc2VyRGVmaW5pdGlvbiB7XG4gICAgcnVubmVyczogUnVubmVyW11cbn1cbmV4cG9ydCBkZWZhdWx0IElQYXJzZXJEZWZpbml0aW9uOyIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9FeHRlbnNpb25zLnRzXCIgLz5cbmltcG9ydCBJUGFyc2VyRGVmaW5pdGlvbiBmcm9tICcuL0lQYXJzZXJEZWZpbml0aW9uJztcbmltcG9ydCB7UnVubmVyLCBBY3Rpb25SdW5uZXJ9IGZyb20gJy4uL1J1bm5lcnMnO1xuaW1wb3J0IENvbW1hbmQgZnJvbSAnLi4vQ29tbWFuZCc7XG5pbXBvcnQgU2NvcGUgZnJvbSAnLi4vU2NvcGUnO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5BcnJheS5wcm90b3R5cGUubGFzdCA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiB0aGlzW3RoaXMubGVuZ3RoLTFdO1xufVxuLyoqXG4gKiBUaGUgU1FpZ2dMIHBhcnNlclxuICogQG1vZHVsZSBQYXJzZXJcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtzdHJpbmd9IHNxbCAgICAgICAgICAgICAgLSBUaGUgU1FpZ2dMIHF1ZXJ5IHRvIHJ1biB0aGUgcGFyc2VyIGFnYWluc3RcbiAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzICAgIC0gQW55IHZhcmlhYmxlcyBwYXNzZWQgdG8gdGhlIFNRaWdnTCBwYXJzZXJcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBzcWwgICAgICAgICAgIC0gVGhlIFNRaWdnTCBxdWVyeSB0byBydW4gdGhlIHBhcnNlciBhZ2FpbnN0XG4gKiBAcHJvcGVydHkge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAtIEFueSB2YXJpYWJsZXMgcGFzc2VkIHRvIHRoZSBTUWlnZ0wgcGFyc2VyXG4gKiBAcHJvcGVydHkge0NvbW1hbmRbXX0gY29tbWFuZHMgICAtIEFycmF5IG9mIGNvbW1hbmRzIGZvdW5kIGluIHRoZSBTUWlnZ0wgcXVlcnlcbiAqIEBwcm9wZXJ0eSB7Q29tbWFuZFtdfSBzdGFjayAgICAgIC0gQ29tbWFuZCBzdGFjayBmb3Igc3RvcmluZyBjdXJyZW50IHBvc2l0aW9uIGluIHRoZSBwYXJzaW5nIHByb2Nlc3NcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBlcnJvciAgICAgICAgIC0gRXJyb3Igc3RyaW5nIGlmIGFueSBlcnJvcnMgYXJlIGZvdW5kIGluIHRoZSBwYXJzaW5nIHByb2Nlc3NcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGFyc2VyIHtcbiAgICBwdWJsaWMgcmVnZXg6IFJlZ0V4cDtcblx0cHVibGljIGNvbW1hbmRzOiBDb21tYW5kW10gPSBbXTtcblx0cHVibGljIHN0YWNrOiBDb21tYW5kW10gPSBbXTtcbiAgICBwdWJsaWMgZXJyb3I6IHN0cmluZ1tdID0gW107XG4gICAgcHVibGljIHNxbDogc3RyaW5nO1xuXHQvLyBjb25zdHJ1Y3RvcihwdWJsaWMgc3FsOiBzdHJpbmcsIHB1YmxpYyB2YXJpYWJsZXM6IElWYXJpYWJsZXMpe1xuXHRcdC8vIHRoaXMuY29tbWFuZHMgPSB0aGlzLmV4dHJhY3Qoc3FsLCB2YXJpYWJsZXMpO1xuXHRcdC8vIHRoaXMudmFyaWFibGVzID0gdmFyaWFibGVzO1xuXHQvLyB9XG4gICAgY29uc3RydWN0b3IocHVibGljIGRlZmluaXRpb246IElQYXJzZXJEZWZpbml0aW9uKXtcbiAgICAgICAgaWYoIWRlZmluaXRpb24pIHRocm93ICdBdHRlbXB0ZWQgdG8gaW5zdGF0aWF0ZSBwYXJzZXIgd2l0aG91dCBhIGRlZmluaXRpb24nO1xuICAgICAgICB0aGlzLnJlZ2V4ID0gbmV3IFJlZ0V4cChgKD86JHt0aGlzLmRlZmluaXRpb24ucnVubmVycy5tYXAoeCA9PiB4LmRlZmluaXRpb24ucmVnZXguc291cmNlKS5qb2luKCcpfCgnKX0pYCwgJ2dtJyk7XG4gICAgfVxuXHQvKipcbiAgICAgKiBFeHRyYWN0IGFueSBjb21tYW5kcyBvdXQgb2YgdGhlIFNRaWdnTCBxdWVyeSBhbmQgZGV0ZXJtaW5lIHRoZWlyIG9yZGVyLCBuZXN0aW5nLCBhbmQgdHlwZVxuICAgICAqIEBtZW1iZXJvZiBQYXJzZXJcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzcWwgICAgICAgICAgICAgIC0gU1FpZ2dMIHF1ZXJ5IHRvIGV4dHJhY3QgY29tbWFuZHMgZnJvbVxuICAgICAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzICAgIC0gQW55IGdsb2JhbCB2YXJpYWJsZXMgcGFzc2VkIGluIHRvIFNRaWdnTFxuICAgICAqIEByZXR1cm5zIHtDb21tYW5kW119ICAgICAgICAgICAgIC0gQXJyYXkgb2YgZnVsbHkgcGFyc2VkIGNvbW1hbmRzLCByZWFkeSBmb3IgZXhlY3V0aW9uXG4gICAgICovXG5cdHB1YmxpYyBwYXJzZShzcWw6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzKXtcblx0ICAgIHRoaXMuY29tbWFuZHMgPSBbXTtcbiAgICAgICAgdGhpcy5zdGFjayA9IFtdO1xuICAgICAgICB0aGlzLnNxbCA9IHNxbDtcbiAgICAgICAgbGV0IG1hdGNoO1xuXHRcdC8vIENvbW1hbmQucmVnZXgubGFzdEluZGV4ID0gMDtcblx0XHR3aGlsZSgobWF0Y2ggPSB0aGlzLnJlZ2V4LmV4ZWMoc3FsKSkgIT0gbnVsbCl7XG4gICAgICAgICAgICBsZXQgZm91bmQ6IENvbW1hbmQsIHJ1bm5lcjogUnVubmVyO1xuICAgICAgICAgICAgZm9yKHJ1bm5lciBvZiB0aGlzLmRlZmluaXRpb24ucnVubmVycyl7XG4gICAgICAgICAgICAgICAgaWYocnVubmVyLm1hdGNoZXMobWF0Y2hbMF0pKXtcbiAgICAgICAgICAgICAgICAgICAgZm91bmQgPSBuZXcgQ29tbWFuZChtYXRjaC5pbmRleCwgbWF0Y2guaW5wdXQubGVuZ3RoLCBtYXRjaFsxXSwgbWF0Y2hbMl0sIG5ldyBTY29wZSgpLCBydW5uZXIpO1xuICAgICAgICAgICAgICAgICAgICBmb3VuZC5zY29wZS52YXJpYWJsZXMgPSB2YXJpYWJsZXM7XG4gICAgICAgICAgICAgICAgICAgIHJ1bm5lci5wYXJzZShmb3VuZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXHRcdFx0aWYodGhpcy5zdGFjay5sZW5ndGggPiAwICYmIHRoaXMuc3RhY2subGFzdCgpLmFjdGlvbi5kZWZpbml0aW9uLmRlcGVuZGVudHMuY29udGFpbnMoZm91bmQuYWN0aW9uKSl7XG4gICAgICAgICAgICAgICAgLy8gZm91bmQuYWN0aW9uLnN1cHBvcnRlciA9IHN0YWNrLmxhc3QoKTtcblx0XHRcdFx0dGhpcy5zdGFjay5sYXN0KCkuZGVwZW5kZW50cy5wdXNoKGZvdW5kKTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHRoaXMuc3RhY2subGVuZ3RoID4gMCAmJiAhdGhpcy5zdGFjay5sYXN0KCkuYWN0aW9uLmRlZmluaXRpb24udGVybWluYXRvcikge1xuXHRcdFx0XHR0aGlzLnN0YWNrLnB1c2goZm91bmQpO1xuXHRcdFx0XHR0aGlzLnN0YWNrLmxhc3QoKS5zY29wZS5jb21tYW5kcy5wdXNoKGZvdW5kKTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRpZih0aGlzLnN0YWNrLmxlbmd0aCA+IDAgJiYgdGhpcy5zdGFjay5sYXN0KCkuYWN0aW9uLmRlZmluaXRpb24udGVybWluYXRvcikgdGhpcy5zdGFjay5wb3AoKTtcblx0XHRcdFx0dGhpcy5zdGFjay5wdXNoKGZvdW5kKTtcblx0XHRcdFx0dGhpcy5jb21tYW5kcy5wdXNoKGZvdW5kKTtcblx0XHRcdH1cbiAgICAgICAgICAgIC8vIGxldCBlcnJvciA9IGZvdW5kLmFjdGlvbi52YWxpZGF0ZSgpO1xuICAgICAgICAgICAgLy8gaWYoZXJyb3IpIHJldHVybiBbXTtcblx0XHR9XG5cdFx0Ly8gcmV0dXJuIGNvbW1hbmRzO1xuXHR9XG5cdC8qKlxuICAgICAqIFJ1biB0aGUgY29tbWFuZHMgYWdhaW5zdCB0aGUgc3RyaW5nIGFuZCBvdXRwdXQgdGhlIGVuZCByZXN1bHRcbiAgICAgKiBAbWVtYmVyb2YgUGFyc2VyXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgZW5kIHJlc3VsdCBvZiBydW5uaW5nIGFsbCBjb21tYW5kcyBhZ2FpbnN0IHRoZSBTUWlnZ0wgcXVlcnlcbiAgICAgKi9cblx0cHVibGljIHBlcmZvcm0oKTogc3RyaW5nIHtcblx0XHR2YXIgcXVlcnkgPSAnJywgaW5kZXggPSAwO1xuICAgICAgICBpZih0aGlzLmNvbW1hbmRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHRoaXMuc3FsO1xuXHRcdGZvcih2YXIgY29tbWFuZCBvZiB0aGlzLmNvbW1hbmRzKXtcblx0XHRcdHF1ZXJ5ICs9IHRoaXMuc3FsLnNsaWNlKGluZGV4LCBjb21tYW5kLmluZGV4IC0xKTtcblx0XHRcdHF1ZXJ5ICs9IGNvbW1hbmQucGVyZm9ybShjb21tYW5kKS5yZXN1bHQudGV4dDtcblx0XHRcdGluZGV4ICs9IGNvbW1hbmQubGVuZ3RoO1xuXHRcdH1cblx0XHRyZXR1cm4gcXVlcnk7IC8vVE9ET1xuXHR9XG59IiwiaW1wb3J0IHtNb2RpZmllcn0gZnJvbSAnLi4vTW9kaWZpZXJzJztcbmludGVyZmFjZSBJUGxhY2Vob2xkZXIge1xuICAgIG5hbWU6IHN0cmluZztcbiAgICBsb2NhdG9yOiBSZWdFeHA7XG4gICAgcmVwbGFjZW1lbnQ6IChpdGVtPzpNb2RpZmllcltdKSA9PiBzdHJpbmc7XG59XG5leHBvcnQgZGVmYXVsdCBJUGxhY2Vob2xkZXI7IiwiaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5cbmludGVyZmFjZSBJUmVwbGFjZXJEZWZpbml0aW9uIHtcbiAgICByZWdleDogUmVnRXhwO1xuICAgIHJ1bGU6IChkZWZpbml0aW9uOiBJUmVwbGFjZXJEZWZpbml0aW9uLCB0ZXh0OiBzdHJpbmcsIHZhcmlhYmxlczogSVZhcmlhYmxlcykgPT4gc3RyaW5nO1xufVxuZXhwb3J0IGRlZmF1bHQgSVJlcGxhY2VyRGVmaW5pdGlvbjsiLCJpbXBvcnQgSVJlcGxhY2VyRGVmaW5pdGlvbiBmcm9tICcuL0lSZXBsYWNlckRlZmluaXRpb24nO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlcGxhY2VyIHsgICAgXG4gICAgY29uc3RydWN0b3IocHVibGljIGRlZmluaXRpb246IElSZXBsYWNlckRlZmluaXRpb24pe1xuICAgICAgICBpZighZGVmaW5pdGlvbikgdGhyb3cgJ0F0dGVtcHRlZCB0byBpbnN0YXRpYXRlIHJlcGxhY2VyIHdpdGhvdXQgYSBkZWZpbml0aW9uJztcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHJlcGxhY2UodGV4dDogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBzdHJpbmd7XG4gICAgICAgIHJldHVybiB0aGlzLmRlZmluaXRpb24ucnVsZSh0aGlzLmRlZmluaXRpb24sIHRleHQsIHZhcmlhYmxlcyk7XG4gICAgfVxufSIsImltcG9ydCB7QWN0aW9ufSBmcm9tICcuLi9BY3Rpb25zJztcbmltcG9ydCB7UmVwbGFjZXJ9IGZyb20gJy4uL1JlcGxhY2Vycyc7XG5cbmludGVyZmFjZSBJUnVubmVyRGVmaW5pdGlvbiB7XG4gICAgcmVnZXg6IFJlZ0V4cDtcbiAgICBhY3Rpb25zOiBBY3Rpb25bXTtcbiAgICByZXBsYWNlcnM6IFJlcGxhY2VyW107XG59XG5leHBvcnQgZGVmYXVsdCBJUnVubmVyRGVmaW5pdGlvbjsiLCJpbXBvcnQgSVJ1bm5lckRlZmluaXRpb24gZnJvbSAnLi9JUnVubmVyRGVmaW5pdGlvbic7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcbmltcG9ydCBTY29wZSBmcm9tICcuLi9TY29wZSc7XG5pbXBvcnQge0FjdGlvbn0gZnJvbSAnLi4vQWN0aW9ucyc7XG5pbXBvcnQgQ29tbWFuZCBmcm9tICcuLi9Db21tYW5kJztcbmltcG9ydCB7UmVwbGFjZXJ9IGZyb20gJy4uL1JlcGxhY2Vycyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJ1bm5lciB7XG4gICAgY29uc3RydWN0b3IocHVibGljIGRlZmluaXRpb246IElSdW5uZXJEZWZpbml0aW9uKXtcbiAgICAgICAgaWYoIWRlZmluaXRpb24pIHRocm93ICdBdHRlbXB0ZWQgdG8gaW5zdGF0aWF0ZSBydW5uZXIgd2l0aG91dCBhIGRlZmluaXRpb24nO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgcGFyc2UoY29tbWFuZDogQ29tbWFuZCkge1xuICAgICAgICBsZXQgYWN0aW9uOiBBY3Rpb247XG4gICAgICAgIGZvcihhY3Rpb24gb2YgdGhpcy5kZWZpbml0aW9uLmFjdGlvbnMpe1xuICAgICAgICAgICAgaWYoYWN0aW9uLm1hdGNoZXMoY29tbWFuZC5zdGF0ZW1lbnQpKSB7XG4gICAgICAgICAgICAgICAgY29tbWFuZC5hY3Rpb24gPSBhY3Rpb247XG4gICAgICAgICAgICAgICAgY29tbWFuZC5hY3Rpb24ucGFyc2UoY29tbWFuZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgcHVibGljIHBlcmZvcm0oY29tbWFuZDogQ29tbWFuZCwgcHJldj86IENvbW1hbmQpOiBDb21tYW5kIHtcbiAgICAgICAgY29tbWFuZC5yZXN1bHQgPSBjb21tYW5kLmFjdGlvbi5wZXJmb3JtKGNvbW1hbmQsIHByZXYpLnJlc3VsdDtcbiAgICAgICAgLy8gY29tbWFuZC5yZXN1bHQuZGVwZW5kZW50ID0gY29tbWFuZC5zY29wZS5wZXJmb3JtKGNvbW1hbmQpLnJlc3VsdDtcbiAgICAgICAgbGV0IHJlcGxhY2VyOiBSZXBsYWNlcjtcbiAgICAgICAgZm9yKHJlcGxhY2VyIG9mIHRoaXMuZGVmaW5pdGlvbi5yZXBsYWNlcnMpe1xuICAgICAgICAgICAgY29tbWFuZC5yZXBsYWNlKHJlcGxhY2VyKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29tbWFuZDtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIG1hdGNoZXModGV4dDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIHRoaXMuZGVmaW5pdGlvbi5yZWdleC5sYXN0SW5kZXggPSAwO1xuICAgICAgICByZXR1cm4gdGhpcy5kZWZpbml0aW9uLnJlZ2V4LnRlc3QodGV4dCk7XG4gICAgfVxufSJdfQ==
