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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQWN0aW9ucy50cyIsInNyYy9Db21tYW5kLnRzIiwic3JjL0NvbmRpdGlvbnMudHMiLCJzcmMvRXJyb3JzLnRzIiwic3JjL0V4dGVuc2lvbnMudHMiLCJzcmMvSVZhcmlhYmxlcy50cyIsInNyYy9NYWluLnRzIiwic3JjL01vZGlmaWVycy50cyIsInNyYy9QYXJzZXJzLnRzIiwic3JjL1BsYWNlaG9sZGVycy50cyIsInNyYy9SZXBsYWNlcnMudHMiLCJzcmMvUnVubmVycy50cyIsInNyYy9TUWlnZ0wudHMiLCJzcmMvU2NvcGUudHMiLCJzcmMvVmFsdWUudHMiLCJzcmMvVmFsdWVUeXBlLnRzIiwic3JjL2FjdGlvbnMvQWN0aW9uLnRzIiwic3JjL2FjdGlvbnMvSUFjdGlvbkRlZmluaXRpb24udHMiLCJzcmMvY29tbWFuZHMvQ29tbWFuZFJlc3VsdC50cyIsInNyYy9jb25kaXRpb25zL0NvbmRpdGlvbi50cyIsInNyYy9jb25kaXRpb25zL0NvbmRpdGlvblJlc3VsdC50cyIsInNyYy9jb25kaXRpb25zL0lDb25kaXRpb25EZWZpbml0aW9uLnRzIiwic3JjL2NvbmRpdGlvbnMvSUNvbmRpdGlvbkluZGljZXMudHMiLCJzcmMvbW9kaWZpZXJzL0lNb2RpZmllckRlZmluaXRpb24udHMiLCJzcmMvbW9kaWZpZXJzL01vZGlmaWVyLnRzIiwic3JjL3BhcnNlcnMvSVBhcnNlckRlZmluaXRpb24udHMiLCJzcmMvcGFyc2Vycy9QYXJzZXIudHMiLCJzcmMvcGxhY2Vob2xkZXJzL0lQbGFjZWhvbGRlci50cyIsInNyYy9yZXBsYWNlcnMvSVJlcGxhY2VyRGVmaW5pdGlvbi50cyIsInNyYy9yZXBsYWNlcnMvUmVwbGFjZXIudHMiLCJzcmMvcnVubmVycy9JUnVubmVyRGVmaW5pdGlvbi50cyIsInNyYy9ydW5uZXJzL1J1bm5lci50cyJdLCJuYW1l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QyxDQUFDO1lBQWxDLE1BQU0sU0FBQTtZQUNOLEVBQUUsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbkMsT0FBTyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7Z0JBQ3hCLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ2xDLENBQUM7U0FDSjtJQUNMLENBQUM7SUFFTSx3QkFBTyxHQUFkLFVBQWUsT0FBZ0IsRUFBRSxJQUFjO1FBQzNDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUM5RCxvRUFBb0U7UUFDcEUsSUFBSSxRQUFrQixDQUFDO1FBQ3ZCLEdBQUcsQ0FBQSxDQUFhLFVBQXlCLEVBQXpCLEtBQUEsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQXJDLGNBQVEsRUFBUixJQUFxQyxDQUFDO1lBQXRDLFFBQVEsU0FBQTtZQUNSLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDN0I7UUFDRCxNQUFNLENBQUMsT0FBTyxDQUFDO0lBQ25CLENBQUM7SUFFTSx3QkFBTyxHQUFkLFVBQWUsSUFBWTtRQUN2QixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQ3BDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUNMLGFBQUM7QUFBRCxDQTdCQSxBQTZCQyxJQUFBO0FBN0JELHdCQTZCQyxDQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBJQWN0aW9uRGVmaW5pdGlvbiBmcm9tICcuL2FjdGlvbnMvSUFjdGlvbkRlZmluaXRpb24nO1xuaW1wb3J0IENvbW1hbmRSZXN1bHQgZnJvbSAnLi9jb21tYW5kcy9Db21tYW5kUmVzdWx0JztcbmltcG9ydCBBY3Rpb24gZnJvbSAnLi9hY3Rpb25zL0FjdGlvbic7XG5pbXBvcnQgQ29tbWFuZCBmcm9tICcuL0NvbW1hbmQnO1xuaW1wb3J0IHtDb25kaXRpb24sIEVxdWFsLCBHcmVhdGVyVGhhbiwgTGVzc1RoYW4sIElzTnVsbCwgQWxwaGFiZXRpY2FsbHlHcmVhdGVyVGhhbiwgQWxwaGFiZXRpY2FsbHlMZXNzVGhhbiwgTGVuZ3RoR3JlYXRlclRoYW4sIExlbmd0aExlc3NUaGFuLCBJc05hTiwgQmV0d2Vlbn0gZnJvbSAnLi9Db25kaXRpb25zJztcbmltcG9ydCBTY29wZSBmcm9tICcuL1Njb3BlJztcblxubGV0IEVuZElmRGVmaW5pdGlvbjogSUFjdGlvbkRlZmluaXRpb24gPSB7XG4gICAgcmVnZXg6IC9eXFxzKmVuZGlmXFxiL2ksXG4gICAgY29uZGl0aW9uczogW10sXG4gICAgZGVwZW5kZW50czogW10sXG4gICAgdGVybWluYXRvcjogdHJ1ZSxcbiAgICBydWxlOiAoY29tbWFuZDogQ29tbWFuZCwgcHJldj86IENvbW1hbmQpOiBDb21tYW5kID0+IHtcbiAgICAgICAgY29tbWFuZC5yZXN1bHQgPSBuZXcgQ29tbWFuZFJlc3VsdChjb21tYW5kLmlubmVyLCB0cnVlKTtcbiAgICAgICAgcmV0dXJuIGNvbW1hbmQ7XG4gICAgfVxufTtcbmV4cG9ydCBsZXQgRW5kSWYgPSBuZXcgQWN0aW9uKEVuZElmRGVmaW5pdGlvbik7XG5cbmxldCBFbHNlRGVmaW5pdGlvbjogSUFjdGlvbkRlZmluaXRpb24gPSB7XG4gICAgcmVnZXg6IC9eXFxzKmVsc2VcXGIvaSxcbiAgICBjb25kaXRpb25zOiBbXSxcbiAgICBkZXBlbmRlbnRzOiBbXSxcbiAgICB0ZXJtaW5hdG9yOiBmYWxzZSxcbiAgICBydWxlOiAoY29tbWFuZDogQ29tbWFuZCwgcHJldj86IENvbW1hbmQpOiBDb21tYW5kID0+IHtcbiAgICAgICAgaWYoIXByZXYucmVzdWx0LnBhc3NlZCkgY29tbWFuZC5yZXN1bHQgPSBuZXcgQ29tbWFuZFJlc3VsdChjb21tYW5kLmlubmVyICsgY29tbWFuZC5zY29wZS5wZXJmb3JtKCksIHRydWUpO1xuICAgICAgICBlbHNlIGNvbW1hbmQucmVzdWx0ID0gbmV3IENvbW1hbmRSZXN1bHQoJycsIGZhbHNlKTtcbiAgICAgICAgcmV0dXJuIGNvbW1hbmQ7XG4gICAgfVxufTtcbmV4cG9ydCBsZXQgRWxzZSA9IG5ldyBBY3Rpb24oRWxzZURlZmluaXRpb24pO1xuXG5sZXQgSWZEZWZpbml0aW9uOiBJQWN0aW9uRGVmaW5pdGlvbiA9IHtcbiAgICByZWdleDogL15cXHMqaWZcXGIvaSxcbiAgICBjb25kaXRpb25zOiBbRXF1YWwsIEdyZWF0ZXJUaGFuLCBMZXNzVGhhbiwgSXNOdWxsLCBBbHBoYWJldGljYWxseUdyZWF0ZXJUaGFuLCBBbHBoYWJldGljYWxseUxlc3NUaGFuLCBMZW5ndGhHcmVhdGVyVGhhbiwgTGVuZ3RoTGVzc1RoYW4sIElzTmFOLCBCZXR3ZWVuXSxcbiAgICBkZXBlbmRlbnRzOiBbRWxzZSwgRW5kSWZdLFxuICAgIHRlcm1pbmF0b3I6IGZhbHNlLFxuICAgIHJ1bGU6IChjb21tYW5kOiBDb21tYW5kLCBwcmV2PzogQ29tbWFuZCk6IENvbW1hbmQgPT4ge1xuICAgICAgICBpZihjb21tYW5kLmNvbmRpdGlvbi5wZXJmb3JtKGNvbW1hbmQpKSB7XG4gICAgICAgICAgICBjb21tYW5kLnJlc3VsdCA9IG5ldyBDb21tYW5kUmVzdWx0KGNvbW1hbmQuaW5uZXIgKyBjb21tYW5kLnNjb3BlLnBlcmZvcm0oKSArIGNvbW1hbmQudGVybWluYXRlKCksIHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgY29tbWFuZC5yZXN1bHQgPSBuZXcgQ29tbWFuZFJlc3VsdChjb21tYW5kLmRlZmVyKGZhbHNlKSwgZmFsc2UpO1xuICAgICAgICByZXR1cm4gY29tbWFuZDtcbiAgICB9IFxufTtcbmV4cG9ydCBsZXQgSWYgPSBuZXcgQWN0aW9uKElmRGVmaW5pdGlvbik7XG5cbmxldCBFbmRVbmxlc3NEZWZpbml0aW9uOiBJQWN0aW9uRGVmaW5pdGlvbiA9IHtcbiAgICByZWdleDogL15cXHMqZW5kdW5sZXNzXFxiL2ksXG4gICAgY29uZGl0aW9uczogW10sXG4gICAgZGVwZW5kZW50czogW10sXG4gICAgdGVybWluYXRvcjogdHJ1ZSxcbiAgICBydWxlOiAoY29tbWFuZDogQ29tbWFuZCwgcHJldj86IENvbW1hbmQpOiBDb21tYW5kID0+IHtcbiAgICAgICAgY29tbWFuZC5yZXN1bHQgPSBuZXcgQ29tbWFuZFJlc3VsdChjb21tYW5kLmlubmVyLCB0cnVlKTtcbiAgICAgICAgcmV0dXJuIGNvbW1hbmQ7XG4gICAgfVxufVxuZXhwb3J0IGxldCBFbmRVbmxlc3MgPSBuZXcgQWN0aW9uKEVuZFVubGVzc0RlZmluaXRpb24pO1xuXG5sZXQgVW5sZXNzRGVmaW5pdGlvbjogSUFjdGlvbkRlZmluaXRpb24gPSB7XG4gICAgcmVnZXg6IC9eXFxzKnVubGVzc1xcYi9pLFxuICAgIGNvbmRpdGlvbnM6IFtFcXVhbCwgR3JlYXRlclRoYW4sIExlc3NUaGFuLCBJc051bGwsIEFscGhhYmV0aWNhbGx5R3JlYXRlclRoYW4sIEFscGhhYmV0aWNhbGx5TGVzc1RoYW4sIExlbmd0aEdyZWF0ZXJUaGFuLCBMZW5ndGhMZXNzVGhhbiwgSXNOYU4sIEJldHdlZW5dLFxuICAgIGRlcGVuZGVudHM6IFtFbHNlLCBFbmRVbmxlc3NdLFxuICAgIHRlcm1pbmF0b3I6IGZhbHNlLFxuICAgIHJ1bGU6IChjb21tYW5kOiBDb21tYW5kLCBwcmV2PzogQ29tbWFuZCk6IENvbW1hbmQgPT4ge1xuICAgICAgICBpZighY29tbWFuZC5jb25kaXRpb24ucGVyZm9ybShjb21tYW5kKSl7XG4gICAgICAgICAgICBjb21tYW5kLnJlc3VsdCA9IG5ldyBDb21tYW5kUmVzdWx0KGNvbW1hbmQuaW5uZXIgKyBjb21tYW5kLnNjb3BlLnBlcmZvcm0oKSArIGNvbW1hbmQudGVybWluYXRlKCksIHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgY29tbWFuZC5yZXN1bHQgPSBuZXcgQ29tbWFuZFJlc3VsdChjb21tYW5kLmRlZmVyKGZhbHNlKSwgZmFsc2UpO1xuICAgICAgICByZXR1cm4gY29tbWFuZDtcbiAgICB9XG59XG5leHBvcnQgbGV0IFVubGVzcyA9IG5ldyBBY3Rpb24oVW5sZXNzRGVmaW5pdGlvbik7XG5cbmV4cG9ydCB7ZGVmYXVsdCBhcyBJQWN0aW9uRGVmaW5pdGlvbn0gZnJvbSAnLi9hY3Rpb25zL0lBY3Rpb25EZWZpbml0aW9uJztcbmV4cG9ydCB7ZGVmYXVsdCBhcyBBY3Rpb259IGZyb20gJy4vYWN0aW9ucy9BY3Rpb24nOyIsImltcG9ydCB7UnVubmVyfSBmcm9tICcuL1J1bm5lcnMnO1xuaW1wb3J0IHtBY3Rpb259IGZyb20gJy4vQWN0aW9ucyc7XG5pbXBvcnQge0NvbmRpdGlvbn0gZnJvbSAnLi9Db25kaXRpb25zJztcbmltcG9ydCB7TW9kaWZpZXJ9IGZyb20gJy4vTW9kaWZpZXJzJztcbmltcG9ydCB7UmVwbGFjZXJ9IGZyb20gJy4vUmVwbGFjZXJzJztcbmltcG9ydCBDb21tYW5kUmVzdWx0IGZyb20gJy4vY29tbWFuZHMvQ29tbWFuZFJlc3VsdCc7XG5pbXBvcnQgU2NvcGUgZnJvbSAnLi9TY29wZSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbW1hbmQge1xuICAgIHB1YmxpYyBkZXBlbmRlbnRzOiBDb21tYW5kW10gPSBbXTtcbiAgICBwdWJsaWMgYWN0aW9uOiBBY3Rpb247XG4gICAgcHVibGljIGNvbmRpdGlvbjogQ29uZGl0aW9uO1xuICAgIHB1YmxpYyBtb2RpZmllcnM6IE1vZGlmaWVyW10gPSBbXTtcbiAgICBwdWJsaWMgcmVzdWx0OiBDb21tYW5kUmVzdWx0ID0gbmV3IENvbW1hbmRSZXN1bHQoJycsIGZhbHNlKTtcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgaW5kZXg6IG51bWJlciwgcHVibGljIGxlbmd0aDogbnVtYmVyLCBwdWJsaWMgc3RhdGVtZW50OiBzdHJpbmcsIHB1YmxpYyBpbm5lcjogc3RyaW5nLCBwdWJsaWMgc2NvcGU6IFNjb3BlLCBwcml2YXRlIHJ1bm5lcjogUnVubmVyKXtcbiAgICAgICAgbGV0IGFjdGlvbjogQWN0aW9uO1xuICAgICAgICBmb3IoYWN0aW9uIG9mIHJ1bm5lci5kZWZpbml0aW9uLmFjdGlvbnMpe1xuICAgICAgICAgICAgaWYoYWN0aW9uLm1hdGNoZXMoc3RhdGVtZW50KSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYWN0aW9uID0gYWN0aW9uO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBwZXJmb3JtKHByZXY/OiBDb21tYW5kKTogQ29tbWFuZCB7XG4gICAgICAgIHJldHVybiB0aGlzLnJ1bm5lci5wZXJmb3JtKHRoaXMsIHByZXYpO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgcmVwbGFjZShyZXBsYWNlcjogUmVwbGFjZXIpe1xuICAgICAgICB0aGlzLnJlc3VsdC50ZXh0ID0gcmVwbGFjZXIucmVwbGFjZSh0aGlzLnJlc3VsdC50ZXh0LCB0aGlzLnNjb3BlLnZhcmlhYmxlcyk7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBkZWZlcihwYXNzZWQ6IGJvb2xlYW4pOiBzdHJpbmcge1xuICAgICAgICBsZXQgZGVwZW5kZW50OkNvbW1hbmQsIHRleHQ6IHN0cmluZyA9ICcnO1xuICAgICAgICBmb3IoZGVwZW5kZW50IG9mIHRoaXMuZGVwZW5kZW50cyl7XG4gICAgICAgICAgICB0ZXh0ICs9IGRlcGVuZGVudC5wZXJmb3JtKHRoaXMpLnJlc3VsdC50ZXh0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0ZXh0O1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgdGVybWluYXRlKCk6IHN0cmluZ3tcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVwZW5kZW50cy5zb21lKGNvbW1hbmQgPT4gY29tbWFuZC5hY3Rpb24uZGVmaW5pdGlvbi50ZXJtaW5hdG9yKVxuXHRcdCAgPyB0aGlzLmRlcGVuZGVudHMuZmlsdGVyKGNvbW1hbmQgPT4gY29tbWFuZC5hY3Rpb24uZGVmaW5pdGlvbi50ZXJtaW5hdG9yKVswXS5wZXJmb3JtKCkucmVzdWx0LnRleHRcblx0XHQgIDogJyc7XG4gICAgfVxufSIsImltcG9ydCBJQ29uZGl0aW9uRGVmaW5pdGlvbiBmcm9tICcuL2NvbmRpdGlvbnMvSUNvbmRpdGlvbkRlZmluaXRpb24nO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi9JVmFyaWFibGVzJztcbmltcG9ydCBDb25kaXRpb24gZnJvbSAnLi9jb25kaXRpb25zL0NvbmRpdGlvbic7XG5pbXBvcnQge05vdCwgT3JFcXVhbCwgTGVuZ3RoT3JFcXVhbCwgQmV0d2Vlbk9yRXF1YWx9IGZyb20gJy4vTW9kaWZpZXJzJztcbmltcG9ydCBWYWx1ZSBmcm9tICcuL1ZhbHVlJztcbmxldCBFcXVhbERlZmluaXRpb246IElDb25kaXRpb25EZWZpbml0aW9uID0ge1xuICAgIHRlbXBsYXRlOiAnKHYpIChtKT0obSkgKHYpJyxcbiAgICBpdGVtczogWyd2YWx1ZScsIFtOb3QsIE9yRXF1YWxdLCBbT3JFcXVhbF0sICd2YWx1ZSddLFxuICAgIG1vZE9yZGVyOiBbMSwwXSxcbiAgICBydWxlOiAodmFsdWVzOiBWYWx1ZVtdLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBib29sZWFuID0+IHZhbHVlc1swXS5ldmFsdWF0ZSh2YXJpYWJsZXMpID09PSB2YWx1ZXNbMV0uZXZhbHVhdGUodmFyaWFibGVzKVxufVxuZXhwb3J0IGxldCBFcXVhbCA9IG5ldyBDb25kaXRpb24oRXF1YWxEZWZpbml0aW9uKTtcblxubGV0IEdyZWF0ZXJUaGFuRGVmaW5pdGlvbjogSUNvbmRpdGlvbkRlZmluaXRpb24gPSB7XG4gICAgdGVtcGxhdGU6ICcodikgKG0pPihtKSAodiknLFxuICAgIGl0ZW1zOiBbJ3ZhbHVlJywgW05vdF0sIFtPckVxdWFsXSwgJ3ZhbHVlJ10sXG4gICAgbW9kT3JkZXI6IFsxLDBdLFxuICAgIHJ1bGU6ICh2YWx1ZXM6IFZhbHVlW10sIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IGJvb2xlYW4gPT4gdmFsdWVzWzBdLmV2YWx1YXRlKHZhcmlhYmxlcykgPiB2YWx1ZXNbMV0uZXZhbHVhdGUodmFyaWFibGVzKVxufVxuZXhwb3J0IGxldCBHcmVhdGVyVGhhbiA9IG5ldyBDb25kaXRpb24oR3JlYXRlclRoYW5EZWZpbml0aW9uKTtcblxubGV0IExlc3NUaGFuRGVmaW5pdGlvbjogSUNvbmRpdGlvbkRlZmluaXRpb24gPSB7XG4gICAgdGVtcGxhdGU6ICcodikgKG0pPChtKSAodiknLFxuICAgIGl0ZW1zOiBbJ3ZhbHVlJywgW05vdF0sIFtPckVxdWFsXSwgJ3ZhbHVlJ10sXG4gICAgbW9kT3JkZXI6IFsxLDBdLFxuICAgIHJ1bGU6ICh2YWx1ZXM6IFZhbHVlW10sIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IGJvb2xlYW4gPT4gdmFsdWVzWzBdLmV2YWx1YXRlKHZhcmlhYmxlcykgPCB2YWx1ZXNbMV0uZXZhbHVhdGUodmFyaWFibGVzKVxufVxuZXhwb3J0IGxldCBMZXNzVGhhbiA9IG5ldyBDb25kaXRpb24oTGVzc1RoYW5EZWZpbml0aW9uKTtcblxubGV0IElzTnVsbERlZmluaXRpb246IElDb25kaXRpb25EZWZpbml0aW9uID0ge1xuICAgIHRlbXBsYXRlOiAnKHYpIGlzIChtKSBudWxsJyxcbiAgICBpdGVtczogWyd2YWx1ZScsIFtOb3RdXSxcbiAgICBtb2RPcmRlcjogWzBdLFxuICAgIHJ1bGU6ICh2YWx1ZXM6IFZhbHVlW10sIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IGJvb2xlYW4gPT4gdmFsdWVzWzBdLmV2YWx1YXRlKHZhcmlhYmxlcykgPT0gbnVsbFxufVxuZXhwb3J0IGxldCBJc051bGwgPSBuZXcgQ29uZGl0aW9uKElzTnVsbERlZmluaXRpb24pO1xuXG5sZXQgQWxwaGFiZXRpY2FsbHlHcmVhdGVyVGhhbkRlZmluaXRpb246IElDb25kaXRpb25EZWZpbml0aW9uID0ge1xuICAgIHRlbXBsYXRlOiAnKHYpIChtKWFiYz4obSkgKHYpJyxcbiAgICBpdGVtczogWyd2YWx1ZScsIFtOb3RdLCBbT3JFcXVhbF0sICd2YWx1ZSddLFxuICAgIG1vZE9yZGVyOiBbMSwwXSxcbiAgICBydWxlOiAodmFsdWVzOiBWYWx1ZVtdLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBib29sZWFuID0+IFt2YWx1ZXNbMF0uZXZhbHVhdGUodmFyaWFibGVzKSwgdmFsdWVzWzFdLmV2YWx1YXRlKHZhcmlhYmxlcyldLnNvcnQoKS5pbmRleE9mKHZhbHVlc1swXS5ldmFsdWF0ZSh2YXJpYWJsZXMpKSA+IDBcbn1cbmV4cG9ydCBsZXQgQWxwaGFiZXRpY2FsbHlHcmVhdGVyVGhhbiA9IG5ldyBDb25kaXRpb24oQWxwaGFiZXRpY2FsbHlHcmVhdGVyVGhhbkRlZmluaXRpb24pO1xuXG5sZXQgQWxwaGFiZXRpY2FsbHlMZXNzVGhhbkRlZmluaXRpb246IElDb25kaXRpb25EZWZpbml0aW9uID0ge1xuICAgIHRlbXBsYXRlOiAnKHYpIChtKWFiYzwobSkgKHYpJyxcbiAgICBpdGVtczogWyd2YWx1ZScsIFtOb3RdLCBbT3JFcXVhbF0sICd2YWx1ZSddLFxuICAgIG1vZE9yZGVyOiBbMSwwXSxcbiAgICBydWxlOiAodmFsdWVzOiBWYWx1ZVtdLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBib29sZWFuID0+IHZhbHVlc1swXS5ldmFsdWF0ZSh2YXJpYWJsZXMpID09PSB2YWx1ZXNbMV0uZXZhbHVhdGUodmFyaWFibGVzKSA/IGZhbHNlIDogW3ZhbHVlc1swXS5ldmFsdWF0ZSh2YXJpYWJsZXMpLCB2YWx1ZXNbMV0uZXZhbHVhdGUodmFyaWFibGVzKV0uc29ydCgpLmluZGV4T2YodmFsdWVzWzBdLmV2YWx1YXRlKHZhcmlhYmxlcykpID09PSAwXG59XG5leHBvcnQgbGV0IEFscGhhYmV0aWNhbGx5TGVzc1RoYW4gPSBuZXcgQ29uZGl0aW9uKEFscGhhYmV0aWNhbGx5TGVzc1RoYW5EZWZpbml0aW9uKTtcblxubGV0IExlbmd0aEdyZWF0ZXJUaGFuRGVmaW5pdGlvbjogSUNvbmRpdGlvbkRlZmluaXRpb24gPSB7XG4gICAgdGVtcGxhdGU6ICcodikgKG0pbGVuPihtKSAodiknLFxuICAgIGl0ZW1zOiBbJ3ZhbHVlJywgW05vdF0sIFtMZW5ndGhPckVxdWFsXSwgJ3ZhbHVlJ10sXG4gICAgbW9kT3JkZXI6IFsxLDBdLFxuICAgIHJ1bGU6ICh2YWx1ZXM6IFZhbHVlW10sIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IGJvb2xlYW4gPT4gKDxzdHJpbmc+dmFsdWVzWzBdLmV2YWx1YXRlKHZhcmlhYmxlcykpLmxlbmd0aCA+IHZhbHVlc1sxXS5ldmFsdWF0ZSh2YXJpYWJsZXMpXG59XG5leHBvcnQgbGV0IExlbmd0aEdyZWF0ZXJUaGFuID0gbmV3IENvbmRpdGlvbihMZW5ndGhHcmVhdGVyVGhhbkRlZmluaXRpb24pO1xuXG5sZXQgTGVuZ3RoTGVzc1RoYW5EZWZpbml0aW9uOiBJQ29uZGl0aW9uRGVmaW5pdGlvbiA9IHtcbiAgICB0ZW1wbGF0ZTogJyh2KSAobSlsZW48KG0pICh2KScsXG4gICAgaXRlbXM6IFsndmFsdWUnLCBbTm90XSwgW0xlbmd0aE9yRXF1YWxdLCAndmFsdWUnXSxcbiAgICBtb2RPcmRlcjogWzEsMF0sXG4gICAgcnVsZTogKHZhbHVlczogVmFsdWVbXSwgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogYm9vbGVhbiA9PiAoPHN0cmluZz52YWx1ZXNbMF0uZXZhbHVhdGUodmFyaWFibGVzKSkubGVuZ3RoIDwgdmFsdWVzWzFdLmV2YWx1YXRlKHZhcmlhYmxlcylcbn1cbmV4cG9ydCBsZXQgTGVuZ3RoTGVzc1RoYW4gPSBuZXcgQ29uZGl0aW9uKExlbmd0aExlc3NUaGFuRGVmaW5pdGlvbik7XG5cbmxldCBJc05hTkRlZmluaXRpb246IElDb25kaXRpb25EZWZpbml0aW9uID0ge1xuICAgIHRlbXBsYXRlOiAnKHYpIGlzIChtKU5hTicsXG4gICAgaXRlbXM6IFsndmFsdWUnLCBbTm90XV0sXG4gICAgbW9kT3JkZXI6IFswXSxcbiAgICBydWxlOiAodmFsdWVzOiBWYWx1ZVtdLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBib29sZWFuID0+IGlzTmFOKCg8bnVtYmVyPnZhbHVlc1swXS5ldmFsdWF0ZSh2YXJpYWJsZXMpKSlcbn1cbmV4cG9ydCBsZXQgSXNOYU4gPSBuZXcgQ29uZGl0aW9uKElzTmFORGVmaW5pdGlvbik7XG5cbmxldCBCZXR3ZWVuRGVmaW5pdGlvbjogSUNvbmRpdGlvbkRlZmluaXRpb24gPSB7XG4gICAgdGVtcGxhdGU6ICcodikgKHYpPihtKTwodiknLFxuICAgIGl0ZW1zOiBbJ3ZhbHVlJywgJ3ZhbHVlJywgW05vdCwgQmV0d2Vlbk9yRXF1YWxdLCAndmFsdWUnXSxcbiAgICBtb2RPcmRlcjogWzBdLFxuICAgIHJ1bGU6ICh2YWx1ZXM6IFZhbHVlW10sIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IGJvb2xlYW4gPT4gdmFsdWVzWzFdLmV2YWx1YXRlKHZhcmlhYmxlcykgPCB2YWx1ZXNbMF0uZXZhbHVhdGUodmFyaWFibGVzKSAmJiB2YWx1ZXNbMl0uZXZhbHVhdGUodmFyaWFibGVzKSA+IHZhbHVlc1swXS5ldmFsdWF0ZSh2YXJpYWJsZXMpIFxufVxuZXhwb3J0IGxldCBCZXR3ZWVuID0gbmV3IENvbmRpdGlvbihCZXR3ZWVuRGVmaW5pdGlvbik7XG5cbmV4cG9ydCB7ZGVmYXVsdCBhcyBDb25kaXRpb259IGZyb20gJy4vY29uZGl0aW9ucy9Db25kaXRpb24nO1xuIiwiLy8gaW1wb3J0IElBY3Rpb24gZnJvbSAnYWN0aW9ucy9JQWN0aW9uJztcbi8vIC8qKlxuLy8gICogTW9kdWxlIG9mIGVycm9yIGNoZWNrZXJzXG4vLyAgKiBAbW9kdWxlIEVycm9yc1xuLy8gICogQGNsYXNzXG4vLyAgKiBAc3RhdGljXG4vLyAgKi9cbi8vIGV4cG9ydCBkZWZhdWx0IGNsYXNzIEVycm9ycyB7XG4vLyAgICAgLyoqXG4vLyAgICAgICogQG1lbWJlcm9mIEVycm9yc1xuLy8gICAgICAqIEBtZXRob2Rcbi8vICAgICAgKiBAc3RhdGljXG4vLyAgICAgICogQHBhcmFtIHtJQWN0aW9ufSBhY3Rpb24gICAgICAtIEFjdGlvbiB0byBjaGVjayBmb3IgYW4gSW5jb3JyZWN0IFN0YXRlbWVudCBlcnJvclxuLy8gICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZW1lbnQgICAgLSBTdGF0ZW1lbnQgdG8gY2hlY2sgZm9yIGEgSW5jb3JyZWN0IFN0YXRlbWVudCBlcnJvclxuLy8gICAgICAqIEByZXR1cm5zIHtzdHJpbmcgfCBudWxsfSAgICAgLSBUaGUgZXJyb3IgbWVzc2FnZSBpZiBhbnksIG90aGVyd2lzZSBudWxsIFxuLy8gICAgICAqL1xuLy8gICAgIHB1YmxpYyBzdGF0aWMgSW5jb3JyZWN0U3RhdGVtZW50KGFjdGlvbjogSUFjdGlvbiwgc3RhdGVtZW50OiBzdHJpbmcpOiBzdHJpbmd7XG4vLyAgICAgICAgIGNvbnN0IGFjdGlvbnM6c3RyaW5nID0gYWN0aW9uLmNvbW1hbmQuYWN0aW9ucy5maWx0ZXIoeCA9PiB4LmRlcGVuZGVudHMuc29tZSh5ID0+IGFjdGlvbiBpbnN0YW5jZW9mIHkpKS5tYXAoeCA9PiB4Lm5hbWUpLmpvaW4oJywgJyk7XG4vLyAgICAgICAgIGNvbnN0IGVycm9yOiBzdHJpbmcgPSBgSW5jb3JyZWN0IHN0YXRlbWVudCBmb3VuZCBhdCBcIiR7c3RhdGVtZW50fVwiLiAke2FjdGlvbi5jb25zdHJ1Y3RvclsnbmFtZSddfSBtdXN0IGZvbGxvdyAke2FjdGlvbnN9YFxuLy8gICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbi8vICAgICAgICAgcmV0dXJuIGVycm9yO1xuLy8gICAgIH1cbi8vIH0iLCJpbnRlcmZhY2UgQXJyYXk8VD57XG5cdGxhc3QoKTogVDtcbiAgICBpc0Z1bGwoKTogYm9vbGVhbjtcbiAgICBjb250YWlucyhUKTogYm9vbGVhbjtcbn1cbkFycmF5LnByb3RvdHlwZS5sYXN0ID0gZnVuY3Rpb24oKXtcblx0cmV0dXJuIHRoaXNbdGhpcy5sZW5ndGgtMV07XG59XG5cbkFycmF5LnByb3RvdHlwZS5pc0Z1bGwgPSBmdW5jdGlvbigpe1xuICAgIGZvcihsZXQgaT0wO2k8dGhpcy5sZW5ndGg7aSsrKXtcbiAgICAgICAgaWYoaSA9PSBudWxsKSByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuXG5BcnJheS5wcm90b3R5cGUuY29udGFpbnMgPSBmdW5jdGlvbihUKXtcbiAgICByZXR1cm4gdGhpcy5zb21lKHggPT4geCA9PT0gVCk7XG59IiwiaW50ZXJmYWNlIElWYXJpYWJsZXMge1xuXHRba2V5OiBzdHJpbmddOiBhbnk7XG59XG5leHBvcnQgZGVmYXVsdCBJVmFyaWFibGVzOyIsImltcG9ydCB7U1FpZ2dMUGFyc2VyfSBmcm9tICcuL1BhcnNlcnMnO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi9JVmFyaWFibGVzJztcbi8qKlxuICogVGhlIHN0YXJ0aW5nIHBvaW50IG9mIHRoZSBlbnRpcmUgU1FpZ2dMIHBhcnNlclxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gc3FsICAgICAgICAgICAgICAtIFRoZSBTUUwgcXVlcnkgdG8gcnVuIFNRaWdnTCBhZ2FpbnN0XG4gKiBAcGFyYW0ge0lWYXJpYWJsZXM/fSB2YXJpYWJsZXMgICAtIE9wdGlvbmFsIGNvbGxlY3Rpb24gb2YgdmFyaWFibGVzIGZvciB5b3VyIFNRaWdnTCBxdWVyeVxuICogQHJldHVybiB7c3RyaW5nfSAgICAgICAgICAgICAgICAgLSBUaGUgZnVsbHkgcGFyc2VkIFNRTCBxdWVyeVxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2Uoc3FsOiBzdHJpbmcsIHZhcmlhYmxlcz86IElWYXJpYWJsZXMpOiBzdHJpbmd7XG5cdFNRaWdnTFBhcnNlci5wYXJzZShzcWwsIHZhcmlhYmxlcyk7XG4gICAgcmV0dXJuIFNRaWdnTFBhcnNlci5wZXJmb3JtKCk7XG59IiwiaW1wb3J0IElNb2RpZmllckRlZmluaXRpb24gZnJvbSAnLi9tb2RpZmllcnMvSU1vZGlmaWVyRGVmaW5pdGlvbic7XG5pbXBvcnQgTW9kaWZpZXIgZnJvbSAnLi9tb2RpZmllcnMvTW9kaWZpZXInO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi9JVmFyaWFibGVzJztcbmltcG9ydCBWYWx1ZSBmcm9tICcuL1ZhbHVlJztcblxubGV0IE5vdERlZmluaXRpb246IElNb2RpZmllckRlZmluaXRpb24gPSB7XG4gICAgaWRlbnRpZmllcnM6IFsvIS9pLCAvKD86XFxifFxccyspbm90KD86XFxifFxccyspL2ldLFxuICAgIHJ1bGU6IChwYXNzOiBib29sZWFuLCB2YWx1ZXM6IFZhbHVlW10sIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IGJvb2xlYW4gPT4gIXBhc3Ncbn1cbmV4cG9ydCBsZXQgTm90ID0gbmV3IE1vZGlmaWVyKE5vdERlZmluaXRpb24pO1xuXG5sZXQgT3JFcXVhbERlZmluaXRpb246IElNb2RpZmllckRlZmluaXRpb24gPSB7XG4gICAgaWRlbnRpZmllcnM6IFsvPS9pXSxcbiAgICBydWxlOiAocGFzczogYm9vbGVhbiwgdmFsdWVzOiBWYWx1ZVtdLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBib29sZWFuID0+IHBhc3MgfHwgdmFsdWVzWzBdLmV2YWx1YXRlKHZhcmlhYmxlcykgPT09IHZhbHVlc1sxXS5ldmFsdWF0ZSh2YXJpYWJsZXMpXG59XG5leHBvcnQgbGV0IE9yRXF1YWwgPSBuZXcgTW9kaWZpZXIoT3JFcXVhbERlZmluaXRpb24pO1xuXG5sZXQgTGVuZ3RoT3JFcXVhbERlZmluaXRpb246IElNb2RpZmllckRlZmluaXRpb24gPSB7XG4gICAgaWRlbnRpZmllcnM6IFsvPS9pXSxcbiAgICBydWxlOiAocGFzczogYm9vbGVhbiwgdmFsdWVzOiBWYWx1ZVtdLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBib29sZWFuID0+IHBhc3MgfHwgKDxzdHJpbmc+dmFsdWVzWzBdLmV2YWx1YXRlKHZhcmlhYmxlcykpLmxlbmd0aCA9PT0gdmFsdWVzWzFdLmV2YWx1YXRlKHZhcmlhYmxlcylcbn1cbmV4cG9ydCBsZXQgTGVuZ3RoT3JFcXVhbCA9IG5ldyBNb2RpZmllcihMZW5ndGhPckVxdWFsRGVmaW5pdGlvbik7XG5cbmxldCBCZXR3ZWVuT3JFcXVhbERlZmluaXRpb246IElNb2RpZmllckRlZmluaXRpb24gPSB7XG4gICAgaWRlbnRpZmllcnM6IFsvPS9pXSxcbiAgICBydWxlOiAocGFzczogYm9vbGVhbiwgdmFsdWVzOiBWYWx1ZVtdLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBib29sZWFuID0+IHBhc3MgfHwgdmFsdWVzWzBdLmV2YWx1YXRlKHZhcmlhYmxlcykgPT09IHZhbHVlc1sxXS5ldmFsdWF0ZSh2YXJpYWJsZXMpIHx8IHZhbHVlc1swXS5ldmFsdWF0ZSh2YXJpYWJsZXMpID09PSB2YWx1ZXNbMl0uZXZhbHVhdGUodmFyaWFibGVzKVxufVxuZXhwb3J0IGxldCBCZXR3ZWVuT3JFcXVhbCA9IG5ldyBNb2RpZmllcihCZXR3ZWVuT3JFcXVhbERlZmluaXRpb24pO1xuXG5leHBvcnQge2RlZmF1bHQgYXMgSU1vZGlmaWVyRGVmaW5pdGlvbn0gZnJvbSAnLi9tb2RpZmllcnMvSU1vZGlmaWVyRGVmaW5pdGlvbic7XG5leHBvcnQge2RlZmF1bHQgYXMgTW9kaWZpZXJ9IGZyb20gJy4vbW9kaWZpZXJzL01vZGlmaWVyJzsgIiwiaW1wb3J0IElQYXJzZXJEZWZpbml0aW9uIGZyb20gJy4vcGFyc2Vycy9JUGFyc2VyRGVmaW5pdGlvbic7XG5pbXBvcnQgUGFyc2VyIGZyb20gJy4vcGFyc2Vycy9QYXJzZXInO1xuaW1wb3J0IHtSdW5uZXIsIEFjdGlvblJ1bm5lcn0gZnJvbSAnLi9SdW5uZXJzJztcblxubGV0IFNRaWdnTFBhcnNlckRlZmluaXRpb246IElQYXJzZXJEZWZpbml0aW9uID0ge1xuICAgIHJ1bm5lcnM6IFtBY3Rpb25SdW5uZXJdXG59XG5leHBvcnQgbGV0IFNRaWdnTFBhcnNlciA9IG5ldyBQYXJzZXIoU1FpZ2dMUGFyc2VyRGVmaW5pdGlvbik7IFxuXG5leHBvcnQge2RlZmF1bHQgYXMgSVBhcnNlckRlZmluaXRpb259IGZyb20gJy4vcGFyc2Vycy9JUGFyc2VyRGVmaW5pdGlvbic7IiwiaW1wb3J0IElQbGFjZWhvbGRlciBmcm9tICcuL3BsYWNlaG9sZGVycy9JUGxhY2Vob2xkZXInO1xuaW1wb3J0IHtNb2RpZmllcn0gZnJvbSAnLi9Nb2RpZmllcnMnO1xuZXhwb3J0IGxldCBQbGFjZWhvbGRlcnM6IElQbGFjZWhvbGRlcltdID0gW1xuICAgIHtcbiAgICAgICAgbmFtZTogJ3ZhbHVlJyxcbiAgICAgICAgbG9jYXRvcjogL1xcKHZcXCkvaSxcbiAgICAgICAgcmVwbGFjZW1lbnQ6ICgpID0+IGAoKD86XCJ8Jyk/W1xcXFx3XFxcXGRdKyg/OlwifCcpPylgXG4gICAgfSxcbiAgICB7XG4gICAgICAgIG5hbWU6ICdtb2RpZmllcicsXG4gICAgICAgIGxvY2F0b3I6IC9cXChtXFwpL2ksXG4gICAgICAgIHJlcGxhY2VtZW50OiAoaXRlbT86IE1vZGlmaWVyW10pID0+IGAoKD86JHtpdGVtLm1hcChtb2RpZmllciA9PiBtb2RpZmllci5kZWZpbml0aW9uLmlkZW50aWZpZXJzLm1hcChpZGVudGlmaWVyID0+IGlkZW50aWZpZXIuc291cmNlKS5qb2luKCd8JykpLmpvaW4oJ3wnKX18XFxcXHMqKSlgXG4gICAgfVxuXTtcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFBsYWNlaG9sZGVyKG5hbWU6IHN0cmluZyl7XG4gICAgcmV0dXJuIFBsYWNlaG9sZGVycy5maWx0ZXIoeCA9PiB4Lm5hbWUgPT09IG5hbWUpWzBdO1xufSIsImltcG9ydCBJUmVwbGFjZXJEZWZpbml0aW9uIGZyb20gJy4vcmVwbGFjZXJzL0lSZXBsYWNlckRlZmluaXRpb24nO1xuaW1wb3J0IFJlcGxhY2VyIGZyb20gJy4vcmVwbGFjZXJzL1JlcGxhY2VyJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4vSVZhcmlhYmxlcyc7XG5cbmxldCBWYXJpYWJsZURlZmluaXRpb246IElSZXBsYWNlckRlZmluaXRpb24gPSB7XG4gICAgcmVnZXg6IC8oW157XXxeKXt7KD8heylcXHMqKFxcdyopXFxzKn19KD8hfSkvZyxcbiAgICBydWxlOiAoZGVmaW5pdGlvbjogSVJlcGxhY2VyRGVmaW5pdGlvbiwgdGV4dDogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBzdHJpbmcgPT4gdGV4dC5yZXBsYWNlKGRlZmluaXRpb24ucmVnZXgsIChtYXRjaCwgJDEsICQyKSA9PiAkMSt2YXJpYWJsZXNbJDJdKVxufVxuZXhwb3J0IGxldCBWYXJpYWJsZSA9IG5ldyBSZXBsYWNlcihWYXJpYWJsZURlZmluaXRpb24pO1xuXG5leHBvcnQge2RlZmF1bHQgYXMgSVJlcGxhY2VyRGVmaW5pdGlvbn0gZnJvbSAnLi9yZXBsYWNlcnMvSVJlcGxhY2VyRGVmaW5pdGlvbic7XG5leHBvcnQge2RlZmF1bHQgYXMgUmVwbGFjZXJ9IGZyb20gJy4vcmVwbGFjZXJzL1JlcGxhY2VyJzsiLCJpbXBvcnQgSVJ1bm5lckRlZmluaXRpb24gZnJvbSAnLi9ydW5uZXJzL0lSdW5uZXJEZWZpbml0aW9uJztcbmltcG9ydCBSdW5uZXIgZnJvbSAnLi9ydW5uZXJzL1J1bm5lcic7XG5pbXBvcnQge0FjdGlvbiwgSWYsIEVsc2UsIEVuZElmLCBVbmxlc3MsIEVuZFVubGVzc30gZnJvbSAnLi9BY3Rpb25zJztcbmltcG9ydCB7UmVwbGFjZXIsIFZhcmlhYmxlfSBmcm9tICcuL1JlcGxhY2Vycyc7XG5cbmxldCBBY3Rpb25SdW5uZXJEZWZpbml0aW9uOiBJUnVubmVyRGVmaW5pdGlvbiA9IHtcbiAgICByZWdleDogL3t7JSguKj8pJX19KFtcXHNcXFNdKj8pPyg/PSg/Ont7JXwkKSkvZ20sXG4gICAgYWN0aW9uczogW0lmLCBFbHNlLCBFbmRJZiwgVW5sZXNzLCBFbmRVbmxlc3NdLFxuICAgIHJlcGxhY2VyczogW1ZhcmlhYmxlXVxufVxuZXhwb3J0IGxldCBBY3Rpb25SdW5uZXIgPSBuZXcgUnVubmVyKEFjdGlvblJ1bm5lckRlZmluaXRpb24pO1xuXG5leHBvcnQge2RlZmF1bHQgYXMgSVJ1bm5lckRlZmluaXRpb259IGZyb20gJy4vcnVubmVycy9JUnVubmVyRGVmaW5pdGlvbic7XG5leHBvcnQge2RlZmF1bHQgYXMgUnVubmVyfSBmcm9tICcuL3J1bm5lcnMvUnVubmVyJzsiLCJpbXBvcnQge3BhcnNlIGFzIFBhcnNlfSBmcm9tICcuL01haW4nO1xubGV0IFNRaWdnTCA9IHtcbiAgICBwYXJzZTogUGFyc2UsXG4gICAgdmVyc2lvbjogJzAuMS4wJyxcbiAgICAvL2V4dGVuZDogRXh0ZW5kXG59O1xuaWYodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHdpbmRvd1snU1FpZ2dMJ10gPSBTUWlnZ0w7XG5leHBvcnQgZGVmYXVsdCBTUWlnZ0w7IiwiaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi9JVmFyaWFibGVzJztcbmltcG9ydCBDb21tYW5kIGZyb20gJy4vQ29tbWFuZCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNjb3BlIHtcblx0cHVibGljIHZhcmlhYmxlczogSVZhcmlhYmxlcyA9IHt9O1xuXHRwdWJsaWMgY29tbWFuZHM6IENvbW1hbmRbXSA9IFtdO1xuXHRwdWJsaWMgZGVwZW5kZW50czogQ29tbWFuZFtdID0gW107XG4gICAgXG4gICAgcHVibGljIHBlcmZvcm0oKTogc3RyaW5nIHtcbiAgICAgICAgbGV0IGNvbW1hbmQ6IENvbW1hbmQsIHRleHQ6IHN0cmluZyA9ICcnO1xuICAgICAgICBmb3IoY29tbWFuZCBvZiB0aGlzLmNvbW1hbmRzKXtcbiAgICAgICAgICAgIHRleHQgKz0gY29tbWFuZC5wZXJmb3JtKCkucmVzdWx0LnRleHQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxufSIsImltcG9ydCBWYWx1ZVR5cGUgZnJvbSAnLi9WYWx1ZVR5cGUnO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi9JVmFyaWFibGVzJztcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFZhbHVlIHtcbiAgICBwdWJsaWMgdHlwZTogVmFsdWVUeXBlO1xuICAgIHB1YmxpYyB2YWx1ZTogc3RyaW5nIHwgbnVtYmVyO1xuICAgIGNvbnN0cnVjdG9yKGl0ZW0pe1xuICAgICAgICBpZigvKFwifCcpW1xcd1xcZF0rKFxcMSkvLnRlc3QoaXRlbSkpIHtcbiAgICAgICAgICAgIHRoaXMudHlwZSA9IFZhbHVlVHlwZS5zdHJpbmc7XG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gaXRlbS5zdWJzdHIoMSwgaXRlbS5sZW5ndGggLSAyKTtcbiAgICAgICAgfSBlbHNlIGlmKCFpc05hTihpdGVtKSkge1xuICAgICAgICAgICAgdGhpcy50eXBlID0gVmFsdWVUeXBlLm51bWJlcjtcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSBwYXJzZUZsb2F0KGl0ZW0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy50eXBlID0gVmFsdWVUeXBlLnZhcmlhYmxlO1xuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IGl0ZW07XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgcHVibGljIGV2YWx1YXRlKHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IHN0cmluZyB8IG51bWJlcntcbiAgICAgICAgcmV0dXJuIHRoaXMudHlwZSA9PT0gVmFsdWVUeXBlLnZhcmlhYmxlID8gaXNOYU4odmFyaWFibGVzW3RoaXMudmFsdWVdKSA/IHZhcmlhYmxlc1t0aGlzLnZhbHVlXSA6IHBhcnNlRmxvYXQodmFyaWFibGVzW3RoaXMudmFsdWVdKSA6IHRoaXMudmFsdWU7XG4gICAgfVxufSIsImVudW0gVmFsdWVUeXBlIHtcbiAgICBzdHJpbmcsXG4gICAgbnVtYmVyLFxuICAgIHZhcmlhYmxlXG59XG5leHBvcnQgZGVmYXVsdCBWYWx1ZVR5cGU7IiwiaW1wb3J0IElBY3Rpb25EZWZpbml0aW9uIGZyb20gJy4vSUFjdGlvbkRlZmluaXRpb24nO1xuaW1wb3J0IHtDb25kaXRpb259IGZyb20gJy4uL0NvbmRpdGlvbnMnO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5pbXBvcnQgQ29tbWFuZCBmcm9tICcuLi9Db21tYW5kJztcbmltcG9ydCBTY29wZSBmcm9tICcuLi9TY29wZSc7XG4vLyBETyBOT1QgUFVUIElOU1RBTkNFIElURU1TIElOIFRISVMgQ0xBU1MsIERVTU1ZXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBY3Rpb24ge1xuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBkZWZpbml0aW9uOiBJQWN0aW9uRGVmaW5pdGlvbil7XG4gICAgICAgIGlmKCFkZWZpbml0aW9uKSB0aHJvdyAnQXR0ZW1wdGVkIHRvIGluc3RhdGlhdGUgYWN0aW9uIHdpdGhvdXQgYSBkZWZpbml0aW9uJztcbiAgICB9XG4gICAgXG4gICAgcHVibGljIG1hdGNoZXMoc3RhdGVtZW50OiBzdHJpbmcpOiBib29sZWFue1xuICAgICAgICByZXR1cm4gdGhpcy5kZWZpbml0aW9uLnJlZ2V4LnRlc3Qoc3RhdGVtZW50KTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHBhcnNlKGNvbW1hbmQ6IENvbW1hbmQpe1xuICAgICAgICBsZXQgY29uZGl0aW9uOiBDb25kaXRpb247XG4gICAgICAgIGZvcihjb25kaXRpb24gb2YgdGhpcy5kZWZpbml0aW9uLmNvbmRpdGlvbnMpe1xuICAgICAgICAgICAgaWYoY29uZGl0aW9uLm1hdGNoZXMoY29tbWFuZC5zdGF0ZW1lbnQpKSB7XG4gICAgICAgICAgICAgICAgY29tbWFuZC5jb25kaXRpb24gPSBjb25kaXRpb247XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgcHVibGljIHBlcmZvcm0oY29tbWFuZDogQ29tbWFuZCwgcHJldj86IENvbW1hbmQpOiBDb21tYW5kIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVmaW5pdGlvbi5ydWxlKGNvbW1hbmQsIHByZXYpO1xuICAgIH1cbn0iLCJpbXBvcnQgQWN0aW9uIGZyb20gJy4vQWN0aW9uJztcbmltcG9ydCB7Q29uZGl0aW9ufSBmcm9tICcuLi9Db25kaXRpb25zJztcbmltcG9ydCBDb21tYW5kIGZyb20gJy4uL0NvbW1hbmQnO1xuaW1wb3J0IFNjb3BlIGZyb20gJy4uL1Njb3BlJztcblxuaW50ZXJmYWNlIElBY3Rpb25EZWZpbml0aW9uIHtcbiAgICByZWdleDogUmVnRXhwO1xuICAgIGNvbmRpdGlvbnM6IENvbmRpdGlvbltdO1xuICAgIGRlcGVuZGVudHM6IEFjdGlvbltdO1xuICAgIHRlcm1pbmF0b3I6IGJvb2xlYW47XG4gICAgcnVsZTogKGNvbW1hbmQ6IENvbW1hbmQsIHByZXY/OiBDb21tYW5kKSA9PiBDb21tYW5kO1xufVxuZXhwb3J0IGRlZmF1bHQgSUFjdGlvbkRlZmluaXRpb247IiwiXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb21tYW5kUmVzdWx0IHtcbiAgICBwdWJsaWMgZGVwZW5kZW50OiBDb21tYW5kUmVzdWx0O1xuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyB0ZXh0OiBzdHJpbmcsIHB1YmxpYyBwYXNzZWQ/OiBib29sZWFuKXt9XG59IiwiaW1wb3J0IFBsYWNlaG9sZGVyIGZyb20gJy4uL1BsYWNlaG9sZGVycyc7XG5pbXBvcnQgQ29uZGl0aW9uUmVzdWx0IGZyb20gJy4vQ29uZGl0aW9uUmVzdWx0JztcbmltcG9ydCBJQ29uZGl0aW9uSW5kaWNlcyBmcm9tICcuL0lDb25kaXRpb25JbmRpY2VzJztcbmltcG9ydCBJQ29uZGl0aW9uRGVmaW5pdGlvbiBmcm9tICcuL0lDb25kaXRpb25EZWZpbml0aW9uJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuaW1wb3J0IENvbW1hbmQgZnJvbSAnLi4vQ29tbWFuZCc7XG5pbXBvcnQge01vZGlmaWVyfSBmcm9tICcuLi9Nb2RpZmllcnMnXG5pbXBvcnQgVmFsdWUgZnJvbSAnLi4vVmFsdWUnO1xuaW1wb3J0ICcuLi9FeHRlbnNpb25zJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29uZGl0aW9uIHtcbiAgICBwcml2YXRlIHJlZ2V4OiBSZWdFeHA7XG4gICAgcHJpdmF0ZSBpbmRpY2llczogSUNvbmRpdGlvbkluZGljZXMgPSB7fTtcbiAgICBwcml2YXRlIHRlbXBsYXRlOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBpdGVtczogQXJyYXk8c3RyaW5nIHwgTW9kaWZpZXJbXT47XG4gICAgcHJpdmF0ZSBydWxlOiAodmFsdWVzOiBWYWx1ZVtdLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpID0+IGJvb2xlYW47XG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBkZWZpbml0aW9uOiBJQ29uZGl0aW9uRGVmaW5pdGlvbil7XG4gICAgICAgIGlmKCFkZWZpbml0aW9uKSB0aHJvdyAnQXR0ZW1wdGVkIHRvIGluc3RhdGlhdGUgY29uZGl0aW9uIHdpdGhvdXQgYSBkZWZpbml0aW9uJztcbiAgICAgICAgdGhpcy5yZWdleCA9IHRoaXMudHJhbnNsYXRlKHRoaXMuZGVmaW5pdGlvbik7XG4gICAgICAgIHRoaXMudGVtcGxhdGUgPSBkZWZpbml0aW9uLnRlbXBsYXRlO1xuICAgICAgICB0aGlzLml0ZW1zID0gZGVmaW5pdGlvbi5pdGVtcztcbiAgICAgICAgdGhpcy5ydWxlID0gZGVmaW5pdGlvbi5ydWxlO1xuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIHRyYW5zbGF0ZShkZWZpbml0aW9uOiBJQ29uZGl0aW9uRGVmaW5pdGlvbik6IFJlZ0V4cHtcbiAgICAgICAgbGV0IHRlbXBsYXRlID0gZGVmaW5pdGlvbi50ZW1wbGF0ZSwgaXRlbTogKHN0cmluZyB8IE1vZGlmaWVyW10pLCBuYW1lOiBzdHJpbmcsIGlkeD0xO1xuICAgICAgICBmb3IoaXRlbSBvZiBkZWZpbml0aW9uLml0ZW1zKXtcbiAgICAgICAgICAgIGlmKCFpdGVtKSB0aHJvdyAnSW52YWxpZCBpdGVtIGluIGl0ZW1zIGRlZmluaXRpb24nO1xuICAgICAgICAgICAgaWYoaXRlbSBpbnN0YW5jZW9mIEFycmF5KSBuYW1lID0gJ21vZGlmaWVyJztcbiAgICAgICAgICAgIGVsc2UgbmFtZSA9IDxzdHJpbmc+aXRlbTtcbiAgICAgICAgICAgIGxldCBwbGFjZWhvbGRlciA9IFBsYWNlaG9sZGVyKG5hbWUpO1xuICAgICAgICAgICAgdGVtcGxhdGUgPSB0ZW1wbGF0ZS5yZXBsYWNlKHBsYWNlaG9sZGVyLmxvY2F0b3IsIHBsYWNlaG9sZGVyLnJlcGxhY2VtZW50KGl0ZW0gaW5zdGFuY2VvZiBBcnJheSA/IGl0ZW0gOiBudWxsKSk7XG4gICAgICAgICAgICBpZih0aGlzLmluZGljaWVzW25hbWVdIGluc3RhbmNlb2YgQXJyYXkpICg8bnVtYmVyW10+dGhpcy5pbmRpY2llc1tuYW1lXSkucHVzaChpZHgpO1xuICAgICAgICAgICAgZWxzZSBpZighaXNOYU4oPGFueT50aGlzLmluZGljaWVzW25hbWVdKSkge1xuICAgICAgICAgICAgICAgIGxldCBhcnJheSA9IFtdO1xuICAgICAgICAgICAgICAgIGFycmF5LnB1c2godGhpcy5pbmRpY2llc1tuYW1lXSk7XG4gICAgICAgICAgICAgICAgYXJyYXkucHVzaChpZHgpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5kaWNpZXNbbmFtZV0gPSBhcnJheTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgdGhpcy5pbmRpY2llc1tuYW1lXSA9IGlkeDtcbiAgICAgICAgICAgIHRoaXMuaW5kaWNpZXNbaWR4XSA9IG5hbWU7XG4gICAgICAgICAgICBpZHgrKztcbiAgICAgICAgfVxuICAgICAgICB0ZW1wbGF0ZSA9IHRlbXBsYXRlLnJlcGxhY2UoL1xccysvZywgJyg/OlxcXFxifFxcXFxzKyknKTtcbiAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAodGVtcGxhdGUsICdpJyk7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgcGFyc2UoY29tbWFuZDogQ29tbWFuZCk6IENvbmRpdGlvblJlc3VsdCB7XG4gICAgICAgIGxldCByZXN1bHQgPSBuZXcgQ29uZGl0aW9uUmVzdWx0KCksIG1hdGNoID0gY29tbWFuZC5zdGF0ZW1lbnQubWF0Y2godGhpcy5yZWdleCksIGksIG1vZGlmaWVyOiBNb2RpZmllciwgbW9kTnVtYmVyOiBudW1iZXIgPSAtMTtcbiAgICAgICAgcmVzdWx0LnN0YXRlbWVudCA9IG1hdGNoWzBdO1xuICAgICAgICBmb3IoaT0xO2k8bWF0Y2gubGVuZ3RoO2krKyl7XG4gICAgICAgICAgICBpZih0aGlzLml0ZW1zW2ktMV0gaW5zdGFuY2VvZiBBcnJheSl7XG4gICAgICAgICAgICAgICAgbW9kTnVtYmVyKys7XG4gICAgICAgICAgICAgICAgZm9yKG1vZGlmaWVyIG9mIDxNb2RpZmllcltdPnRoaXMuaXRlbXNbaS0xXSl7XG4gICAgICAgICAgICAgICAgICAgIGlmKG1vZGlmaWVyLm1hdGNoZXMobWF0Y2hbaV0pKSByZXN1bHQuc2V0KDxzdHJpbmc+dGhpcy5pbmRpY2llc1tpXSwgbW9kaWZpZXIsIG1vZE51bWJlcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSByZXN1bHQuc2V0KDxzdHJpbmc+dGhpcy5pbmRpY2llc1tpXSwgbWF0Y2hbaV0pXG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0LnZhcmlhYmxlcyA9IGNvbW1hbmQuc2NvcGUudmFyaWFibGVzO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgcGVyZm9ybShjb21tYW5kOiBDb21tYW5kKTogYm9vbGVhbntcbiAgICAgICAgbGV0IHBhcnNlZCA9IHRoaXMucGFyc2UoY29tbWFuZCk7XG4gICAgICAgIHBhcnNlZC5wYXNzID0gdGhpcy5ydWxlKHBhcnNlZC52YWx1ZSwgcGFyc2VkLnZhcmlhYmxlcyk7XG4gICAgICAgIGxldCBpbmRleDogbnVtYmVyO1xuICAgICAgICBmb3IoaW5kZXggb2YgdGhpcy5kZWZpbml0aW9uLm1vZE9yZGVyKXtcbiAgICAgICAgICAgIGlmKHBhcnNlZC5tb2RpZmllcltpbmRleF0pIHBhcnNlZC5wYXNzID0gcGFyc2VkLm1vZGlmaWVyW2luZGV4XS5kZWZpbml0aW9uLnJ1bGUocGFyc2VkLnBhc3MsIHBhcnNlZC52YWx1ZSwgcGFyc2VkLnZhcmlhYmxlcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBhcnNlZC5wYXNzO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgbWF0Y2hlcyhzdGF0ZW1lbnQ6IHN0cmluZyl7XG4gICAgICAgIHJldHVybiB0aGlzLnJlZ2V4LnRlc3Qoc3RhdGVtZW50KTtcbiAgICB9XG59IiwiaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5pbXBvcnQge01vZGlmaWVyfSBmcm9tICcuLi9Nb2RpZmllcnMnO1xuaW1wb3J0IFZhbHVlIGZyb20gJy4uL1ZhbHVlJztcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbmRpdGlvblJlc3VsdCB7XG4gICAgcHVibGljIHBhc3M6IGJvb2xlYW47XG4gICAgcHVibGljIHZhbHVlOiBWYWx1ZVtdID0gW107XG4gICAgcHVibGljIHZhcmlhYmxlczogSVZhcmlhYmxlcztcbiAgICBwdWJsaWMgbW9kaWZpZXI6IE1vZGlmaWVyW10gPSBbXTtcbiAgICBwdWJsaWMgc3RhdGVtZW50OiBzdHJpbmc7XG4gICAgcHVibGljIHNldChwcm9wOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcgfCBNb2RpZmllciwgaW5kZXg/OiBudW1iZXIpe1xuICAgICAgICBpZih0aGlzW3Byb3BdIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgIGlmKGluZGV4KSB0aGlzW3Byb3BdW2luZGV4XSA9IHByb3AgPT09ICd2YWx1ZScgPyBuZXcgVmFsdWUodmFsdWUpIDogdmFsdWU7XG4gICAgICAgICAgICBlbHNlIHRoaXNbcHJvcF0ucHVzaChwcm9wID09PSAndmFsdWUnID8gbmV3IFZhbHVlKHZhbHVlKSA6IHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHRoaXNbcHJvcF0gPSBwcm9wID09PSAndmFsdWUnID8gbmV3IFZhbHVlKHZhbHVlKSA6IHZhbHVlO1xuICAgIH1cbn0iLCJpbXBvcnQge01vZGlmaWVyfSBmcm9tICcuLi9Nb2RpZmllcnMnO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5pbXBvcnQgVmFsdWUgZnJvbSAnLi4vVmFsdWUnO1xuaW50ZXJmYWNlIElDb25kaXRpb25EZWZpbml0aW9uIHtcbiAgICB0ZW1wbGF0ZTogc3RyaW5nO1xuICAgIGl0ZW1zOiBBcnJheTxzdHJpbmcgfCBNb2RpZmllcltdPjtcbiAgICBtb2RPcmRlcjogbnVtYmVyW107XG4gICAgcnVsZTogKHZhbHVlczogVmFsdWVbXSwgdmFyaWFibGVzOiBJVmFyaWFibGVzKSA9PiBib29sZWFuO1xufVxuZXhwb3J0IGRlZmF1bHQgSUNvbmRpdGlvbkRlZmluaXRpb247IiwiaW50ZXJmYWNlIElDb25kaXRpb25JbmRpY2VzIHtcbiAgICBba2V5OiBzdHJpbmddOiAobnVtYmVyW10gfCBudW1iZXIgfCBzdHJpbmcpO1xuICAgIFtrZXk6IG51bWJlcl06IHN0cmluZyB8IG51bWJlciB8IG51bWJlcltdO1xufVxuZXhwb3J0IGRlZmF1bHQgSUNvbmRpdGlvbkluZGljZXM7IiwiaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5pbXBvcnQgVmFsdWUgZnJvbSAnLi4vVmFsdWUnO1xuXG5pbnRlcmZhY2UgSU1vZGlmaWVyRGVmaW5pdGlvbiB7XG4gICAgaWRlbnRpZmllcnM6IFJlZ0V4cFtdO1xuICAgIHJ1bGU6IChwYXNzOiBib29sZWFuLCB2YWx1ZXM6IFZhbHVlW10sIHZhcmlhYmxlczogSVZhcmlhYmxlcykgPT4gYm9vbGVhbjtcbn1cbmV4cG9ydCBkZWZhdWx0IElNb2RpZmllckRlZmluaXRpb247IiwiaW1wb3J0IElNb2RpZmllckRlZmluaXRpb24gZnJvbSAnLi9JTW9kaWZpZXJEZWZpbml0aW9uJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNb2RpZmllciB7XG4gICAgY29uc3RydWN0b3IocHVibGljIGRlZmluaXRpb246SU1vZGlmaWVyRGVmaW5pdGlvbil7XG4gICAgICAgIGlmKCFkZWZpbml0aW9uKSB0aHJvdyAnQXR0ZW1wdGVkIHRvIGluc3RhdGlhdGUgbW9kaWZpZXIgd2l0aG91dCBhIGRlZmluaXRpb24nO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgbWF0Y2hlcyh0ZXh0OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgbGV0IGlkZW50aWZpZXI7XG4gICAgICAgIGZvcihpZGVudGlmaWVyIG9mIHRoaXMuZGVmaW5pdGlvbi5pZGVudGlmaWVycyl7XG4gICAgICAgICAgICBpZihpZGVudGlmaWVyLnRlc3QodGV4dCkpIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59IiwiaW1wb3J0IHtSdW5uZXJ9IGZyb20gJy4uL1J1bm5lcnMnO1xuXG5pbnRlcmZhY2UgSVBhcnNlckRlZmluaXRpb24ge1xuICAgIHJ1bm5lcnM6IFJ1bm5lcltdXG59XG5leHBvcnQgZGVmYXVsdCBJUGFyc2VyRGVmaW5pdGlvbjsiLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vRXh0ZW5zaW9ucy50c1wiIC8+XG5pbXBvcnQgSVBhcnNlckRlZmluaXRpb24gZnJvbSAnLi9JUGFyc2VyRGVmaW5pdGlvbic7XG5pbXBvcnQge1J1bm5lciwgQWN0aW9uUnVubmVyfSBmcm9tICcuLi9SdW5uZXJzJztcbmltcG9ydCBDb21tYW5kIGZyb20gJy4uL0NvbW1hbmQnO1xuaW1wb3J0IFNjb3BlIGZyb20gJy4uL1Njb3BlJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuQXJyYXkucHJvdG90eXBlLmxhc3QgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gdGhpc1t0aGlzLmxlbmd0aC0xXTtcbn1cbi8qKlxuICogVGhlIFNRaWdnTCBwYXJzZXJcbiAqIEBtb2R1bGUgUGFyc2VyXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7c3RyaW5nfSBzcWwgICAgICAgICAgICAgIC0gVGhlIFNRaWdnTCBxdWVyeSB0byBydW4gdGhlIHBhcnNlciBhZ2FpbnN0XG4gKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAgICAtIEFueSB2YXJpYWJsZXMgcGFzc2VkIHRvIHRoZSBTUWlnZ0wgcGFyc2VyXG4gKiBAcHJvcGVydHkge3N0cmluZ30gc3FsICAgICAgICAgICAtIFRoZSBTUWlnZ0wgcXVlcnkgdG8gcnVuIHRoZSBwYXJzZXIgYWdhaW5zdFxuICogQHByb3BlcnR5IHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgLSBBbnkgdmFyaWFibGVzIHBhc3NlZCB0byB0aGUgU1FpZ2dMIHBhcnNlclxuICogQHByb3BlcnR5IHtDb21tYW5kW119IGNvbW1hbmRzICAgLSBBcnJheSBvZiBjb21tYW5kcyBmb3VuZCBpbiB0aGUgU1FpZ2dMIHF1ZXJ5XG4gKiBAcHJvcGVydHkge0NvbW1hbmRbXX0gc3RhY2sgICAgICAtIENvbW1hbmQgc3RhY2sgZm9yIHN0b3JpbmcgY3VycmVudCBwb3NpdGlvbiBpbiB0aGUgcGFyc2luZyBwcm9jZXNzXG4gKiBAcHJvcGVydHkge3N0cmluZ30gZXJyb3IgICAgICAgICAtIEVycm9yIHN0cmluZyBpZiBhbnkgZXJyb3JzIGFyZSBmb3VuZCBpbiB0aGUgcGFyc2luZyBwcm9jZXNzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhcnNlciB7XG4gICAgcHVibGljIHJlZ2V4OiBSZWdFeHA7XG5cdHB1YmxpYyBjb21tYW5kczogQ29tbWFuZFtdID0gW107XG5cdHB1YmxpYyBzdGFjazogQ29tbWFuZFtdID0gW107XG4gICAgcHVibGljIGVycm9yOiBzdHJpbmdbXSA9IFtdO1xuICAgIHB1YmxpYyBzcWw6IHN0cmluZztcblx0Ly8gY29uc3RydWN0b3IocHVibGljIHNxbDogc3RyaW5nLCBwdWJsaWMgdmFyaWFibGVzOiBJVmFyaWFibGVzKXtcblx0XHQvLyB0aGlzLmNvbW1hbmRzID0gdGhpcy5leHRyYWN0KHNxbCwgdmFyaWFibGVzKTtcblx0XHQvLyB0aGlzLnZhcmlhYmxlcyA9IHZhcmlhYmxlcztcblx0Ly8gfVxuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBkZWZpbml0aW9uOiBJUGFyc2VyRGVmaW5pdGlvbil7XG4gICAgICAgIGlmKCFkZWZpbml0aW9uKSB0aHJvdyAnQXR0ZW1wdGVkIHRvIGluc3RhdGlhdGUgcGFyc2VyIHdpdGhvdXQgYSBkZWZpbml0aW9uJztcbiAgICAgICAgdGhpcy5yZWdleCA9IG5ldyBSZWdFeHAoYCg/OiR7dGhpcy5kZWZpbml0aW9uLnJ1bm5lcnMubWFwKHggPT4geC5kZWZpbml0aW9uLnJlZ2V4LnNvdXJjZSkuam9pbignKXwoJyl9KWAsICdnbScpO1xuICAgIH1cblx0LyoqXG4gICAgICogRXh0cmFjdCBhbnkgY29tbWFuZHMgb3V0IG9mIHRoZSBTUWlnZ0wgcXVlcnkgYW5kIGRldGVybWluZSB0aGVpciBvcmRlciwgbmVzdGluZywgYW5kIHR5cGVcbiAgICAgKiBAbWVtYmVyb2YgUGFyc2VyXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3FsICAgICAgICAgICAgICAtIFNRaWdnTCBxdWVyeSB0byBleHRyYWN0IGNvbW1hbmRzIGZyb21cbiAgICAgKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAgICAtIEFueSBnbG9iYWwgdmFyaWFibGVzIHBhc3NlZCBpbiB0byBTUWlnZ0xcbiAgICAgKiBAcmV0dXJucyB7Q29tbWFuZFtdfSAgICAgICAgICAgICAtIEFycmF5IG9mIGZ1bGx5IHBhcnNlZCBjb21tYW5kcywgcmVhZHkgZm9yIGV4ZWN1dGlvblxuICAgICAqL1xuXHRwdWJsaWMgcGFyc2Uoc3FsOiBzdHJpbmcsIHZhcmlhYmxlczogSVZhcmlhYmxlcyl7XG5cdCAgICB0aGlzLmNvbW1hbmRzID0gW107XG4gICAgICAgIHRoaXMuc3RhY2sgPSBbXTtcbiAgICAgICAgdGhpcy5zcWwgPSBzcWw7XG4gICAgICAgIGxldCBtYXRjaDtcblx0XHQvLyBDb21tYW5kLnJlZ2V4Lmxhc3RJbmRleCA9IDA7XG5cdFx0d2hpbGUoKG1hdGNoID0gdGhpcy5yZWdleC5leGVjKHNxbCkpICE9IG51bGwpe1xuICAgICAgICAgICAgbGV0IGZvdW5kOiBDb21tYW5kLCBydW5uZXI6IFJ1bm5lcjtcbiAgICAgICAgICAgIGZvcihydW5uZXIgb2YgdGhpcy5kZWZpbml0aW9uLnJ1bm5lcnMpe1xuICAgICAgICAgICAgICAgIGlmKHJ1bm5lci5tYXRjaGVzKG1hdGNoWzBdKSl7XG4gICAgICAgICAgICAgICAgICAgIGZvdW5kID0gbmV3IENvbW1hbmQobWF0Y2guaW5kZXgsIG1hdGNoLmlucHV0Lmxlbmd0aCwgbWF0Y2hbMV0sIG1hdGNoWzJdLCBuZXcgU2NvcGUoKSwgcnVubmVyKTtcbiAgICAgICAgICAgICAgICAgICAgZm91bmQuc2NvcGUudmFyaWFibGVzID0gdmFyaWFibGVzO1xuICAgICAgICAgICAgICAgICAgICBydW5uZXIucGFyc2UoZm91bmQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblx0XHRcdGlmKHRoaXMuc3RhY2subGVuZ3RoID4gMCAmJiB0aGlzLnN0YWNrLmxhc3QoKS5hY3Rpb24uZGVmaW5pdGlvbi5kZXBlbmRlbnRzLmNvbnRhaW5zKGZvdW5kLmFjdGlvbikpe1xuICAgICAgICAgICAgICAgIC8vIGZvdW5kLmFjdGlvbi5zdXBwb3J0ZXIgPSBzdGFjay5sYXN0KCk7XG5cdFx0XHRcdHRoaXMuc3RhY2subGFzdCgpLmRlcGVuZGVudHMucHVzaChmb3VuZCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmICh0aGlzLnN0YWNrLmxlbmd0aCA+IDAgJiYgIXRoaXMuc3RhY2subGFzdCgpLmFjdGlvbi5kZWZpbml0aW9uLnRlcm1pbmF0b3IpIHtcblx0XHRcdFx0dGhpcy5zdGFjay5wdXNoKGZvdW5kKTtcblx0XHRcdFx0dGhpcy5zdGFjay5sYXN0KCkuc2NvcGUuY29tbWFuZHMucHVzaChmb3VuZCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0aWYodGhpcy5zdGFjay5sZW5ndGggPiAwICYmIHRoaXMuc3RhY2subGFzdCgpLmFjdGlvbi5kZWZpbml0aW9uLnRlcm1pbmF0b3IpIHRoaXMuc3RhY2sucG9wKCk7XG5cdFx0XHRcdHRoaXMuc3RhY2sucHVzaChmb3VuZCk7XG5cdFx0XHRcdHRoaXMuY29tbWFuZHMucHVzaChmb3VuZCk7XG5cdFx0XHR9XG4gICAgICAgICAgICAvLyBsZXQgZXJyb3IgPSBmb3VuZC5hY3Rpb24udmFsaWRhdGUoKTtcbiAgICAgICAgICAgIC8vIGlmKGVycm9yKSByZXR1cm4gW107XG5cdFx0fVxuXHRcdC8vIHJldHVybiBjb21tYW5kcztcblx0fVxuXHQvKipcbiAgICAgKiBSdW4gdGhlIGNvbW1hbmRzIGFnYWluc3QgdGhlIHN0cmluZyBhbmQgb3V0cHV0IHRoZSBlbmQgcmVzdWx0XG4gICAgICogQG1lbWJlcm9mIFBhcnNlclxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHJldHVybnMge3N0cmluZ30gVGhlIGVuZCByZXN1bHQgb2YgcnVubmluZyBhbGwgY29tbWFuZHMgYWdhaW5zdCB0aGUgU1FpZ2dMIHF1ZXJ5XG4gICAgICovXG5cdHB1YmxpYyBwZXJmb3JtKCk6IHN0cmluZyB7XG5cdFx0dmFyIHF1ZXJ5ID0gJycsIGluZGV4ID0gMDtcbiAgICAgICAgaWYodGhpcy5jb21tYW5kcy5sZW5ndGggPT09IDApIHJldHVybiB0aGlzLnNxbDtcblx0XHRmb3IodmFyIGNvbW1hbmQgb2YgdGhpcy5jb21tYW5kcyl7XG5cdFx0XHRxdWVyeSArPSB0aGlzLnNxbC5zbGljZShpbmRleCwgY29tbWFuZC5pbmRleCAtMSk7XG5cdFx0XHRxdWVyeSArPSBjb21tYW5kLnBlcmZvcm0oY29tbWFuZCkucmVzdWx0LnRleHQ7XG5cdFx0XHRpbmRleCArPSBjb21tYW5kLmxlbmd0aDtcblx0XHR9XG5cdFx0cmV0dXJuIHF1ZXJ5OyAvL1RPRE9cblx0fVxufSIsImltcG9ydCB7TW9kaWZpZXJ9IGZyb20gJy4uL01vZGlmaWVycyc7XG5pbnRlcmZhY2UgSVBsYWNlaG9sZGVyIHtcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgbG9jYXRvcjogUmVnRXhwO1xuICAgIHJlcGxhY2VtZW50OiAoaXRlbT86TW9kaWZpZXJbXSkgPT4gc3RyaW5nO1xufVxuZXhwb3J0IGRlZmF1bHQgSVBsYWNlaG9sZGVyOyIsImltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuXG5pbnRlcmZhY2UgSVJlcGxhY2VyRGVmaW5pdGlvbiB7XG4gICAgcmVnZXg6IFJlZ0V4cDtcbiAgICBydWxlOiAoZGVmaW5pdGlvbjogSVJlcGxhY2VyRGVmaW5pdGlvbiwgdGV4dDogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpID0+IHN0cmluZztcbn1cbmV4cG9ydCBkZWZhdWx0IElSZXBsYWNlckRlZmluaXRpb247IiwiaW1wb3J0IElSZXBsYWNlckRlZmluaXRpb24gZnJvbSAnLi9JUmVwbGFjZXJEZWZpbml0aW9uJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZXBsYWNlciB7ICAgIFxuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBkZWZpbml0aW9uOiBJUmVwbGFjZXJEZWZpbml0aW9uKXtcbiAgICAgICAgaWYoIWRlZmluaXRpb24pIHRocm93ICdBdHRlbXB0ZWQgdG8gaW5zdGF0aWF0ZSByZXBsYWNlciB3aXRob3V0IGEgZGVmaW5pdGlvbic7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyByZXBsYWNlKHRleHQ6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogc3RyaW5ne1xuICAgICAgICByZXR1cm4gdGhpcy5kZWZpbml0aW9uLnJ1bGUodGhpcy5kZWZpbml0aW9uLCB0ZXh0LCB2YXJpYWJsZXMpO1xuICAgIH1cbn0iLCJpbXBvcnQge0FjdGlvbn0gZnJvbSAnLi4vQWN0aW9ucyc7XG5pbXBvcnQge1JlcGxhY2VyfSBmcm9tICcuLi9SZXBsYWNlcnMnO1xuXG5pbnRlcmZhY2UgSVJ1bm5lckRlZmluaXRpb24ge1xuICAgIHJlZ2V4OiBSZWdFeHA7XG4gICAgYWN0aW9uczogQWN0aW9uW107XG4gICAgcmVwbGFjZXJzOiBSZXBsYWNlcltdO1xufVxuZXhwb3J0IGRlZmF1bHQgSVJ1bm5lckRlZmluaXRpb247IiwiaW1wb3J0IElSdW5uZXJEZWZpbml0aW9uIGZyb20gJy4vSVJ1bm5lckRlZmluaXRpb24nO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5pbXBvcnQgU2NvcGUgZnJvbSAnLi4vU2NvcGUnO1xuaW1wb3J0IHtBY3Rpb259IGZyb20gJy4uL0FjdGlvbnMnO1xuaW1wb3J0IENvbW1hbmQgZnJvbSAnLi4vQ29tbWFuZCc7XG5pbXBvcnQge1JlcGxhY2VyfSBmcm9tICcuLi9SZXBsYWNlcnMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSdW5uZXIge1xuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBkZWZpbml0aW9uOiBJUnVubmVyRGVmaW5pdGlvbil7XG4gICAgICAgIGlmKCFkZWZpbml0aW9uKSB0aHJvdyAnQXR0ZW1wdGVkIHRvIGluc3RhdGlhdGUgcnVubmVyIHdpdGhvdXQgYSBkZWZpbml0aW9uJztcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHBhcnNlKGNvbW1hbmQ6IENvbW1hbmQpIHtcbiAgICAgICAgbGV0IGFjdGlvbjogQWN0aW9uO1xuICAgICAgICBmb3IoYWN0aW9uIG9mIHRoaXMuZGVmaW5pdGlvbi5hY3Rpb25zKXtcbiAgICAgICAgICAgIGlmKGFjdGlvbi5tYXRjaGVzKGNvbW1hbmQuc3RhdGVtZW50KSkge1xuICAgICAgICAgICAgICAgIGNvbW1hbmQuYWN0aW9uID0gYWN0aW9uO1xuICAgICAgICAgICAgICAgIGNvbW1hbmQuYWN0aW9uLnBhcnNlKGNvbW1hbmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBwZXJmb3JtKGNvbW1hbmQ6IENvbW1hbmQsIHByZXY/OiBDb21tYW5kKTogQ29tbWFuZCB7XG4gICAgICAgIGNvbW1hbmQucmVzdWx0ID0gY29tbWFuZC5hY3Rpb24ucGVyZm9ybShjb21tYW5kLCBwcmV2KS5yZXN1bHQ7XG4gICAgICAgIC8vIGNvbW1hbmQucmVzdWx0LmRlcGVuZGVudCA9IGNvbW1hbmQuc2NvcGUucGVyZm9ybShjb21tYW5kKS5yZXN1bHQ7XG4gICAgICAgIGxldCByZXBsYWNlcjogUmVwbGFjZXI7XG4gICAgICAgIGZvcihyZXBsYWNlciBvZiB0aGlzLmRlZmluaXRpb24ucmVwbGFjZXJzKXtcbiAgICAgICAgICAgIGNvbW1hbmQucmVwbGFjZShyZXBsYWNlcik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbW1hbmQ7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBtYXRjaGVzKHRleHQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICB0aGlzLmRlZmluaXRpb24ucmVnZXgubGFzdEluZGV4ID0gMDtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVmaW5pdGlvbi5yZWdleC50ZXN0KHRleHQpO1xuICAgIH1cbn0iXX0=
