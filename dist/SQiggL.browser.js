(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var CommandResult_1 = require('./commands/CommandResult');
var Action_1 = require('./actions/Action');
var Conditions_1 = require('./Conditions');
var EndIfDefinition = {
    regex: /^\s*endif\b/i,
    conditions: [],
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
    conditions: [],
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
    conditions: [Conditions_1.Equal, Conditions_1.GreaterThan, Conditions_1.LessThan, Conditions_1.IsNull, Conditions_1.AlphabeticallyGreaterThan, Conditions_1.AlphabeticallyLessThan, Conditions_1.LengthGreaterThan, Conditions_1.LengthLessThan, Conditions_1.IsNaN, Conditions_1.Between],
    dependents: [exports.Else, exports.EndIf],
    terminator: false,
    rule: function (command, prev) {
        if (command.condition.perform(command)) {
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
    conditions: [],
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
    conditions: [Conditions_1.Equal, Conditions_1.GreaterThan, Conditions_1.LessThan, Conditions_1.IsNull, Conditions_1.AlphabeticallyGreaterThan, Conditions_1.AlphabeticallyLessThan, Conditions_1.LengthGreaterThan, Conditions_1.LengthLessThan, Conditions_1.IsNaN, Conditions_1.Between],
    dependents: [exports.Else, exports.EndUnless],
    terminator: false,
    rule: function (command, prev) {
        if (!command.condition.perform(command)) {
            command.result = new CommandResult_1.default(command.inner + command.scope.perform() + command.terminate(), true);
        }
        else
            command.result = new CommandResult_1.default(command.defer(false), false);
        return command;
    }
};
exports.Unless = new Action_1.default(UnlessDefinition);
var Action_2 = require('./actions/Action');
exports.Action = Action_2.default;

},{"./Conditions":3,"./actions/Action":17,"./commands/CommandResult":19}],2:[function(require,module,exports){
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
var Condition_1 = require('./conditions/Condition');
var Modifiers_1 = require('./Modifiers');
var EqualDefinition = {
    template: '(v) (m)=(m) (v)',
    items: ['value', [Modifiers_1.Not, Modifiers_1.OrEqual], [Modifiers_1.OrEqual], 'value'],
    modOrder: [1, 0],
    rule: function (values, variables) { return values[0].evaluate(variables) === values[1].evaluate(variables); }
};
exports.Equal = new Condition_1.default(EqualDefinition);
var GreaterThanDefinition = {
    template: '(v) (m)>(m) (v)',
    items: ['value', [Modifiers_1.Not], [Modifiers_1.OrEqual], 'value'],
    modOrder: [1, 0],
    rule: function (values, variables) { return values[0].evaluate(variables) > values[1].evaluate(variables); }
};
exports.GreaterThan = new Condition_1.default(GreaterThanDefinition);
var LessThanDefinition = {
    template: '(v) (m)<(m) (v)',
    items: ['value', [Modifiers_1.Not], [Modifiers_1.OrEqual], 'value'],
    modOrder: [1, 0],
    rule: function (values, variables) { return values[0].evaluate(variables) < values[1].evaluate(variables); }
};
exports.LessThan = new Condition_1.default(LessThanDefinition);
var IsNullDefinition = {
    template: '(v) is (m) null',
    items: ['value', [Modifiers_1.Not]],
    modOrder: [0],
    rule: function (values, variables) { return values[0].evaluate(variables) == null; }
};
exports.IsNull = new Condition_1.default(IsNullDefinition);
var AlphabeticallyGreaterThanDefinition = {
    template: '(v) (m)abc>(m) (v)',
    items: ['value', [Modifiers_1.Not], [Modifiers_1.OrEqual], 'value'],
    modOrder: [1, 0],
    rule: function (values, variables) { return [values[0].evaluate(variables), values[1].evaluate(variables)].sort().indexOf(values[0].evaluate(variables)) > 0; }
};
exports.AlphabeticallyGreaterThan = new Condition_1.default(AlphabeticallyGreaterThanDefinition);
var AlphabeticallyLessThanDefinition = {
    template: '(v) (m)abc<(m) (v)',
    items: ['value', [Modifiers_1.Not], [Modifiers_1.OrEqual], 'value'],
    modOrder: [1, 0],
    rule: function (values, variables) { return values[0].evaluate(variables) === values[1].evaluate(variables) ? false : [values[0].evaluate(variables), values[1].evaluate(variables)].sort().indexOf(values[0].evaluate(variables)) === 0; }
};
exports.AlphabeticallyLessThan = new Condition_1.default(AlphabeticallyLessThanDefinition);
var LengthGreaterThanDefinition = {
    template: '(v) (m)len>(m) (v)',
    items: ['value', [Modifiers_1.Not], [Modifiers_1.LengthOrEqual], 'value'],
    modOrder: [1, 0],
    rule: function (values, variables) { return values[0].evaluate(variables).length > values[1].evaluate(variables); }
};
exports.LengthGreaterThan = new Condition_1.default(LengthGreaterThanDefinition);
var LengthLessThanDefinition = {
    template: '(v) (m)len<(m) (v)',
    items: ['value', [Modifiers_1.Not], [Modifiers_1.LengthOrEqual], 'value'],
    modOrder: [1, 0],
    rule: function (values, variables) { return values[0].evaluate(variables).length < values[1].evaluate(variables); }
};
exports.LengthLessThan = new Condition_1.default(LengthLessThanDefinition);
var IsNaNDefinition = {
    template: '(v) is (m)NaN',
    items: ['value', [Modifiers_1.Not]],
    modOrder: [0],
    rule: function (values, variables) { return isNaN(values[0].evaluate(variables)); }
};
exports.IsNaN = new Condition_1.default(IsNaNDefinition);
var BetweenDefinition = {
    template: '(v) (v)>(m)<(v)',
    items: ['value', 'value', [Modifiers_1.Not, Modifiers_1.BetweenOrEqual], 'value'],
    modOrder: [0],
    rule: function (values, variables) { return values[1].evaluate(variables) < values[0].evaluate(variables) && values[2].evaluate(variables) > values[0].evaluate(variables); }
};
exports.Between = new Condition_1.default(BetweenDefinition);
var Condition_2 = require('./conditions/Condition');
exports.Condition = Condition_2.default;

},{"./Modifiers":8,"./conditions/Condition":20}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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
        if (/("|')[\w\d]+(\1)/.test(item)) {
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
        return this.type === ValueType_1.default.variable ? isNaN(variables[this.value]) ? variables[this.value] : parseFloat(variables[this.value]) : this.value;
    };
    return Value;
})();
exports.default = Value;

},{"./ValueType":16}],16:[function(require,module,exports){
var ValueType;
(function (ValueType) {
    ValueType[ValueType["string"] = 0] = "string";
    ValueType[ValueType["number"] = 1] = "number";
    ValueType[ValueType["variable"] = 2] = "variable";
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
        var condition;
        for (var _i = 0, _a = this.definition.conditions; _i < _a.length; _i++) {
            condition = _a[_i];
            if (condition.matches(command.statement)) {
                command.condition = condition;
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
var ConditionResult_1 = require('./ConditionResult');
require('../Extensions');
var Condition = (function () {
    function Condition(definition) {
        this.definition = definition;
        this.indicies = {};
        if (!definition)
            throw 'Attempted to instatiate condition without a definition';
        this.regex = this.translate(this.definition);
        this.template = definition.template;
        this.items = definition.items;
        this.rule = definition.rule;
    }
    Condition.prototype.translate = function (definition) {
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
    Condition.prototype.parse = function (command) {
        var result = new ConditionResult_1.default(), match = command.statement.match(this.regex), i, modifier, modNumber = -1;
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
    Condition.prototype.perform = function (command) {
        var parsed = this.parse(command);
        parsed.pass = this.rule(parsed.value, parsed.variables);
        var index;
        for (var _i = 0, _a = this.definition.modOrder; _i < _a.length; _i++) {
            index = _a[_i];
            if (parsed.modifier[index])
                parsed.pass = parsed.modifier[index].definition.rule(parsed.pass, parsed.value, parsed.variables);
        }
        return parsed.pass;
    };
    Condition.prototype.matches = function (statement) {
        return this.regex.test(statement);
    };
    return Condition;
})();
exports.default = Condition;

},{"../Extensions":5,"../Placeholders":10,"./ConditionResult":21}],21:[function(require,module,exports){
var Value_1 = require('../Value');
var ConditionResult = (function () {
    function ConditionResult() {
        this.value = [];
        this.modifier = [];
    }
    ConditionResult.prototype.set = function (prop, value, index) {
        if (this[prop] instanceof Array) {
            if (index)
                this[prop][index] = prop === 'value' ? new Value_1.default(value) : value;
            else
                this[prop].push(prop === 'value' ? new Value_1.default(value) : value);
        }
        else
            this[prop] = prop === 'value' ? new Value_1.default(value) : value;
    };
    return ConditionResult;
})();
exports.default = ConditionResult;

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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQWN0aW9ucy50cyIsInNyYy9Db21tYW5kLnRzIiwic3JjL0NvbmRpdGlvbnMudHMiLCJzcmMvRXJyb3JzLnRzIiwic3JjL0V4dGVuc2lvbnMudHMiLCJzcmMvSVZhcmlhYmxlcy50cyIsInNyYy9NYWluLnRzIiwic3JjL01vZGlmaWVycy50cyIsInNyYy9QYXJzZXJzLnRzIiwic3JjL1BsYWNlaG9sZGVycy50cyIsInNyYy9SZXBsYWNlcnMudHMiLCJzcmMvUnVubmVycy50cyIsInNyYy9TUWlnZ0wudHMiLCJzcmMvU2NvcGUudHMiLCJzcmMvVmFsdWUudHMiLCJzcmMvVmFsdWVUeXBlLnRzIiwic3JjL2FjdGlvbnMvQWN0aW9uLnRzIiwic3JjL2FjdGlvbnMvSUFjdGlvbkRlZmluaXRpb24udHMiLCJzcmMvY29tbWFuZHMvQ29tbWFuZFJlc3VsdC50cyIsInNyYy9jb25kaXRpb25zL0NvbmRpdGlvbi50cyIsInNyYy9jb25kaXRpb25zL0NvbmRpdGlvblJlc3VsdC50cyIsInNyYy9jb25kaXRpb25zL0lDb25kaXRpb25EZWZpbml0aW9uLnRzIiwic3JjL2NvbmRpdGlvbnMvSUNvbmRpdGlvbkluZGljZXMudHMiLCJzcmMvbW9kaWZpZXJzL0lNb2RpZmllckRlZmluaXRpb24udHMiLCJzcmMvbW9kaWZpZXJzL01vZGlmaWVyLnRzIiwic3JjL3BhcnNlcnMvSVBhcnNlckRlZmluaXRpb24udHMiLCJzcmMvcGFyc2Vycy9QYXJzZXIudHMiLCJzcmMvcGxhY2Vob2xkZXJzL0lQbGFjZWhvbGRlci50cyIsInNyYy9yZXBsYWNlcnMvSVJlcGxhY2VyRGVmaW5pdGlvbi50cyIsInNyYy9yZXBsYWNlcnMvUmVwbGFjZXIudHMiLCJzcmMvcnVubmVycy9JUnVubmVyRGVmaW5pdGlvbi50cyIsInNyYy9ydW5uZXJzL1J1bm5lci50cyJdLCJuYW1l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QU4sSUFBaUMsQ0FBQztZQUFsQyxNQUFNLFNBQUE7WUFDTixFQUFFLENBQUEsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ25DLE9BQU8sQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO2dCQUN4QixPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNsQyxDQUFDO1NBQ0o7SUFDTCxDQUFDO0lBRU0sd0JBQU8sR0FBZCxVQUFlLE9BQWdCLEVBQUUsSUFBYztRQUMzQyxPQUFPLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFDOUQsQUFDQSxvRUFEb0U7WUFDaEUsUUFBa0IsQ0FBQztRQUN2QixHQUFHLENBQUEsQ0FBYSxVQUF5QixFQUF6QixLQUFBLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFyQyxjQUFRLEVBQVIsSUFBcUMsQ0FBQztZQUF0QyxRQUFRLFNBQUE7WUFDUixPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQzdCO1FBQ0QsTUFBTSxDQUFDLE9BQU8sQ0FBQztJQUNuQixDQUFDO0lBRU0sd0JBQU8sR0FBZCxVQUFlLElBQVk7UUFDdkIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztRQUNwQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFDTCxhQUFDO0FBQUQsQ0E3QkEsQUE2QkMsSUFBQTtBQTdCRCx3QkE2QkMsQ0FBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgSUFjdGlvbkRlZmluaXRpb24gZnJvbSAnLi9hY3Rpb25zL0lBY3Rpb25EZWZpbml0aW9uJztcbmltcG9ydCBDb21tYW5kUmVzdWx0IGZyb20gJy4vY29tbWFuZHMvQ29tbWFuZFJlc3VsdCc7XG5pbXBvcnQgQWN0aW9uIGZyb20gJy4vYWN0aW9ucy9BY3Rpb24nO1xuaW1wb3J0IENvbW1hbmQgZnJvbSAnLi9Db21tYW5kJztcbmltcG9ydCB7Q29uZGl0aW9uLCBFcXVhbCwgR3JlYXRlclRoYW4sIExlc3NUaGFuLCBJc051bGwsIEFscGhhYmV0aWNhbGx5R3JlYXRlclRoYW4sIEFscGhhYmV0aWNhbGx5TGVzc1RoYW4sIExlbmd0aEdyZWF0ZXJUaGFuLCBMZW5ndGhMZXNzVGhhbiwgSXNOYU4sIEJldHdlZW59IGZyb20gJy4vQ29uZGl0aW9ucyc7XG5pbXBvcnQgU2NvcGUgZnJvbSAnLi9TY29wZSc7XG5cbmxldCBFbmRJZkRlZmluaXRpb246IElBY3Rpb25EZWZpbml0aW9uID0ge1xuICAgIHJlZ2V4OiAvXlxccyplbmRpZlxcYi9pLFxuICAgIGNvbmRpdGlvbnM6IFtdLFxuICAgIGRlcGVuZGVudHM6IFtdLFxuICAgIHRlcm1pbmF0b3I6IHRydWUsXG4gICAgcnVsZTogKGNvbW1hbmQ6IENvbW1hbmQsIHByZXY/OiBDb21tYW5kKTogQ29tbWFuZCA9PiB7XG4gICAgICAgIGNvbW1hbmQucmVzdWx0ID0gbmV3IENvbW1hbmRSZXN1bHQoY29tbWFuZC5pbm5lciwgdHJ1ZSk7XG4gICAgICAgIHJldHVybiBjb21tYW5kO1xuICAgIH1cbn07XG5leHBvcnQgbGV0IEVuZElmID0gbmV3IEFjdGlvbihFbmRJZkRlZmluaXRpb24pO1xuXG5sZXQgRWxzZURlZmluaXRpb246IElBY3Rpb25EZWZpbml0aW9uID0ge1xuICAgIHJlZ2V4OiAvXlxccyplbHNlXFxiL2ksXG4gICAgY29uZGl0aW9uczogW10sXG4gICAgZGVwZW5kZW50czogW10sXG4gICAgdGVybWluYXRvcjogZmFsc2UsXG4gICAgcnVsZTogKGNvbW1hbmQ6IENvbW1hbmQsIHByZXY/OiBDb21tYW5kKTogQ29tbWFuZCA9PiB7XG4gICAgICAgIGlmKCFwcmV2LnJlc3VsdC5wYXNzZWQpIGNvbW1hbmQucmVzdWx0ID0gbmV3IENvbW1hbmRSZXN1bHQoY29tbWFuZC5pbm5lciArIGNvbW1hbmQuc2NvcGUucGVyZm9ybSgpLCB0cnVlKTtcbiAgICAgICAgZWxzZSBjb21tYW5kLnJlc3VsdCA9IG5ldyBDb21tYW5kUmVzdWx0KCcnLCBmYWxzZSk7XG4gICAgICAgIHJldHVybiBjb21tYW5kO1xuICAgIH1cbn07XG5leHBvcnQgbGV0IEVsc2UgPSBuZXcgQWN0aW9uKEVsc2VEZWZpbml0aW9uKTtcblxubGV0IElmRGVmaW5pdGlvbjogSUFjdGlvbkRlZmluaXRpb24gPSB7XG4gICAgcmVnZXg6IC9eXFxzKmlmXFxiL2ksXG4gICAgY29uZGl0aW9uczogW0VxdWFsLCBHcmVhdGVyVGhhbiwgTGVzc1RoYW4sIElzTnVsbCwgQWxwaGFiZXRpY2FsbHlHcmVhdGVyVGhhbiwgQWxwaGFiZXRpY2FsbHlMZXNzVGhhbiwgTGVuZ3RoR3JlYXRlclRoYW4sIExlbmd0aExlc3NUaGFuLCBJc05hTiwgQmV0d2Vlbl0sXG4gICAgZGVwZW5kZW50czogW0Vsc2UsIEVuZElmXSxcbiAgICB0ZXJtaW5hdG9yOiBmYWxzZSxcbiAgICBydWxlOiAoY29tbWFuZDogQ29tbWFuZCwgcHJldj86IENvbW1hbmQpOiBDb21tYW5kID0+IHtcbiAgICAgICAgaWYoY29tbWFuZC5jb25kaXRpb24ucGVyZm9ybShjb21tYW5kKSkge1xuICAgICAgICAgICAgY29tbWFuZC5yZXN1bHQgPSBuZXcgQ29tbWFuZFJlc3VsdChjb21tYW5kLmlubmVyICsgY29tbWFuZC5zY29wZS5wZXJmb3JtKCkgKyBjb21tYW5kLnRlcm1pbmF0ZSgpLCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGNvbW1hbmQucmVzdWx0ID0gbmV3IENvbW1hbmRSZXN1bHQoY29tbWFuZC5kZWZlcihmYWxzZSksIGZhbHNlKTtcbiAgICAgICAgcmV0dXJuIGNvbW1hbmQ7XG4gICAgfSBcbn07XG5leHBvcnQgbGV0IElmID0gbmV3IEFjdGlvbihJZkRlZmluaXRpb24pO1xuXG5sZXQgRW5kVW5sZXNzRGVmaW5pdGlvbjogSUFjdGlvbkRlZmluaXRpb24gPSB7XG4gICAgcmVnZXg6IC9eXFxzKmVuZHVubGVzc1xcYi9pLFxuICAgIGNvbmRpdGlvbnM6IFtdLFxuICAgIGRlcGVuZGVudHM6IFtdLFxuICAgIHRlcm1pbmF0b3I6IHRydWUsXG4gICAgcnVsZTogKGNvbW1hbmQ6IENvbW1hbmQsIHByZXY/OiBDb21tYW5kKTogQ29tbWFuZCA9PiB7XG4gICAgICAgIGNvbW1hbmQucmVzdWx0ID0gbmV3IENvbW1hbmRSZXN1bHQoY29tbWFuZC5pbm5lciwgdHJ1ZSk7XG4gICAgICAgIHJldHVybiBjb21tYW5kO1xuICAgIH1cbn1cbmV4cG9ydCBsZXQgRW5kVW5sZXNzID0gbmV3IEFjdGlvbihFbmRVbmxlc3NEZWZpbml0aW9uKTtcblxubGV0IFVubGVzc0RlZmluaXRpb246IElBY3Rpb25EZWZpbml0aW9uID0ge1xuICAgIHJlZ2V4OiAvXlxccyp1bmxlc3NcXGIvaSxcbiAgICBjb25kaXRpb25zOiBbRXF1YWwsIEdyZWF0ZXJUaGFuLCBMZXNzVGhhbiwgSXNOdWxsLCBBbHBoYWJldGljYWxseUdyZWF0ZXJUaGFuLCBBbHBoYWJldGljYWxseUxlc3NUaGFuLCBMZW5ndGhHcmVhdGVyVGhhbiwgTGVuZ3RoTGVzc1RoYW4sIElzTmFOLCBCZXR3ZWVuXSxcbiAgICBkZXBlbmRlbnRzOiBbRWxzZSwgRW5kVW5sZXNzXSxcbiAgICB0ZXJtaW5hdG9yOiBmYWxzZSxcbiAgICBydWxlOiAoY29tbWFuZDogQ29tbWFuZCwgcHJldj86IENvbW1hbmQpOiBDb21tYW5kID0+IHtcbiAgICAgICAgaWYoIWNvbW1hbmQuY29uZGl0aW9uLnBlcmZvcm0oY29tbWFuZCkpe1xuICAgICAgICAgICAgY29tbWFuZC5yZXN1bHQgPSBuZXcgQ29tbWFuZFJlc3VsdChjb21tYW5kLmlubmVyICsgY29tbWFuZC5zY29wZS5wZXJmb3JtKCkgKyBjb21tYW5kLnRlcm1pbmF0ZSgpLCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGNvbW1hbmQucmVzdWx0ID0gbmV3IENvbW1hbmRSZXN1bHQoY29tbWFuZC5kZWZlcihmYWxzZSksIGZhbHNlKTtcbiAgICAgICAgcmV0dXJuIGNvbW1hbmQ7XG4gICAgfVxufVxuZXhwb3J0IGxldCBVbmxlc3MgPSBuZXcgQWN0aW9uKFVubGVzc0RlZmluaXRpb24pO1xuXG5leHBvcnQge2RlZmF1bHQgYXMgSUFjdGlvbkRlZmluaXRpb259IGZyb20gJy4vYWN0aW9ucy9JQWN0aW9uRGVmaW5pdGlvbic7XG5leHBvcnQge2RlZmF1bHQgYXMgQWN0aW9ufSBmcm9tICcuL2FjdGlvbnMvQWN0aW9uJzsiLCJpbXBvcnQge1J1bm5lcn0gZnJvbSAnLi9SdW5uZXJzJztcbmltcG9ydCB7QWN0aW9ufSBmcm9tICcuL0FjdGlvbnMnO1xuaW1wb3J0IHtDb25kaXRpb259IGZyb20gJy4vQ29uZGl0aW9ucyc7XG5pbXBvcnQge01vZGlmaWVyfSBmcm9tICcuL01vZGlmaWVycyc7XG5pbXBvcnQge1JlcGxhY2VyfSBmcm9tICcuL1JlcGxhY2Vycyc7XG5pbXBvcnQgQ29tbWFuZFJlc3VsdCBmcm9tICcuL2NvbW1hbmRzL0NvbW1hbmRSZXN1bHQnO1xuaW1wb3J0IFNjb3BlIGZyb20gJy4vU2NvcGUnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb21tYW5kIHtcbiAgICBwdWJsaWMgZGVwZW5kZW50czogQ29tbWFuZFtdID0gW107XG4gICAgcHVibGljIGFjdGlvbjogQWN0aW9uO1xuICAgIHB1YmxpYyBjb25kaXRpb246IENvbmRpdGlvbjtcbiAgICBwdWJsaWMgbW9kaWZpZXJzOiBNb2RpZmllcltdID0gW107XG4gICAgcHVibGljIHJlc3VsdDogQ29tbWFuZFJlc3VsdCA9IG5ldyBDb21tYW5kUmVzdWx0KCcnLCBmYWxzZSk7XG4gICAgY29uc3RydWN0b3IocHVibGljIGluZGV4OiBudW1iZXIsIHB1YmxpYyBsZW5ndGg6IG51bWJlciwgcHVibGljIHN0YXRlbWVudDogc3RyaW5nLCBwdWJsaWMgaW5uZXI6IHN0cmluZywgcHVibGljIHNjb3BlOiBTY29wZSwgcHJpdmF0ZSBydW5uZXI6IFJ1bm5lcil7XG4gICAgICAgIGxldCBhY3Rpb246IEFjdGlvbjtcbiAgICAgICAgZm9yKGFjdGlvbiBvZiBydW5uZXIuZGVmaW5pdGlvbi5hY3Rpb25zKXtcbiAgICAgICAgICAgIGlmKGFjdGlvbi5tYXRjaGVzKHN0YXRlbWVudCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGlvbiA9IGFjdGlvbjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgcGVyZm9ybShwcmV2PzogQ29tbWFuZCk6IENvbW1hbmQge1xuICAgICAgICByZXR1cm4gdGhpcy5ydW5uZXIucGVyZm9ybSh0aGlzLCBwcmV2KTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHJlcGxhY2UocmVwbGFjZXI6IFJlcGxhY2VyKXtcbiAgICAgICAgdGhpcy5yZXN1bHQudGV4dCA9IHJlcGxhY2VyLnJlcGxhY2UodGhpcy5yZXN1bHQudGV4dCwgdGhpcy5zY29wZS52YXJpYWJsZXMpO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgZGVmZXIocGFzc2VkOiBib29sZWFuKTogc3RyaW5nIHtcbiAgICAgICAgbGV0IGRlcGVuZGVudDpDb21tYW5kLCB0ZXh0OiBzdHJpbmcgPSAnJztcbiAgICAgICAgZm9yKGRlcGVuZGVudCBvZiB0aGlzLmRlcGVuZGVudHMpe1xuICAgICAgICAgICAgdGV4dCArPSBkZXBlbmRlbnQucGVyZm9ybSh0aGlzKS5yZXN1bHQudGV4dDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGV4dDtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHRlcm1pbmF0ZSgpOiBzdHJpbmd7XG4gICAgICAgIHJldHVybiB0aGlzLmRlcGVuZGVudHMuc29tZShjb21tYW5kID0+IGNvbW1hbmQuYWN0aW9uLmRlZmluaXRpb24udGVybWluYXRvcilcblx0XHQgID8gdGhpcy5kZXBlbmRlbnRzLmZpbHRlcihjb21tYW5kID0+IGNvbW1hbmQuYWN0aW9uLmRlZmluaXRpb24udGVybWluYXRvcilbMF0ucGVyZm9ybSgpLnJlc3VsdC50ZXh0XG5cdFx0ICA6ICcnO1xuICAgIH1cbn0iLCJpbXBvcnQgSUNvbmRpdGlvbkRlZmluaXRpb24gZnJvbSAnLi9jb25kaXRpb25zL0lDb25kaXRpb25EZWZpbml0aW9uJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4vSVZhcmlhYmxlcyc7XG5pbXBvcnQgQ29uZGl0aW9uIGZyb20gJy4vY29uZGl0aW9ucy9Db25kaXRpb24nO1xuaW1wb3J0IHtOb3QsIE9yRXF1YWwsIExlbmd0aE9yRXF1YWwsIEJldHdlZW5PckVxdWFsfSBmcm9tICcuL01vZGlmaWVycyc7XG5pbXBvcnQgVmFsdWUgZnJvbSAnLi9WYWx1ZSc7XG5sZXQgRXF1YWxEZWZpbml0aW9uOiBJQ29uZGl0aW9uRGVmaW5pdGlvbiA9IHtcbiAgICB0ZW1wbGF0ZTogJyh2KSAobSk9KG0pICh2KScsXG4gICAgaXRlbXM6IFsndmFsdWUnLCBbTm90LCBPckVxdWFsXSwgW09yRXF1YWxdLCAndmFsdWUnXSxcbiAgICBtb2RPcmRlcjogWzEsMF0sXG4gICAgcnVsZTogKHZhbHVlczogVmFsdWVbXSwgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogYm9vbGVhbiA9PiB2YWx1ZXNbMF0uZXZhbHVhdGUodmFyaWFibGVzKSA9PT0gdmFsdWVzWzFdLmV2YWx1YXRlKHZhcmlhYmxlcylcbn1cbmV4cG9ydCBsZXQgRXF1YWwgPSBuZXcgQ29uZGl0aW9uKEVxdWFsRGVmaW5pdGlvbik7XG5cbmxldCBHcmVhdGVyVGhhbkRlZmluaXRpb246IElDb25kaXRpb25EZWZpbml0aW9uID0ge1xuICAgIHRlbXBsYXRlOiAnKHYpIChtKT4obSkgKHYpJyxcbiAgICBpdGVtczogWyd2YWx1ZScsIFtOb3RdLCBbT3JFcXVhbF0sICd2YWx1ZSddLFxuICAgIG1vZE9yZGVyOiBbMSwwXSxcbiAgICBydWxlOiAodmFsdWVzOiBWYWx1ZVtdLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBib29sZWFuID0+IHZhbHVlc1swXS5ldmFsdWF0ZSh2YXJpYWJsZXMpID4gdmFsdWVzWzFdLmV2YWx1YXRlKHZhcmlhYmxlcylcbn1cbmV4cG9ydCBsZXQgR3JlYXRlclRoYW4gPSBuZXcgQ29uZGl0aW9uKEdyZWF0ZXJUaGFuRGVmaW5pdGlvbik7XG5cbmxldCBMZXNzVGhhbkRlZmluaXRpb246IElDb25kaXRpb25EZWZpbml0aW9uID0ge1xuICAgIHRlbXBsYXRlOiAnKHYpIChtKTwobSkgKHYpJyxcbiAgICBpdGVtczogWyd2YWx1ZScsIFtOb3RdLCBbT3JFcXVhbF0sICd2YWx1ZSddLFxuICAgIG1vZE9yZGVyOiBbMSwwXSxcbiAgICBydWxlOiAodmFsdWVzOiBWYWx1ZVtdLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBib29sZWFuID0+IHZhbHVlc1swXS5ldmFsdWF0ZSh2YXJpYWJsZXMpIDwgdmFsdWVzWzFdLmV2YWx1YXRlKHZhcmlhYmxlcylcbn1cbmV4cG9ydCBsZXQgTGVzc1RoYW4gPSBuZXcgQ29uZGl0aW9uKExlc3NUaGFuRGVmaW5pdGlvbik7XG5cbmxldCBJc051bGxEZWZpbml0aW9uOiBJQ29uZGl0aW9uRGVmaW5pdGlvbiA9IHtcbiAgICB0ZW1wbGF0ZTogJyh2KSBpcyAobSkgbnVsbCcsXG4gICAgaXRlbXM6IFsndmFsdWUnLCBbTm90XV0sXG4gICAgbW9kT3JkZXI6IFswXSxcbiAgICBydWxlOiAodmFsdWVzOiBWYWx1ZVtdLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBib29sZWFuID0+IHZhbHVlc1swXS5ldmFsdWF0ZSh2YXJpYWJsZXMpID09IG51bGxcbn1cbmV4cG9ydCBsZXQgSXNOdWxsID0gbmV3IENvbmRpdGlvbihJc051bGxEZWZpbml0aW9uKTtcblxubGV0IEFscGhhYmV0aWNhbGx5R3JlYXRlclRoYW5EZWZpbml0aW9uOiBJQ29uZGl0aW9uRGVmaW5pdGlvbiA9IHtcbiAgICB0ZW1wbGF0ZTogJyh2KSAobSlhYmM+KG0pICh2KScsXG4gICAgaXRlbXM6IFsndmFsdWUnLCBbTm90XSwgW09yRXF1YWxdLCAndmFsdWUnXSxcbiAgICBtb2RPcmRlcjogWzEsMF0sXG4gICAgcnVsZTogKHZhbHVlczogVmFsdWVbXSwgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogYm9vbGVhbiA9PiBbdmFsdWVzWzBdLmV2YWx1YXRlKHZhcmlhYmxlcyksIHZhbHVlc1sxXS5ldmFsdWF0ZSh2YXJpYWJsZXMpXS5zb3J0KCkuaW5kZXhPZih2YWx1ZXNbMF0uZXZhbHVhdGUodmFyaWFibGVzKSkgPiAwXG59XG5leHBvcnQgbGV0IEFscGhhYmV0aWNhbGx5R3JlYXRlclRoYW4gPSBuZXcgQ29uZGl0aW9uKEFscGhhYmV0aWNhbGx5R3JlYXRlclRoYW5EZWZpbml0aW9uKTtcblxubGV0IEFscGhhYmV0aWNhbGx5TGVzc1RoYW5EZWZpbml0aW9uOiBJQ29uZGl0aW9uRGVmaW5pdGlvbiA9IHtcbiAgICB0ZW1wbGF0ZTogJyh2KSAobSlhYmM8KG0pICh2KScsXG4gICAgaXRlbXM6IFsndmFsdWUnLCBbTm90XSwgW09yRXF1YWxdLCAndmFsdWUnXSxcbiAgICBtb2RPcmRlcjogWzEsMF0sXG4gICAgcnVsZTogKHZhbHVlczogVmFsdWVbXSwgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogYm9vbGVhbiA9PiB2YWx1ZXNbMF0uZXZhbHVhdGUodmFyaWFibGVzKSA9PT0gdmFsdWVzWzFdLmV2YWx1YXRlKHZhcmlhYmxlcykgPyBmYWxzZSA6IFt2YWx1ZXNbMF0uZXZhbHVhdGUodmFyaWFibGVzKSwgdmFsdWVzWzFdLmV2YWx1YXRlKHZhcmlhYmxlcyldLnNvcnQoKS5pbmRleE9mKHZhbHVlc1swXS5ldmFsdWF0ZSh2YXJpYWJsZXMpKSA9PT0gMFxufVxuZXhwb3J0IGxldCBBbHBoYWJldGljYWxseUxlc3NUaGFuID0gbmV3IENvbmRpdGlvbihBbHBoYWJldGljYWxseUxlc3NUaGFuRGVmaW5pdGlvbik7XG5cbmxldCBMZW5ndGhHcmVhdGVyVGhhbkRlZmluaXRpb246IElDb25kaXRpb25EZWZpbml0aW9uID0ge1xuICAgIHRlbXBsYXRlOiAnKHYpIChtKWxlbj4obSkgKHYpJyxcbiAgICBpdGVtczogWyd2YWx1ZScsIFtOb3RdLCBbTGVuZ3RoT3JFcXVhbF0sICd2YWx1ZSddLFxuICAgIG1vZE9yZGVyOiBbMSwwXSxcbiAgICBydWxlOiAodmFsdWVzOiBWYWx1ZVtdLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBib29sZWFuID0+ICg8c3RyaW5nPnZhbHVlc1swXS5ldmFsdWF0ZSh2YXJpYWJsZXMpKS5sZW5ndGggPiB2YWx1ZXNbMV0uZXZhbHVhdGUodmFyaWFibGVzKVxufVxuZXhwb3J0IGxldCBMZW5ndGhHcmVhdGVyVGhhbiA9IG5ldyBDb25kaXRpb24oTGVuZ3RoR3JlYXRlclRoYW5EZWZpbml0aW9uKTtcblxubGV0IExlbmd0aExlc3NUaGFuRGVmaW5pdGlvbjogSUNvbmRpdGlvbkRlZmluaXRpb24gPSB7XG4gICAgdGVtcGxhdGU6ICcodikgKG0pbGVuPChtKSAodiknLFxuICAgIGl0ZW1zOiBbJ3ZhbHVlJywgW05vdF0sIFtMZW5ndGhPckVxdWFsXSwgJ3ZhbHVlJ10sXG4gICAgbW9kT3JkZXI6IFsxLDBdLFxuICAgIHJ1bGU6ICh2YWx1ZXM6IFZhbHVlW10sIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IGJvb2xlYW4gPT4gKDxzdHJpbmc+dmFsdWVzWzBdLmV2YWx1YXRlKHZhcmlhYmxlcykpLmxlbmd0aCA8IHZhbHVlc1sxXS5ldmFsdWF0ZSh2YXJpYWJsZXMpXG59XG5leHBvcnQgbGV0IExlbmd0aExlc3NUaGFuID0gbmV3IENvbmRpdGlvbihMZW5ndGhMZXNzVGhhbkRlZmluaXRpb24pO1xuXG5sZXQgSXNOYU5EZWZpbml0aW9uOiBJQ29uZGl0aW9uRGVmaW5pdGlvbiA9IHtcbiAgICB0ZW1wbGF0ZTogJyh2KSBpcyAobSlOYU4nLFxuICAgIGl0ZW1zOiBbJ3ZhbHVlJywgW05vdF1dLFxuICAgIG1vZE9yZGVyOiBbMF0sXG4gICAgcnVsZTogKHZhbHVlczogVmFsdWVbXSwgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogYm9vbGVhbiA9PiBpc05hTigoPG51bWJlcj52YWx1ZXNbMF0uZXZhbHVhdGUodmFyaWFibGVzKSkpXG59XG5leHBvcnQgbGV0IElzTmFOID0gbmV3IENvbmRpdGlvbihJc05hTkRlZmluaXRpb24pO1xuXG5sZXQgQmV0d2VlbkRlZmluaXRpb246IElDb25kaXRpb25EZWZpbml0aW9uID0ge1xuICAgIHRlbXBsYXRlOiAnKHYpICh2KT4obSk8KHYpJyxcbiAgICBpdGVtczogWyd2YWx1ZScsICd2YWx1ZScsIFtOb3QsIEJldHdlZW5PckVxdWFsXSwgJ3ZhbHVlJ10sXG4gICAgbW9kT3JkZXI6IFswXSxcbiAgICBydWxlOiAodmFsdWVzOiBWYWx1ZVtdLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBib29sZWFuID0+IHZhbHVlc1sxXS5ldmFsdWF0ZSh2YXJpYWJsZXMpIDwgdmFsdWVzWzBdLmV2YWx1YXRlKHZhcmlhYmxlcykgJiYgdmFsdWVzWzJdLmV2YWx1YXRlKHZhcmlhYmxlcykgPiB2YWx1ZXNbMF0uZXZhbHVhdGUodmFyaWFibGVzKSBcbn1cbmV4cG9ydCBsZXQgQmV0d2VlbiA9IG5ldyBDb25kaXRpb24oQmV0d2VlbkRlZmluaXRpb24pO1xuXG5leHBvcnQge2RlZmF1bHQgYXMgQ29uZGl0aW9ufSBmcm9tICcuL2NvbmRpdGlvbnMvQ29uZGl0aW9uJztcbiIsIi8vIGltcG9ydCBJQWN0aW9uIGZyb20gJ2FjdGlvbnMvSUFjdGlvbic7XG4vLyAvKipcbi8vICAqIE1vZHVsZSBvZiBlcnJvciBjaGVja2Vyc1xuLy8gICogQG1vZHVsZSBFcnJvcnNcbi8vICAqIEBjbGFzc1xuLy8gICogQHN0YXRpY1xuLy8gICovXG4vLyBleHBvcnQgZGVmYXVsdCBjbGFzcyBFcnJvcnMge1xuLy8gICAgIC8qKlxuLy8gICAgICAqIEBtZW1iZXJvZiBFcnJvcnNcbi8vICAgICAgKiBAbWV0aG9kXG4vLyAgICAgICogQHN0YXRpY1xuLy8gICAgICAqIEBwYXJhbSB7SUFjdGlvbn0gYWN0aW9uICAgICAgLSBBY3Rpb24gdG8gY2hlY2sgZm9yIGFuIEluY29ycmVjdCBTdGF0ZW1lbnQgZXJyb3Jcbi8vICAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVtZW50ICAgIC0gU3RhdGVtZW50IHRvIGNoZWNrIGZvciBhIEluY29ycmVjdCBTdGF0ZW1lbnQgZXJyb3Jcbi8vICAgICAgKiBAcmV0dXJucyB7c3RyaW5nIHwgbnVsbH0gICAgIC0gVGhlIGVycm9yIG1lc3NhZ2UgaWYgYW55LCBvdGhlcndpc2UgbnVsbCBcbi8vICAgICAgKi9cbi8vICAgICBwdWJsaWMgc3RhdGljIEluY29ycmVjdFN0YXRlbWVudChhY3Rpb246IElBY3Rpb24sIHN0YXRlbWVudDogc3RyaW5nKTogc3RyaW5ne1xuLy8gICAgICAgICBjb25zdCBhY3Rpb25zOnN0cmluZyA9IGFjdGlvbi5jb21tYW5kLmFjdGlvbnMuZmlsdGVyKHggPT4geC5kZXBlbmRlbnRzLnNvbWUoeSA9PiBhY3Rpb24gaW5zdGFuY2VvZiB5KSkubWFwKHggPT4geC5uYW1lKS5qb2luKCcsICcpO1xuLy8gICAgICAgICBjb25zdCBlcnJvcjogc3RyaW5nID0gYEluY29ycmVjdCBzdGF0ZW1lbnQgZm91bmQgYXQgXCIke3N0YXRlbWVudH1cIi4gJHthY3Rpb24uY29uc3RydWN0b3JbJ25hbWUnXX0gbXVzdCBmb2xsb3cgJHthY3Rpb25zfWBcbi8vICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4vLyAgICAgICAgIHJldHVybiBlcnJvcjtcbi8vICAgICB9XG4vLyB9IiwiaW50ZXJmYWNlIEFycmF5PFQ+e1xuXHRsYXN0KCk6IFQ7XG4gICAgaXNGdWxsKCk6IGJvb2xlYW47XG4gICAgY29udGFpbnMoVCk6IGJvb2xlYW47XG59XG5BcnJheS5wcm90b3R5cGUubGFzdCA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiB0aGlzW3RoaXMubGVuZ3RoLTFdO1xufVxuXG5BcnJheS5wcm90b3R5cGUuaXNGdWxsID0gZnVuY3Rpb24oKXtcbiAgICBmb3IobGV0IGk9MDtpPHRoaXMubGVuZ3RoO2krKyl7XG4gICAgICAgIGlmKGkgPT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuQXJyYXkucHJvdG90eXBlLmNvbnRhaW5zID0gZnVuY3Rpb24oVCl7XG4gICAgcmV0dXJuIHRoaXMuc29tZSh4ID0+IHggPT09IFQpO1xufSIsImludGVyZmFjZSBJVmFyaWFibGVzIHtcblx0W2tleTogc3RyaW5nXTogYW55O1xufVxuZXhwb3J0IGRlZmF1bHQgSVZhcmlhYmxlczsiLCJpbXBvcnQge1NRaWdnTFBhcnNlcn0gZnJvbSAnLi9QYXJzZXJzJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4vSVZhcmlhYmxlcyc7XG4vKipcbiAqIFRoZSBzdGFydGluZyBwb2ludCBvZiB0aGUgZW50aXJlIFNRaWdnTCBwYXJzZXJcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IHNxbCAgICAgICAgICAgICAgLSBUaGUgU1FMIHF1ZXJ5IHRvIHJ1biBTUWlnZ0wgYWdhaW5zdFxuICogQHBhcmFtIHtJVmFyaWFibGVzP30gdmFyaWFibGVzICAgLSBPcHRpb25hbCBjb2xsZWN0aW9uIG9mIHZhcmlhYmxlcyBmb3IgeW91ciBTUWlnZ0wgcXVlcnlcbiAqIEByZXR1cm4ge3N0cmluZ30gICAgICAgICAgICAgICAgIC0gVGhlIGZ1bGx5IHBhcnNlZCBTUUwgcXVlcnlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlKHNxbDogc3RyaW5nLCB2YXJpYWJsZXM/OiBJVmFyaWFibGVzKTogc3RyaW5ne1xuXHRTUWlnZ0xQYXJzZXIucGFyc2Uoc3FsLCB2YXJpYWJsZXMpO1xuICAgIHJldHVybiBTUWlnZ0xQYXJzZXIucGVyZm9ybSgpO1xufSIsImltcG9ydCBJTW9kaWZpZXJEZWZpbml0aW9uIGZyb20gJy4vbW9kaWZpZXJzL0lNb2RpZmllckRlZmluaXRpb24nO1xuaW1wb3J0IE1vZGlmaWVyIGZyb20gJy4vbW9kaWZpZXJzL01vZGlmaWVyJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4vSVZhcmlhYmxlcyc7XG5pbXBvcnQgVmFsdWUgZnJvbSAnLi9WYWx1ZSc7XG5cbmxldCBOb3REZWZpbml0aW9uOiBJTW9kaWZpZXJEZWZpbml0aW9uID0ge1xuICAgIGlkZW50aWZpZXJzOiBbLyEvaSwgLyg/OlxcYnxcXHMrKW5vdCg/OlxcYnxcXHMrKS9pXSxcbiAgICBydWxlOiAocGFzczogYm9vbGVhbiwgdmFsdWVzOiBWYWx1ZVtdLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBib29sZWFuID0+ICFwYXNzXG59XG5leHBvcnQgbGV0IE5vdCA9IG5ldyBNb2RpZmllcihOb3REZWZpbml0aW9uKTtcblxubGV0IE9yRXF1YWxEZWZpbml0aW9uOiBJTW9kaWZpZXJEZWZpbml0aW9uID0ge1xuICAgIGlkZW50aWZpZXJzOiBbLz0vaV0sXG4gICAgcnVsZTogKHBhc3M6IGJvb2xlYW4sIHZhbHVlczogVmFsdWVbXSwgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogYm9vbGVhbiA9PiBwYXNzIHx8IHZhbHVlc1swXS5ldmFsdWF0ZSh2YXJpYWJsZXMpID09PSB2YWx1ZXNbMV0uZXZhbHVhdGUodmFyaWFibGVzKVxufVxuZXhwb3J0IGxldCBPckVxdWFsID0gbmV3IE1vZGlmaWVyKE9yRXF1YWxEZWZpbml0aW9uKTtcblxubGV0IExlbmd0aE9yRXF1YWxEZWZpbml0aW9uOiBJTW9kaWZpZXJEZWZpbml0aW9uID0ge1xuICAgIGlkZW50aWZpZXJzOiBbLz0vaV0sXG4gICAgcnVsZTogKHBhc3M6IGJvb2xlYW4sIHZhbHVlczogVmFsdWVbXSwgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogYm9vbGVhbiA9PiBwYXNzIHx8ICg8c3RyaW5nPnZhbHVlc1swXS5ldmFsdWF0ZSh2YXJpYWJsZXMpKS5sZW5ndGggPT09IHZhbHVlc1sxXS5ldmFsdWF0ZSh2YXJpYWJsZXMpXG59XG5leHBvcnQgbGV0IExlbmd0aE9yRXF1YWwgPSBuZXcgTW9kaWZpZXIoTGVuZ3RoT3JFcXVhbERlZmluaXRpb24pO1xuXG5sZXQgQmV0d2Vlbk9yRXF1YWxEZWZpbml0aW9uOiBJTW9kaWZpZXJEZWZpbml0aW9uID0ge1xuICAgIGlkZW50aWZpZXJzOiBbLz0vaV0sXG4gICAgcnVsZTogKHBhc3M6IGJvb2xlYW4sIHZhbHVlczogVmFsdWVbXSwgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogYm9vbGVhbiA9PiBwYXNzIHx8IHZhbHVlc1swXS5ldmFsdWF0ZSh2YXJpYWJsZXMpID09PSB2YWx1ZXNbMV0uZXZhbHVhdGUodmFyaWFibGVzKSB8fCB2YWx1ZXNbMF0uZXZhbHVhdGUodmFyaWFibGVzKSA9PT0gdmFsdWVzWzJdLmV2YWx1YXRlKHZhcmlhYmxlcylcbn1cbmV4cG9ydCBsZXQgQmV0d2Vlbk9yRXF1YWwgPSBuZXcgTW9kaWZpZXIoQmV0d2Vlbk9yRXF1YWxEZWZpbml0aW9uKTtcblxuZXhwb3J0IHtkZWZhdWx0IGFzIElNb2RpZmllckRlZmluaXRpb259IGZyb20gJy4vbW9kaWZpZXJzL0lNb2RpZmllckRlZmluaXRpb24nO1xuZXhwb3J0IHtkZWZhdWx0IGFzIE1vZGlmaWVyfSBmcm9tICcuL21vZGlmaWVycy9Nb2RpZmllcic7ICIsImltcG9ydCBJUGFyc2VyRGVmaW5pdGlvbiBmcm9tICcuL3BhcnNlcnMvSVBhcnNlckRlZmluaXRpb24nO1xuaW1wb3J0IFBhcnNlciBmcm9tICcuL3BhcnNlcnMvUGFyc2VyJztcbmltcG9ydCB7UnVubmVyLCBBY3Rpb25SdW5uZXJ9IGZyb20gJy4vUnVubmVycyc7XG5cbmxldCBTUWlnZ0xQYXJzZXJEZWZpbml0aW9uOiBJUGFyc2VyRGVmaW5pdGlvbiA9IHtcbiAgICBydW5uZXJzOiBbQWN0aW9uUnVubmVyXVxufVxuZXhwb3J0IGxldCBTUWlnZ0xQYXJzZXIgPSBuZXcgUGFyc2VyKFNRaWdnTFBhcnNlckRlZmluaXRpb24pOyBcblxuZXhwb3J0IHtkZWZhdWx0IGFzIElQYXJzZXJEZWZpbml0aW9ufSBmcm9tICcuL3BhcnNlcnMvSVBhcnNlckRlZmluaXRpb24nOyIsImltcG9ydCBJUGxhY2Vob2xkZXIgZnJvbSAnLi9wbGFjZWhvbGRlcnMvSVBsYWNlaG9sZGVyJztcbmltcG9ydCB7TW9kaWZpZXJ9IGZyb20gJy4vTW9kaWZpZXJzJztcbmV4cG9ydCBsZXQgUGxhY2Vob2xkZXJzOiBJUGxhY2Vob2xkZXJbXSA9IFtcbiAgICB7XG4gICAgICAgIG5hbWU6ICd2YWx1ZScsXG4gICAgICAgIGxvY2F0b3I6IC9cXCh2XFwpL2ksXG4gICAgICAgIHJlcGxhY2VtZW50OiAoKSA9PiBgKCg/OlwifCcpP1tcXFxcd1xcXFxkXSsoPzpcInwnKT8pYFxuICAgIH0sXG4gICAge1xuICAgICAgICBuYW1lOiAnbW9kaWZpZXInLFxuICAgICAgICBsb2NhdG9yOiAvXFwobVxcKS9pLFxuICAgICAgICByZXBsYWNlbWVudDogKGl0ZW0/OiBNb2RpZmllcltdKSA9PiBgKCg/OiR7aXRlbS5tYXAobW9kaWZpZXIgPT4gbW9kaWZpZXIuZGVmaW5pdGlvbi5pZGVudGlmaWVycy5tYXAoaWRlbnRpZmllciA9PiBpZGVudGlmaWVyLnNvdXJjZSkuam9pbignfCcpKS5qb2luKCd8Jyl9fFxcXFxzKikpYFxuICAgIH1cbl07XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBQbGFjZWhvbGRlcihuYW1lOiBzdHJpbmcpe1xuICAgIHJldHVybiBQbGFjZWhvbGRlcnMuZmlsdGVyKHggPT4geC5uYW1lID09PSBuYW1lKVswXTtcbn0iLCJpbXBvcnQgSVJlcGxhY2VyRGVmaW5pdGlvbiBmcm9tICcuL3JlcGxhY2Vycy9JUmVwbGFjZXJEZWZpbml0aW9uJztcbmltcG9ydCBSZXBsYWNlciBmcm9tICcuL3JlcGxhY2Vycy9SZXBsYWNlcic7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuL0lWYXJpYWJsZXMnO1xuXG5sZXQgVmFyaWFibGVEZWZpbml0aW9uOiBJUmVwbGFjZXJEZWZpbml0aW9uID0ge1xuICAgIHJlZ2V4OiAvKFtee118Xil7eyg/IXspXFxzKihcXHcqKVxccyp9fSg/IX0pL2csXG4gICAgcnVsZTogKGRlZmluaXRpb246IElSZXBsYWNlckRlZmluaXRpb24sIHRleHQ6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogc3RyaW5nID0+IHRleHQucmVwbGFjZShkZWZpbml0aW9uLnJlZ2V4LCAobWF0Y2gsICQxLCAkMikgPT4gJDErdmFyaWFibGVzWyQyXSlcbn1cbmV4cG9ydCBsZXQgVmFyaWFibGUgPSBuZXcgUmVwbGFjZXIoVmFyaWFibGVEZWZpbml0aW9uKTtcblxuZXhwb3J0IHtkZWZhdWx0IGFzIElSZXBsYWNlckRlZmluaXRpb259IGZyb20gJy4vcmVwbGFjZXJzL0lSZXBsYWNlckRlZmluaXRpb24nO1xuZXhwb3J0IHtkZWZhdWx0IGFzIFJlcGxhY2VyfSBmcm9tICcuL3JlcGxhY2Vycy9SZXBsYWNlcic7IiwiaW1wb3J0IElSdW5uZXJEZWZpbml0aW9uIGZyb20gJy4vcnVubmVycy9JUnVubmVyRGVmaW5pdGlvbic7XG5pbXBvcnQgUnVubmVyIGZyb20gJy4vcnVubmVycy9SdW5uZXInO1xuaW1wb3J0IHtBY3Rpb24sIElmLCBFbHNlLCBFbmRJZiwgVW5sZXNzLCBFbmRVbmxlc3N9IGZyb20gJy4vQWN0aW9ucyc7XG5pbXBvcnQge1JlcGxhY2VyLCBWYXJpYWJsZX0gZnJvbSAnLi9SZXBsYWNlcnMnO1xuXG5sZXQgQWN0aW9uUnVubmVyRGVmaW5pdGlvbjogSVJ1bm5lckRlZmluaXRpb24gPSB7XG4gICAgcmVnZXg6IC97eyUoLio/KSV9fShbXFxzXFxTXSo/KT8oPz0oPzp7eyV8JCkpL2dtLFxuICAgIGFjdGlvbnM6IFtJZiwgRWxzZSwgRW5kSWYsIFVubGVzcywgRW5kVW5sZXNzXSxcbiAgICByZXBsYWNlcnM6IFtWYXJpYWJsZV1cbn1cbmV4cG9ydCBsZXQgQWN0aW9uUnVubmVyID0gbmV3IFJ1bm5lcihBY3Rpb25SdW5uZXJEZWZpbml0aW9uKTtcblxuZXhwb3J0IHtkZWZhdWx0IGFzIElSdW5uZXJEZWZpbml0aW9ufSBmcm9tICcuL3J1bm5lcnMvSVJ1bm5lckRlZmluaXRpb24nO1xuZXhwb3J0IHtkZWZhdWx0IGFzIFJ1bm5lcn0gZnJvbSAnLi9ydW5uZXJzL1J1bm5lcic7IiwiaW1wb3J0IHtwYXJzZSBhcyBQYXJzZX0gZnJvbSAnLi9NYWluJztcbmxldCBTUWlnZ0wgPSB7XG4gICAgcGFyc2U6IFBhcnNlLFxuICAgIHZlcnNpb246ICcwLjEuMCcsXG4gICAgLy9leHRlbmQ6IEV4dGVuZFxufTtcbmlmKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB3aW5kb3dbJ1NRaWdnTCddID0gU1FpZ2dMO1xuZXhwb3J0IGRlZmF1bHQgU1FpZ2dMOyIsImltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4vSVZhcmlhYmxlcyc7XG5pbXBvcnQgQ29tbWFuZCBmcm9tICcuL0NvbW1hbmQnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTY29wZSB7XG5cdHB1YmxpYyB2YXJpYWJsZXM6IElWYXJpYWJsZXMgPSB7fTtcblx0cHVibGljIGNvbW1hbmRzOiBDb21tYW5kW10gPSBbXTtcblx0cHVibGljIGRlcGVuZGVudHM6IENvbW1hbmRbXSA9IFtdO1xuICAgIFxuICAgIHB1YmxpYyBwZXJmb3JtKCk6IHN0cmluZyB7XG4gICAgICAgIGxldCBjb21tYW5kOiBDb21tYW5kLCB0ZXh0OiBzdHJpbmcgPSAnJztcbiAgICAgICAgZm9yKGNvbW1hbmQgb2YgdGhpcy5jb21tYW5kcyl7XG4gICAgICAgICAgICB0ZXh0ICs9IGNvbW1hbmQucGVyZm9ybSgpLnJlc3VsdC50ZXh0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0ZXh0O1xuICAgIH1cbn0iLCJpbXBvcnQgVmFsdWVUeXBlIGZyb20gJy4vVmFsdWVUeXBlJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4vSVZhcmlhYmxlcyc7XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWYWx1ZSB7XG4gICAgcHVibGljIHR5cGU6IFZhbHVlVHlwZTtcbiAgICBwdWJsaWMgdmFsdWU6IHN0cmluZyB8IG51bWJlcjtcbiAgICBjb25zdHJ1Y3RvcihpdGVtKXtcbiAgICAgICAgaWYoLyhcInwnKVtcXHdcXGRdKyhcXDEpLy50ZXN0KGl0ZW0pKSB7XG4gICAgICAgICAgICB0aGlzLnR5cGUgPSBWYWx1ZVR5cGUuc3RyaW5nO1xuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IGl0ZW0uc3Vic3RyKDEsIGl0ZW0ubGVuZ3RoIC0gMik7XG4gICAgICAgIH0gZWxzZSBpZighaXNOYU4oaXRlbSkpIHtcbiAgICAgICAgICAgIHRoaXMudHlwZSA9IFZhbHVlVHlwZS5udW1iZXI7XG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gcGFyc2VGbG9hdChpdGVtKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudHlwZSA9IFZhbHVlVHlwZS52YXJpYWJsZTtcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSBpdGVtO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBldmFsdWF0ZSh2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBzdHJpbmcgfCBudW1iZXJ7XG4gICAgICAgIHJldHVybiB0aGlzLnR5cGUgPT09IFZhbHVlVHlwZS52YXJpYWJsZSA/IGlzTmFOKHZhcmlhYmxlc1t0aGlzLnZhbHVlXSkgPyB2YXJpYWJsZXNbdGhpcy52YWx1ZV0gOiBwYXJzZUZsb2F0KHZhcmlhYmxlc1t0aGlzLnZhbHVlXSkgOiB0aGlzLnZhbHVlO1xuICAgIH1cbn0iLCJlbnVtIFZhbHVlVHlwZSB7XG4gICAgc3RyaW5nLFxuICAgIG51bWJlcixcbiAgICB2YXJpYWJsZVxufVxuZXhwb3J0IGRlZmF1bHQgVmFsdWVUeXBlOyIsImltcG9ydCBJQWN0aW9uRGVmaW5pdGlvbiBmcm9tICcuL0lBY3Rpb25EZWZpbml0aW9uJztcbmltcG9ydCB7Q29uZGl0aW9ufSBmcm9tICcuLi9Db25kaXRpb25zJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuaW1wb3J0IENvbW1hbmQgZnJvbSAnLi4vQ29tbWFuZCc7XG5pbXBvcnQgU2NvcGUgZnJvbSAnLi4vU2NvcGUnO1xuLy8gRE8gTk9UIFBVVCBJTlNUQU5DRSBJVEVNUyBJTiBUSElTIENMQVNTLCBEVU1NWVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWN0aW9uIHtcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgZGVmaW5pdGlvbjogSUFjdGlvbkRlZmluaXRpb24pe1xuICAgICAgICBpZighZGVmaW5pdGlvbikgdGhyb3cgJ0F0dGVtcHRlZCB0byBpbnN0YXRpYXRlIGFjdGlvbiB3aXRob3V0IGEgZGVmaW5pdGlvbic7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBtYXRjaGVzKHN0YXRlbWVudDogc3RyaW5nKTogYm9vbGVhbntcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVmaW5pdGlvbi5yZWdleC50ZXN0KHN0YXRlbWVudCk7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBwYXJzZShjb21tYW5kOiBDb21tYW5kKXtcbiAgICAgICAgbGV0IGNvbmRpdGlvbjogQ29uZGl0aW9uO1xuICAgICAgICBmb3IoY29uZGl0aW9uIG9mIHRoaXMuZGVmaW5pdGlvbi5jb25kaXRpb25zKXtcbiAgICAgICAgICAgIGlmKGNvbmRpdGlvbi5tYXRjaGVzKGNvbW1hbmQuc3RhdGVtZW50KSkge1xuICAgICAgICAgICAgICAgIGNvbW1hbmQuY29uZGl0aW9uID0gY29uZGl0aW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBwZXJmb3JtKGNvbW1hbmQ6IENvbW1hbmQsIHByZXY/OiBDb21tYW5kKTogQ29tbWFuZCB7XG4gICAgICAgIHJldHVybiB0aGlzLmRlZmluaXRpb24ucnVsZShjb21tYW5kLCBwcmV2KTtcbiAgICB9XG59IiwiaW1wb3J0IEFjdGlvbiBmcm9tICcuL0FjdGlvbic7XG5pbXBvcnQge0NvbmRpdGlvbn0gZnJvbSAnLi4vQ29uZGl0aW9ucyc7XG5pbXBvcnQgQ29tbWFuZCBmcm9tICcuLi9Db21tYW5kJztcbmltcG9ydCBTY29wZSBmcm9tICcuLi9TY29wZSc7XG5cbmludGVyZmFjZSBJQWN0aW9uRGVmaW5pdGlvbiB7XG4gICAgcmVnZXg6IFJlZ0V4cDtcbiAgICBjb25kaXRpb25zOiBDb25kaXRpb25bXTtcbiAgICBkZXBlbmRlbnRzOiBBY3Rpb25bXTtcbiAgICB0ZXJtaW5hdG9yOiBib29sZWFuO1xuICAgIHJ1bGU6IChjb21tYW5kOiBDb21tYW5kLCBwcmV2PzogQ29tbWFuZCkgPT4gQ29tbWFuZDtcbn1cbmV4cG9ydCBkZWZhdWx0IElBY3Rpb25EZWZpbml0aW9uOyIsIlxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tbWFuZFJlc3VsdCB7XG4gICAgcHVibGljIGRlcGVuZGVudDogQ29tbWFuZFJlc3VsdDtcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgdGV4dDogc3RyaW5nLCBwdWJsaWMgcGFzc2VkPzogYm9vbGVhbil7fVxufSIsImltcG9ydCBQbGFjZWhvbGRlciBmcm9tICcuLi9QbGFjZWhvbGRlcnMnO1xuaW1wb3J0IENvbmRpdGlvblJlc3VsdCBmcm9tICcuL0NvbmRpdGlvblJlc3VsdCc7XG5pbXBvcnQgSUNvbmRpdGlvbkluZGljZXMgZnJvbSAnLi9JQ29uZGl0aW9uSW5kaWNlcyc7XG5pbXBvcnQgSUNvbmRpdGlvbkRlZmluaXRpb24gZnJvbSAnLi9JQ29uZGl0aW9uRGVmaW5pdGlvbic7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcbmltcG9ydCBDb21tYW5kIGZyb20gJy4uL0NvbW1hbmQnO1xuaW1wb3J0IHtNb2RpZmllcn0gZnJvbSAnLi4vTW9kaWZpZXJzJ1xuaW1wb3J0IFZhbHVlIGZyb20gJy4uL1ZhbHVlJztcbmltcG9ydCAnLi4vRXh0ZW5zaW9ucyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbmRpdGlvbiB7XG4gICAgcHJpdmF0ZSByZWdleDogUmVnRXhwO1xuICAgIHByaXZhdGUgaW5kaWNpZXM6IElDb25kaXRpb25JbmRpY2VzID0ge307XG4gICAgcHJpdmF0ZSB0ZW1wbGF0ZTogc3RyaW5nO1xuICAgIHByaXZhdGUgaXRlbXM6IEFycmF5PHN0cmluZyB8IE1vZGlmaWVyW10+O1xuICAgIHByaXZhdGUgcnVsZTogKHZhbHVlczogVmFsdWVbXSwgdmFyaWFibGVzOiBJVmFyaWFibGVzKSA9PiBib29sZWFuO1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgZGVmaW5pdGlvbjogSUNvbmRpdGlvbkRlZmluaXRpb24pe1xuICAgICAgICBpZighZGVmaW5pdGlvbikgdGhyb3cgJ0F0dGVtcHRlZCB0byBpbnN0YXRpYXRlIGNvbmRpdGlvbiB3aXRob3V0IGEgZGVmaW5pdGlvbic7XG4gICAgICAgIHRoaXMucmVnZXggPSB0aGlzLnRyYW5zbGF0ZSh0aGlzLmRlZmluaXRpb24pO1xuICAgICAgICB0aGlzLnRlbXBsYXRlID0gZGVmaW5pdGlvbi50ZW1wbGF0ZTtcbiAgICAgICAgdGhpcy5pdGVtcyA9IGRlZmluaXRpb24uaXRlbXM7XG4gICAgICAgIHRoaXMucnVsZSA9IGRlZmluaXRpb24ucnVsZTtcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSB0cmFuc2xhdGUoZGVmaW5pdGlvbjogSUNvbmRpdGlvbkRlZmluaXRpb24pOiBSZWdFeHB7XG4gICAgICAgIGxldCB0ZW1wbGF0ZSA9IGRlZmluaXRpb24udGVtcGxhdGUsIGl0ZW06IChzdHJpbmcgfCBNb2RpZmllcltdKSwgbmFtZTogc3RyaW5nLCBpZHg9MTtcbiAgICAgICAgZm9yKGl0ZW0gb2YgZGVmaW5pdGlvbi5pdGVtcyl7XG4gICAgICAgICAgICBpZighaXRlbSkgdGhyb3cgJ0ludmFsaWQgaXRlbSBpbiBpdGVtcyBkZWZpbml0aW9uJztcbiAgICAgICAgICAgIGlmKGl0ZW0gaW5zdGFuY2VvZiBBcnJheSkgbmFtZSA9ICdtb2RpZmllcic7XG4gICAgICAgICAgICBlbHNlIG5hbWUgPSA8c3RyaW5nPml0ZW07XG4gICAgICAgICAgICBsZXQgcGxhY2Vob2xkZXIgPSBQbGFjZWhvbGRlcihuYW1lKTtcbiAgICAgICAgICAgIHRlbXBsYXRlID0gdGVtcGxhdGUucmVwbGFjZShwbGFjZWhvbGRlci5sb2NhdG9yLCBwbGFjZWhvbGRlci5yZXBsYWNlbWVudChpdGVtIGluc3RhbmNlb2YgQXJyYXkgPyBpdGVtIDogbnVsbCkpO1xuICAgICAgICAgICAgaWYodGhpcy5pbmRpY2llc1tuYW1lXSBpbnN0YW5jZW9mIEFycmF5KSAoPG51bWJlcltdPnRoaXMuaW5kaWNpZXNbbmFtZV0pLnB1c2goaWR4KTtcbiAgICAgICAgICAgIGVsc2UgaWYoIWlzTmFOKDxhbnk+dGhpcy5pbmRpY2llc1tuYW1lXSkpIHtcbiAgICAgICAgICAgICAgICBsZXQgYXJyYXkgPSBbXTtcbiAgICAgICAgICAgICAgICBhcnJheS5wdXNoKHRoaXMuaW5kaWNpZXNbbmFtZV0pO1xuICAgICAgICAgICAgICAgIGFycmF5LnB1c2goaWR4KTtcbiAgICAgICAgICAgICAgICB0aGlzLmluZGljaWVzW25hbWVdID0gYXJyYXk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHRoaXMuaW5kaWNpZXNbbmFtZV0gPSBpZHg7XG4gICAgICAgICAgICB0aGlzLmluZGljaWVzW2lkeF0gPSBuYW1lO1xuICAgICAgICAgICAgaWR4Kys7XG4gICAgICAgIH1cbiAgICAgICAgdGVtcGxhdGUgPSB0ZW1wbGF0ZS5yZXBsYWNlKC9cXHMrL2csICcoPzpcXFxcYnxcXFxccyspJyk7XG4gICAgICAgIHJldHVybiBuZXcgUmVnRXhwKHRlbXBsYXRlLCAnaScpO1xuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIHBhcnNlKGNvbW1hbmQ6IENvbW1hbmQpOiBDb25kaXRpb25SZXN1bHQge1xuICAgICAgICBsZXQgcmVzdWx0ID0gbmV3IENvbmRpdGlvblJlc3VsdCgpLCBtYXRjaCA9IGNvbW1hbmQuc3RhdGVtZW50Lm1hdGNoKHRoaXMucmVnZXgpLCBpLCBtb2RpZmllcjogTW9kaWZpZXIsIG1vZE51bWJlcjogbnVtYmVyID0gLTE7XG4gICAgICAgIHJlc3VsdC5zdGF0ZW1lbnQgPSBtYXRjaFswXTtcbiAgICAgICAgZm9yKGk9MTtpPG1hdGNoLmxlbmd0aDtpKyspe1xuICAgICAgICAgICAgaWYodGhpcy5pdGVtc1tpLTFdIGluc3RhbmNlb2YgQXJyYXkpe1xuICAgICAgICAgICAgICAgIG1vZE51bWJlcisrO1xuICAgICAgICAgICAgICAgIGZvcihtb2RpZmllciBvZiA8TW9kaWZpZXJbXT50aGlzLml0ZW1zW2ktMV0pe1xuICAgICAgICAgICAgICAgICAgICBpZihtb2RpZmllci5tYXRjaGVzKG1hdGNoW2ldKSkgcmVzdWx0LnNldCg8c3RyaW5nPnRoaXMuaW5kaWNpZXNbaV0sIG1vZGlmaWVyLCBtb2ROdW1iZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgcmVzdWx0LnNldCg8c3RyaW5nPnRoaXMuaW5kaWNpZXNbaV0sIG1hdGNoW2ldKVxuICAgICAgICB9XG4gICAgICAgIHJlc3VsdC52YXJpYWJsZXMgPSBjb21tYW5kLnNjb3BlLnZhcmlhYmxlcztcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHBlcmZvcm0oY29tbWFuZDogQ29tbWFuZCk6IGJvb2xlYW57XG4gICAgICAgIGxldCBwYXJzZWQgPSB0aGlzLnBhcnNlKGNvbW1hbmQpO1xuICAgICAgICBwYXJzZWQucGFzcyA9IHRoaXMucnVsZShwYXJzZWQudmFsdWUsIHBhcnNlZC52YXJpYWJsZXMpO1xuICAgICAgICBsZXQgaW5kZXg6IG51bWJlcjtcbiAgICAgICAgZm9yKGluZGV4IG9mIHRoaXMuZGVmaW5pdGlvbi5tb2RPcmRlcil7XG4gICAgICAgICAgICBpZihwYXJzZWQubW9kaWZpZXJbaW5kZXhdKSBwYXJzZWQucGFzcyA9IHBhcnNlZC5tb2RpZmllcltpbmRleF0uZGVmaW5pdGlvbi5ydWxlKHBhcnNlZC5wYXNzLCBwYXJzZWQudmFsdWUsIHBhcnNlZC52YXJpYWJsZXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwYXJzZWQucGFzcztcbiAgICB9XG4gICAgXG4gICAgcHVibGljIG1hdGNoZXMoc3RhdGVtZW50OiBzdHJpbmcpe1xuICAgICAgICByZXR1cm4gdGhpcy5yZWdleC50ZXN0KHN0YXRlbWVudCk7XG4gICAgfVxufSIsImltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuaW1wb3J0IHtNb2RpZmllcn0gZnJvbSAnLi4vTW9kaWZpZXJzJztcbmltcG9ydCBWYWx1ZSBmcm9tICcuLi9WYWx1ZSc7XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb25kaXRpb25SZXN1bHQge1xuICAgIHB1YmxpYyBwYXNzOiBib29sZWFuO1xuICAgIHB1YmxpYyB2YWx1ZTogVmFsdWVbXSA9IFtdO1xuICAgIHB1YmxpYyB2YXJpYWJsZXM6IElWYXJpYWJsZXM7XG4gICAgcHVibGljIG1vZGlmaWVyOiBNb2RpZmllcltdID0gW107XG4gICAgcHVibGljIHN0YXRlbWVudDogc3RyaW5nO1xuICAgIHB1YmxpYyBzZXQocHJvcDogc3RyaW5nLCB2YWx1ZTogc3RyaW5nIHwgTW9kaWZpZXIsIGluZGV4PzogbnVtYmVyKXtcbiAgICAgICAgaWYodGhpc1twcm9wXSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICBpZihpbmRleCkgdGhpc1twcm9wXVtpbmRleF0gPSBwcm9wID09PSAndmFsdWUnID8gbmV3IFZhbHVlKHZhbHVlKSA6IHZhbHVlO1xuICAgICAgICAgICAgZWxzZSB0aGlzW3Byb3BdLnB1c2gocHJvcCA9PT0gJ3ZhbHVlJyA/IG5ldyBWYWx1ZSh2YWx1ZSkgOiB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB0aGlzW3Byb3BdID0gcHJvcCA9PT0gJ3ZhbHVlJyA/IG5ldyBWYWx1ZSh2YWx1ZSkgOiB2YWx1ZTtcbiAgICB9XG59IiwiaW1wb3J0IHtNb2RpZmllcn0gZnJvbSAnLi4vTW9kaWZpZXJzJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuaW1wb3J0IFZhbHVlIGZyb20gJy4uL1ZhbHVlJztcbmludGVyZmFjZSBJQ29uZGl0aW9uRGVmaW5pdGlvbiB7XG4gICAgdGVtcGxhdGU6IHN0cmluZztcbiAgICBpdGVtczogQXJyYXk8c3RyaW5nIHwgTW9kaWZpZXJbXT47XG4gICAgbW9kT3JkZXI6IG51bWJlcltdO1xuICAgIHJ1bGU6ICh2YWx1ZXM6IFZhbHVlW10sIHZhcmlhYmxlczogSVZhcmlhYmxlcykgPT4gYm9vbGVhbjtcbn1cbmV4cG9ydCBkZWZhdWx0IElDb25kaXRpb25EZWZpbml0aW9uOyIsImludGVyZmFjZSBJQ29uZGl0aW9uSW5kaWNlcyB7XG4gICAgW2tleTogc3RyaW5nXTogKG51bWJlcltdIHwgbnVtYmVyIHwgc3RyaW5nKTtcbiAgICBba2V5OiBudW1iZXJdOiBzdHJpbmcgfCBudW1iZXIgfCBudW1iZXJbXTtcbn1cbmV4cG9ydCBkZWZhdWx0IElDb25kaXRpb25JbmRpY2VzOyIsImltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuaW1wb3J0IFZhbHVlIGZyb20gJy4uL1ZhbHVlJztcblxuaW50ZXJmYWNlIElNb2RpZmllckRlZmluaXRpb24ge1xuICAgIGlkZW50aWZpZXJzOiBSZWdFeHBbXTtcbiAgICBydWxlOiAocGFzczogYm9vbGVhbiwgdmFsdWVzOiBWYWx1ZVtdLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpID0+IGJvb2xlYW47XG59XG5leHBvcnQgZGVmYXVsdCBJTW9kaWZpZXJEZWZpbml0aW9uOyIsImltcG9ydCBJTW9kaWZpZXJEZWZpbml0aW9uIGZyb20gJy4vSU1vZGlmaWVyRGVmaW5pdGlvbic7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW9kaWZpZXIge1xuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBkZWZpbml0aW9uOklNb2RpZmllckRlZmluaXRpb24pe1xuICAgICAgICBpZighZGVmaW5pdGlvbikgdGhyb3cgJ0F0dGVtcHRlZCB0byBpbnN0YXRpYXRlIG1vZGlmaWVyIHdpdGhvdXQgYSBkZWZpbml0aW9uJztcbiAgICB9XG4gICAgXG4gICAgcHVibGljIG1hdGNoZXModGV4dDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIGxldCBpZGVudGlmaWVyO1xuICAgICAgICBmb3IoaWRlbnRpZmllciBvZiB0aGlzLmRlZmluaXRpb24uaWRlbnRpZmllcnMpe1xuICAgICAgICAgICAgaWYoaWRlbnRpZmllci50ZXN0KHRleHQpKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufSIsImltcG9ydCB7UnVubmVyfSBmcm9tICcuLi9SdW5uZXJzJztcblxuaW50ZXJmYWNlIElQYXJzZXJEZWZpbml0aW9uIHtcbiAgICBydW5uZXJzOiBSdW5uZXJbXVxufVxuZXhwb3J0IGRlZmF1bHQgSVBhcnNlckRlZmluaXRpb247IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL0V4dGVuc2lvbnMudHNcIiAvPlxuaW1wb3J0IElQYXJzZXJEZWZpbml0aW9uIGZyb20gJy4vSVBhcnNlckRlZmluaXRpb24nO1xuaW1wb3J0IHtSdW5uZXIsIEFjdGlvblJ1bm5lcn0gZnJvbSAnLi4vUnVubmVycyc7XG5pbXBvcnQgQ29tbWFuZCBmcm9tICcuLi9Db21tYW5kJztcbmltcG9ydCBTY29wZSBmcm9tICcuLi9TY29wZSc7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcbkFycmF5LnByb3RvdHlwZS5sYXN0ID0gZnVuY3Rpb24oKXtcblx0cmV0dXJuIHRoaXNbdGhpcy5sZW5ndGgtMV07XG59XG4vKipcbiAqIFRoZSBTUWlnZ0wgcGFyc2VyXG4gKiBAbW9kdWxlIFBhcnNlclxuICogQGNsYXNzXG4gKiBAcGFyYW0ge3N0cmluZ30gc3FsICAgICAgICAgICAgICAtIFRoZSBTUWlnZ0wgcXVlcnkgdG8gcnVuIHRoZSBwYXJzZXIgYWdhaW5zdFxuICogQHBhcmFtIHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgICAgLSBBbnkgdmFyaWFibGVzIHBhc3NlZCB0byB0aGUgU1FpZ2dMIHBhcnNlclxuICogQHByb3BlcnR5IHtzdHJpbmd9IHNxbCAgICAgICAgICAgLSBUaGUgU1FpZ2dMIHF1ZXJ5IHRvIHJ1biB0aGUgcGFyc2VyIGFnYWluc3RcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlc30gdmFyaWFibGVzIC0gQW55IHZhcmlhYmxlcyBwYXNzZWQgdG8gdGhlIFNRaWdnTCBwYXJzZXJcbiAqIEBwcm9wZXJ0eSB7Q29tbWFuZFtdfSBjb21tYW5kcyAgIC0gQXJyYXkgb2YgY29tbWFuZHMgZm91bmQgaW4gdGhlIFNRaWdnTCBxdWVyeVxuICogQHByb3BlcnR5IHtDb21tYW5kW119IHN0YWNrICAgICAgLSBDb21tYW5kIHN0YWNrIGZvciBzdG9yaW5nIGN1cnJlbnQgcG9zaXRpb24gaW4gdGhlIHBhcnNpbmcgcHJvY2Vzc1xuICogQHByb3BlcnR5IHtzdHJpbmd9IGVycm9yICAgICAgICAgLSBFcnJvciBzdHJpbmcgaWYgYW55IGVycm9ycyBhcmUgZm91bmQgaW4gdGhlIHBhcnNpbmcgcHJvY2Vzc1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQYXJzZXIge1xuICAgIHB1YmxpYyByZWdleDogUmVnRXhwO1xuXHRwdWJsaWMgY29tbWFuZHM6IENvbW1hbmRbXSA9IFtdO1xuXHRwdWJsaWMgc3RhY2s6IENvbW1hbmRbXSA9IFtdO1xuICAgIHB1YmxpYyBlcnJvcjogc3RyaW5nW10gPSBbXTtcbiAgICBwdWJsaWMgc3FsOiBzdHJpbmc7XG5cdC8vIGNvbnN0cnVjdG9yKHB1YmxpYyBzcWw6IHN0cmluZywgcHVibGljIHZhcmlhYmxlczogSVZhcmlhYmxlcyl7XG5cdFx0Ly8gdGhpcy5jb21tYW5kcyA9IHRoaXMuZXh0cmFjdChzcWwsIHZhcmlhYmxlcyk7XG5cdFx0Ly8gdGhpcy52YXJpYWJsZXMgPSB2YXJpYWJsZXM7XG5cdC8vIH1cbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgZGVmaW5pdGlvbjogSVBhcnNlckRlZmluaXRpb24pe1xuICAgICAgICBpZighZGVmaW5pdGlvbikgdGhyb3cgJ0F0dGVtcHRlZCB0byBpbnN0YXRpYXRlIHBhcnNlciB3aXRob3V0IGEgZGVmaW5pdGlvbic7XG4gICAgICAgIHRoaXMucmVnZXggPSBuZXcgUmVnRXhwKGAoPzoke3RoaXMuZGVmaW5pdGlvbi5ydW5uZXJzLm1hcCh4ID0+IHguZGVmaW5pdGlvbi5yZWdleC5zb3VyY2UpLmpvaW4oJyl8KCcpfSlgLCAnZ20nKTtcbiAgICB9XG5cdC8qKlxuICAgICAqIEV4dHJhY3QgYW55IGNvbW1hbmRzIG91dCBvZiB0aGUgU1FpZ2dMIHF1ZXJ5IGFuZCBkZXRlcm1pbmUgdGhlaXIgb3JkZXIsIG5lc3RpbmcsIGFuZCB0eXBlXG4gICAgICogQG1lbWJlcm9mIFBhcnNlclxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHNxbCAgICAgICAgICAgICAgLSBTUWlnZ0wgcXVlcnkgdG8gZXh0cmFjdCBjb21tYW5kcyBmcm9tXG4gICAgICogQHBhcmFtIHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgICAgLSBBbnkgZ2xvYmFsIHZhcmlhYmxlcyBwYXNzZWQgaW4gdG8gU1FpZ2dMXG4gICAgICogQHJldHVybnMge0NvbW1hbmRbXX0gICAgICAgICAgICAgLSBBcnJheSBvZiBmdWxseSBwYXJzZWQgY29tbWFuZHMsIHJlYWR5IGZvciBleGVjdXRpb25cbiAgICAgKi9cblx0cHVibGljIHBhcnNlKHNxbDogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpe1xuXHQgICAgdGhpcy5jb21tYW5kcyA9IFtdO1xuICAgICAgICB0aGlzLnN0YWNrID0gW107XG4gICAgICAgIHRoaXMuc3FsID0gc3FsO1xuICAgICAgICBsZXQgbWF0Y2g7XG5cdFx0Ly8gQ29tbWFuZC5yZWdleC5sYXN0SW5kZXggPSAwO1xuXHRcdHdoaWxlKChtYXRjaCA9IHRoaXMucmVnZXguZXhlYyhzcWwpKSAhPSBudWxsKXtcbiAgICAgICAgICAgIGxldCBmb3VuZDogQ29tbWFuZCwgcnVubmVyOiBSdW5uZXI7XG4gICAgICAgICAgICBmb3IocnVubmVyIG9mIHRoaXMuZGVmaW5pdGlvbi5ydW5uZXJzKXtcbiAgICAgICAgICAgICAgICBpZihydW5uZXIubWF0Y2hlcyhtYXRjaFswXSkpe1xuICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IG5ldyBDb21tYW5kKG1hdGNoLmluZGV4LCBtYXRjaC5pbnB1dC5sZW5ndGgsIG1hdGNoWzFdLCBtYXRjaFsyXSwgbmV3IFNjb3BlKCksIHJ1bm5lcik7XG4gICAgICAgICAgICAgICAgICAgIGZvdW5kLnNjb3BlLnZhcmlhYmxlcyA9IHZhcmlhYmxlcztcbiAgICAgICAgICAgICAgICAgICAgcnVubmVyLnBhcnNlKGZvdW5kKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cdFx0XHRpZih0aGlzLnN0YWNrLmxlbmd0aCA+IDAgJiYgdGhpcy5zdGFjay5sYXN0KCkuYWN0aW9uLmRlZmluaXRpb24uZGVwZW5kZW50cy5jb250YWlucyhmb3VuZC5hY3Rpb24pKXtcbiAgICAgICAgICAgICAgICAvLyBmb3VuZC5hY3Rpb24uc3VwcG9ydGVyID0gc3RhY2subGFzdCgpO1xuXHRcdFx0XHR0aGlzLnN0YWNrLmxhc3QoKS5kZXBlbmRlbnRzLnB1c2goZm91bmQpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAodGhpcy5zdGFjay5sZW5ndGggPiAwICYmICF0aGlzLnN0YWNrLmxhc3QoKS5hY3Rpb24uZGVmaW5pdGlvbi50ZXJtaW5hdG9yKSB7XG5cdFx0XHRcdHRoaXMuc3RhY2sucHVzaChmb3VuZCk7XG5cdFx0XHRcdHRoaXMuc3RhY2subGFzdCgpLnNjb3BlLmNvbW1hbmRzLnB1c2goZm91bmQpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGlmKHRoaXMuc3RhY2subGVuZ3RoID4gMCAmJiB0aGlzLnN0YWNrLmxhc3QoKS5hY3Rpb24uZGVmaW5pdGlvbi50ZXJtaW5hdG9yKSB0aGlzLnN0YWNrLnBvcCgpO1xuXHRcdFx0XHR0aGlzLnN0YWNrLnB1c2goZm91bmQpO1xuXHRcdFx0XHR0aGlzLmNvbW1hbmRzLnB1c2goZm91bmQpO1xuXHRcdFx0fVxuICAgICAgICAgICAgLy8gbGV0IGVycm9yID0gZm91bmQuYWN0aW9uLnZhbGlkYXRlKCk7XG4gICAgICAgICAgICAvLyBpZihlcnJvcikgcmV0dXJuIFtdO1xuXHRcdH1cblx0XHQvLyByZXR1cm4gY29tbWFuZHM7XG5cdH1cblx0LyoqXG4gICAgICogUnVuIHRoZSBjb21tYW5kcyBhZ2FpbnN0IHRoZSBzdHJpbmcgYW5kIG91dHB1dCB0aGUgZW5kIHJlc3VsdFxuICAgICAqIEBtZW1iZXJvZiBQYXJzZXJcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBlbmQgcmVzdWx0IG9mIHJ1bm5pbmcgYWxsIGNvbW1hbmRzIGFnYWluc3QgdGhlIFNRaWdnTCBxdWVyeVxuICAgICAqL1xuXHRwdWJsaWMgcGVyZm9ybSgpOiBzdHJpbmcge1xuXHRcdHZhciBxdWVyeSA9ICcnLCBpbmRleCA9IDA7XG4gICAgICAgIGlmKHRoaXMuY29tbWFuZHMubGVuZ3RoID09PSAwKSByZXR1cm4gdGhpcy5zcWw7XG5cdFx0Zm9yKHZhciBjb21tYW5kIG9mIHRoaXMuY29tbWFuZHMpe1xuXHRcdFx0cXVlcnkgKz0gdGhpcy5zcWwuc2xpY2UoaW5kZXgsIGNvbW1hbmQuaW5kZXggLTEpO1xuXHRcdFx0cXVlcnkgKz0gY29tbWFuZC5wZXJmb3JtKGNvbW1hbmQpLnJlc3VsdC50ZXh0O1xuXHRcdFx0aW5kZXggKz0gY29tbWFuZC5sZW5ndGg7XG5cdFx0fVxuXHRcdHJldHVybiBxdWVyeTsgLy9UT0RPXG5cdH1cbn0iLCJpbXBvcnQge01vZGlmaWVyfSBmcm9tICcuLi9Nb2RpZmllcnMnO1xuaW50ZXJmYWNlIElQbGFjZWhvbGRlciB7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIGxvY2F0b3I6IFJlZ0V4cDtcbiAgICByZXBsYWNlbWVudDogKGl0ZW0/Ok1vZGlmaWVyW10pID0+IHN0cmluZztcbn1cbmV4cG9ydCBkZWZhdWx0IElQbGFjZWhvbGRlcjsiLCJpbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcblxuaW50ZXJmYWNlIElSZXBsYWNlckRlZmluaXRpb24ge1xuICAgIHJlZ2V4OiBSZWdFeHA7XG4gICAgcnVsZTogKGRlZmluaXRpb246IElSZXBsYWNlckRlZmluaXRpb24sIHRleHQ6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzKSA9PiBzdHJpbmc7XG59XG5leHBvcnQgZGVmYXVsdCBJUmVwbGFjZXJEZWZpbml0aW9uOyIsImltcG9ydCBJUmVwbGFjZXJEZWZpbml0aW9uIGZyb20gJy4vSVJlcGxhY2VyRGVmaW5pdGlvbic7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVwbGFjZXIgeyAgICBcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgZGVmaW5pdGlvbjogSVJlcGxhY2VyRGVmaW5pdGlvbil7XG4gICAgICAgIGlmKCFkZWZpbml0aW9uKSB0aHJvdyAnQXR0ZW1wdGVkIHRvIGluc3RhdGlhdGUgcmVwbGFjZXIgd2l0aG91dCBhIGRlZmluaXRpb24nO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgcmVwbGFjZSh0ZXh0OiBzdHJpbmcsIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IHN0cmluZ3tcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVmaW5pdGlvbi5ydWxlKHRoaXMuZGVmaW5pdGlvbiwgdGV4dCwgdmFyaWFibGVzKTtcbiAgICB9XG59IiwiaW1wb3J0IHtBY3Rpb259IGZyb20gJy4uL0FjdGlvbnMnO1xuaW1wb3J0IHtSZXBsYWNlcn0gZnJvbSAnLi4vUmVwbGFjZXJzJztcblxuaW50ZXJmYWNlIElSdW5uZXJEZWZpbml0aW9uIHtcbiAgICByZWdleDogUmVnRXhwO1xuICAgIGFjdGlvbnM6IEFjdGlvbltdO1xuICAgIHJlcGxhY2VyczogUmVwbGFjZXJbXTtcbn1cbmV4cG9ydCBkZWZhdWx0IElSdW5uZXJEZWZpbml0aW9uOyIsImltcG9ydCBJUnVubmVyRGVmaW5pdGlvbiBmcm9tICcuL0lSdW5uZXJEZWZpbml0aW9uJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuaW1wb3J0IFNjb3BlIGZyb20gJy4uL1Njb3BlJztcbmltcG9ydCB7QWN0aW9ufSBmcm9tICcuLi9BY3Rpb25zJztcbmltcG9ydCBDb21tYW5kIGZyb20gJy4uL0NvbW1hbmQnO1xuaW1wb3J0IHtSZXBsYWNlcn0gZnJvbSAnLi4vUmVwbGFjZXJzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUnVubmVyIHtcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgZGVmaW5pdGlvbjogSVJ1bm5lckRlZmluaXRpb24pe1xuICAgICAgICBpZighZGVmaW5pdGlvbikgdGhyb3cgJ0F0dGVtcHRlZCB0byBpbnN0YXRpYXRlIHJ1bm5lciB3aXRob3V0IGEgZGVmaW5pdGlvbic7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBwYXJzZShjb21tYW5kOiBDb21tYW5kKSB7XG4gICAgICAgIGxldCBhY3Rpb246IEFjdGlvbjtcbiAgICAgICAgZm9yKGFjdGlvbiBvZiB0aGlzLmRlZmluaXRpb24uYWN0aW9ucyl7XG4gICAgICAgICAgICBpZihhY3Rpb24ubWF0Y2hlcyhjb21tYW5kLnN0YXRlbWVudCkpIHtcbiAgICAgICAgICAgICAgICBjb21tYW5kLmFjdGlvbiA9IGFjdGlvbjtcbiAgICAgICAgICAgICAgICBjb21tYW5kLmFjdGlvbi5wYXJzZShjb21tYW5kKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgcGVyZm9ybShjb21tYW5kOiBDb21tYW5kLCBwcmV2PzogQ29tbWFuZCk6IENvbW1hbmQge1xuICAgICAgICBjb21tYW5kLnJlc3VsdCA9IGNvbW1hbmQuYWN0aW9uLnBlcmZvcm0oY29tbWFuZCwgcHJldikucmVzdWx0O1xuICAgICAgICAvLyBjb21tYW5kLnJlc3VsdC5kZXBlbmRlbnQgPSBjb21tYW5kLnNjb3BlLnBlcmZvcm0oY29tbWFuZCkucmVzdWx0O1xuICAgICAgICBsZXQgcmVwbGFjZXI6IFJlcGxhY2VyO1xuICAgICAgICBmb3IocmVwbGFjZXIgb2YgdGhpcy5kZWZpbml0aW9uLnJlcGxhY2Vycyl7XG4gICAgICAgICAgICBjb21tYW5kLnJlcGxhY2UocmVwbGFjZXIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb21tYW5kO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgbWF0Y2hlcyh0ZXh0OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgdGhpcy5kZWZpbml0aW9uLnJlZ2V4Lmxhc3RJbmRleCA9IDA7XG4gICAgICAgIHJldHVybiB0aGlzLmRlZmluaXRpb24ucmVnZXgudGVzdCh0ZXh0KTtcbiAgICB9XG59Il19
