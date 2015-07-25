(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var CommandResult_1 = require('./commands/CommandResult');
var Action_1 = require('./actions/Action');
var Conditions_1 = require('./Conditions');
var EndIfDefinition = {
    regex: /^\s*endif\b/i,
    conditions: [],
    dependents: [],
    terminator: false,
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
            command.result = new CommandResult_1.default(command.inner + command.scope.perform().result.text, true);
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
        if (command.condition.perform(command))
            command.result = new CommandResult_1.default(command.inner + command.scope.perform().result.text, true);
        else
            command.result = new CommandResult_1.default(command.terminate(), false);
        return command;
    }
};
exports.If = new Action_1.default(IfDefinition);
var Action_2 = require('./actions/Action');
exports.Action = Action_2.default;

},{"./Conditions":3,"./actions/Action":15,"./commands/CommandResult":17}],2:[function(require,module,exports){
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
    Command.prototype.terminate = function () {
        return this.scope.commands.some(function (command) { return command.action.definition.terminator; })
            ? this.scope.commands.filter(function (command) { return command.action.definition.terminator; })[1].perform().result.text
            : '';
    };
    return Command;
})();
exports.default = Command;

},{}],3:[function(require,module,exports){
var _this = this;
var Condition_1 = require('./conditions/Condition');
var Modifiers_1 = require('./Modifiers');
var EqualDefinition = {
    template: '(v) (m)=(m) (c)',
    items: ['variable', [Modifiers_1.Not, Modifiers_1.OrEqual], [Modifiers_1.OrEqual], 'comparative'],
    rule: function (variable, comparative, variables) { return variables[variable] === comparative; }
};
exports.Equal = new Condition_1.default(EqualDefinition);
var GreaterThanDefinition = {
    template: '(v) (m)>(m) (c)',
    items: ['variable', [Modifiers_1.Not], [Modifiers_1.OrEqual], 'comparative'],
    rule: function (variable, comparative, variables) { return parseFloat(variables[variable]) > parseFloat(comparative); }
};
exports.GreaterThan = new Condition_1.default(GreaterThanDefinition);
var LessThanDefinition = {
    template: '(v) (m)<(m) (c)',
    items: ['variable', [Modifiers_1.Not], [Modifiers_1.OrEqual], 'comparative'],
    rule: function (variable, comparative, variables) { return parseFloat(variables[variable]) < parseFloat(comparative); }
};
exports.LessThan = new Condition_1.default(LessThanDefinition);
var IsNullDefinition = {
    template: '(v) is (m) null',
    items: ['variable', [Modifiers_1.Not]],
    rule: function (variable, comparative, variables) { return variables[variable] == null; }
};
exports.IsNull = new Condition_1.default(IsNullDefinition);
var AlphabeticallyGreaterThanDefinition = {
    template: '(v) (m)abc>(m) (c)',
    items: ['variable', [Modifiers_1.Not], [Modifiers_1.OrEqual], 'comparative'],
    rule: function (variable, comparative, variables) { return [variables[variable], _this.comparative].sort().indexOf(comparative) > 0; }
};
exports.AlphabeticallyGreaterThan = new Condition_1.default(AlphabeticallyGreaterThanDefinition);
var AlphabeticallyLessThanDefinition = {
    template: '(v) (m)abc<(m) (c)',
    items: ['variable', [Modifiers_1.Not], [Modifiers_1.OrEqual], 'comparative'],
    rule: function (variable, comparative, variables) { return [variables[variable], comparative].sort().indexOf(comparative) === 0; }
};
exports.AlphabeticallyLessThan = new Condition_1.default(AlphabeticallyLessThanDefinition);
var LengthGreaterThanDefinition = {
    template: '(v) (m)len>(m) (c)',
    items: ['variable', [Modifiers_1.Not], [Modifiers_1.OrEqual], 'comparative'],
    rule: function (variable, comparative, variables) { return variables[variable].length > parseInt(comparative); }
};
exports.LengthGreaterThan = new Condition_1.default(LengthGreaterThanDefinition);
var LengthLessThanDefinition = {
    template: '(v) (m)len<(m) (c)',
    items: ['variable', [Modifiers_1.Not], [Modifiers_1.OrEqual], 'comparative'],
    rule: function (variable, comparative, variables) { return variables[variable].length < parseInt(comparative); }
};
exports.LengthLessThan = new Condition_1.default(LengthLessThanDefinition);
var IsNaNDefinition = {
    template: '(v) is (m) NaN',
    items: ['variable', [Modifiers_1.Not]],
    rule: function (variable, comparative, variables) { return isNaN(variables[variable]); }
};
exports.IsNaN = new Condition_1.default(IsNaNDefinition);
var BetweenDefinition = {
    template: '(v) (c)>(m)<(c)',
    items: ['variable', 'comparative', [Modifiers_1.Not, Modifiers_1.OrEqual], 'comparative'],
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
    Scope.prototype.perform = function (prev) {
        var command;
        for (var _i = 0, _a = this.commands; _i < _a.length; _i++) {
            command = _a[_i];
            prev = command.perform(prev);
        }
        return prev;
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
        template = template.replace(/\s+/g, '\\s+');
        return new RegExp(template, 'i');
    };
    Condition.prototype.parse = function (command) {
        var result = new ConditionResult_1.default(), match = command.statement.match(this.regex), i, modifier;
        result.statement = match[0];
        for (i = 1; i < match.length; i++) {
            if (this.items[i - 1] instanceof Array) {
                for (var _i = 0, _a = this.items[i - 1]; _i < _a.length; _i++) {
                    modifier = _a[_i];
                    if (modifier.matches(match[i]))
                        result.set(this.indicies[i], modifier);
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
        var mod;
        for (var _i = 0, _a = parsed.modifier; _i < _a.length; _i++) {
            mod = _a[_i];
            if (mod.definition.rule(parsed.pass, parsed.variable, parsed.comparative, parsed.variables))
                return true;
        }
        return false;
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
    ConditionResult.prototype.set = function (prop, value) {
        if (this[prop] instanceof Array)
            this[prop].push(value);
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
        command.action.perform(prev);
        command.result.dependent = command.scope.perform(command).result;
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQWN0aW9ucy50cyIsInNyYy9Db21tYW5kLnRzIiwic3JjL0NvbmRpdGlvbnMudHMiLCJzcmMvRXJyb3JzLnRzIiwic3JjL0V4dGVuc2lvbnMudHMiLCJzcmMvSVZhcmlhYmxlcy50cyIsInNyYy9NYWluLnRzIiwic3JjL01vZGlmaWVycy50cyIsInNyYy9QYXJzZXJzLnRzIiwic3JjL1BsYWNlaG9sZGVycy50cyIsInNyYy9SZXBsYWNlcnMudHMiLCJzcmMvUnVubmVycy50cyIsInNyYy9TUWlnZ0wudHMiLCJzcmMvU2NvcGUudHMiLCJzcmMvYWN0aW9ucy9BY3Rpb24udHMiLCJzcmMvYWN0aW9ucy9JQWN0aW9uRGVmaW5pdGlvbi50cyIsInNyYy9jb21tYW5kcy9Db21tYW5kUmVzdWx0LnRzIiwic3JjL2NvbmRpdGlvbnMvQ29uZGl0aW9uLnRzIiwic3JjL2NvbmRpdGlvbnMvQ29uZGl0aW9uUmVzdWx0LnRzIiwic3JjL2NvbmRpdGlvbnMvSUNvbmRpdGlvbkRlZmluaXRpb24udHMiLCJzcmMvY29uZGl0aW9ucy9JQ29uZGl0aW9uSW5kaWNlcy50cyIsInNyYy9tb2RpZmllcnMvSU1vZGlmaWVyRGVmaW5pdGlvbi50cyIsInNyYy9tb2RpZmllcnMvTW9kaWZpZXIudHMiLCJzcmMvcGFyc2Vycy9JUGFyc2VyRGVmaW5pdGlvbi50cyIsInNyYy9wYXJzZXJzL1BhcnNlci50cyIsInNyYy9wbGFjZWhvbGRlcnMvSVBsYWNlaG9sZGVyLnRzIiwic3JjL3JlcGxhY2Vycy9JUmVwbGFjZXJEZWZpbml0aW9uLnRzIiwic3JjL3JlcGxhY2Vycy9SZXBsYWNlci50cyIsInNyYy9ydW5uZXJzL0lSdW5uZXJEZWZpbml0aW9uLnRzIiwic3JjL3J1bm5lcnMvUnVubmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQ0EsOEJBQTBC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dXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBJQWN0aW9uRGVmaW5pdGlvbiBmcm9tICcuL2FjdGlvbnMvSUFjdGlvbkRlZmluaXRpb24nO1xuaW1wb3J0IENvbW1hbmRSZXN1bHQgZnJvbSAnLi9jb21tYW5kcy9Db21tYW5kUmVzdWx0JztcbmltcG9ydCBBY3Rpb24gZnJvbSAnLi9hY3Rpb25zL0FjdGlvbic7XG5pbXBvcnQgQ29tbWFuZCBmcm9tICcuL0NvbW1hbmQnO1xuaW1wb3J0IHtDb25kaXRpb24sIEVxdWFsLCBHcmVhdGVyVGhhbiwgTGVzc1RoYW4sIElzTnVsbCwgQWxwaGFiZXRpY2FsbHlHcmVhdGVyVGhhbiwgQWxwaGFiZXRpY2FsbHlMZXNzVGhhbiwgTGVuZ3RoR3JlYXRlclRoYW4sIExlbmd0aExlc3NUaGFuLCBJc05hTiwgQmV0d2Vlbn0gZnJvbSAnLi9Db25kaXRpb25zJztcbmltcG9ydCBTY29wZSBmcm9tICcuL1Njb3BlJztcblxubGV0IEVuZElmRGVmaW5pdGlvbjogSUFjdGlvbkRlZmluaXRpb24gPSB7XG4gICAgcmVnZXg6IC9eXFxzKmVuZGlmXFxiL2ksXG4gICAgY29uZGl0aW9uczogW10sXG4gICAgZGVwZW5kZW50czogW10sXG4gICAgdGVybWluYXRvcjogZmFsc2UsXG4gICAgcnVsZTogKGNvbW1hbmQ6IENvbW1hbmQsIHByZXY/OiBDb21tYW5kKTogQ29tbWFuZCA9PiB7XG4gICAgICAgIGNvbW1hbmQucmVzdWx0ID0gbmV3IENvbW1hbmRSZXN1bHQoY29tbWFuZC5pbm5lciwgdHJ1ZSk7XG4gICAgICAgIHJldHVybiBjb21tYW5kO1xuICAgIH1cbn07XG5leHBvcnQgbGV0IEVuZElmID0gbmV3IEFjdGlvbihFbmRJZkRlZmluaXRpb24pO1xuXG5sZXQgRWxzZURlZmluaXRpb246IElBY3Rpb25EZWZpbml0aW9uID0ge1xuICAgIHJlZ2V4OiAvXlxccyplbHNlXFxiL2ksXG4gICAgY29uZGl0aW9uczogW10sXG4gICAgZGVwZW5kZW50czogW10sXG4gICAgdGVybWluYXRvcjogZmFsc2UsXG4gICAgcnVsZTogKGNvbW1hbmQ6IENvbW1hbmQsIHByZXY/OiBDb21tYW5kKTogQ29tbWFuZCA9PiB7XG4gICAgICAgIGlmKCFwcmV2LnJlc3VsdC5wYXNzZWQpIGNvbW1hbmQucmVzdWx0ID0gbmV3IENvbW1hbmRSZXN1bHQoY29tbWFuZC5pbm5lciArIGNvbW1hbmQuc2NvcGUucGVyZm9ybSgpLnJlc3VsdC50ZXh0LCB0cnVlKTtcbiAgICAgICAgZWxzZSBjb21tYW5kLnJlc3VsdCA9IG5ldyBDb21tYW5kUmVzdWx0KCcnLCBmYWxzZSk7XG4gICAgICAgIHJldHVybiBjb21tYW5kO1xuICAgIH1cbn07XG5leHBvcnQgbGV0IEVsc2UgPSBuZXcgQWN0aW9uKEVsc2VEZWZpbml0aW9uKTtcblxubGV0IElmRGVmaW5pdGlvbjogSUFjdGlvbkRlZmluaXRpb24gPSB7XG4gICAgcmVnZXg6IC9eXFxzKmlmXFxiL2ksXG4gICAgY29uZGl0aW9uczogW0VxdWFsLCBHcmVhdGVyVGhhbiwgTGVzc1RoYW4sIElzTnVsbCwgQWxwaGFiZXRpY2FsbHlHcmVhdGVyVGhhbiwgQWxwaGFiZXRpY2FsbHlMZXNzVGhhbiwgTGVuZ3RoR3JlYXRlclRoYW4sIExlbmd0aExlc3NUaGFuLCBJc05hTiwgQmV0d2Vlbl0sXG4gICAgZGVwZW5kZW50czogW0Vsc2UsIEVuZElmXSxcbiAgICB0ZXJtaW5hdG9yOiBmYWxzZSxcbiAgICBydWxlOiAoY29tbWFuZDogQ29tbWFuZCwgcHJldj86IENvbW1hbmQpOiBDb21tYW5kID0+IHtcbiAgICAgICAgaWYoY29tbWFuZC5jb25kaXRpb24ucGVyZm9ybShjb21tYW5kKSkgY29tbWFuZC5yZXN1bHQgPSBuZXcgQ29tbWFuZFJlc3VsdChjb21tYW5kLmlubmVyICsgY29tbWFuZC5zY29wZS5wZXJmb3JtKCkucmVzdWx0LnRleHQsIHRydWUpO1xuICAgICAgICBlbHNlIGNvbW1hbmQucmVzdWx0ID0gbmV3IENvbW1hbmRSZXN1bHQoY29tbWFuZC50ZXJtaW5hdGUoKSwgZmFsc2UpO1xuICAgICAgICByZXR1cm4gY29tbWFuZDtcbiAgICB9IFxufTtcbmV4cG9ydCBsZXQgSWYgPSBuZXcgQWN0aW9uKElmRGVmaW5pdGlvbik7XG5cbmV4cG9ydCB7ZGVmYXVsdCBhcyBJQWN0aW9uRGVmaW5pdGlvbn0gZnJvbSAnLi9hY3Rpb25zL0lBY3Rpb25EZWZpbml0aW9uJztcbmV4cG9ydCB7ZGVmYXVsdCBhcyBBY3Rpb259IGZyb20gJy4vYWN0aW9ucy9BY3Rpb24nOyIsImltcG9ydCB7UnVubmVyfSBmcm9tICcuL1J1bm5lcnMnO1xuaW1wb3J0IHtBY3Rpb259IGZyb20gJy4vQWN0aW9ucyc7XG5pbXBvcnQge0NvbmRpdGlvbn0gZnJvbSAnLi9Db25kaXRpb25zJztcbmltcG9ydCB7TW9kaWZpZXJ9IGZyb20gJy4vTW9kaWZpZXJzJztcbmltcG9ydCB7UmVwbGFjZXJ9IGZyb20gJy4vUmVwbGFjZXJzJztcbmltcG9ydCBDb21tYW5kUmVzdWx0IGZyb20gJy4vY29tbWFuZHMvQ29tbWFuZFJlc3VsdCc7XG5pbXBvcnQgU2NvcGUgZnJvbSAnLi9TY29wZSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbW1hbmQge1xuICAgIHB1YmxpYyBkZXBlbmRlbnRzOiBDb21tYW5kW10gPSBbXTtcbiAgICBwdWJsaWMgYWN0aW9uOiBBY3Rpb247XG4gICAgcHVibGljIGNvbmRpdGlvbjogQ29uZGl0aW9uO1xuICAgIHB1YmxpYyBtb2RpZmllcnM6IE1vZGlmaWVyW10gPSBbXTtcbiAgICBwdWJsaWMgcmVzdWx0OiBDb21tYW5kUmVzdWx0O1xuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBpbmRleDogbnVtYmVyLCBwdWJsaWMgbGVuZ3RoOiBudW1iZXIsIHB1YmxpYyBzdGF0ZW1lbnQ6IHN0cmluZywgcHVibGljIGlubmVyOiBzdHJpbmcsIHB1YmxpYyBzY29wZTogU2NvcGUsIHByaXZhdGUgcnVubmVyOiBSdW5uZXIpe1xuICAgICAgICBsZXQgYWN0aW9uOiBBY3Rpb247XG4gICAgICAgIGZvcihhY3Rpb24gb2YgcnVubmVyLmRlZmluaXRpb24uYWN0aW9ucyl7XG4gICAgICAgICAgICBpZihhY3Rpb24ubWF0Y2hlcyhzdGF0ZW1lbnQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hY3Rpb24gPSBhY3Rpb247XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgcHVibGljIHBlcmZvcm0ocHJldj86IENvbW1hbmQpOiBDb21tYW5kIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucnVubmVyLnBlcmZvcm0odGhpcywgcHJldik7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyByZXBsYWNlKHJlcGxhY2VyOiBSZXBsYWNlcil7XG4gICAgICAgIHRoaXMucmVzdWx0LnRleHQgPSByZXBsYWNlci5yZXBsYWNlKHRoaXMucmVzdWx0LnRleHQsIHRoaXMuc2NvcGUudmFyaWFibGVzKTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHRlcm1pbmF0ZSgpOiBzdHJpbmd7XG4gICAgICAgIHJldHVybiB0aGlzLnNjb3BlLmNvbW1hbmRzLnNvbWUoY29tbWFuZCA9PiBjb21tYW5kLmFjdGlvbi5kZWZpbml0aW9uLnRlcm1pbmF0b3IpXG5cdFx0ICA/IHRoaXMuc2NvcGUuY29tbWFuZHMuZmlsdGVyKGNvbW1hbmQgPT4gY29tbWFuZC5hY3Rpb24uZGVmaW5pdGlvbi50ZXJtaW5hdG9yKVsxXS5wZXJmb3JtKCkucmVzdWx0LnRleHRcblx0XHQgIDogJyc7XG4gICAgfVxufSIsImltcG9ydCBJQ29uZGl0aW9uRGVmaW5pdGlvbiBmcm9tICcuL2NvbmRpdGlvbnMvSUNvbmRpdGlvbkRlZmluaXRpb24nO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi9JVmFyaWFibGVzJztcbmltcG9ydCBDb25kaXRpb24gZnJvbSAnLi9jb25kaXRpb25zL0NvbmRpdGlvbic7XG5pbXBvcnQge05vdCwgT3JFcXVhbH0gZnJvbSAnLi9Nb2RpZmllcnMnO1xubGV0IEVxdWFsRGVmaW5pdGlvbjogSUNvbmRpdGlvbkRlZmluaXRpb24gPSB7XG4gICAgdGVtcGxhdGU6ICcodikgKG0pPShtKSAoYyknLFxuICAgIGl0ZW1zOiBbJ3ZhcmlhYmxlJywgW05vdCwgT3JFcXVhbF0sIFtPckVxdWFsXSwgJ2NvbXBhcmF0aXZlJ10sXG4gICAgcnVsZTogKHZhcmlhYmxlOiBzdHJpbmcsIGNvbXBhcmF0aXZlOiBzdHJpbmcsIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IGJvb2xlYW4gPT4gdmFyaWFibGVzW3ZhcmlhYmxlXSA9PT0gY29tcGFyYXRpdmVcbn1cbmV4cG9ydCBsZXQgRXF1YWwgPSBuZXcgQ29uZGl0aW9uKEVxdWFsRGVmaW5pdGlvbik7XG5cbmxldCBHcmVhdGVyVGhhbkRlZmluaXRpb246IElDb25kaXRpb25EZWZpbml0aW9uID0ge1xuICAgIHRlbXBsYXRlOiAnKHYpIChtKT4obSkgKGMpJyxcbiAgICBpdGVtczogWyd2YXJpYWJsZScsIFtOb3RdLCBbT3JFcXVhbF0sICdjb21wYXJhdGl2ZSddLFxuICAgIHJ1bGU6ICh2YXJpYWJsZTogc3RyaW5nLCBjb21wYXJhdGl2ZTogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBib29sZWFuID0+IHBhcnNlRmxvYXQodmFyaWFibGVzW3ZhcmlhYmxlXSkgPiBwYXJzZUZsb2F0KGNvbXBhcmF0aXZlKVxufVxuZXhwb3J0IGxldCBHcmVhdGVyVGhhbiA9IG5ldyBDb25kaXRpb24oR3JlYXRlclRoYW5EZWZpbml0aW9uKTtcblxubGV0IExlc3NUaGFuRGVmaW5pdGlvbjogSUNvbmRpdGlvbkRlZmluaXRpb24gPSB7XG4gICAgdGVtcGxhdGU6ICcodikgKG0pPChtKSAoYyknLFxuICAgIGl0ZW1zOiBbJ3ZhcmlhYmxlJywgW05vdF0sIFtPckVxdWFsXSwgJ2NvbXBhcmF0aXZlJ10sXG4gICAgcnVsZTogKHZhcmlhYmxlOiBzdHJpbmcsIGNvbXBhcmF0aXZlOiBzdHJpbmcsIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IGJvb2xlYW4gPT4gcGFyc2VGbG9hdCh2YXJpYWJsZXNbdmFyaWFibGVdKSA8IHBhcnNlRmxvYXQoY29tcGFyYXRpdmUpXG59XG5leHBvcnQgbGV0IExlc3NUaGFuID0gbmV3IENvbmRpdGlvbihMZXNzVGhhbkRlZmluaXRpb24pO1xuXG5sZXQgSXNOdWxsRGVmaW5pdGlvbjogSUNvbmRpdGlvbkRlZmluaXRpb24gPSB7XG4gICAgdGVtcGxhdGU6ICcodikgaXMgKG0pIG51bGwnLFxuICAgIGl0ZW1zOiBbJ3ZhcmlhYmxlJywgW05vdF1dLFxuICAgIHJ1bGU6ICh2YXJpYWJsZTogc3RyaW5nLCBjb21wYXJhdGl2ZTogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBib29sZWFuID0+IHZhcmlhYmxlc1t2YXJpYWJsZV0gPT0gbnVsbFxufVxuZXhwb3J0IGxldCBJc051bGwgPSBuZXcgQ29uZGl0aW9uKElzTnVsbERlZmluaXRpb24pO1xuXG5sZXQgQWxwaGFiZXRpY2FsbHlHcmVhdGVyVGhhbkRlZmluaXRpb246IElDb25kaXRpb25EZWZpbml0aW9uID0ge1xuICAgIHRlbXBsYXRlOiAnKHYpIChtKWFiYz4obSkgKGMpJyxcbiAgICBpdGVtczogWyd2YXJpYWJsZScsIFtOb3RdLCBbT3JFcXVhbF0sICdjb21wYXJhdGl2ZSddLFxuICAgIHJ1bGU6ICh2YXJpYWJsZTogc3RyaW5nLCBjb21wYXJhdGl2ZTogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBib29sZWFuID0+IFt2YXJpYWJsZXNbdmFyaWFibGVdLCB0aGlzLmNvbXBhcmF0aXZlXS5zb3J0KCkuaW5kZXhPZihjb21wYXJhdGl2ZSkgPiAwXG59XG5leHBvcnQgbGV0IEFscGhhYmV0aWNhbGx5R3JlYXRlclRoYW4gPSBuZXcgQ29uZGl0aW9uKEFscGhhYmV0aWNhbGx5R3JlYXRlclRoYW5EZWZpbml0aW9uKTtcblxubGV0IEFscGhhYmV0aWNhbGx5TGVzc1RoYW5EZWZpbml0aW9uOiBJQ29uZGl0aW9uRGVmaW5pdGlvbiA9IHtcbiAgICB0ZW1wbGF0ZTogJyh2KSAobSlhYmM8KG0pIChjKScsXG4gICAgaXRlbXM6IFsndmFyaWFibGUnLCBbTm90XSwgW09yRXF1YWxdLCAnY29tcGFyYXRpdmUnXSxcbiAgICBydWxlOiAodmFyaWFibGU6IHN0cmluZywgY29tcGFyYXRpdmU6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogYm9vbGVhbiA9PiBbdmFyaWFibGVzW3ZhcmlhYmxlXSwgY29tcGFyYXRpdmVdLnNvcnQoKS5pbmRleE9mKGNvbXBhcmF0aXZlKSA9PT0gMFxufVxuZXhwb3J0IGxldCBBbHBoYWJldGljYWxseUxlc3NUaGFuID0gbmV3IENvbmRpdGlvbihBbHBoYWJldGljYWxseUxlc3NUaGFuRGVmaW5pdGlvbik7XG5cbmxldCBMZW5ndGhHcmVhdGVyVGhhbkRlZmluaXRpb246IElDb25kaXRpb25EZWZpbml0aW9uID0ge1xuICAgIHRlbXBsYXRlOiAnKHYpIChtKWxlbj4obSkgKGMpJyxcbiAgICBpdGVtczogWyd2YXJpYWJsZScsIFtOb3RdLCBbT3JFcXVhbF0sICdjb21wYXJhdGl2ZSddLFxuICAgIHJ1bGU6ICh2YXJpYWJsZTogc3RyaW5nLCBjb21wYXJhdGl2ZTogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBib29sZWFuID0+IHZhcmlhYmxlc1t2YXJpYWJsZV0ubGVuZ3RoID4gcGFyc2VJbnQoY29tcGFyYXRpdmUpXG59XG5leHBvcnQgbGV0IExlbmd0aEdyZWF0ZXJUaGFuID0gbmV3IENvbmRpdGlvbihMZW5ndGhHcmVhdGVyVGhhbkRlZmluaXRpb24pO1xuXG5sZXQgTGVuZ3RoTGVzc1RoYW5EZWZpbml0aW9uOiBJQ29uZGl0aW9uRGVmaW5pdGlvbiA9IHtcbiAgICB0ZW1wbGF0ZTogJyh2KSAobSlsZW48KG0pIChjKScsXG4gICAgaXRlbXM6IFsndmFyaWFibGUnLCBbTm90XSwgW09yRXF1YWxdLCAnY29tcGFyYXRpdmUnXSxcbiAgICBydWxlOiAodmFyaWFibGU6IHN0cmluZywgY29tcGFyYXRpdmU6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogYm9vbGVhbiA9PiB2YXJpYWJsZXNbdmFyaWFibGVdLmxlbmd0aCA8IHBhcnNlSW50KGNvbXBhcmF0aXZlKVxufVxuZXhwb3J0IGxldCBMZW5ndGhMZXNzVGhhbiA9IG5ldyBDb25kaXRpb24oTGVuZ3RoTGVzc1RoYW5EZWZpbml0aW9uKTtcblxubGV0IElzTmFORGVmaW5pdGlvbjogSUNvbmRpdGlvbkRlZmluaXRpb24gPSB7XG4gICAgdGVtcGxhdGU6ICcodikgaXMgKG0pIE5hTicsXG4gICAgaXRlbXM6IFsndmFyaWFibGUnLCBbTm90XV0sXG4gICAgcnVsZTogKHZhcmlhYmxlOiBzdHJpbmcsIGNvbXBhcmF0aXZlOiBzdHJpbmcsIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IGJvb2xlYW4gPT4gaXNOYU4odmFyaWFibGVzW3ZhcmlhYmxlXSlcbn1cbmV4cG9ydCBsZXQgSXNOYU4gPSBuZXcgQ29uZGl0aW9uKElzTmFORGVmaW5pdGlvbik7XG5cbmxldCBCZXR3ZWVuRGVmaW5pdGlvbjogSUNvbmRpdGlvbkRlZmluaXRpb24gPSB7XG4gICAgdGVtcGxhdGU6ICcodikgKGMpPihtKTwoYyknLFxuICAgIGl0ZW1zOiBbJ3ZhcmlhYmxlJywgJ2NvbXBhcmF0aXZlJywgW05vdCwgT3JFcXVhbF0sICdjb21wYXJhdGl2ZSddLFxuICAgIHJ1bGU6ICh2YXJpYWJsZTogc3RyaW5nLCBjb21wYXJhdGl2ZTogc3RyaW5nW10sIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IGJvb2xlYW4gPT4gcGFyc2VGbG9hdChjb21wYXJhdGl2ZVswXSkgPiBwYXJzZUZsb2F0KHZhcmlhYmxlc1t2YXJpYWJsZV0pICYmIHBhcnNlRmxvYXQoY29tcGFyYXRpdmVbMV0pIDwgcGFyc2VGbG9hdCh2YXJpYWJsZXNbdmFyaWFibGVdKSBcbn1cbmV4cG9ydCBsZXQgQmV0d2VlbiA9IG5ldyBDb25kaXRpb24oQmV0d2VlbkRlZmluaXRpb24pO1xuXG5leHBvcnQge2RlZmF1bHQgYXMgQ29uZGl0aW9ufSBmcm9tICcuL2NvbmRpdGlvbnMvQ29uZGl0aW9uJztcbiIsIi8vIGltcG9ydCBJQWN0aW9uIGZyb20gJ2FjdGlvbnMvSUFjdGlvbic7XG4vLyAvKipcbi8vICAqIE1vZHVsZSBvZiBlcnJvciBjaGVja2Vyc1xuLy8gICogQG1vZHVsZSBFcnJvcnNcbi8vICAqIEBjbGFzc1xuLy8gICogQHN0YXRpY1xuLy8gICovXG4vLyBleHBvcnQgZGVmYXVsdCBjbGFzcyBFcnJvcnMge1xuLy8gICAgIC8qKlxuLy8gICAgICAqIEBtZW1iZXJvZiBFcnJvcnNcbi8vICAgICAgKiBAbWV0aG9kXG4vLyAgICAgICogQHN0YXRpY1xuLy8gICAgICAqIEBwYXJhbSB7SUFjdGlvbn0gYWN0aW9uICAgICAgLSBBY3Rpb24gdG8gY2hlY2sgZm9yIGFuIEluY29ycmVjdCBTdGF0ZW1lbnQgZXJyb3Jcbi8vICAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVtZW50ICAgIC0gU3RhdGVtZW50IHRvIGNoZWNrIGZvciBhIEluY29ycmVjdCBTdGF0ZW1lbnQgZXJyb3Jcbi8vICAgICAgKiBAcmV0dXJucyB7c3RyaW5nIHwgbnVsbH0gICAgIC0gVGhlIGVycm9yIG1lc3NhZ2UgaWYgYW55LCBvdGhlcndpc2UgbnVsbCBcbi8vICAgICAgKi9cbi8vICAgICBwdWJsaWMgc3RhdGljIEluY29ycmVjdFN0YXRlbWVudChhY3Rpb246IElBY3Rpb24sIHN0YXRlbWVudDogc3RyaW5nKTogc3RyaW5ne1xuLy8gICAgICAgICBjb25zdCBhY3Rpb25zOnN0cmluZyA9IGFjdGlvbi5jb21tYW5kLmFjdGlvbnMuZmlsdGVyKHggPT4geC5kZXBlbmRlbnRzLnNvbWUoeSA9PiBhY3Rpb24gaW5zdGFuY2VvZiB5KSkubWFwKHggPT4geC5uYW1lKS5qb2luKCcsICcpO1xuLy8gICAgICAgICBjb25zdCBlcnJvcjogc3RyaW5nID0gYEluY29ycmVjdCBzdGF0ZW1lbnQgZm91bmQgYXQgXCIke3N0YXRlbWVudH1cIi4gJHthY3Rpb24uY29uc3RydWN0b3JbJ25hbWUnXX0gbXVzdCBmb2xsb3cgJHthY3Rpb25zfWBcbi8vICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4vLyAgICAgICAgIHJldHVybiBlcnJvcjtcbi8vICAgICB9XG4vLyB9IiwiaW50ZXJmYWNlIEFycmF5PFQ+e1xuXHRsYXN0KCk6IFQ7XG4gICAgaXNGdWxsKCk6IGJvb2xlYW47XG4gICAgY29udGFpbnMoVCk6IGJvb2xlYW47XG59XG5BcnJheS5wcm90b3R5cGUubGFzdCA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiB0aGlzW3RoaXMubGVuZ3RoLTFdO1xufVxuXG5BcnJheS5wcm90b3R5cGUuaXNGdWxsID0gZnVuY3Rpb24oKXtcbiAgICBmb3IobGV0IGk9MDtpPHRoaXMubGVuZ3RoO2krKyl7XG4gICAgICAgIGlmKGkgPT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuQXJyYXkucHJvdG90eXBlLmNvbnRhaW5zID0gZnVuY3Rpb24oVCl7XG4gICAgcmV0dXJuIHRoaXMuc29tZSh4ID0+IHggPT09IFQpO1xufSIsImludGVyZmFjZSBJVmFyaWFibGVzIHtcblx0W2tleTogc3RyaW5nXTogYW55O1xufVxuZXhwb3J0IGRlZmF1bHQgSVZhcmlhYmxlczsiLCJpbXBvcnQge1NRaWdnTFBhcnNlcn0gZnJvbSAnLi9QYXJzZXJzJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4vSVZhcmlhYmxlcyc7XG4vKipcbiAqIFRoZSBzdGFydGluZyBwb2ludCBvZiB0aGUgZW50aXJlIFNRaWdnTCBwYXJzZXJcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IHNxbCAgICAgICAgICAgICAgLSBUaGUgU1FMIHF1ZXJ5IHRvIHJ1biBTUWlnZ0wgYWdhaW5zdFxuICogQHBhcmFtIHtJVmFyaWFibGVzP30gdmFyaWFibGVzICAgLSBPcHRpb25hbCBjb2xsZWN0aW9uIG9mIHZhcmlhYmxlcyBmb3IgeW91ciBTUWlnZ0wgcXVlcnlcbiAqIEByZXR1cm4ge3N0cmluZ30gICAgICAgICAgICAgICAgIC0gVGhlIGZ1bGx5IHBhcnNlZCBTUUwgcXVlcnlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlKHNxbDogc3RyaW5nLCB2YXJpYWJsZXM/OiBJVmFyaWFibGVzKTogc3RyaW5ne1xuXHRTUWlnZ0xQYXJzZXIucGFyc2Uoc3FsLCB2YXJpYWJsZXMpO1xuICAgIHJldHVybiBTUWlnZ0xQYXJzZXIucGVyZm9ybSgpO1xufSIsImltcG9ydCBJTW9kaWZpZXJEZWZpbml0aW9uIGZyb20gJy4vbW9kaWZpZXJzL0lNb2RpZmllckRlZmluaXRpb24nO1xuaW1wb3J0IE1vZGlmaWVyIGZyb20gJy4vbW9kaWZpZXJzL01vZGlmaWVyJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4vSVZhcmlhYmxlcyc7XG5cbmxldCBOb3REZWZpbml0aW9uOiBJTW9kaWZpZXJEZWZpbml0aW9uID0ge1xuICAgIGlkZW50aWZpZXJzOiBbLyEvaSwgLyg/OlxcYnxcXHMrKW5vdCg/OlxcYnxcXHMrKS9pXSxcbiAgICBydWxlOiAocGFzczogYm9vbGVhbiwgdmFyaWFibGU6IHN0cmluZywgY29tcGFyYXRpdmU6IHN0cmluZyB8IHN0cmluZ1tdLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBib29sZWFuID0+ICFwYXNzXG59XG5leHBvcnQgbGV0IE5vdCA9IG5ldyBNb2RpZmllcihOb3REZWZpbml0aW9uKTtcblxubGV0IE9yRXF1YWxEZWZpbml0aW9uOiBJTW9kaWZpZXJEZWZpbml0aW9uID0ge1xuICAgIGlkZW50aWZpZXJzOiBbLz0vaV0sXG4gICAgcnVsZTogKHBhc3M6IGJvb2xlYW4sIHZhcmlhYmxlOiBzdHJpbmcsIGNvbXBhcmF0aXZlOiBzdHJpbmcgfCBzdHJpbmdbXSwgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogYm9vbGVhbiA9PiBwYXNzIHx8IHZhcmlhYmxlc1t2YXJpYWJsZV0gPT09IGNvbXBhcmF0aXZlXG59XG5leHBvcnQgbGV0IE9yRXF1YWwgPSBuZXcgTW9kaWZpZXIoT3JFcXVhbERlZmluaXRpb24pO1xuXG5leHBvcnQge2RlZmF1bHQgYXMgSU1vZGlmaWVyRGVmaW5pdGlvbn0gZnJvbSAnLi9tb2RpZmllcnMvSU1vZGlmaWVyRGVmaW5pdGlvbic7XG5leHBvcnQge2RlZmF1bHQgYXMgTW9kaWZpZXJ9IGZyb20gJy4vbW9kaWZpZXJzL01vZGlmaWVyJzsgIiwiaW1wb3J0IElQYXJzZXJEZWZpbml0aW9uIGZyb20gJy4vcGFyc2Vycy9JUGFyc2VyRGVmaW5pdGlvbic7XG5pbXBvcnQgUGFyc2VyIGZyb20gJy4vcGFyc2Vycy9QYXJzZXInO1xuaW1wb3J0IHtSdW5uZXIsIEFjdGlvblJ1bm5lcn0gZnJvbSAnLi9SdW5uZXJzJztcblxubGV0IFNRaWdnTFBhcnNlckRlZmluaXRpb246IElQYXJzZXJEZWZpbml0aW9uID0ge1xuICAgIHJ1bm5lcnM6IFtBY3Rpb25SdW5uZXJdXG59XG5leHBvcnQgbGV0IFNRaWdnTFBhcnNlciA9IG5ldyBQYXJzZXIoU1FpZ2dMUGFyc2VyRGVmaW5pdGlvbik7IFxuXG5leHBvcnQge2RlZmF1bHQgYXMgSVBhcnNlckRlZmluaXRpb259IGZyb20gJy4vcGFyc2Vycy9JUGFyc2VyRGVmaW5pdGlvbic7IiwiaW1wb3J0IElQbGFjZWhvbGRlciBmcm9tICcuL3BsYWNlaG9sZGVycy9JUGxhY2Vob2xkZXInO1xuaW1wb3J0IHtNb2RpZmllcn0gZnJvbSAnLi9Nb2RpZmllcnMnO1xuZXhwb3J0IGxldCBQbGFjZWhvbGRlcnM6IElQbGFjZWhvbGRlcltdID0gW1xuICAgIHtcbiAgICAgICAgbmFtZTogJ3ZhcmlhYmxlJyxcbiAgICAgICAgbG9jYXRvcjogL1xcKHZcXCkvaSxcbiAgICAgICAgcmVwbGFjZW1lbnQ6ICgpID0+ICcoXFxcXHcrKSdcbiAgICB9LFxuICAgIHtcbiAgICAgICAgbmFtZTogJ2NvbXBhcmF0aXZlJyxcbiAgICAgICAgbG9jYXRvcjogL1xcKGNcXCkvaSxcbiAgICAgICAgcmVwbGFjZW1lbnQ6ICgpID0+IGAoXFxcXGQrfFtcIiddXFxcXHcrW1wiJ10pYFxuICAgIH0sXG4gICAge1xuICAgICAgICBuYW1lOiAnbW9kaWZpZXInLFxuICAgICAgICBsb2NhdG9yOiAvXFwobVxcKS9pLFxuICAgICAgICByZXBsYWNlbWVudDogKGl0ZW0/OiBNb2RpZmllcltdKSA9PiBgKCg/OiR7aXRlbS5tYXAobW9kaWZpZXIgPT4gbW9kaWZpZXIuZGVmaW5pdGlvbi5pZGVudGlmaWVycy5tYXAoaWRlbnRpZmllciA9PiBpZGVudGlmaWVyLnNvdXJjZSkuam9pbignfCcpKS5qb2luKCd8Jyl9fFxcXFxzKikpYFxuICAgIH1cbl07XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBQbGFjZWhvbGRlcihuYW1lOiBzdHJpbmcpe1xuICAgIHJldHVybiBQbGFjZWhvbGRlcnMuZmlsdGVyKHggPT4geC5uYW1lID09PSBuYW1lKVswXTtcbn0iLCJpbXBvcnQgSVJlcGxhY2VyRGVmaW5pdGlvbiBmcm9tICcuL3JlcGxhY2Vycy9JUmVwbGFjZXJEZWZpbml0aW9uJztcbmltcG9ydCBSZXBsYWNlciBmcm9tICcuL3JlcGxhY2Vycy9SZXBsYWNlcic7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuL0lWYXJpYWJsZXMnO1xuXG5sZXQgVmFyaWFibGVEZWZpbml0aW9uOiBJUmVwbGFjZXJEZWZpbml0aW9uID0ge1xuICAgIHJlZ2V4OiAvKFtee118Xil7eyg/IXspXFxzKihcXHcqKVxccyp9fSg/IX0pL2csXG4gICAgcnVsZTogKGRlZmluaXRpb246IElSZXBsYWNlckRlZmluaXRpb24sIHRleHQ6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogc3RyaW5nID0+IHRleHQucmVwbGFjZShkZWZpbml0aW9uLnJlZ2V4LCAobWF0Y2gsICQxLCAkMikgPT4gJDErdmFyaWFibGVzWyQyXSlcbn1cbmV4cG9ydCBsZXQgVmFyaWFibGUgPSBuZXcgUmVwbGFjZXIoVmFyaWFibGVEZWZpbml0aW9uKTtcblxuZXhwb3J0IHtkZWZhdWx0IGFzIElSZXBsYWNlckRlZmluaXRpb259IGZyb20gJy4vcmVwbGFjZXJzL0lSZXBsYWNlckRlZmluaXRpb24nO1xuZXhwb3J0IHtkZWZhdWx0IGFzIFJlcGxhY2VyfSBmcm9tICcuL3JlcGxhY2Vycy9SZXBsYWNlcic7IiwiaW1wb3J0IElSdW5uZXJEZWZpbml0aW9uIGZyb20gJy4vcnVubmVycy9JUnVubmVyRGVmaW5pdGlvbic7XG5pbXBvcnQgUnVubmVyIGZyb20gJy4vcnVubmVycy9SdW5uZXInO1xuaW1wb3J0IHtBY3Rpb24sIElmLCBFbHNlLCBFbmRJZn0gZnJvbSAnLi9BY3Rpb25zJztcbmltcG9ydCB7UmVwbGFjZXIsIFZhcmlhYmxlfSBmcm9tICcuL1JlcGxhY2Vycyc7XG5cbmxldCBBY3Rpb25SdW5uZXJEZWZpbml0aW9uOiBJUnVubmVyRGVmaW5pdGlvbiA9IHtcbiAgICByZWdleDogL3t7JSguKj8pJX19KFtcXHNcXFNdKj8pPyg/PSg/Ont7JXwkKSkvZ20sXG4gICAgYWN0aW9uczogW0lmLCBFbHNlLCBFbmRJZl0sXG4gICAgcmVwbGFjZXJzOiBbVmFyaWFibGVdXG59XG5leHBvcnQgbGV0IEFjdGlvblJ1bm5lciA9IG5ldyBSdW5uZXIoQWN0aW9uUnVubmVyRGVmaW5pdGlvbik7XG5cbmV4cG9ydCB7ZGVmYXVsdCBhcyBJUnVubmVyRGVmaW5pdGlvbn0gZnJvbSAnLi9ydW5uZXJzL0lSdW5uZXJEZWZpbml0aW9uJztcbmV4cG9ydCB7ZGVmYXVsdCBhcyBSdW5uZXJ9IGZyb20gJy4vcnVubmVycy9SdW5uZXInOyIsImltcG9ydCB7cGFyc2UgYXMgUGFyc2V9IGZyb20gJy4vTWFpbic7XG5sZXQgU1FpZ2dMID0ge1xuICAgIHBhcnNlOiBQYXJzZSxcbiAgICB2ZXJzaW9uOiAnMC4xLjAnLFxuICAgIC8vZXh0ZW5kOiBFeHRlbmRcbn07XG5pZih0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykgd2luZG93WydTUWlnZ0wnXSA9IFNRaWdnTDtcbmV4cG9ydCBkZWZhdWx0IFNRaWdnTDsiLCJpbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuL0lWYXJpYWJsZXMnO1xuaW1wb3J0IENvbW1hbmQgZnJvbSAnLi9Db21tYW5kJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2NvcGUge1xuXHRwdWJsaWMgdmFyaWFibGVzOiBJVmFyaWFibGVzID0ge307XG5cdHB1YmxpYyBjb21tYW5kczogQ29tbWFuZFtdID0gW107XG5cdHB1YmxpYyBkZXBlbmRlbnRzOiBDb21tYW5kW10gPSBbXTtcbiAgICBcbiAgICBwdWJsaWMgcGVyZm9ybShwcmV2PzogQ29tbWFuZCk6IENvbW1hbmQge1xuICAgICAgICBsZXQgY29tbWFuZDogQ29tbWFuZDtcbiAgICAgICAgZm9yKGNvbW1hbmQgb2YgdGhpcy5jb21tYW5kcyl7XG4gICAgICAgICAgICBwcmV2ID0gY29tbWFuZC5wZXJmb3JtKHByZXYpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcmV2O1xuICAgIH1cbn0iLCJpbXBvcnQgSUFjdGlvbkRlZmluaXRpb24gZnJvbSAnLi9JQWN0aW9uRGVmaW5pdGlvbic7XG5pbXBvcnQge0NvbmRpdGlvbn0gZnJvbSAnLi4vQ29uZGl0aW9ucyc7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcbmltcG9ydCBDb21tYW5kIGZyb20gJy4uL0NvbW1hbmQnO1xuaW1wb3J0IFNjb3BlIGZyb20gJy4uL1Njb3BlJztcbi8vIERPIE5PVCBQVVQgSU5TVEFOQ0UgSVRFTVMgSU4gVEhJUyBDTEFTUywgRFVNTVlcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFjdGlvbiB7XG4gICAgY29uc3RydWN0b3IocHVibGljIGRlZmluaXRpb246IElBY3Rpb25EZWZpbml0aW9uKXtcbiAgICAgICAgaWYoIWRlZmluaXRpb24pIHRocm93ICdBdHRlbXB0ZWQgdG8gaW5zdGF0aWF0ZSBhY3Rpb24gd2l0aG91dCBhIGRlZmluaXRpb24nO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgbWF0Y2hlcyhzdGF0ZW1lbnQ6IHN0cmluZyk6IGJvb2xlYW57XG4gICAgICAgIHJldHVybiB0aGlzLmRlZmluaXRpb24ucmVnZXgudGVzdChzdGF0ZW1lbnQpO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgcGFyc2UoY29tbWFuZDogQ29tbWFuZCl7XG4gICAgICAgIGxldCBjb25kaXRpb246IENvbmRpdGlvbjtcbiAgICAgICAgZm9yKGNvbmRpdGlvbiBvZiB0aGlzLmRlZmluaXRpb24uY29uZGl0aW9ucyl7XG4gICAgICAgICAgICBpZihjb25kaXRpb24ubWF0Y2hlcyhjb21tYW5kLnN0YXRlbWVudCkpIHtcbiAgICAgICAgICAgICAgICBjb21tYW5kLmNvbmRpdGlvbiA9IGNvbmRpdGlvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgcGVyZm9ybShjb21tYW5kOiBDb21tYW5kLCBwcmV2PzogQ29tbWFuZCk6IENvbW1hbmQge1xuICAgICAgICByZXR1cm4gdGhpcy5kZWZpbml0aW9uLnJ1bGUoY29tbWFuZCwgcHJldik7XG4gICAgfVxufSIsImltcG9ydCBBY3Rpb24gZnJvbSAnLi9BY3Rpb24nO1xuaW1wb3J0IHtDb25kaXRpb259IGZyb20gJy4uL0NvbmRpdGlvbnMnO1xuaW1wb3J0IENvbW1hbmQgZnJvbSAnLi4vQ29tbWFuZCc7XG5pbXBvcnQgU2NvcGUgZnJvbSAnLi4vU2NvcGUnO1xuXG5pbnRlcmZhY2UgSUFjdGlvbkRlZmluaXRpb24ge1xuICAgIHJlZ2V4OiBSZWdFeHA7XG4gICAgY29uZGl0aW9uczogQ29uZGl0aW9uW107XG4gICAgZGVwZW5kZW50czogQWN0aW9uW107XG4gICAgdGVybWluYXRvcjogYm9vbGVhbjtcbiAgICBydWxlOiAoY29tbWFuZDogQ29tbWFuZCwgcHJldj86IENvbW1hbmQpID0+IENvbW1hbmQ7XG59XG5leHBvcnQgZGVmYXVsdCBJQWN0aW9uRGVmaW5pdGlvbjsiLCJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbW1hbmRSZXN1bHQge1xuICAgIHB1YmxpYyBkZXBlbmRlbnQ6IENvbW1hbmRSZXN1bHQ7XG4gICAgY29uc3RydWN0b3IocHVibGljIHRleHQ6IHN0cmluZywgcHVibGljIHBhc3NlZD86IGJvb2xlYW4pe31cbn0iLCJpbXBvcnQgUGxhY2Vob2xkZXIgZnJvbSAnLi4vUGxhY2Vob2xkZXJzJztcbmltcG9ydCBDb25kaXRpb25SZXN1bHQgZnJvbSAnLi9Db25kaXRpb25SZXN1bHQnO1xuaW1wb3J0IElDb25kaXRpb25JbmRpY2VzIGZyb20gJy4vSUNvbmRpdGlvbkluZGljZXMnO1xuaW1wb3J0IElDb25kaXRpb25EZWZpbml0aW9uIGZyb20gJy4vSUNvbmRpdGlvbkRlZmluaXRpb24nO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5pbXBvcnQgQ29tbWFuZCBmcm9tICcuLi9Db21tYW5kJztcbmltcG9ydCB7TW9kaWZpZXJ9IGZyb20gJy4uL01vZGlmaWVycydcbmltcG9ydCAnLi4vRXh0ZW5zaW9ucyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbmRpdGlvbiB7XG4gICAgcHJpdmF0ZSByZWdleDogUmVnRXhwO1xuICAgIHByaXZhdGUgaW5kaWNpZXM6IElDb25kaXRpb25JbmRpY2VzID0ge307XG4gICAgcHJpdmF0ZSB0ZW1wbGF0ZTogc3RyaW5nO1xuICAgIHByaXZhdGUgaXRlbXM6IEFycmF5PHN0cmluZyB8IE1vZGlmaWVyW10+O1xuICAgIHByaXZhdGUgcnVsZTogKHZhcmlhYmxlOiBzdHJpbmcsIGNvbXBhcmF0aXZlOiBzdHJpbmcgfCBzdHJpbmdbXSwgdmFyaWFibGVzOiBJVmFyaWFibGVzKSA9PiBib29sZWFuO1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgZGVmaW5pdGlvbjogSUNvbmRpdGlvbkRlZmluaXRpb24pe1xuICAgICAgICBpZighZGVmaW5pdGlvbikgdGhyb3cgJ0F0dGVtcHRlZCB0byBpbnN0YXRpYXRlIGNvbmRpdGlvbiB3aXRob3V0IGEgZGVmaW5pdGlvbic7XG4gICAgICAgIHRoaXMucmVnZXggPSB0aGlzLnRyYW5zbGF0ZSh0aGlzLmRlZmluaXRpb24pO1xuICAgICAgICB0aGlzLnRlbXBsYXRlID0gZGVmaW5pdGlvbi50ZW1wbGF0ZTtcbiAgICAgICAgdGhpcy5pdGVtcyA9IGRlZmluaXRpb24uaXRlbXM7XG4gICAgICAgIHRoaXMucnVsZSA9IGRlZmluaXRpb24ucnVsZTtcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSB0cmFuc2xhdGUoZGVmaW5pdGlvbjogSUNvbmRpdGlvbkRlZmluaXRpb24pOiBSZWdFeHB7XG4gICAgICAgIGxldCB0ZW1wbGF0ZSA9IGRlZmluaXRpb24udGVtcGxhdGUsIGl0ZW06IChzdHJpbmcgfCBNb2RpZmllcltdKSwgbmFtZTogc3RyaW5nLCBpZHg9MTtcbiAgICAgICAgZm9yKGl0ZW0gb2YgZGVmaW5pdGlvbi5pdGVtcyl7XG4gICAgICAgICAgICBpZighaXRlbSkgdGhyb3cgJ0ludmFsaWQgaXRlbSBpbiBpdGVtcyBkZWZpbml0aW9uJztcbiAgICAgICAgICAgIGlmKGl0ZW0gaW5zdGFuY2VvZiBBcnJheSkgbmFtZSA9ICdtb2RpZmllcic7XG4gICAgICAgICAgICBlbHNlIG5hbWUgPSA8c3RyaW5nPml0ZW07XG4gICAgICAgICAgICBsZXQgcGxhY2Vob2xkZXIgPSBQbGFjZWhvbGRlcihuYW1lKTtcbiAgICAgICAgICAgIHRlbXBsYXRlID0gdGVtcGxhdGUucmVwbGFjZShwbGFjZWhvbGRlci5sb2NhdG9yLCBwbGFjZWhvbGRlci5yZXBsYWNlbWVudChpdGVtIGluc3RhbmNlb2YgQXJyYXkgPyBpdGVtIDogbnVsbCkpO1xuICAgICAgICAgICAgaWYodGhpcy5pbmRpY2llc1tuYW1lXSBpbnN0YW5jZW9mIEFycmF5KSAoPG51bWJlcltdPnRoaXMuaW5kaWNpZXNbbmFtZV0pLnB1c2goaWR4KTtcbiAgICAgICAgICAgIGVsc2UgaWYoIWlzTmFOKDxhbnk+dGhpcy5pbmRpY2llc1tuYW1lXSkpIHtcbiAgICAgICAgICAgICAgICBsZXQgYXJyYXkgPSBbXTtcbiAgICAgICAgICAgICAgICBhcnJheS5wdXNoKHRoaXMuaW5kaWNpZXNbbmFtZV0pO1xuICAgICAgICAgICAgICAgIGFycmF5LnB1c2goaWR4KTtcbiAgICAgICAgICAgICAgICB0aGlzLmluZGljaWVzW25hbWVdID0gYXJyYXk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHRoaXMuaW5kaWNpZXNbbmFtZV0gPSBpZHg7XG4gICAgICAgICAgICB0aGlzLmluZGljaWVzW2lkeF0gPSBuYW1lO1xuICAgICAgICAgICAgaWR4Kys7XG4gICAgICAgIH1cbiAgICAgICAgdGVtcGxhdGUgPSB0ZW1wbGF0ZS5yZXBsYWNlKC9cXHMrL2csICdcXFxccysnKTtcbiAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAodGVtcGxhdGUsICdpJyk7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgcGFyc2UoY29tbWFuZDogQ29tbWFuZCk6IENvbmRpdGlvblJlc3VsdCB7XG4gICAgICAgIGxldCByZXN1bHQgPSBuZXcgQ29uZGl0aW9uUmVzdWx0KCksIG1hdGNoID0gY29tbWFuZC5zdGF0ZW1lbnQubWF0Y2godGhpcy5yZWdleCksIGksIG1vZGlmaWVyOiBNb2RpZmllcjtcbiAgICAgICAgcmVzdWx0LnN0YXRlbWVudCA9IG1hdGNoWzBdO1xuICAgICAgICBmb3IoaT0xO2k8bWF0Y2gubGVuZ3RoO2krKyl7XG4gICAgICAgICAgICBpZih0aGlzLml0ZW1zW2ktMV0gaW5zdGFuY2VvZiBBcnJheSl7XG4gICAgICAgICAgICAgICAgZm9yKG1vZGlmaWVyIG9mIDxNb2RpZmllcltdPnRoaXMuaXRlbXNbaS0xXSl7XG4gICAgICAgICAgICAgICAgICAgIGlmKG1vZGlmaWVyLm1hdGNoZXMobWF0Y2hbaV0pKSByZXN1bHQuc2V0KDxzdHJpbmc+dGhpcy5pbmRpY2llc1tpXSwgbW9kaWZpZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgcmVzdWx0LnNldCg8c3RyaW5nPnRoaXMuaW5kaWNpZXNbaV0sIG1hdGNoW2ldKVxuICAgICAgICB9XG4gICAgICAgIHJlc3VsdC52YXJpYWJsZXMgPSBjb21tYW5kLnNjb3BlLnZhcmlhYmxlcztcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHBlcmZvcm0oY29tbWFuZDogQ29tbWFuZCk6IGJvb2xlYW57XG4gICAgICAgIGxldCBwYXJzZWQgPSB0aGlzLnBhcnNlKGNvbW1hbmQpOyBcbiAgICAgICAgcGFyc2VkLnBhc3MgPSB0aGlzLnJ1bGUocGFyc2VkLnZhcmlhYmxlLCBwYXJzZWQuY29tcGFyYXRpdmUsIHBhcnNlZC52YXJpYWJsZXMpO1xuICAgICAgICBsZXQgbW9kOiBNb2RpZmllcjtcbiAgICAgICAgZm9yKG1vZCBvZiA8TW9kaWZpZXJbXT5wYXJzZWQubW9kaWZpZXIpe1xuICAgICAgICAgICAgaWYobW9kLmRlZmluaXRpb24ucnVsZShwYXJzZWQucGFzcywgcGFyc2VkLnZhcmlhYmxlLCBwYXJzZWQuY29tcGFyYXRpdmUsIHBhcnNlZC52YXJpYWJsZXMpKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBtYXRjaGVzKHN0YXRlbWVudDogc3RyaW5nKXtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVnZXgudGVzdChzdGF0ZW1lbnQpO1xuICAgIH1cbn0iLCJpbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcbmltcG9ydCB7TW9kaWZpZXJ9IGZyb20gJy4uL01vZGlmaWVycyc7XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb25kaXRpb25SZXN1bHQge1xuICAgIHB1YmxpYyBwYXNzOiBib29sZWFuO1xuICAgIHB1YmxpYyB2YXJpYWJsZTogc3RyaW5nO1xuICAgIHB1YmxpYyBjb21wYXJhdGl2ZTogYW55O1xuICAgIHB1YmxpYyB2YXJpYWJsZXM6IElWYXJpYWJsZXM7XG4gICAgcHVibGljIG1vZGlmaWVyOiBNb2RpZmllcltdID0gW107XG4gICAgcHVibGljIHN0YXRlbWVudDogc3RyaW5nO1xuICAgIHB1YmxpYyBzZXQocHJvcDogc3RyaW5nLCB2YWx1ZTogc3RyaW5nIHwgTW9kaWZpZXIpe1xuICAgICAgICBpZih0aGlzW3Byb3BdIGluc3RhbmNlb2YgQXJyYXkpIHRoaXNbcHJvcF0ucHVzaCh2YWx1ZSk7XG4gICAgICAgIGVsc2UgdGhpc1twcm9wXSA9IHZhbHVlO1xuICAgIH1cbn0iLCJpbXBvcnQge01vZGlmaWVyfSBmcm9tICcuLi9Nb2RpZmllcnMnO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5pbnRlcmZhY2UgSUNvbmRpdGlvbkRlZmluaXRpb24ge1xuICAgIHRlbXBsYXRlOiBzdHJpbmc7XG4gICAgaXRlbXM6IEFycmF5PHN0cmluZyB8IE1vZGlmaWVyW10+O1xuICAgIHJ1bGU6ICh2YXJpYWJsZTogc3RyaW5nLCBjb21wYXJhdGl2ZTogc3RyaW5nIHwgc3RyaW5nW10sIHZhcmlhYmxlczogSVZhcmlhYmxlcykgPT4gYm9vbGVhbjtcbn1cbmV4cG9ydCBkZWZhdWx0IElDb25kaXRpb25EZWZpbml0aW9uOyIsImludGVyZmFjZSBJQ29uZGl0aW9uSW5kaWNlcyB7XG4gICAgW2tleTogc3RyaW5nXTogKG51bWJlcltdIHwgbnVtYmVyIHwgc3RyaW5nKTtcbiAgICBba2V5OiBudW1iZXJdOiBzdHJpbmcgfCBudW1iZXIgfCBudW1iZXJbXTtcbn1cbmV4cG9ydCBkZWZhdWx0IElDb25kaXRpb25JbmRpY2VzOyIsImltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuXG5pbnRlcmZhY2UgSU1vZGlmaWVyRGVmaW5pdGlvbiB7XG4gICAgaWRlbnRpZmllcnM6IFJlZ0V4cFtdO1xuICAgIHJ1bGU6IChwYXNzOiBib29sZWFuLCB2YXJpYWJsZTogc3RyaW5nLCBjb21wYXJhdGl2ZTogc3RyaW5nIHwgc3RyaW5nW10sIHZhcmlhYmxlczogSVZhcmlhYmxlcykgPT4gYm9vbGVhbjtcbn1cbmV4cG9ydCBkZWZhdWx0IElNb2RpZmllckRlZmluaXRpb247IiwiaW1wb3J0IElNb2RpZmllckRlZmluaXRpb24gZnJvbSAnLi9JTW9kaWZpZXJEZWZpbml0aW9uJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNb2RpZmllciB7XG4gICAgY29uc3RydWN0b3IocHVibGljIGRlZmluaXRpb246SU1vZGlmaWVyRGVmaW5pdGlvbil7XG4gICAgICAgIGlmKCFkZWZpbml0aW9uKSB0aHJvdyAnQXR0ZW1wdGVkIHRvIGluc3RhdGlhdGUgbW9kaWZpZXIgd2l0aG91dCBhIGRlZmluaXRpb24nO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgbWF0Y2hlcyh0ZXh0OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgbGV0IGlkZW50aWZpZXI7XG4gICAgICAgIGZvcihpZGVudGlmaWVyIG9mIHRoaXMuZGVmaW5pdGlvbi5pZGVudGlmaWVycyl7XG4gICAgICAgICAgICBpZihpZGVudGlmaWVyLnRlc3QodGV4dCkpIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59IiwiaW1wb3J0IHtSdW5uZXJ9IGZyb20gJy4uL1J1bm5lcnMnO1xuXG5pbnRlcmZhY2UgSVBhcnNlckRlZmluaXRpb24ge1xuICAgIHJ1bm5lcnM6IFJ1bm5lcltdXG59XG5leHBvcnQgZGVmYXVsdCBJUGFyc2VyRGVmaW5pdGlvbjsiLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vRXh0ZW5zaW9ucy50c1wiIC8+XG5pbXBvcnQgSVBhcnNlckRlZmluaXRpb24gZnJvbSAnLi9JUGFyc2VyRGVmaW5pdGlvbic7XG5pbXBvcnQge1J1bm5lciwgQWN0aW9uUnVubmVyfSBmcm9tICcuLi9SdW5uZXJzJztcbmltcG9ydCBDb21tYW5kIGZyb20gJy4uL0NvbW1hbmQnO1xuaW1wb3J0IFNjb3BlIGZyb20gJy4uL1Njb3BlJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuQXJyYXkucHJvdG90eXBlLmxhc3QgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gdGhpc1t0aGlzLmxlbmd0aC0xXTtcbn1cbi8qKlxuICogVGhlIFNRaWdnTCBwYXJzZXJcbiAqIEBtb2R1bGUgUGFyc2VyXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7c3RyaW5nfSBzcWwgICAgICAgICAgICAgIC0gVGhlIFNRaWdnTCBxdWVyeSB0byBydW4gdGhlIHBhcnNlciBhZ2FpbnN0XG4gKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAgICAtIEFueSB2YXJpYWJsZXMgcGFzc2VkIHRvIHRoZSBTUWlnZ0wgcGFyc2VyXG4gKiBAcHJvcGVydHkge3N0cmluZ30gc3FsICAgICAgICAgICAtIFRoZSBTUWlnZ0wgcXVlcnkgdG8gcnVuIHRoZSBwYXJzZXIgYWdhaW5zdFxuICogQHByb3BlcnR5IHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgLSBBbnkgdmFyaWFibGVzIHBhc3NlZCB0byB0aGUgU1FpZ2dMIHBhcnNlclxuICogQHByb3BlcnR5IHtDb21tYW5kW119IGNvbW1hbmRzICAgLSBBcnJheSBvZiBjb21tYW5kcyBmb3VuZCBpbiB0aGUgU1FpZ2dMIHF1ZXJ5XG4gKiBAcHJvcGVydHkge0NvbW1hbmRbXX0gc3RhY2sgICAgICAtIENvbW1hbmQgc3RhY2sgZm9yIHN0b3JpbmcgY3VycmVudCBwb3NpdGlvbiBpbiB0aGUgcGFyc2luZyBwcm9jZXNzXG4gKiBAcHJvcGVydHkge3N0cmluZ30gZXJyb3IgICAgICAgICAtIEVycm9yIHN0cmluZyBpZiBhbnkgZXJyb3JzIGFyZSBmb3VuZCBpbiB0aGUgcGFyc2luZyBwcm9jZXNzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhcnNlciB7XG4gICAgcHVibGljIHJlZ2V4OiBSZWdFeHA7XG5cdHB1YmxpYyBjb21tYW5kczogQ29tbWFuZFtdID0gW107XG5cdHB1YmxpYyBzdGFjazogQ29tbWFuZFtdID0gW107XG4gICAgcHVibGljIGVycm9yOiBzdHJpbmdbXSA9IFtdO1xuICAgIHB1YmxpYyBzcWw6IHN0cmluZztcblx0Ly8gY29uc3RydWN0b3IocHVibGljIHNxbDogc3RyaW5nLCBwdWJsaWMgdmFyaWFibGVzOiBJVmFyaWFibGVzKXtcblx0XHQvLyB0aGlzLmNvbW1hbmRzID0gdGhpcy5leHRyYWN0KHNxbCwgdmFyaWFibGVzKTtcblx0XHQvLyB0aGlzLnZhcmlhYmxlcyA9IHZhcmlhYmxlcztcblx0Ly8gfVxuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBkZWZpbml0aW9uOiBJUGFyc2VyRGVmaW5pdGlvbil7XG4gICAgICAgIGlmKCFkZWZpbml0aW9uKSB0aHJvdyAnQXR0ZW1wdGVkIHRvIGluc3RhdGlhdGUgcGFyc2VyIHdpdGhvdXQgYSBkZWZpbml0aW9uJztcbiAgICAgICAgdGhpcy5yZWdleCA9IG5ldyBSZWdFeHAoYCg/OiR7dGhpcy5kZWZpbml0aW9uLnJ1bm5lcnMubWFwKHggPT4geC5kZWZpbml0aW9uLnJlZ2V4LnNvdXJjZSkuam9pbignKXwoJyl9KWAsICdnbScpO1xuICAgIH1cblx0LyoqXG4gICAgICogRXh0cmFjdCBhbnkgY29tbWFuZHMgb3V0IG9mIHRoZSBTUWlnZ0wgcXVlcnkgYW5kIGRldGVybWluZSB0aGVpciBvcmRlciwgbmVzdGluZywgYW5kIHR5cGVcbiAgICAgKiBAbWVtYmVyb2YgUGFyc2VyXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3FsICAgICAgICAgICAgICAtIFNRaWdnTCBxdWVyeSB0byBleHRyYWN0IGNvbW1hbmRzIGZyb21cbiAgICAgKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAgICAtIEFueSBnbG9iYWwgdmFyaWFibGVzIHBhc3NlZCBpbiB0byBTUWlnZ0xcbiAgICAgKiBAcmV0dXJucyB7Q29tbWFuZFtdfSAgICAgICAgICAgICAtIEFycmF5IG9mIGZ1bGx5IHBhcnNlZCBjb21tYW5kcywgcmVhZHkgZm9yIGV4ZWN1dGlvblxuICAgICAqL1xuXHRwdWJsaWMgcGFyc2Uoc3FsOiBzdHJpbmcsIHZhcmlhYmxlczogSVZhcmlhYmxlcyl7XG5cdCAgICB0aGlzLmNvbW1hbmRzID0gW107XG4gICAgICAgIHRoaXMuc3RhY2sgPSBbXTtcbiAgICAgICAgdGhpcy5zcWwgPSBzcWw7XG4gICAgICAgIGxldCBtYXRjaDtcblx0XHQvLyBDb21tYW5kLnJlZ2V4Lmxhc3RJbmRleCA9IDA7XG5cdFx0d2hpbGUoKG1hdGNoID0gdGhpcy5yZWdleC5leGVjKHNxbCkpICE9IG51bGwpe1xuICAgICAgICAgICAgbGV0IGZvdW5kOiBDb21tYW5kLCBydW5uZXI6IFJ1bm5lcjtcbiAgICAgICAgICAgIGZvcihydW5uZXIgb2YgdGhpcy5kZWZpbml0aW9uLnJ1bm5lcnMpe1xuICAgICAgICAgICAgICAgIGlmKHJ1bm5lci5tYXRjaGVzKG1hdGNoWzBdKSl7XG4gICAgICAgICAgICAgICAgICAgIGZvdW5kID0gbmV3IENvbW1hbmQobWF0Y2guaW5kZXgsIG1hdGNoLmlucHV0Lmxlbmd0aCwgbWF0Y2hbMV0sIG1hdGNoWzJdLCBuZXcgU2NvcGUoKSwgcnVubmVyKTtcbiAgICAgICAgICAgICAgICAgICAgcnVubmVyLnBhcnNlKGZvdW5kKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cdFx0XHRpZih0aGlzLnN0YWNrLmxlbmd0aCA+IDAgJiYgdGhpcy5zdGFjay5sYXN0KCkuYWN0aW9uLmRlZmluaXRpb24uZGVwZW5kZW50cy5jb250YWlucyhmb3VuZC5hY3Rpb24pKXtcbiAgICAgICAgICAgICAgICAvLyBmb3VuZC5hY3Rpb24uc3VwcG9ydGVyID0gc3RhY2subGFzdCgpO1xuXHRcdFx0XHR0aGlzLnN0YWNrLmxhc3QoKS5kZXBlbmRlbnRzLnB1c2goZm91bmQpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAodGhpcy5zdGFjay5sZW5ndGggPiAwICYmICF0aGlzLnN0YWNrLmxhc3QoKS5hY3Rpb24uZGVmaW5pdGlvbi50ZXJtaW5hdG9yKSB7XG5cdFx0XHRcdHRoaXMuc3RhY2sucHVzaChmb3VuZCk7XG5cdFx0XHRcdHRoaXMuc3RhY2subGFzdCgpLnNjb3BlLmNvbW1hbmRzLnB1c2goZm91bmQpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGlmKHRoaXMuc3RhY2subGVuZ3RoID4gMCAmJiB0aGlzLnN0YWNrLmxhc3QoKS5hY3Rpb24uZGVmaW5pdGlvbi50ZXJtaW5hdG9yKSB0aGlzLnN0YWNrLnBvcCgpO1xuXHRcdFx0XHR0aGlzLnN0YWNrLnB1c2goZm91bmQpO1xuXHRcdFx0XHR0aGlzLmNvbW1hbmRzLnB1c2goZm91bmQpO1xuXHRcdFx0fVxuICAgICAgICAgICAgLy8gbGV0IGVycm9yID0gZm91bmQuYWN0aW9uLnZhbGlkYXRlKCk7XG4gICAgICAgICAgICAvLyBpZihlcnJvcikgcmV0dXJuIFtdO1xuXHRcdH1cblx0XHQvLyByZXR1cm4gY29tbWFuZHM7XG5cdH1cblx0LyoqXG4gICAgICogUnVuIHRoZSBjb21tYW5kcyBhZ2FpbnN0IHRoZSBzdHJpbmcgYW5kIG91dHB1dCB0aGUgZW5kIHJlc3VsdFxuICAgICAqIEBtZW1iZXJvZiBQYXJzZXJcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBlbmQgcmVzdWx0IG9mIHJ1bm5pbmcgYWxsIGNvbW1hbmRzIGFnYWluc3QgdGhlIFNRaWdnTCBxdWVyeVxuICAgICAqL1xuXHRwdWJsaWMgcGVyZm9ybSgpOiBzdHJpbmcge1xuXHRcdHZhciBxdWVyeSA9ICcnLCBpbmRleCA9IDA7XG4gICAgICAgIGlmKHRoaXMuY29tbWFuZHMubGVuZ3RoID09PSAwKSByZXR1cm4gdGhpcy5zcWw7XG5cdFx0Zm9yKHZhciBjb21tYW5kIG9mIHRoaXMuY29tbWFuZHMpe1xuXHRcdFx0cXVlcnkgKz0gdGhpcy5zcWwuc2xpY2UoaW5kZXgsIGNvbW1hbmQuaW5kZXggLTEpO1xuXHRcdFx0cXVlcnkgKz0gY29tbWFuZC5wZXJmb3JtKGNvbW1hbmQpLnJlc3VsdC50ZXh0O1xuXHRcdFx0aW5kZXggKz0gY29tbWFuZC5sZW5ndGg7XG5cdFx0fVxuXHRcdHJldHVybiBxdWVyeTsgLy9UT0RPXG5cdH1cbn0iLCJpbXBvcnQge01vZGlmaWVyfSBmcm9tICcuLi9Nb2RpZmllcnMnO1xuaW50ZXJmYWNlIElQbGFjZWhvbGRlciB7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIGxvY2F0b3I6IFJlZ0V4cDtcbiAgICByZXBsYWNlbWVudDogKGl0ZW0/Ok1vZGlmaWVyW10pID0+IHN0cmluZztcbn1cbmV4cG9ydCBkZWZhdWx0IElQbGFjZWhvbGRlcjsiLCJpbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcblxuaW50ZXJmYWNlIElSZXBsYWNlckRlZmluaXRpb24ge1xuICAgIHJlZ2V4OiBSZWdFeHA7XG4gICAgcnVsZTogKGRlZmluaXRpb246IElSZXBsYWNlckRlZmluaXRpb24sIHRleHQ6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzKSA9PiBzdHJpbmc7XG59XG5leHBvcnQgZGVmYXVsdCBJUmVwbGFjZXJEZWZpbml0aW9uOyIsImltcG9ydCBJUmVwbGFjZXJEZWZpbml0aW9uIGZyb20gJy4vSVJlcGxhY2VyRGVmaW5pdGlvbic7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVwbGFjZXIgeyAgICBcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgZGVmaW5pdGlvbjogSVJlcGxhY2VyRGVmaW5pdGlvbil7XG4gICAgICAgIGlmKCFkZWZpbml0aW9uKSB0aHJvdyAnQXR0ZW1wdGVkIHRvIGluc3RhdGlhdGUgcmVwbGFjZXIgd2l0aG91dCBhIGRlZmluaXRpb24nO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgcmVwbGFjZSh0ZXh0OiBzdHJpbmcsIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IHN0cmluZ3tcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVmaW5pdGlvbi5ydWxlKHRoaXMuZGVmaW5pdGlvbiwgdGV4dCwgdmFyaWFibGVzKTtcbiAgICB9XG59IiwiaW1wb3J0IHtBY3Rpb259IGZyb20gJy4uL0FjdGlvbnMnO1xuaW1wb3J0IHtSZXBsYWNlcn0gZnJvbSAnLi4vUmVwbGFjZXJzJztcblxuaW50ZXJmYWNlIElSdW5uZXJEZWZpbml0aW9uIHtcbiAgICByZWdleDogUmVnRXhwO1xuICAgIGFjdGlvbnM6IEFjdGlvbltdO1xuICAgIHJlcGxhY2VyczogUmVwbGFjZXJbXTtcbn1cbmV4cG9ydCBkZWZhdWx0IElSdW5uZXJEZWZpbml0aW9uOyIsImltcG9ydCBJUnVubmVyRGVmaW5pdGlvbiBmcm9tICcuL0lSdW5uZXJEZWZpbml0aW9uJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuaW1wb3J0IFNjb3BlIGZyb20gJy4uL1Njb3BlJztcbmltcG9ydCB7QWN0aW9ufSBmcm9tICcuLi9BY3Rpb25zJztcbmltcG9ydCBDb21tYW5kIGZyb20gJy4uL0NvbW1hbmQnO1xuaW1wb3J0IHtSZXBsYWNlcn0gZnJvbSAnLi4vUmVwbGFjZXJzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUnVubmVyIHtcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgZGVmaW5pdGlvbjogSVJ1bm5lckRlZmluaXRpb24pe1xuICAgICAgICBpZighZGVmaW5pdGlvbikgdGhyb3cgJ0F0dGVtcHRlZCB0byBpbnN0YXRpYXRlIHJ1bm5lciB3aXRob3V0IGEgZGVmaW5pdGlvbic7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBwYXJzZShjb21tYW5kOiBDb21tYW5kKSB7XG4gICAgICAgIGxldCBhY3Rpb246IEFjdGlvbjtcbiAgICAgICAgZm9yKGFjdGlvbiBvZiB0aGlzLmRlZmluaXRpb24uYWN0aW9ucyl7XG4gICAgICAgICAgICBpZihhY3Rpb24ubWF0Y2hlcyhjb21tYW5kLnN0YXRlbWVudCkpIHtcbiAgICAgICAgICAgICAgICBjb21tYW5kLmFjdGlvbiA9IGFjdGlvbjtcbiAgICAgICAgICAgICAgICBjb21tYW5kLmFjdGlvbi5wYXJzZShjb21tYW5kKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgcGVyZm9ybShjb21tYW5kOiBDb21tYW5kLCBwcmV2PzogQ29tbWFuZCk6IENvbW1hbmQge1xuICAgICAgICBjb21tYW5kLmFjdGlvbi5wZXJmb3JtKHByZXYpO1xuICAgICAgICBjb21tYW5kLnJlc3VsdC5kZXBlbmRlbnQgPSBjb21tYW5kLnNjb3BlLnBlcmZvcm0oY29tbWFuZCkucmVzdWx0O1xuICAgICAgICBsZXQgcmVwbGFjZXI6IFJlcGxhY2VyO1xuICAgICAgICBmb3IocmVwbGFjZXIgb2YgdGhpcy5kZWZpbml0aW9uLnJlcGxhY2Vycyl7XG4gICAgICAgICAgICBjb21tYW5kLnJlcGxhY2UocmVwbGFjZXIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb21tYW5kO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgbWF0Y2hlcyh0ZXh0OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgdGhpcy5kZWZpbml0aW9uLnJlZ2V4Lmxhc3RJbmRleCA9IDA7XG4gICAgICAgIHJldHVybiB0aGlzLmRlZmluaXRpb24ucmVnZXgudGVzdCh0ZXh0KTtcbiAgICB9XG59Il19
