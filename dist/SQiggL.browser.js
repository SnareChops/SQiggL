(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ActionResult_1 = require('./actions/ActionResult');
var Action_1 = require('./actions/Action');
var Conditions_1 = require('./Conditions');
var EndIfDefinition = {
    regex: /^\s*endif\b/i,
    conditions: [],
    dependents: [],
    terminator: false,
    rule: function (command, condition, prev) { return new ActionResult_1.default(command.inner, true); }
};
exports.EndIf = new Action_1.default(EndIfDefinition);
var ElseDefinition = {
    regex: /^\s*else\b/i,
    conditions: [],
    dependents: [],
    terminator: false,
    rule: function (command, condition, prev) { return !prev.text ? new ActionResult_1.default(command.inner + command.scope.perform().result.text, true) : new ActionResult_1.default('', false); }
};
exports.Else = new Action_1.default(ElseDefinition);
var IfDefinition = {
    regex: /^\s*if\b/i,
    conditions: [Conditions_1.Equal, Conditions_1.GreaterThan, Conditions_1.LessThan, Conditions_1.IsNull, Conditions_1.AlphabeticallyGreaterThan, Conditions_1.AlphabeticallyLessThan, Conditions_1.LengthGreaterThan, Conditions_1.LengthLessThan, Conditions_1.IsNaN, Conditions_1.Between],
    dependents: [exports.Else, exports.EndIf],
    terminator: false,
    rule: function (command, condition) { return condition.perform() ? new ActionResult_1.default(command.inner + command.scope.perform().result.text, true) : new ActionResult_1.default(command.terminate(), false); }
};
exports.If = new Action_1.default(IfDefinition);
var ActionResult_2 = require('./actions/ActionResult');
exports.ActionResult = ActionResult_2.default;
var Action_2 = require('./actions/Action');
exports.Action = Action_2.default;

},{"./Conditions":3,"./actions/Action":15,"./actions/ActionResult":16}],2:[function(require,module,exports){
var Command = (function () {
    function Command(index, length, statement, inner, scope, runner) {
        this.index = index;
        this.length = length;
        this.statement = statement;
        this.inner = inner;
        this.scope = scope;
        this.runner = runner;
        this.dependents = [];
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

},{"./Modifiers":8,"./conditions/Condition":19}],4:[function(require,module,exports){
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

},{"./modifiers/Modifier":24}],9:[function(require,module,exports){
var Parser_1 = require('./parsers/Parser');
var Runners_1 = require('./Runners');
var SQiggLParserDefinition = {
    runners: [Runners_1.ActionRunner]
};
exports.SQiggLParser = new Parser_1.default(SQiggLParserDefinition);

},{"./Runners":12,"./parsers/Parser":26}],10:[function(require,module,exports){
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
        replacement: function (item) { return ("((?:" + item.map(function (modifier) { return modifier.identifiers.map(function (identifier) { return identifier.source; }).join('|'); }).join('|') + "|\\s*))"); }
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

},{"./replacers/Replacer":29}],12:[function(require,module,exports){
var Runner_1 = require('./runners/Runner');
var Actions_1 = require('./Actions');
var Replacers_1 = require('./Replacers');
var ActionRunnerDefinition = {
    regex: /{{%(.*?)%}}([\s\S]*?)?(?=(?:{{%|$))/gm,
    actions: [Actions_1.If, Actions_1.Else, Actions_1.EndIf],
    replacers: [Replacers_1.Variable]
};
exports.ActionRunner = new Runner_1.default(ActionRunnerDefinition);
var RunnerResult_1 = require('./runners/RunnerResult');
exports.RunnerResult = RunnerResult_1.default;
var Runner_2 = require('./runners/Runner');
exports.Runner = Runner_2.default;

},{"./Actions":1,"./Replacers":11,"./runners/Runner":31,"./runners/RunnerResult":32}],13:[function(require,module,exports){
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
var Action = (function () {
    function Action(definition) {
        this.definition = definition;
        if (!definition)
            throw 'Attempted to instatiate action without a definition';
    }
    Action.prototype.matches = function (statement) {
        return this.definition.regex.test(statement);
    };
    Action.prototype.parse = function (command, statement, inner, variables) {
        this.command = command;
        this.inner = inner;
        var condition;
        for (var _i = 0, _a = this.definition.conditions; _i < _a.length; _i++) {
            condition = _a[_i];
            if (condition.matches(statement)) {
                this.condition = condition;
                this.condition.parse(statement, variables);
                return true;
            }
        }
        return false;
    };
    Action.prototype.perform = function (prev) {
        return this.definition.rule(this.command, this.condition, prev);
    };
    return Action;
})();
exports.default = Action;

},{}],16:[function(require,module,exports){
var ActionResult = (function () {
    function ActionResult(text, passed) {
        this.text = text;
        this.passed = passed;
    }
    return ActionResult;
})();
exports.default = ActionResult;

},{}],17:[function(require,module,exports){

},{}],18:[function(require,module,exports){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Runners_1 = require('../Runners');
var CommandResult = (function (_super) {
    __extends(CommandResult, _super);
    function CommandResult() {
        _super.apply(this, arguments);
    }
    return CommandResult;
})(Runners_1.RunnerResult);
exports.default = CommandResult;

},{"../Runners":12}],19:[function(require,module,exports){
var Placeholders_1 = require('../Placeholders');
var ConditionResult_1 = require('./ConditionResult');
var Modifiers_1 = require('../Modifiers');
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
    Condition.prototype.parse = function (statement, variables) {
        var result = new ConditionResult_1.default(), match = statement.match(this.regex), i, modifier;
        result.statement = match[0];
        for (i = 1; i < match.length; i++) {
            if (this.items[i][0] instanceof Modifiers_1.Modifier) {
                for (var _i = 0, _a = this.items[i]; _i < _a.length; _i++) {
                    modifier = _a[_i];
                    if (modifier.matches(match[i]))
                        result.set(this.indicies[i], modifier);
                }
            }
            else
                result.set(this.indicies[i], match[i]);
        }
        result.variables = variables;
        return result;
    };
    Condition.prototype.perform = function (result) {
        result.pass = this.rule(result.variable, result.comparative, result.variables);
        var mod;
        for (var _i = 0, _a = result.modifier; _i < _a.length; _i++) {
            mod = _a[_i];
            result.pass = mod.rule(result.pass, result.variable, result.comparative, result.variables);
        }
        return result.pass;
    };
    Condition.prototype.matches = function (statement) {
        return this.regex.test(statement);
    };
    return Condition;
})();
exports.default = Condition;

},{"../Extensions":5,"../Modifiers":8,"../Placeholders":10,"./ConditionResult":20}],20:[function(require,module,exports){
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

},{}],21:[function(require,module,exports){

},{}],22:[function(require,module,exports){

},{}],23:[function(require,module,exports){

},{}],24:[function(require,module,exports){
var Modifier = (function () {
    function Modifier(definition) {
        this.definition = definition;
        if (!definition)
            throw 'Attempted to instatiate modifier without a definition';
        this.identifiers = definition.identifiers;
        this.rule = definition.rule;
    }
    Modifier.prototype.matches = function (text) {
        var identifier;
        for (var _i = 0, _a = this.identifiers; _i < _a.length; _i++) {
            identifier = _a[_i];
            if (identifier.test(text))
                return true;
        }
        return false;
    };
    return Modifier;
})();
exports.default = Modifier;

},{}],25:[function(require,module,exports){

},{}],26:[function(require,module,exports){
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
        this.regex = new RegExp("(?:" + this.definition.runners.map(function (x) { return x.definition.regex.source; }).join(')|(') + ")");
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

},{"../Command":2,"../Scope":14}],27:[function(require,module,exports){

},{}],28:[function(require,module,exports){

},{}],29:[function(require,module,exports){
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

},{}],30:[function(require,module,exports){

},{}],31:[function(require,module,exports){
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
                return command;
            }
        }
        return null;
    };
    Runner.prototype.perform = function (command, prev) {
        command.result = command.action.perform(prev.result);
        command.result.dependent = command.scope.perform(command).result;
        var replacer;
        for (var _i = 0, _a = this.definition.replacers; _i < _a.length; _i++) {
            replacer = _a[_i];
            command.replace(replacer);
        }
        return command;
    };
    Runner.prototype.matches = function (statement) {
        return this.definition.regex.test(statement);
    };
    return Runner;
})();
exports.default = Runner;

},{}],32:[function(require,module,exports){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Actions_1 = require('../Actions');
var RunnerResult = (function (_super) {
    __extends(RunnerResult, _super);
    function RunnerResult() {
        _super.apply(this, arguments);
    }
    return RunnerResult;
})(Actions_1.ActionResult);
exports.default = RunnerResult;

},{"../Actions":1}]},{},[1,15,16,17,2,18,3,19,20,21,22,4,5,6,7,8,23,24,9,25,26,10,27,11,28,29,12,30,31,32,14,13])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQWN0aW9ucy50cyIsInNyYy9Db21tYW5kLnRzIiwic3JjL0NvbmRpdGlvbnMudHMiLCJzcmMvRXJyb3JzLnRzIiwic3JjL0V4dGVuc2lvbnMudHMiLCJzcmMvSVZhcmlhYmxlcy50cyIsInNyYy9NYWluLnRzIiwic3JjL01vZGlmaWVycy50cyIsInNyYy9QYXJzZXJzLnRzIiwic3JjL1BsYWNlaG9sZGVycy50cyIsInNyYy9SZXBsYWNlcnMudHMiLCJzcmMvUnVubmVycy50cyIsInNyYy9TUWlnZ0wudHMiLCJzcmMvU2NvcGUudHMiLCJzcmMvYWN0aW9ucy9BY3Rpb24udHMiLCJzcmMvYWN0aW9ucy9BY3Rpb25SZXN1bHQudHMiLCJzcmMvYWN0aW9ucy9JQWN0aW9uRGVmaW5pdGlvbi50cyIsInNyYy9jb21tYW5kcy9Db21tYW5kUmVzdWx0LnRzIiwic3JjL2NvbmRpdGlvbnMvQ29uZGl0aW9uLnRzIiwic3JjL2NvbmRpdGlvbnMvQ29uZGl0aW9uUmVzdWx0LnRzIiwic3JjL2NvbmRpdGlvbnMvSUNvbmRpdGlvbkRlZmluaXRpb24udHMiLCJzcmMvY29uZGl0aW9ucy9JQ29uZGl0aW9uSW5kaWNlcy50cyIsInNyYy9tb2RpZmllcnMvSU1vZGlmaWVyRGVmaW5pdGlvbi50cyIsInNyYy9tb2RpZmllcnMvTW9kaWZpZXIudHMiLCJzcmMvcGFyc2Vycy9JUGFyc2VyRGVmaW5pdGlvbi50cyIsInNyYy9wYXJzZXJzL1BhcnNlci50cyIsInNyYy9wbGFjZWhvbGRlcnMvSVBsYWNlaG9sZGVyLnRzIiwic3JjL3JlcGxhY2Vycy9JUmVwbGFjZXJEZWZpbml0aW9uLnRzIiwic3JjL3JlcGxhY2Vycy9SZXBsYWNlci50cyIsInNyYy9ydW5uZXJzL0lSdW5uZXJEZWZpbml0aW9uLnRzIiwic3JjL3J1bm5lcnMvUnVubmVyLnRzIiwic3JjL3J1bm5l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LE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDakQsQ0FBQztJQUNMLGFBQUM7QUFBRCxDQTdCQSxBQTZCQyxJQUFBO0FBN0JELHdCQTZCQyxDQUFBOzs7Ozs7Ozs7QUNwQ0Qsd0JBQTJCLFlBQVksQ0FBQyxDQUFBO0FBRXhDO0lBQTBDLGdDQUFZO0lBQXREO1FBQTBDLDhCQUFZO0lBQUUsQ0FBQztJQUFELG1CQUFDO0FBQUQsQ0FBeEQsQUFBeUQsRUFBZixzQkFBWSxFQUFHO0FBQXpELDhCQUF5RCxDQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBJQWN0aW9uRGVmaW5pdGlvbiBmcm9tICcuL2FjdGlvbnMvSUFjdGlvbkRlZmluaXRpb24nO1xuaW1wb3J0IEFjdGlvblJlc3VsdCBmcm9tICcuL2FjdGlvbnMvQWN0aW9uUmVzdWx0JztcbmltcG9ydCBBY3Rpb24gZnJvbSAnLi9hY3Rpb25zL0FjdGlvbic7XG5pbXBvcnQgQ29tbWFuZCBmcm9tICcuL0NvbW1hbmQnO1xuaW1wb3J0IHtDb25kaXRpb24sIEVxdWFsLCBHcmVhdGVyVGhhbiwgTGVzc1RoYW4sIElzTnVsbCwgQWxwaGFiZXRpY2FsbHlHcmVhdGVyVGhhbiwgQWxwaGFiZXRpY2FsbHlMZXNzVGhhbiwgTGVuZ3RoR3JlYXRlclRoYW4sIExlbmd0aExlc3NUaGFuLCBJc05hTiwgQmV0d2Vlbn0gZnJvbSAnLi9Db25kaXRpb25zJztcbmltcG9ydCBTY29wZSBmcm9tICcuL1Njb3BlJztcblxubGV0IEVuZElmRGVmaW5pdGlvbjogSUFjdGlvbkRlZmluaXRpb24gPSB7XG4gICAgcmVnZXg6IC9eXFxzKmVuZGlmXFxiL2ksXG4gICAgY29uZGl0aW9uczogW10sXG4gICAgZGVwZW5kZW50czogW10sXG4gICAgdGVybWluYXRvcjogZmFsc2UsXG4gICAgcnVsZTogKGNvbW1hbmQ6IENvbW1hbmQsIGNvbmRpdGlvbjogQ29uZGl0aW9uLCBwcmV2OiBBY3Rpb25SZXN1bHQpOiBBY3Rpb25SZXN1bHQgPT4geyByZXR1cm4gbmV3IEFjdGlvblJlc3VsdChjb21tYW5kLmlubmVyLCB0cnVlKX1cbn07XG5leHBvcnQgbGV0IEVuZElmID0gbmV3IEFjdGlvbihFbmRJZkRlZmluaXRpb24pO1xuXG5sZXQgRWxzZURlZmluaXRpb246IElBY3Rpb25EZWZpbml0aW9uID0ge1xuICAgIHJlZ2V4OiAvXlxccyplbHNlXFxiL2ksXG4gICAgY29uZGl0aW9uczogW10sXG4gICAgZGVwZW5kZW50czogW10sXG4gICAgdGVybWluYXRvcjogZmFsc2UsXG4gICAgcnVsZTogKGNvbW1hbmQ6IENvbW1hbmQsIGNvbmRpdGlvbjogQ29uZGl0aW9uLCBwcmV2OiBBY3Rpb25SZXN1bHQpOiBBY3Rpb25SZXN1bHQgPT4gIXByZXYudGV4dCA/IG5ldyBBY3Rpb25SZXN1bHQoY29tbWFuZC5pbm5lciArIGNvbW1hbmQuc2NvcGUucGVyZm9ybSgpLnJlc3VsdC50ZXh0LCB0cnVlKSA6IG5ldyBBY3Rpb25SZXN1bHQoJycsIGZhbHNlKVxufTtcbmV4cG9ydCBsZXQgRWxzZSA9IG5ldyBBY3Rpb24oRWxzZURlZmluaXRpb24pO1xuXG5sZXQgSWZEZWZpbml0aW9uOiBJQWN0aW9uRGVmaW5pdGlvbiA9IHtcbiAgICByZWdleDogL15cXHMqaWZcXGIvaSxcbiAgICBjb25kaXRpb25zOiBbRXF1YWwsIEdyZWF0ZXJUaGFuLCBMZXNzVGhhbiwgSXNOdWxsLCBBbHBoYWJldGljYWxseUdyZWF0ZXJUaGFuLCBBbHBoYWJldGljYWxseUxlc3NUaGFuLCBMZW5ndGhHcmVhdGVyVGhhbiwgTGVuZ3RoTGVzc1RoYW4sIElzTmFOLCBCZXR3ZWVuXSxcbiAgICBkZXBlbmRlbnRzOiBbRWxzZSwgRW5kSWZdLFxuICAgIHRlcm1pbmF0b3I6IGZhbHNlLFxuICAgIHJ1bGU6IChjb21tYW5kOiBDb21tYW5kLCBjb25kaXRpb246IENvbmRpdGlvbik6IEFjdGlvblJlc3VsdCA9PiBjb25kaXRpb24ucGVyZm9ybSgpID8gbmV3IEFjdGlvblJlc3VsdChjb21tYW5kLmlubmVyICsgY29tbWFuZC5zY29wZS5wZXJmb3JtKCkucmVzdWx0LnRleHQsIHRydWUpIDogbmV3IEFjdGlvblJlc3VsdChjb21tYW5kLnRlcm1pbmF0ZSgpLCBmYWxzZSkgXG59O1xuZXhwb3J0IGxldCBJZiA9IG5ldyBBY3Rpb24oSWZEZWZpbml0aW9uKTtcblxuZXhwb3J0IHtkZWZhdWx0IGFzIElBY3Rpb25EZWZpbml0aW9ufSBmcm9tICcuL2FjdGlvbnMvSUFjdGlvbkRlZmluaXRpb24nO1xuZXhwb3J0IHtkZWZhdWx0IGFzIEFjdGlvblJlc3VsdH0gZnJvbSAnLi9hY3Rpb25zL0FjdGlvblJlc3VsdCc7XG5leHBvcnQge2RlZmF1bHQgYXMgQWN0aW9ufSBmcm9tICcuL2FjdGlvbnMvQWN0aW9uJzsiLCJpbXBvcnQge1J1bm5lcn0gZnJvbSAnLi9SdW5uZXJzJztcbmltcG9ydCB7QWN0aW9ufSBmcm9tICcuL0FjdGlvbnMnO1xuaW1wb3J0IHtSZXBsYWNlcn0gZnJvbSAnLi9SZXBsYWNlcnMnO1xuaW1wb3J0IENvbW1hbmRSZXN1bHQgZnJvbSAnLi9jb21tYW5kcy9Db21tYW5kUmVzdWx0JztcbmltcG9ydCBTY29wZSBmcm9tICcuL1Njb3BlJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tbWFuZCB7XG4gICAgcHVibGljIGRlcGVuZGVudHM6IENvbW1hbmRbXSA9IFtdO1xuICAgIHB1YmxpYyBhY3Rpb246IEFjdGlvbjtcbiAgICBwdWJsaWMgcmVzdWx0OiBDb21tYW5kUmVzdWx0O1xuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBpbmRleDogbnVtYmVyLCBwdWJsaWMgbGVuZ3RoOiBudW1iZXIsIHB1YmxpYyBzdGF0ZW1lbnQ6IHN0cmluZywgcHVibGljIGlubmVyOiBzdHJpbmcsIHB1YmxpYyBzY29wZTogU2NvcGUsIHByaXZhdGUgcnVubmVyOiBSdW5uZXIpe1xuICAgICAgICBsZXQgYWN0aW9uOiBBY3Rpb247XG4gICAgICAgIGZvcihhY3Rpb24gb2YgcnVubmVyLmRlZmluaXRpb24uYWN0aW9ucyl7XG4gICAgICAgICAgICBpZihhY3Rpb24ubWF0Y2hlcyhzdGF0ZW1lbnQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hY3Rpb24gPSBhY3Rpb247XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgcHVibGljIHBlcmZvcm0ocHJldj86IENvbW1hbmQpOiBDb21tYW5kIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucnVubmVyLnBlcmZvcm0odGhpcywgcHJldik7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyByZXBsYWNlKHJlcGxhY2VyOiBSZXBsYWNlcil7XG4gICAgICAgIHRoaXMucmVzdWx0LnRleHQgPSByZXBsYWNlci5yZXBsYWNlKHRoaXMucmVzdWx0LnRleHQsIHRoaXMuc2NvcGUudmFyaWFibGVzKTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHRlcm1pbmF0ZSgpOiBzdHJpbmd7XG4gICAgICAgIHJldHVybiB0aGlzLnNjb3BlLmNvbW1hbmRzLnNvbWUoY29tbWFuZCA9PiBjb21tYW5kLmFjdGlvbi5kZWZpbml0aW9uLnRlcm1pbmF0b3IpXG5cdFx0ICA/IHRoaXMuc2NvcGUuY29tbWFuZHMuZmlsdGVyKGNvbW1hbmQgPT4gY29tbWFuZC5hY3Rpb24uZGVmaW5pdGlvbi50ZXJtaW5hdG9yKVsxXS5wZXJmb3JtKCkucmVzdWx0LnRleHRcblx0XHQgIDogJyc7XG4gICAgfVxufSIsImltcG9ydCBJQ29uZGl0aW9uRGVmaW5pdGlvbiBmcm9tICcuL2NvbmRpdGlvbnMvSUNvbmRpdGlvbkRlZmluaXRpb24nO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi9JVmFyaWFibGVzJztcbmltcG9ydCBDb25kaXRpb24gZnJvbSAnLi9jb25kaXRpb25zL0NvbmRpdGlvbic7XG5pbXBvcnQge05vdCwgT3JFcXVhbH0gZnJvbSAnLi9Nb2RpZmllcnMnO1xubGV0IEVxdWFsRGVmaW5pdGlvbjogSUNvbmRpdGlvbkRlZmluaXRpb24gPSB7XG4gICAgdGVtcGxhdGU6ICcodikgKG0pPShtKSAoYyknLFxuICAgIGl0ZW1zOiBbJ3ZhcmlhYmxlJywgW05vdCwgT3JFcXVhbF0sIFtPckVxdWFsXSwgJ2NvbXBhcmF0aXZlJ10sXG4gICAgcnVsZTogKHZhcmlhYmxlOiBzdHJpbmcsIGNvbXBhcmF0aXZlOiBzdHJpbmcsIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IGJvb2xlYW4gPT4gdmFyaWFibGVzW3ZhcmlhYmxlXSA9PT0gY29tcGFyYXRpdmVcbn1cbmV4cG9ydCBsZXQgRXF1YWwgPSBuZXcgQ29uZGl0aW9uKEVxdWFsRGVmaW5pdGlvbik7XG5cbmxldCBHcmVhdGVyVGhhbkRlZmluaXRpb246IElDb25kaXRpb25EZWZpbml0aW9uID0ge1xuICAgIHRlbXBsYXRlOiAnKHYpIChtKT4obSkgKGMpJyxcbiAgICBpdGVtczogWyd2YXJpYWJsZScsIFtOb3RdLCBbT3JFcXVhbF0sICdjb21wYXJhdGl2ZSddLFxuICAgIHJ1bGU6ICh2YXJpYWJsZTogc3RyaW5nLCBjb21wYXJhdGl2ZTogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBib29sZWFuID0+IHBhcnNlRmxvYXQodmFyaWFibGVzW3ZhcmlhYmxlXSkgPiBwYXJzZUZsb2F0KGNvbXBhcmF0aXZlKVxufVxuZXhwb3J0IGxldCBHcmVhdGVyVGhhbiA9IG5ldyBDb25kaXRpb24oR3JlYXRlclRoYW5EZWZpbml0aW9uKTtcblxubGV0IExlc3NUaGFuRGVmaW5pdGlvbjogSUNvbmRpdGlvbkRlZmluaXRpb24gPSB7XG4gICAgdGVtcGxhdGU6ICcodikgKG0pPChtKSAoYyknLFxuICAgIGl0ZW1zOiBbJ3ZhcmlhYmxlJywgW05vdF0sIFtPckVxdWFsXSwgJ2NvbXBhcmF0aXZlJ10sXG4gICAgcnVsZTogKHZhcmlhYmxlOiBzdHJpbmcsIGNvbXBhcmF0aXZlOiBzdHJpbmcsIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IGJvb2xlYW4gPT4gcGFyc2VGbG9hdCh2YXJpYWJsZXNbdmFyaWFibGVdKSA8IHBhcnNlRmxvYXQoY29tcGFyYXRpdmUpXG59XG5leHBvcnQgbGV0IExlc3NUaGFuID0gbmV3IENvbmRpdGlvbihMZXNzVGhhbkRlZmluaXRpb24pO1xuXG5sZXQgSXNOdWxsRGVmaW5pdGlvbjogSUNvbmRpdGlvbkRlZmluaXRpb24gPSB7XG4gICAgdGVtcGxhdGU6ICcodikgaXMgKG0pIG51bGwnLFxuICAgIGl0ZW1zOiBbJ3ZhcmlhYmxlJywgW05vdF1dLFxuICAgIHJ1bGU6ICh2YXJpYWJsZTogc3RyaW5nLCBjb21wYXJhdGl2ZTogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBib29sZWFuID0+IHZhcmlhYmxlc1t2YXJpYWJsZV0gPT0gbnVsbFxufVxuZXhwb3J0IGxldCBJc051bGwgPSBuZXcgQ29uZGl0aW9uKElzTnVsbERlZmluaXRpb24pO1xuXG5sZXQgQWxwaGFiZXRpY2FsbHlHcmVhdGVyVGhhbkRlZmluaXRpb246IElDb25kaXRpb25EZWZpbml0aW9uID0ge1xuICAgIHRlbXBsYXRlOiAnKHYpIChtKWFiYz4obSkgKGMpJyxcbiAgICBpdGVtczogWyd2YXJpYWJsZScsIFtOb3RdLCBbT3JFcXVhbF0sICdjb21wYXJhdGl2ZSddLFxuICAgIHJ1bGU6ICh2YXJpYWJsZTogc3RyaW5nLCBjb21wYXJhdGl2ZTogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBib29sZWFuID0+IFt2YXJpYWJsZXNbdmFyaWFibGVdLCB0aGlzLmNvbXBhcmF0aXZlXS5zb3J0KCkuaW5kZXhPZihjb21wYXJhdGl2ZSkgPiAwXG59XG5leHBvcnQgbGV0IEFscGhhYmV0aWNhbGx5R3JlYXRlclRoYW4gPSBuZXcgQ29uZGl0aW9uKEFscGhhYmV0aWNhbGx5R3JlYXRlclRoYW5EZWZpbml0aW9uKTtcblxubGV0IEFscGhhYmV0aWNhbGx5TGVzc1RoYW5EZWZpbml0aW9uOiBJQ29uZGl0aW9uRGVmaW5pdGlvbiA9IHtcbiAgICB0ZW1wbGF0ZTogJyh2KSAobSlhYmM8KG0pIChjKScsXG4gICAgaXRlbXM6IFsndmFyaWFibGUnLCBbTm90XSwgW09yRXF1YWxdLCAnY29tcGFyYXRpdmUnXSxcbiAgICBydWxlOiAodmFyaWFibGU6IHN0cmluZywgY29tcGFyYXRpdmU6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogYm9vbGVhbiA9PiBbdmFyaWFibGVzW3ZhcmlhYmxlXSwgY29tcGFyYXRpdmVdLnNvcnQoKS5pbmRleE9mKGNvbXBhcmF0aXZlKSA9PT0gMFxufVxuZXhwb3J0IGxldCBBbHBoYWJldGljYWxseUxlc3NUaGFuID0gbmV3IENvbmRpdGlvbihBbHBoYWJldGljYWxseUxlc3NUaGFuRGVmaW5pdGlvbik7XG5cbmxldCBMZW5ndGhHcmVhdGVyVGhhbkRlZmluaXRpb246IElDb25kaXRpb25EZWZpbml0aW9uID0ge1xuICAgIHRlbXBsYXRlOiAnKHYpIChtKWxlbj4obSkgKGMpJyxcbiAgICBpdGVtczogWyd2YXJpYWJsZScsIFtOb3RdLCBbT3JFcXVhbF0sICdjb21wYXJhdGl2ZSddLFxuICAgIHJ1bGU6ICh2YXJpYWJsZTogc3RyaW5nLCBjb21wYXJhdGl2ZTogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBib29sZWFuID0+IHZhcmlhYmxlc1t2YXJpYWJsZV0ubGVuZ3RoID4gcGFyc2VJbnQoY29tcGFyYXRpdmUpXG59XG5leHBvcnQgbGV0IExlbmd0aEdyZWF0ZXJUaGFuID0gbmV3IENvbmRpdGlvbihMZW5ndGhHcmVhdGVyVGhhbkRlZmluaXRpb24pO1xuXG5sZXQgTGVuZ3RoTGVzc1RoYW5EZWZpbml0aW9uOiBJQ29uZGl0aW9uRGVmaW5pdGlvbiA9IHtcbiAgICB0ZW1wbGF0ZTogJyh2KSAobSlsZW48KG0pIChjKScsXG4gICAgaXRlbXM6IFsndmFyaWFibGUnLCBbTm90XSwgW09yRXF1YWxdLCAnY29tcGFyYXRpdmUnXSxcbiAgICBydWxlOiAodmFyaWFibGU6IHN0cmluZywgY29tcGFyYXRpdmU6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogYm9vbGVhbiA9PiB2YXJpYWJsZXNbdmFyaWFibGVdLmxlbmd0aCA8IHBhcnNlSW50KGNvbXBhcmF0aXZlKVxufVxuZXhwb3J0IGxldCBMZW5ndGhMZXNzVGhhbiA9IG5ldyBDb25kaXRpb24oTGVuZ3RoTGVzc1RoYW5EZWZpbml0aW9uKTtcblxubGV0IElzTmFORGVmaW5pdGlvbjogSUNvbmRpdGlvbkRlZmluaXRpb24gPSB7XG4gICAgdGVtcGxhdGU6ICcodikgaXMgKG0pIE5hTicsXG4gICAgaXRlbXM6IFsndmFyaWFibGUnLCBbTm90XV0sXG4gICAgcnVsZTogKHZhcmlhYmxlOiBzdHJpbmcsIGNvbXBhcmF0aXZlOiBzdHJpbmcsIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IGJvb2xlYW4gPT4gaXNOYU4odmFyaWFibGVzW3ZhcmlhYmxlXSlcbn1cbmV4cG9ydCBsZXQgSXNOYU4gPSBuZXcgQ29uZGl0aW9uKElzTmFORGVmaW5pdGlvbik7XG5cbmxldCBCZXR3ZWVuRGVmaW5pdGlvbjogSUNvbmRpdGlvbkRlZmluaXRpb24gPSB7XG4gICAgdGVtcGxhdGU6ICcodikgKGMpPihtKTwoYyknLFxuICAgIGl0ZW1zOiBbJ3ZhcmlhYmxlJywgJ2NvbXBhcmF0aXZlJywgW05vdCwgT3JFcXVhbF0sICdjb21wYXJhdGl2ZSddLFxuICAgIHJ1bGU6ICh2YXJpYWJsZTogc3RyaW5nLCBjb21wYXJhdGl2ZTogc3RyaW5nW10sIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IGJvb2xlYW4gPT4gcGFyc2VGbG9hdChjb21wYXJhdGl2ZVswXSkgPiBwYXJzZUZsb2F0KHZhcmlhYmxlc1t2YXJpYWJsZV0pICYmIHBhcnNlRmxvYXQoY29tcGFyYXRpdmVbMV0pIDwgcGFyc2VGbG9hdCh2YXJpYWJsZXNbdmFyaWFibGVdKSBcbn1cbmV4cG9ydCBsZXQgQmV0d2VlbiA9IG5ldyBDb25kaXRpb24oQmV0d2VlbkRlZmluaXRpb24pO1xuXG5leHBvcnQge2RlZmF1bHQgYXMgQ29uZGl0aW9ufSBmcm9tICcuL2NvbmRpdGlvbnMvQ29uZGl0aW9uJztcbiIsIi8vIGltcG9ydCBJQWN0aW9uIGZyb20gJ2FjdGlvbnMvSUFjdGlvbic7XG4vLyAvKipcbi8vICAqIE1vZHVsZSBvZiBlcnJvciBjaGVja2Vyc1xuLy8gICogQG1vZHVsZSBFcnJvcnNcbi8vICAqIEBjbGFzc1xuLy8gICogQHN0YXRpY1xuLy8gICovXG4vLyBleHBvcnQgZGVmYXVsdCBjbGFzcyBFcnJvcnMge1xuLy8gICAgIC8qKlxuLy8gICAgICAqIEBtZW1iZXJvZiBFcnJvcnNcbi8vICAgICAgKiBAbWV0aG9kXG4vLyAgICAgICogQHN0YXRpY1xuLy8gICAgICAqIEBwYXJhbSB7SUFjdGlvbn0gYWN0aW9uICAgICAgLSBBY3Rpb24gdG8gY2hlY2sgZm9yIGFuIEluY29ycmVjdCBTdGF0ZW1lbnQgZXJyb3Jcbi8vICAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVtZW50ICAgIC0gU3RhdGVtZW50IHRvIGNoZWNrIGZvciBhIEluY29ycmVjdCBTdGF0ZW1lbnQgZXJyb3Jcbi8vICAgICAgKiBAcmV0dXJucyB7c3RyaW5nIHwgbnVsbH0gICAgIC0gVGhlIGVycm9yIG1lc3NhZ2UgaWYgYW55LCBvdGhlcndpc2UgbnVsbCBcbi8vICAgICAgKi9cbi8vICAgICBwdWJsaWMgc3RhdGljIEluY29ycmVjdFN0YXRlbWVudChhY3Rpb246IElBY3Rpb24sIHN0YXRlbWVudDogc3RyaW5nKTogc3RyaW5ne1xuLy8gICAgICAgICBjb25zdCBhY3Rpb25zOnN0cmluZyA9IGFjdGlvbi5jb21tYW5kLmFjdGlvbnMuZmlsdGVyKHggPT4geC5kZXBlbmRlbnRzLnNvbWUoeSA9PiBhY3Rpb24gaW5zdGFuY2VvZiB5KSkubWFwKHggPT4geC5uYW1lKS5qb2luKCcsICcpO1xuLy8gICAgICAgICBjb25zdCBlcnJvcjogc3RyaW5nID0gYEluY29ycmVjdCBzdGF0ZW1lbnQgZm91bmQgYXQgXCIke3N0YXRlbWVudH1cIi4gJHthY3Rpb24uY29uc3RydWN0b3JbJ25hbWUnXX0gbXVzdCBmb2xsb3cgJHthY3Rpb25zfWBcbi8vICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4vLyAgICAgICAgIHJldHVybiBlcnJvcjtcbi8vICAgICB9XG4vLyB9IiwiaW50ZXJmYWNlIEFycmF5PFQ+e1xuXHRsYXN0KCk6IFQ7XG4gICAgaXNGdWxsKCk6IGJvb2xlYW47XG4gICAgY29udGFpbnMoVCk6IGJvb2xlYW47XG59XG5BcnJheS5wcm90b3R5cGUubGFzdCA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiB0aGlzW3RoaXMubGVuZ3RoLTFdO1xufVxuXG5BcnJheS5wcm90b3R5cGUuaXNGdWxsID0gZnVuY3Rpb24oKXtcbiAgICBmb3IobGV0IGk9MDtpPHRoaXMubGVuZ3RoO2krKyl7XG4gICAgICAgIGlmKGkgPT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuQXJyYXkucHJvdG90eXBlLmNvbnRhaW5zID0gZnVuY3Rpb24oVCl7XG4gICAgcmV0dXJuIHRoaXMuc29tZSh4ID0+IHggPT09IFQpO1xufSIsImludGVyZmFjZSBJVmFyaWFibGVzIHtcblx0W2tleTogc3RyaW5nXTogYW55O1xufVxuZXhwb3J0IGRlZmF1bHQgSVZhcmlhYmxlczsiLCJpbXBvcnQge1NRaWdnTFBhcnNlcn0gZnJvbSAnLi9QYXJzZXJzJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4vSVZhcmlhYmxlcyc7XG4vKipcbiAqIFRoZSBzdGFydGluZyBwb2ludCBvZiB0aGUgZW50aXJlIFNRaWdnTCBwYXJzZXJcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IHNxbCAgICAgICAgICAgICAgLSBUaGUgU1FMIHF1ZXJ5IHRvIHJ1biBTUWlnZ0wgYWdhaW5zdFxuICogQHBhcmFtIHtJVmFyaWFibGVzP30gdmFyaWFibGVzICAgLSBPcHRpb25hbCBjb2xsZWN0aW9uIG9mIHZhcmlhYmxlcyBmb3IgeW91ciBTUWlnZ0wgcXVlcnlcbiAqIEByZXR1cm4ge3N0cmluZ30gICAgICAgICAgICAgICAgIC0gVGhlIGZ1bGx5IHBhcnNlZCBTUUwgcXVlcnlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlKHNxbDogc3RyaW5nLCB2YXJpYWJsZXM/OiBJVmFyaWFibGVzKTogc3RyaW5ne1xuXHRTUWlnZ0xQYXJzZXIucGFyc2Uoc3FsLCB2YXJpYWJsZXMpO1xuICAgIHJldHVybiBTUWlnZ0xQYXJzZXIucGVyZm9ybSgpO1xufSIsImltcG9ydCBJTW9kaWZpZXJEZWZpbml0aW9uIGZyb20gJy4vbW9kaWZpZXJzL0lNb2RpZmllckRlZmluaXRpb24nO1xuaW1wb3J0IE1vZGlmaWVyIGZyb20gJy4vbW9kaWZpZXJzL01vZGlmaWVyJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4vSVZhcmlhYmxlcyc7XG5cbmxldCBOb3REZWZpbml0aW9uOiBJTW9kaWZpZXJEZWZpbml0aW9uID0ge1xuICAgIGlkZW50aWZpZXJzOiBbLyEvaSwgLyg/OlxcYnxcXHMrKW5vdCg/OlxcYnxcXHMrKS9pXSxcbiAgICBydWxlOiAocGFzczogYm9vbGVhbiwgdmFyaWFibGU6IHN0cmluZywgY29tcGFyYXRpdmU6IHN0cmluZyB8IHN0cmluZ1tdLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBib29sZWFuID0+ICFwYXNzXG59XG5leHBvcnQgbGV0IE5vdCA9IG5ldyBNb2RpZmllcihOb3REZWZpbml0aW9uKTtcblxubGV0IE9yRXF1YWxEZWZpbml0aW9uOiBJTW9kaWZpZXJEZWZpbml0aW9uID0ge1xuICAgIGlkZW50aWZpZXJzOiBbLz0vaV0sXG4gICAgcnVsZTogKHBhc3M6IGJvb2xlYW4sIHZhcmlhYmxlOiBzdHJpbmcsIGNvbXBhcmF0aXZlOiBzdHJpbmcgfCBzdHJpbmdbXSwgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogYm9vbGVhbiA9PiBwYXNzIHx8IHZhcmlhYmxlc1t2YXJpYWJsZV0gPT09IGNvbXBhcmF0aXZlXG59XG5leHBvcnQgbGV0IE9yRXF1YWwgPSBuZXcgTW9kaWZpZXIoT3JFcXVhbERlZmluaXRpb24pO1xuXG5leHBvcnQge2RlZmF1bHQgYXMgSU1vZGlmaWVyRGVmaW5pdGlvbn0gZnJvbSAnLi9tb2RpZmllcnMvSU1vZGlmaWVyRGVmaW5pdGlvbic7XG5leHBvcnQge2RlZmF1bHQgYXMgTW9kaWZpZXJ9IGZyb20gJy4vbW9kaWZpZXJzL01vZGlmaWVyJzsgIiwiaW1wb3J0IElQYXJzZXJEZWZpbml0aW9uIGZyb20gJy4vcGFyc2Vycy9JUGFyc2VyRGVmaW5pdGlvbic7XG5pbXBvcnQgUGFyc2VyIGZyb20gJy4vcGFyc2Vycy9QYXJzZXInO1xuaW1wb3J0IHtSdW5uZXIsIEFjdGlvblJ1bm5lcn0gZnJvbSAnLi9SdW5uZXJzJztcblxubGV0IFNRaWdnTFBhcnNlckRlZmluaXRpb246IElQYXJzZXJEZWZpbml0aW9uID0ge1xuICAgIHJ1bm5lcnM6IFtBY3Rpb25SdW5uZXJdXG59XG5leHBvcnQgbGV0IFNRaWdnTFBhcnNlciA9IG5ldyBQYXJzZXIoU1FpZ2dMUGFyc2VyRGVmaW5pdGlvbik7IFxuXG5leHBvcnQge2RlZmF1bHQgYXMgSVBhcnNlckRlZmluaXRpb259IGZyb20gJy4vcGFyc2Vycy9JUGFyc2VyRGVmaW5pdGlvbic7IiwiaW1wb3J0IElQbGFjZWhvbGRlciBmcm9tICcuL3BsYWNlaG9sZGVycy9JUGxhY2Vob2xkZXInO1xuaW1wb3J0IHtNb2RpZmllcn0gZnJvbSAnLi9Nb2RpZmllcnMnO1xuZXhwb3J0IGxldCBQbGFjZWhvbGRlcnM6IElQbGFjZWhvbGRlcltdID0gW1xuICAgIHtcbiAgICAgICAgbmFtZTogJ3ZhcmlhYmxlJyxcbiAgICAgICAgbG9jYXRvcjogL1xcKHZcXCkvaSxcbiAgICAgICAgcmVwbGFjZW1lbnQ6ICgpID0+ICcoXFxcXHcrKSdcbiAgICB9LFxuICAgIHtcbiAgICAgICAgbmFtZTogJ2NvbXBhcmF0aXZlJyxcbiAgICAgICAgbG9jYXRvcjogL1xcKGNcXCkvaSxcbiAgICAgICAgcmVwbGFjZW1lbnQ6ICgpID0+IGAoXFxcXGQrfFtcIiddXFxcXHcrW1wiJ10pYFxuICAgIH0sXG4gICAge1xuICAgICAgICBuYW1lOiAnbW9kaWZpZXInLFxuICAgICAgICBsb2NhdG9yOiAvXFwobVxcKS9pLFxuICAgICAgICByZXBsYWNlbWVudDogKGl0ZW0/OiBNb2RpZmllcltdKSA9PiBgKCg/OiR7aXRlbS5tYXAobW9kaWZpZXIgPT4gbW9kaWZpZXIuaWRlbnRpZmllcnMubWFwKGlkZW50aWZpZXIgPT4gaWRlbnRpZmllci5zb3VyY2UpLmpvaW4oJ3wnKSkuam9pbignfCcpfXxcXFxccyopKWBcbiAgICB9XG5dO1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gUGxhY2Vob2xkZXIobmFtZTogc3RyaW5nKXtcbiAgICByZXR1cm4gUGxhY2Vob2xkZXJzLmZpbHRlcih4ID0+IHgubmFtZSA9PT0gbmFtZSlbMF07XG59IiwiaW1wb3J0IElSZXBsYWNlckRlZmluaXRpb24gZnJvbSAnLi9yZXBsYWNlcnMvSVJlcGxhY2VyRGVmaW5pdGlvbic7XG5pbXBvcnQgUmVwbGFjZXIgZnJvbSAnLi9yZXBsYWNlcnMvUmVwbGFjZXInO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi9JVmFyaWFibGVzJztcblxubGV0IFZhcmlhYmxlRGVmaW5pdGlvbjogSVJlcGxhY2VyRGVmaW5pdGlvbiA9IHtcbiAgICByZWdleDogLyhbXntdfF4pe3soPyF7KVxccyooXFx3KilcXHMqfX0oPyF9KS9nLFxuICAgIHJ1bGU6IChkZWZpbml0aW9uOiBJUmVwbGFjZXJEZWZpbml0aW9uLCB0ZXh0OiBzdHJpbmcsIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IHN0cmluZyA9PiB0ZXh0LnJlcGxhY2UoZGVmaW5pdGlvbi5yZWdleCwgKG1hdGNoLCAkMSwgJDIpID0+ICQxK3ZhcmlhYmxlc1skMl0pXG59XG5leHBvcnQgbGV0IFZhcmlhYmxlID0gbmV3IFJlcGxhY2VyKFZhcmlhYmxlRGVmaW5pdGlvbik7XG5cbmV4cG9ydCB7ZGVmYXVsdCBhcyBJUmVwbGFjZXJEZWZpbml0aW9ufSBmcm9tICcuL3JlcGxhY2Vycy9JUmVwbGFjZXJEZWZpbml0aW9uJztcbmV4cG9ydCB7ZGVmYXVsdCBhcyBSZXBsYWNlcn0gZnJvbSAnLi9yZXBsYWNlcnMvUmVwbGFjZXInOyIsImltcG9ydCBJUnVubmVyRGVmaW5pdGlvbiBmcm9tICcuL3J1bm5lcnMvSVJ1bm5lckRlZmluaXRpb24nO1xuaW1wb3J0IFJ1bm5lciBmcm9tICcuL3J1bm5lcnMvUnVubmVyJztcbmltcG9ydCB7QWN0aW9uLCBJZiwgRWxzZSwgRW5kSWZ9IGZyb20gJy4vQWN0aW9ucyc7XG5pbXBvcnQge1JlcGxhY2VyLCBWYXJpYWJsZX0gZnJvbSAnLi9SZXBsYWNlcnMnO1xuXG5sZXQgQWN0aW9uUnVubmVyRGVmaW5pdGlvbjogSVJ1bm5lckRlZmluaXRpb24gPSB7XG4gICAgcmVnZXg6IC97eyUoLio/KSV9fShbXFxzXFxTXSo/KT8oPz0oPzp7eyV8JCkpL2dtLFxuICAgIGFjdGlvbnM6IFtJZiwgRWxzZSwgRW5kSWZdLFxuICAgIHJlcGxhY2VyczogW1ZhcmlhYmxlXVxufVxuZXhwb3J0IGxldCBBY3Rpb25SdW5uZXIgPSBuZXcgUnVubmVyKEFjdGlvblJ1bm5lckRlZmluaXRpb24pO1xuXG5leHBvcnQge2RlZmF1bHQgYXMgSVJ1bm5lckRlZmluaXRpb259IGZyb20gJy4vcnVubmVycy9JUnVubmVyRGVmaW5pdGlvbic7XG5leHBvcnQge2RlZmF1bHQgYXMgUnVubmVyUmVzdWx0fSBmcm9tICcuL3J1bm5lcnMvUnVubmVyUmVzdWx0JztcbmV4cG9ydCB7ZGVmYXVsdCBhcyBSdW5uZXJ9IGZyb20gJy4vcnVubmVycy9SdW5uZXInOyIsImltcG9ydCB7cGFyc2UgYXMgUGFyc2V9IGZyb20gJy4vTWFpbic7XG5sZXQgU1FpZ2dMID0ge1xuICAgIHBhcnNlOiBQYXJzZSxcbiAgICB2ZXJzaW9uOiAnMC4xLjAnLFxuICAgIC8vZXh0ZW5kOiBFeHRlbmRcbn07XG5pZih0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykgd2luZG93WydTUWlnZ0wnXSA9IFNRaWdnTDtcbmV4cG9ydCBkZWZhdWx0IFNRaWdnTDsiLCJpbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuL0lWYXJpYWJsZXMnO1xuaW1wb3J0IHtSdW5uZXJSZXN1bHR9IGZyb20gJy4vUnVubmVycydcbmltcG9ydCBDb21tYW5kIGZyb20gJy4vQ29tbWFuZCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNjb3BlIHtcblx0cHVibGljIHZhcmlhYmxlczogSVZhcmlhYmxlcyA9IHt9O1xuXHRwdWJsaWMgY29tbWFuZHM6IENvbW1hbmRbXSA9IFtdO1xuXHRwdWJsaWMgZGVwZW5kZW50czogQ29tbWFuZFtdID0gW107XG4gICAgXG4gICAgcHVibGljIHBlcmZvcm0ocHJldj86IENvbW1hbmQpOiBDb21tYW5kIHtcbiAgICAgICAgbGV0IGNvbW1hbmQ6IENvbW1hbmQ7XG4gICAgICAgIGZvcihjb21tYW5kIG9mIHRoaXMuY29tbWFuZHMpe1xuICAgICAgICAgICAgcHJldiA9IGNvbW1hbmQucGVyZm9ybShwcmV2KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJldjtcbiAgICB9XG59IiwiaW1wb3J0IElBY3Rpb25EZWZpbml0aW9uIGZyb20gJy4vSUFjdGlvbkRlZmluaXRpb24nO1xuaW1wb3J0IEFjdGlvblJlc3VsdCBmcm9tICcuL0FjdGlvblJlc3VsdCc7XG5pbXBvcnQge0NvbmRpdGlvbn0gZnJvbSAnLi4vQ29uZGl0aW9ucyc7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcbmltcG9ydCBDb21tYW5kIGZyb20gJy4uL0NvbW1hbmQnO1xuaW1wb3J0IFNjb3BlIGZyb20gJy4uL1Njb3BlJztcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFjdGlvbiB7XG4gICAgcHJpdmF0ZSBjb25kaXRpb246IENvbmRpdGlvbjtcbiAgICBwcml2YXRlIGNvbW1hbmQ6IENvbW1hbmQ7XG4gICAgcHJpdmF0ZSBpbm5lcjogc3RyaW5nO1xuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBkZWZpbml0aW9uOiBJQWN0aW9uRGVmaW5pdGlvbil7XG4gICAgICAgIGlmKCFkZWZpbml0aW9uKSB0aHJvdyAnQXR0ZW1wdGVkIHRvIGluc3RhdGlhdGUgYWN0aW9uIHdpdGhvdXQgYSBkZWZpbml0aW9uJztcbiAgICB9XG4gICAgXG4gICAgcHVibGljIG1hdGNoZXMoc3RhdGVtZW50OiBzdHJpbmcpOiBib29sZWFue1xuICAgICAgICByZXR1cm4gdGhpcy5kZWZpbml0aW9uLnJlZ2V4LnRlc3Qoc3RhdGVtZW50KTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHBhcnNlKGNvbW1hbmQ6IENvbW1hbmQsIHN0YXRlbWVudDogc3RyaW5nLCBpbm5lcjogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBib29sZWFue1xuICAgICAgICB0aGlzLmNvbW1hbmQgPSBjb21tYW5kO1xuICAgICAgICB0aGlzLmlubmVyID0gaW5uZXI7XG4gICAgICAgIGxldCBjb25kaXRpb246IENvbmRpdGlvbjtcbiAgICAgICAgZm9yKGNvbmRpdGlvbiBvZiB0aGlzLmRlZmluaXRpb24uY29uZGl0aW9ucyl7XG4gICAgICAgICAgICBpZihjb25kaXRpb24ubWF0Y2hlcyhzdGF0ZW1lbnQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25kaXRpb24gPSBjb25kaXRpb247XG4gICAgICAgICAgICAgICAgdGhpcy5jb25kaXRpb24ucGFyc2Uoc3RhdGVtZW50LCB2YXJpYWJsZXMpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHBlcmZvcm0ocHJldj86IEFjdGlvblJlc3VsdCk6IEFjdGlvblJlc3VsdCB7XG4gICAgICAgIHJldHVybiB0aGlzLmRlZmluaXRpb24ucnVsZSh0aGlzLmNvbW1hbmQsIHRoaXMuY29uZGl0aW9uLCBwcmV2KTtcbiAgICB9XG59IiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWN0aW9uUmVzdWx0IHtcbiAgICBwdWJsaWMgZGVwZW5kZW50OiBBY3Rpb25SZXN1bHQ7XG4gICAgY29uc3RydWN0b3IocHVibGljIHRleHQ6IHN0cmluZywgcHVibGljIHBhc3NlZD86IGJvb2xlYW4pe31cbn0iLCJpbXBvcnQgQWN0aW9uIGZyb20gJy4vQWN0aW9uJztcbmltcG9ydCB7Q29uZGl0aW9ufSBmcm9tICcuLi9Db25kaXRpb25zJztcbmltcG9ydCBDb21tYW5kIGZyb20gJy4uL0NvbW1hbmQnO1xuaW1wb3J0IFNjb3BlIGZyb20gJy4uL1Njb3BlJztcbmltcG9ydCBBY3Rpb25SZXN1bHQgZnJvbSAnLi9BY3Rpb25SZXN1bHQnO1xuXG5pbnRlcmZhY2UgSUFjdGlvbkRlZmluaXRpb24ge1xuICAgIHJlZ2V4OiBSZWdFeHA7XG4gICAgY29uZGl0aW9uczogQ29uZGl0aW9uW107XG4gICAgZGVwZW5kZW50czogQWN0aW9uW107XG4gICAgdGVybWluYXRvcjogYm9vbGVhbjtcbiAgICBydWxlOiAoY29tbWFuZDogQ29tbWFuZCwgY29uZGl0aW9uOiBDb25kaXRpb24sIHByZXY/OiBBY3Rpb25SZXN1bHQpID0+IEFjdGlvblJlc3VsdDtcbn1cbmV4cG9ydCBkZWZhdWx0IElBY3Rpb25EZWZpbml0aW9uOyIsImltcG9ydCB7UnVubmVyUmVzdWx0fSBmcm9tICcuLi9SdW5uZXJzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tbWFuZFJlc3VsdCBleHRlbmRzIFJ1bm5lclJlc3VsdCB7fSIsImltcG9ydCBQbGFjZWhvbGRlciBmcm9tICcuLi9QbGFjZWhvbGRlcnMnO1xuaW1wb3J0IENvbmRpdGlvblJlc3VsdCBmcm9tICcuL0NvbmRpdGlvblJlc3VsdCc7XG5pbXBvcnQgSUNvbmRpdGlvbkluZGljZXMgZnJvbSAnLi9JQ29uZGl0aW9uSW5kaWNlcyc7XG5pbXBvcnQgSUNvbmRpdGlvbkRlZmluaXRpb24gZnJvbSAnLi9JQ29uZGl0aW9uRGVmaW5pdGlvbic7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcbmltcG9ydCB7TW9kaWZpZXJ9IGZyb20gJy4uL01vZGlmaWVycydcbmltcG9ydCAnLi4vRXh0ZW5zaW9ucyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbmRpdGlvbiB7XG4gICAgcHJpdmF0ZSByZWdleDogUmVnRXhwO1xuICAgIHByaXZhdGUgaW5kaWNpZXM6IElDb25kaXRpb25JbmRpY2VzID0ge307XG4gICAgcHJpdmF0ZSB0ZW1wbGF0ZTogc3RyaW5nO1xuICAgIHByaXZhdGUgaXRlbXM6IEFycmF5PHN0cmluZyB8IE1vZGlmaWVyW10+O1xuICAgIHByaXZhdGUgcnVsZTogKHZhcmlhYmxlOiBzdHJpbmcsIGNvbXBhcmF0aXZlOiBzdHJpbmcgfCBzdHJpbmdbXSwgdmFyaWFibGVzOiBJVmFyaWFibGVzKSA9PiBib29sZWFuO1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgZGVmaW5pdGlvbjogSUNvbmRpdGlvbkRlZmluaXRpb24pe1xuICAgICAgICBpZighZGVmaW5pdGlvbikgdGhyb3cgJ0F0dGVtcHRlZCB0byBpbnN0YXRpYXRlIGNvbmRpdGlvbiB3aXRob3V0IGEgZGVmaW5pdGlvbic7XG4gICAgICAgIHRoaXMucmVnZXggPSB0aGlzLnRyYW5zbGF0ZSh0aGlzLmRlZmluaXRpb24pO1xuICAgICAgICB0aGlzLnRlbXBsYXRlID0gZGVmaW5pdGlvbi50ZW1wbGF0ZTtcbiAgICAgICAgdGhpcy5pdGVtcyA9IGRlZmluaXRpb24uaXRlbXM7XG4gICAgICAgIHRoaXMucnVsZSA9IGRlZmluaXRpb24ucnVsZTtcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSB0cmFuc2xhdGUoZGVmaW5pdGlvbjogSUNvbmRpdGlvbkRlZmluaXRpb24pOiBSZWdFeHB7XG4gICAgICAgIGxldCB0ZW1wbGF0ZSA9IGRlZmluaXRpb24udGVtcGxhdGUsIGl0ZW06IChzdHJpbmcgfCBNb2RpZmllcltdKSwgbmFtZTogc3RyaW5nLCBpZHg9MTtcbiAgICAgICAgZm9yKGl0ZW0gb2YgZGVmaW5pdGlvbi5pdGVtcyl7XG4gICAgICAgICAgICBpZighaXRlbSkgdGhyb3cgJ0ludmFsaWQgaXRlbSBpbiBpdGVtcyBkZWZpbml0aW9uJztcbiAgICAgICAgICAgIGlmKGl0ZW0gaW5zdGFuY2VvZiBBcnJheSkgbmFtZSA9ICdtb2RpZmllcic7XG4gICAgICAgICAgICBlbHNlIG5hbWUgPSA8c3RyaW5nPml0ZW07XG4gICAgICAgICAgICBsZXQgcGxhY2Vob2xkZXIgPSBQbGFjZWhvbGRlcihuYW1lKTtcbiAgICAgICAgICAgIHRlbXBsYXRlID0gdGVtcGxhdGUucmVwbGFjZShwbGFjZWhvbGRlci5sb2NhdG9yLCBwbGFjZWhvbGRlci5yZXBsYWNlbWVudChpdGVtIGluc3RhbmNlb2YgQXJyYXkgPyBpdGVtIDogbnVsbCkpO1xuICAgICAgICAgICAgaWYodGhpcy5pbmRpY2llc1tuYW1lXSBpbnN0YW5jZW9mIEFycmF5KSAoPG51bWJlcltdPnRoaXMuaW5kaWNpZXNbbmFtZV0pLnB1c2goaWR4KTtcbiAgICAgICAgICAgIGVsc2UgaWYoIWlzTmFOKDxhbnk+dGhpcy5pbmRpY2llc1tuYW1lXSkpIHtcbiAgICAgICAgICAgICAgICBsZXQgYXJyYXkgPSBbXTtcbiAgICAgICAgICAgICAgICBhcnJheS5wdXNoKHRoaXMuaW5kaWNpZXNbbmFtZV0pO1xuICAgICAgICAgICAgICAgIGFycmF5LnB1c2goaWR4KTtcbiAgICAgICAgICAgICAgICB0aGlzLmluZGljaWVzW25hbWVdID0gYXJyYXk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHRoaXMuaW5kaWNpZXNbbmFtZV0gPSBpZHg7XG4gICAgICAgICAgICB0aGlzLmluZGljaWVzW2lkeF0gPSBuYW1lO1xuICAgICAgICAgICAgaWR4Kys7XG4gICAgICAgIH1cbiAgICAgICAgdGVtcGxhdGUgPSB0ZW1wbGF0ZS5yZXBsYWNlKC9cXHMrL2csICdcXFxccysnKTtcbiAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAodGVtcGxhdGUsICdpJyk7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBwYXJzZShzdGF0ZW1lbnQ6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogQ29uZGl0aW9uUmVzdWx0IHtcbiAgICAgICAgbGV0IHJlc3VsdCA9IG5ldyBDb25kaXRpb25SZXN1bHQoKSwgbWF0Y2ggPSBzdGF0ZW1lbnQubWF0Y2godGhpcy5yZWdleCksIGksIG1vZGlmaWVyO1xuICAgICAgICByZXN1bHQuc3RhdGVtZW50ID0gbWF0Y2hbMF07XG4gICAgICAgIGZvcihpPTE7aTxtYXRjaC5sZW5ndGg7aSsrKXtcbiAgICAgICAgICAgIGlmKHRoaXMuaXRlbXNbaV1bMF0gaW5zdGFuY2VvZiBNb2RpZmllcil7XG4gICAgICAgICAgICAgICAgZm9yKG1vZGlmaWVyIG9mIHRoaXMuaXRlbXNbaV0pe1xuICAgICAgICAgICAgICAgICAgICBpZihtb2RpZmllci5tYXRjaGVzKG1hdGNoW2ldKSkgcmVzdWx0LnNldCg8c3RyaW5nPnRoaXMuaW5kaWNpZXNbaV0sIG1vZGlmaWVyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHJlc3VsdC5zZXQoPHN0cmluZz50aGlzLmluZGljaWVzW2ldLCBtYXRjaFtpXSlcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQudmFyaWFibGVzID0gdmFyaWFibGVzO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgcGVyZm9ybShyZXN1bHQ/OiBDb25kaXRpb25SZXN1bHQpe1xuICAgICAgICByZXN1bHQucGFzcyA9IHRoaXMucnVsZShyZXN1bHQudmFyaWFibGUsIHJlc3VsdC5jb21wYXJhdGl2ZSwgcmVzdWx0LnZhcmlhYmxlcyk7XG4gICAgICAgIGxldCBtb2Q7XG4gICAgICAgIGZvcihtb2Qgb2YgcmVzdWx0Lm1vZGlmaWVyKXtcbiAgICAgICAgICAgIHJlc3VsdC5wYXNzID0gbW9kLnJ1bGUocmVzdWx0LnBhc3MsIHJlc3VsdC52YXJpYWJsZSwgcmVzdWx0LmNvbXBhcmF0aXZlLCByZXN1bHQudmFyaWFibGVzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0LnBhc3M7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBtYXRjaGVzKHN0YXRlbWVudDogc3RyaW5nKXtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVnZXgudGVzdChzdGF0ZW1lbnQpO1xuICAgIH1cbn0iLCJpbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcbmltcG9ydCB7TW9kaWZpZXJ9IGZyb20gJy4uL01vZGlmaWVycyc7XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb25kaXRpb25SZXN1bHQge1xuICAgIHB1YmxpYyBwYXNzOiBib29sZWFuO1xuICAgIHB1YmxpYyB2YXJpYWJsZTogc3RyaW5nO1xuICAgIHB1YmxpYyBjb21wYXJhdGl2ZTogYW55O1xuICAgIHB1YmxpYyB2YXJpYWJsZXM6IElWYXJpYWJsZXM7XG4gICAgcHVibGljIG1vZGlmaWVyOiBNb2RpZmllcltdID0gW107XG4gICAgcHVibGljIHN0YXRlbWVudDogc3RyaW5nO1xuICAgIHB1YmxpYyBzZXQocHJvcDogc3RyaW5nLCB2YWx1ZTogc3RyaW5nIHwgTW9kaWZpZXIpe1xuICAgICAgICBpZih0aGlzW3Byb3BdIGluc3RhbmNlb2YgQXJyYXkpIHRoaXNbcHJvcF0ucHVzaCh2YWx1ZSk7XG4gICAgICAgIGVsc2UgdGhpc1twcm9wXSA9IHZhbHVlO1xuICAgIH1cbn0iLCJpbXBvcnQge01vZGlmaWVyfSBmcm9tICcuLi9Nb2RpZmllcnMnO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5pbnRlcmZhY2UgSUNvbmRpdGlvbkRlZmluaXRpb24ge1xuICAgIHRlbXBsYXRlOiBzdHJpbmc7XG4gICAgaXRlbXM6IEFycmF5PHN0cmluZyB8IE1vZGlmaWVyW10+O1xuICAgIHJ1bGU6ICh2YXJpYWJsZTogc3RyaW5nLCBjb21wYXJhdGl2ZTogc3RyaW5nIHwgc3RyaW5nW10sIHZhcmlhYmxlczogSVZhcmlhYmxlcykgPT4gYm9vbGVhbjtcbn1cbmV4cG9ydCBkZWZhdWx0IElDb25kaXRpb25EZWZpbml0aW9uOyIsImludGVyZmFjZSBJQ29uZGl0aW9uSW5kaWNlcyB7XG4gICAgW2tleTogc3RyaW5nXTogKG51bWJlcltdIHwgbnVtYmVyIHwgc3RyaW5nKTtcbiAgICBba2V5OiBudW1iZXJdOiBzdHJpbmcgfCBudW1iZXIgfCBudW1iZXJbXTtcbn1cbmV4cG9ydCBkZWZhdWx0IElDb25kaXRpb25JbmRpY2VzOyIsImltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuXG5pbnRlcmZhY2UgSU1vZGlmaWVyRGVmaW5pdGlvbiB7XG4gICAgaWRlbnRpZmllcnM6IFJlZ0V4cFtdO1xuICAgIHJ1bGU6IChwYXNzOiBib29sZWFuLCB2YXJpYWJsZTogc3RyaW5nLCBjb21wYXJhdGl2ZTogc3RyaW5nIHwgc3RyaW5nW10sIHZhcmlhYmxlczogSVZhcmlhYmxlcykgPT4gYm9vbGVhbjtcbn1cbmV4cG9ydCBkZWZhdWx0IElNb2RpZmllckRlZmluaXRpb247IiwiaW1wb3J0IElNb2RpZmllckRlZmluaXRpb24gZnJvbSAnLi9JTW9kaWZpZXJEZWZpbml0aW9uJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNb2RpZmllciB7XG4gICAgcHVibGljIGlkZW50aWZpZXJzOiBSZWdFeHBbXTtcbiAgICBwdWJsaWMgcnVsZTogKHBhc3M6IGJvb2xlYW4sIHZhcmlhYmxlOiBzdHJpbmcsIGNvbXBhcmF0aXZlOiBzdHJpbmcgfCBzdHJpbmdbXSwgdmFyaWFibGVzOiBJVmFyaWFibGVzKSA9PiBib29sZWFuO1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgZGVmaW5pdGlvbjpJTW9kaWZpZXJEZWZpbml0aW9uKXtcbiAgICAgICAgaWYoIWRlZmluaXRpb24pIHRocm93ICdBdHRlbXB0ZWQgdG8gaW5zdGF0aWF0ZSBtb2RpZmllciB3aXRob3V0IGEgZGVmaW5pdGlvbic7XG4gICAgICAgIHRoaXMuaWRlbnRpZmllcnMgPSBkZWZpbml0aW9uLmlkZW50aWZpZXJzO1xuICAgICAgICB0aGlzLnJ1bGUgPSBkZWZpbml0aW9uLnJ1bGVcbiAgICB9XG4gICAgXG4gICAgcHVibGljIG1hdGNoZXModGV4dDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIGxldCBpZGVudGlmaWVyO1xuICAgICAgICBmb3IoaWRlbnRpZmllciBvZiB0aGlzLmlkZW50aWZpZXJzKXtcbiAgICAgICAgICAgIGlmKGlkZW50aWZpZXIudGVzdCh0ZXh0KSkgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn0iLCJpbXBvcnQge1J1bm5lcn0gZnJvbSAnLi4vUnVubmVycyc7XG5cbmludGVyZmFjZSBJUGFyc2VyRGVmaW5pdGlvbiB7XG4gICAgcnVubmVyczogUnVubmVyW11cbn1cbmV4cG9ydCBkZWZhdWx0IElQYXJzZXJEZWZpbml0aW9uOyIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9FeHRlbnNpb25zLnRzXCIgLz5cbmltcG9ydCBJUGFyc2VyRGVmaW5pdGlvbiBmcm9tICcuL0lQYXJzZXJEZWZpbml0aW9uJztcbmltcG9ydCB7UnVubmVyLCBBY3Rpb25SdW5uZXJ9IGZyb20gJy4uL1J1bm5lcnMnO1xuaW1wb3J0IENvbW1hbmQgZnJvbSAnLi4vQ29tbWFuZCc7XG5pbXBvcnQgU2NvcGUgZnJvbSAnLi4vU2NvcGUnO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5BcnJheS5wcm90b3R5cGUubGFzdCA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiB0aGlzW3RoaXMubGVuZ3RoLTFdO1xufVxuLyoqXG4gKiBUaGUgU1FpZ2dMIHBhcnNlclxuICogQG1vZHVsZSBQYXJzZXJcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtzdHJpbmd9IHNxbCAgICAgICAgICAgICAgLSBUaGUgU1FpZ2dMIHF1ZXJ5IHRvIHJ1biB0aGUgcGFyc2VyIGFnYWluc3RcbiAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzICAgIC0gQW55IHZhcmlhYmxlcyBwYXNzZWQgdG8gdGhlIFNRaWdnTCBwYXJzZXJcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBzcWwgICAgICAgICAgIC0gVGhlIFNRaWdnTCBxdWVyeSB0byBydW4gdGhlIHBhcnNlciBhZ2FpbnN0XG4gKiBAcHJvcGVydHkge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAtIEFueSB2YXJpYWJsZXMgcGFzc2VkIHRvIHRoZSBTUWlnZ0wgcGFyc2VyXG4gKiBAcHJvcGVydHkge0NvbW1hbmRbXX0gY29tbWFuZHMgICAtIEFycmF5IG9mIGNvbW1hbmRzIGZvdW5kIGluIHRoZSBTUWlnZ0wgcXVlcnlcbiAqIEBwcm9wZXJ0eSB7Q29tbWFuZFtdfSBzdGFjayAgICAgIC0gQ29tbWFuZCBzdGFjayBmb3Igc3RvcmluZyBjdXJyZW50IHBvc2l0aW9uIGluIHRoZSBwYXJzaW5nIHByb2Nlc3NcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBlcnJvciAgICAgICAgIC0gRXJyb3Igc3RyaW5nIGlmIGFueSBlcnJvcnMgYXJlIGZvdW5kIGluIHRoZSBwYXJzaW5nIHByb2Nlc3NcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGFyc2VyIHtcbiAgICBwdWJsaWMgcmVnZXg6IFJlZ0V4cDtcblx0cHVibGljIGNvbW1hbmRzOiBDb21tYW5kW10gPSBbXTtcblx0cHVibGljIHN0YWNrOiBDb21tYW5kW10gPSBbXTtcbiAgICBwdWJsaWMgZXJyb3I6IHN0cmluZ1tdID0gW107XG4gICAgcHVibGljIHNxbDogc3RyaW5nO1xuXHQvLyBjb25zdHJ1Y3RvcihwdWJsaWMgc3FsOiBzdHJpbmcsIHB1YmxpYyB2YXJpYWJsZXM6IElWYXJpYWJsZXMpe1xuXHRcdC8vIHRoaXMuY29tbWFuZHMgPSB0aGlzLmV4dHJhY3Qoc3FsLCB2YXJpYWJsZXMpO1xuXHRcdC8vIHRoaXMudmFyaWFibGVzID0gdmFyaWFibGVzO1xuXHQvLyB9XG4gICAgY29uc3RydWN0b3IocHVibGljIGRlZmluaXRpb246IElQYXJzZXJEZWZpbml0aW9uKXtcbiAgICAgICAgaWYoIWRlZmluaXRpb24pIHRocm93ICdBdHRlbXB0ZWQgdG8gaW5zdGF0aWF0ZSBwYXJzZXIgd2l0aG91dCBhIGRlZmluaXRpb24nO1xuICAgICAgICB0aGlzLnJlZ2V4ID0gbmV3IFJlZ0V4cChgKD86JHt0aGlzLmRlZmluaXRpb24ucnVubmVycy5tYXAoeCA9PiB4LmRlZmluaXRpb24ucmVnZXguc291cmNlKS5qb2luKCcpfCgnKX0pYCk7XG4gICAgfVxuXHQvKipcbiAgICAgKiBFeHRyYWN0IGFueSBjb21tYW5kcyBvdXQgb2YgdGhlIFNRaWdnTCBxdWVyeSBhbmQgZGV0ZXJtaW5lIHRoZWlyIG9yZGVyLCBuZXN0aW5nLCBhbmQgdHlwZVxuICAgICAqIEBtZW1iZXJvZiBQYXJzZXJcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzcWwgICAgICAgICAgICAgIC0gU1FpZ2dMIHF1ZXJ5IHRvIGV4dHJhY3QgY29tbWFuZHMgZnJvbVxuICAgICAqIEBwYXJhbSB7SVZhcmlhYmxlc30gdmFyaWFibGVzICAgIC0gQW55IGdsb2JhbCB2YXJpYWJsZXMgcGFzc2VkIGluIHRvIFNRaWdnTFxuICAgICAqIEByZXR1cm5zIHtDb21tYW5kW119ICAgICAgICAgICAgIC0gQXJyYXkgb2YgZnVsbHkgcGFyc2VkIGNvbW1hbmRzLCByZWFkeSBmb3IgZXhlY3V0aW9uXG4gICAgICovXG5cdHB1YmxpYyBwYXJzZShzcWw6IHN0cmluZywgdmFyaWFibGVzOiBJVmFyaWFibGVzKXtcblx0ICAgIHRoaXMuY29tbWFuZHMgPSBbXTtcbiAgICAgICAgdGhpcy5zdGFjayA9IFtdO1xuICAgICAgICB0aGlzLnNxbCA9IHNxbDtcbiAgICAgICAgbGV0IG1hdGNoXG5cdFx0Ly8gQ29tbWFuZC5yZWdleC5sYXN0SW5kZXggPSAwO1xuXHRcdHdoaWxlKChtYXRjaCA9IHRoaXMucmVnZXguZXhlYyhzcWwpKSAhPSBudWxsKXtcbiAgICAgICAgICAgIGxldCBmb3VuZDogQ29tbWFuZCwgcnVubmVyOiBSdW5uZXI7XG4gICAgICAgICAgICBmb3IocnVubmVyIG9mIHRoaXMuZGVmaW5pdGlvbi5ydW5uZXJzKXtcbiAgICAgICAgICAgICAgICBpZihydW5uZXIubWF0Y2hlcyhtYXRjaFswXSkpe1xuICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IG5ldyBDb21tYW5kKG1hdGNoLmluZGV4LCBtYXRjaC5pbnB1dC5sZW5ndGgsIG1hdGNoWzFdLCBtYXRjaFsyXSwgbmV3IFNjb3BlKCksIHJ1bm5lcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXHRcdFx0aWYodGhpcy5zdGFjay5sZW5ndGggPiAwICYmIHRoaXMuc3RhY2subGFzdCgpLmFjdGlvbi5kZWZpbml0aW9uLmRlcGVuZGVudHMuY29udGFpbnMoZm91bmQuYWN0aW9uKSl7XG4gICAgICAgICAgICAgICAgLy8gZm91bmQuYWN0aW9uLnN1cHBvcnRlciA9IHN0YWNrLmxhc3QoKTtcblx0XHRcdFx0dGhpcy5zdGFjay5sYXN0KCkuZGVwZW5kZW50cy5wdXNoKGZvdW5kKTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHRoaXMuc3RhY2subGVuZ3RoID4gMCAmJiAhdGhpcy5zdGFjay5sYXN0KCkuYWN0aW9uLmRlZmluaXRpb24udGVybWluYXRvcikge1xuXHRcdFx0XHR0aGlzLnN0YWNrLnB1c2goZm91bmQpO1xuXHRcdFx0XHR0aGlzLnN0YWNrLmxhc3QoKS5zY29wZS5jb21tYW5kcy5wdXNoKGZvdW5kKTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRpZih0aGlzLnN0YWNrLmxlbmd0aCA+IDAgJiYgdGhpcy5zdGFjay5sYXN0KCkuYWN0aW9uLmRlZmluaXRpb24udGVybWluYXRvcikgdGhpcy5zdGFjay5wb3AoKTtcblx0XHRcdFx0dGhpcy5zdGFjay5wdXNoKGZvdW5kKTtcblx0XHRcdFx0dGhpcy5jb21tYW5kcy5wdXNoKGZvdW5kKTtcblx0XHRcdH1cbiAgICAgICAgICAgIC8vIGxldCBlcnJvciA9IGZvdW5kLmFjdGlvbi52YWxpZGF0ZSgpO1xuICAgICAgICAgICAgLy8gaWYoZXJyb3IpIHJldHVybiBbXTtcblx0XHR9XG5cdFx0Ly8gcmV0dXJuIGNvbW1hbmRzO1xuXHR9XG5cdC8qKlxuICAgICAqIFJ1biB0aGUgY29tbWFuZHMgYWdhaW5zdCB0aGUgc3RyaW5nIGFuZCBvdXRwdXQgdGhlIGVuZCByZXN1bHRcbiAgICAgKiBAbWVtYmVyb2YgUGFyc2VyXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgZW5kIHJlc3VsdCBvZiBydW5uaW5nIGFsbCBjb21tYW5kcyBhZ2FpbnN0IHRoZSBTUWlnZ0wgcXVlcnlcbiAgICAgKi9cblx0cHVibGljIHBlcmZvcm0oKTogc3RyaW5nIHtcblx0XHR2YXIgcXVlcnkgPSAnJywgaW5kZXggPSAwO1xuICAgICAgICBpZih0aGlzLmNvbW1hbmRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHRoaXMuc3FsO1xuXHRcdGZvcih2YXIgY29tbWFuZCBvZiB0aGlzLmNvbW1hbmRzKXtcblx0XHRcdHF1ZXJ5ICs9IHRoaXMuc3FsLnNsaWNlKGluZGV4LCBjb21tYW5kLmluZGV4IC0xKTtcblx0XHRcdHF1ZXJ5ICs9IGNvbW1hbmQucGVyZm9ybShjb21tYW5kKS5yZXN1bHQudGV4dDtcblx0XHRcdGluZGV4ICs9IGNvbW1hbmQubGVuZ3RoO1xuXHRcdH1cblx0XHRyZXR1cm4gcXVlcnk7IC8vVE9ET1xuXHR9XG59IiwiaW1wb3J0IHtNb2RpZmllcn0gZnJvbSAnLi4vTW9kaWZpZXJzJztcbmludGVyZmFjZSBJUGxhY2Vob2xkZXIge1xuICAgIG5hbWU6IHN0cmluZztcbiAgICBsb2NhdG9yOiBSZWdFeHA7XG4gICAgcmVwbGFjZW1lbnQ6IChpdGVtPzpNb2RpZmllcltdKSA9PiBzdHJpbmc7XG59XG5leHBvcnQgZGVmYXVsdCBJUGxhY2Vob2xkZXI7IiwiaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5cbmludGVyZmFjZSBJUmVwbGFjZXJEZWZpbml0aW9uIHtcbiAgICByZWdleDogUmVnRXhwO1xuICAgIHJ1bGU6IChkZWZpbml0aW9uOiBJUmVwbGFjZXJEZWZpbml0aW9uLCB0ZXh0OiBzdHJpbmcsIHZhcmlhYmxlczogSVZhcmlhYmxlcykgPT4gc3RyaW5nO1xufVxuZXhwb3J0IGRlZmF1bHQgSVJlcGxhY2VyRGVmaW5pdGlvbjsiLCJpbXBvcnQgSVJlcGxhY2VyRGVmaW5pdGlvbiBmcm9tICcuL0lSZXBsYWNlckRlZmluaXRpb24nO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlcGxhY2VyIHsgICAgXG4gICAgY29uc3RydWN0b3IocHVibGljIGRlZmluaXRpb246IElSZXBsYWNlckRlZmluaXRpb24pe1xuICAgICAgICBpZighZGVmaW5pdGlvbikgdGhyb3cgJ0F0dGVtcHRlZCB0byBpbnN0YXRpYXRlIHJlcGxhY2VyIHdpdGhvdXQgYSBkZWZpbml0aW9uJztcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHJlcGxhY2UodGV4dDogc3RyaW5nLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBzdHJpbmd7XG4gICAgICAgIHJldHVybiB0aGlzLmRlZmluaXRpb24ucnVsZSh0aGlzLmRlZmluaXRpb24sIHRleHQsIHZhcmlhYmxlcyk7XG4gICAgfVxufSIsImltcG9ydCB7QWN0aW9ufSBmcm9tICcuLi9BY3Rpb25zJztcbmltcG9ydCB7UmVwbGFjZXJ9IGZyb20gJy4uL1JlcGxhY2Vycyc7XG5cbmludGVyZmFjZSBJUnVubmVyRGVmaW5pdGlvbiB7XG4gICAgcmVnZXg6IFJlZ0V4cDtcbiAgICBhY3Rpb25zOiBBY3Rpb25bXTtcbiAgICByZXBsYWNlcnM6IFJlcGxhY2VyW107XG59XG5leHBvcnQgZGVmYXVsdCBJUnVubmVyRGVmaW5pdGlvbjsiLCJpbXBvcnQgSVJ1bm5lckRlZmluaXRpb24gZnJvbSAnLi9JUnVubmVyRGVmaW5pdGlvbic7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcbmltcG9ydCBTY29wZSBmcm9tICcuLi9TY29wZSc7XG5pbXBvcnQge0FjdGlvbn0gZnJvbSAnLi4vQWN0aW9ucyc7XG5pbXBvcnQgQ29tbWFuZCBmcm9tICcuLi9Db21tYW5kJztcbmltcG9ydCB7UmVwbGFjZXJ9IGZyb20gJy4uL1JlcGxhY2Vycyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJ1bm5lciB7XG4gICAgY29uc3RydWN0b3IocHVibGljIGRlZmluaXRpb246IElSdW5uZXJEZWZpbml0aW9uKXtcbiAgICAgICAgaWYoIWRlZmluaXRpb24pIHRocm93ICdBdHRlbXB0ZWQgdG8gaW5zdGF0aWF0ZSBydW5uZXIgd2l0aG91dCBhIGRlZmluaXRpb24nO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgcGFyc2UoY29tbWFuZDogQ29tbWFuZCk6Q29tbWFuZCB7XG4gICAgICAgIGxldCBhY3Rpb246IEFjdGlvbjtcbiAgICAgICAgZm9yKGFjdGlvbiBvZiB0aGlzLmRlZmluaXRpb24uYWN0aW9ucyl7XG4gICAgICAgICAgICBpZihhY3Rpb24ubWF0Y2hlcyhjb21tYW5kLnN0YXRlbWVudCkpIHtcbiAgICAgICAgICAgICAgICBjb21tYW5kLmFjdGlvbiA9IGFjdGlvbjtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29tbWFuZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHBlcmZvcm0oY29tbWFuZDogQ29tbWFuZCwgcHJldj86IENvbW1hbmQpOiBDb21tYW5kIHtcbiAgICAgICAgY29tbWFuZC5yZXN1bHQgPSBjb21tYW5kLmFjdGlvbi5wZXJmb3JtKHByZXYucmVzdWx0KTtcbiAgICAgICAgY29tbWFuZC5yZXN1bHQuZGVwZW5kZW50ID0gY29tbWFuZC5zY29wZS5wZXJmb3JtKGNvbW1hbmQpLnJlc3VsdDtcbiAgICAgICAgbGV0IHJlcGxhY2VyOiBSZXBsYWNlcjtcbiAgICAgICAgZm9yKHJlcGxhY2VyIG9mIHRoaXMuZGVmaW5pdGlvbi5yZXBsYWNlcnMpe1xuICAgICAgICAgICAgY29tbWFuZC5yZXBsYWNlKHJlcGxhY2VyKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29tbWFuZDtcbiAgICB9XG4gICAgXG4gICAgcHVibGljIG1hdGNoZXMoc3RhdGVtZW50OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVmaW5pdGlvbi5yZWdleC50ZXN0KHN0YXRlbWVudCk7XG4gICAgfVxufSIsImltcG9ydCB7QWN0aW9uUmVzdWx0fSBmcm9tICcuLi9BY3Rpb25zJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUnVubmVyUmVzdWx0IGV4dGVuZHMgQWN0aW9uUmVzdWx0IHt9XG4iXX0=
