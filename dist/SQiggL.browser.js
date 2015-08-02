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
    rule: function (values, variables) { return [values[0].evaluate(variables), values[1].evaluate(variables)].sort().indexOf(values[1].evaluate(variables)) > 0; }
};
exports.AlphabeticallyGreaterThan = new Condition_1.default(AlphabeticallyGreaterThanDefinition);
var AlphabeticallyLessThanDefinition = {
    template: '(v) (m)abc<(m) (v)',
    items: ['value', [Modifiers_1.Not], [Modifiers_1.OrEqual], 'value'],
    modOrder: [1, 0],
    rule: function (values, variables) { return [values[0].evaluate(variables), values[1].evaluate(variables)].sort().indexOf(values[1].evaluate(variables)) === 0; }
};
exports.AlphabeticallyLessThan = new Condition_1.default(AlphabeticallyLessThanDefinition);
var LengthGreaterThanDefinition = {
    template: '(v) (m)len>(m) (v)',
    items: ['value', [Modifiers_1.Not], [Modifiers_1.OrEqual], 'value'],
    modOrder: [1, 0],
    rule: function (values, variables) { return values[0].evaluate(variables).length > values[1].evaluate(variables); }
};
exports.LengthGreaterThan = new Condition_1.default(LengthGreaterThanDefinition);
var LengthLessThanDefinition = {
    template: '(v) (m)len<(m) (v)',
    items: ['value', [Modifiers_1.Not], [Modifiers_1.OrEqual], 'value'],
    modOrder: [1, 0],
    rule: function (values, variables) { return values[0].evaluate(variables).length < values[1].evaluate(variables); }
};
exports.LengthLessThan = new Condition_1.default(LengthLessThanDefinition);
var IsNaNDefinition = {
    template: '(v) is (m) NaN',
    items: ['value', [Modifiers_1.Not]],
    modOrder: [0],
    rule: function (values, variables) { return isNaN(values[0].evaluate(variables)); }
};
exports.IsNaN = new Condition_1.default(IsNaNDefinition);
var BetweenDefinition = {
    template: '(v) (v)>(m)<(v)',
    items: ['value', 'value', [Modifiers_1.Not, Modifiers_1.OrEqual], 'value'],
    modOrder: [0],
    rule: function (values, variables) { return values[1].evaluate(variables) > values[0].evaluate(variables) && values[2].evaluate(variables) < values[0].evaluate(variables); }
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
    actions: [Actions_1.If, Actions_1.Else, Actions_1.EndIf],
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
        console.log(template);
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
                this[prop][index] = new Value_1.default(value);
            else
                this[prop].push(new Value_1.default(value));
        }
        else
            this[prop] = new Value_1.default(value);
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

},{}]},{},[1,17,18,2,19,3,20,21,22,23,4,5,6,7,8,24,25,9,26,27,10,28,11,29,30,12,31,32,14,13,15,16])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQWN0aW9ucy50cyIsInNyYy9Db21tYW5kLnRzIiwic3JjL0NvbmRpdGlvbnMudHMiLCJzcmMvRXJyb3JzLnRzIiwic3JjL0V4dGVuc2lvbnMudHMiLCJzcmMvSVZhcmlhYmxlcy50cyIsInNyYy9NYWluLnRzIiwic3JjL01vZGlmaWVycy50cyIsInNyYy9QYXJzZXJzLnRzIiwic3JjL1BsYWNlaG9sZGVycy50cyIsInNyYy9SZXBsYWNlcnMudHMiLCJzcmMvUnVubmVycy50cyIsInNyYy9TUWlnZ0wudHMiLCJzcmMvU2NvcGUudHMiLCJzcmMvVmFsdWUudHMiLCJzcmMvVmFsdWVUeXBlLnRzIiwic3JjL2FjdGlvbnMvQWN0aW9uLnRzIiwic3JjL2FjdGlvbnMvSUFjdGlvbkRlZmluaXRpb24udHMiLCJzcmMvY29tbWFuZHMvQ29tbWFuZFJlc3VsdC50cyIsInNyYy9jb25kaXRpb25zL0NvbmRpdGlvbi50cyIsInNyYy9jb25kaXRpb25zL0NvbmRpdGlvblJlc3VsdC50cyIsInNyYy9jb25kaXRpb25zL0lDb25kaXRpb25EZWZpbml0aW9uLnRzIiwic3JjL2NvbmRpdGlvbnMvSUNvbmRpdGlvbkluZGljZXMudHMiLCJzcmMvbW9kaWZpZXJzL0lNb2RpZmllckRlZmluaXRpb24udHMiLCJzcmMvbW9kaWZpZXJzL01vZGlmaWVyLnRzIiwic3JjL3BhcnNlcnMvSVBhcnNlckRlZmluaXRpb24udHMiLCJzcmMvcGFyc2Vycy9QYXJzZXIudHMiLCJzcmMvcGxhY2Vob2xkZXJzL0lQbGFjZWhvbGRlci50cyIsInNyYy9yZXBsYWNlcnMvSVJlcGxhY2VyRGVmaW5pdGlvbi50cyIsInNyYy9yZXBsYWNlcnMvUmVwbGFjZXIudHMiLCJzcmMvcnVubmVycy9JUnVubmVyRGVmaW5pdGlvbi50cyIsInNyYy9ydW5uZXJzL1J1bm5lci50cyJdLCJuYW1l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QUFDLENBQUM7Z0JBQ25DLE9BQU8sQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO2dCQUN4QixPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNsQyxDQUFDO1NBQ0o7SUFDTCxDQUFDO0lBRU0sd0JBQU8sR0FBZCxVQUFlLE9BQWdCLEVBQUUsSUFBYztRQUMzQyxPQUFPLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFDOUQsb0VBQW9FO1FBQ3BFLElBQUksUUFBa0IsQ0FBQztRQUN2QixHQUFHLENBQUEsQ0FBYSxVQUF5QixFQUF6QixLQUFBLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFyQyxjQUFRLEVBQVIsSUFBcUMsQ0FBQztZQUF0QyxRQUFRLFNBQUE7WUFDUixPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQzdCO1FBQ0QsTUFBTSxDQUFDLE9BQU8sQ0FBQztJQUNuQixDQUFDO0lBRU0sd0JBQU8sR0FBZCxVQUFlLElBQVk7UUFDdkIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztRQUNwQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFDTCxhQUFDO0FBQUQsQ0E3QkEsQUE2QkMsSUFBQTtBQTdCRCx3QkE2QkMsQ0FBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgSUFjdGlvbkRlZmluaXRpb24gZnJvbSAnLi9hY3Rpb25zL0lBY3Rpb25EZWZpbml0aW9uJztcbmltcG9ydCBDb21tYW5kUmVzdWx0IGZyb20gJy4vY29tbWFuZHMvQ29tbWFuZFJlc3VsdCc7XG5pbXBvcnQgQWN0aW9uIGZyb20gJy4vYWN0aW9ucy9BY3Rpb24nO1xuaW1wb3J0IENvbW1hbmQgZnJvbSAnLi9Db21tYW5kJztcbmltcG9ydCB7Q29uZGl0aW9uLCBFcXVhbCwgR3JlYXRlclRoYW4sIExlc3NUaGFuLCBJc051bGwsIEFscGhhYmV0aWNhbGx5R3JlYXRlclRoYW4sIEFscGhhYmV0aWNhbGx5TGVzc1RoYW4sIExlbmd0aEdyZWF0ZXJUaGFuLCBMZW5ndGhMZXNzVGhhbiwgSXNOYU4sIEJldHdlZW59IGZyb20gJy4vQ29uZGl0aW9ucyc7XG5pbXBvcnQgU2NvcGUgZnJvbSAnLi9TY29wZSc7XG5cbmxldCBFbmRJZkRlZmluaXRpb246IElBY3Rpb25EZWZpbml0aW9uID0ge1xuICAgIHJlZ2V4OiAvXlxccyplbmRpZlxcYi9pLFxuICAgIGNvbmRpdGlvbnM6IFtdLFxuICAgIGRlcGVuZGVudHM6IFtdLFxuICAgIHRlcm1pbmF0b3I6IHRydWUsXG4gICAgcnVsZTogKGNvbW1hbmQ6IENvbW1hbmQsIHByZXY/OiBDb21tYW5kKTogQ29tbWFuZCA9PiB7XG4gICAgICAgIGNvbW1hbmQucmVzdWx0ID0gbmV3IENvbW1hbmRSZXN1bHQoY29tbWFuZC5pbm5lciwgdHJ1ZSk7XG4gICAgICAgIHJldHVybiBjb21tYW5kO1xuICAgIH1cbn07XG5leHBvcnQgbGV0IEVuZElmID0gbmV3IEFjdGlvbihFbmRJZkRlZmluaXRpb24pO1xuXG5sZXQgRWxzZURlZmluaXRpb246IElBY3Rpb25EZWZpbml0aW9uID0ge1xuICAgIHJlZ2V4OiAvXlxccyplbHNlXFxiL2ksXG4gICAgY29uZGl0aW9uczogW10sXG4gICAgZGVwZW5kZW50czogW10sXG4gICAgdGVybWluYXRvcjogZmFsc2UsXG4gICAgcnVsZTogKGNvbW1hbmQ6IENvbW1hbmQsIHByZXY/OiBDb21tYW5kKTogQ29tbWFuZCA9PiB7XG4gICAgICAgIGlmKCFwcmV2LnJlc3VsdC5wYXNzZWQpIGNvbW1hbmQucmVzdWx0ID0gbmV3IENvbW1hbmRSZXN1bHQoY29tbWFuZC5pbm5lciArIGNvbW1hbmQuc2NvcGUucGVyZm9ybSgpLCB0cnVlKTtcbiAgICAgICAgZWxzZSBjb21tYW5kLnJlc3VsdCA9IG5ldyBDb21tYW5kUmVzdWx0KCcnLCBmYWxzZSk7XG4gICAgICAgIHJldHVybiBjb21tYW5kO1xuICAgIH1cbn07XG5leHBvcnQgbGV0IEVsc2UgPSBuZXcgQWN0aW9uKEVsc2VEZWZpbml0aW9uKTtcblxubGV0IElmRGVmaW5pdGlvbjogSUFjdGlvbkRlZmluaXRpb24gPSB7XG4gICAgcmVnZXg6IC9eXFxzKmlmXFxiL2ksXG4gICAgY29uZGl0aW9uczogW0VxdWFsLCBHcmVhdGVyVGhhbiwgTGVzc1RoYW4sIElzTnVsbCwgQWxwaGFiZXRpY2FsbHlHcmVhdGVyVGhhbiwgQWxwaGFiZXRpY2FsbHlMZXNzVGhhbiwgTGVuZ3RoR3JlYXRlclRoYW4sIExlbmd0aExlc3NUaGFuLCBJc05hTiwgQmV0d2Vlbl0sXG4gICAgZGVwZW5kZW50czogW0Vsc2UsIEVuZElmXSxcbiAgICB0ZXJtaW5hdG9yOiBmYWxzZSxcbiAgICBydWxlOiAoY29tbWFuZDogQ29tbWFuZCwgcHJldj86IENvbW1hbmQpOiBDb21tYW5kID0+IHtcbiAgICAgICAgaWYoY29tbWFuZC5jb25kaXRpb24ucGVyZm9ybShjb21tYW5kKSkge1xuICAgICAgICAgICAgY29tbWFuZC5yZXN1bHQgPSBuZXcgQ29tbWFuZFJlc3VsdChjb21tYW5kLmlubmVyICsgY29tbWFuZC5zY29wZS5wZXJmb3JtKCkgKyBjb21tYW5kLnRlcm1pbmF0ZSgpLCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGNvbW1hbmQucmVzdWx0ID0gbmV3IENvbW1hbmRSZXN1bHQoY29tbWFuZC5kZWZlcihmYWxzZSksIGZhbHNlKTtcbiAgICAgICAgcmV0dXJuIGNvbW1hbmQ7XG4gICAgfSBcbn07XG5leHBvcnQgbGV0IElmID0gbmV3IEFjdGlvbihJZkRlZmluaXRpb24pO1xuXG5leHBvcnQge2RlZmF1bHQgYXMgSUFjdGlvbkRlZmluaXRpb259IGZyb20gJy4vYWN0aW9ucy9JQWN0aW9uRGVmaW5pdGlvbic7XG5leHBvcnQge2RlZmF1bHQgYXMgQWN0aW9ufSBmcm9tICcuL2FjdGlvbnMvQWN0aW9uJzsiLCJpbXBvcnQge1J1bm5lcn0gZnJvbSAnLi9SdW5uZXJzJztcbmltcG9ydCB7QWN0aW9ufSBmcm9tICcuL0FjdGlvbnMnO1xuaW1wb3J0IHtDb25kaXRpb259IGZyb20gJy4vQ29uZGl0aW9ucyc7XG5pbXBvcnQge01vZGlmaWVyfSBmcm9tICcuL01vZGlmaWVycyc7XG5pbXBvcnQge1JlcGxhY2VyfSBmcm9tICcuL1JlcGxhY2Vycyc7XG5pbXBvcnQgQ29tbWFuZFJlc3VsdCBmcm9tICcuL2NvbW1hbmRzL0NvbW1hbmRSZXN1bHQnO1xuaW1wb3J0IFNjb3BlIGZyb20gJy4vU2NvcGUnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb21tYW5kIHtcbiAgICBwdWJsaWMgZGVwZW5kZW50czogQ29tbWFuZFtdID0gW107XG4gICAgcHVibGljIGFjdGlvbjogQWN0aW9uO1xuICAgIHB1YmxpYyBjb25kaXRpb246IENvbmRpdGlvbjtcbiAgICBwdWJsaWMgbW9kaWZpZXJzOiBNb2RpZmllcltdID0gW107XG4gICAgcHVibGljIHJlc3VsdDogQ29tbWFuZFJlc3VsdCA9IG5ldyBDb21tYW5kUmVzdWx0KCcnLCBmYWxzZSk7XG4gICAgY29uc3RydWN0b3IocHVibGljIGluZGV4OiBudW1iZXIsIHB1YmxpYyBsZW5ndGg6IG51bWJlciwgcHVibGljIHN0YXRlbWVudDogc3RyaW5nLCBwdWJsaWMgaW5uZXI6IHN0cmluZywgcHVibGljIHNjb3BlOiBTY29wZSwgcHJpdmF0ZSBydW5uZXI6IFJ1bm5lcil7XG4gICAgICAgIGxldCBhY3Rpb246IEFjdGlvbjtcbiAgICAgICAgZm9yKGFjdGlvbiBvZiBydW5uZXIuZGVmaW5pdGlvbi5hY3Rpb25zKXtcbiAgICAgICAgICAgIGlmKGFjdGlvbi5tYXRjaGVzKHN0YXRlbWVudCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGlvbiA9IGFjdGlvbjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgcGVyZm9ybShwcmV2PzogQ29tbWFuZCk6IENvbW1hbmQge1xuICAgICAgICByZXR1cm4gdGhpcy5ydW5uZXIucGVyZm9ybSh0aGlzLCBwcmV2KTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHJlcGxhY2UocmVwbGFjZXI6IFJlcGxhY2VyKXtcbiAgICAgICAgdGhpcy5yZXN1bHQudGV4dCA9IHJlcGxhY2VyLnJlcGxhY2UodGhpcy5yZXN1bHQudGV4dCwgdGhpcy5zY29wZS52YXJpYWJsZXMpO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgZGVmZXIocGFzc2VkOiBib29sZWFuKTogc3RyaW5nIHtcbiAgICAgICAgbGV0IGRlcGVuZGVudDpDb21tYW5kLCB0ZXh0OiBzdHJpbmcgPSAnJztcbiAgICAgICAgZm9yKGRlcGVuZGVudCBvZiB0aGlzLmRlcGVuZGVudHMpe1xuICAgICAgICAgICAgdGV4dCArPSBkZXBlbmRlbnQucGVyZm9ybSh0aGlzKS5yZXN1bHQudGV4dDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGV4dDtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHRlcm1pbmF0ZSgpOiBzdHJpbmd7XG4gICAgICAgIHJldHVybiB0aGlzLmRlcGVuZGVudHMuc29tZShjb21tYW5kID0+IGNvbW1hbmQuYWN0aW9uLmRlZmluaXRpb24udGVybWluYXRvcilcblx0XHQgID8gdGhpcy5kZXBlbmRlbnRzLmZpbHRlcihjb21tYW5kID0+IGNvbW1hbmQuYWN0aW9uLmRlZmluaXRpb24udGVybWluYXRvcilbMF0ucGVyZm9ybSgpLnJlc3VsdC50ZXh0XG5cdFx0ICA6ICcnO1xuICAgIH1cbn0iLCJpbXBvcnQgSUNvbmRpdGlvbkRlZmluaXRpb24gZnJvbSAnLi9jb25kaXRpb25zL0lDb25kaXRpb25EZWZpbml0aW9uJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4vSVZhcmlhYmxlcyc7XG5pbXBvcnQgQ29uZGl0aW9uIGZyb20gJy4vY29uZGl0aW9ucy9Db25kaXRpb24nO1xuaW1wb3J0IHtOb3QsIE9yRXF1YWx9IGZyb20gJy4vTW9kaWZpZXJzJztcbmltcG9ydCBWYWx1ZSBmcm9tICcuL1ZhbHVlJztcbmxldCBFcXVhbERlZmluaXRpb246IElDb25kaXRpb25EZWZpbml0aW9uID0ge1xuICAgIHRlbXBsYXRlOiAnKHYpIChtKT0obSkgKHYpJyxcbiAgICBpdGVtczogWyd2YWx1ZScsIFtOb3QsIE9yRXF1YWxdLCBbT3JFcXVhbF0sICd2YWx1ZSddLFxuICAgIG1vZE9yZGVyOiBbMSwwXSxcbiAgICBydWxlOiAodmFsdWVzOiBWYWx1ZVtdLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBib29sZWFuID0+IHZhbHVlc1swXS5ldmFsdWF0ZSh2YXJpYWJsZXMpID09PSB2YWx1ZXNbMV0uZXZhbHVhdGUodmFyaWFibGVzKVxufVxuZXhwb3J0IGxldCBFcXVhbCA9IG5ldyBDb25kaXRpb24oRXF1YWxEZWZpbml0aW9uKTtcblxubGV0IEdyZWF0ZXJUaGFuRGVmaW5pdGlvbjogSUNvbmRpdGlvbkRlZmluaXRpb24gPSB7XG4gICAgdGVtcGxhdGU6ICcodikgKG0pPihtKSAodiknLFxuICAgIGl0ZW1zOiBbJ3ZhbHVlJywgW05vdF0sIFtPckVxdWFsXSwgJ3ZhbHVlJ10sXG4gICAgbW9kT3JkZXI6IFsxLDBdLFxuICAgIHJ1bGU6ICh2YWx1ZXM6IFZhbHVlW10sIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IGJvb2xlYW4gPT4gdmFsdWVzWzBdLmV2YWx1YXRlKHZhcmlhYmxlcykgPiB2YWx1ZXNbMV0uZXZhbHVhdGUodmFyaWFibGVzKVxufVxuZXhwb3J0IGxldCBHcmVhdGVyVGhhbiA9IG5ldyBDb25kaXRpb24oR3JlYXRlclRoYW5EZWZpbml0aW9uKTtcblxubGV0IExlc3NUaGFuRGVmaW5pdGlvbjogSUNvbmRpdGlvbkRlZmluaXRpb24gPSB7XG4gICAgdGVtcGxhdGU6ICcodikgKG0pPChtKSAodiknLFxuICAgIGl0ZW1zOiBbJ3ZhbHVlJywgW05vdF0sIFtPckVxdWFsXSwgJ3ZhbHVlJ10sXG4gICAgbW9kT3JkZXI6IFsxLDBdLFxuICAgIHJ1bGU6ICh2YWx1ZXM6IFZhbHVlW10sIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IGJvb2xlYW4gPT4gdmFsdWVzWzBdLmV2YWx1YXRlKHZhcmlhYmxlcykgPCB2YWx1ZXNbMV0uZXZhbHVhdGUodmFyaWFibGVzKVxufVxuZXhwb3J0IGxldCBMZXNzVGhhbiA9IG5ldyBDb25kaXRpb24oTGVzc1RoYW5EZWZpbml0aW9uKTtcblxubGV0IElzTnVsbERlZmluaXRpb246IElDb25kaXRpb25EZWZpbml0aW9uID0ge1xuICAgIHRlbXBsYXRlOiAnKHYpIGlzIChtKSBudWxsJyxcbiAgICBpdGVtczogWyd2YWx1ZScsIFtOb3RdXSxcbiAgICBtb2RPcmRlcjogWzBdLFxuICAgIHJ1bGU6ICh2YWx1ZXM6IFZhbHVlW10sIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IGJvb2xlYW4gPT4gdmFsdWVzWzBdLmV2YWx1YXRlKHZhcmlhYmxlcykgPT0gbnVsbFxufVxuZXhwb3J0IGxldCBJc051bGwgPSBuZXcgQ29uZGl0aW9uKElzTnVsbERlZmluaXRpb24pO1xuXG5sZXQgQWxwaGFiZXRpY2FsbHlHcmVhdGVyVGhhbkRlZmluaXRpb246IElDb25kaXRpb25EZWZpbml0aW9uID0ge1xuICAgIHRlbXBsYXRlOiAnKHYpIChtKWFiYz4obSkgKHYpJyxcbiAgICBpdGVtczogWyd2YWx1ZScsIFtOb3RdLCBbT3JFcXVhbF0sICd2YWx1ZSddLFxuICAgIG1vZE9yZGVyOiBbMSwwXSxcbiAgICBydWxlOiAodmFsdWVzOiBWYWx1ZVtdLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBib29sZWFuID0+IFt2YWx1ZXNbMF0uZXZhbHVhdGUodmFyaWFibGVzKSwgdmFsdWVzWzFdLmV2YWx1YXRlKHZhcmlhYmxlcyldLnNvcnQoKS5pbmRleE9mKHZhbHVlc1sxXS5ldmFsdWF0ZSh2YXJpYWJsZXMpKSA+IDBcbn1cbmV4cG9ydCBsZXQgQWxwaGFiZXRpY2FsbHlHcmVhdGVyVGhhbiA9IG5ldyBDb25kaXRpb24oQWxwaGFiZXRpY2FsbHlHcmVhdGVyVGhhbkRlZmluaXRpb24pO1xuXG5sZXQgQWxwaGFiZXRpY2FsbHlMZXNzVGhhbkRlZmluaXRpb246IElDb25kaXRpb25EZWZpbml0aW9uID0ge1xuICAgIHRlbXBsYXRlOiAnKHYpIChtKWFiYzwobSkgKHYpJyxcbiAgICBpdGVtczogWyd2YWx1ZScsIFtOb3RdLCBbT3JFcXVhbF0sICd2YWx1ZSddLFxuICAgIG1vZE9yZGVyOiBbMSwwXSxcbiAgICBydWxlOiAodmFsdWVzOiBWYWx1ZVtdLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBib29sZWFuID0+IFt2YWx1ZXNbMF0uZXZhbHVhdGUodmFyaWFibGVzKSwgdmFsdWVzWzFdLmV2YWx1YXRlKHZhcmlhYmxlcyldLnNvcnQoKS5pbmRleE9mKHZhbHVlc1sxXS5ldmFsdWF0ZSh2YXJpYWJsZXMpKSA9PT0gMFxufVxuZXhwb3J0IGxldCBBbHBoYWJldGljYWxseUxlc3NUaGFuID0gbmV3IENvbmRpdGlvbihBbHBoYWJldGljYWxseUxlc3NUaGFuRGVmaW5pdGlvbik7XG5cbmxldCBMZW5ndGhHcmVhdGVyVGhhbkRlZmluaXRpb246IElDb25kaXRpb25EZWZpbml0aW9uID0ge1xuICAgIHRlbXBsYXRlOiAnKHYpIChtKWxlbj4obSkgKHYpJyxcbiAgICBpdGVtczogWyd2YWx1ZScsIFtOb3RdLCBbT3JFcXVhbF0sICd2YWx1ZSddLFxuICAgIG1vZE9yZGVyOiBbMSwwXSxcbiAgICBydWxlOiAodmFsdWVzOiBWYWx1ZVtdLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBib29sZWFuID0+ICg8c3RyaW5nPnZhbHVlc1swXS5ldmFsdWF0ZSh2YXJpYWJsZXMpKS5sZW5ndGggPiB2YWx1ZXNbMV0uZXZhbHVhdGUodmFyaWFibGVzKVxufVxuZXhwb3J0IGxldCBMZW5ndGhHcmVhdGVyVGhhbiA9IG5ldyBDb25kaXRpb24oTGVuZ3RoR3JlYXRlclRoYW5EZWZpbml0aW9uKTtcblxubGV0IExlbmd0aExlc3NUaGFuRGVmaW5pdGlvbjogSUNvbmRpdGlvbkRlZmluaXRpb24gPSB7XG4gICAgdGVtcGxhdGU6ICcodikgKG0pbGVuPChtKSAodiknLFxuICAgIGl0ZW1zOiBbJ3ZhbHVlJywgW05vdF0sIFtPckVxdWFsXSwgJ3ZhbHVlJ10sXG4gICAgbW9kT3JkZXI6IFsxLDBdLFxuICAgIHJ1bGU6ICh2YWx1ZXM6IFZhbHVlW10sIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IGJvb2xlYW4gPT4gKDxzdHJpbmc+dmFsdWVzWzBdLmV2YWx1YXRlKHZhcmlhYmxlcykpLmxlbmd0aCA8IHZhbHVlc1sxXS5ldmFsdWF0ZSh2YXJpYWJsZXMpXG59XG5leHBvcnQgbGV0IExlbmd0aExlc3NUaGFuID0gbmV3IENvbmRpdGlvbihMZW5ndGhMZXNzVGhhbkRlZmluaXRpb24pO1xuXG5sZXQgSXNOYU5EZWZpbml0aW9uOiBJQ29uZGl0aW9uRGVmaW5pdGlvbiA9IHtcbiAgICB0ZW1wbGF0ZTogJyh2KSBpcyAobSkgTmFOJyxcbiAgICBpdGVtczogWyd2YWx1ZScsIFtOb3RdXSxcbiAgICBtb2RPcmRlcjogWzBdLFxuICAgIHJ1bGU6ICh2YWx1ZXM6IFZhbHVlW10sIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IGJvb2xlYW4gPT4gaXNOYU4oKDxudW1iZXI+dmFsdWVzWzBdLmV2YWx1YXRlKHZhcmlhYmxlcykpKVxufVxuZXhwb3J0IGxldCBJc05hTiA9IG5ldyBDb25kaXRpb24oSXNOYU5EZWZpbml0aW9uKTtcblxubGV0IEJldHdlZW5EZWZpbml0aW9uOiBJQ29uZGl0aW9uRGVmaW5pdGlvbiA9IHtcbiAgICB0ZW1wbGF0ZTogJyh2KSAodik+KG0pPCh2KScsXG4gICAgaXRlbXM6IFsndmFsdWUnLCAndmFsdWUnLCBbTm90LCBPckVxdWFsXSwgJ3ZhbHVlJ10sXG4gICAgbW9kT3JkZXI6IFswXSxcbiAgICBydWxlOiAodmFsdWVzOiBWYWx1ZVtdLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBib29sZWFuID0+IHZhbHVlc1sxXS5ldmFsdWF0ZSh2YXJpYWJsZXMpID4gdmFsdWVzWzBdLmV2YWx1YXRlKHZhcmlhYmxlcykgJiYgdmFsdWVzWzJdLmV2YWx1YXRlKHZhcmlhYmxlcykgPCB2YWx1ZXNbMF0uZXZhbHVhdGUodmFyaWFibGVzKSBcbn1cbmV4cG9ydCBsZXQgQmV0d2VlbiA9IG5ldyBDb25kaXRpb24oQmV0d2VlbkRlZmluaXRpb24pO1xuXG5leHBvcnQge2RlZmF1bHQgYXMgQ29uZGl0aW9ufSBmcm9tICcuL2NvbmRpdGlvbnMvQ29uZGl0aW9uJztcbiIsIi8vIGltcG9ydCBJQWN0aW9uIGZyb20gJ2FjdGlvbnMvSUFjdGlvbic7XG4vLyAvKipcbi8vICAqIE1vZHVsZSBvZiBlcnJvciBjaGVja2Vyc1xuLy8gICogQG1vZHVsZSBFcnJvcnNcbi8vICAqIEBjbGFzc1xuLy8gICogQHN0YXRpY1xuLy8gICovXG4vLyBleHBvcnQgZGVmYXVsdCBjbGFzcyBFcnJvcnMge1xuLy8gICAgIC8qKlxuLy8gICAgICAqIEBtZW1iZXJvZiBFcnJvcnNcbi8vICAgICAgKiBAbWV0aG9kXG4vLyAgICAgICogQHN0YXRpY1xuLy8gICAgICAqIEBwYXJhbSB7SUFjdGlvbn0gYWN0aW9uICAgICAgLSBBY3Rpb24gdG8gY2hlY2sgZm9yIGFuIEluY29ycmVjdCBTdGF0ZW1lbnQgZXJyb3Jcbi8vICAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVtZW50ICAgIC0gU3RhdGVtZW50IHRvIGNoZWNrIGZvciBhIEluY29ycmVjdCBTdGF0ZW1lbnQgZXJyb3Jcbi8vICAgICAgKiBAcmV0dXJucyB7c3RyaW5nIHwgbnVsbH0gICAgIC0gVGhlIGVycm9yIG1lc3NhZ2UgaWYgYW55LCBvdGhlcndpc2UgbnVsbCBcbi8vICAgICAgKi9cbi8vICAgICBwdWJsaWMgc3RhdGljIEluY29ycmVjdFN0YXRlbWVudChhY3Rpb246IElBY3Rpb24sIHN0YXRlbWVudDogc3RyaW5nKTogc3RyaW5ne1xuLy8gICAgICAgICBjb25zdCBhY3Rpb25zOnN0cmluZyA9IGFjdGlvbi5jb21tYW5kLmFjdGlvbnMuZmlsdGVyKHggPT4geC5kZXBlbmRlbnRzLnNvbWUoeSA9PiBhY3Rpb24gaW5zdGFuY2VvZiB5KSkubWFwKHggPT4geC5uYW1lKS5qb2luKCcsICcpO1xuLy8gICAgICAgICBjb25zdCBlcnJvcjogc3RyaW5nID0gYEluY29ycmVjdCBzdGF0ZW1lbnQgZm91bmQgYXQgXCIke3N0YXRlbWVudH1cIi4gJHthY3Rpb24uY29uc3RydWN0b3JbJ25hbWUnXX0gbXVzdCBmb2xsb3cgJHthY3Rpb25zfWBcbi8vICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4vLyAgICAgICAgIHJldHVybiBlcnJvcjtcbi8vICAgICB9XG4vLyB9IiwiaW50ZXJmYWNlIEFycmF5PFQ+e1xuXHRsYXN0KCk6IFQ7XG4gICAgaXNGdWxsKCk6IGJvb2xlYW47XG4gICAgY29udGFpbnMoVCk6IGJvb2xlYW47XG59XG5BcnJheS5wcm90b3R5cGUubGFzdCA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiB0aGlzW3RoaXMubGVuZ3RoLTFdO1xufVxuXG5BcnJheS5wcm90b3R5cGUuaXNGdWxsID0gZnVuY3Rpb24oKXtcbiAgICBmb3IobGV0IGk9MDtpPHRoaXMubGVuZ3RoO2krKyl7XG4gICAgICAgIGlmKGkgPT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuQXJyYXkucHJvdG90eXBlLmNvbnRhaW5zID0gZnVuY3Rpb24oVCl7XG4gICAgcmV0dXJuIHRoaXMuc29tZSh4ID0+IHggPT09IFQpO1xufSIsImludGVyZmFjZSBJVmFyaWFibGVzIHtcblx0W2tleTogc3RyaW5nXTogYW55O1xufVxuZXhwb3J0IGRlZmF1bHQgSVZhcmlhYmxlczsiLCJpbXBvcnQge1NRaWdnTFBhcnNlcn0gZnJvbSAnLi9QYXJzZXJzJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4vSVZhcmlhYmxlcyc7XG4vKipcbiAqIFRoZSBzdGFydGluZyBwb2ludCBvZiB0aGUgZW50aXJlIFNRaWdnTCBwYXJzZXJcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IHNxbCAgICAgICAgICAgICAgLSBUaGUgU1FMIHF1ZXJ5IHRvIHJ1biBTUWlnZ0wgYWdhaW5zdFxuICogQHBhcmFtIHtJVmFyaWFibGVzP30gdmFyaWFibGVzICAgLSBPcHRpb25hbCBjb2xsZWN0aW9uIG9mIHZhcmlhYmxlcyBmb3IgeW91ciBTUWlnZ0wgcXVlcnlcbiAqIEByZXR1cm4ge3N0cmluZ30gICAgICAgICAgICAgICAgIC0gVGhlIGZ1bGx5IHBhcnNlZCBTUUwgcXVlcnlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlKHNxbDogc3RyaW5nLCB2YXJpYWJsZXM/OiBJVmFyaWFibGVzKTogc3RyaW5ne1xuXHRTUWlnZ0xQYXJzZXIucGFyc2Uoc3FsLCB2YXJpYWJsZXMpO1xuICAgIHJldHVybiBTUWlnZ0xQYXJzZXIucGVyZm9ybSgpO1xufSIsImltcG9ydCBJTW9kaWZpZXJEZWZpbml0aW9uIGZyb20gJy4vbW9kaWZpZXJzL0lNb2RpZmllckRlZmluaXRpb24nO1xuaW1wb3J0IE1vZGlmaWVyIGZyb20gJy4vbW9kaWZpZXJzL01vZGlmaWVyJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4vSVZhcmlhYmxlcyc7XG5pbXBvcnQgVmFsdWUgZnJvbSAnLi9WYWx1ZSc7XG5cbmxldCBOb3REZWZpbml0aW9uOiBJTW9kaWZpZXJEZWZpbml0aW9uID0ge1xuICAgIGlkZW50aWZpZXJzOiBbLyEvaSwgLyg/OlxcYnxcXHMrKW5vdCg/OlxcYnxcXHMrKS9pXSxcbiAgICBydWxlOiAocGFzczogYm9vbGVhbiwgdmFsdWVzOiBWYWx1ZVtdLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBib29sZWFuID0+ICFwYXNzXG59XG5leHBvcnQgbGV0IE5vdCA9IG5ldyBNb2RpZmllcihOb3REZWZpbml0aW9uKTtcblxubGV0IE9yRXF1YWxEZWZpbml0aW9uOiBJTW9kaWZpZXJEZWZpbml0aW9uID0ge1xuICAgIGlkZW50aWZpZXJzOiBbLz0vaV0sXG4gICAgcnVsZTogKHBhc3M6IGJvb2xlYW4sIHZhbHVlczogVmFsdWVbXSwgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogYm9vbGVhbiA9PiBwYXNzIHx8IHZhbHVlc1swXS5ldmFsdWF0ZSh2YXJpYWJsZXMpID09PSB2YWx1ZXNbMV0uZXZhbHVhdGUodmFyaWFibGVzKVxufVxuZXhwb3J0IGxldCBPckVxdWFsID0gbmV3IE1vZGlmaWVyKE9yRXF1YWxEZWZpbml0aW9uKTtcblxuZXhwb3J0IHtkZWZhdWx0IGFzIElNb2RpZmllckRlZmluaXRpb259IGZyb20gJy4vbW9kaWZpZXJzL0lNb2RpZmllckRlZmluaXRpb24nO1xuZXhwb3J0IHtkZWZhdWx0IGFzIE1vZGlmaWVyfSBmcm9tICcuL21vZGlmaWVycy9Nb2RpZmllcic7ICIsImltcG9ydCBJUGFyc2VyRGVmaW5pdGlvbiBmcm9tICcuL3BhcnNlcnMvSVBhcnNlckRlZmluaXRpb24nO1xuaW1wb3J0IFBhcnNlciBmcm9tICcuL3BhcnNlcnMvUGFyc2VyJztcbmltcG9ydCB7UnVubmVyLCBBY3Rpb25SdW5uZXJ9IGZyb20gJy4vUnVubmVycyc7XG5cbmxldCBTUWlnZ0xQYXJzZXJEZWZpbml0aW9uOiBJUGFyc2VyRGVmaW5pdGlvbiA9IHtcbiAgICBydW5uZXJzOiBbQWN0aW9uUnVubmVyXVxufVxuZXhwb3J0IGxldCBTUWlnZ0xQYXJzZXIgPSBuZXcgUGFyc2VyKFNRaWdnTFBhcnNlckRlZmluaXRpb24pOyBcblxuZXhwb3J0IHtkZWZhdWx0IGFzIElQYXJzZXJEZWZpbml0aW9ufSBmcm9tICcuL3BhcnNlcnMvSVBhcnNlckRlZmluaXRpb24nOyIsImltcG9ydCBJUGxhY2Vob2xkZXIgZnJvbSAnLi9wbGFjZWhvbGRlcnMvSVBsYWNlaG9sZGVyJztcbmltcG9ydCB7TW9kaWZpZXJ9IGZyb20gJy4vTW9kaWZpZXJzJztcbmV4cG9ydCBsZXQgUGxhY2Vob2xkZXJzOiBJUGxhY2Vob2xkZXJbXSA9IFtcbiAgICB7XG4gICAgICAgIG5hbWU6ICd2YWx1ZScsXG4gICAgICAgIGxvY2F0b3I6IC9cXCh2XFwpL2ksXG4gICAgICAgIHJlcGxhY2VtZW50OiAoKSA9PiBgKCg/OlwifCcpP1tcXFxcd1xcXFxkXSsoPzpcInwnKT8pYFxuICAgIH0sXG4gICAge1xuICAgICAgICBuYW1lOiAnbW9kaWZpZXInLFxuICAgICAgICBsb2NhdG9yOiAvXFwobVxcKS9pLFxuICAgICAgICByZXBsYWNlbWVudDogKGl0ZW0/OiBNb2RpZmllcltdKSA9PiBgKCg/OiR7aXRlbS5tYXAobW9kaWZpZXIgPT4gbW9kaWZpZXIuZGVmaW5pdGlvbi5pZGVudGlmaWVycy5tYXAoaWRlbnRpZmllciA9PiBpZGVudGlmaWVyLnNvdXJjZSkuam9pbignfCcpKS5qb2luKCd8Jyl9fFxcXFxzKikpYFxuICAgIH1cbl07XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBQbGFjZWhvbGRlcihuYW1lOiBzdHJpbmcpe1xuICAgIHJldHVybiBQbGFjZWhvbGRlcnMuZmlsdGVyKHggPT4geC5uYW1lID09PSBuYW1lKVswXTtcbn0iLCJpbXBvcnQgSVJlcGxhY2VyRGVmaW5pdGlvbiBmcm9tICcuL3JlcGxhY2Vycy9JUmVwbGFjZXJEZWZpbml0aW9uJztcbmltcG9ydCBSZXBsYWNlciBmcm9tICcuL3JlcGxhY2Vycy9SZXBsYWNlcic7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuL0lWYXJpYWJsZXMnO1xuXG5sZXQgVmFyaWFibGVEZWZpbml0aW9uOiBJUmVwbGFjZXJEZWZpbml0aW9uID0ge1xuICAgIHJlZ2V4OiAvKFtee118Xil7eyg/IXspXFxzKihcXHcqKVxccyp9fSg/IX0pL2csXG4gICAgcnVsZTogKGRlZmluaXRpb246IElSZXBsYWNlckRlZmluaXRpb24sIHRleHQ6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogc3RyaW5nID0+IHRleHQucmVwbGFjZShkZWZpbml0aW9uLnJlZ2V4LCAobWF0Y2gsICQxLCAkMikgPT4gJDErdmFyaWFibGVzWyQyXSlcbn1cbmV4cG9ydCBsZXQgVmFyaWFibGUgPSBuZXcgUmVwbGFjZXIoVmFyaWFibGVEZWZpbml0aW9uKTtcblxuZXhwb3J0IHtkZWZhdWx0IGFzIElSZXBsYWNlckRlZmluaXRpb259IGZyb20gJy4vcmVwbGFjZXJzL0lSZXBsYWNlckRlZmluaXRpb24nO1xuZXhwb3J0IHtkZWZhdWx0IGFzIFJlcGxhY2VyfSBmcm9tICcuL3JlcGxhY2Vycy9SZXBsYWNlcic7IiwiaW1wb3J0IElSdW5uZXJEZWZpbml0aW9uIGZyb20gJy4vcnVubmVycy9JUnVubmVyRGVmaW5pdGlvbic7XG5pbXBvcnQgUnVubmVyIGZyb20gJy4vcnVubmVycy9SdW5uZXInO1xuaW1wb3J0IHtBY3Rpb24sIElmLCBFbHNlLCBFbmRJZn0gZnJvbSAnLi9BY3Rpb25zJztcbmltcG9ydCB7UmVwbGFjZXIsIFZhcmlhYmxlfSBmcm9tICcuL1JlcGxhY2Vycyc7XG5cbmxldCBBY3Rpb25SdW5uZXJEZWZpbml0aW9uOiBJUnVubmVyRGVmaW5pdGlvbiA9IHtcbiAgICByZWdleDogL3t7JSguKj8pJX19KFtcXHNcXFNdKj8pPyg/PSg/Ont7JXwkKSkvZ20sXG4gICAgYWN0aW9uczogW0lmLCBFbHNlLCBFbmRJZl0sXG4gICAgcmVwbGFjZXJzOiBbVmFyaWFibGVdXG59XG5leHBvcnQgbGV0IEFjdGlvblJ1bm5lciA9IG5ldyBSdW5uZXIoQWN0aW9uUnVubmVyRGVmaW5pdGlvbik7XG5cbmV4cG9ydCB7ZGVmYXVsdCBhcyBJUnVubmVyRGVmaW5pdGlvbn0gZnJvbSAnLi9ydW5uZXJzL0lSdW5uZXJEZWZpbml0aW9uJztcbmV4cG9ydCB7ZGVmYXVsdCBhcyBSdW5uZXJ9IGZyb20gJy4vcnVubmVycy9SdW5uZXInOyIsImltcG9ydCB7cGFyc2UgYXMgUGFyc2V9IGZyb20gJy4vTWFpbic7XG5sZXQgU1FpZ2dMID0ge1xuICAgIHBhcnNlOiBQYXJzZSxcbiAgICB2ZXJzaW9uOiAnMC4xLjAnLFxuICAgIC8vZXh0ZW5kOiBFeHRlbmRcbn07XG5pZih0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykgd2luZG93WydTUWlnZ0wnXSA9IFNRaWdnTDtcbmV4cG9ydCBkZWZhdWx0IFNRaWdnTDsiLCJpbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuL0lWYXJpYWJsZXMnO1xuaW1wb3J0IENvbW1hbmQgZnJvbSAnLi9Db21tYW5kJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2NvcGUge1xuXHRwdWJsaWMgdmFyaWFibGVzOiBJVmFyaWFibGVzID0ge307XG5cdHB1YmxpYyBjb21tYW5kczogQ29tbWFuZFtdID0gW107XG5cdHB1YmxpYyBkZXBlbmRlbnRzOiBDb21tYW5kW10gPSBbXTtcbiAgICBcbiAgICBwdWJsaWMgcGVyZm9ybSgpOiBzdHJpbmcge1xuICAgICAgICBsZXQgY29tbWFuZDogQ29tbWFuZCwgdGV4dDogc3RyaW5nID0gJyc7XG4gICAgICAgIGZvcihjb21tYW5kIG9mIHRoaXMuY29tbWFuZHMpe1xuICAgICAgICAgICAgdGV4dCArPSBjb21tYW5kLnBlcmZvcm0oKS5yZXN1bHQudGV4dDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGV4dDtcbiAgICB9XG59IiwiaW1wb3J0IFZhbHVlVHlwZSBmcm9tICcuL1ZhbHVlVHlwZSc7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuL0lWYXJpYWJsZXMnO1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmFsdWUge1xuICAgIHB1YmxpYyB0eXBlOiBWYWx1ZVR5cGU7XG4gICAgcHVibGljIHZhbHVlOiBzdHJpbmcgfCBudW1iZXI7XG4gICAgY29uc3RydWN0b3IoaXRlbSl7XG4gICAgICAgIGlmKC8oXCJ8JylbXFx3XFxkXSsoXFwxKS8udGVzdChpdGVtKSkge1xuICAgICAgICAgICAgdGhpcy50eXBlID0gVmFsdWVUeXBlLnN0cmluZztcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSBpdGVtLnN1YnN0cigxLCBpdGVtLmxlbmd0aCAtIDIpO1xuICAgICAgICB9IGVsc2UgaWYoIWlzTmFOKGl0ZW0pKSB7XG4gICAgICAgICAgICB0aGlzLnR5cGUgPSBWYWx1ZVR5cGUubnVtYmVyO1xuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IHBhcnNlRmxvYXQoaXRlbSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnR5cGUgPSBWYWx1ZVR5cGUudmFyaWFibGU7XG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gaXRlbTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgZXZhbHVhdGUodmFyaWFibGVzOiBJVmFyaWFibGVzKTogc3RyaW5nIHwgbnVtYmVye1xuICAgICAgICByZXR1cm4gdGhpcy50eXBlID09PSBWYWx1ZVR5cGUudmFyaWFibGUgPyBpc05hTih2YXJpYWJsZXNbdGhpcy52YWx1ZV0pID8gdmFyaWFibGVzW3RoaXMudmFsdWVdIDogcGFyc2VGbG9hdCh2YXJpYWJsZXNbdGhpcy52YWx1ZV0pIDogdGhpcy52YWx1ZTtcbiAgICB9XG59IiwiZW51bSBWYWx1ZVR5cGUge1xuICAgIHN0cmluZyxcbiAgICBudW1iZXIsXG4gICAgdmFyaWFibGVcbn1cbmV4cG9ydCBkZWZhdWx0IFZhbHVlVHlwZTsiLCJpbXBvcnQgSUFjdGlvbkRlZmluaXRpb24gZnJvbSAnLi9JQWN0aW9uRGVmaW5pdGlvbic7XG5pbXBvcnQge0NvbmRpdGlvbn0gZnJvbSAnLi4vQ29uZGl0aW9ucyc7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcbmltcG9ydCBDb21tYW5kIGZyb20gJy4uL0NvbW1hbmQnO1xuaW1wb3J0IFNjb3BlIGZyb20gJy4uL1Njb3BlJztcbi8vIERPIE5PVCBQVVQgSU5TVEFOQ0UgSVRFTVMgSU4gVEhJUyBDTEFTUywgRFVNTVlcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFjdGlvbiB7XG4gICAgY29uc3RydWN0b3IocHVibGljIGRlZmluaXRpb246IElBY3Rpb25EZWZpbml0aW9uKXtcbiAgICAgICAgaWYoIWRlZmluaXRpb24pIHRocm93ICdBdHRlbXB0ZWQgdG8gaW5zdGF0aWF0ZSBhY3Rpb24gd2l0aG91dCBhIGRlZmluaXRpb24nO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgbWF0Y2hlcyhzdGF0ZW1lbnQ6IHN0cmluZyk6IGJvb2xlYW57XG4gICAgICAgIHJldHVybiB0aGlzLmRlZmluaXRpb24ucmVnZXgudGVzdChzdGF0ZW1lbnQpO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgcGFyc2UoY29tbWFuZDogQ29tbWFuZCl7XG4gICAgICAgIGxldCBjb25kaXRpb246IENvbmRpdGlvbjtcbiAgICAgICAgZm9yKGNvbmRpdGlvbiBvZiB0aGlzLmRlZmluaXRpb24uY29uZGl0aW9ucyl7XG4gICAgICAgICAgICBpZihjb25kaXRpb24ubWF0Y2hlcyhjb21tYW5kLnN0YXRlbWVudCkpIHtcbiAgICAgICAgICAgICAgICBjb21tYW5kLmNvbmRpdGlvbiA9IGNvbmRpdGlvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgcGVyZm9ybShjb21tYW5kOiBDb21tYW5kLCBwcmV2PzogQ29tbWFuZCk6IENvbW1hbmQge1xuICAgICAgICByZXR1cm4gdGhpcy5kZWZpbml0aW9uLnJ1bGUoY29tbWFuZCwgcHJldik7XG4gICAgfVxufSIsImltcG9ydCBBY3Rpb24gZnJvbSAnLi9BY3Rpb24nO1xuaW1wb3J0IHtDb25kaXRpb259IGZyb20gJy4uL0NvbmRpdGlvbnMnO1xuaW1wb3J0IENvbW1hbmQgZnJvbSAnLi4vQ29tbWFuZCc7XG5pbXBvcnQgU2NvcGUgZnJvbSAnLi4vU2NvcGUnO1xuXG5pbnRlcmZhY2UgSUFjdGlvbkRlZmluaXRpb24ge1xuICAgIHJlZ2V4OiBSZWdFeHA7XG4gICAgY29uZGl0aW9uczogQ29uZGl0aW9uW107XG4gICAgZGVwZW5kZW50czogQWN0aW9uW107XG4gICAgdGVybWluYXRvcjogYm9vbGVhbjtcbiAgICBydWxlOiAoY29tbWFuZDogQ29tbWFuZCwgcHJldj86IENvbW1hbmQpID0+IENvbW1hbmQ7XG59XG5leHBvcnQgZGVmYXVsdCBJQWN0aW9uRGVmaW5pdGlvbjsiLCJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbW1hbmRSZXN1bHQge1xuICAgIHB1YmxpYyBkZXBlbmRlbnQ6IENvbW1hbmRSZXN1bHQ7XG4gICAgY29uc3RydWN0b3IocHVibGljIHRleHQ6IHN0cmluZywgcHVibGljIHBhc3NlZD86IGJvb2xlYW4pe31cbn0iLCJpbXBvcnQgUGxhY2Vob2xkZXIgZnJvbSAnLi4vUGxhY2Vob2xkZXJzJztcbmltcG9ydCBDb25kaXRpb25SZXN1bHQgZnJvbSAnLi9Db25kaXRpb25SZXN1bHQnO1xuaW1wb3J0IElDb25kaXRpb25JbmRpY2VzIGZyb20gJy4vSUNvbmRpdGlvbkluZGljZXMnO1xuaW1wb3J0IElDb25kaXRpb25EZWZpbml0aW9uIGZyb20gJy4vSUNvbmRpdGlvbkRlZmluaXRpb24nO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5pbXBvcnQgQ29tbWFuZCBmcm9tICcuLi9Db21tYW5kJztcbmltcG9ydCB7TW9kaWZpZXJ9IGZyb20gJy4uL01vZGlmaWVycydcbmltcG9ydCBWYWx1ZSBmcm9tICcuLi9WYWx1ZSc7XG5pbXBvcnQgJy4uL0V4dGVuc2lvbnMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb25kaXRpb24ge1xuICAgIHByaXZhdGUgcmVnZXg6IFJlZ0V4cDtcbiAgICBwcml2YXRlIGluZGljaWVzOiBJQ29uZGl0aW9uSW5kaWNlcyA9IHt9O1xuICAgIHByaXZhdGUgdGVtcGxhdGU6IHN0cmluZztcbiAgICBwcml2YXRlIGl0ZW1zOiBBcnJheTxzdHJpbmcgfCBNb2RpZmllcltdPjtcbiAgICBwcml2YXRlIHJ1bGU6ICh2YWx1ZXM6IFZhbHVlW10sIHZhcmlhYmxlczogSVZhcmlhYmxlcykgPT4gYm9vbGVhbjtcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGRlZmluaXRpb246IElDb25kaXRpb25EZWZpbml0aW9uKXtcbiAgICAgICAgaWYoIWRlZmluaXRpb24pIHRocm93ICdBdHRlbXB0ZWQgdG8gaW5zdGF0aWF0ZSBjb25kaXRpb24gd2l0aG91dCBhIGRlZmluaXRpb24nO1xuICAgICAgICB0aGlzLnJlZ2V4ID0gdGhpcy50cmFuc2xhdGUodGhpcy5kZWZpbml0aW9uKTtcbiAgICAgICAgdGhpcy50ZW1wbGF0ZSA9IGRlZmluaXRpb24udGVtcGxhdGU7XG4gICAgICAgIHRoaXMuaXRlbXMgPSBkZWZpbml0aW9uLml0ZW1zO1xuICAgICAgICB0aGlzLnJ1bGUgPSBkZWZpbml0aW9uLnJ1bGU7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgdHJhbnNsYXRlKGRlZmluaXRpb246IElDb25kaXRpb25EZWZpbml0aW9uKTogUmVnRXhwe1xuICAgICAgICBsZXQgdGVtcGxhdGUgPSBkZWZpbml0aW9uLnRlbXBsYXRlLCBpdGVtOiAoc3RyaW5nIHwgTW9kaWZpZXJbXSksIG5hbWU6IHN0cmluZywgaWR4PTE7XG4gICAgICAgIGZvcihpdGVtIG9mIGRlZmluaXRpb24uaXRlbXMpe1xuICAgICAgICAgICAgaWYoIWl0ZW0pIHRocm93ICdJbnZhbGlkIGl0ZW0gaW4gaXRlbXMgZGVmaW5pdGlvbic7XG4gICAgICAgICAgICBpZihpdGVtIGluc3RhbmNlb2YgQXJyYXkpIG5hbWUgPSAnbW9kaWZpZXInO1xuICAgICAgICAgICAgZWxzZSBuYW1lID0gPHN0cmluZz5pdGVtO1xuICAgICAgICAgICAgbGV0IHBsYWNlaG9sZGVyID0gUGxhY2Vob2xkZXIobmFtZSk7XG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IHRlbXBsYXRlLnJlcGxhY2UocGxhY2Vob2xkZXIubG9jYXRvciwgcGxhY2Vob2xkZXIucmVwbGFjZW1lbnQoaXRlbSBpbnN0YW5jZW9mIEFycmF5ID8gaXRlbSA6IG51bGwpKTtcbiAgICAgICAgICAgIGlmKHRoaXMuaW5kaWNpZXNbbmFtZV0gaW5zdGFuY2VvZiBBcnJheSkgKDxudW1iZXJbXT50aGlzLmluZGljaWVzW25hbWVdKS5wdXNoKGlkeCk7XG4gICAgICAgICAgICBlbHNlIGlmKCFpc05hTig8YW55PnRoaXMuaW5kaWNpZXNbbmFtZV0pKSB7XG4gICAgICAgICAgICAgICAgbGV0IGFycmF5ID0gW107XG4gICAgICAgICAgICAgICAgYXJyYXkucHVzaCh0aGlzLmluZGljaWVzW25hbWVdKTtcbiAgICAgICAgICAgICAgICBhcnJheS5wdXNoKGlkeCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbmRpY2llc1tuYW1lXSA9IGFycmF5O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB0aGlzLmluZGljaWVzW25hbWVdID0gaWR4O1xuICAgICAgICAgICAgdGhpcy5pbmRpY2llc1tpZHhdID0gbmFtZTtcbiAgICAgICAgICAgIGlkeCsrO1xuICAgICAgICB9XG4gICAgICAgIHRlbXBsYXRlID0gdGVtcGxhdGUucmVwbGFjZSgvXFxzKy9nLCAnKD86XFxcXGJ8XFxcXHMrKScpO1xuICAgICAgICBjb25zb2xlLmxvZyh0ZW1wbGF0ZSk7XG4gICAgICAgIHJldHVybiBuZXcgUmVnRXhwKHRlbXBsYXRlLCAnaScpO1xuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIHBhcnNlKGNvbW1hbmQ6IENvbW1hbmQpOiBDb25kaXRpb25SZXN1bHQge1xuICAgICAgICBsZXQgcmVzdWx0ID0gbmV3IENvbmRpdGlvblJlc3VsdCgpLCBtYXRjaCA9IGNvbW1hbmQuc3RhdGVtZW50Lm1hdGNoKHRoaXMucmVnZXgpLCBpLCBtb2RpZmllcjogTW9kaWZpZXIsIG1vZE51bWJlcjogbnVtYmVyID0gLTE7XG4gICAgICAgIHJlc3VsdC5zdGF0ZW1lbnQgPSBtYXRjaFswXTtcbiAgICAgICAgZm9yKGk9MTtpPG1hdGNoLmxlbmd0aDtpKyspe1xuICAgICAgICAgICAgaWYodGhpcy5pdGVtc1tpLTFdIGluc3RhbmNlb2YgQXJyYXkpe1xuICAgICAgICAgICAgICAgIG1vZE51bWJlcisrO1xuICAgICAgICAgICAgICAgIGZvcihtb2RpZmllciBvZiA8TW9kaWZpZXJbXT50aGlzLml0ZW1zW2ktMV0pe1xuICAgICAgICAgICAgICAgICAgICBpZihtb2RpZmllci5tYXRjaGVzKG1hdGNoW2ldKSkgcmVzdWx0LnNldCg8c3RyaW5nPnRoaXMuaW5kaWNpZXNbaV0sIG1vZGlmaWVyLCBtb2ROdW1iZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgcmVzdWx0LnNldCg8c3RyaW5nPnRoaXMuaW5kaWNpZXNbaV0sIG1hdGNoW2ldKVxuICAgICAgICB9XG4gICAgICAgIHJlc3VsdC52YXJpYWJsZXMgPSBjb21tYW5kLnNjb3BlLnZhcmlhYmxlcztcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHBlcmZvcm0oY29tbWFuZDogQ29tbWFuZCk6IGJvb2xlYW57XG4gICAgICAgIGxldCBwYXJzZWQgPSB0aGlzLnBhcnNlKGNvbW1hbmQpO1xuICAgICAgICBwYXJzZWQucGFzcyA9IHRoaXMucnVsZShwYXJzZWQudmFsdWUsIHBhcnNlZC52YXJpYWJsZXMpO1xuICAgICAgICBsZXQgaW5kZXg6IG51bWJlcjtcbiAgICAgICAgZm9yKGluZGV4IG9mIHRoaXMuZGVmaW5pdGlvbi5tb2RPcmRlcil7XG4gICAgICAgICAgICBpZihwYXJzZWQubW9kaWZpZXJbaW5kZXhdKSBwYXJzZWQucGFzcyA9IHBhcnNlZC5tb2RpZmllcltpbmRleF0uZGVmaW5pdGlvbi5ydWxlKHBhcnNlZC5wYXNzLCBwYXJzZWQudmFsdWUsIHBhcnNlZC52YXJpYWJsZXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwYXJzZWQucGFzcztcbiAgICB9XG4gICAgXG4gICAgcHVibGljIG1hdGNoZXMoc3RhdGVtZW50OiBzdHJpbmcpe1xuICAgICAgICByZXR1cm4gdGhpcy5yZWdleC50ZXN0KHN0YXRlbWVudCk7XG4gICAgfVxufSIsImltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuaW1wb3J0IHtNb2RpZmllcn0gZnJvbSAnLi4vTW9kaWZpZXJzJztcbmltcG9ydCBWYWx1ZSBmcm9tICcuLi9WYWx1ZSc7XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb25kaXRpb25SZXN1bHQge1xuICAgIHB1YmxpYyBwYXNzOiBib29sZWFuO1xuICAgIHB1YmxpYyB2YWx1ZTogVmFsdWVbXSA9IFtdO1xuICAgIHB1YmxpYyB2YXJpYWJsZXM6IElWYXJpYWJsZXM7XG4gICAgcHVibGljIG1vZGlmaWVyOiBNb2RpZmllcltdID0gW107XG4gICAgcHVibGljIHN0YXRlbWVudDogc3RyaW5nO1xuICAgIHB1YmxpYyBzZXQocHJvcDogc3RyaW5nLCB2YWx1ZTogc3RyaW5nIHwgTW9kaWZpZXIsIGluZGV4PzogbnVtYmVyKXtcbiAgICAgICAgaWYodGhpc1twcm9wXSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICBpZihpbmRleCkgdGhpc1twcm9wXVtpbmRleF0gPSBuZXcgVmFsdWUodmFsdWUpO1xuICAgICAgICAgICAgZWxzZSB0aGlzW3Byb3BdLnB1c2gobmV3IFZhbHVlKHZhbHVlKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB0aGlzW3Byb3BdID0gbmV3IFZhbHVlKHZhbHVlKTtcbiAgICB9XG59IiwiaW1wb3J0IHtNb2RpZmllcn0gZnJvbSAnLi4vTW9kaWZpZXJzJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuaW1wb3J0IFZhbHVlIGZyb20gJy4uL1ZhbHVlJztcbmludGVyZmFjZSBJQ29uZGl0aW9uRGVmaW5pdGlvbiB7XG4gICAgdGVtcGxhdGU6IHN0cmluZztcbiAgICBpdGVtczogQXJyYXk8c3RyaW5nIHwgTW9kaWZpZXJbXT47XG4gICAgbW9kT3JkZXI6IG51bWJlcltdO1xuICAgIHJ1bGU6ICh2YWx1ZXM6IFZhbHVlW10sIHZhcmlhYmxlczogSVZhcmlhYmxlcykgPT4gYm9vbGVhbjtcbn1cbmV4cG9ydCBkZWZhdWx0IElDb25kaXRpb25EZWZpbml0aW9uOyIsImludGVyZmFjZSBJQ29uZGl0aW9uSW5kaWNlcyB7XG4gICAgW2tleTogc3RyaW5nXTogKG51bWJlcltdIHwgbnVtYmVyIHwgc3RyaW5nKTtcbiAgICBba2V5OiBudW1iZXJdOiBzdHJpbmcgfCBudW1iZXIgfCBudW1iZXJbXTtcbn1cbmV4cG9ydCBkZWZhdWx0IElDb25kaXRpb25JbmRpY2VzOyIsImltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuaW1wb3J0IFZhbHVlIGZyb20gJy4uL1ZhbHVlJztcblxuaW50ZXJmYWNlIElNb2RpZmllckRlZmluaXRpb24ge1xuICAgIGlkZW50aWZpZXJzOiBSZWdFeHBbXTtcbiAgICBydWxlOiAocGFzczogYm9vbGVhbiwgdmFsdWVzOiBWYWx1ZVtdLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpID0+IGJvb2xlYW47XG59XG5leHBvcnQgZGVmYXVsdCBJTW9kaWZpZXJEZWZpbml0aW9uOyIsImltcG9ydCBJTW9kaWZpZXJEZWZpbml0aW9uIGZyb20gJy4vSU1vZGlmaWVyRGVmaW5pdGlvbic7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW9kaWZpZXIge1xuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBkZWZpbml0aW9uOklNb2RpZmllckRlZmluaXRpb24pe1xuICAgICAgICBpZighZGVmaW5pdGlvbikgdGhyb3cgJ0F0dGVtcHRlZCB0byBpbnN0YXRpYXRlIG1vZGlmaWVyIHdpdGhvdXQgYSBkZWZpbml0aW9uJztcbiAgICB9XG4gICAgXG4gICAgcHVibGljIG1hdGNoZXModGV4dDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIGxldCBpZGVudGlmaWVyO1xuICAgICAgICBmb3IoaWRlbnRpZmllciBvZiB0aGlzLmRlZmluaXRpb24uaWRlbnRpZmllcnMpe1xuICAgICAgICAgICAgaWYoaWRlbnRpZmllci50ZXN0KHRleHQpKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufSIsImltcG9ydCB7UnVubmVyfSBmcm9tICcuLi9SdW5uZXJzJztcblxuaW50ZXJmYWNlIElQYXJzZXJEZWZpbml0aW9uIHtcbiAgICBydW5uZXJzOiBSdW5uZXJbXVxufVxuZXhwb3J0IGRlZmF1bHQgSVBhcnNlckRlZmluaXRpb247IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL0V4dGVuc2lvbnMudHNcIiAvPlxuaW1wb3J0IElQYXJzZXJEZWZpbml0aW9uIGZyb20gJy4vSVBhcnNlckRlZmluaXRpb24nO1xuaW1wb3J0IHtSdW5uZXIsIEFjdGlvblJ1bm5lcn0gZnJvbSAnLi4vUnVubmVycyc7XG5pbXBvcnQgQ29tbWFuZCBmcm9tICcuLi9Db21tYW5kJztcbmltcG9ydCBTY29wZSBmcm9tICcuLi9TY29wZSc7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcbkFycmF5LnByb3RvdHlwZS5sYXN0ID0gZnVuY3Rpb24oKXtcblx0cmV0dXJuIHRoaXNbdGhpcy5sZW5ndGgtMV07XG59XG4vKipcbiAqIFRoZSBTUWlnZ0wgcGFyc2VyXG4gKiBAbW9kdWxlIFBhcnNlclxuICogQGNsYXNzXG4gKiBAcGFyYW0ge3N0cmluZ30gc3FsICAgICAgICAgICAgICAtIFRoZSBTUWlnZ0wgcXVlcnkgdG8gcnVuIHRoZSBwYXJzZXIgYWdhaW5zdFxuICogQHBhcmFtIHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgICAgLSBBbnkgdmFyaWFibGVzIHBhc3NlZCB0byB0aGUgU1FpZ2dMIHBhcnNlclxuICogQHByb3BlcnR5IHtzdHJpbmd9IHNxbCAgICAgICAgICAgLSBUaGUgU1FpZ2dMIHF1ZXJ5IHRvIHJ1biB0aGUgcGFyc2VyIGFnYWluc3RcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlc30gdmFyaWFibGVzIC0gQW55IHZhcmlhYmxlcyBwYXNzZWQgdG8gdGhlIFNRaWdnTCBwYXJzZXJcbiAqIEBwcm9wZXJ0eSB7Q29tbWFuZFtdfSBjb21tYW5kcyAgIC0gQXJyYXkgb2YgY29tbWFuZHMgZm91bmQgaW4gdGhlIFNRaWdnTCBxdWVyeVxuICogQHByb3BlcnR5IHtDb21tYW5kW119IHN0YWNrICAgICAgLSBDb21tYW5kIHN0YWNrIGZvciBzdG9yaW5nIGN1cnJlbnQgcG9zaXRpb24gaW4gdGhlIHBhcnNpbmcgcHJvY2Vzc1xuICogQHByb3BlcnR5IHtzdHJpbmd9IGVycm9yICAgICAgICAgLSBFcnJvciBzdHJpbmcgaWYgYW55IGVycm9ycyBhcmUgZm91bmQgaW4gdGhlIHBhcnNpbmcgcHJvY2Vzc1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQYXJzZXIge1xuICAgIHB1YmxpYyByZWdleDogUmVnRXhwO1xuXHRwdWJsaWMgY29tbWFuZHM6IENvbW1hbmRbXSA9IFtdO1xuXHRwdWJsaWMgc3RhY2s6IENvbW1hbmRbXSA9IFtdO1xuICAgIHB1YmxpYyBlcnJvcjogc3RyaW5nW10gPSBbXTtcbiAgICBwdWJsaWMgc3FsOiBzdHJpbmc7XG5cdC8vIGNvbnN0cnVjdG9yKHB1YmxpYyBzcWw6IHN0cmluZywgcHVibGljIHZhcmlhYmxlczogSVZhcmlhYmxlcyl7XG5cdFx0Ly8gdGhpcy5jb21tYW5kcyA9IHRoaXMuZXh0cmFjdChzcWwsIHZhcmlhYmxlcyk7XG5cdFx0Ly8gdGhpcy52YXJpYWJsZXMgPSB2YXJpYWJsZXM7XG5cdC8vIH1cbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgZGVmaW5pdGlvbjogSVBhcnNlckRlZmluaXRpb24pe1xuICAgICAgICBpZighZGVmaW5pdGlvbikgdGhyb3cgJ0F0dGVtcHRlZCB0byBpbnN0YXRpYXRlIHBhcnNlciB3aXRob3V0IGEgZGVmaW5pdGlvbic7XG4gICAgICAgIHRoaXMucmVnZXggPSBuZXcgUmVnRXhwKGAoPzoke3RoaXMuZGVmaW5pdGlvbi5ydW5uZXJzLm1hcCh4ID0+IHguZGVmaW5pdGlvbi5yZWdleC5zb3VyY2UpLmpvaW4oJyl8KCcpfSlgLCAnZ20nKTtcbiAgICB9XG5cdC8qKlxuICAgICAqIEV4dHJhY3QgYW55IGNvbW1hbmRzIG91dCBvZiB0aGUgU1FpZ2dMIHF1ZXJ5IGFuZCBkZXRlcm1pbmUgdGhlaXIgb3JkZXIsIG5lc3RpbmcsIGFuZCB0eXBlXG4gICAgICogQG1lbWJlcm9mIFBhcnNlclxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHNxbCAgICAgICAgICAgICAgLSBTUWlnZ0wgcXVlcnkgdG8gZXh0cmFjdCBjb21tYW5kcyBmcm9tXG4gICAgICogQHBhcmFtIHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgICAgLSBBbnkgZ2xvYmFsIHZhcmlhYmxlcyBwYXNzZWQgaW4gdG8gU1FpZ2dMXG4gICAgICogQHJldHVybnMge0NvbW1hbmRbXX0gICAgICAgICAgICAgLSBBcnJheSBvZiBmdWxseSBwYXJzZWQgY29tbWFuZHMsIHJlYWR5IGZvciBleGVjdXRpb25cbiAgICAgKi9cblx0cHVibGljIHBhcnNlKHNxbDogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpe1xuXHQgICAgdGhpcy5jb21tYW5kcyA9IFtdO1xuICAgICAgICB0aGlzLnN0YWNrID0gW107XG4gICAgICAgIHRoaXMuc3FsID0gc3FsO1xuICAgICAgICBsZXQgbWF0Y2g7XG5cdFx0Ly8gQ29tbWFuZC5yZWdleC5sYXN0SW5kZXggPSAwO1xuXHRcdHdoaWxlKChtYXRjaCA9IHRoaXMucmVnZXguZXhlYyhzcWwpKSAhPSBudWxsKXtcbiAgICAgICAgICAgIGxldCBmb3VuZDogQ29tbWFuZCwgcnVubmVyOiBSdW5uZXI7XG4gICAgICAgICAgICBmb3IocnVubmVyIG9mIHRoaXMuZGVmaW5pdGlvbi5ydW5uZXJzKXtcbiAgICAgICAgICAgICAgICBpZihydW5uZXIubWF0Y2hlcyhtYXRjaFswXSkpe1xuICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IG5ldyBDb21tYW5kKG1hdGNoLmluZGV4LCBtYXRjaC5pbnB1dC5sZW5ndGgsIG1hdGNoWzFdLCBtYXRjaFsyXSwgbmV3IFNjb3BlKCksIHJ1bm5lcik7XG4gICAgICAgICAgICAgICAgICAgIGZvdW5kLnNjb3BlLnZhcmlhYmxlcyA9IHZhcmlhYmxlcztcbiAgICAgICAgICAgICAgICAgICAgcnVubmVyLnBhcnNlKGZvdW5kKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cdFx0XHRpZih0aGlzLnN0YWNrLmxlbmd0aCA+IDAgJiYgdGhpcy5zdGFjay5sYXN0KCkuYWN0aW9uLmRlZmluaXRpb24uZGVwZW5kZW50cy5jb250YWlucyhmb3VuZC5hY3Rpb24pKXtcbiAgICAgICAgICAgICAgICAvLyBmb3VuZC5hY3Rpb24uc3VwcG9ydGVyID0gc3RhY2subGFzdCgpO1xuXHRcdFx0XHR0aGlzLnN0YWNrLmxhc3QoKS5kZXBlbmRlbnRzLnB1c2goZm91bmQpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAodGhpcy5zdGFjay5sZW5ndGggPiAwICYmICF0aGlzLnN0YWNrLmxhc3QoKS5hY3Rpb24uZGVmaW5pdGlvbi50ZXJtaW5hdG9yKSB7XG5cdFx0XHRcdHRoaXMuc3RhY2sucHVzaChmb3VuZCk7XG5cdFx0XHRcdHRoaXMuc3RhY2subGFzdCgpLnNjb3BlLmNvbW1hbmRzLnB1c2goZm91bmQpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGlmKHRoaXMuc3RhY2subGVuZ3RoID4gMCAmJiB0aGlzLnN0YWNrLmxhc3QoKS5hY3Rpb24uZGVmaW5pdGlvbi50ZXJtaW5hdG9yKSB0aGlzLnN0YWNrLnBvcCgpO1xuXHRcdFx0XHR0aGlzLnN0YWNrLnB1c2goZm91bmQpO1xuXHRcdFx0XHR0aGlzLmNvbW1hbmRzLnB1c2goZm91bmQpO1xuXHRcdFx0fVxuICAgICAgICAgICAgLy8gbGV0IGVycm9yID0gZm91bmQuYWN0aW9uLnZhbGlkYXRlKCk7XG4gICAgICAgICAgICAvLyBpZihlcnJvcikgcmV0dXJuIFtdO1xuXHRcdH1cblx0XHQvLyByZXR1cm4gY29tbWFuZHM7XG5cdH1cblx0LyoqXG4gICAgICogUnVuIHRoZSBjb21tYW5kcyBhZ2FpbnN0IHRoZSBzdHJpbmcgYW5kIG91dHB1dCB0aGUgZW5kIHJlc3VsdFxuICAgICAqIEBtZW1iZXJvZiBQYXJzZXJcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBlbmQgcmVzdWx0IG9mIHJ1bm5pbmcgYWxsIGNvbW1hbmRzIGFnYWluc3QgdGhlIFNRaWdnTCBxdWVyeVxuICAgICAqL1xuXHRwdWJsaWMgcGVyZm9ybSgpOiBzdHJpbmcge1xuXHRcdHZhciBxdWVyeSA9ICcnLCBpbmRleCA9IDA7XG4gICAgICAgIGlmKHRoaXMuY29tbWFuZHMubGVuZ3RoID09PSAwKSByZXR1cm4gdGhpcy5zcWw7XG5cdFx0Zm9yKHZhciBjb21tYW5kIG9mIHRoaXMuY29tbWFuZHMpe1xuXHRcdFx0cXVlcnkgKz0gdGhpcy5zcWwuc2xpY2UoaW5kZXgsIGNvbW1hbmQuaW5kZXggLTEpO1xuXHRcdFx0cXVlcnkgKz0gY29tbWFuZC5wZXJmb3JtKGNvbW1hbmQpLnJlc3VsdC50ZXh0O1xuXHRcdFx0aW5kZXggKz0gY29tbWFuZC5sZW5ndGg7XG5cdFx0fVxuXHRcdHJldHVybiBxdWVyeTsgLy9UT0RPXG5cdH1cbn0iLCJpbXBvcnQge01vZGlmaWVyfSBmcm9tICcuLi9Nb2RpZmllcnMnO1xuaW50ZXJmYWNlIElQbGFjZWhvbGRlciB7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIGxvY2F0b3I6IFJlZ0V4cDtcbiAgICByZXBsYWNlbWVudDogKGl0ZW0/Ok1vZGlmaWVyW10pID0+IHN0cmluZztcbn1cbmV4cG9ydCBkZWZhdWx0IElQbGFjZWhvbGRlcjsiLCJpbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcblxuaW50ZXJmYWNlIElSZXBsYWNlckRlZmluaXRpb24ge1xuICAgIHJlZ2V4OiBSZWdFeHA7XG4gICAgcnVsZTogKGRlZmluaXRpb246IElSZXBsYWNlckRlZmluaXRpb24sIHRleHQ6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzKSA9PiBzdHJpbmc7XG59XG5leHBvcnQgZGVmYXVsdCBJUmVwbGFjZXJEZWZpbml0aW9uOyIsImltcG9ydCBJUmVwbGFjZXJEZWZpbml0aW9uIGZyb20gJy4vSVJlcGxhY2VyRGVmaW5pdGlvbic7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVwbGFjZXIgeyAgICBcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgZGVmaW5pdGlvbjogSVJlcGxhY2VyRGVmaW5pdGlvbil7XG4gICAgICAgIGlmKCFkZWZpbml0aW9uKSB0aHJvdyAnQXR0ZW1wdGVkIHRvIGluc3RhdGlhdGUgcmVwbGFjZXIgd2l0aG91dCBhIGRlZmluaXRpb24nO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgcmVwbGFjZSh0ZXh0OiBzdHJpbmcsIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IHN0cmluZ3tcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVmaW5pdGlvbi5ydWxlKHRoaXMuZGVmaW5pdGlvbiwgdGV4dCwgdmFyaWFibGVzKTtcbiAgICB9XG59IiwiaW1wb3J0IHtBY3Rpb259IGZyb20gJy4uL0FjdGlvbnMnO1xuaW1wb3J0IHtSZXBsYWNlcn0gZnJvbSAnLi4vUmVwbGFjZXJzJztcblxuaW50ZXJmYWNlIElSdW5uZXJEZWZpbml0aW9uIHtcbiAgICByZWdleDogUmVnRXhwO1xuICAgIGFjdGlvbnM6IEFjdGlvbltdO1xuICAgIHJlcGxhY2VyczogUmVwbGFjZXJbXTtcbn1cbmV4cG9ydCBkZWZhdWx0IElSdW5uZXJEZWZpbml0aW9uOyIsImltcG9ydCBJUnVubmVyRGVmaW5pdGlvbiBmcm9tICcuL0lSdW5uZXJEZWZpbml0aW9uJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuaW1wb3J0IFNjb3BlIGZyb20gJy4uL1Njb3BlJztcbmltcG9ydCB7QWN0aW9ufSBmcm9tICcuLi9BY3Rpb25zJztcbmltcG9ydCBDb21tYW5kIGZyb20gJy4uL0NvbW1hbmQnO1xuaW1wb3J0IHtSZXBsYWNlcn0gZnJvbSAnLi4vUmVwbGFjZXJzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUnVubmVyIHtcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgZGVmaW5pdGlvbjogSVJ1bm5lckRlZmluaXRpb24pe1xuICAgICAgICBpZighZGVmaW5pdGlvbikgdGhyb3cgJ0F0dGVtcHRlZCB0byBpbnN0YXRpYXRlIHJ1bm5lciB3aXRob3V0IGEgZGVmaW5pdGlvbic7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBwYXJzZShjb21tYW5kOiBDb21tYW5kKSB7XG4gICAgICAgIGxldCBhY3Rpb246IEFjdGlvbjtcbiAgICAgICAgZm9yKGFjdGlvbiBvZiB0aGlzLmRlZmluaXRpb24uYWN0aW9ucyl7XG4gICAgICAgICAgICBpZihhY3Rpb24ubWF0Y2hlcyhjb21tYW5kLnN0YXRlbWVudCkpIHtcbiAgICAgICAgICAgICAgICBjb21tYW5kLmFjdGlvbiA9IGFjdGlvbjtcbiAgICAgICAgICAgICAgICBjb21tYW5kLmFjdGlvbi5wYXJzZShjb21tYW5kKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgcGVyZm9ybShjb21tYW5kOiBDb21tYW5kLCBwcmV2PzogQ29tbWFuZCk6IENvbW1hbmQge1xuICAgICAgICBjb21tYW5kLnJlc3VsdCA9IGNvbW1hbmQuYWN0aW9uLnBlcmZvcm0oY29tbWFuZCwgcHJldikucmVzdWx0O1xuICAgICAgICAvLyBjb21tYW5kLnJlc3VsdC5kZXBlbmRlbnQgPSBjb21tYW5kLnNjb3BlLnBlcmZvcm0oY29tbWFuZCkucmVzdWx0O1xuICAgICAgICBsZXQgcmVwbGFjZXI6IFJlcGxhY2VyO1xuICAgICAgICBmb3IocmVwbGFjZXIgb2YgdGhpcy5kZWZpbml0aW9uLnJlcGxhY2Vycyl7XG4gICAgICAgICAgICBjb21tYW5kLnJlcGxhY2UocmVwbGFjZXIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb21tYW5kO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgbWF0Y2hlcyh0ZXh0OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgdGhpcy5kZWZpbml0aW9uLnJlZ2V4Lmxhc3RJbmRleCA9IDA7XG4gICAgICAgIHJldHVybiB0aGlzLmRlZmluaXRpb24ucmVnZXgudGVzdCh0ZXh0KTtcbiAgICB9XG59Il19
