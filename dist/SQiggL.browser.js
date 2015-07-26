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
        if (command.condition.perform(command))
            command.result = new CommandResult_1.default(command.inner + command.scope.perform() + command.terminate(), true);
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
            text += dependent.perform(this);
        }
        return text;
    };
    Command.prototype.terminate = function () {
        return this.scope.commands.some(function (command) { return command.action.definition.terminator; })
            ? this.scope.commands.filter(function (command) { return command.action.definition.terminator; })[1].perform().result.text
            : '';
    };
    return Command;
})();
exports.default = Command;

},{"./commands/CommandResult":17}],3:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQWN0aW9ucy50cyIsInNyYy9Db21tYW5kLnRzIiwic3JjL0NvbmRpdGlvbnMudHMiLCJzcmMvRXJyb3JzLnRzIiwic3JjL0V4dGVuc2lvbnMudHMiLCJzcmMvSVZhcmlhYmxlcy50cyIsInNyYy9NYWluLnRzIiwic3JjL01vZGlmaWVycy50cyIsInNyYy9QYXJzZXJzLnRzIiwic3JjL1BsYWNlaG9sZGVycy50cyIsInNyYy9SZXBsYWNlcnMudHMiLCJzcmMvUnVubmVycy50cyIsInNyYy9TUWlnZ0wudHMiLCJzcmMvU2NvcGUudHMiLCJzcmMvYWN0aW9ucy9BY3Rpb24udHMiLCJzcmMvYWN0aW9ucy9JQWN0aW9uRGVmaW5pdGlvbi50cyIsInNyYy9jb21tYW5kcy9Db21tYW5kUmVzdWx0LnRzIiwic3JjL2NvbmRpdGlvbnMvQ29uZGl0aW9uLnRzIiwic3JjL2NvbmRpdGlvbnMvQ29uZGl0aW9uUmVzdWx0LnRzIiwic3JjL2NvbmRpdGlvbnMvSUNvbmRpdGlvbkRlZmluaXRpb24udHMiLCJzcmMvY29uZGl0aW9ucy9JQ29uZGl0aW9uSW5kaWNlcy50cyIsInNyYy9tb2RpZmllcnMvSU1vZGlmaWVyRGVmaW5pdGlvbi50cyIsInNyYy9tb2RpZmllcnMvTW9kaWZpZXIudHMiLCJzcmMvcGFyc2Vycy9JUGFyc2VyRGVmaW5pdGlvbi50cyIsInNyYy9wYXJzZXJzL1BhcnNlci50cyIsInNyYy9wbGFjZWhvbGRlcnMvSVBsYWNlaG9sZGVyLnRzIiwic3JjL3JlcGxhY2Vycy9JUmVwbGFjZXJEZWZpbml0aW9uLnRzIiwic3JjL3JlcGxhY2Vycy9SZXBsYWNlci50cyIsInNyYy9ydW5uZXJzL0lSdW5uZXJEZWZpbml0aW9uLnRzIiwic3JjL3J1bm5lcnMvUnVubmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQ0EsOEJBQTBC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LE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDN0I7UUFDRCxNQUFNLENBQUMsT0FBTyxDQUFDO0lBQ25CLENBQUM7SUFFTSx3QkFBTyxHQUFkLFVBQWUsSUFBWTtRQUN2QixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQ3BDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUNMLGFBQUM7QUFBRCxDQTdCQSxBQTZCQyxJQUFBO0FBN0JELHdCQTZCQyxDQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBJQWN0aW9uRGVmaW5pdGlvbiBmcm9tICcuL2FjdGlvbnMvSUFjdGlvbkRlZmluaXRpb24nO1xuaW1wb3J0IENvbW1hbmRSZXN1bHQgZnJvbSAnLi9jb21tYW5kcy9Db21tYW5kUmVzdWx0JztcbmltcG9ydCBBY3Rpb24gZnJvbSAnLi9hY3Rpb25zL0FjdGlvbic7XG5pbXBvcnQgQ29tbWFuZCBmcm9tICcuL0NvbW1hbmQnO1xuaW1wb3J0IHtDb25kaXRpb24sIEVxdWFsLCBHcmVhdGVyVGhhbiwgTGVzc1RoYW4sIElzTnVsbCwgQWxwaGFiZXRpY2FsbHlHcmVhdGVyVGhhbiwgQWxwaGFiZXRpY2FsbHlMZXNzVGhhbiwgTGVuZ3RoR3JlYXRlclRoYW4sIExlbmd0aExlc3NUaGFuLCBJc05hTiwgQmV0d2Vlbn0gZnJvbSAnLi9Db25kaXRpb25zJztcbmltcG9ydCBTY29wZSBmcm9tICcuL1Njb3BlJztcblxubGV0IEVuZElmRGVmaW5pdGlvbjogSUFjdGlvbkRlZmluaXRpb24gPSB7XG4gICAgcmVnZXg6IC9eXFxzKmVuZGlmXFxiL2ksXG4gICAgY29uZGl0aW9uczogW10sXG4gICAgZGVwZW5kZW50czogW10sXG4gICAgdGVybWluYXRvcjogZmFsc2UsXG4gICAgcnVsZTogKGNvbW1hbmQ6IENvbW1hbmQsIHByZXY/OiBDb21tYW5kKTogQ29tbWFuZCA9PiB7XG4gICAgICAgIGNvbW1hbmQucmVzdWx0ID0gbmV3IENvbW1hbmRSZXN1bHQoY29tbWFuZC5pbm5lciwgdHJ1ZSk7XG4gICAgICAgIHJldHVybiBjb21tYW5kO1xuICAgIH1cbn07XG5leHBvcnQgbGV0IEVuZElmID0gbmV3IEFjdGlvbihFbmRJZkRlZmluaXRpb24pO1xuXG5sZXQgRWxzZURlZmluaXRpb246IElBY3Rpb25EZWZpbml0aW9uID0ge1xuICAgIHJlZ2V4OiAvXlxccyplbHNlXFxiL2ksXG4gICAgY29uZGl0aW9uczogW10sXG4gICAgZGVwZW5kZW50czogW10sXG4gICAgdGVybWluYXRvcjogZmFsc2UsXG4gICAgcnVsZTogKGNvbW1hbmQ6IENvbW1hbmQsIHByZXY/OiBDb21tYW5kKTogQ29tbWFuZCA9PiB7XG4gICAgICAgIGlmKCFwcmV2LnJlc3VsdC5wYXNzZWQpIGNvbW1hbmQucmVzdWx0ID0gbmV3IENvbW1hbmRSZXN1bHQoY29tbWFuZC5pbm5lciArIGNvbW1hbmQuc2NvcGUucGVyZm9ybSgpLCB0cnVlKTtcbiAgICAgICAgZWxzZSBjb21tYW5kLnJlc3VsdCA9IG5ldyBDb21tYW5kUmVzdWx0KCcnLCBmYWxzZSk7XG4gICAgICAgIHJldHVybiBjb21tYW5kO1xuICAgIH1cbn07XG5leHBvcnQgbGV0IEVsc2UgPSBuZXcgQWN0aW9uKEVsc2VEZWZpbml0aW9uKTtcblxubGV0IElmRGVmaW5pdGlvbjogSUFjdGlvbkRlZmluaXRpb24gPSB7XG4gICAgcmVnZXg6IC9eXFxzKmlmXFxiL2ksXG4gICAgY29uZGl0aW9uczogW0VxdWFsLCBHcmVhdGVyVGhhbiwgTGVzc1RoYW4sIElzTnVsbCwgQWxwaGFiZXRpY2FsbHlHcmVhdGVyVGhhbiwgQWxwaGFiZXRpY2FsbHlMZXNzVGhhbiwgTGVuZ3RoR3JlYXRlclRoYW4sIExlbmd0aExlc3NUaGFuLCBJc05hTiwgQmV0d2Vlbl0sXG4gICAgZGVwZW5kZW50czogW0Vsc2UsIEVuZElmXSxcbiAgICB0ZXJtaW5hdG9yOiBmYWxzZSxcbiAgICBydWxlOiAoY29tbWFuZDogQ29tbWFuZCwgcHJldj86IENvbW1hbmQpOiBDb21tYW5kID0+IHtcbiAgICAgICAgaWYoY29tbWFuZC5jb25kaXRpb24ucGVyZm9ybShjb21tYW5kKSkgY29tbWFuZC5yZXN1bHQgPSBuZXcgQ29tbWFuZFJlc3VsdChjb21tYW5kLmlubmVyICsgY29tbWFuZC5zY29wZS5wZXJmb3JtKCkgKyBjb21tYW5kLnRlcm1pbmF0ZSgpLCB0cnVlKTtcbiAgICAgICAgZWxzZSBjb21tYW5kLnJlc3VsdCA9IG5ldyBDb21tYW5kUmVzdWx0KGNvbW1hbmQuZGVmZXIoZmFsc2UpLCBmYWxzZSk7XG4gICAgICAgIHJldHVybiBjb21tYW5kO1xuICAgIH0gXG59O1xuZXhwb3J0IGxldCBJZiA9IG5ldyBBY3Rpb24oSWZEZWZpbml0aW9uKTtcblxuZXhwb3J0IHtkZWZhdWx0IGFzIElBY3Rpb25EZWZpbml0aW9ufSBmcm9tICcuL2FjdGlvbnMvSUFjdGlvbkRlZmluaXRpb24nO1xuZXhwb3J0IHtkZWZhdWx0IGFzIEFjdGlvbn0gZnJvbSAnLi9hY3Rpb25zL0FjdGlvbic7IiwiaW1wb3J0IHtSdW5uZXJ9IGZyb20gJy4vUnVubmVycyc7XG5pbXBvcnQge0FjdGlvbn0gZnJvbSAnLi9BY3Rpb25zJztcbmltcG9ydCB7Q29uZGl0aW9ufSBmcm9tICcuL0NvbmRpdGlvbnMnO1xuaW1wb3J0IHtNb2RpZmllcn0gZnJvbSAnLi9Nb2RpZmllcnMnO1xuaW1wb3J0IHtSZXBsYWNlcn0gZnJvbSAnLi9SZXBsYWNlcnMnO1xuaW1wb3J0IENvbW1hbmRSZXN1bHQgZnJvbSAnLi9jb21tYW5kcy9Db21tYW5kUmVzdWx0JztcbmltcG9ydCBTY29wZSBmcm9tICcuL1Njb3BlJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tbWFuZCB7XG4gICAgcHVibGljIGRlcGVuZGVudHM6IENvbW1hbmRbXSA9IFtdO1xuICAgIHB1YmxpYyBhY3Rpb246IEFjdGlvbjtcbiAgICBwdWJsaWMgY29uZGl0aW9uOiBDb25kaXRpb247XG4gICAgcHVibGljIG1vZGlmaWVyczogTW9kaWZpZXJbXSA9IFtdO1xuICAgIHB1YmxpYyByZXN1bHQ6IENvbW1hbmRSZXN1bHQgPSBuZXcgQ29tbWFuZFJlc3VsdCgnJywgZmFsc2UpO1xuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBpbmRleDogbnVtYmVyLCBwdWJsaWMgbGVuZ3RoOiBudW1iZXIsIHB1YmxpYyBzdGF0ZW1lbnQ6IHN0cmluZywgcHVibGljIGlubmVyOiBzdHJpbmcsIHB1YmxpYyBzY29wZTogU2NvcGUsIHByaXZhdGUgcnVubmVyOiBSdW5uZXIpe1xuICAgICAgICBsZXQgYWN0aW9uOiBBY3Rpb247XG4gICAgICAgIGZvcihhY3Rpb24gb2YgcnVubmVyLmRlZmluaXRpb24uYWN0aW9ucyl7XG4gICAgICAgICAgICBpZihhY3Rpb24ubWF0Y2hlcyhzdGF0ZW1lbnQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hY3Rpb24gPSBhY3Rpb247XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgcHVibGljIHBlcmZvcm0ocHJldj86IENvbW1hbmQpOiBDb21tYW5kIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucnVubmVyLnBlcmZvcm0odGhpcywgcHJldik7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyByZXBsYWNlKHJlcGxhY2VyOiBSZXBsYWNlcil7XG4gICAgICAgIHRoaXMucmVzdWx0LnRleHQgPSByZXBsYWNlci5yZXBsYWNlKHRoaXMucmVzdWx0LnRleHQsIHRoaXMuc2NvcGUudmFyaWFibGVzKTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIGRlZmVyKHBhc3NlZDogYm9vbGVhbik6IHN0cmluZyB7XG4gICAgICAgIGxldCBkZXBlbmRlbnQ6Q29tbWFuZCwgdGV4dDogc3RyaW5nID0gJyc7XG4gICAgICAgIGZvcihkZXBlbmRlbnQgb2YgdGhpcy5kZXBlbmRlbnRzKXtcbiAgICAgICAgICAgIHRleHQgKz0gZGVwZW5kZW50LnBlcmZvcm0odGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyB0ZXJtaW5hdGUoKTogc3RyaW5ne1xuICAgICAgICByZXR1cm4gdGhpcy5zY29wZS5jb21tYW5kcy5zb21lKGNvbW1hbmQgPT4gY29tbWFuZC5hY3Rpb24uZGVmaW5pdGlvbi50ZXJtaW5hdG9yKVxuXHRcdCAgPyB0aGlzLnNjb3BlLmNvbW1hbmRzLmZpbHRlcihjb21tYW5kID0+IGNvbW1hbmQuYWN0aW9uLmRlZmluaXRpb24udGVybWluYXRvcilbMV0ucGVyZm9ybSgpLnJlc3VsdC50ZXh0XG5cdFx0ICA6ICcnO1xuICAgIH1cbn0iLCJpbXBvcnQgSUNvbmRpdGlvbkRlZmluaXRpb24gZnJvbSAnLi9jb25kaXRpb25zL0lDb25kaXRpb25EZWZpbml0aW9uJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4vSVZhcmlhYmxlcyc7XG5pbXBvcnQgQ29uZGl0aW9uIGZyb20gJy4vY29uZGl0aW9ucy9Db25kaXRpb24nO1xuaW1wb3J0IHtOb3QsIE9yRXF1YWx9IGZyb20gJy4vTW9kaWZpZXJzJztcbmxldCBFcXVhbERlZmluaXRpb246IElDb25kaXRpb25EZWZpbml0aW9uID0ge1xuICAgIHRlbXBsYXRlOiAnKHYpIChtKT0obSkgKGMpJyxcbiAgICBpdGVtczogWyd2YXJpYWJsZScsIFtOb3QsIE9yRXF1YWxdLCBbT3JFcXVhbF0sICdjb21wYXJhdGl2ZSddLFxuICAgIHJ1bGU6ICh2YXJpYWJsZTogc3RyaW5nLCBjb21wYXJhdGl2ZTogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBib29sZWFuID0+IHZhcmlhYmxlc1t2YXJpYWJsZV0gPT09IGNvbXBhcmF0aXZlXG59XG5leHBvcnQgbGV0IEVxdWFsID0gbmV3IENvbmRpdGlvbihFcXVhbERlZmluaXRpb24pO1xuXG5sZXQgR3JlYXRlclRoYW5EZWZpbml0aW9uOiBJQ29uZGl0aW9uRGVmaW5pdGlvbiA9IHtcbiAgICB0ZW1wbGF0ZTogJyh2KSAobSk+KG0pIChjKScsXG4gICAgaXRlbXM6IFsndmFyaWFibGUnLCBbTm90XSwgW09yRXF1YWxdLCAnY29tcGFyYXRpdmUnXSxcbiAgICBydWxlOiAodmFyaWFibGU6IHN0cmluZywgY29tcGFyYXRpdmU6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogYm9vbGVhbiA9PiBwYXJzZUZsb2F0KHZhcmlhYmxlc1t2YXJpYWJsZV0pID4gcGFyc2VGbG9hdChjb21wYXJhdGl2ZSlcbn1cbmV4cG9ydCBsZXQgR3JlYXRlclRoYW4gPSBuZXcgQ29uZGl0aW9uKEdyZWF0ZXJUaGFuRGVmaW5pdGlvbik7XG5cbmxldCBMZXNzVGhhbkRlZmluaXRpb246IElDb25kaXRpb25EZWZpbml0aW9uID0ge1xuICAgIHRlbXBsYXRlOiAnKHYpIChtKTwobSkgKGMpJyxcbiAgICBpdGVtczogWyd2YXJpYWJsZScsIFtOb3RdLCBbT3JFcXVhbF0sICdjb21wYXJhdGl2ZSddLFxuICAgIHJ1bGU6ICh2YXJpYWJsZTogc3RyaW5nLCBjb21wYXJhdGl2ZTogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBib29sZWFuID0+IHBhcnNlRmxvYXQodmFyaWFibGVzW3ZhcmlhYmxlXSkgPCBwYXJzZUZsb2F0KGNvbXBhcmF0aXZlKVxufVxuZXhwb3J0IGxldCBMZXNzVGhhbiA9IG5ldyBDb25kaXRpb24oTGVzc1RoYW5EZWZpbml0aW9uKTtcblxubGV0IElzTnVsbERlZmluaXRpb246IElDb25kaXRpb25EZWZpbml0aW9uID0ge1xuICAgIHRlbXBsYXRlOiAnKHYpIGlzIChtKSBudWxsJyxcbiAgICBpdGVtczogWyd2YXJpYWJsZScsIFtOb3RdXSxcbiAgICBydWxlOiAodmFyaWFibGU6IHN0cmluZywgY29tcGFyYXRpdmU6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogYm9vbGVhbiA9PiB2YXJpYWJsZXNbdmFyaWFibGVdID09IG51bGxcbn1cbmV4cG9ydCBsZXQgSXNOdWxsID0gbmV3IENvbmRpdGlvbihJc051bGxEZWZpbml0aW9uKTtcblxubGV0IEFscGhhYmV0aWNhbGx5R3JlYXRlclRoYW5EZWZpbml0aW9uOiBJQ29uZGl0aW9uRGVmaW5pdGlvbiA9IHtcbiAgICB0ZW1wbGF0ZTogJyh2KSAobSlhYmM+KG0pIChjKScsXG4gICAgaXRlbXM6IFsndmFyaWFibGUnLCBbTm90XSwgW09yRXF1YWxdLCAnY29tcGFyYXRpdmUnXSxcbiAgICBydWxlOiAodmFyaWFibGU6IHN0cmluZywgY29tcGFyYXRpdmU6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogYm9vbGVhbiA9PiBbdmFyaWFibGVzW3ZhcmlhYmxlXSwgdGhpcy5jb21wYXJhdGl2ZV0uc29ydCgpLmluZGV4T2YoY29tcGFyYXRpdmUpID4gMFxufVxuZXhwb3J0IGxldCBBbHBoYWJldGljYWxseUdyZWF0ZXJUaGFuID0gbmV3IENvbmRpdGlvbihBbHBoYWJldGljYWxseUdyZWF0ZXJUaGFuRGVmaW5pdGlvbik7XG5cbmxldCBBbHBoYWJldGljYWxseUxlc3NUaGFuRGVmaW5pdGlvbjogSUNvbmRpdGlvbkRlZmluaXRpb24gPSB7XG4gICAgdGVtcGxhdGU6ICcodikgKG0pYWJjPChtKSAoYyknLFxuICAgIGl0ZW1zOiBbJ3ZhcmlhYmxlJywgW05vdF0sIFtPckVxdWFsXSwgJ2NvbXBhcmF0aXZlJ10sXG4gICAgcnVsZTogKHZhcmlhYmxlOiBzdHJpbmcsIGNvbXBhcmF0aXZlOiBzdHJpbmcsIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IGJvb2xlYW4gPT4gW3ZhcmlhYmxlc1t2YXJpYWJsZV0sIGNvbXBhcmF0aXZlXS5zb3J0KCkuaW5kZXhPZihjb21wYXJhdGl2ZSkgPT09IDBcbn1cbmV4cG9ydCBsZXQgQWxwaGFiZXRpY2FsbHlMZXNzVGhhbiA9IG5ldyBDb25kaXRpb24oQWxwaGFiZXRpY2FsbHlMZXNzVGhhbkRlZmluaXRpb24pO1xuXG5sZXQgTGVuZ3RoR3JlYXRlclRoYW5EZWZpbml0aW9uOiBJQ29uZGl0aW9uRGVmaW5pdGlvbiA9IHtcbiAgICB0ZW1wbGF0ZTogJyh2KSAobSlsZW4+KG0pIChjKScsXG4gICAgaXRlbXM6IFsndmFyaWFibGUnLCBbTm90XSwgW09yRXF1YWxdLCAnY29tcGFyYXRpdmUnXSxcbiAgICBydWxlOiAodmFyaWFibGU6IHN0cmluZywgY29tcGFyYXRpdmU6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogYm9vbGVhbiA9PiB2YXJpYWJsZXNbdmFyaWFibGVdLmxlbmd0aCA+IHBhcnNlSW50KGNvbXBhcmF0aXZlKVxufVxuZXhwb3J0IGxldCBMZW5ndGhHcmVhdGVyVGhhbiA9IG5ldyBDb25kaXRpb24oTGVuZ3RoR3JlYXRlclRoYW5EZWZpbml0aW9uKTtcblxubGV0IExlbmd0aExlc3NUaGFuRGVmaW5pdGlvbjogSUNvbmRpdGlvbkRlZmluaXRpb24gPSB7XG4gICAgdGVtcGxhdGU6ICcodikgKG0pbGVuPChtKSAoYyknLFxuICAgIGl0ZW1zOiBbJ3ZhcmlhYmxlJywgW05vdF0sIFtPckVxdWFsXSwgJ2NvbXBhcmF0aXZlJ10sXG4gICAgcnVsZTogKHZhcmlhYmxlOiBzdHJpbmcsIGNvbXBhcmF0aXZlOiBzdHJpbmcsIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IGJvb2xlYW4gPT4gdmFyaWFibGVzW3ZhcmlhYmxlXS5sZW5ndGggPCBwYXJzZUludChjb21wYXJhdGl2ZSlcbn1cbmV4cG9ydCBsZXQgTGVuZ3RoTGVzc1RoYW4gPSBuZXcgQ29uZGl0aW9uKExlbmd0aExlc3NUaGFuRGVmaW5pdGlvbik7XG5cbmxldCBJc05hTkRlZmluaXRpb246IElDb25kaXRpb25EZWZpbml0aW9uID0ge1xuICAgIHRlbXBsYXRlOiAnKHYpIGlzIChtKSBOYU4nLFxuICAgIGl0ZW1zOiBbJ3ZhcmlhYmxlJywgW05vdF1dLFxuICAgIHJ1bGU6ICh2YXJpYWJsZTogc3RyaW5nLCBjb21wYXJhdGl2ZTogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBib29sZWFuID0+IGlzTmFOKHZhcmlhYmxlc1t2YXJpYWJsZV0pXG59XG5leHBvcnQgbGV0IElzTmFOID0gbmV3IENvbmRpdGlvbihJc05hTkRlZmluaXRpb24pO1xuXG5sZXQgQmV0d2VlbkRlZmluaXRpb246IElDb25kaXRpb25EZWZpbml0aW9uID0ge1xuICAgIHRlbXBsYXRlOiAnKHYpIChjKT4obSk8KGMpJyxcbiAgICBpdGVtczogWyd2YXJpYWJsZScsICdjb21wYXJhdGl2ZScsIFtOb3QsIE9yRXF1YWxdLCAnY29tcGFyYXRpdmUnXSxcbiAgICBydWxlOiAodmFyaWFibGU6IHN0cmluZywgY29tcGFyYXRpdmU6IHN0cmluZ1tdLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBib29sZWFuID0+IHBhcnNlRmxvYXQoY29tcGFyYXRpdmVbMF0pID4gcGFyc2VGbG9hdCh2YXJpYWJsZXNbdmFyaWFibGVdKSAmJiBwYXJzZUZsb2F0KGNvbXBhcmF0aXZlWzFdKSA8IHBhcnNlRmxvYXQodmFyaWFibGVzW3ZhcmlhYmxlXSkgXG59XG5leHBvcnQgbGV0IEJldHdlZW4gPSBuZXcgQ29uZGl0aW9uKEJldHdlZW5EZWZpbml0aW9uKTtcblxuZXhwb3J0IHtkZWZhdWx0IGFzIENvbmRpdGlvbn0gZnJvbSAnLi9jb25kaXRpb25zL0NvbmRpdGlvbic7XG4iLCIvLyBpbXBvcnQgSUFjdGlvbiBmcm9tICdhY3Rpb25zL0lBY3Rpb24nO1xuLy8gLyoqXG4vLyAgKiBNb2R1bGUgb2YgZXJyb3IgY2hlY2tlcnNcbi8vICAqIEBtb2R1bGUgRXJyb3JzXG4vLyAgKiBAY2xhc3Ncbi8vICAqIEBzdGF0aWNcbi8vICAqL1xuLy8gZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXJyb3JzIHtcbi8vICAgICAvKipcbi8vICAgICAgKiBAbWVtYmVyb2YgRXJyb3JzXG4vLyAgICAgICogQG1ldGhvZFxuLy8gICAgICAqIEBzdGF0aWNcbi8vICAgICAgKiBAcGFyYW0ge0lBY3Rpb259IGFjdGlvbiAgICAgIC0gQWN0aW9uIHRvIGNoZWNrIGZvciBhbiBJbmNvcnJlY3QgU3RhdGVtZW50IGVycm9yXG4vLyAgICAgICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlbWVudCAgICAtIFN0YXRlbWVudCB0byBjaGVjayBmb3IgYSBJbmNvcnJlY3QgU3RhdGVtZW50IGVycm9yXG4vLyAgICAgICogQHJldHVybnMge3N0cmluZyB8IG51bGx9ICAgICAtIFRoZSBlcnJvciBtZXNzYWdlIGlmIGFueSwgb3RoZXJ3aXNlIG51bGwgXG4vLyAgICAgICovXG4vLyAgICAgcHVibGljIHN0YXRpYyBJbmNvcnJlY3RTdGF0ZW1lbnQoYWN0aW9uOiBJQWN0aW9uLCBzdGF0ZW1lbnQ6IHN0cmluZyk6IHN0cmluZ3tcbi8vICAgICAgICAgY29uc3QgYWN0aW9uczpzdHJpbmcgPSBhY3Rpb24uY29tbWFuZC5hY3Rpb25zLmZpbHRlcih4ID0+IHguZGVwZW5kZW50cy5zb21lKHkgPT4gYWN0aW9uIGluc3RhbmNlb2YgeSkpLm1hcCh4ID0+IHgubmFtZSkuam9pbignLCAnKTtcbi8vICAgICAgICAgY29uc3QgZXJyb3I6IHN0cmluZyA9IGBJbmNvcnJlY3Qgc3RhdGVtZW50IGZvdW5kIGF0IFwiJHtzdGF0ZW1lbnR9XCIuICR7YWN0aW9uLmNvbnN0cnVjdG9yWyduYW1lJ119IG11c3QgZm9sbG93ICR7YWN0aW9uc31gXG4vLyAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuLy8gICAgICAgICByZXR1cm4gZXJyb3I7XG4vLyAgICAgfVxuLy8gfSIsImludGVyZmFjZSBBcnJheTxUPntcblx0bGFzdCgpOiBUO1xuICAgIGlzRnVsbCgpOiBib29sZWFuO1xuICAgIGNvbnRhaW5zKFQpOiBib29sZWFuO1xufVxuQXJyYXkucHJvdG90eXBlLmxhc3QgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gdGhpc1t0aGlzLmxlbmd0aC0xXTtcbn1cblxuQXJyYXkucHJvdG90eXBlLmlzRnVsbCA9IGZ1bmN0aW9uKCl7XG4gICAgZm9yKGxldCBpPTA7aTx0aGlzLmxlbmd0aDtpKyspe1xuICAgICAgICBpZihpID09IG51bGwpIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5cbkFycmF5LnByb3RvdHlwZS5jb250YWlucyA9IGZ1bmN0aW9uKFQpe1xuICAgIHJldHVybiB0aGlzLnNvbWUoeCA9PiB4ID09PSBUKTtcbn0iLCJpbnRlcmZhY2UgSVZhcmlhYmxlcyB7XG5cdFtrZXk6IHN0cmluZ106IGFueTtcbn1cbmV4cG9ydCBkZWZhdWx0IElWYXJpYWJsZXM7IiwiaW1wb3J0IHtTUWlnZ0xQYXJzZXJ9IGZyb20gJy4vUGFyc2Vycyc7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuL0lWYXJpYWJsZXMnO1xuLyoqXG4gKiBUaGUgc3RhcnRpbmcgcG9pbnQgb2YgdGhlIGVudGlyZSBTUWlnZ0wgcGFyc2VyXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBzcWwgICAgICAgICAgICAgIC0gVGhlIFNRTCBxdWVyeSB0byBydW4gU1FpZ2dMIGFnYWluc3RcbiAqIEBwYXJhbSB7SVZhcmlhYmxlcz99IHZhcmlhYmxlcyAgIC0gT3B0aW9uYWwgY29sbGVjdGlvbiBvZiB2YXJpYWJsZXMgZm9yIHlvdXIgU1FpZ2dMIHF1ZXJ5XG4gKiBAcmV0dXJuIHtzdHJpbmd9ICAgICAgICAgICAgICAgICAtIFRoZSBmdWxseSBwYXJzZWQgU1FMIHF1ZXJ5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZShzcWw6IHN0cmluZywgdmFyaWFibGVzPzogSVZhcmlhYmxlcyk6IHN0cmluZ3tcblx0U1FpZ2dMUGFyc2VyLnBhcnNlKHNxbCwgdmFyaWFibGVzKTtcbiAgICByZXR1cm4gU1FpZ2dMUGFyc2VyLnBlcmZvcm0oKTtcbn0iLCJpbXBvcnQgSU1vZGlmaWVyRGVmaW5pdGlvbiBmcm9tICcuL21vZGlmaWVycy9JTW9kaWZpZXJEZWZpbml0aW9uJztcbmltcG9ydCBNb2RpZmllciBmcm9tICcuL21vZGlmaWVycy9Nb2RpZmllcic7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuL0lWYXJpYWJsZXMnO1xuXG5sZXQgTm90RGVmaW5pdGlvbjogSU1vZGlmaWVyRGVmaW5pdGlvbiA9IHtcbiAgICBpZGVudGlmaWVyczogWy8hL2ksIC8oPzpcXGJ8XFxzKylub3QoPzpcXGJ8XFxzKykvaV0sXG4gICAgcnVsZTogKHBhc3M6IGJvb2xlYW4sIHZhcmlhYmxlOiBzdHJpbmcsIGNvbXBhcmF0aXZlOiBzdHJpbmcgfCBzdHJpbmdbXSwgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogYm9vbGVhbiA9PiAhcGFzc1xufVxuZXhwb3J0IGxldCBOb3QgPSBuZXcgTW9kaWZpZXIoTm90RGVmaW5pdGlvbik7XG5cbmxldCBPckVxdWFsRGVmaW5pdGlvbjogSU1vZGlmaWVyRGVmaW5pdGlvbiA9IHtcbiAgICBpZGVudGlmaWVyczogWy89L2ldLFxuICAgIHJ1bGU6IChwYXNzOiBib29sZWFuLCB2YXJpYWJsZTogc3RyaW5nLCBjb21wYXJhdGl2ZTogc3RyaW5nIHwgc3RyaW5nW10sIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IGJvb2xlYW4gPT4gcGFzcyB8fCB2YXJpYWJsZXNbdmFyaWFibGVdID09PSBjb21wYXJhdGl2ZVxufVxuZXhwb3J0IGxldCBPckVxdWFsID0gbmV3IE1vZGlmaWVyKE9yRXF1YWxEZWZpbml0aW9uKTtcblxuZXhwb3J0IHtkZWZhdWx0IGFzIElNb2RpZmllckRlZmluaXRpb259IGZyb20gJy4vbW9kaWZpZXJzL0lNb2RpZmllckRlZmluaXRpb24nO1xuZXhwb3J0IHtkZWZhdWx0IGFzIE1vZGlmaWVyfSBmcm9tICcuL21vZGlmaWVycy9Nb2RpZmllcic7ICIsImltcG9ydCBJUGFyc2VyRGVmaW5pdGlvbiBmcm9tICcuL3BhcnNlcnMvSVBhcnNlckRlZmluaXRpb24nO1xuaW1wb3J0IFBhcnNlciBmcm9tICcuL3BhcnNlcnMvUGFyc2VyJztcbmltcG9ydCB7UnVubmVyLCBBY3Rpb25SdW5uZXJ9IGZyb20gJy4vUnVubmVycyc7XG5cbmxldCBTUWlnZ0xQYXJzZXJEZWZpbml0aW9uOiBJUGFyc2VyRGVmaW5pdGlvbiA9IHtcbiAgICBydW5uZXJzOiBbQWN0aW9uUnVubmVyXVxufVxuZXhwb3J0IGxldCBTUWlnZ0xQYXJzZXIgPSBuZXcgUGFyc2VyKFNRaWdnTFBhcnNlckRlZmluaXRpb24pOyBcblxuZXhwb3J0IHtkZWZhdWx0IGFzIElQYXJzZXJEZWZpbml0aW9ufSBmcm9tICcuL3BhcnNlcnMvSVBhcnNlckRlZmluaXRpb24nOyIsImltcG9ydCBJUGxhY2Vob2xkZXIgZnJvbSAnLi9wbGFjZWhvbGRlcnMvSVBsYWNlaG9sZGVyJztcbmltcG9ydCB7TW9kaWZpZXJ9IGZyb20gJy4vTW9kaWZpZXJzJztcbmV4cG9ydCBsZXQgUGxhY2Vob2xkZXJzOiBJUGxhY2Vob2xkZXJbXSA9IFtcbiAgICB7XG4gICAgICAgIG5hbWU6ICd2YXJpYWJsZScsXG4gICAgICAgIGxvY2F0b3I6IC9cXCh2XFwpL2ksXG4gICAgICAgIHJlcGxhY2VtZW50OiAoKSA9PiAnKFxcXFx3KyknXG4gICAgfSxcbiAgICB7XG4gICAgICAgIG5hbWU6ICdjb21wYXJhdGl2ZScsXG4gICAgICAgIGxvY2F0b3I6IC9cXChjXFwpL2ksXG4gICAgICAgIHJlcGxhY2VtZW50OiAoKSA9PiBgKFxcXFxkK3xbXCInXVxcXFx3K1tcIiddKWBcbiAgICB9LFxuICAgIHtcbiAgICAgICAgbmFtZTogJ21vZGlmaWVyJyxcbiAgICAgICAgbG9jYXRvcjogL1xcKG1cXCkvaSxcbiAgICAgICAgcmVwbGFjZW1lbnQ6IChpdGVtPzogTW9kaWZpZXJbXSkgPT4gYCgoPzoke2l0ZW0ubWFwKG1vZGlmaWVyID0+IG1vZGlmaWVyLmRlZmluaXRpb24uaWRlbnRpZmllcnMubWFwKGlkZW50aWZpZXIgPT4gaWRlbnRpZmllci5zb3VyY2UpLmpvaW4oJ3wnKSkuam9pbignfCcpfXxcXFxccyopKWBcbiAgICB9XG5dO1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gUGxhY2Vob2xkZXIobmFtZTogc3RyaW5nKXtcbiAgICByZXR1cm4gUGxhY2Vob2xkZXJzLmZpbHRlcih4ID0+IHgubmFtZSA9PT0gbmFtZSlbMF07XG59IiwiaW1wb3J0IElSZXBsYWNlckRlZmluaXRpb24gZnJvbSAnLi9yZXBsYWNlcnMvSVJlcGxhY2VyRGVmaW5pdGlvbic7XG5pbXBvcnQgUmVwbGFjZXIgZnJvbSAnLi9yZXBsYWNlcnMvUmVwbGFjZXInO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi9JVmFyaWFibGVzJztcblxubGV0IFZhcmlhYmxlRGVmaW5pdGlvbjogSVJlcGxhY2VyRGVmaW5pdGlvbiA9IHtcbiAgICByZWdleDogLyhbXntdfF4pe3soPyF7KVxccyooXFx3KilcXHMqfX0oPyF9KS9nLFxuICAgIHJ1bGU6IChkZWZpbml0aW9uOiBJUmVwbGFjZXJEZWZpbml0aW9uLCB0ZXh0OiBzdHJpbmcsIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IHN0cmluZyA9PiB0ZXh0LnJlcGxhY2UoZGVmaW5pdGlvbi5yZWdleCwgKG1hdGNoLCAkMSwgJDIpID0+ICQxK3ZhcmlhYmxlc1skMl0pXG59XG5leHBvcnQgbGV0IFZhcmlhYmxlID0gbmV3IFJlcGxhY2VyKFZhcmlhYmxlRGVmaW5pdGlvbik7XG5cbmV4cG9ydCB7ZGVmYXVsdCBhcyBJUmVwbGFjZXJEZWZpbml0aW9ufSBmcm9tICcuL3JlcGxhY2Vycy9JUmVwbGFjZXJEZWZpbml0aW9uJztcbmV4cG9ydCB7ZGVmYXVsdCBhcyBSZXBsYWNlcn0gZnJvbSAnLi9yZXBsYWNlcnMvUmVwbGFjZXInOyIsImltcG9ydCBJUnVubmVyRGVmaW5pdGlvbiBmcm9tICcuL3J1bm5lcnMvSVJ1bm5lckRlZmluaXRpb24nO1xuaW1wb3J0IFJ1bm5lciBmcm9tICcuL3J1bm5lcnMvUnVubmVyJztcbmltcG9ydCB7QWN0aW9uLCBJZiwgRWxzZSwgRW5kSWZ9IGZyb20gJy4vQWN0aW9ucyc7XG5pbXBvcnQge1JlcGxhY2VyLCBWYXJpYWJsZX0gZnJvbSAnLi9SZXBsYWNlcnMnO1xuXG5sZXQgQWN0aW9uUnVubmVyRGVmaW5pdGlvbjogSVJ1bm5lckRlZmluaXRpb24gPSB7XG4gICAgcmVnZXg6IC97eyUoLio/KSV9fShbXFxzXFxTXSo/KT8oPz0oPzp7eyV8JCkpL2dtLFxuICAgIGFjdGlvbnM6IFtJZiwgRWxzZSwgRW5kSWZdLFxuICAgIHJlcGxhY2VyczogW1ZhcmlhYmxlXVxufVxuZXhwb3J0IGxldCBBY3Rpb25SdW5uZXIgPSBuZXcgUnVubmVyKEFjdGlvblJ1bm5lckRlZmluaXRpb24pO1xuXG5leHBvcnQge2RlZmF1bHQgYXMgSVJ1bm5lckRlZmluaXRpb259IGZyb20gJy4vcnVubmVycy9JUnVubmVyRGVmaW5pdGlvbic7XG5leHBvcnQge2RlZmF1bHQgYXMgUnVubmVyfSBmcm9tICcuL3J1bm5lcnMvUnVubmVyJzsiLCJpbXBvcnQge3BhcnNlIGFzIFBhcnNlfSBmcm9tICcuL01haW4nO1xubGV0IFNRaWdnTCA9IHtcbiAgICBwYXJzZTogUGFyc2UsXG4gICAgdmVyc2lvbjogJzAuMS4wJyxcbiAgICAvL2V4dGVuZDogRXh0ZW5kXG59O1xuaWYodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHdpbmRvd1snU1FpZ2dMJ10gPSBTUWlnZ0w7XG5leHBvcnQgZGVmYXVsdCBTUWlnZ0w7IiwiaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi9JVmFyaWFibGVzJztcbmltcG9ydCBDb21tYW5kIGZyb20gJy4vQ29tbWFuZCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNjb3BlIHtcblx0cHVibGljIHZhcmlhYmxlczogSVZhcmlhYmxlcyA9IHt9O1xuXHRwdWJsaWMgY29tbWFuZHM6IENvbW1hbmRbXSA9IFtdO1xuXHRwdWJsaWMgZGVwZW5kZW50czogQ29tbWFuZFtdID0gW107XG4gICAgXG4gICAgcHVibGljIHBlcmZvcm0oKTogc3RyaW5nIHtcbiAgICAgICAgbGV0IGNvbW1hbmQ6IENvbW1hbmQsIHRleHQ6IHN0cmluZyA9ICcnO1xuICAgICAgICBmb3IoY29tbWFuZCBvZiB0aGlzLmNvbW1hbmRzKXtcbiAgICAgICAgICAgIHRleHQgKz0gY29tbWFuZC5wZXJmb3JtKCkucmVzdWx0LnRleHQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxufSIsImltcG9ydCBJQWN0aW9uRGVmaW5pdGlvbiBmcm9tICcuL0lBY3Rpb25EZWZpbml0aW9uJztcbmltcG9ydCB7Q29uZGl0aW9ufSBmcm9tICcuLi9Db25kaXRpb25zJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuaW1wb3J0IENvbW1hbmQgZnJvbSAnLi4vQ29tbWFuZCc7XG5pbXBvcnQgU2NvcGUgZnJvbSAnLi4vU2NvcGUnO1xuLy8gRE8gTk9UIFBVVCBJTlNUQU5DRSBJVEVNUyBJTiBUSElTIENMQVNTLCBEVU1NWVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWN0aW9uIHtcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgZGVmaW5pdGlvbjogSUFjdGlvbkRlZmluaXRpb24pe1xuICAgICAgICBpZighZGVmaW5pdGlvbikgdGhyb3cgJ0F0dGVtcHRlZCB0byBpbnN0YXRpYXRlIGFjdGlvbiB3aXRob3V0IGEgZGVmaW5pdGlvbic7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBtYXRjaGVzKHN0YXRlbWVudDogc3RyaW5nKTogYm9vbGVhbntcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVmaW5pdGlvbi5yZWdleC50ZXN0KHN0YXRlbWVudCk7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBwYXJzZShjb21tYW5kOiBDb21tYW5kKXtcbiAgICAgICAgbGV0IGNvbmRpdGlvbjogQ29uZGl0aW9uO1xuICAgICAgICBmb3IoY29uZGl0aW9uIG9mIHRoaXMuZGVmaW5pdGlvbi5jb25kaXRpb25zKXtcbiAgICAgICAgICAgIGlmKGNvbmRpdGlvbi5tYXRjaGVzKGNvbW1hbmQuc3RhdGVtZW50KSkge1xuICAgICAgICAgICAgICAgIGNvbW1hbmQuY29uZGl0aW9uID0gY29uZGl0aW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBwZXJmb3JtKGNvbW1hbmQ6IENvbW1hbmQsIHByZXY/OiBDb21tYW5kKTogQ29tbWFuZCB7XG4gICAgICAgIHJldHVybiB0aGlzLmRlZmluaXRpb24ucnVsZShjb21tYW5kLCBwcmV2KTtcbiAgICB9XG59IiwiaW1wb3J0IEFjdGlvbiBmcm9tICcuL0FjdGlvbic7XG5pbXBvcnQge0NvbmRpdGlvbn0gZnJvbSAnLi4vQ29uZGl0aW9ucyc7XG5pbXBvcnQgQ29tbWFuZCBmcm9tICcuLi9Db21tYW5kJztcbmltcG9ydCBTY29wZSBmcm9tICcuLi9TY29wZSc7XG5cbmludGVyZmFjZSBJQWN0aW9uRGVmaW5pdGlvbiB7XG4gICAgcmVnZXg6IFJlZ0V4cDtcbiAgICBjb25kaXRpb25zOiBDb25kaXRpb25bXTtcbiAgICBkZXBlbmRlbnRzOiBBY3Rpb25bXTtcbiAgICB0ZXJtaW5hdG9yOiBib29sZWFuO1xuICAgIHJ1bGU6IChjb21tYW5kOiBDb21tYW5kLCBwcmV2PzogQ29tbWFuZCkgPT4gQ29tbWFuZDtcbn1cbmV4cG9ydCBkZWZhdWx0IElBY3Rpb25EZWZpbml0aW9uOyIsIlxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tbWFuZFJlc3VsdCB7XG4gICAgcHVibGljIGRlcGVuZGVudDogQ29tbWFuZFJlc3VsdDtcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgdGV4dDogc3RyaW5nLCBwdWJsaWMgcGFzc2VkPzogYm9vbGVhbil7fVxufSIsImltcG9ydCBQbGFjZWhvbGRlciBmcm9tICcuLi9QbGFjZWhvbGRlcnMnO1xuaW1wb3J0IENvbmRpdGlvblJlc3VsdCBmcm9tICcuL0NvbmRpdGlvblJlc3VsdCc7XG5pbXBvcnQgSUNvbmRpdGlvbkluZGljZXMgZnJvbSAnLi9JQ29uZGl0aW9uSW5kaWNlcyc7XG5pbXBvcnQgSUNvbmRpdGlvbkRlZmluaXRpb24gZnJvbSAnLi9JQ29uZGl0aW9uRGVmaW5pdGlvbic7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcbmltcG9ydCBDb21tYW5kIGZyb20gJy4uL0NvbW1hbmQnO1xuaW1wb3J0IHtNb2RpZmllcn0gZnJvbSAnLi4vTW9kaWZpZXJzJ1xuaW1wb3J0ICcuLi9FeHRlbnNpb25zJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29uZGl0aW9uIHtcbiAgICBwcml2YXRlIHJlZ2V4OiBSZWdFeHA7XG4gICAgcHJpdmF0ZSBpbmRpY2llczogSUNvbmRpdGlvbkluZGljZXMgPSB7fTtcbiAgICBwcml2YXRlIHRlbXBsYXRlOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBpdGVtczogQXJyYXk8c3RyaW5nIHwgTW9kaWZpZXJbXT47XG4gICAgcHJpdmF0ZSBydWxlOiAodmFyaWFibGU6IHN0cmluZywgY29tcGFyYXRpdmU6IHN0cmluZyB8IHN0cmluZ1tdLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpID0+IGJvb2xlYW47XG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBkZWZpbml0aW9uOiBJQ29uZGl0aW9uRGVmaW5pdGlvbil7XG4gICAgICAgIGlmKCFkZWZpbml0aW9uKSB0aHJvdyAnQXR0ZW1wdGVkIHRvIGluc3RhdGlhdGUgY29uZGl0aW9uIHdpdGhvdXQgYSBkZWZpbml0aW9uJztcbiAgICAgICAgdGhpcy5yZWdleCA9IHRoaXMudHJhbnNsYXRlKHRoaXMuZGVmaW5pdGlvbik7XG4gICAgICAgIHRoaXMudGVtcGxhdGUgPSBkZWZpbml0aW9uLnRlbXBsYXRlO1xuICAgICAgICB0aGlzLml0ZW1zID0gZGVmaW5pdGlvbi5pdGVtcztcbiAgICAgICAgdGhpcy5ydWxlID0gZGVmaW5pdGlvbi5ydWxlO1xuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIHRyYW5zbGF0ZShkZWZpbml0aW9uOiBJQ29uZGl0aW9uRGVmaW5pdGlvbik6IFJlZ0V4cHtcbiAgICAgICAgbGV0IHRlbXBsYXRlID0gZGVmaW5pdGlvbi50ZW1wbGF0ZSwgaXRlbTogKHN0cmluZyB8IE1vZGlmaWVyW10pLCBuYW1lOiBzdHJpbmcsIGlkeD0xO1xuICAgICAgICBmb3IoaXRlbSBvZiBkZWZpbml0aW9uLml0ZW1zKXtcbiAgICAgICAgICAgIGlmKCFpdGVtKSB0aHJvdyAnSW52YWxpZCBpdGVtIGluIGl0ZW1zIGRlZmluaXRpb24nO1xuICAgICAgICAgICAgaWYoaXRlbSBpbnN0YW5jZW9mIEFycmF5KSBuYW1lID0gJ21vZGlmaWVyJztcbiAgICAgICAgICAgIGVsc2UgbmFtZSA9IDxzdHJpbmc+aXRlbTtcbiAgICAgICAgICAgIGxldCBwbGFjZWhvbGRlciA9IFBsYWNlaG9sZGVyKG5hbWUpO1xuICAgICAgICAgICAgdGVtcGxhdGUgPSB0ZW1wbGF0ZS5yZXBsYWNlKHBsYWNlaG9sZGVyLmxvY2F0b3IsIHBsYWNlaG9sZGVyLnJlcGxhY2VtZW50KGl0ZW0gaW5zdGFuY2VvZiBBcnJheSA/IGl0ZW0gOiBudWxsKSk7XG4gICAgICAgICAgICBpZih0aGlzLmluZGljaWVzW25hbWVdIGluc3RhbmNlb2YgQXJyYXkpICg8bnVtYmVyW10+dGhpcy5pbmRpY2llc1tuYW1lXSkucHVzaChpZHgpO1xuICAgICAgICAgICAgZWxzZSBpZighaXNOYU4oPGFueT50aGlzLmluZGljaWVzW25hbWVdKSkge1xuICAgICAgICAgICAgICAgIGxldCBhcnJheSA9IFtdO1xuICAgICAgICAgICAgICAgIGFycmF5LnB1c2godGhpcy5pbmRpY2llc1tuYW1lXSk7XG4gICAgICAgICAgICAgICAgYXJyYXkucHVzaChpZHgpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5kaWNpZXNbbmFtZV0gPSBhcnJheTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgdGhpcy5pbmRpY2llc1tuYW1lXSA9IGlkeDtcbiAgICAgICAgICAgIHRoaXMuaW5kaWNpZXNbaWR4XSA9IG5hbWU7XG4gICAgICAgICAgICBpZHgrKztcbiAgICAgICAgfVxuICAgICAgICB0ZW1wbGF0ZSA9IHRlbXBsYXRlLnJlcGxhY2UoL1xccysvZywgJ1xcXFxzKycpO1xuICAgICAgICByZXR1cm4gbmV3IFJlZ0V4cCh0ZW1wbGF0ZSwgJ2knKTtcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBwYXJzZShjb21tYW5kOiBDb21tYW5kKTogQ29uZGl0aW9uUmVzdWx0IHtcbiAgICAgICAgbGV0IHJlc3VsdCA9IG5ldyBDb25kaXRpb25SZXN1bHQoKSwgbWF0Y2ggPSBjb21tYW5kLnN0YXRlbWVudC5tYXRjaCh0aGlzLnJlZ2V4KSwgaSwgbW9kaWZpZXI6IE1vZGlmaWVyO1xuICAgICAgICByZXN1bHQuc3RhdGVtZW50ID0gbWF0Y2hbMF07XG4gICAgICAgIGZvcihpPTE7aTxtYXRjaC5sZW5ndGg7aSsrKXtcbiAgICAgICAgICAgIGlmKHRoaXMuaXRlbXNbaS0xXSBpbnN0YW5jZW9mIEFycmF5KXtcbiAgICAgICAgICAgICAgICBmb3IobW9kaWZpZXIgb2YgPE1vZGlmaWVyW10+dGhpcy5pdGVtc1tpLTFdKXtcbiAgICAgICAgICAgICAgICAgICAgaWYobW9kaWZpZXIubWF0Y2hlcyhtYXRjaFtpXSkpIHJlc3VsdC5zZXQoPHN0cmluZz50aGlzLmluZGljaWVzW2ldLCBtb2RpZmllcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSByZXN1bHQuc2V0KDxzdHJpbmc+dGhpcy5pbmRpY2llc1tpXSwgbWF0Y2hbaV0pXG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0LnZhcmlhYmxlcyA9IGNvbW1hbmQuc2NvcGUudmFyaWFibGVzO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgcGVyZm9ybShjb21tYW5kOiBDb21tYW5kKTogYm9vbGVhbntcbiAgICAgICAgbGV0IHBhcnNlZCA9IHRoaXMucGFyc2UoY29tbWFuZCk7IFxuICAgICAgICBwYXJzZWQucGFzcyA9IHRoaXMucnVsZShwYXJzZWQudmFyaWFibGUsIHBhcnNlZC5jb21wYXJhdGl2ZSwgcGFyc2VkLnZhcmlhYmxlcyk7XG4gICAgICAgIGxldCBtb2Q6IE1vZGlmaWVyO1xuICAgICAgICBmb3IobW9kIG9mIDxNb2RpZmllcltdPnBhcnNlZC5tb2RpZmllcil7XG4gICAgICAgICAgICBpZihtb2QuZGVmaW5pdGlvbi5ydWxlKHBhcnNlZC5wYXNzLCBwYXJzZWQudmFyaWFibGUsIHBhcnNlZC5jb21wYXJhdGl2ZSwgcGFyc2VkLnZhcmlhYmxlcykpIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIG1hdGNoZXMoc3RhdGVtZW50OiBzdHJpbmcpe1xuICAgICAgICByZXR1cm4gdGhpcy5yZWdleC50ZXN0KHN0YXRlbWVudCk7XG4gICAgfVxufSIsImltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuaW1wb3J0IHtNb2RpZmllcn0gZnJvbSAnLi4vTW9kaWZpZXJzJztcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbmRpdGlvblJlc3VsdCB7XG4gICAgcHVibGljIHBhc3M6IGJvb2xlYW47XG4gICAgcHVibGljIHZhcmlhYmxlOiBzdHJpbmc7XG4gICAgcHVibGljIGNvbXBhcmF0aXZlOiBhbnk7XG4gICAgcHVibGljIHZhcmlhYmxlczogSVZhcmlhYmxlcztcbiAgICBwdWJsaWMgbW9kaWZpZXI6IE1vZGlmaWVyW10gPSBbXTtcbiAgICBwdWJsaWMgc3RhdGVtZW50OiBzdHJpbmc7XG4gICAgcHVibGljIHNldChwcm9wOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcgfCBNb2RpZmllcil7XG4gICAgICAgIGlmKHRoaXNbcHJvcF0gaW5zdGFuY2VvZiBBcnJheSkgdGhpc1twcm9wXS5wdXNoKHZhbHVlKTtcbiAgICAgICAgZWxzZSB0aGlzW3Byb3BdID0gdmFsdWU7XG4gICAgfVxufSIsImltcG9ydCB7TW9kaWZpZXJ9IGZyb20gJy4uL01vZGlmaWVycyc7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcbmludGVyZmFjZSBJQ29uZGl0aW9uRGVmaW5pdGlvbiB7XG4gICAgdGVtcGxhdGU6IHN0cmluZztcbiAgICBpdGVtczogQXJyYXk8c3RyaW5nIHwgTW9kaWZpZXJbXT47XG4gICAgcnVsZTogKHZhcmlhYmxlOiBzdHJpbmcsIGNvbXBhcmF0aXZlOiBzdHJpbmcgfCBzdHJpbmdbXSwgdmFyaWFibGVzOiBJVmFyaWFibGVzKSA9PiBib29sZWFuO1xufVxuZXhwb3J0IGRlZmF1bHQgSUNvbmRpdGlvbkRlZmluaXRpb247IiwiaW50ZXJmYWNlIElDb25kaXRpb25JbmRpY2VzIHtcbiAgICBba2V5OiBzdHJpbmddOiAobnVtYmVyW10gfCBudW1iZXIgfCBzdHJpbmcpO1xuICAgIFtrZXk6IG51bWJlcl06IHN0cmluZyB8IG51bWJlciB8IG51bWJlcltdO1xufVxuZXhwb3J0IGRlZmF1bHQgSUNvbmRpdGlvbkluZGljZXM7IiwiaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5cbmludGVyZmFjZSBJTW9kaWZpZXJEZWZpbml0aW9uIHtcbiAgICBpZGVudGlmaWVyczogUmVnRXhwW107XG4gICAgcnVsZTogKHBhc3M6IGJvb2xlYW4sIHZhcmlhYmxlOiBzdHJpbmcsIGNvbXBhcmF0aXZlOiBzdHJpbmcgfCBzdHJpbmdbXSwgdmFyaWFibGVzOiBJVmFyaWFibGVzKSA9PiBib29sZWFuO1xufVxuZXhwb3J0IGRlZmF1bHQgSU1vZGlmaWVyRGVmaW5pdGlvbjsiLCJpbXBvcnQgSU1vZGlmaWVyRGVmaW5pdGlvbiBmcm9tICcuL0lNb2RpZmllckRlZmluaXRpb24nO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vZGlmaWVyIHtcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgZGVmaW5pdGlvbjpJTW9kaWZpZXJEZWZpbml0aW9uKXtcbiAgICAgICAgaWYoIWRlZmluaXRpb24pIHRocm93ICdBdHRlbXB0ZWQgdG8gaW5zdGF0aWF0ZSBtb2RpZmllciB3aXRob3V0IGEgZGVmaW5pdGlvbic7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBtYXRjaGVzKHRleHQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgaWRlbnRpZmllcjtcbiAgICAgICAgZm9yKGlkZW50aWZpZXIgb2YgdGhpcy5kZWZpbml0aW9uLmlkZW50aWZpZXJzKXtcbiAgICAgICAgICAgIGlmKGlkZW50aWZpZXIudGVzdCh0ZXh0KSkgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn0iLCJpbXBvcnQge1J1bm5lcn0gZnJvbSAnLi4vUnVubmVycyc7XG5cbmludGVyZmFjZSBJUGFyc2VyRGVmaW5pdGlvbiB7XG4gICAgcnVubmVyczogUnVubmVyW11cbn1cbmV4cG9ydCBkZWZhdWx0IElQYXJzZXJEZWZpbml0aW9uOyIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9FeHRlbnNpb25zLnRzXCIgLz5cbmltcG9ydCBJUGFyc2VyRGVmaW5pdGlvbiBmcm9tICcuL0lQYXJzZXJEZWZpbml0aW9uJztcbmltcG9ydCB7UnVubmVyLCBBY3Rpb25SdW5uZXJ9IGZyb20gJy4uL1J1bm5lcnMnO1xuaW1wb3J0IENvbW1hbmQgZnJvbSAnLi4vQ29tbWFuZCc7XG5pbXBvcnQgU2NvcGUgZnJvbSAnLi4vU2NvcGUnO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5BcnJheS5wcm90b3R5cGUubGFzdCA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiB0aGlzW3RoaXMubGVuZ3RoLTFdO1xufVxuLyoqXG4gKiBUaGUgU1FpZ2dMIHBhcnNlclxuICogQG1vZHVsZSBQYXJzZXJcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtzdHJpbmd9IHNxbCAgICAgICAgICAgICAgLSBUaGUgU1FpZ2dMIHF1ZXJ5IHRvIHJ1biB0aGUgcGFyc2VyIGFnYWluc3RcbiAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzICAgIC0gQW55IHZhcmlhYmxlcyBwYXNzZWQgdG8gdGhlIFNRaWdnTCBwYXJzZXJcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBzcWwgICAgICAgICAgIC0gVGhlIFNRaWdnTCBxdWVyeSB0byBydW4gdGhlIHBhcnNlciBhZ2FpbnN0XG4gKiBAcHJvcGVydHkge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAtIEFueSB2YXJpYWJsZXMgcGFzc2VkIHRvIHRoZSBTUWlnZ0wgcGFyc2VyXG4gKiBAcHJvcGVydHkge0NvbW1hbmRbXX0gY29tbWFuZHMgICAtIEFycmF5IG9mIGNvbW1hbmRzIGZvdW5kIGluIHRoZSBTUWlnZ0wgcXVlcnlcbiAqIEBwcm9wZXJ0eSB7Q29tbWFuZFtdfSBzdGFjayAgICAgIC0gQ29tbWFuZCBzdGFjayBmb3Igc3RvcmluZyBjdXJyZW50IHBvc2l0aW9uIGluIHRoZSBwYXJzaW5nIHByb2Nlc3NcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBlcnJvciAgICAgICAgIC0gRXJyb3Igc3RyaW5nIGlmIGFueSBlcnJvcnMgYXJlIGZvdW5kIGluIHRoZSBwYXJzaW5nIHByb2Nlc3NcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGFyc2VyIHtcbiAgICBwdWJsaWMgcmVnZXg6IFJlZ0V4cDtcblx0cHVibGljIGNvbW1hbmRzOiBDb21tYW5kW10gPSBbXTtcblx0cHVibGljIHN0YWNrOiBDb21tYW5kW10gPSBbXTtcbiAgICBwdWJsaWMgZXJyb3I6IHN0cmluZ1tdID0gW107XG4gICAgcHVibGljIHNxbDogc3RyaW5nO1xuXHQvLyBjb25zdHJ1Y3RvcihwdWJsaWMgc3FsOiBzdHJpbmcsIHB1YmxpYyB2YXJpYWJsZXM6IElWYXJpYWJsZXMpe1xuXHRcdC8vIHRoaXMuY29tbWFuZHMgPSB0aGlzLmV4dHJhY3Qoc3FsLCB2YXJpYWJsZXMpO1xuXHRcdC8vIHRoaXMudmFyaWFibGVzID0gdmFyaWFibGVzO1xuXHQvLyB9XG4gICAgY29uc3RydWN0b3IocHVibGljIGRlZmluaXRpb246IElQYXJzZXJEZWZpbml0aW9uKXtcbiAgICAgICAgaWYoIWRlZmluaXRpb24pIHRocm93ICdBdHRlbXB0ZWQgdG8gaW5zdGF0aWF0ZSBwYXJzZXIgd2l0aG91dCBhIGRlZmluaXRpb24nO1xuICAgICAgICB0aGlzLnJlZ2V4ID0gbmV3IFJlZ0V4cChgKD86JHt0aGlzLmRlZmluaXRpb24ucnVubmVycy5tYXAoeCA9PiB4LmRlZmluaXRpb24ucmVnZXguc291cmNlKS5qb2luKCcpfCgnKX0pYCwgJ2dtJyk7XG4gICAgfVxuXHQvKipcbiAgICAgKiBFeHRyYWN0IGFueSBjb21tYW5kcyBvdXQgb2YgdGhlIFNRaWdnTCBxdWVyeSBhbmQgZGV0ZXJtaW5lIHRoZWlyIG9yZGVyLCBuZXN0aW5nLCBhbmQgdHlwZVxuICAgICAqIEBtZW1iZXJvZiBQYXJzZXJcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzcWwgICAgICAgICAgICAgIC0gU1FpZ2dMIHF1ZXJ5IHRvIGV4dHJhY3QgY29tbWFuZHMgZnJvbVxuICAgICAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzICAgIC0gQW55IGdsb2JhbCB2YXJpYWJsZXMgcGFzc2VkIGluIHRvIFNRaWdnTFxuICAgICAqIEByZXR1cm5zIHtDb21tYW5kW119ICAgICAgICAgICAgIC0gQXJyYXkgb2YgZnVsbHkgcGFyc2VkIGNvbW1hbmRzLCByZWFkeSBmb3IgZXhlY3V0aW9uXG4gICAgICovXG5cdHB1YmxpYyBwYXJzZShzcWw6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzKXtcblx0ICAgIHRoaXMuY29tbWFuZHMgPSBbXTtcbiAgICAgICAgdGhpcy5zdGFjayA9IFtdO1xuICAgICAgICB0aGlzLnNxbCA9IHNxbDtcbiAgICAgICAgbGV0IG1hdGNoO1xuXHRcdC8vIENvbW1hbmQucmVnZXgubGFzdEluZGV4ID0gMDtcblx0XHR3aGlsZSgobWF0Y2ggPSB0aGlzLnJlZ2V4LmV4ZWMoc3FsKSkgIT0gbnVsbCl7XG4gICAgICAgICAgICBsZXQgZm91bmQ6IENvbW1hbmQsIHJ1bm5lcjogUnVubmVyO1xuICAgICAgICAgICAgZm9yKHJ1bm5lciBvZiB0aGlzLmRlZmluaXRpb24ucnVubmVycyl7XG4gICAgICAgICAgICAgICAgaWYocnVubmVyLm1hdGNoZXMobWF0Y2hbMF0pKXtcbiAgICAgICAgICAgICAgICAgICAgZm91bmQgPSBuZXcgQ29tbWFuZChtYXRjaC5pbmRleCwgbWF0Y2guaW5wdXQubGVuZ3RoLCBtYXRjaFsxXSwgbWF0Y2hbMl0sIG5ldyBTY29wZSgpLCBydW5uZXIpO1xuICAgICAgICAgICAgICAgICAgICBydW5uZXIucGFyc2UoZm91bmQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblx0XHRcdGlmKHRoaXMuc3RhY2subGVuZ3RoID4gMCAmJiB0aGlzLnN0YWNrLmxhc3QoKS5hY3Rpb24uZGVmaW5pdGlvbi5kZXBlbmRlbnRzLmNvbnRhaW5zKGZvdW5kLmFjdGlvbikpe1xuICAgICAgICAgICAgICAgIC8vIGZvdW5kLmFjdGlvbi5zdXBwb3J0ZXIgPSBzdGFjay5sYXN0KCk7XG5cdFx0XHRcdHRoaXMuc3RhY2subGFzdCgpLmRlcGVuZGVudHMucHVzaChmb3VuZCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmICh0aGlzLnN0YWNrLmxlbmd0aCA+IDAgJiYgIXRoaXMuc3RhY2subGFzdCgpLmFjdGlvbi5kZWZpbml0aW9uLnRlcm1pbmF0b3IpIHtcblx0XHRcdFx0dGhpcy5zdGFjay5wdXNoKGZvdW5kKTtcblx0XHRcdFx0dGhpcy5zdGFjay5sYXN0KCkuc2NvcGUuY29tbWFuZHMucHVzaChmb3VuZCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0aWYodGhpcy5zdGFjay5sZW5ndGggPiAwICYmIHRoaXMuc3RhY2subGFzdCgpLmFjdGlvbi5kZWZpbml0aW9uLnRlcm1pbmF0b3IpIHRoaXMuc3RhY2sucG9wKCk7XG5cdFx0XHRcdHRoaXMuc3RhY2sucHVzaChmb3VuZCk7XG5cdFx0XHRcdHRoaXMuY29tbWFuZHMucHVzaChmb3VuZCk7XG5cdFx0XHR9XG4gICAgICAgICAgICAvLyBsZXQgZXJyb3IgPSBmb3VuZC5hY3Rpb24udmFsaWRhdGUoKTtcbiAgICAgICAgICAgIC8vIGlmKGVycm9yKSByZXR1cm4gW107XG5cdFx0fVxuXHRcdC8vIHJldHVybiBjb21tYW5kcztcblx0fVxuXHQvKipcbiAgICAgKiBSdW4gdGhlIGNvbW1hbmRzIGFnYWluc3QgdGhlIHN0cmluZyBhbmQgb3V0cHV0IHRoZSBlbmQgcmVzdWx0XG4gICAgICogQG1lbWJlcm9mIFBhcnNlclxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHJldHVybnMge3N0cmluZ30gVGhlIGVuZCByZXN1bHQgb2YgcnVubmluZyBhbGwgY29tbWFuZHMgYWdhaW5zdCB0aGUgU1FpZ2dMIHF1ZXJ5XG4gICAgICovXG5cdHB1YmxpYyBwZXJmb3JtKCk6IHN0cmluZyB7XG5cdFx0dmFyIHF1ZXJ5ID0gJycsIGluZGV4ID0gMDtcbiAgICAgICAgaWYodGhpcy5jb21tYW5kcy5sZW5ndGggPT09IDApIHJldHVybiB0aGlzLnNxbDtcblx0XHRmb3IodmFyIGNvbW1hbmQgb2YgdGhpcy5jb21tYW5kcyl7XG5cdFx0XHRxdWVyeSArPSB0aGlzLnNxbC5zbGljZShpbmRleCwgY29tbWFuZC5pbmRleCAtMSk7XG5cdFx0XHRxdWVyeSArPSBjb21tYW5kLnBlcmZvcm0oY29tbWFuZCkucmVzdWx0LnRleHQ7XG5cdFx0XHRpbmRleCArPSBjb21tYW5kLmxlbmd0aDtcblx0XHR9XG5cdFx0cmV0dXJuIHF1ZXJ5OyAvL1RPRE9cblx0fVxufSIsImltcG9ydCB7TW9kaWZpZXJ9IGZyb20gJy4uL01vZGlmaWVycyc7XG5pbnRlcmZhY2UgSVBsYWNlaG9sZGVyIHtcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgbG9jYXRvcjogUmVnRXhwO1xuICAgIHJlcGxhY2VtZW50OiAoaXRlbT86TW9kaWZpZXJbXSkgPT4gc3RyaW5nO1xufVxuZXhwb3J0IGRlZmF1bHQgSVBsYWNlaG9sZGVyOyIsImltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuXG5pbnRlcmZhY2UgSVJlcGxhY2VyRGVmaW5pdGlvbiB7XG4gICAgcmVnZXg6IFJlZ0V4cDtcbiAgICBydWxlOiAoZGVmaW5pdGlvbjogSVJlcGxhY2VyRGVmaW5pdGlvbiwgdGV4dDogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpID0+IHN0cmluZztcbn1cbmV4cG9ydCBkZWZhdWx0IElSZXBsYWNlckRlZmluaXRpb247IiwiaW1wb3J0IElSZXBsYWNlckRlZmluaXRpb24gZnJvbSAnLi9JUmVwbGFjZXJEZWZpbml0aW9uJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZXBsYWNlciB7ICAgIFxuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBkZWZpbml0aW9uOiBJUmVwbGFjZXJEZWZpbml0aW9uKXtcbiAgICAgICAgaWYoIWRlZmluaXRpb24pIHRocm93ICdBdHRlbXB0ZWQgdG8gaW5zdGF0aWF0ZSByZXBsYWNlciB3aXRob3V0IGEgZGVmaW5pdGlvbic7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyByZXBsYWNlKHRleHQ6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogc3RyaW5ne1xuICAgICAgICByZXR1cm4gdGhpcy5kZWZpbml0aW9uLnJ1bGUodGhpcy5kZWZpbml0aW9uLCB0ZXh0LCB2YXJpYWJsZXMpO1xuICAgIH1cbn0iLCJpbXBvcnQge0FjdGlvbn0gZnJvbSAnLi4vQWN0aW9ucyc7XG5pbXBvcnQge1JlcGxhY2VyfSBmcm9tICcuLi9SZXBsYWNlcnMnO1xuXG5pbnRlcmZhY2UgSVJ1bm5lckRlZmluaXRpb24ge1xuICAgIHJlZ2V4OiBSZWdFeHA7XG4gICAgYWN0aW9uczogQWN0aW9uW107XG4gICAgcmVwbGFjZXJzOiBSZXBsYWNlcltdO1xufVxuZXhwb3J0IGRlZmF1bHQgSVJ1bm5lckRlZmluaXRpb247IiwiaW1wb3J0IElSdW5uZXJEZWZpbml0aW9uIGZyb20gJy4vSVJ1bm5lckRlZmluaXRpb24nO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5pbXBvcnQgU2NvcGUgZnJvbSAnLi4vU2NvcGUnO1xuaW1wb3J0IHtBY3Rpb259IGZyb20gJy4uL0FjdGlvbnMnO1xuaW1wb3J0IENvbW1hbmQgZnJvbSAnLi4vQ29tbWFuZCc7XG5pbXBvcnQge1JlcGxhY2VyfSBmcm9tICcuLi9SZXBsYWNlcnMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSdW5uZXIge1xuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBkZWZpbml0aW9uOiBJUnVubmVyRGVmaW5pdGlvbil7XG4gICAgICAgIGlmKCFkZWZpbml0aW9uKSB0aHJvdyAnQXR0ZW1wdGVkIHRvIGluc3RhdGlhdGUgcnVubmVyIHdpdGhvdXQgYSBkZWZpbml0aW9uJztcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHBhcnNlKGNvbW1hbmQ6IENvbW1hbmQpIHtcbiAgICAgICAgbGV0IGFjdGlvbjogQWN0aW9uO1xuICAgICAgICBmb3IoYWN0aW9uIG9mIHRoaXMuZGVmaW5pdGlvbi5hY3Rpb25zKXtcbiAgICAgICAgICAgIGlmKGFjdGlvbi5tYXRjaGVzKGNvbW1hbmQuc3RhdGVtZW50KSkge1xuICAgICAgICAgICAgICAgIGNvbW1hbmQuYWN0aW9uID0gYWN0aW9uO1xuICAgICAgICAgICAgICAgIGNvbW1hbmQuYWN0aW9uLnBhcnNlKGNvbW1hbmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBwZXJmb3JtKGNvbW1hbmQ6IENvbW1hbmQsIHByZXY/OiBDb21tYW5kKTogQ29tbWFuZCB7XG4gICAgICAgIGNvbW1hbmQucmVzdWx0ID0gY29tbWFuZC5hY3Rpb24ucGVyZm9ybShjb21tYW5kLCBwcmV2KS5yZXN1bHQ7XG4gICAgICAgIC8vIGNvbW1hbmQucmVzdWx0LmRlcGVuZGVudCA9IGNvbW1hbmQuc2NvcGUucGVyZm9ybShjb21tYW5kKS5yZXN1bHQ7XG4gICAgICAgIGxldCByZXBsYWNlcjogUmVwbGFjZXI7XG4gICAgICAgIGZvcihyZXBsYWNlciBvZiB0aGlzLmRlZmluaXRpb24ucmVwbGFjZXJzKXtcbiAgICAgICAgICAgIGNvbW1hbmQucmVwbGFjZShyZXBsYWNlcik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbW1hbmQ7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBtYXRjaGVzKHRleHQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICB0aGlzLmRlZmluaXRpb24ucmVnZXgubGFzdEluZGV4ID0gMDtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVmaW5pdGlvbi5yZWdleC50ZXN0KHRleHQpO1xuICAgIH1cbn0iXX0=
