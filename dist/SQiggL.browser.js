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

},{"./Conditions":3,"./actions/Action":15,"./commands/CommandResult":17}],2:[function(require,module,exports){
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

},{"./commands/CommandResult":17}],3:[function(require,module,exports){
var Condition_1 = require('./conditions/Condition');
var Modifiers_1 = require('./Modifiers');
var EqualDefinition = {
    template: '(v) (m)=(m) (c)',
    items: ['variable', [Modifiers_1.Not, Modifiers_1.OrEqual], [Modifiers_1.OrEqual], 'comparative'],
    modOrder: [1, 0],
    rule: function (variable, comparative, variables) { return variables[variable] === comparative; }
};
exports.Equal = new Condition_1.default(EqualDefinition);
var GreaterThanDefinition = {
    template: '(v) (m)>(m) (c)',
    items: ['variable', [Modifiers_1.Not], [Modifiers_1.OrEqual], 'comparative'],
    modOrder: [1, 0],
    rule: function (variable, comparative, variables) { return parseFloat(variables[variable]) > parseFloat(comparative); }
};
exports.GreaterThan = new Condition_1.default(GreaterThanDefinition);
var LessThanDefinition = {
    template: '(v) (m)<(m) (c)',
    items: ['variable', [Modifiers_1.Not], [Modifiers_1.OrEqual], 'comparative'],
    modOrder: [1, 0],
    rule: function (variable, comparative, variables) { return parseFloat(variables[variable]) < parseFloat(comparative); }
};
exports.LessThan = new Condition_1.default(LessThanDefinition);
var IsNullDefinition = {
    template: '(v) is (m) null',
    items: ['variable', [Modifiers_1.Not]],
    modOrder: [0],
    rule: function (variable, comparative, variables) { return variables[variable] == null; }
};
exports.IsNull = new Condition_1.default(IsNullDefinition);
var AlphabeticallyGreaterThanDefinition = {
    template: '(v) (m)abc>(m) (c)',
    items: ['variable', [Modifiers_1.Not], [Modifiers_1.OrEqual], 'comparative'],
    modOrder: [1, 0],
    rule: function (variable, comparative, variables) { return [variables[variable], comparative].sort().indexOf(comparative) > 0; }
};
exports.AlphabeticallyGreaterThan = new Condition_1.default(AlphabeticallyGreaterThanDefinition);
var AlphabeticallyLessThanDefinition = {
    template: '(v) (m)abc<(m) (c)',
    items: ['variable', [Modifiers_1.Not], [Modifiers_1.OrEqual], 'comparative'],
    modOrder: [1, 0],
    rule: function (variable, comparative, variables) { return [variables[variable], comparative].sort().indexOf(comparative) === 0; }
};
exports.AlphabeticallyLessThan = new Condition_1.default(AlphabeticallyLessThanDefinition);
var LengthGreaterThanDefinition = {
    template: '(v) (m)len>(m) (c)',
    items: ['variable', [Modifiers_1.Not], [Modifiers_1.OrEqual], 'comparative'],
    modOrder: [1, 0],
    rule: function (variable, comparative, variables) { return variables[variable].length > parseInt(comparative); }
};
exports.LengthGreaterThan = new Condition_1.default(LengthGreaterThanDefinition);
var LengthLessThanDefinition = {
    template: '(v) (m)len<(m) (c)',
    items: ['variable', [Modifiers_1.Not], [Modifiers_1.OrEqual], 'comparative'],
    modOrder: [1, 0],
    rule: function (variable, comparative, variables) { return variables[variable].length < parseInt(comparative); }
};
exports.LengthLessThan = new Condition_1.default(LengthLessThanDefinition);
var IsNaNDefinition = {
    template: '(v) is (m) NaN',
    items: ['variable', [Modifiers_1.Not]],
    modOrder: [0],
    rule: function (variable, comparative, variables) { return isNaN(variables[variable]); }
};
exports.IsNaN = new Condition_1.default(IsNaNDefinition);
var BetweenDefinition = {
    template: '(v) (c)>(m)<(c)',
    items: ['variable', 'comparative', [Modifiers_1.Not, Modifiers_1.OrEqual], 'comparative'],
    modOrder: [0],
    rule: function (variable, comparative, variables) { return parseFloat(comparative[0]) > parseFloat(variables[variable]) && parseFloat(comparative[1]) < parseFloat(variables[variable]); }
};
exports.Between = new Condition_1.default(BetweenDefinition);
var Condition_2 = require('./conditions/Condition');
exports.Condition = Condition_2.default;

},{"./Modifiers":8,"./conditions/Condition":18}],4:[function(require,module,exports){
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
    rule: function (pass, variable, comparative, variables) { return !pass; }
};
exports.Not = new Modifier_1.default(NotDefinition);
var OrEqualDefinition = {
    identifiers: [/=/i],
    rule: function (pass, variable, comparative, variables) { return pass || variables[variable] === comparative; }
};
exports.OrEqual = new Modifier_1.default(OrEqualDefinition);
var Modifier_2 = require('./modifiers/Modifier');
exports.Modifier = Modifier_2.default;

},{"./modifiers/Modifier":23}],9:[function(require,module,exports){
var Parser_1 = require('./parsers/Parser');
var Runners_1 = require('./Runners');
var SQiggLParserDefinition = {
    runners: [Runners_1.ActionRunner]
};
exports.SQiggLParser = new Parser_1.default(SQiggLParserDefinition);

},{"./Runners":12,"./parsers/Parser":25}],10:[function(require,module,exports){
exports.Placeholders = [
    {
        name: 'variable',
        locator: /\(v\)/i,
        replacement: function () { return '(\\w+)'; }
    },
    {
        name: 'comparative',
        locator: /\(c\)/i,
        replacement: function () { return "(\\d+|[\"']\\w+[\"'])"; }
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

},{"./replacers/Replacer":28}],12:[function(require,module,exports){
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

},{"./Actions":1,"./Replacers":11,"./runners/Runner":30}],13:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){

},{}],17:[function(require,module,exports){
var CommandResult = (function () {
    function CommandResult(text, passed) {
        this.text = text;
        this.passed = passed;
    }
    return CommandResult;
})();
exports.default = CommandResult;

},{}],18:[function(require,module,exports){
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
        parsed.pass = this.rule(parsed.variable, parsed.comparative, parsed.variables);
        var index;
        for (var _i = 0, _a = this.definition.modOrder; _i < _a.length; _i++) {
            index = _a[_i];
            if (parsed.modifier[index])
                parsed.pass = parsed.modifier[index].definition.rule(parsed.pass, parsed.variable, parsed.comparative, parsed.variables);
        }
        return parsed.pass;
    };
    Condition.prototype.matches = function (statement) {
        return this.regex.test(statement);
    };
    return Condition;
})();
exports.default = Condition;

},{"../Extensions":5,"../Placeholders":10,"./ConditionResult":19}],19:[function(require,module,exports){
var ConditionResult = (function () {
    function ConditionResult() {
        this.modifier = [];
    }
    ConditionResult.prototype.set = function (prop, value, index) {
        if (this[prop] instanceof Array) {
            if (index)
                this[prop][index] = value;
            else
                this[prop].push(value);
        }
        else
            this[prop] = value;
    };
    return ConditionResult;
})();
exports.default = ConditionResult;

},{}],20:[function(require,module,exports){

},{}],21:[function(require,module,exports){

},{}],22:[function(require,module,exports){

},{}],23:[function(require,module,exports){
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

},{}],24:[function(require,module,exports){

},{}],25:[function(require,module,exports){
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

},{"../Command":2,"../Scope":14}],26:[function(require,module,exports){

},{}],27:[function(require,module,exports){

},{}],28:[function(require,module,exports){
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

},{}],29:[function(require,module,exports){

},{}],30:[function(require,module,exports){
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

},{}]},{},[1,15,16,2,17,3,18,19,20,21,4,5,6,7,8,22,23,9,24,25,10,26,11,27,28,12,29,30,14,13])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQWN0aW9ucy50cyIsInNyYy9Db21tYW5kLnRzIiwic3JjL0NvbmRpdGlvbnMudHMiLCJzcmMvRXJyb3JzLnRzIiwic3JjL0V4dGVuc2lvbnMudHMiLCJzcmMvSVZhcmlhYmxlcy50cyIsInNyYy9NYWluLnRzIiwic3JjL01vZGlmaWVycy50cyIsInNyYy9QYXJzZXJzLnRzIiwic3JjL1BsYWNlaG9sZGVycy50cyIsInNyYy9SZXBsYWNlcnMudHMiLCJzcmMvUnVubmVycy50cyIsInNyYy9TUWlnZ0wudHMiLCJzcmMvU2NvcGUudHMiLCJzcmMvYWN0aW9ucy9BY3Rpb24udHMiLCJzcmMvYWN0aW9ucy9JQWN0aW9uRGVmaW5pdGlvbi50cyIsInNyYy9jb21tYW5kcy9Db21tYW5kUmVzdWx0LnRzIiwic3JjL2NvbmRpdGlvbnMvQ29uZGl0aW9uLnRzIiwic3JjL2NvbmRpdGlvbnMvQ29uZGl0aW9uUmVzdWx0LnRzIiwic3JjL2NvbmRpdGlvbnMvSUNvbmRpdGlvbkRlZmluaXRpb24udHMiLCJzcmMvY29uZGl0aW9ucy9JQ29uZGl0aW9uSW5kaWNlcy50cyIsInNyYy9tb2RpZmllcnMvSU1vZGlmaWVyRGVmaW5pdGlvbi50cyIsInNyYy9tb2RpZmllcnMvTW9kaWZpZXIudHMiLCJzcmMvcGFyc2Vycy9JUGFyc2VyRGVmaW5pdGlvbi50cyIsInNyYy9wYXJzZXJzL1BhcnNlci50cyIsInNyYy9wbGFjZWhvbGRlcnMvSVBsYWNlaG9sZGVyLnRzIiwic3JjL3JlcGxhY2Vycy9JUmVwbGFjZXJEZWZpbml0aW9uLnRzIiwic3JjL3JlcGxhY2Vycy9SZXBsYWNlci50cyIsInNyYy9ydW5uZXJzL0lSdW5uZXJEZWZpbml0aW9uLnRzIiwic3JjL3J1bm5lcnMvUnVubmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQ0EsOEJBQTBC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LENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBQ0wsYUFBQztBQUFELENBN0JBLEFBNkJDLElBQUE7QUE3QkQsd0JBNkJDLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IElBY3Rpb25EZWZpbml0aW9uIGZyb20gJy4vYWN0aW9ucy9JQWN0aW9uRGVmaW5pdGlvbic7XG5pbXBvcnQgQ29tbWFuZFJlc3VsdCBmcm9tICcuL2NvbW1hbmRzL0NvbW1hbmRSZXN1bHQnO1xuaW1wb3J0IEFjdGlvbiBmcm9tICcuL2FjdGlvbnMvQWN0aW9uJztcbmltcG9ydCBDb21tYW5kIGZyb20gJy4vQ29tbWFuZCc7XG5pbXBvcnQge0NvbmRpdGlvbiwgRXF1YWwsIEdyZWF0ZXJUaGFuLCBMZXNzVGhhbiwgSXNOdWxsLCBBbHBoYWJldGljYWxseUdyZWF0ZXJUaGFuLCBBbHBoYWJldGljYWxseUxlc3NUaGFuLCBMZW5ndGhHcmVhdGVyVGhhbiwgTGVuZ3RoTGVzc1RoYW4sIElzTmFOLCBCZXR3ZWVufSBmcm9tICcuL0NvbmRpdGlvbnMnO1xuaW1wb3J0IFNjb3BlIGZyb20gJy4vU2NvcGUnO1xuXG5sZXQgRW5kSWZEZWZpbml0aW9uOiBJQWN0aW9uRGVmaW5pdGlvbiA9IHtcbiAgICByZWdleDogL15cXHMqZW5kaWZcXGIvaSxcbiAgICBjb25kaXRpb25zOiBbXSxcbiAgICBkZXBlbmRlbnRzOiBbXSxcbiAgICB0ZXJtaW5hdG9yOiB0cnVlLFxuICAgIHJ1bGU6IChjb21tYW5kOiBDb21tYW5kLCBwcmV2PzogQ29tbWFuZCk6IENvbW1hbmQgPT4ge1xuICAgICAgICBjb21tYW5kLnJlc3VsdCA9IG5ldyBDb21tYW5kUmVzdWx0KGNvbW1hbmQuaW5uZXIsIHRydWUpO1xuICAgICAgICByZXR1cm4gY29tbWFuZDtcbiAgICB9XG59O1xuZXhwb3J0IGxldCBFbmRJZiA9IG5ldyBBY3Rpb24oRW5kSWZEZWZpbml0aW9uKTtcblxubGV0IEVsc2VEZWZpbml0aW9uOiBJQWN0aW9uRGVmaW5pdGlvbiA9IHtcbiAgICByZWdleDogL15cXHMqZWxzZVxcYi9pLFxuICAgIGNvbmRpdGlvbnM6IFtdLFxuICAgIGRlcGVuZGVudHM6IFtdLFxuICAgIHRlcm1pbmF0b3I6IGZhbHNlLFxuICAgIHJ1bGU6IChjb21tYW5kOiBDb21tYW5kLCBwcmV2PzogQ29tbWFuZCk6IENvbW1hbmQgPT4ge1xuICAgICAgICBpZighcHJldi5yZXN1bHQucGFzc2VkKSBjb21tYW5kLnJlc3VsdCA9IG5ldyBDb21tYW5kUmVzdWx0KGNvbW1hbmQuaW5uZXIgKyBjb21tYW5kLnNjb3BlLnBlcmZvcm0oKSwgdHJ1ZSk7XG4gICAgICAgIGVsc2UgY29tbWFuZC5yZXN1bHQgPSBuZXcgQ29tbWFuZFJlc3VsdCgnJywgZmFsc2UpO1xuICAgICAgICByZXR1cm4gY29tbWFuZDtcbiAgICB9XG59O1xuZXhwb3J0IGxldCBFbHNlID0gbmV3IEFjdGlvbihFbHNlRGVmaW5pdGlvbik7XG5cbmxldCBJZkRlZmluaXRpb246IElBY3Rpb25EZWZpbml0aW9uID0ge1xuICAgIHJlZ2V4OiAvXlxccyppZlxcYi9pLFxuICAgIGNvbmRpdGlvbnM6IFtFcXVhbCwgR3JlYXRlclRoYW4sIExlc3NUaGFuLCBJc051bGwsIEFscGhhYmV0aWNhbGx5R3JlYXRlclRoYW4sIEFscGhhYmV0aWNhbGx5TGVzc1RoYW4sIExlbmd0aEdyZWF0ZXJUaGFuLCBMZW5ndGhMZXNzVGhhbiwgSXNOYU4sIEJldHdlZW5dLFxuICAgIGRlcGVuZGVudHM6IFtFbHNlLCBFbmRJZl0sXG4gICAgdGVybWluYXRvcjogZmFsc2UsXG4gICAgcnVsZTogKGNvbW1hbmQ6IENvbW1hbmQsIHByZXY/OiBDb21tYW5kKTogQ29tbWFuZCA9PiB7XG4gICAgICAgIGlmKGNvbW1hbmQuY29uZGl0aW9uLnBlcmZvcm0oY29tbWFuZCkpIHtcbiAgICAgICAgICAgIGNvbW1hbmQucmVzdWx0ID0gbmV3IENvbW1hbmRSZXN1bHQoY29tbWFuZC5pbm5lciArIGNvbW1hbmQuc2NvcGUucGVyZm9ybSgpICsgY29tbWFuZC50ZXJtaW5hdGUoKSwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBjb21tYW5kLnJlc3VsdCA9IG5ldyBDb21tYW5kUmVzdWx0KGNvbW1hbmQuZGVmZXIoZmFsc2UpLCBmYWxzZSk7XG4gICAgICAgIHJldHVybiBjb21tYW5kO1xuICAgIH0gXG59O1xuZXhwb3J0IGxldCBJZiA9IG5ldyBBY3Rpb24oSWZEZWZpbml0aW9uKTtcblxuZXhwb3J0IHtkZWZhdWx0IGFzIElBY3Rpb25EZWZpbml0aW9ufSBmcm9tICcuL2FjdGlvbnMvSUFjdGlvbkRlZmluaXRpb24nO1xuZXhwb3J0IHtkZWZhdWx0IGFzIEFjdGlvbn0gZnJvbSAnLi9hY3Rpb25zL0FjdGlvbic7IiwiaW1wb3J0IHtSdW5uZXJ9IGZyb20gJy4vUnVubmVycyc7XG5pbXBvcnQge0FjdGlvbn0gZnJvbSAnLi9BY3Rpb25zJztcbmltcG9ydCB7Q29uZGl0aW9ufSBmcm9tICcuL0NvbmRpdGlvbnMnO1xuaW1wb3J0IHtNb2RpZmllcn0gZnJvbSAnLi9Nb2RpZmllcnMnO1xuaW1wb3J0IHtSZXBsYWNlcn0gZnJvbSAnLi9SZXBsYWNlcnMnO1xuaW1wb3J0IENvbW1hbmRSZXN1bHQgZnJvbSAnLi9jb21tYW5kcy9Db21tYW5kUmVzdWx0JztcbmltcG9ydCBTY29wZSBmcm9tICcuL1Njb3BlJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tbWFuZCB7XG4gICAgcHVibGljIGRlcGVuZGVudHM6IENvbW1hbmRbXSA9IFtdO1xuICAgIHB1YmxpYyBhY3Rpb246IEFjdGlvbjtcbiAgICBwdWJsaWMgY29uZGl0aW9uOiBDb25kaXRpb247XG4gICAgcHVibGljIG1vZGlmaWVyczogTW9kaWZpZXJbXSA9IFtdO1xuICAgIHB1YmxpYyByZXN1bHQ6IENvbW1hbmRSZXN1bHQgPSBuZXcgQ29tbWFuZFJlc3VsdCgnJywgZmFsc2UpO1xuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBpbmRleDogbnVtYmVyLCBwdWJsaWMgbGVuZ3RoOiBudW1iZXIsIHB1YmxpYyBzdGF0ZW1lbnQ6IHN0cmluZywgcHVibGljIGlubmVyOiBzdHJpbmcsIHB1YmxpYyBzY29wZTogU2NvcGUsIHByaXZhdGUgcnVubmVyOiBSdW5uZXIpe1xuICAgICAgICBsZXQgYWN0aW9uOiBBY3Rpb247XG4gICAgICAgIGZvcihhY3Rpb24gb2YgcnVubmVyLmRlZmluaXRpb24uYWN0aW9ucyl7XG4gICAgICAgICAgICBpZihhY3Rpb24ubWF0Y2hlcyhzdGF0ZW1lbnQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hY3Rpb24gPSBhY3Rpb247XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgcHVibGljIHBlcmZvcm0ocHJldj86IENvbW1hbmQpOiBDb21tYW5kIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucnVubmVyLnBlcmZvcm0odGhpcywgcHJldik7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyByZXBsYWNlKHJlcGxhY2VyOiBSZXBsYWNlcil7XG4gICAgICAgIHRoaXMucmVzdWx0LnRleHQgPSByZXBsYWNlci5yZXBsYWNlKHRoaXMucmVzdWx0LnRleHQsIHRoaXMuc2NvcGUudmFyaWFibGVzKTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIGRlZmVyKHBhc3NlZDogYm9vbGVhbik6IHN0cmluZyB7XG4gICAgICAgIGxldCBkZXBlbmRlbnQ6Q29tbWFuZCwgdGV4dDogc3RyaW5nID0gJyc7XG4gICAgICAgIGZvcihkZXBlbmRlbnQgb2YgdGhpcy5kZXBlbmRlbnRzKXtcbiAgICAgICAgICAgIHRleHQgKz0gZGVwZW5kZW50LnBlcmZvcm0odGhpcykucmVzdWx0LnRleHQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyB0ZXJtaW5hdGUoKTogc3RyaW5ne1xuICAgICAgICByZXR1cm4gdGhpcy5kZXBlbmRlbnRzLnNvbWUoY29tbWFuZCA9PiBjb21tYW5kLmFjdGlvbi5kZWZpbml0aW9uLnRlcm1pbmF0b3IpXG5cdFx0ICA/IHRoaXMuZGVwZW5kZW50cy5maWx0ZXIoY29tbWFuZCA9PiBjb21tYW5kLmFjdGlvbi5kZWZpbml0aW9uLnRlcm1pbmF0b3IpWzBdLnBlcmZvcm0oKS5yZXN1bHQudGV4dFxuXHRcdCAgOiAnJztcbiAgICB9XG59IiwiaW1wb3J0IElDb25kaXRpb25EZWZpbml0aW9uIGZyb20gJy4vY29uZGl0aW9ucy9JQ29uZGl0aW9uRGVmaW5pdGlvbic7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuL0lWYXJpYWJsZXMnO1xuaW1wb3J0IENvbmRpdGlvbiBmcm9tICcuL2NvbmRpdGlvbnMvQ29uZGl0aW9uJztcbmltcG9ydCB7Tm90LCBPckVxdWFsfSBmcm9tICcuL01vZGlmaWVycyc7XG5sZXQgRXF1YWxEZWZpbml0aW9uOiBJQ29uZGl0aW9uRGVmaW5pdGlvbiA9IHtcbiAgICB0ZW1wbGF0ZTogJyh2KSAobSk9KG0pIChjKScsXG4gICAgaXRlbXM6IFsndmFyaWFibGUnLCBbTm90LCBPckVxdWFsXSwgW09yRXF1YWxdLCAnY29tcGFyYXRpdmUnXSxcbiAgICBtb2RPcmRlcjogWzEsMF0sXG4gICAgcnVsZTogKHZhcmlhYmxlOiBzdHJpbmcsIGNvbXBhcmF0aXZlOiBzdHJpbmcsIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IGJvb2xlYW4gPT4gdmFyaWFibGVzW3ZhcmlhYmxlXSA9PT0gY29tcGFyYXRpdmVcbn1cbmV4cG9ydCBsZXQgRXF1YWwgPSBuZXcgQ29uZGl0aW9uKEVxdWFsRGVmaW5pdGlvbik7XG5cbmxldCBHcmVhdGVyVGhhbkRlZmluaXRpb246IElDb25kaXRpb25EZWZpbml0aW9uID0ge1xuICAgIHRlbXBsYXRlOiAnKHYpIChtKT4obSkgKGMpJyxcbiAgICBpdGVtczogWyd2YXJpYWJsZScsIFtOb3RdLCBbT3JFcXVhbF0sICdjb21wYXJhdGl2ZSddLFxuICAgIG1vZE9yZGVyOiBbMSwwXSxcbiAgICBydWxlOiAodmFyaWFibGU6IHN0cmluZywgY29tcGFyYXRpdmU6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogYm9vbGVhbiA9PiBwYXJzZUZsb2F0KHZhcmlhYmxlc1t2YXJpYWJsZV0pID4gcGFyc2VGbG9hdChjb21wYXJhdGl2ZSlcbn1cbmV4cG9ydCBsZXQgR3JlYXRlclRoYW4gPSBuZXcgQ29uZGl0aW9uKEdyZWF0ZXJUaGFuRGVmaW5pdGlvbik7XG5cbmxldCBMZXNzVGhhbkRlZmluaXRpb246IElDb25kaXRpb25EZWZpbml0aW9uID0ge1xuICAgIHRlbXBsYXRlOiAnKHYpIChtKTwobSkgKGMpJyxcbiAgICBpdGVtczogWyd2YXJpYWJsZScsIFtOb3RdLCBbT3JFcXVhbF0sICdjb21wYXJhdGl2ZSddLFxuICAgIG1vZE9yZGVyOiBbMSwwXSxcbiAgICBydWxlOiAodmFyaWFibGU6IHN0cmluZywgY29tcGFyYXRpdmU6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogYm9vbGVhbiA9PiBwYXJzZUZsb2F0KHZhcmlhYmxlc1t2YXJpYWJsZV0pIDwgcGFyc2VGbG9hdChjb21wYXJhdGl2ZSlcbn1cbmV4cG9ydCBsZXQgTGVzc1RoYW4gPSBuZXcgQ29uZGl0aW9uKExlc3NUaGFuRGVmaW5pdGlvbik7XG5cbmxldCBJc051bGxEZWZpbml0aW9uOiBJQ29uZGl0aW9uRGVmaW5pdGlvbiA9IHtcbiAgICB0ZW1wbGF0ZTogJyh2KSBpcyAobSkgbnVsbCcsXG4gICAgaXRlbXM6IFsndmFyaWFibGUnLCBbTm90XV0sXG4gICAgbW9kT3JkZXI6IFswXSxcbiAgICBydWxlOiAodmFyaWFibGU6IHN0cmluZywgY29tcGFyYXRpdmU6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogYm9vbGVhbiA9PiB2YXJpYWJsZXNbdmFyaWFibGVdID09IG51bGxcbn1cbmV4cG9ydCBsZXQgSXNOdWxsID0gbmV3IENvbmRpdGlvbihJc051bGxEZWZpbml0aW9uKTtcblxubGV0IEFscGhhYmV0aWNhbGx5R3JlYXRlclRoYW5EZWZpbml0aW9uOiBJQ29uZGl0aW9uRGVmaW5pdGlvbiA9IHtcbiAgICB0ZW1wbGF0ZTogJyh2KSAobSlhYmM+KG0pIChjKScsXG4gICAgaXRlbXM6IFsndmFyaWFibGUnLCBbTm90XSwgW09yRXF1YWxdLCAnY29tcGFyYXRpdmUnXSxcbiAgICBtb2RPcmRlcjogWzEsMF0sXG4gICAgcnVsZTogKHZhcmlhYmxlOiBzdHJpbmcsIGNvbXBhcmF0aXZlOiBzdHJpbmcsIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IGJvb2xlYW4gPT4gW3ZhcmlhYmxlc1t2YXJpYWJsZV0sIGNvbXBhcmF0aXZlXS5zb3J0KCkuaW5kZXhPZihjb21wYXJhdGl2ZSkgPiAwXG59XG5leHBvcnQgbGV0IEFscGhhYmV0aWNhbGx5R3JlYXRlclRoYW4gPSBuZXcgQ29uZGl0aW9uKEFscGhhYmV0aWNhbGx5R3JlYXRlclRoYW5EZWZpbml0aW9uKTtcblxubGV0IEFscGhhYmV0aWNhbGx5TGVzc1RoYW5EZWZpbml0aW9uOiBJQ29uZGl0aW9uRGVmaW5pdGlvbiA9IHtcbiAgICB0ZW1wbGF0ZTogJyh2KSAobSlhYmM8KG0pIChjKScsXG4gICAgaXRlbXM6IFsndmFyaWFibGUnLCBbTm90XSwgW09yRXF1YWxdLCAnY29tcGFyYXRpdmUnXSxcbiAgICBtb2RPcmRlcjogWzEsMF0sXG4gICAgcnVsZTogKHZhcmlhYmxlOiBzdHJpbmcsIGNvbXBhcmF0aXZlOiBzdHJpbmcsIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IGJvb2xlYW4gPT4gW3ZhcmlhYmxlc1t2YXJpYWJsZV0sIGNvbXBhcmF0aXZlXS5zb3J0KCkuaW5kZXhPZihjb21wYXJhdGl2ZSkgPT09IDBcbn1cbmV4cG9ydCBsZXQgQWxwaGFiZXRpY2FsbHlMZXNzVGhhbiA9IG5ldyBDb25kaXRpb24oQWxwaGFiZXRpY2FsbHlMZXNzVGhhbkRlZmluaXRpb24pO1xuXG5sZXQgTGVuZ3RoR3JlYXRlclRoYW5EZWZpbml0aW9uOiBJQ29uZGl0aW9uRGVmaW5pdGlvbiA9IHtcbiAgICB0ZW1wbGF0ZTogJyh2KSAobSlsZW4+KG0pIChjKScsXG4gICAgaXRlbXM6IFsndmFyaWFibGUnLCBbTm90XSwgW09yRXF1YWxdLCAnY29tcGFyYXRpdmUnXSxcbiAgICBtb2RPcmRlcjogWzEsMF0sXG4gICAgcnVsZTogKHZhcmlhYmxlOiBzdHJpbmcsIGNvbXBhcmF0aXZlOiBzdHJpbmcsIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IGJvb2xlYW4gPT4gdmFyaWFibGVzW3ZhcmlhYmxlXS5sZW5ndGggPiBwYXJzZUludChjb21wYXJhdGl2ZSlcbn1cbmV4cG9ydCBsZXQgTGVuZ3RoR3JlYXRlclRoYW4gPSBuZXcgQ29uZGl0aW9uKExlbmd0aEdyZWF0ZXJUaGFuRGVmaW5pdGlvbik7XG5cbmxldCBMZW5ndGhMZXNzVGhhbkRlZmluaXRpb246IElDb25kaXRpb25EZWZpbml0aW9uID0ge1xuICAgIHRlbXBsYXRlOiAnKHYpIChtKWxlbjwobSkgKGMpJyxcbiAgICBpdGVtczogWyd2YXJpYWJsZScsIFtOb3RdLCBbT3JFcXVhbF0sICdjb21wYXJhdGl2ZSddLFxuICAgIG1vZE9yZGVyOiBbMSwwXSxcbiAgICBydWxlOiAodmFyaWFibGU6IHN0cmluZywgY29tcGFyYXRpdmU6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogYm9vbGVhbiA9PiB2YXJpYWJsZXNbdmFyaWFibGVdLmxlbmd0aCA8IHBhcnNlSW50KGNvbXBhcmF0aXZlKVxufVxuZXhwb3J0IGxldCBMZW5ndGhMZXNzVGhhbiA9IG5ldyBDb25kaXRpb24oTGVuZ3RoTGVzc1RoYW5EZWZpbml0aW9uKTtcblxubGV0IElzTmFORGVmaW5pdGlvbjogSUNvbmRpdGlvbkRlZmluaXRpb24gPSB7XG4gICAgdGVtcGxhdGU6ICcodikgaXMgKG0pIE5hTicsXG4gICAgaXRlbXM6IFsndmFyaWFibGUnLCBbTm90XV0sXG4gICAgbW9kT3JkZXI6IFswXSxcbiAgICBydWxlOiAodmFyaWFibGU6IHN0cmluZywgY29tcGFyYXRpdmU6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogYm9vbGVhbiA9PiBpc05hTih2YXJpYWJsZXNbdmFyaWFibGVdKVxufVxuZXhwb3J0IGxldCBJc05hTiA9IG5ldyBDb25kaXRpb24oSXNOYU5EZWZpbml0aW9uKTtcblxubGV0IEJldHdlZW5EZWZpbml0aW9uOiBJQ29uZGl0aW9uRGVmaW5pdGlvbiA9IHtcbiAgICB0ZW1wbGF0ZTogJyh2KSAoYyk+KG0pPChjKScsXG4gICAgaXRlbXM6IFsndmFyaWFibGUnLCAnY29tcGFyYXRpdmUnLCBbTm90LCBPckVxdWFsXSwgJ2NvbXBhcmF0aXZlJ10sXG4gICAgbW9kT3JkZXI6IFswXSxcbiAgICBydWxlOiAodmFyaWFibGU6IHN0cmluZywgY29tcGFyYXRpdmU6IHN0cmluZ1tdLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBib29sZWFuID0+IHBhcnNlRmxvYXQoY29tcGFyYXRpdmVbMF0pID4gcGFyc2VGbG9hdCh2YXJpYWJsZXNbdmFyaWFibGVdKSAmJiBwYXJzZUZsb2F0KGNvbXBhcmF0aXZlWzFdKSA8IHBhcnNlRmxvYXQodmFyaWFibGVzW3ZhcmlhYmxlXSkgXG59XG5leHBvcnQgbGV0IEJldHdlZW4gPSBuZXcgQ29uZGl0aW9uKEJldHdlZW5EZWZpbml0aW9uKTtcblxuZXhwb3J0IHtkZWZhdWx0IGFzIENvbmRpdGlvbn0gZnJvbSAnLi9jb25kaXRpb25zL0NvbmRpdGlvbic7XG4iLCIvLyBpbXBvcnQgSUFjdGlvbiBmcm9tICdhY3Rpb25zL0lBY3Rpb24nO1xuLy8gLyoqXG4vLyAgKiBNb2R1bGUgb2YgZXJyb3IgY2hlY2tlcnNcbi8vICAqIEBtb2R1bGUgRXJyb3JzXG4vLyAgKiBAY2xhc3Ncbi8vICAqIEBzdGF0aWNcbi8vICAqL1xuLy8gZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXJyb3JzIHtcbi8vICAgICAvKipcbi8vICAgICAgKiBAbWVtYmVyb2YgRXJyb3JzXG4vLyAgICAgICogQG1ldGhvZFxuLy8gICAgICAqIEBzdGF0aWNcbi8vICAgICAgKiBAcGFyYW0ge0lBY3Rpb259IGFjdGlvbiAgICAgIC0gQWN0aW9uIHRvIGNoZWNrIGZvciBhbiBJbmNvcnJlY3QgU3RhdGVtZW50IGVycm9yXG4vLyAgICAgICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlbWVudCAgICAtIFN0YXRlbWVudCB0byBjaGVjayBmb3IgYSBJbmNvcnJlY3QgU3RhdGVtZW50IGVycm9yXG4vLyAgICAgICogQHJldHVybnMge3N0cmluZyB8IG51bGx9ICAgICAtIFRoZSBlcnJvciBtZXNzYWdlIGlmIGFueSwgb3RoZXJ3aXNlIG51bGwgXG4vLyAgICAgICovXG4vLyAgICAgcHVibGljIHN0YXRpYyBJbmNvcnJlY3RTdGF0ZW1lbnQoYWN0aW9uOiBJQWN0aW9uLCBzdGF0ZW1lbnQ6IHN0cmluZyk6IHN0cmluZ3tcbi8vICAgICAgICAgY29uc3QgYWN0aW9uczpzdHJpbmcgPSBhY3Rpb24uY29tbWFuZC5hY3Rpb25zLmZpbHRlcih4ID0+IHguZGVwZW5kZW50cy5zb21lKHkgPT4gYWN0aW9uIGluc3RhbmNlb2YgeSkpLm1hcCh4ID0+IHgubmFtZSkuam9pbignLCAnKTtcbi8vICAgICAgICAgY29uc3QgZXJyb3I6IHN0cmluZyA9IGBJbmNvcnJlY3Qgc3RhdGVtZW50IGZvdW5kIGF0IFwiJHtzdGF0ZW1lbnR9XCIuICR7YWN0aW9uLmNvbnN0cnVjdG9yWyduYW1lJ119IG11c3QgZm9sbG93ICR7YWN0aW9uc31gXG4vLyAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuLy8gICAgICAgICByZXR1cm4gZXJyb3I7XG4vLyAgICAgfVxuLy8gfSIsImludGVyZmFjZSBBcnJheTxUPntcblx0bGFzdCgpOiBUO1xuICAgIGlzRnVsbCgpOiBib29sZWFuO1xuICAgIGNvbnRhaW5zKFQpOiBib29sZWFuO1xufVxuQXJyYXkucHJvdG90eXBlLmxhc3QgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gdGhpc1t0aGlzLmxlbmd0aC0xXTtcbn1cblxuQXJyYXkucHJvdG90eXBlLmlzRnVsbCA9IGZ1bmN0aW9uKCl7XG4gICAgZm9yKGxldCBpPTA7aTx0aGlzLmxlbmd0aDtpKyspe1xuICAgICAgICBpZihpID09IG51bGwpIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5cbkFycmF5LnByb3RvdHlwZS5jb250YWlucyA9IGZ1bmN0aW9uKFQpe1xuICAgIHJldHVybiB0aGlzLnNvbWUoeCA9PiB4ID09PSBUKTtcbn0iLCJpbnRlcmZhY2UgSVZhcmlhYmxlcyB7XG5cdFtrZXk6IHN0cmluZ106IGFueTtcbn1cbmV4cG9ydCBkZWZhdWx0IElWYXJpYWJsZXM7IiwiaW1wb3J0IHtTUWlnZ0xQYXJzZXJ9IGZyb20gJy4vUGFyc2Vycyc7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuL0lWYXJpYWJsZXMnO1xuLyoqXG4gKiBUaGUgc3RhcnRpbmcgcG9pbnQgb2YgdGhlIGVudGlyZSBTUWlnZ0wgcGFyc2VyXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBzcWwgICAgICAgICAgICAgIC0gVGhlIFNRTCBxdWVyeSB0byBydW4gU1FpZ2dMIGFnYWluc3RcbiAqIEBwYXJhbSB7SVZhcmlhYmxlcz99IHZhcmlhYmxlcyAgIC0gT3B0aW9uYWwgY29sbGVjdGlvbiBvZiB2YXJpYWJsZXMgZm9yIHlvdXIgU1FpZ2dMIHF1ZXJ5XG4gKiBAcmV0dXJuIHtzdHJpbmd9ICAgICAgICAgICAgICAgICAtIFRoZSBmdWxseSBwYXJzZWQgU1FMIHF1ZXJ5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZShzcWw6IHN0cmluZywgdmFyaWFibGVzPzogSVZhcmlhYmxlcyk6IHN0cmluZ3tcblx0U1FpZ2dMUGFyc2VyLnBhcnNlKHNxbCwgdmFyaWFibGVzKTtcbiAgICByZXR1cm4gU1FpZ2dMUGFyc2VyLnBlcmZvcm0oKTtcbn0iLCJpbXBvcnQgSU1vZGlmaWVyRGVmaW5pdGlvbiBmcm9tICcuL21vZGlmaWVycy9JTW9kaWZpZXJEZWZpbml0aW9uJztcbmltcG9ydCBNb2RpZmllciBmcm9tICcuL21vZGlmaWVycy9Nb2RpZmllcic7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuL0lWYXJpYWJsZXMnO1xuXG5sZXQgTm90RGVmaW5pdGlvbjogSU1vZGlmaWVyRGVmaW5pdGlvbiA9IHtcbiAgICBpZGVudGlmaWVyczogWy8hL2ksIC8oPzpcXGJ8XFxzKylub3QoPzpcXGJ8XFxzKykvaV0sXG4gICAgcnVsZTogKHBhc3M6IGJvb2xlYW4sIHZhcmlhYmxlOiBzdHJpbmcsIGNvbXBhcmF0aXZlOiBzdHJpbmcgfCBzdHJpbmdbXSwgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogYm9vbGVhbiA9PiAhcGFzc1xufVxuZXhwb3J0IGxldCBOb3QgPSBuZXcgTW9kaWZpZXIoTm90RGVmaW5pdGlvbik7XG5cbmxldCBPckVxdWFsRGVmaW5pdGlvbjogSU1vZGlmaWVyRGVmaW5pdGlvbiA9IHtcbiAgICBpZGVudGlmaWVyczogWy89L2ldLFxuICAgIHJ1bGU6IChwYXNzOiBib29sZWFuLCB2YXJpYWJsZTogc3RyaW5nLCBjb21wYXJhdGl2ZTogc3RyaW5nIHwgc3RyaW5nW10sIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IGJvb2xlYW4gPT4gcGFzcyB8fCB2YXJpYWJsZXNbdmFyaWFibGVdID09PSBjb21wYXJhdGl2ZVxufVxuZXhwb3J0IGxldCBPckVxdWFsID0gbmV3IE1vZGlmaWVyKE9yRXF1YWxEZWZpbml0aW9uKTtcblxuZXhwb3J0IHtkZWZhdWx0IGFzIElNb2RpZmllckRlZmluaXRpb259IGZyb20gJy4vbW9kaWZpZXJzL0lNb2RpZmllckRlZmluaXRpb24nO1xuZXhwb3J0IHtkZWZhdWx0IGFzIE1vZGlmaWVyfSBmcm9tICcuL21vZGlmaWVycy9Nb2RpZmllcic7ICIsImltcG9ydCBJUGFyc2VyRGVmaW5pdGlvbiBmcm9tICcuL3BhcnNlcnMvSVBhcnNlckRlZmluaXRpb24nO1xuaW1wb3J0IFBhcnNlciBmcm9tICcuL3BhcnNlcnMvUGFyc2VyJztcbmltcG9ydCB7UnVubmVyLCBBY3Rpb25SdW5uZXJ9IGZyb20gJy4vUnVubmVycyc7XG5cbmxldCBTUWlnZ0xQYXJzZXJEZWZpbml0aW9uOiBJUGFyc2VyRGVmaW5pdGlvbiA9IHtcbiAgICBydW5uZXJzOiBbQWN0aW9uUnVubmVyXVxufVxuZXhwb3J0IGxldCBTUWlnZ0xQYXJzZXIgPSBuZXcgUGFyc2VyKFNRaWdnTFBhcnNlckRlZmluaXRpb24pOyBcblxuZXhwb3J0IHtkZWZhdWx0IGFzIElQYXJzZXJEZWZpbml0aW9ufSBmcm9tICcuL3BhcnNlcnMvSVBhcnNlckRlZmluaXRpb24nOyIsImltcG9ydCBJUGxhY2Vob2xkZXIgZnJvbSAnLi9wbGFjZWhvbGRlcnMvSVBsYWNlaG9sZGVyJztcbmltcG9ydCB7TW9kaWZpZXJ9IGZyb20gJy4vTW9kaWZpZXJzJztcbmV4cG9ydCBsZXQgUGxhY2Vob2xkZXJzOiBJUGxhY2Vob2xkZXJbXSA9IFtcbiAgICB7XG4gICAgICAgIG5hbWU6ICd2YXJpYWJsZScsXG4gICAgICAgIGxvY2F0b3I6IC9cXCh2XFwpL2ksXG4gICAgICAgIHJlcGxhY2VtZW50OiAoKSA9PiAnKFxcXFx3KyknXG4gICAgfSxcbiAgICB7XG4gICAgICAgIG5hbWU6ICdjb21wYXJhdGl2ZScsXG4gICAgICAgIGxvY2F0b3I6IC9cXChjXFwpL2ksXG4gICAgICAgIHJlcGxhY2VtZW50OiAoKSA9PiBgKFxcXFxkK3xbXCInXVxcXFx3K1tcIiddKWBcbiAgICB9LFxuICAgIHtcbiAgICAgICAgbmFtZTogJ21vZGlmaWVyJyxcbiAgICAgICAgbG9jYXRvcjogL1xcKG1cXCkvaSxcbiAgICAgICAgcmVwbGFjZW1lbnQ6IChpdGVtPzogTW9kaWZpZXJbXSkgPT4gYCgoPzoke2l0ZW0ubWFwKG1vZGlmaWVyID0+IG1vZGlmaWVyLmRlZmluaXRpb24uaWRlbnRpZmllcnMubWFwKGlkZW50aWZpZXIgPT4gaWRlbnRpZmllci5zb3VyY2UpLmpvaW4oJ3wnKSkuam9pbignfCcpfXxcXFxccyopKWBcbiAgICB9XG5dO1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gUGxhY2Vob2xkZXIobmFtZTogc3RyaW5nKXtcbiAgICByZXR1cm4gUGxhY2Vob2xkZXJzLmZpbHRlcih4ID0+IHgubmFtZSA9PT0gbmFtZSlbMF07XG59IiwiaW1wb3J0IElSZXBsYWNlckRlZmluaXRpb24gZnJvbSAnLi9yZXBsYWNlcnMvSVJlcGxhY2VyRGVmaW5pdGlvbic7XG5pbXBvcnQgUmVwbGFjZXIgZnJvbSAnLi9yZXBsYWNlcnMvUmVwbGFjZXInO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi9JVmFyaWFibGVzJztcblxubGV0IFZhcmlhYmxlRGVmaW5pdGlvbjogSVJlcGxhY2VyRGVmaW5pdGlvbiA9IHtcbiAgICByZWdleDogLyhbXntdfF4pe3soPyF7KVxccyooXFx3KilcXHMqfX0oPyF9KS9nLFxuICAgIHJ1bGU6IChkZWZpbml0aW9uOiBJUmVwbGFjZXJEZWZpbml0aW9uLCB0ZXh0OiBzdHJpbmcsIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IHN0cmluZyA9PiB0ZXh0LnJlcGxhY2UoZGVmaW5pdGlvbi5yZWdleCwgKG1hdGNoLCAkMSwgJDIpID0+ICQxK3ZhcmlhYmxlc1skMl0pXG59XG5leHBvcnQgbGV0IFZhcmlhYmxlID0gbmV3IFJlcGxhY2VyKFZhcmlhYmxlRGVmaW5pdGlvbik7XG5cbmV4cG9ydCB7ZGVmYXVsdCBhcyBJUmVwbGFjZXJEZWZpbml0aW9ufSBmcm9tICcuL3JlcGxhY2Vycy9JUmVwbGFjZXJEZWZpbml0aW9uJztcbmV4cG9ydCB7ZGVmYXVsdCBhcyBSZXBsYWNlcn0gZnJvbSAnLi9yZXBsYWNlcnMvUmVwbGFjZXInOyIsImltcG9ydCBJUnVubmVyRGVmaW5pdGlvbiBmcm9tICcuL3J1bm5lcnMvSVJ1bm5lckRlZmluaXRpb24nO1xuaW1wb3J0IFJ1bm5lciBmcm9tICcuL3J1bm5lcnMvUnVubmVyJztcbmltcG9ydCB7QWN0aW9uLCBJZiwgRWxzZSwgRW5kSWZ9IGZyb20gJy4vQWN0aW9ucyc7XG5pbXBvcnQge1JlcGxhY2VyLCBWYXJpYWJsZX0gZnJvbSAnLi9SZXBsYWNlcnMnO1xuXG5sZXQgQWN0aW9uUnVubmVyRGVmaW5pdGlvbjogSVJ1bm5lckRlZmluaXRpb24gPSB7XG4gICAgcmVnZXg6IC97eyUoLio/KSV9fShbXFxzXFxTXSo/KT8oPz0oPzp7eyV8JCkpL2dtLFxuICAgIGFjdGlvbnM6IFtJZiwgRWxzZSwgRW5kSWZdLFxuICAgIHJlcGxhY2VyczogW1ZhcmlhYmxlXVxufVxuZXhwb3J0IGxldCBBY3Rpb25SdW5uZXIgPSBuZXcgUnVubmVyKEFjdGlvblJ1bm5lckRlZmluaXRpb24pO1xuXG5leHBvcnQge2RlZmF1bHQgYXMgSVJ1bm5lckRlZmluaXRpb259IGZyb20gJy4vcnVubmVycy9JUnVubmVyRGVmaW5pdGlvbic7XG5leHBvcnQge2RlZmF1bHQgYXMgUnVubmVyfSBmcm9tICcuL3J1bm5lcnMvUnVubmVyJzsiLCJpbXBvcnQge3BhcnNlIGFzIFBhcnNlfSBmcm9tICcuL01haW4nO1xubGV0IFNRaWdnTCA9IHtcbiAgICBwYXJzZTogUGFyc2UsXG4gICAgdmVyc2lvbjogJzAuMS4wJyxcbiAgICAvL2V4dGVuZDogRXh0ZW5kXG59O1xuaWYodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHdpbmRvd1snU1FpZ2dMJ10gPSBTUWlnZ0w7XG5leHBvcnQgZGVmYXVsdCBTUWlnZ0w7IiwiaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi9JVmFyaWFibGVzJztcbmltcG9ydCBDb21tYW5kIGZyb20gJy4vQ29tbWFuZCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNjb3BlIHtcblx0cHVibGljIHZhcmlhYmxlczogSVZhcmlhYmxlcyA9IHt9O1xuXHRwdWJsaWMgY29tbWFuZHM6IENvbW1hbmRbXSA9IFtdO1xuXHRwdWJsaWMgZGVwZW5kZW50czogQ29tbWFuZFtdID0gW107XG4gICAgXG4gICAgcHVibGljIHBlcmZvcm0oKTogc3RyaW5nIHtcbiAgICAgICAgbGV0IGNvbW1hbmQ6IENvbW1hbmQsIHRleHQ6IHN0cmluZyA9ICcnO1xuICAgICAgICBmb3IoY29tbWFuZCBvZiB0aGlzLmNvbW1hbmRzKXtcbiAgICAgICAgICAgIHRleHQgKz0gY29tbWFuZC5wZXJmb3JtKCkucmVzdWx0LnRleHQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxufSIsImltcG9ydCBJQWN0aW9uRGVmaW5pdGlvbiBmcm9tICcuL0lBY3Rpb25EZWZpbml0aW9uJztcbmltcG9ydCB7Q29uZGl0aW9ufSBmcm9tICcuLi9Db25kaXRpb25zJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuaW1wb3J0IENvbW1hbmQgZnJvbSAnLi4vQ29tbWFuZCc7XG5pbXBvcnQgU2NvcGUgZnJvbSAnLi4vU2NvcGUnO1xuLy8gRE8gTk9UIFBVVCBJTlNUQU5DRSBJVEVNUyBJTiBUSElTIENMQVNTLCBEVU1NWVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWN0aW9uIHtcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgZGVmaW5pdGlvbjogSUFjdGlvbkRlZmluaXRpb24pe1xuICAgICAgICBpZighZGVmaW5pdGlvbikgdGhyb3cgJ0F0dGVtcHRlZCB0byBpbnN0YXRpYXRlIGFjdGlvbiB3aXRob3V0IGEgZGVmaW5pdGlvbic7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBtYXRjaGVzKHN0YXRlbWVudDogc3RyaW5nKTogYm9vbGVhbntcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVmaW5pdGlvbi5yZWdleC50ZXN0KHN0YXRlbWVudCk7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBwYXJzZShjb21tYW5kOiBDb21tYW5kKXtcbiAgICAgICAgbGV0IGNvbmRpdGlvbjogQ29uZGl0aW9uO1xuICAgICAgICBmb3IoY29uZGl0aW9uIG9mIHRoaXMuZGVmaW5pdGlvbi5jb25kaXRpb25zKXtcbiAgICAgICAgICAgIGlmKGNvbmRpdGlvbi5tYXRjaGVzKGNvbW1hbmQuc3RhdGVtZW50KSkge1xuICAgICAgICAgICAgICAgIGNvbW1hbmQuY29uZGl0aW9uID0gY29uZGl0aW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBwZXJmb3JtKGNvbW1hbmQ6IENvbW1hbmQsIHByZXY/OiBDb21tYW5kKTogQ29tbWFuZCB7XG4gICAgICAgIHJldHVybiB0aGlzLmRlZmluaXRpb24ucnVsZShjb21tYW5kLCBwcmV2KTtcbiAgICB9XG59IiwiaW1wb3J0IEFjdGlvbiBmcm9tICcuL0FjdGlvbic7XG5pbXBvcnQge0NvbmRpdGlvbn0gZnJvbSAnLi4vQ29uZGl0aW9ucyc7XG5pbXBvcnQgQ29tbWFuZCBmcm9tICcuLi9Db21tYW5kJztcbmltcG9ydCBTY29wZSBmcm9tICcuLi9TY29wZSc7XG5cbmludGVyZmFjZSBJQWN0aW9uRGVmaW5pdGlvbiB7XG4gICAgcmVnZXg6IFJlZ0V4cDtcbiAgICBjb25kaXRpb25zOiBDb25kaXRpb25bXTtcbiAgICBkZXBlbmRlbnRzOiBBY3Rpb25bXTtcbiAgICB0ZXJtaW5hdG9yOiBib29sZWFuO1xuICAgIHJ1bGU6IChjb21tYW5kOiBDb21tYW5kLCBwcmV2PzogQ29tbWFuZCkgPT4gQ29tbWFuZDtcbn1cbmV4cG9ydCBkZWZhdWx0IElBY3Rpb25EZWZpbml0aW9uOyIsIlxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tbWFuZFJlc3VsdCB7XG4gICAgcHVibGljIGRlcGVuZGVudDogQ29tbWFuZFJlc3VsdDtcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgdGV4dDogc3RyaW5nLCBwdWJsaWMgcGFzc2VkPzogYm9vbGVhbil7fVxufSIsImltcG9ydCBQbGFjZWhvbGRlciBmcm9tICcuLi9QbGFjZWhvbGRlcnMnO1xuaW1wb3J0IENvbmRpdGlvblJlc3VsdCBmcm9tICcuL0NvbmRpdGlvblJlc3VsdCc7XG5pbXBvcnQgSUNvbmRpdGlvbkluZGljZXMgZnJvbSAnLi9JQ29uZGl0aW9uSW5kaWNlcyc7XG5pbXBvcnQgSUNvbmRpdGlvbkRlZmluaXRpb24gZnJvbSAnLi9JQ29uZGl0aW9uRGVmaW5pdGlvbic7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcbmltcG9ydCBDb21tYW5kIGZyb20gJy4uL0NvbW1hbmQnO1xuaW1wb3J0IHtNb2RpZmllcn0gZnJvbSAnLi4vTW9kaWZpZXJzJ1xuaW1wb3J0ICcuLi9FeHRlbnNpb25zJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29uZGl0aW9uIHtcbiAgICBwcml2YXRlIHJlZ2V4OiBSZWdFeHA7XG4gICAgcHJpdmF0ZSBpbmRpY2llczogSUNvbmRpdGlvbkluZGljZXMgPSB7fTtcbiAgICBwcml2YXRlIHRlbXBsYXRlOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBpdGVtczogQXJyYXk8c3RyaW5nIHwgTW9kaWZpZXJbXT47XG4gICAgcHJpdmF0ZSBydWxlOiAodmFyaWFibGU6IHN0cmluZywgY29tcGFyYXRpdmU6IHN0cmluZyB8IHN0cmluZ1tdLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpID0+IGJvb2xlYW47XG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBkZWZpbml0aW9uOiBJQ29uZGl0aW9uRGVmaW5pdGlvbil7XG4gICAgICAgIGlmKCFkZWZpbml0aW9uKSB0aHJvdyAnQXR0ZW1wdGVkIHRvIGluc3RhdGlhdGUgY29uZGl0aW9uIHdpdGhvdXQgYSBkZWZpbml0aW9uJztcbiAgICAgICAgdGhpcy5yZWdleCA9IHRoaXMudHJhbnNsYXRlKHRoaXMuZGVmaW5pdGlvbik7XG4gICAgICAgIHRoaXMudGVtcGxhdGUgPSBkZWZpbml0aW9uLnRlbXBsYXRlO1xuICAgICAgICB0aGlzLml0ZW1zID0gZGVmaW5pdGlvbi5pdGVtcztcbiAgICAgICAgdGhpcy5ydWxlID0gZGVmaW5pdGlvbi5ydWxlO1xuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIHRyYW5zbGF0ZShkZWZpbml0aW9uOiBJQ29uZGl0aW9uRGVmaW5pdGlvbik6IFJlZ0V4cHtcbiAgICAgICAgbGV0IHRlbXBsYXRlID0gZGVmaW5pdGlvbi50ZW1wbGF0ZSwgaXRlbTogKHN0cmluZyB8IE1vZGlmaWVyW10pLCBuYW1lOiBzdHJpbmcsIGlkeD0xO1xuICAgICAgICBmb3IoaXRlbSBvZiBkZWZpbml0aW9uLml0ZW1zKXtcbiAgICAgICAgICAgIGlmKCFpdGVtKSB0aHJvdyAnSW52YWxpZCBpdGVtIGluIGl0ZW1zIGRlZmluaXRpb24nO1xuICAgICAgICAgICAgaWYoaXRlbSBpbnN0YW5jZW9mIEFycmF5KSBuYW1lID0gJ21vZGlmaWVyJztcbiAgICAgICAgICAgIGVsc2UgbmFtZSA9IDxzdHJpbmc+aXRlbTtcbiAgICAgICAgICAgIGxldCBwbGFjZWhvbGRlciA9IFBsYWNlaG9sZGVyKG5hbWUpO1xuICAgICAgICAgICAgdGVtcGxhdGUgPSB0ZW1wbGF0ZS5yZXBsYWNlKHBsYWNlaG9sZGVyLmxvY2F0b3IsIHBsYWNlaG9sZGVyLnJlcGxhY2VtZW50KGl0ZW0gaW5zdGFuY2VvZiBBcnJheSA/IGl0ZW0gOiBudWxsKSk7XG4gICAgICAgICAgICBpZih0aGlzLmluZGljaWVzW25hbWVdIGluc3RhbmNlb2YgQXJyYXkpICg8bnVtYmVyW10+dGhpcy5pbmRpY2llc1tuYW1lXSkucHVzaChpZHgpO1xuICAgICAgICAgICAgZWxzZSBpZighaXNOYU4oPGFueT50aGlzLmluZGljaWVzW25hbWVdKSkge1xuICAgICAgICAgICAgICAgIGxldCBhcnJheSA9IFtdO1xuICAgICAgICAgICAgICAgIGFycmF5LnB1c2godGhpcy5pbmRpY2llc1tuYW1lXSk7XG4gICAgICAgICAgICAgICAgYXJyYXkucHVzaChpZHgpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5kaWNpZXNbbmFtZV0gPSBhcnJheTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgdGhpcy5pbmRpY2llc1tuYW1lXSA9IGlkeDtcbiAgICAgICAgICAgIHRoaXMuaW5kaWNpZXNbaWR4XSA9IG5hbWU7XG4gICAgICAgICAgICBpZHgrKztcbiAgICAgICAgfVxuICAgICAgICB0ZW1wbGF0ZSA9IHRlbXBsYXRlLnJlcGxhY2UoL1xccysvZywgJyg/OlxcXFxifFxcXFxzKyknKTtcbiAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAodGVtcGxhdGUsICdpJyk7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgcGFyc2UoY29tbWFuZDogQ29tbWFuZCk6IENvbmRpdGlvblJlc3VsdCB7XG4gICAgICAgIGxldCByZXN1bHQgPSBuZXcgQ29uZGl0aW9uUmVzdWx0KCksIG1hdGNoID0gY29tbWFuZC5zdGF0ZW1lbnQubWF0Y2godGhpcy5yZWdleCksIGksIG1vZGlmaWVyOiBNb2RpZmllciwgbW9kTnVtYmVyOiBudW1iZXIgPSAtMTtcbiAgICAgICAgcmVzdWx0LnN0YXRlbWVudCA9IG1hdGNoWzBdO1xuICAgICAgICBmb3IoaT0xO2k8bWF0Y2gubGVuZ3RoO2krKyl7XG4gICAgICAgICAgICBpZih0aGlzLml0ZW1zW2ktMV0gaW5zdGFuY2VvZiBBcnJheSl7XG4gICAgICAgICAgICAgICAgbW9kTnVtYmVyKys7XG4gICAgICAgICAgICAgICAgZm9yKG1vZGlmaWVyIG9mIDxNb2RpZmllcltdPnRoaXMuaXRlbXNbaS0xXSl7XG4gICAgICAgICAgICAgICAgICAgIGlmKG1vZGlmaWVyLm1hdGNoZXMobWF0Y2hbaV0pKSByZXN1bHQuc2V0KDxzdHJpbmc+dGhpcy5pbmRpY2llc1tpXSwgbW9kaWZpZXIsIG1vZE51bWJlcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSByZXN1bHQuc2V0KDxzdHJpbmc+dGhpcy5pbmRpY2llc1tpXSwgbWF0Y2hbaV0pXG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0LnZhcmlhYmxlcyA9IGNvbW1hbmQuc2NvcGUudmFyaWFibGVzO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgcGVyZm9ybShjb21tYW5kOiBDb21tYW5kKTogYm9vbGVhbntcbiAgICAgICAgbGV0IHBhcnNlZCA9IHRoaXMucGFyc2UoY29tbWFuZCk7XG4gICAgICAgIHBhcnNlZC5wYXNzID0gdGhpcy5ydWxlKHBhcnNlZC52YXJpYWJsZSwgcGFyc2VkLmNvbXBhcmF0aXZlLCBwYXJzZWQudmFyaWFibGVzKTtcbiAgICAgICAgbGV0IGluZGV4OiBudW1iZXI7XG4gICAgICAgIGZvcihpbmRleCBvZiB0aGlzLmRlZmluaXRpb24ubW9kT3JkZXIpe1xuICAgICAgICAgICAgaWYocGFyc2VkLm1vZGlmaWVyW2luZGV4XSkgcGFyc2VkLnBhc3MgPSBwYXJzZWQubW9kaWZpZXJbaW5kZXhdLmRlZmluaXRpb24ucnVsZShwYXJzZWQucGFzcywgcGFyc2VkLnZhcmlhYmxlLCBwYXJzZWQuY29tcGFyYXRpdmUsIHBhcnNlZC52YXJpYWJsZXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwYXJzZWQucGFzcztcbiAgICB9XG4gICAgXG4gICAgcHVibGljIG1hdGNoZXMoc3RhdGVtZW50OiBzdHJpbmcpe1xuICAgICAgICByZXR1cm4gdGhpcy5yZWdleC50ZXN0KHN0YXRlbWVudCk7XG4gICAgfVxufSIsImltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuaW1wb3J0IHtNb2RpZmllcn0gZnJvbSAnLi4vTW9kaWZpZXJzJztcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbmRpdGlvblJlc3VsdCB7XG4gICAgcHVibGljIHBhc3M6IGJvb2xlYW47XG4gICAgcHVibGljIHZhcmlhYmxlOiBzdHJpbmc7XG4gICAgcHVibGljIGNvbXBhcmF0aXZlOiBhbnk7XG4gICAgcHVibGljIHZhcmlhYmxlczogSVZhcmlhYmxlcztcbiAgICBwdWJsaWMgbW9kaWZpZXI6IE1vZGlmaWVyW10gPSBbXTtcbiAgICBwdWJsaWMgc3RhdGVtZW50OiBzdHJpbmc7XG4gICAgcHVibGljIHNldChwcm9wOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcgfCBNb2RpZmllciwgaW5kZXg/OiBudW1iZXIpe1xuICAgICAgICBpZih0aGlzW3Byb3BdIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgIGlmKGluZGV4KSB0aGlzW3Byb3BdW2luZGV4XSA9IHZhbHVlO1xuICAgICAgICAgICAgZWxzZSB0aGlzW3Byb3BdLnB1c2godmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgdGhpc1twcm9wXSA9IHZhbHVlO1xuICAgIH1cbn0iLCJpbXBvcnQge01vZGlmaWVyfSBmcm9tICcuLi9Nb2RpZmllcnMnO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5pbnRlcmZhY2UgSUNvbmRpdGlvbkRlZmluaXRpb24ge1xuICAgIHRlbXBsYXRlOiBzdHJpbmc7XG4gICAgaXRlbXM6IEFycmF5PHN0cmluZyB8IE1vZGlmaWVyW10+O1xuICAgIG1vZE9yZGVyOiBudW1iZXJbXTtcbiAgICBydWxlOiAodmFyaWFibGU6IHN0cmluZywgY29tcGFyYXRpdmU6IHN0cmluZyB8IHN0cmluZ1tdLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpID0+IGJvb2xlYW47XG59XG5leHBvcnQgZGVmYXVsdCBJQ29uZGl0aW9uRGVmaW5pdGlvbjsiLCJpbnRlcmZhY2UgSUNvbmRpdGlvbkluZGljZXMge1xuICAgIFtrZXk6IHN0cmluZ106IChudW1iZXJbXSB8IG51bWJlciB8IHN0cmluZyk7XG4gICAgW2tleTogbnVtYmVyXTogc3RyaW5nIHwgbnVtYmVyIHwgbnVtYmVyW107XG59XG5leHBvcnQgZGVmYXVsdCBJQ29uZGl0aW9uSW5kaWNlczsiLCJpbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcblxuaW50ZXJmYWNlIElNb2RpZmllckRlZmluaXRpb24ge1xuICAgIGlkZW50aWZpZXJzOiBSZWdFeHBbXTtcbiAgICBydWxlOiAocGFzczogYm9vbGVhbiwgdmFyaWFibGU6IHN0cmluZywgY29tcGFyYXRpdmU6IHN0cmluZyB8IHN0cmluZ1tdLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpID0+IGJvb2xlYW47XG59XG5leHBvcnQgZGVmYXVsdCBJTW9kaWZpZXJEZWZpbml0aW9uOyIsImltcG9ydCBJTW9kaWZpZXJEZWZpbml0aW9uIGZyb20gJy4vSU1vZGlmaWVyRGVmaW5pdGlvbic7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW9kaWZpZXIge1xuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBkZWZpbml0aW9uOklNb2RpZmllckRlZmluaXRpb24pe1xuICAgICAgICBpZighZGVmaW5pdGlvbikgdGhyb3cgJ0F0dGVtcHRlZCB0byBpbnN0YXRpYXRlIG1vZGlmaWVyIHdpdGhvdXQgYSBkZWZpbml0aW9uJztcbiAgICB9XG4gICAgXG4gICAgcHVibGljIG1hdGNoZXModGV4dDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIGxldCBpZGVudGlmaWVyO1xuICAgICAgICBmb3IoaWRlbnRpZmllciBvZiB0aGlzLmRlZmluaXRpb24uaWRlbnRpZmllcnMpe1xuICAgICAgICAgICAgaWYoaWRlbnRpZmllci50ZXN0KHRleHQpKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufSIsImltcG9ydCB7UnVubmVyfSBmcm9tICcuLi9SdW5uZXJzJztcblxuaW50ZXJmYWNlIElQYXJzZXJEZWZpbml0aW9uIHtcbiAgICBydW5uZXJzOiBSdW5uZXJbXVxufVxuZXhwb3J0IGRlZmF1bHQgSVBhcnNlckRlZmluaXRpb247IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL0V4dGVuc2lvbnMudHNcIiAvPlxuaW1wb3J0IElQYXJzZXJEZWZpbml0aW9uIGZyb20gJy4vSVBhcnNlckRlZmluaXRpb24nO1xuaW1wb3J0IHtSdW5uZXIsIEFjdGlvblJ1bm5lcn0gZnJvbSAnLi4vUnVubmVycyc7XG5pbXBvcnQgQ29tbWFuZCBmcm9tICcuLi9Db21tYW5kJztcbmltcG9ydCBTY29wZSBmcm9tICcuLi9TY29wZSc7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcbkFycmF5LnByb3RvdHlwZS5sYXN0ID0gZnVuY3Rpb24oKXtcblx0cmV0dXJuIHRoaXNbdGhpcy5sZW5ndGgtMV07XG59XG4vKipcbiAqIFRoZSBTUWlnZ0wgcGFyc2VyXG4gKiBAbW9kdWxlIFBhcnNlclxuICogQGNsYXNzXG4gKiBAcGFyYW0ge3N0cmluZ30gc3FsICAgICAgICAgICAgICAtIFRoZSBTUWlnZ0wgcXVlcnkgdG8gcnVuIHRoZSBwYXJzZXIgYWdhaW5zdFxuICogQHBhcmFtIHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgICAgLSBBbnkgdmFyaWFibGVzIHBhc3NlZCB0byB0aGUgU1FpZ2dMIHBhcnNlclxuICogQHByb3BlcnR5IHtzdHJpbmd9IHNxbCAgICAgICAgICAgLSBUaGUgU1FpZ2dMIHF1ZXJ5IHRvIHJ1biB0aGUgcGFyc2VyIGFnYWluc3RcbiAqIEBwcm9wZXJ0eSB7SVZhcmlhYmxlc30gdmFyaWFibGVzIC0gQW55IHZhcmlhYmxlcyBwYXNzZWQgdG8gdGhlIFNRaWdnTCBwYXJzZXJcbiAqIEBwcm9wZXJ0eSB7Q29tbWFuZFtdfSBjb21tYW5kcyAgIC0gQXJyYXkgb2YgY29tbWFuZHMgZm91bmQgaW4gdGhlIFNRaWdnTCBxdWVyeVxuICogQHByb3BlcnR5IHtDb21tYW5kW119IHN0YWNrICAgICAgLSBDb21tYW5kIHN0YWNrIGZvciBzdG9yaW5nIGN1cnJlbnQgcG9zaXRpb24gaW4gdGhlIHBhcnNpbmcgcHJvY2Vzc1xuICogQHByb3BlcnR5IHtzdHJpbmd9IGVycm9yICAgICAgICAgLSBFcnJvciBzdHJpbmcgaWYgYW55IGVycm9ycyBhcmUgZm91bmQgaW4gdGhlIHBhcnNpbmcgcHJvY2Vzc1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQYXJzZXIge1xuICAgIHB1YmxpYyByZWdleDogUmVnRXhwO1xuXHRwdWJsaWMgY29tbWFuZHM6IENvbW1hbmRbXSA9IFtdO1xuXHRwdWJsaWMgc3RhY2s6IENvbW1hbmRbXSA9IFtdO1xuICAgIHB1YmxpYyBlcnJvcjogc3RyaW5nW10gPSBbXTtcbiAgICBwdWJsaWMgc3FsOiBzdHJpbmc7XG5cdC8vIGNvbnN0cnVjdG9yKHB1YmxpYyBzcWw6IHN0cmluZywgcHVibGljIHZhcmlhYmxlczogSVZhcmlhYmxlcyl7XG5cdFx0Ly8gdGhpcy5jb21tYW5kcyA9IHRoaXMuZXh0cmFjdChzcWwsIHZhcmlhYmxlcyk7XG5cdFx0Ly8gdGhpcy52YXJpYWJsZXMgPSB2YXJpYWJsZXM7XG5cdC8vIH1cbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgZGVmaW5pdGlvbjogSVBhcnNlckRlZmluaXRpb24pe1xuICAgICAgICBpZighZGVmaW5pdGlvbikgdGhyb3cgJ0F0dGVtcHRlZCB0byBpbnN0YXRpYXRlIHBhcnNlciB3aXRob3V0IGEgZGVmaW5pdGlvbic7XG4gICAgICAgIHRoaXMucmVnZXggPSBuZXcgUmVnRXhwKGAoPzoke3RoaXMuZGVmaW5pdGlvbi5ydW5uZXJzLm1hcCh4ID0+IHguZGVmaW5pdGlvbi5yZWdleC5zb3VyY2UpLmpvaW4oJyl8KCcpfSlgLCAnZ20nKTtcbiAgICB9XG5cdC8qKlxuICAgICAqIEV4dHJhY3QgYW55IGNvbW1hbmRzIG91dCBvZiB0aGUgU1FpZ2dMIHF1ZXJ5IGFuZCBkZXRlcm1pbmUgdGhlaXIgb3JkZXIsIG5lc3RpbmcsIGFuZCB0eXBlXG4gICAgICogQG1lbWJlcm9mIFBhcnNlclxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHNxbCAgICAgICAgICAgICAgLSBTUWlnZ0wgcXVlcnkgdG8gZXh0cmFjdCBjb21tYW5kcyBmcm9tXG4gICAgICogQHBhcmFtIHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgICAgLSBBbnkgZ2xvYmFsIHZhcmlhYmxlcyBwYXNzZWQgaW4gdG8gU1FpZ2dMXG4gICAgICogQHJldHVybnMge0NvbW1hbmRbXX0gICAgICAgICAgICAgLSBBcnJheSBvZiBmdWxseSBwYXJzZWQgY29tbWFuZHMsIHJlYWR5IGZvciBleGVjdXRpb25cbiAgICAgKi9cblx0cHVibGljIHBhcnNlKHNxbDogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpe1xuXHQgICAgdGhpcy5jb21tYW5kcyA9IFtdO1xuICAgICAgICB0aGlzLnN0YWNrID0gW107XG4gICAgICAgIHRoaXMuc3FsID0gc3FsO1xuICAgICAgICBsZXQgbWF0Y2g7XG5cdFx0Ly8gQ29tbWFuZC5yZWdleC5sYXN0SW5kZXggPSAwO1xuXHRcdHdoaWxlKChtYXRjaCA9IHRoaXMucmVnZXguZXhlYyhzcWwpKSAhPSBudWxsKXtcbiAgICAgICAgICAgIGxldCBmb3VuZDogQ29tbWFuZCwgcnVubmVyOiBSdW5uZXI7XG4gICAgICAgICAgICBmb3IocnVubmVyIG9mIHRoaXMuZGVmaW5pdGlvbi5ydW5uZXJzKXtcbiAgICAgICAgICAgICAgICBpZihydW5uZXIubWF0Y2hlcyhtYXRjaFswXSkpe1xuICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IG5ldyBDb21tYW5kKG1hdGNoLmluZGV4LCBtYXRjaC5pbnB1dC5sZW5ndGgsIG1hdGNoWzFdLCBtYXRjaFsyXSwgbmV3IFNjb3BlKCksIHJ1bm5lcik7XG4gICAgICAgICAgICAgICAgICAgIGZvdW5kLnNjb3BlLnZhcmlhYmxlcyA9IHZhcmlhYmxlcztcbiAgICAgICAgICAgICAgICAgICAgcnVubmVyLnBhcnNlKGZvdW5kKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cdFx0XHRpZih0aGlzLnN0YWNrLmxlbmd0aCA+IDAgJiYgdGhpcy5zdGFjay5sYXN0KCkuYWN0aW9uLmRlZmluaXRpb24uZGVwZW5kZW50cy5jb250YWlucyhmb3VuZC5hY3Rpb24pKXtcbiAgICAgICAgICAgICAgICAvLyBmb3VuZC5hY3Rpb24uc3VwcG9ydGVyID0gc3RhY2subGFzdCgpO1xuXHRcdFx0XHR0aGlzLnN0YWNrLmxhc3QoKS5kZXBlbmRlbnRzLnB1c2goZm91bmQpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAodGhpcy5zdGFjay5sZW5ndGggPiAwICYmICF0aGlzLnN0YWNrLmxhc3QoKS5hY3Rpb24uZGVmaW5pdGlvbi50ZXJtaW5hdG9yKSB7XG5cdFx0XHRcdHRoaXMuc3RhY2sucHVzaChmb3VuZCk7XG5cdFx0XHRcdHRoaXMuc3RhY2subGFzdCgpLnNjb3BlLmNvbW1hbmRzLnB1c2goZm91bmQpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGlmKHRoaXMuc3RhY2subGVuZ3RoID4gMCAmJiB0aGlzLnN0YWNrLmxhc3QoKS5hY3Rpb24uZGVmaW5pdGlvbi50ZXJtaW5hdG9yKSB0aGlzLnN0YWNrLnBvcCgpO1xuXHRcdFx0XHR0aGlzLnN0YWNrLnB1c2goZm91bmQpO1xuXHRcdFx0XHR0aGlzLmNvbW1hbmRzLnB1c2goZm91bmQpO1xuXHRcdFx0fVxuICAgICAgICAgICAgLy8gbGV0IGVycm9yID0gZm91bmQuYWN0aW9uLnZhbGlkYXRlKCk7XG4gICAgICAgICAgICAvLyBpZihlcnJvcikgcmV0dXJuIFtdO1xuXHRcdH1cblx0XHQvLyByZXR1cm4gY29tbWFuZHM7XG5cdH1cblx0LyoqXG4gICAgICogUnVuIHRoZSBjb21tYW5kcyBhZ2FpbnN0IHRoZSBzdHJpbmcgYW5kIG91dHB1dCB0aGUgZW5kIHJlc3VsdFxuICAgICAqIEBtZW1iZXJvZiBQYXJzZXJcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBlbmQgcmVzdWx0IG9mIHJ1bm5pbmcgYWxsIGNvbW1hbmRzIGFnYWluc3QgdGhlIFNRaWdnTCBxdWVyeVxuICAgICAqL1xuXHRwdWJsaWMgcGVyZm9ybSgpOiBzdHJpbmcge1xuXHRcdHZhciBxdWVyeSA9ICcnLCBpbmRleCA9IDA7XG4gICAgICAgIGlmKHRoaXMuY29tbWFuZHMubGVuZ3RoID09PSAwKSByZXR1cm4gdGhpcy5zcWw7XG5cdFx0Zm9yKHZhciBjb21tYW5kIG9mIHRoaXMuY29tbWFuZHMpe1xuXHRcdFx0cXVlcnkgKz0gdGhpcy5zcWwuc2xpY2UoaW5kZXgsIGNvbW1hbmQuaW5kZXggLTEpO1xuXHRcdFx0cXVlcnkgKz0gY29tbWFuZC5wZXJmb3JtKGNvbW1hbmQpLnJlc3VsdC50ZXh0O1xuXHRcdFx0aW5kZXggKz0gY29tbWFuZC5sZW5ndGg7XG5cdFx0fVxuXHRcdHJldHVybiBxdWVyeTsgLy9UT0RPXG5cdH1cbn0iLCJpbXBvcnQge01vZGlmaWVyfSBmcm9tICcuLi9Nb2RpZmllcnMnO1xuaW50ZXJmYWNlIElQbGFjZWhvbGRlciB7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIGxvY2F0b3I6IFJlZ0V4cDtcbiAgICByZXBsYWNlbWVudDogKGl0ZW0/Ok1vZGlmaWVyW10pID0+IHN0cmluZztcbn1cbmV4cG9ydCBkZWZhdWx0IElQbGFjZWhvbGRlcjsiLCJpbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcblxuaW50ZXJmYWNlIElSZXBsYWNlckRlZmluaXRpb24ge1xuICAgIHJlZ2V4OiBSZWdFeHA7XG4gICAgcnVsZTogKGRlZmluaXRpb246IElSZXBsYWNlckRlZmluaXRpb24sIHRleHQ6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzKSA9PiBzdHJpbmc7XG59XG5leHBvcnQgZGVmYXVsdCBJUmVwbGFjZXJEZWZpbml0aW9uOyIsImltcG9ydCBJUmVwbGFjZXJEZWZpbml0aW9uIGZyb20gJy4vSVJlcGxhY2VyRGVmaW5pdGlvbic7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVwbGFjZXIgeyAgICBcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgZGVmaW5pdGlvbjogSVJlcGxhY2VyRGVmaW5pdGlvbil7XG4gICAgICAgIGlmKCFkZWZpbml0aW9uKSB0aHJvdyAnQXR0ZW1wdGVkIHRvIGluc3RhdGlhdGUgcmVwbGFjZXIgd2l0aG91dCBhIGRlZmluaXRpb24nO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgcmVwbGFjZSh0ZXh0OiBzdHJpbmcsIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IHN0cmluZ3tcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVmaW5pdGlvbi5ydWxlKHRoaXMuZGVmaW5pdGlvbiwgdGV4dCwgdmFyaWFibGVzKTtcbiAgICB9XG59IiwiaW1wb3J0IHtBY3Rpb259IGZyb20gJy4uL0FjdGlvbnMnO1xuaW1wb3J0IHtSZXBsYWNlcn0gZnJvbSAnLi4vUmVwbGFjZXJzJztcblxuaW50ZXJmYWNlIElSdW5uZXJEZWZpbml0aW9uIHtcbiAgICByZWdleDogUmVnRXhwO1xuICAgIGFjdGlvbnM6IEFjdGlvbltdO1xuICAgIHJlcGxhY2VyczogUmVwbGFjZXJbXTtcbn1cbmV4cG9ydCBkZWZhdWx0IElSdW5uZXJEZWZpbml0aW9uOyIsImltcG9ydCBJUnVubmVyRGVmaW5pdGlvbiBmcm9tICcuL0lSdW5uZXJEZWZpbml0aW9uJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuaW1wb3J0IFNjb3BlIGZyb20gJy4uL1Njb3BlJztcbmltcG9ydCB7QWN0aW9ufSBmcm9tICcuLi9BY3Rpb25zJztcbmltcG9ydCBDb21tYW5kIGZyb20gJy4uL0NvbW1hbmQnO1xuaW1wb3J0IHtSZXBsYWNlcn0gZnJvbSAnLi4vUmVwbGFjZXJzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUnVubmVyIHtcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgZGVmaW5pdGlvbjogSVJ1bm5lckRlZmluaXRpb24pe1xuICAgICAgICBpZighZGVmaW5pdGlvbikgdGhyb3cgJ0F0dGVtcHRlZCB0byBpbnN0YXRpYXRlIHJ1bm5lciB3aXRob3V0IGEgZGVmaW5pdGlvbic7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBwYXJzZShjb21tYW5kOiBDb21tYW5kKSB7XG4gICAgICAgIGxldCBhY3Rpb246IEFjdGlvbjtcbiAgICAgICAgZm9yKGFjdGlvbiBvZiB0aGlzLmRlZmluaXRpb24uYWN0aW9ucyl7XG4gICAgICAgICAgICBpZihhY3Rpb24ubWF0Y2hlcyhjb21tYW5kLnN0YXRlbWVudCkpIHtcbiAgICAgICAgICAgICAgICBjb21tYW5kLmFjdGlvbiA9IGFjdGlvbjtcbiAgICAgICAgICAgICAgICBjb21tYW5kLmFjdGlvbi5wYXJzZShjb21tYW5kKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgcGVyZm9ybShjb21tYW5kOiBDb21tYW5kLCBwcmV2PzogQ29tbWFuZCk6IENvbW1hbmQge1xuICAgICAgICBjb21tYW5kLnJlc3VsdCA9IGNvbW1hbmQuYWN0aW9uLnBlcmZvcm0oY29tbWFuZCwgcHJldikucmVzdWx0O1xuICAgICAgICAvLyBjb21tYW5kLnJlc3VsdC5kZXBlbmRlbnQgPSBjb21tYW5kLnNjb3BlLnBlcmZvcm0oY29tbWFuZCkucmVzdWx0O1xuICAgICAgICBsZXQgcmVwbGFjZXI6IFJlcGxhY2VyO1xuICAgICAgICBmb3IocmVwbGFjZXIgb2YgdGhpcy5kZWZpbml0aW9uLnJlcGxhY2Vycyl7XG4gICAgICAgICAgICBjb21tYW5kLnJlcGxhY2UocmVwbGFjZXIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb21tYW5kO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgbWF0Y2hlcyh0ZXh0OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgdGhpcy5kZWZpbml0aW9uLnJlZ2V4Lmxhc3RJbmRleCA9IDA7XG4gICAgICAgIHJldHVybiB0aGlzLmRlZmluaXRpb24ucmVnZXgudGVzdCh0ZXh0KTtcbiAgICB9XG59Il19
