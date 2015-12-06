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

},{"./Expressions":3,"./actions/Action":14,"./commands/CommandResult":15}],2:[function(require,module,exports){
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

},{"./commands/CommandResult":15}],3:[function(require,module,exports){
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

},{"./Modifiers":6,"./expressions/Expression":16}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{"./Parsers":7}],6:[function(require,module,exports){
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

},{"./modifiers/Modifier":18}],7:[function(require,module,exports){
var Parser_1 = require('./parsers/Parser');
var Runners_1 = require('./Runners');
var SQiggLParserDefinition = {
    runners: [Runners_1.ActionRunner]
};
exports.SQiggLParser = new Parser_1.default(SQiggLParserDefinition);

},{"./Runners":10,"./parsers/Parser":19}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
var Replacer_1 = require('./replacers/Replacer');
var VariableDefinition = {
    regex: /([^{]|^){{(?!{)\s*(\w*)\s*}}(?!})/g,
    rule: function (definition, text, variables) { return text.replace(definition.regex, function (match, $1, $2) { return $1 + variables[$2]; }); }
};
exports.Variable = new Replacer_1.default(VariableDefinition);
var Replacer_2 = require('./replacers/Replacer');
exports.Replacer = Replacer_2.default;

},{"./replacers/Replacer":20}],10:[function(require,module,exports){
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

},{"./Actions":1,"./Replacers":9,"./runners/Runner":21}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
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

},{"./ValueType":13}],13:[function(require,module,exports){
var ValueType;
(function (ValueType) {
    ValueType[ValueType["string"] = 0] = "string";
    ValueType[ValueType["number"] = 1] = "number";
    ValueType[ValueType["array"] = 2] = "array";
    ValueType[ValueType["variable"] = 3] = "variable";
})(ValueType || (ValueType = {}));
exports.default = ValueType;

},{}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
var CommandResult = (function () {
    function CommandResult(text, passed) {
        this.text = text;
        this.passed = passed;
    }
    return CommandResult;
})();
exports.default = CommandResult;

},{}],16:[function(require,module,exports){
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

},{"../Extensions":4,"../Placeholders":8,"./ExpressionResult":17}],17:[function(require,module,exports){
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

},{"../Value":12}],18:[function(require,module,exports){
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

},{}],19:[function(require,module,exports){
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

},{"../Command":2,"../Scope":11}],20:[function(require,module,exports){
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

},{}],21:[function(require,module,exports){
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

},{}],22:[function(require,module,exports){
// /// <reference path="../typings/tsd.d.ts" />
// import Command from '../src/Command';
// import {If} from '../src/Actions';
// import IVariables from '../src/IVariables';
// describe('Command', () => {
// 	describe('regex', () => {
// 		it('should match any strings wrapped in "{{% %}}"', () => expect(Command.regex.test('{{% something %}}')).toBe(true));
// 		it('should not match any strings wrapped in "{{ }}"', () => expect(Command.regex.test('{{ something }}')).toBe(false));
// 		it('should not match any strings wrapped in "{{{ }}}"', () => expect(Command.regex.test('{{{ something }}}')).toBe(false));
// 		it('should match any strings wrapped in "{{% %}}" anywhere', () => expect(Command.regex.test('hello world {{% something %}} from this test')).toBe(true));
// 		// it('should capture the command and inner', () => {
// 		// 	var match, matches: string[][] = [];
// 		// 	while((match = Command.regex.exec('hello world {{% this is the command %}} and this is the inner')) != null){
// 		// 		console.log(match);
// 		// 		matches.push(match);
// 		// 	}
// 		// 	expect(matches).not.toBeNull();
// 		// 	expect(matches).not.toBeUndefined();
// 		// 	expect(matches[0]).not.toBeNull();
// 		// 	expect(matches[0]).not.toBeUndefined();
// 		// 	// expect(matches[0][1]).not.toBeNull();
// 		// 	// expect(matches[0][1]).toEqual(' this is the command ');
// 		// 	// expect(matches[0][2]).toEqual(' and this is the inner');
// 		// });
// 	});
// 	describe('instance', () => {
// 		let index = 5,
// 			statement = ' if something is not null ',
// 			inner = ' FirstName = {{ something }} ',
// 			variables: IVariables = {something: 'Dragon'},
// 			command: Command,
// 			length: number = `{{%${statement}%}}${inner}`.length; 
// 		beforeAll(() => command = new Command(index, length, statement, inner, variables));
// 		it('should store the index', () => expect(command.index).toEqual(5));
// 		it('should store the statement', () => expect(command.statement).toEqual(statement));
// 		it('should store the inner', () => expect(command.inner).toEqual(inner));
// 		it('should store the variables', () => expect(command.scope.variables).toEqual(variables));
// 	});
// 	describe('expect', () => {
// 		let index = 5,
// 			statement = ' if something is not null ',
// 			inner = ' FirstName = {{ something }} ',
// 			variables: IVariables = {something: 'Dragon'},
// 			command: Command,
// 			length: number = `{{%${statement}%}}${inner}`.length; 
// 		beforeAll(() => command = new Command(index, length, statement, inner, variables));
// 		it('should create the correct action', () => expect(command.extract(statement, inner, variables) instanceof If).toBe(true));
// 	});
// }); 

},{}],23:[function(require,module,exports){
// /// <reference path="../typings/tsd.d.ts" />
// import IVariables from '../src/IVariables';
// import Parser from '../src/Parser';
// import Command from '../src/Command';
// describe('Parser', () => {
// 	describe('instance', () => {
// 		var parser, 
// 			sql = "UPDATE Something SET {{% if myVar is not null %}} FirstName = {{ myVar }} {{% else %}} FirstName = 'Default' {{% endif %}} WHERE ID = 1",
// 			variables: IVariables = {myVar: 'Dragon'};
// 		beforeAll(() => parser = new Parser(sql, variables));
// 		it('should store the sql', () => expect(parser.sql).toEqual(sql));
// 		it('should store the variables', () => expect(parser.variables).toEqual(variables));
// 	});
// 	describe('extract', () => {
// 		var parser, 
// 			sql = "UPDATE Something SET {{% if myVar is not null %}} FirstName = {{ myVar }} {{% else %}} FirstName = 'Default' {{% endif %}} WHERE ID = 1",
// 			variables: IVariables = {myVar: 'Dragon'};
// 		beforeAll(() => parser = new Parser(sql, variables));
// 		it('should return a list of commands', () => expect(parser.extract(sql, variables)[0] instanceof Command).toBe(true));
// 		it('should contain the correct number of commands', () => expect(parser.extract(sql, variables).length).toEqual(1));
// 		it('should contain dependent commands', () => expect(parser.extract(sql, variables)[0].dependents[0] instanceof Command).toBe(true));
// 		it('should contain the correct number of dependent commands', () => expect(parser.extract(sql, variables)[0].dependents.length).toEqual(2));
// 	});
// }); 

},{}],24:[function(require,module,exports){
/// <reference path="../typings/tsd.d.ts" />
var Main_1 = require('../src/Main');
describe('The scenario', function () {
    describe('if action', function () {
        describe('is null condition', function () {
            var query = "UPDATE Names {{% if example is null %}} SET Name = 'Cow' {{% else %}} SET Name = '{{example}}' {{% endif %}} WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                expect(Main_1.parse(query, { penny: '12' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                expect(Main_1.parse(query, { example: '12' })).toEqual("UPDATE Names SET Name = '12'  WHERE Name = 'Awesome'");
            });
        });
        describe('is not null condition', function () {
            var query = "UPDATE Names {{% if example is not null %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                expect(Main_1.parse(query, { example: '12' })).toEqual("UPDATE Names SET Name = '12'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                expect(Main_1.parse(query, { penny: '14' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('is !null condition', function () {
            var query = "UPDATE Names {{% if example is !null %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                expect(Main_1.parse(query, { example: '12' })).toEqual("UPDATE Names SET Name = '12'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                expect(Main_1.parse(query, { penny: '14' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('= condition', function () {
            var query = "UPDATE Names {{% if example = 12 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                expect(Main_1.parse(query, { example: '12' })).toEqual("UPDATE Names SET Name = '12'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                expect(Main_1.parse(query, { example: '14' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('== condition', function () {
            var query = "UPDATE Names {{% if example == 12 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                expect(Main_1.parse(query, { example: '12' })).toEqual("UPDATE Names SET Name = '12'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                expect(Main_1.parse(query, { example: '14' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('=== condition', function () {
            var query = "UPDATE Names {{% if example === 12 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                expect(Main_1.parse(query, { example: '12' })).toEqual("UPDATE Names SET Name = '12'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                expect(Main_1.parse(query, { example: '14' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('!= condition', function () {
            var query = "UPDATE Names {{% if example != 12 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                expect(Main_1.parse(query, { example: '12' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                expect(Main_1.parse(query, { example: '14' })).toEqual("UPDATE Names SET Name = '14'  WHERE Name = 'Awesome'");
            });
        });
        describe('!== condition', function () {
            var query = "UPDATE Names {{% if example !== 12 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                expect(Main_1.parse(query, { example: '12' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                expect(Main_1.parse(query, { example: '14' })).toEqual("UPDATE Names SET Name = '14'  WHERE Name = 'Awesome'");
            });
        });
        describe('> condition', function () {
            var query = "UPDATE Names {{% if example > 12 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                expect(Main_1.parse(query, { example: '14' })).toEqual("UPDATE Names SET Name = '14'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                expect(Main_1.parse(query, { example: '12' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                expect(Main_1.parse(query, { example: '9' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('>= condition', function () {
            var query = "UPDATE Names {{% if example >= 12 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                expect(Main_1.parse(query, { example: '14' })).toEqual("UPDATE Names SET Name = '14'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                expect(Main_1.parse(query, { example: '12' })).toEqual("UPDATE Names SET Name = '12'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                expect(Main_1.parse(query, { example: '9' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('!> condition', function () {
            var query = "UPDATE Names {{% if example !> 12 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                expect(Main_1.parse(query, { example: '14' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                expect(Main_1.parse(query, { example: '12' })).toEqual("UPDATE Names SET Name = '12'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                expect(Main_1.parse(query, { example: '9' })).toEqual("UPDATE Names SET Name = '9'  WHERE Name = 'Awesome'");
            });
        });
        describe('!>= condition', function () {
            var query = "UPDATE Names {{% if example !>= 12 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                expect(Main_1.parse(query, { example: '14' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                expect(Main_1.parse(query, { example: '12' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                expect(Main_1.parse(query, { example: '9' })).toEqual("UPDATE Names SET Name = '9'  WHERE Name = 'Awesome'");
            });
        });
        describe('< condition', function () {
            var query = "UPDATE Names {{% if example < 12 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                expect(Main_1.parse(query, { example: '9' })).toEqual("UPDATE Names SET Name = '9'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                expect(Main_1.parse(query, { example: '12' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                expect(Main_1.parse(query, { example: '14' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('<= condition', function () {
            var query = "UPDATE Names {{% if example <= 12 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                expect(Main_1.parse(query, { example: '9' })).toEqual("UPDATE Names SET Name = '9'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                expect(Main_1.parse(query, { example: '12' })).toEqual("UPDATE Names SET Name = '12'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                expect(Main_1.parse(query, { example: '14' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('!< condition', function () {
            var query = "UPDATE Names {{% if example !< 12 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                expect(Main_1.parse(query, { example: '9' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                expect(Main_1.parse(query, { example: '12' })).toEqual("UPDATE Names SET Name = '12'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                expect(Main_1.parse(query, { example: '14' })).toEqual("UPDATE Names SET Name = '14'  WHERE Name = 'Awesome'");
            });
        });
        describe('!<= condition', function () {
            var query = "UPDATE Names {{% if example !<= 12 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                expect(Main_1.parse(query, { example: '9' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                expect(Main_1.parse(query, { example: '12' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                expect(Main_1.parse(query, { example: '14' })).toEqual("UPDATE Names SET Name = '14'  WHERE Name = 'Awesome'");
            });
        });
        describe('abc> condition', function () {
            var query = "UPDATE Names {{% if example abc> 'dragon' %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                expect(Main_1.parse(query, { example: 'hello' })).toEqual("UPDATE Names SET Name = 'hello'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                expect(Main_1.parse(query, { example: 'dragon' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                expect(Main_1.parse(query, { example: 'awkward' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('abc>= condition', function () {
            var query = "UPDATE Names {{% if example abc>= 'dragon' %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                expect(Main_1.parse(query, { example: 'hello' })).toEqual("UPDATE Names SET Name = 'hello'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                expect(Main_1.parse(query, { example: 'dragon' })).toEqual("UPDATE Names SET Name = 'dragon'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                expect(Main_1.parse(query, { example: 'awkward' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('!abc> condition', function () {
            var query = "UPDATE Names {{% if example !abc> 'dragon' %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                expect(Main_1.parse(query, { example: 'hello' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                expect(Main_1.parse(query, { example: 'dragon' })).toEqual("UPDATE Names SET Name = 'dragon'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                expect(Main_1.parse(query, { example: 'awkward' })).toEqual("UPDATE Names SET Name = 'awkward'  WHERE Name = 'Awesome'");
            });
        });
        describe('!abc>= condition', function () {
            var query = "UPDATE Names {{% if example !abc>= 'dragon' %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                expect(Main_1.parse(query, { example: 'hello' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                expect(Main_1.parse(query, { example: 'dragon' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                expect(Main_1.parse(query, { example: 'awkward' })).toEqual("UPDATE Names SET Name = 'awkward'  WHERE Name = 'Awesome'");
            });
        });
        describe('abc< condition', function () {
            var query = "UPDATE Names {{% if example abc< 'dragon' %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                expect(Main_1.parse(query, { example: 'awkward' })).toEqual("UPDATE Names SET Name = 'awkward'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                expect(Main_1.parse(query, { example: 'dragon' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                expect(Main_1.parse(query, { example: 'hello' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('abc<= condition', function () {
            var query = "UPDATE Names {{% if example abc<= 'dragon' %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                expect(Main_1.parse(query, { example: 'awkward' })).toEqual("UPDATE Names SET Name = 'awkward'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                expect(Main_1.parse(query, { example: 'dragon' })).toEqual("UPDATE Names SET Name = 'dragon'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                expect(Main_1.parse(query, { example: 'hello' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('!abc< condition', function () {
            var query = "UPDATE Names {{% if example !abc< 'dragon' %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                expect(Main_1.parse(query, { example: 'awkward' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                expect(Main_1.parse(query, { example: 'dragon' })).toEqual("UPDATE Names SET Name = 'dragon'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                expect(Main_1.parse(query, { example: 'hello' })).toEqual("UPDATE Names SET Name = 'hello'  WHERE Name = 'Awesome'");
            });
        });
        describe('!abc<= condition', function () {
            var query = "UPDATE Names {{% if example !abc<= 'dragon' %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                expect(Main_1.parse(query, { example: 'awkward' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                expect(Main_1.parse(query, { example: 'dragon' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                expect(Main_1.parse(query, { example: 'hello' })).toEqual("UPDATE Names SET Name = 'hello'  WHERE Name = 'Awesome'");
            });
        });
        describe('len> condition', function () {
            var query = "UPDATE Names {{% if example len> 6 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                expect(Main_1.parse(query, { example: 'palooza' })).toEqual("UPDATE Names SET Name = 'palooza'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                expect(Main_1.parse(query, { example: 'sqiggl' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                expect(Main_1.parse(query, { example: 'fun' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('len>= condition', function () {
            var query = "UPDATE Names {{% if example len>= 6 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                expect(Main_1.parse(query, { example: 'palooza' })).toEqual("UPDATE Names SET Name = 'palooza'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                expect(Main_1.parse(query, { example: 'sqiggl' })).toEqual("UPDATE Names SET Name = 'sqiggl'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                expect(Main_1.parse(query, { example: 'fun' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('!len> condition', function () {
            var query = "UPDATE Names {{% if example !len> 6 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                expect(Main_1.parse(query, { example: 'palooza' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                expect(Main_1.parse(query, { example: 'sqiggl' })).toEqual("UPDATE Names SET Name = 'sqiggl'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                expect(Main_1.parse(query, { example: 'fun' })).toEqual("UPDATE Names SET Name = 'fun'  WHERE Name = 'Awesome'");
            });
        });
        describe('!len>= condition', function () {
            var query = "UPDATE Names {{% if example !len>= 6 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                expect(Main_1.parse(query, { example: 'palooza' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                expect(Main_1.parse(query, { example: 'sqiggl' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                expect(Main_1.parse(query, { example: 'fun' })).toEqual("UPDATE Names SET Name = 'fun'  WHERE Name = 'Awesome'");
            });
        });
        describe('len< condition', function () {
            var query = "UPDATE Names {{% if example len< 6 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                expect(Main_1.parse(query, { example: 'fun' })).toEqual("UPDATE Names SET Name = 'fun'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                expect(Main_1.parse(query, { example: 'sqiggl' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                expect(Main_1.parse(query, { example: 'palooza' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('len<= condition', function () {
            var query = "UPDATE Names {{% if example len<= 6 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                expect(Main_1.parse(query, { example: 'fun' })).toEqual("UPDATE Names SET Name = 'fun'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                expect(Main_1.parse(query, { example: 'sqiggl' })).toEqual("UPDATE Names SET Name = 'sqiggl'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                expect(Main_1.parse(query, { example: 'palooza' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('!len< condition', function () {
            var query = "UPDATE Names {{% if example !len< 6 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                expect(Main_1.parse(query, { example: 'fun' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                expect(Main_1.parse(query, { example: 'sqiggl' })).toEqual("UPDATE Names SET Name = 'sqiggl'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                expect(Main_1.parse(query, { example: 'palooza' })).toEqual("UPDATE Names SET Name = 'palooza'  WHERE Name = 'Awesome'");
            });
        });
        describe('!len<= condition', function () {
            var query = "UPDATE Names {{% if example !len<= 6 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                expect(Main_1.parse(query, { example: 'fun' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal', function () {
                expect(Main_1.parse(query, { example: 'sqiggl' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                expect(Main_1.parse(query, { example: 'palooza' })).toEqual("UPDATE Names SET Name = 'palooza'  WHERE Name = 'Awesome'");
            });
        });
        describe('is NaN condition', function () {
            var query = "UPDATE Names {{% if example is NaN %}} SET Name = 'Cow' {{% else %}} SET Name = '{{example}}' {{% endif %}} WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                expect(Main_1.parse(query, { example: 'dragon' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                expect(Main_1.parse(query, { example: '12' })).toEqual("UPDATE Names SET Name = '12'  WHERE Name = 'Awesome'");
            });
        });
        describe('is not NaN condition', function () {
            var query = "UPDATE Names {{% if example is not NaN %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                expect(Main_1.parse(query, { example: '12' })).toEqual("UPDATE Names SET Name = '12'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                expect(Main_1.parse(query, { example: 'dragon' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('is !NaN condition', function () {
            var query = "UPDATE Names {{% if example is !NaN %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                expect(Main_1.parse(query, { example: '12' })).toEqual("UPDATE Names SET Name = '12'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                expect(Main_1.parse(query, { example: 'dragon' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('between condition', function () {
            var query = "UPDATE Names {{% if example 10><20 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                expect(Main_1.parse(query, { example: 15 })).toEqual("UPDATE Names SET Name = '15'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal to the low number', function () {
                expect(Main_1.parse(query, { example: 10 })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal to the high number', function () {
                expect(Main_1.parse(query, { example: 20 })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if below the low number', function () {
                expect(Main_1.parse(query, { example: 5 })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if above the high number', function () {
                expect(Main_1.parse(query, { example: 25 })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('!between condition', function () {
            var query = "UPDATE Names {{% if example 10>!<20 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                expect(Main_1.parse(query, { example: 15 })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal to the low number', function () {
                expect(Main_1.parse(query, { example: 10 })).toEqual("UPDATE Names SET Name = '10'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal to the high number', function () {
                expect(Main_1.parse(query, { example: 20 })).toEqual("UPDATE Names SET Name = '20'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if below the low number', function () {
                expect(Main_1.parse(query, { example: 5 })).toEqual("UPDATE Names SET Name = '5'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if above the high number', function () {
                expect(Main_1.parse(query, { example: 25 })).toEqual("UPDATE Names SET Name = '25'  WHERE Name = 'Awesome'");
            });
        });
        describe('between= condition', function () {
            var query = "UPDATE Names {{% if example 10>=<20 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                expect(Main_1.parse(query, { example: 15 })).toEqual("UPDATE Names SET Name = '15'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal to the low number', function () {
                expect(Main_1.parse(query, { example: 10 })).toEqual("UPDATE Names SET Name = '10'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if equal to the high number', function () {
                expect(Main_1.parse(query, { example: 20 })).toEqual("UPDATE Names SET Name = '20'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if below the low number', function () {
                expect(Main_1.parse(query, { example: 5 })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if above the high number', function () {
                expect(Main_1.parse(query, { example: 25 })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
    });
    describe('unless action', function () {
        describe('is null condition', function () {
            var query = "UPDATE Names {{% unless example is null %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endunless %}} WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                expect(Main_1.parse(query, { penny: '12' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                expect(Main_1.parse(query, { example: '12' })).toEqual("UPDATE Names SET Name = '12'  WHERE Name = 'Awesome'");
            });
        });
        describe('is not null condition', function () {
            var query = "UPDATE Names {{% unless example is not null %}} SET Name = 'Cow' {{% else %}} SET Name = '{{example}}' {{% endunless %}} WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                expect(Main_1.parse(query, { example: '12' })).toEqual("UPDATE Names SET Name = '12'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                expect(Main_1.parse(query, { penny: '14' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        describe('is !null condition', function () {
            var query = "UPDATE Names {{% unless example is !null %}} SET Name = 'Cow' {{% else %}} SET Name = '{{example}}' {{% endunless %}} WHERE Name = 'Awesome'";
            it('should provide a correct result if true', function () {
                expect(Main_1.parse(query, { example: '12' })).toEqual("UPDATE Names SET Name = '12'  WHERE Name = 'Awesome'");
            });
            it('should provide a correct result if false', function () {
                expect(Main_1.parse(query, { penny: '14' })).toEqual("UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'");
            });
        });
        // describe('= condition', () => {
        //     let query = `UPDATE Names {{% if example = 12 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
        //     it('should provide a correct result if true', () => {
        //         expect(parse(query, {example: '12'})).toEqual(`UPDATE Names SET Name = '12'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if false', () => {
        //         expect(parse(query, {example: '14'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        // });
        // describe('== condition', () => {
        //     let query = `UPDATE Names {{% if example == 12 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
        //     it('should provide a correct result if true', () => {
        //         expect(parse(query, {example: '12'})).toEqual(`UPDATE Names SET Name = '12'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if false', () => {
        //         expect(parse(query, {example: '14'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        // });
        // describe('=== condition', () => {
        //     let query = `UPDATE Names {{% if example === 12 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
        //     it('should provide a correct result if true', () => {
        //         expect(parse(query, {example: '12'})).toEqual(`UPDATE Names SET Name = '12'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if false', () => {
        //         expect(parse(query, {example: '14'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        // });
        // describe('!= condition', () => {
        //     let query = `UPDATE Names {{% if example != 12 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
        //     it('should provide a correct result if true', () => {
        //         expect(parse(query, {example: '12'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if false', () => {
        //         expect(parse(query, {example: '14'})).toEqual(`UPDATE Names SET Name = '14'  WHERE Name = 'Awesome'`);
        //     });
        // });
        // describe('!== condition', () => {
        //     let query = `UPDATE Names {{% if example !== 12 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
        //     it('should provide a correct result if true', () => {
        //         expect(parse(query, {example: '12'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if false', () => {
        //         expect(parse(query, {example: '14'})).toEqual(`UPDATE Names SET Name = '14'  WHERE Name = 'Awesome'`);
        //     });
        // });
        // describe('> condition', () => {
        //     let query = `UPDATE Names {{% if example > 12 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
        //     it('should provide a correct result if true', () => {
        //         expect(parse(query, {example: '14'})).toEqual(`UPDATE Names SET Name = '14'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if equal', () => {
        //         expect(parse(query, {example: '12'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if false', () => {
        //         expect(parse(query, {example: '9'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        // });
        // describe('>= condition', () => {
        //     let query = `UPDATE Names {{% if example >= 12 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
        //     it('should provide a correct result if true', () => {
        //         expect(parse(query, {example: '14'})).toEqual(`UPDATE Names SET Name = '14'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if equal', () => {
        //         expect(parse(query, {example: '12'})).toEqual(`UPDATE Names SET Name = '12'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if false', () => {
        //         expect(parse(query, {example: '9'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        // });
        // describe('!> condition', () => {
        //     let query = `UPDATE Names {{% if example !> 12 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
        //     it('should provide a correct result if true', () => {
        //         expect(parse(query, {example: '14'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if equal', () => {
        //         expect(parse(query, {example: '12'})).toEqual(`UPDATE Names SET Name = '12'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if false', () => {
        //         expect(parse(query, {example: '9'})).toEqual(`UPDATE Names SET Name = '9'  WHERE Name = 'Awesome'`);
        //     });
        // });
        // describe('!>= condition', () => {
        //     let query = `UPDATE Names {{% if example !>= 12 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
        //     it('should provide a correct result if true', () => {
        //         expect(parse(query, {example: '14'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if equal', () => {
        //         expect(parse(query, {example: '12'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if false', () => {
        //         expect(parse(query, {example: '9'})).toEqual(`UPDATE Names SET Name = '9'  WHERE Name = 'Awesome'`);
        //     });
        // });
        // describe('< condition', () => {
        //     let query = `UPDATE Names {{% if example < 12 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
        //     it('should provide a correct result if true', () => {
        //         expect(parse(query, {example: '9'})).toEqual(`UPDATE Names SET Name = '9'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if equal', () => {
        //         expect(parse(query, {example: '12'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if false', () => {
        //         expect(parse(query, {example: '14'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        // });
        // describe('<= condition', () => {
        //     let query = `UPDATE Names {{% if example <= 12 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
        //     it('should provide a correct result if true', () => {
        //         expect(parse(query, {example: '9'})).toEqual(`UPDATE Names SET Name = '9'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if equal', () => {
        //         expect(parse(query, {example: '12'})).toEqual(`UPDATE Names SET Name = '12'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if false', () => {
        //         expect(parse(query, {example: '14'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        // });
        // describe('!< condition', () => {
        //     let query = `UPDATE Names {{% if example !< 12 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
        //     it('should provide a correct result if true', () => {
        //         expect(parse(query, {example: '9'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if equal', () => {
        //         expect(parse(query, {example: '12'})).toEqual(`UPDATE Names SET Name = '12'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if false', () => {
        //         expect(parse(query, {example: '14'})).toEqual(`UPDATE Names SET Name = '14'  WHERE Name = 'Awesome'`);
        //     });
        // });
        // describe('!<= condition', () => {
        //     let query = `UPDATE Names {{% if example !<= 12 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
        //     it('should provide a correct result if true', () => {
        //         expect(parse(query, {example: '9'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if equal', () => {
        //         expect(parse(query, {example: '12'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if false', () => {
        //         expect(parse(query, {example: '14'})).toEqual(`UPDATE Names SET Name = '14'  WHERE Name = 'Awesome'`);
        //     });
        // });
        // describe('abc> condition', () => {
        //     let query = `UPDATE Names {{% if example abc> 'dragon' %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
        //     it('should provide a correct result if true', () => {
        //         expect(parse(query, {example: 'hello'})).toEqual(`UPDATE Names SET Name = 'hello'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if equal', () => {
        //         expect(parse(query, {example: 'dragon'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if false', () => {
        //         expect(parse(query, {example: 'awkward'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        // });
        // describe('abc>= condition', () => {
        //     let query = `UPDATE Names {{% if example abc>= 'dragon' %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
        //     it('should provide a correct result if true', () => {
        //         expect(parse(query, {example: 'hello'})).toEqual(`UPDATE Names SET Name = 'hello'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if equal', () => {
        //         expect(parse(query, {example: 'dragon'})).toEqual(`UPDATE Names SET Name = 'dragon'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if false', () => {
        //         expect(parse(query, {example: 'awkward'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        // });
        // describe('!abc> condition', () => {
        //     let query = `UPDATE Names {{% if example !abc> 'dragon' %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
        //     it('should provide a correct result if true', () => {
        //         expect(parse(query, {example: 'hello'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if equal', () => {
        //         expect(parse(query, {example: 'dragon'})).toEqual(`UPDATE Names SET Name = 'dragon'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if false', () => {
        //         expect(parse(query, {example: 'awkward'})).toEqual(`UPDATE Names SET Name = 'awkward'  WHERE Name = 'Awesome'`);
        //     });
        // });
        // describe('!abc>= condition', () => {
        //     let query = `UPDATE Names {{% if example !abc>= 'dragon' %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
        //     it('should provide a correct result if true', () => {
        //         expect(parse(query, {example: 'hello'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if equal', () => {
        //         expect(parse(query, {example: 'dragon'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if false', () => {
        //         expect(parse(query, {example: 'awkward'})).toEqual(`UPDATE Names SET Name = 'awkward'  WHERE Name = 'Awesome'`);
        //     });
        // });
        // describe('abc< condition', () => {
        //     let query = `UPDATE Names {{% if example abc< 'dragon' %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
        //     it('should provide a correct result if true', () => {
        //         expect(parse(query, {example: 'awkward'})).toEqual(`UPDATE Names SET Name = 'awkward'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if equal', () => {
        //         expect(parse(query, {example: 'dragon'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if false', () => {
        //         expect(parse(query, {example: 'hello'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        // });
        // describe('abc<= condition', () => {
        //     let query = `UPDATE Names {{% if example abc<= 'dragon' %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
        //     it('should provide a correct result if true', () => {
        //         expect(parse(query, {example: 'awkward'})).toEqual(`UPDATE Names SET Name = 'awkward'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if equal', () => {
        //         expect(parse(query, {example: 'dragon'})).toEqual(`UPDATE Names SET Name = 'dragon'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if false', () => {
        //         expect(parse(query, {example: 'hello'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        // });
        // describe('!abc< condition', () => {
        //     let query = `UPDATE Names {{% if example !abc< 'dragon' %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
        //     it('should provide a correct result if true', () => {
        //         expect(parse(query, {example: 'awkward'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if equal', () => {
        //         expect(parse(query, {example: 'dragon'})).toEqual(`UPDATE Names SET Name = 'dragon'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if false', () => {
        //         expect(parse(query, {example: 'hello'})).toEqual(`UPDATE Names SET Name = 'hello'  WHERE Name = 'Awesome'`);
        //     });
        // });
        // describe('!abc<= condition', () => {
        //     let query = `UPDATE Names {{% if example !abc<= 'dragon' %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
        //     it('should provide a correct result if true', () => {
        //         expect(parse(query, {example: 'awkward'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if equal', () => {
        //         expect(parse(query, {example: 'dragon'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if false', () => {
        //         expect(parse(query, {example: 'hello'})).toEqual(`UPDATE Names SET Name = 'hello'  WHERE Name = 'Awesome'`);
        //     });
        // });
        // describe('len> condition', () => {
        //     let query = `UPDATE Names {{% if example len> 6 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
        //     it('should provide a correct result if true', () => {
        //         expect(parse(query, {example: 'palooza'})).toEqual(`UPDATE Names SET Name = 'palooza'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if equal', () => {
        //         expect(parse(query, {example: 'sqiggl'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if false', () => {
        //         expect(parse(query, {example: 'fun'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        // });
        // describe('len>= condition', () => {
        //     let query = `UPDATE Names {{% if example len>= 6 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
        //     it('should provide a correct result if true', () => {
        //         expect(parse(query, {example: 'palooza'})).toEqual(`UPDATE Names SET Name = 'palooza'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if equal', () => {
        //         expect(parse(query, {example: 'sqiggl'})).toEqual(`UPDATE Names SET Name = 'sqiggl'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if false', () => {
        //         expect(parse(query, {example: 'fun'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        // });
        // describe('!len> condition', () => {
        //     let query = `UPDATE Names {{% if example !len> 6 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
        //     it('should provide a correct result if true', () => {
        //         expect(parse(query, {example: 'palooza'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if equal', () => {
        //         expect(parse(query, {example: 'sqiggl'})).toEqual(`UPDATE Names SET Name = 'sqiggl'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if false', () => {
        //         expect(parse(query, {example: 'fun'})).toEqual(`UPDATE Names SET Name = 'fun'  WHERE Name = 'Awesome'`);
        //     });
        // });
        // describe('!len>= condition', () => {
        //     let query = `UPDATE Names {{% if example !len>= 6 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
        //     it('should provide a correct result if true', () => {
        //         expect(parse(query, {example: 'palooza'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if equal', () => {
        //         expect(parse(query, {example: 'sqiggl'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if false', () => {
        //         expect(parse(query, {example: 'fun'})).toEqual(`UPDATE Names SET Name = 'fun'  WHERE Name = 'Awesome'`);
        //     });
        // });
        // describe('len< condition', () => {
        //     let query = `UPDATE Names {{% if example len< 6 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
        //     it('should provide a correct result if true', () => {
        //         expect(parse(query, {example: 'fun'})).toEqual(`UPDATE Names SET Name = 'fun'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if equal', () => {
        //         expect(parse(query, {example: 'sqiggl'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if false', () => {
        //         expect(parse(query, {example: 'palooza'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        // });
        // describe('len<= condition', () => {
        //     let query = `UPDATE Names {{% if example len<= 6 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
        //     it('should provide a correct result if true', () => {
        //         expect(parse(query, {example: 'fun'})).toEqual(`UPDATE Names SET Name = 'fun'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if equal', () => {
        //         expect(parse(query, {example: 'sqiggl'})).toEqual(`UPDATE Names SET Name = 'sqiggl'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if false', () => {
        //         expect(parse(query, {example: 'palooza'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        // });
        // describe('!len< condition', () => {
        //     let query = `UPDATE Names {{% if example !len< 6 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
        //     it('should provide a correct result if true', () => {
        //         expect(parse(query, {example: 'fun'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if equal', () => {
        //         expect(parse(query, {example: 'sqiggl'})).toEqual(`UPDATE Names SET Name = 'sqiggl'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if false', () => {
        //         expect(parse(query, {example: 'palooza'})).toEqual(`UPDATE Names SET Name = 'palooza'  WHERE Name = 'Awesome'`);
        //     });
        // });
        // describe('!len<= condition', () => {
        //     let query = `UPDATE Names {{% if example !len<= 6 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
        //     it('should provide a correct result if true', () => {
        //         expect(parse(query, {example: 'fun'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if equal', () => {
        //         expect(parse(query, {example: 'sqiggl'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if false', () => {
        //         expect(parse(query, {example: 'palooza'})).toEqual(`UPDATE Names SET Name = 'palooza'  WHERE Name = 'Awesome'`);
        //     });
        // });
        // describe('is NaN condition', () => {
        //     let query = `UPDATE Names {{% if example is NaN %}} SET Name = 'Cow' {{% else %}} SET Name = '{{example}}' {{% endif %}} WHERE Name = 'Awesome'`;
        //     it('should provide a correct result if true', () => {
        //         expect(parse(query, {example: 'dragon'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if false', () => {
        //         expect(parse(query, {example: '12'})).toEqual(`UPDATE Names SET Name = '12'  WHERE Name = 'Awesome'`);
        //     });
        // });
        // describe('is not NaN condition', () => {
        //     let query = `UPDATE Names {{% if example is not NaN %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
        //     it('should provide a correct result if true', () => {
        //         expect(parse(query, {example: '12'})).toEqual(`UPDATE Names SET Name = '12'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if false', () => {
        //         expect(parse(query, {example: 'dragon'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        // });
        // describe('is !NaN condition', () => {
        //     let query = `UPDATE Names {{% if example is !NaN %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
        //     it('should provide a correct result if true', () => {
        //         expect(parse(query, {example: '12'})).toEqual(`UPDATE Names SET Name = '12'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if false', () => {
        //         expect(parse(query, {example: 'dragon'})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        // });
        // describe('between condition', () => {
        //     let query = `UPDATE Names {{% if example 10><20 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
        //     it('should provide a correct result if true', () => {
        //         expect(parse(query, {example: 15})).toEqual(`UPDATE Names SET Name = '15'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if equal to the low number', () => {
        //         expect(parse(query, {example: 10})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if equal to the high number', () => {
        //         expect(parse(query, {example: 20})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if below the low number', () => {
        //         expect(parse(query, {example: 5})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if above the high number', () => {
        //         expect(parse(query, {example: 25})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        // });
        // describe('!between condition', () => {
        //     let query = `UPDATE Names {{% if example 10>!<20 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
        //     it('should provide a correct result if true', () => {
        //         expect(parse(query, {example: 15})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if equal to the low number', () => {
        //         expect(parse(query, {example: 10})).toEqual(`UPDATE Names SET Name = '10'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if equal to the high number', () => {
        //         expect(parse(query, {example: 20})).toEqual(`UPDATE Names SET Name = '20'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if below the low number', () => {
        //         expect(parse(query, {example: 5})).toEqual(`UPDATE Names SET Name = '5'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if above the high number', () => {
        //         expect(parse(query, {example: 25})).toEqual(`UPDATE Names SET Name = '25'  WHERE Name = 'Awesome'`);
        //     });
        // });
        // describe('between= condition', () => {
        //     let query = `UPDATE Names {{% if example 10>=<20 %}} SET Name = '{{example}}' {{% else %}} SET Name = 'Cow' {{% endif %}} WHERE Name = 'Awesome'`;
        //     it('should provide a correct result if true', () => {
        //         expect(parse(query, {example: 15})).toEqual(`UPDATE Names SET Name = '15'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if equal to the low number', () => {
        //         expect(parse(query, {example: 10})).toEqual(`UPDATE Names SET Name = '10'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if equal to the high number', () => {
        //         expect(parse(query, {example: 20})).toEqual(`UPDATE Names SET Name = '20'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if below the low number', () => {
        //         expect(parse(query, {example: 5})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        //     it('should provide a correct result if above the high number', () => {
        //         expect(parse(query, {example: 25})).toEqual(`UPDATE Names SET Name = 'Cow'  WHERE Name = 'Awesome'`);
        //     });
        // });
    });
    describe('"no commands"', function () {
        it('should succeed and have the expected output', function () {
            var sql = "UPDATE";
            expect(Main_1.parse(sql, null)).toEqual(sql);
        });
    });
    // describe('"missing dependent actions"', () => {
    //     beforeEach(() => spyOn(console, 'error'));
    //     it('should throw a syntax error if a dependent action is found without the needed preceeding action', () => {
    //         let sql = "UPDATE Students {{% else %}} SET FirstName = 'Scott'";
    //         expect(parse(sql, null)).toEqual(sql);
    //         expect(console.error).toHaveBeenCalled();
    //     });
    //     it('should throw a syntax error if a dependent action is found without the needed preceeding action', () => {
    //         let sql = "UPDATE Students {{% endif %}} SET FirstName = 'Scott'";
    //         expect(parse(sql, null)).toEqual(sql);
    //         expect(console.error).toHaveBeenCalled();
    //     });
    // });
    describe('"query with newlines"', function () {
        it('should accept newlines in queries', function () {
            var sql = "UPDATE Names \n{{% if example is not null %}}\nSET Name = '{{example}}'\n{{% else %}} SET Name = 'Cow' \n{{% endif %}}\nWHERE Name = 'Awesome'";
            var result = "UPDATE Names \nSET Name = 'Dragon'\nWHERE Name = 'Awesome'";
            expect(Main_1.parse(sql, { example: 'Dragon' })).toEqual(result);
        });
    });
    describe('"upper case commands"', function () {
        it('should succeed dispite letter case', function () {
            var sql = "UPDATE Names {{% IF example is NOT null %}} SET Name = '{{example}}' {{% Else %}} SET Name = 'Cow' {{% endIf %}} WHERE Name = 'Awesome'";
            var result = "UPDATE Names SET Name = 'Dragon'  WHERE Name = 'Awesome'";
            expect(Main_1.parse(sql, { example: 'Dragon' })).toEqual(result);
        });
    });
});

},{"../src/Main":5}],25:[function(require,module,exports){
/// <reference path="../../typings/tsd.d.ts" />
// import {Action, IActionDefinition, CommandResult} from '../../src/Actions';
// let testActionDefinition: IActionDefinition = {
//     regex: /^this\s+is\s+a\s+test/i,
//     conditions: [],
//     dependents: [],
//     terminator: false,
//     rule: (command, condition, prev): ActionResult => {
//         return new ActionResult(command.inner, true);
//     }
// }
// let testAction: Action = new Action(testActionDefinition);
// describe('An Action', () => {
//     it('should store it\'s definition', () => expect(testAction.definition).toEqual(testActionDefinition));
//     it('should match a statement with the correct text', () => expect(testAction.matches('this is a test')).toBe(true));
//     it('should not matcha a statement with the wrong text', () => expect(testAction.matches('something else')).toBe(false));
// }); 

},{}],26:[function(require,module,exports){
// /// <reference path="../../typings/tsd.d.ts" />
// import Else from '../../src/actions/Else';
// import Command from '../../src/Command';
// import IVariables from '../../src/IVariables';
// describe("Else", () => {
// 	describe('regex', () => {
// 		it('should have a query that matches else', () => expect(Else.regex.test('else')).toBe(true));
// 		it('should only match if "else" is first word', () => expect(Else.regex.test('nothing else')).toBe(false));
// 		it('should not match more than one "else" in the statement', () => expect('else something else something'.match(Else.regex).length).toEqual(1));
// 		it('should not match if "else" is not present', () => expect(Else.regex.test('there is no action')).toBe(false));
// 		it('should not match a word only starting with "else"', () => expect(Else.regex.test('elsell')).toBe(false));
// 		it('should not match a word containing "else"', () => expect(Else.regex.test('somelsething')).toBe(false));
// 	});
// 	describe('instance', () => {
// 		const index: number = 5, 
// 			statement = ' else ',
// 			inner = ' SET FirstName = {{something}} ',
// 			length: number = `{{%${statement}%}}${inner}`.length,
// 			variables: IVariables = {something: 'green'};
// 		let	command: Command,
// 			action: Else;
// 		beforeAll(() => {
// 			command = new Command(index, length, statement, inner, variables);
// 			action = new Else(command, statement, inner, variables);
// 		});
// 		it('should store the statement', () => expect(action.statement).toEqual(statement));
// 		it('should store the inner', () => expect(action.inner).toEqual(inner));
// 		it('should store the variables', () => expect(action.variables).toEqual(variables));
// 	});
// }); 

},{}],27:[function(require,module,exports){
// /// <reference path="../../typings/tsd.d.ts" />
// import EndIf from '../../src/actions/EndIf';
// import Command from '../../src/Command';
// import IVariables from '../../src/IVariables';
// describe("EndIf", () => {
// 	describe('regex', () => {
// 		it('should have a query that matches "endif"', () => expect(EndIf.regex.test('endif')).toBe(true));
// 		it('should only match if "endif" is first word', () => expect(EndIf.regex.test('nothing endif')).toBe(false));
// 		it('should not match more than one "endif" in the statement', () => expect('endif something endif something'.match(EndIf.regex).length).toEqual(1));
// 		it('should not match if "endif" is not present', () => expect(EndIf.regex.test('there is no action')).toBe(false));
// 		it('should not match a word only starting with "endif"', () => expect(EndIf.regex.test('endifll')).toBe(false));
// 		it('should not match a word containing "endif"', () => expect(EndIf.regex.test('somendifthing')).toBe(false));
// 	});
// 	describe('instance', () => {
// 		const index: number = 5, 
// 			statement = ' endif ',
// 			inner = ' WHERE FirstName = {{statement}} ',
// 			length: number = `{{%${statement}%}}${inner}`.length,
// 			variables: IVariables = {something: 'green'};
// 		let	command: Command,
// 			action: EndIf;
// 		beforeAll(() => {
// 			command = new Command(index, length, statement, inner, variables);
// 			action = new EndIf(command, statement, inner, variables);
// 		});
// 		it('should store the statement', () => expect(action.statement).toEqual(statement));
// 		it('should store the inner', () => expect(action.inner).toEqual(inner));
// 		it('should store the variables', () => expect(action.variables).toEqual(variables));
// 	});
// }); 

},{}],28:[function(require,module,exports){
// /// <reference path="../../typings/tsd.d.ts" />
// import If from '../../src/actions/If';
// import {IsNull} from '../../src/Conditions';
// import Command from '../../src/Command';
// import IVariables from '../../src/IVariables';
// describe("If", () => {
// 	describe('regex', () => {
// 		it('should have a query that matches if', () => expect(If.regex.test('if something is not null')).toBe(true));
// 		it('should only match if "if" is first word', () => expect(If.regex.test('nothing if something is not null')).toBe(false));
// 		it('should not match more than one "if" in the statement', () => expect('if something if something'.match(If.regex).length).toEqual(1));
// 		it('should not match if "if" is not present', () => expect(If.regex.test('there is no conditional')).toBe(false));
// 		it('should not match a word only starting with "if"', () => expect(If.regex.test('ifle something is not null')).toBe(false));
// 		it('should not match a word containing "if"', () => expect(If.regex.test('someifthing is not null')).toBe(false));
// 	});
// 	describe('instance', () => {
// 		const index: number = 5, 
// 			statement = ' if something is null ',
// 			inner = ' SET FirstName = {{something}} ',
// 			length: number = `{{%${statement}%}}${inner}`.length,
// 			variables: IVariables = {something: 'green'};
// 		let	command: Command,
// 			ifIsNotNull: If;
// 		beforeAll(() => {
// 			command = new Command(index, length, statement, inner, variables);
// 			ifIsNotNull = new If(command, statement, inner, variables);
// 		});
// 		it('should store the statement', () => expect(ifIsNotNull.statement).toEqual(statement));
// 		it('should store the inner', () => expect(ifIsNotNull.inner).toEqual(inner));
// 		it('should store the variables', () => expect(ifIsNotNull.variables).toEqual(variables));
// 		it('should correctly select the IsNull condition', () => expect(ifIsNotNull.extractCondition(ifIsNotNull.statement, ifIsNotNull.variables) instanceof IsNull).toBe(true));
// 	});
// }); 

},{}],29:[function(require,module,exports){
// /// <reference path="../../typings/tsd.d.ts" />
// import Equal from '../../src/conditions/Equal';
// import {Not, OrEqual} from '../../src/Modifiers';
// describe('Equal', () => {
//     describe('regex', () => {
//         it('should match a statement containing "="', () => expect(Equal.regex.test('something = 12')).toBe(true));
//         it('should match a statement containing "=" and a spot 1 modifier', () => expect(Equal.regex.test('something != 12')).toBe(true));
//         it('should match a statement containing "=" and a spot 2 modifier', () => expect(Equal.regex.test('something =! 12')).toBe(true));
//         it('should match a statement containing "=" and 2 modifiers', () => expect(Equal.regex.test('something !=! 12')).toBe(true));
//         it('should not match a statement missing "="', () => expect(Equal.regex.test('something missing equal symbol')).toBe(false));
// 		it('should match a statement containing "=" anywhere', () => expect(Equal.regex.test('something is = 12 something')).toBe(true));
// 		it('should not match a statement containing "=" but in the wrong order', () => expect(Equal.regex.test('something 12 =')).toBe(false));
//         it('should not match a statement missing a variable', () => expect(Equal.regex.test('= 12')).toBe(false));
//         it('should not match a statement missing a comparative', () => expect(Equal.regex.test('something =')).toBe(false));
// 		it('should capture a variable in the statement', () => expect('something !== 12'.match(Equal.regex)[1]).toEqual('something'));
//         it('should capture the first modifier in the statement', () => expect('something !== 12'.match(Equal.regex)[2]).toEqual('!'));
//         it('should capture the second modifier in the statement', () => expect('something !== 12'.match(Equal.regex)[3]).toEqual('='));
//         it('should capture a comparative in the statement', () => expect('something !== 12'.match(Equal.regex)[4]).toEqual('12'));
// 	});
// 	describe('instance', () => {
// 		let eqBare, eqNegated, eqDouble, eqFalse;
// 		beforeAll(() => {
//             eqBare = new Equal('something', {something: 'Dragon', blah: 'red'}, 'Dragon', null, null);
// 			eqNegated = new Equal('something', {something: 'Dragon', blah: 'red'}, 'Dragon', '!', null);
//             eqDouble = new Equal('something', {something: 'Dragon', blah: 'red'}, 'Dragon', '!', '=');
//             eqFalse = new Equal('something', {something: 'Dragon', blah: 'red'}, 'Spice', null, null);
// 		});
// 		it('should store the variable', () => expect(eqDouble.variable).toEqual('something'));
// 		it('should store the variables object', () => expect(eqDouble.variables).toEqual({something: 'Dragon', blah: 'red'}));
//         it('should store the comparative', () => expect(eqDouble.comparative).toEqual('Dragon'));
//         it('should store the first modifier', () => expect(eqDouble.modifiers[0]).toEqual(Not));
//         it('should store the second modifier', () => expect(eqDouble.modifiers[1]).toEqual(OrEqual));
// 		it('should provide a correct result', () => expect(eqBare.perform()).toBe(true));
//         it('should provide a correct modified result', () => expect(eqNegated.perform()).toBe(false));
//         it('should provide a correct double modified result', () => expect(eqDouble.perform()).toBe(false));
//         it('should also provide a correct result when variable is not equal', () => expect(eqFalse.perform()).toBe(false));
// 	});
// }); 

},{}],30:[function(require,module,exports){
// /// <reference path="../../typings/tsd.d.ts" />
// import GreaterThan from '../../src/conditions/GreaterThan';
// import {Not, OrEqual} from '../../src/Modifiers';
// describe('GreaterThan', () => {
//     describe('regex', () => {
//         it('should match a statement containing ">"', () => expect(GreaterThan.regex.test('something > 12')).toBe(true));
//         it('should match a statement containing ">" and a spot 1 modifier', () => expect(GreaterThan.regex.test('something !> 12')).toBe(true));
//         it('should match a statement containing ">" and a spot 2 modifier', () => expect(GreaterThan.regex.test('something >= 12')).toBe(true));
//         it('should match a statement containing ">" and 2 modifiers', () => expect(GreaterThan.regex.test('something !>= 12')).toBe(true));
//         it('should not match a statement missing ">"', () => expect(GreaterThan.regex.test('something missing greater than symbol')).toBe(false));
// 		it('should match a statement containing ">" anywhere', () => expect(GreaterThan.regex.test('something is > 12 something')).toBe(true));
// 		it('should not match a statement containing ">" but in the wrong order', () => expect(GreaterThan.regex.test('something 12 >')).toBe(false));
//         it('should not match a statement missing a variable', () => expect(GreaterThan.regex.test('> 12')).toBe(false));
//         it('should not match a statement missing a comparative', () => expect(GreaterThan.regex.test('something >')).toBe(false));
// 		it('should not match a statement containing ">" but with an extra ">"', () => expect(GreaterThan.regex.test('something >> 12')).toBe(false));
// 		it('should capture a variable in the statement', () => expect('something !>= 12'.match(GreaterThan.regex)[1]).toEqual('something'));
//         it('should capture the first modifier in the statement', () => expect('something !>= 12'.match(GreaterThan.regex)[2]).toEqual('!'));
//         it('should capture the second modifier in the statement', () => expect('something !>= 12'.match(GreaterThan.regex)[3]).toEqual('='));
//         it('should capture a comparator in the statement', () => expect('something !>= 12'.match(GreaterThan.regex)[4]).toEqual('12'));
// 	});
// 	describe('instance', () => {
// 		var gtBare, gtNegated, gtEqualed, gtDouble, gtFalse, gteFalse;
// 		beforeAll(() => {
// 			gtBare = new GreaterThan('something', {something: '14', blah: 'red'}, '12', null, null);
//             gtNegated = new GreaterThan('something', {something: '14', blah: 'red'}, '12', '!', null);
//             gtEqualed = new GreaterThan('something', {something: '14', blah: 'red'}, '14', null, '=');
//             gtDouble = new GreaterThan('something', {something: '14', blah: 'red'}, '14', '!', '=');
//             gtFalse = new GreaterThan('something', {something: '14', blah: 'red'}, '14', null, null);
//             gteFalse = new GreaterThan('something', {something: '14', blah: 'red'}, '20', null, '=');
// 		});
// 		it('should store the variable', () => expect(gtDouble.variable).toEqual('something'));
// 		it('should store the variables object', () => expect(gtDouble.variables).toEqual({something: '14', blah: 'red'}));
//         it('should store the comparative', () => expect(gtDouble.comparative).toEqual('14'));
//         it('should store the first modifier', () => expect(gtDouble.modifiers[0]).toEqual(Not));
//         it('should store the second modifier', () => expect(gtDouble.modifiers[1]).toEqual(OrEqual));
// 		it('should provide a correct result', () => expect(gtBare.perform()).toBe(true));
//         it('should provide a correct negated result', () => expect(gtNegated.perform()).toBe(false));
//         it('should provide a correct or-equal result', () => expect(gtEqualed.perform()).toBe(true));
//         it('should provide a correct double modified result', () => expect(gtDouble.perform()).toBe(false));
// 		it('should also provide a correct result when variable is not greater than', () => expect(gtFalse.perform()).toBe(false));
//         it('should also provide a correct result when variable is not greater than or equal', () => expect(gteFalse.perform()).toBe(false));
// 	});
// }); 

},{}],31:[function(require,module,exports){
// /// <reference path="../../typings/tsd.d.ts" />
// import IsNull from '../../src/conditions/IsNull';
// describe('IsNull', () => {
//     describe('regex', () => {
//         it('should match a statement containing "is null"', () => expect(IsNull.regex.test('something is null')).toBe(true));
//         it('should not match a statement missing "is null"', () => expect(IsNull.regex.test('something without the correct words')).toBe(false));
// 		it('should match a statement containing "is null" anywhere', () => expect(IsNull.regex.test('something is null something')).toBe(true));
// 		it('should not match a statement containing "is null" but in the wrong order', () => expect(IsNull.regex.test('something null is')).toBe(false));
// 		it('should not match a statement containing "is null" but with words in-between', () => expect(IsNull.regex.test('something is blah null')).toBe(false));
// 		it('should not match a statement containing "is null" but with extra letters on the words', () => expect(IsNull.regex.test('something iss nuull')).toBe(false));
// 		it('should capture a variable in the statement', () => expect('something is null'.match(IsNull.regex)[1]).toEqual('something'));
// 	});
// 	describe('instance', () => {
// 		var isNull;
// 		beforeAll(() => {
// 			isNull = new IsNull('something', {nothing: 'green', blah: 'red'}, null, null, null);
// 		});
// 		it('should store the variable', () => expect(isNull.variable).toEqual('something'));
// 		it('should store the variables object', () => expect(isNull.variables).toEqual({nothing: 'green', blah: 'red'}));
// 		it('should provide a correct result', () => expect(isNull.perform()).toBe(true));
// 		it('should also provide a correct result when variable is not null', () => {
// 			var otherIsNull = new IsNull('something', {something: 'green', blah: 'red'}, null, null, null);
// 			expect(otherIsNull.perform()).toBe(false);
// 		});
// 	});
// }); 

},{}],32:[function(require,module,exports){
// /// <reference path="../../typings/tsd.d.ts" />
// import LessThan from '../../src/conditions/LessThan';
// import {Not, OrEqual} from '../../src/Modifiers';
// describe('LessThan', () => {
//     describe('regex', () => {
//         it('should match a statement containing "<"', () => expect(LessThan.regex.test('something < 12')).toBe(true));
//         it('should match a statement containing "<" and a spot 1 modifier', () => expect(LessThan.regex.test('something !< 12')).toBe(true));
//         it('should match a statement containing "<" and a spot 2 modifier', () => expect(LessThan.regex.test('something <= 12')).toBe(true));
//         it('should match a statement containing "<" and 2 modifiers', () => expect(LessThan.regex.test('something !<= 12')).toBe(true));
//         it('should not match a statement missing "<"', () => expect(LessThan.regex.test('something missing less than symbol')).toBe(false));
// 		it('should match a statement containing "<" anywhere', () => expect(LessThan.regex.test('something is < 12 something')).toBe(true));
// 		it('should not match a statement containing "<" but in the wrong order', () => expect(LessThan.regex.test('something 12 <')).toBe(false));
//         it('should not match a statement missing a variable', () => expect(LessThan.regex.test('< 12')).toBe(false));
//         it('should not match a statement missing a comparative', () => expect(LessThan.regex.test('something <')).toBe(false));
// 		it('should not match a statement containing "<" but with an extra "<"', () => expect(LessThan.regex.test('something << 12')).toBe(false));
// 		it('should capture a variable in the statement', () => expect('something < 12'.match(LessThan.regex)[1]).toEqual('something'));
//         it('should capture the first modifier in the statement', () => expect('something !<= 12'.match(LessThan.regex)[2]).toEqual('!'));
//         it('should capture the second modifier in the statement', () => expect('something !<= 12'.match(LessThan.regex)[3]).toEqual('='));
//         it('should capture a comparator in the statement', () => expect('something < 12'.match(LessThan.regex)[4]).toEqual('12'));
// 	});
// 	describe('instance', () => {
// 		var ltBare, ltNegated, ltEqualed, ltDouble, ltFalse, lteFalse;
// 		beforeAll(() => {
// 			ltBare = new LessThan('something', {something: '9', blah: 'red'}, '12', null, null);
//             ltNegated = new LessThan('something', {something: '9', blah: 'red'}, '12', '!', null);
//             ltEqualed = new LessThan('something', {something: '9', blah: 'red'}, '9', null, '=');
//             ltDouble = new LessThan('something', {something: '9', blah: 'red'}, '9', '!', '=');
//             ltFalse = new LessThan('something', {something: '9', blah: 'red'}, '9', null, null);
//             lteFalse = new LessThan('something', {something: '9', blah: 'red'}, '6', null, '=');
// 		});
// 		it('should store the variable', () => expect(ltDouble.variable).toEqual('something'));
// 		it('should store the variables object', () => expect(ltDouble.variables).toEqual({something: '9', blah: 'red'}));
//         it('should store the comparative', () => expect(ltDouble.comparative).toEqual('9'));
//         it('should store the first modifier', () => expect(ltDouble.modifiers[0]).toEqual(Not));
//         it('should store the second modifier', () => expect(ltDouble.modifiers[1]).toEqual(OrEqual));
// 		it('should provide a correct result', () => expect(ltBare.perform()).toBe(true));
//         it('should provide a correct negated result', () => expect(ltNegated.perform()).toBe(false));
//         it('should provide a correct or-equal result', () => expect(ltEqualed.perform()).toBe(true));
//         it('should provide a correct double modified result', () => expect(ltDouble.perform()).toBe(false));
// 		it('should also provide a correct result when variable is not less than', () => expect(ltFalse.perform()).toBe(false));
//         it('should also provide a correct result when variable is not less than or equal', () => expect(lteFalse.perform()).toBe(false));
// 	});
// }); 

},{}],33:[function(require,module,exports){
// /// <reference path="../../typings/tsd.d.ts" />
// import Not from '../../src/modifiers/Not';
// describe('Not', () => {
//     describe('identifiers', () => {
//         it('should match "!"', () => expect(Not.matches('!')).toBe(true));
//         it('should match "not"', () => expect(Not.matches('not')).toBe(true));
//         it('should match " not"', () => expect(Not.matches(' not')).toBe(true));
//         it('should match "not "', () => expect(Not.matches('not ')).toBe(true));
//         it('should match " not "', () => expect(Not.matches(' not ')).toBe(true));
//         it('should match "NOT"', () => expect(Not.matches('NOT')).toBe(true));
//         it('should match "Not"', () => expect(Not.matches('Not')).toBe(true));
// 	});
//     describe('perfom', () => {
//         it('should negate the provided (true) result', () => expect(Not.perform(true, 'something', null, null)).toBe(false));
//         it('should negate the provided (false) result', () => expect(Not.perform(false, 'something', null, null)).toBe(true));
//     });
// }); 

},{}],34:[function(require,module,exports){
// /// <reference path="../../typings/tsd.d.ts" />
// import OrEqual from '../../src/modifiers/OrEqual';
// describe('OrEqual', () => {
//     describe('identifiers', () => {
//         it('should match "="', () => expect(OrEqual.matches('=')).toBe(true));
// 	});
//     describe('perfom', () => {
//         it('should recompare the variable and provide the correct result (true)', () => expect(OrEqual.perform(false, 'something', {something: '12'}, '12')).toBe(true));
//         it('should recompare the variable and provide the correct result (false)', () => expect(OrEqual.perform(false, 'something', {something: '12'}, '14')).toBe(false));
//         it('should not make the comparison if the provided result is true', () => expect(OrEqual.perform(true, 'something', {something: '14'}, '12')).toBe(true));
//     });
// }); 

},{}],35:[function(require,module,exports){
// /// <reference path="../../typings/tsd.d.ts" />
// import VariableReplacer from '../../src/replacers/VariableReplacer';
// import IVariables from '../../src/IVariables';
// describe('VariableReplacer', () => {
// 	describe('regex', () => {
// 		beforeEach(() => VariableReplacer.regex.lastIndex = 0);
// 		it('should match a double curly replacement', () => expect(VariableReplacer.regex.test('{{ something }}')).toBe(true));
// 		it('should not match a triple curly replacement', () => expect(VariableReplacer.regex.test('{{{ something }}}')).toBe(false));
// 		it('should not match something without curly brackets', () => expect(VariableReplacer.regex.test('(( something ))')).toBe(false));
// 	});
// 	const variables: IVariables = {something: 'Dragon', goblin: 'Chief'};
// 	describe('replace', () => {
// 		it('should replace a variable', () => expect(VariableReplacer.replace('{{ something }}', variables)).toEqual('Dragon'));
// 		it('should replace a variable in a string', () => expect(VariableReplacer.replace('this is a {{ something }}', variables)).toEqual('this is a Dragon'));
// 		it('should replace more than one variable in a string', () => expect(VariableReplacer.replace('this is a {{ something }} and this is a {{something}}', variables)).toEqual('this is a Dragon and this is a Dragon'));
// 		it('should replace more than one variable in a string', () => expect(VariableReplacer.replace('this is a {{ something }} and this is a {{something}}', variables)).toEqual('this is a Dragon and this is a Dragon'));
// 		it('should replace different variables in a string', () => expect(VariableReplacer.replace('this is a {{ something }} and this is a {{goblin}}', variables)).toEqual('this is a Dragon and this is a Chief'));
// 	});
// }); 

},{}]},{},[22,23,24,25,26,27,28,29,30,31,32,33,34,35])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQWN0aW9ucy50cyIsInNyYy9Db21tYW5kLnRzIiwic3JjL0V4cHJlc3Npb25zLnRzIiwic3JjL0V4dGVuc2lvbnMudHMiLCJzcmMvTWFpbi50cyIsInNyYy9Nb2RpZmllcnMudHMiLCJzcmMvUGFyc2Vycy50cyIsInNyYy9QbGFjZWhvbGRlcnMudHMiLCJzcmMvUmVwbGFjZXJzLnRzIiwic3JjL1J1bm5lcnMudHMiLCJzcmMvU2NvcGUudHMiLCJzcmMvVmFsdWUudHMiLCJzcmMvVmFsdWVUeXBlLnRzIiwic3JjL2FjdGlvbnMvQWN0aW9uLnRzIiwic3JjL2NvbW1hbmRzL0NvbW1hbmRSZXN1bHQudHMiLCJzcmMvZXhwcmVzc2lvbnMvRXhwcmVzc2lvbi50cyIsInNyYy9leHByZXNzaW9ucy9FeHByZXNzaW9uUmVzdWx0LnRzIiwic3JjL21vZGlmaWVycy9Nb2RpZmllci50cyIsInNyYy9wYXJzZXJzL1BhcnNlci50cyIsInNyYy9yZXBsYWNlcnMvUmVwbGFjZXIudHMiLCJzcmMvcnVubmVycy9SdW5uZXIudHMiLCJ0ZXN0cy9Db21tYW5kLnRlc3RzLnRzIiwidGVzdHMvUGFyc2VyLnRlc3RzLnRzIiwidGVzdHMvU2NlbmFyaW9zLnRlc3RzLnRzIiwidGVzdHMvYWN0aW9ucy9BY3Rpb24udGVzdHMudHMiLCJ0ZXN0cy9hY3Rpb25zL0Vsc2UudGVzdHMudHMiLCJ0ZXN0cy9hY3Rpb25zL0VuZElmLnRlc3RzLnRzIiwidGVzdHMvYWN0aW9ucy9JZi50ZXN0cy50cyIsInRlc3RzL2NvbmRpdGlvbnMvRXF1YWwudGVzdHMudHMiLCJ0ZXN0cy9jb25kaXRpb25zL0dyZWF0ZXJUaGFuLnRlc3RzLnRzIiwidGVzdHMvY29uZGl0aW9ucy9Jc051bGwudGVzdHMudHMiLCJ0ZXN0cy9jb25kaXRpb25zL0xlc3NUaGFuLnRlc3RzLnRzIiwidGVzdHMvbW9kaWZpZXJzL05vdC50ZXN0cy50cyIsInRlc3RzL21vZGlmaWVycy9PckVxdWFsLnRlc3RzLnRzIiwidGVzdHMvcmVwbGFjZXJzL1ZhcmlhYmxlUmVwbGFjZXIudGVzdHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNDQSw4QkFBMEIsMEJBQTBCLENBQUMsQ0FBQTtBQUNyRCx1QkFBbUIsa0JBQWtCLENBQUMsQ0FBQTtBQUV0Qyw0QkFBaUwsZUFBZSxDQUFDLENBQUE7QUFHak0sSUFBSSxlQUFlLEdBQXNCO0lBQ3JDLEtBQUssRUFBRSxjQUFjO0lBQ3JCLFdBQVcsRUFBRSxFQUFFO0lBQ2YsVUFBVSxFQUFFLEVBQUU7SUFDZCxVQUFVLEVBQUUsSUFBSTtJQUNoQixJQUFJLEVBQUUsVUFBQyxPQUFnQixFQUFFLElBQWM7UUFDbkMsT0FBTyxDQUFDLE1BQU0sR0FBRyxJQUFJLHVCQUFhLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN4RCxNQUFNLENBQUMsT0FBTyxDQUFDO0lBQ25CLENBQUM7Q0FDSixDQUFDO0FBQ1MsYUFBSyxHQUFHLElBQUksZ0JBQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUUvQyxJQUFJLGNBQWMsR0FBc0I7SUFDcEMsS0FBSyxFQUFFLGFBQWE7SUFDcEIsV0FBVyxFQUFFLEVBQUU7SUFDZixVQUFVLEVBQUUsRUFBRTtJQUNkLFVBQVUsRUFBRSxLQUFLO0lBQ2pCLElBQUksRUFBRSxVQUFDLE9BQWdCLEVBQUUsSUFBYztRQUNuQyxFQUFFLENBQUEsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO1lBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxJQUFJLHVCQUFhLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzFHLElBQUk7WUFBQyxPQUFPLENBQUMsTUFBTSxHQUFHLElBQUksdUJBQWEsQ0FBQyxFQUFFLEVBQUUs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QUN0Qyw2RUFBNkU7QUFDN0UsaUZBQWlGO0FBQ2pGLG1GQUFtRjtBQUNuRixtRkFBbUY7QUFDbkYscUZBQXFGO0FBQ3JGLGlGQUFpRjtBQUNqRixpRkFBaUY7QUFDakYsT0FBTztBQUVQLGlDQUFpQztBQUNqQyxnSUFBZ0k7QUFDaEksaUlBQWlJO0FBQ2pJLFVBQVU7QUFDVixNQUFNOzs7QUNsQk4sa0RBQWtEO0FBQ2xELHFEQUFxRDtBQUVyRCw4QkFBOEI7QUFDOUIsc0NBQXNDO0FBQ3RDLGlGQUFpRjtBQUNqRixPQUFPO0FBRVAsaUNBQWlDO0FBQ2pDLDRLQUE0SztBQUM1Syw4S0FBOEs7QUFDOUsscUtBQXFLO0FBQ3JLLFVBQVU7QUFDVixNQUFNOzs7QUNiTixrREFBa0Q7QUFDbEQsdUVBQXVFO0FBQ3ZFLGlEQUFpRDtBQUVqRCx1Q0FBdUM7QUFDdkMsNkJBQTZCO0FBQzdCLDREQUE0RDtBQUM1RCw0SEFBNEg7QUFDNUgsbUlBQW1JO0FBQ25JLHVJQUF1STtBQUN2SSxPQUFPO0FBRVAseUVBQXlFO0FBQ3pFLCtCQUErQjtBQUMvQiw2SEFBNkg7QUFDN0gsNkpBQTZKO0FBQzdKLDBOQUEwTjtBQUMxTiwwTkFBME47QUFDMU4sbU5BQW1OO0FBQ25OLE9BQU87QUFDUCxNQUFNIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCB7ZGVmYXVsdCBhcyBJQWN0aW9uRGVmaW5pdGlvbn0gZnJvbSAnLi9hY3Rpb25zL0lBY3Rpb25EZWZpbml0aW9uJztcbmltcG9ydCBDb21tYW5kUmVzdWx0IGZyb20gJy4vY29tbWFuZHMvQ29tbWFuZFJlc3VsdCc7XG5pbXBvcnQgQWN0aW9uIGZyb20gJy4vYWN0aW9ucy9BY3Rpb24nO1xuaW1wb3J0IENvbW1hbmQgZnJvbSAnLi9Db21tYW5kJztcbmltcG9ydCB7RXhwcmVzc2lvbiwgRXF1YWwsIEdyZWF0ZXJUaGFuLCBMZXNzVGhhbiwgSXNOdWxsLCBBbHBoYWJldGljYWxseUdyZWF0ZXJUaGFuLCBBbHBoYWJldGljYWxseUxlc3NUaGFuLCBMZW5ndGhHcmVhdGVyVGhhbiwgTGVuZ3RoTGVzc1RoYW4sIElzTmFOLCBCZXR3ZWVuLCBGb3JJblVzaW5nfSBmcm9tICcuL0V4cHJlc3Npb25zJztcbmltcG9ydCBTY29wZSBmcm9tICcuL1Njb3BlJztcblxubGV0IEVuZElmRGVmaW5pdGlvbjogSUFjdGlvbkRlZmluaXRpb24gPSB7XG4gICAgcmVnZXg6IC9eXFxzKmVuZGlmXFxiL2ksXG4gICAgZXhwcmVzc2lvbnM6IFtdLFxuICAgIGRlcGVuZGVudHM6IFtdLFxuICAgIHRlcm1pbmF0b3I6IHRydWUsXG4gICAgcnVsZTogKGNvbW1hbmQ6IENvbW1hbmQsIHByZXY/OiBDb21tYW5kKTogQ29tbWFuZCA9PiB7XG4gICAgICAgIGNvbW1hbmQucmVzdWx0ID0gbmV3IENvbW1hbmRSZXN1bHQoY29tbWFuZC5pbm5lciwgdHJ1ZSk7XG4gICAgICAgIHJldHVybiBjb21tYW5kO1xuICAgIH1cbn07XG5leHBvcnQgbGV0IEVuZElmID0gbmV3IEFjdGlvbihFbmRJZkRlZmluaXRpb24pO1xuXG5sZXQgRWxzZURlZmluaXRpb246IElBY3Rpb25EZWZpbml0aW9uID0ge1xuICAgIHJlZ2V4OiAvXlxccyplbHNlXFxiL2ksXG4gICAgZXhwcmVzc2lvbnM6IFtdLFxuICAgIGRlcGVuZGVudHM6IFtdLFxuICAgIHRlcm1pbmF0b3I6IGZhbHNlLFxuICAgIHJ1bGU6IChjb21tYW5kOiBDb21tYW5kLCBwcmV2PzogQ29tbWFuZCk6IENvbW1hbmQgPT4ge1xuICAgICAgICBpZighcHJldi5yZXN1bHQucGFzc2VkKSBjb21tYW5kLnJlc3VsdCA9IG5ldyBDb21tYW5kUmVzdWx0KGNvbW1hbmQuaW5uZXIgKyBjb21tYW5kLnNjb3BlLnBlcmZvcm0oKSwgdHJ1ZSk7XG4gICAgICAgIGVsc2UgY29tbWFuZC5yZXN1bHQgPSBuZXcgQ29tbWFuZFJlc3VsdCgnJywgZmFsc2UpO1xuICAgICAgICByZXR1cm4gY29tbWFuZDtcbiAgICB9XG59O1xuZXhwb3J0IGxldCBFbHNlID0gbmV3IEFjdGlvbihFbHNlRGVmaW5pdGlvbik7XG5cbmxldCBJZkRlZmluaXRpb246IElBY3Rpb25EZWZpbml0aW9uID0ge1xuICAgIHJlZ2V4OiAvXlxccyppZlxcYi9pLFxuICAgIGV4cHJlc3Npb25zOiBbRXF1YWwsIEdyZWF0ZXJUaGFuLCBMZXNzVGhhbiwgSXNOdWxsLCBBbHBoYWJldGljYWxseUdyZWF0ZXJUaGFuLCBBbHBoYWJldGljYWxseUxlc3NUaGFuLCBMZW5ndGhHcmVhdGVyVGhhbiwgTGVuZ3RoTGVzc1RoYW4sIElzTmFOLCBCZXR3ZWVuXSxcbiAgICBkZXBlbmRlbnRzOiBbRWxzZSwgRW5kSWZdLFxuICAgIHRlcm1pbmF0b3I6IGZhbHNlLFxuICAgIHJ1bGU6IChjb21tYW5kOiBDb21tYW5kLCBwcmV2PzogQ29tbWFuZCk6IENvbW1hbmQgPT4ge1xuICAgICAgICBpZihjb21tYW5kLmV4cHJlc3Npb24uZXZhbHVhdGUoY29tbWFuZCkpIHtcbiAgICAgICAgICAgIGNvbW1hbmQucmVzdWx0ID0gbmV3IENvbW1hbmRSZXN1bHQoY29tbWFuZC5pbm5lciArIGNvbW1hbmQuc2NvcGUucGVyZm9ybSgpICsgY29tbWFuZC50ZXJtaW5hdGUoKSwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBjb21tYW5kLnJlc3VsdCA9IG5ldyBDb21tYW5kUmVzdWx0KGNvbW1hbmQuZGVmZXIoZmFsc2UpLCBmYWxzZSk7XG4gICAgICAgIHJldHVybiBjb21tYW5kO1xuICAgIH0gXG59O1xuZXhwb3J0IGxldCBJZiA9IG5ldyBBY3Rpb24oSWZEZWZpbml0aW9uKTtcblxubGV0IEVuZFVubGVzc0RlZmluaXRpb246IElBY3Rpb25EZWZpbml0aW9uID0ge1xuICAgIHJlZ2V4OiAvXlxccyplbmR1bmxlc3NcXGIvaSxcbiAgICBleHByZXNzaW9uczogW10sXG4gICAgZGVwZW5kZW50czogW10sXG4gICAgdGVybWluYXRvcjogdHJ1ZSxcbiAgICBydWxlOiAoY29tbWFuZDogQ29tbWFuZCwgcHJldj86IENvbW1hbmQpOiBDb21tYW5kID0+IHtcbiAgICAgICAgY29tbWFuZC5yZXN1bHQgPSBuZXcgQ29tbWFuZFJlc3VsdChjb21tYW5kLmlubmVyLCB0cnVlKTtcbiAgICAgICAgcmV0dXJuIGNvbW1hbmQ7XG4gICAgfVxufVxuZXhwb3J0IGxldCBFbmRVbmxlc3MgPSBuZXcgQWN0aW9uKEVuZFVubGVzc0RlZmluaXRpb24pO1xuXG5sZXQgVW5sZXNzRGVmaW5pdGlvbjogSUFjdGlvbkRlZmluaXRpb24gPSB7XG4gICAgcmVnZXg6IC9eXFxzKnVubGVzc1xcYi9pLFxuICAgIGV4cHJlc3Npb25zOiBbRXF1YWwsIEdyZWF0ZXJUaGFuLCBMZXNzVGhhbiwgSXNOdWxsLCBBbHBoYWJldGljYWxseUdyZWF0ZXJUaGFuLCBBbHBoYWJldGljYWxseUxlc3NUaGFuLCBMZW5ndGhHcmVhdGVyVGhhbiwgTGVuZ3RoTGVzc1RoYW4sIElzTmFOLCBCZXR3ZWVuXSxcbiAgICBkZXBlbmRlbnRzOiBbRWxzZSwgRW5kVW5sZXNzXSxcbiAgICB0ZXJtaW5hdG9yOiBmYWxzZSxcbiAgICBydWxlOiAoY29tbWFuZDogQ29tbWFuZCwgcHJldj86IENvbW1hbmQpOiBDb21tYW5kID0+IHtcbiAgICAgICAgaWYoIWNvbW1hbmQuZXhwcmVzc2lvbi5ldmFsdWF0ZShjb21tYW5kKSl7XG4gICAgICAgICAgICBjb21tYW5kLnJlc3VsdCA9IG5ldyBDb21tYW5kUmVzdWx0KGNvbW1hbmQuaW5uZXIgKyBjb21tYW5kLnNjb3BlLnBlcmZvcm0oKSArIGNvbW1hbmQudGVybWluYXRlKCksIHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgY29tbWFuZC5yZXN1bHQgPSBuZXcgQ29tbWFuZFJlc3VsdChjb21tYW5kLmRlZmVyKGZhbHNlKSwgZmFsc2UpO1xuICAgICAgICByZXR1cm4gY29tbWFuZDtcbiAgICB9XG59XG5leHBvcnQgbGV0IFVubGVzcyA9IG5ldyBBY3Rpb24oVW5sZXNzRGVmaW5pdGlvbik7XG5cbmxldCBFbmRGb3JEZWZpbml0aW9uOiBJQWN0aW9uRGVmaW5pdGlvbiA9IHtcbiAgICByZWdleDogL15cXHMqZW5kZm9yXFxiL2ksXG4gICAgZXhwcmVzc2lvbnM6IFtdLFxuICAgIGRlcGVuZGVudHM6IFtdLFxuICAgIHRlcm1pbmF0b3I6IHRydWUsXG4gICAgcnVsZTogKGNvbW1hbmQ6IENvbW1hbmQsIHByZXY/OiBDb21tYW5kKTogQ29tbWFuZCA9PiB7XG4gICAgICAgIGNvbW1hbmQucmVzdWx0ID0gbmV3IENvbW1hbmRSZXN1bHQoY29tbWFuZC5pbm5lciwgdHJ1ZSk7XG4gICAgICAgIHJldHVybiBjb21tYW5kO1xuICAgIH1cbn1cbmV4cG9ydCBsZXQgRW5kRm9yID0gbmV3IEFjdGlvbihFbmRGb3JEZWZpbml0aW9uKTtcblxubGV0IEZvckRlZmluaXRpb246IElBY3Rpb25EZWZpbml0aW9uID0ge1xuICAgIHJlZ2V4OiAvXlxccypmb3JcXGIvaSxcbiAgICBleHByZXNzaW9uczogW0ZvckluVXNpbmddLFxuICAgIGRlcGVuZGVudHM6IFtFbmRGb3JdLFxuICAgIHRlcm1pbmF0b3I6IGZhbHNlLFxuICAgIHJ1bGU6IChjb21tYW5kOiBDb21tYW5kLCBwcmV2PzogQ29tbWFuZCk6IENvbW1hbmQgPT4ge1xuICAgICAgICBjb21tYW5kLnJlc3VsdCA9IG5ldyBDb21tYW5kUmVzdWx0KGNvbW1hbmQuZXhwcmVzc2lvbi5ldmFsdWF0ZShjb21tYW5kKSk7XG4gICAgICAgIHJldHVybiBjb21tYW5kO1xuICAgIH1cbn1cblxuZXhwb3J0IHtkZWZhdWx0IGFzIElBY3Rpb25EZWZpbml0aW9ufSBmcm9tICcuL2FjdGlvbnMvSUFjdGlvbkRlZmluaXRpb24nO1xuZXhwb3J0IHtkZWZhdWx0IGFzIEFjdGlvbn0gZnJvbSAnLi9hY3Rpb25zL0FjdGlvbic7IiwiaW1wb3J0IHtSdW5uZXJ9IGZyb20gJy4vUnVubmVycyc7XG5pbXBvcnQge0FjdGlvbn0gZnJvbSAnLi9BY3Rpb25zJztcbmltcG9ydCB7RXhwcmVzc2lvbn0gZnJvbSAnLi9FeHByZXNzaW9ucyc7XG5pbXBvcnQge01vZGlmaWVyfSBmcm9tICcuL01vZGlmaWVycyc7XG5pbXBvcnQge1JlcGxhY2VyfSBmcm9tICcuL1JlcGxhY2Vycyc7XG5pbXBvcnQgQ29tbWFuZFJlc3VsdCBmcm9tICcuL2NvbW1hbmRzL0NvbW1hbmRSZXN1bHQnO1xuaW1wb3J0IFNjb3BlIGZyb20gJy4vU2NvcGUnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb21tYW5kIHtcbiAgICBwdWJsaWMgZGVwZW5kZW50czogQ29tbWFuZFtdID0gW107XG4gICAgcHVibGljIGFjdGlvbjogQWN0aW9uO1xuICAgIHB1YmxpYyBleHByZXNzaW9uOiBFeHByZXNzaW9uO1xuICAgIHB1YmxpYyBtb2RpZmllcnM6IE1vZGlmaWVyW10gPSBbXTtcbiAgICBwdWJsaWMgcmVzdWx0OiBDb21tYW5kUmVzdWx0ID0gbmV3IENvbW1hbmRSZXN1bHQoJycsIGZhbHNlKTtcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgaW5kZXg6IG51bWJlciwgcHVibGljIGxlbmd0aDogbnVtYmVyLCBwdWJsaWMgc3RhdGVtZW50OiBzdHJpbmcsIHB1YmxpYyBpbm5lcjogc3RyaW5nLCBwdWJsaWMgc2NvcGU6IFNjb3BlLCBwcml2YXRlIHJ1bm5lcjogUnVubmVyKXtcbiAgICAgICAgbGV0IGFjdGlvbjogQWN0aW9uO1xuICAgICAgICBmb3IoYWN0aW9uIG9mIHJ1bm5lci5kZWZpbml0aW9uLmFjdGlvbnMpe1xuICAgICAgICAgICAgaWYoYWN0aW9uLm1hdGNoZXMoc3RhdGVtZW50KSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYWN0aW9uID0gYWN0aW9uO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBwZXJmb3JtKHByZXY/OiBDb21tYW5kKTogQ29tbWFuZCB7XG4gICAgICAgIHJldHVybiB0aGlzLnJ1bm5lci5wZXJmb3JtKHRoaXMsIHByZXYpO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgcmVwbGFjZShyZXBsYWNlcjogUmVwbGFjZXIpe1xuICAgICAgICB0aGlzLnJlc3VsdC50ZXh0ID0gcmVwbGFjZXIucmVwbGFjZSh0aGlzLnJlc3VsdC50ZXh0LCB0aGlzLnNjb3BlLnZhcmlhYmxlcyk7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBkZWZlcihwYXNzZWQ6IGJvb2xlYW4pOiBzdHJpbmcge1xuICAgICAgICBsZXQgZGVwZW5kZW50OkNvbW1hbmQsIHRleHQ6IHN0cmluZyA9ICcnO1xuICAgICAgICBmb3IoZGVwZW5kZW50IG9mIHRoaXMuZGVwZW5kZW50cyl7XG4gICAgICAgICAgICB0ZXh0ICs9IGRlcGVuZGVudC5wZXJmb3JtKHRoaXMpLnJlc3VsdC50ZXh0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0ZXh0O1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgdGVybWluYXRlKCk6IHN0cmluZ3tcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVwZW5kZW50cy5zb21lKGNvbW1hbmQgPT4gY29tbWFuZC5hY3Rpb24uZGVmaW5pdGlvbi50ZXJtaW5hdG9yKVxuXHRcdCAgPyB0aGlzLmRlcGVuZGVudHMuZmlsdGVyKGNvbW1hbmQgPT4gY29tbWFuZC5hY3Rpb24uZGVmaW5pdGlvbi50ZXJtaW5hdG9yKVswXS5wZXJmb3JtKCkucmVzdWx0LnRleHRcblx0XHQgIDogJyc7XG4gICAgfVxufSIsImltcG9ydCBJRXhwcmVzc2lvbkRlZmluaXRpb24gZnJvbSAnLi9leHByZXNzaW9ucy9JRXhwcmVzc2lvbkRlZmluaXRpb24nO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi9JVmFyaWFibGVzJztcbmltcG9ydCBFeHByZXNzaW9uIGZyb20gJy4vZXhwcmVzc2lvbnMvRXhwcmVzc2lvbic7XG5pbXBvcnQge05vdCwgT3JFcXVhbCwgTGVuZ3RoT3JFcXVhbCwgQmV0d2Vlbk9yRXF1YWx9IGZyb20gJy4vTW9kaWZpZXJzJztcbmltcG9ydCBWYWx1ZSBmcm9tICcuL1ZhbHVlJztcbmltcG9ydCBDb21tYW5kIGZyb20gJy4vQ29tbWFuZCc7XG5sZXQgRXF1YWxEZWZpbml0aW9uOiBJRXhwcmVzc2lvbkRlZmluaXRpb24gPSB7XG4gICAgdGVtcGxhdGU6ICcodikgKG0pPShtKSAodiknLFxuICAgIGl0ZW1zOiBbJ3ZhbHVlJywgW05vdCwgT3JFcXVhbF0sIFtPckVxdWFsXSwgJ3ZhbHVlJ10sXG4gICAgbW9kT3JkZXI6IFsxLDBdLFxuICAgIHJ1bGU6IChjb21tYW5kOiBDb21tYW5kLCB2YWx1ZXM6IFZhbHVlW10sIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IGJvb2xlYW4gPT4gdmFsdWVzWzBdLmV2YWx1YXRlKHZhcmlhYmxlcykgPT09IHZhbHVlc1sxXS5ldmFsdWF0ZSh2YXJpYWJsZXMpXG59XG5leHBvcnQgbGV0IEVxdWFsID0gbmV3IEV4cHJlc3Npb24oRXF1YWxEZWZpbml0aW9uKTtcblxubGV0IEdyZWF0ZXJUaGFuRGVmaW5pdGlvbjogSUV4cHJlc3Npb25EZWZpbml0aW9uID0ge1xuICAgIHRlbXBsYXRlOiAnKHYpIChtKT4obSkgKHYpJyxcbiAgICBpdGVtczogWyd2YWx1ZScsIFtOb3RdLCBbT3JFcXVhbF0sICd2YWx1ZSddLFxuICAgIG1vZE9yZGVyOiBbMSwwXSxcbiAgICBydWxlOiAoY29tbWFuZDogQ29tbWFuZCwgdmFsdWVzOiBWYWx1ZVtdLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBib29sZWFuID0+IHZhbHVlc1swXS5ldmFsdWF0ZSh2YXJpYWJsZXMpID4gdmFsdWVzWzFdLmV2YWx1YXRlKHZhcmlhYmxlcylcbn1cbmV4cG9ydCBsZXQgR3JlYXRlclRoYW4gPSBuZXcgRXhwcmVzc2lvbihHcmVhdGVyVGhhbkRlZmluaXRpb24pO1xuXG5sZXQgTGVzc1RoYW5EZWZpbml0aW9uOiBJRXhwcmVzc2lvbkRlZmluaXRpb24gPSB7XG4gICAgdGVtcGxhdGU6ICcodikgKG0pPChtKSAodiknLFxuICAgIGl0ZW1zOiBbJ3ZhbHVlJywgW05vdF0sIFtPckVxdWFsXSwgJ3ZhbHVlJ10sXG4gICAgbW9kT3JkZXI6IFsxLDBdLFxuICAgIHJ1bGU6IChjb21tYW5kOiBDb21tYW5kLCB2YWx1ZXM6IFZhbHVlW10sIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IGJvb2xlYW4gPT4gdmFsdWVzWzBdLmV2YWx1YXRlKHZhcmlhYmxlcykgPCB2YWx1ZXNbMV0uZXZhbHVhdGUodmFyaWFibGVzKVxufVxuZXhwb3J0IGxldCBMZXNzVGhhbiA9IG5ldyBFeHByZXNzaW9uKExlc3NUaGFuRGVmaW5pdGlvbik7XG5cbmxldCBJc051bGxEZWZpbml0aW9uOiBJRXhwcmVzc2lvbkRlZmluaXRpb24gPSB7XG4gICAgdGVtcGxhdGU6ICcodikgaXMgKG0pIG51bGwnLFxuICAgIGl0ZW1zOiBbJ3ZhbHVlJywgW05vdF1dLFxuICAgIG1vZE9yZGVyOiBbMF0sXG4gICAgcnVsZTogKGNvbW1hbmQ6IENvbW1hbmQsIHZhbHVlczogVmFsdWVbXSwgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogYm9vbGVhbiA9PiB2YWx1ZXNbMF0uZXZhbHVhdGUodmFyaWFibGVzKSA9PSBudWxsXG59XG5leHBvcnQgbGV0IElzTnVsbCA9IG5ldyBFeHByZXNzaW9uKElzTnVsbERlZmluaXRpb24pO1xuXG5sZXQgQWxwaGFiZXRpY2FsbHlHcmVhdGVyVGhhbkRlZmluaXRpb246IElFeHByZXNzaW9uRGVmaW5pdGlvbiA9IHtcbiAgICB0ZW1wbGF0ZTogJyh2KSAobSlhYmM+KG0pICh2KScsXG4gICAgaXRlbXM6IFsndmFsdWUnLCBbTm90XSwgW09yRXF1YWxdLCAndmFsdWUnXSxcbiAgICBtb2RPcmRlcjogWzEsMF0sXG4gICAgcnVsZTogKGNvbW1hbmQ6IENvbW1hbmQsIHZhbHVlczogVmFsdWVbXSwgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogYm9vbGVhbiA9PiBbdmFsdWVzWzBdLmV2YWx1YXRlKHZhcmlhYmxlcyksIHZhbHVlc1sxXS5ldmFsdWF0ZSh2YXJpYWJsZXMpXS5zb3J0KCkuaW5kZXhPZih2YWx1ZXNbMF0uZXZhbHVhdGUodmFyaWFibGVzKSkgPiAwXG59XG5leHBvcnQgbGV0IEFscGhhYmV0aWNhbGx5R3JlYXRlclRoYW4gPSBuZXcgRXhwcmVzc2lvbihBbHBoYWJldGljYWxseUdyZWF0ZXJUaGFuRGVmaW5pdGlvbik7XG5cbmxldCBBbHBoYWJldGljYWxseUxlc3NUaGFuRGVmaW5pdGlvbjogSUV4cHJlc3Npb25EZWZpbml0aW9uID0ge1xuICAgIHRlbXBsYXRlOiAnKHYpIChtKWFiYzwobSkgKHYpJyxcbiAgICBpdGVtczogWyd2YWx1ZScsIFtOb3RdLCBbT3JFcXVhbF0sICd2YWx1ZSddLFxuICAgIG1vZE9yZGVyOiBbMSwwXSxcbiAgICBydWxlOiAoY29tbWFuZDogQ29tbWFuZCwgdmFsdWVzOiBWYWx1ZVtdLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBib29sZWFuID0+IHZhbHVlc1swXS5ldmFsdWF0ZSh2YXJpYWJsZXMpID09PSB2YWx1ZXNbMV0uZXZhbHVhdGUodmFyaWFibGVzKSA/IGZhbHNlIDogW3ZhbHVlc1swXS5ldmFsdWF0ZSh2YXJpYWJsZXMpLCB2YWx1ZXNbMV0uZXZhbHVhdGUodmFyaWFibGVzKV0uc29ydCgpLmluZGV4T2YodmFsdWVzWzBdLmV2YWx1YXRlKHZhcmlhYmxlcykpID09PSAwXG59XG5leHBvcnQgbGV0IEFscGhhYmV0aWNhbGx5TGVzc1RoYW4gPSBuZXcgRXhwcmVzc2lvbihBbHBoYWJldGljYWxseUxlc3NUaGFuRGVmaW5pdGlvbik7XG5cbmxldCBMZW5ndGhHcmVhdGVyVGhhbkRlZmluaXRpb246IElFeHByZXNzaW9uRGVmaW5pdGlvbiA9IHtcbiAgICB0ZW1wbGF0ZTogJyh2KSAobSlsZW4+KG0pICh2KScsXG4gICAgaXRlbXM6IFsndmFsdWUnLCBbTm90XSwgW0xlbmd0aE9yRXF1YWxdLCAndmFsdWUnXSxcbiAgICBtb2RPcmRlcjogWzEsMF0sXG4gICAgcnVsZTogKGNvbW1hbmQ6IENvbW1hbmQsIHZhbHVlczogVmFsdWVbXSwgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogYm9vbGVhbiA9PiAoPHN0cmluZz52YWx1ZXNbMF0uZXZhbHVhdGUodmFyaWFibGVzKSkubGVuZ3RoID4gdmFsdWVzWzFdLmV2YWx1YXRlKHZhcmlhYmxlcylcbn1cbmV4cG9ydCBsZXQgTGVuZ3RoR3JlYXRlclRoYW4gPSBuZXcgRXhwcmVzc2lvbihMZW5ndGhHcmVhdGVyVGhhbkRlZmluaXRpb24pO1xuXG5sZXQgTGVuZ3RoTGVzc1RoYW5EZWZpbml0aW9uOiBJRXhwcmVzc2lvbkRlZmluaXRpb24gPSB7XG4gICAgdGVtcGxhdGU6ICcodikgKG0pbGVuPChtKSAodiknLFxuICAgIGl0ZW1zOiBbJ3ZhbHVlJywgW05vdF0sIFtMZW5ndGhPckVxdWFsXSwgJ3ZhbHVlJ10sXG4gICAgbW9kT3JkZXI6IFsxLDBdLFxuICAgIHJ1bGU6IChjb21tYW5kOiBDb21tYW5kLCB2YWx1ZXM6IFZhbHVlW10sIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IGJvb2xlYW4gPT4gKDxzdHJpbmc+dmFsdWVzWzBdLmV2YWx1YXRlKHZhcmlhYmxlcykpLmxlbmd0aCA8IHZhbHVlc1sxXS5ldmFsdWF0ZSh2YXJpYWJsZXMpXG59XG5leHBvcnQgbGV0IExlbmd0aExlc3NUaGFuID0gbmV3IEV4cHJlc3Npb24oTGVuZ3RoTGVzc1RoYW5EZWZpbml0aW9uKTtcblxubGV0IElzTmFORGVmaW5pdGlvbjogSUV4cHJlc3Npb25EZWZpbml0aW9uID0ge1xuICAgIHRlbXBsYXRlOiAnKHYpIGlzIChtKU5hTicsXG4gICAgaXRlbXM6IFsndmFsdWUnLCBbTm90XV0sXG4gICAgbW9kT3JkZXI6IFswXSxcbiAgICBydWxlOiAoY29tbWFuZDogQ29tbWFuZCwgdmFsdWVzOiBWYWx1ZVtdLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBib29sZWFuID0+IGlzTmFOKCg8bnVtYmVyPnZhbHVlc1swXS5ldmFsdWF0ZSh2YXJpYWJsZXMpKSlcbn1cbmV4cG9ydCBsZXQgSXNOYU4gPSBuZXcgRXhwcmVzc2lvbihJc05hTkRlZmluaXRpb24pO1xuXG5sZXQgQmV0d2VlbkRlZmluaXRpb246IElFeHByZXNzaW9uRGVmaW5pdGlvbiA9IHtcbiAgICB0ZW1wbGF0ZTogJyh2KSAodik+KG0pPCh2KScsXG4gICAgaXRlbXM6IFsndmFsdWUnLCAndmFsdWUnLCBbTm90LCBCZXR3ZWVuT3JFcXVhbF0sICd2YWx1ZSddLFxuICAgIG1vZE9yZGVyOiBbMF0sXG4gICAgcnVsZTogKGNvbW1hbmQ6IENvbW1hbmQsIHZhbHVlczogVmFsdWVbXSwgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogYm9vbGVhbiA9PiB2YWx1ZXNbMV0uZXZhbHVhdGUodmFyaWFibGVzKSA8IHZhbHVlc1swXS5ldmFsdWF0ZSh2YXJpYWJsZXMpICYmIHZhbHVlc1syXS5ldmFsdWF0ZSh2YXJpYWJsZXMpID4gdmFsdWVzWzBdLmV2YWx1YXRlKHZhcmlhYmxlcykgXG59XG5leHBvcnQgbGV0IEJldHdlZW4gPSBuZXcgRXhwcmVzc2lvbihCZXR3ZWVuRGVmaW5pdGlvbik7XG5cbmxldCBGb3JJblVzaW5nRGVmaW5pdGlvbjogSUV4cHJlc3Npb25EZWZpbml0aW9uID0ge1xuICAgIHRlbXBsYXRlOiAnKHYpIGluIChjKSB1c2luZyAoaiknLFxuICAgIGl0ZW1zOiBbJ3ZhbHVlJywgJ2NvbGxlY3Rpb24nLCAnam9pbmVyJ10sXG4gICAgbW9kT3JkZXI6IFtdLFxuICAgIHJ1bGU6IChjb21tYW5kOiBDb21tYW5kLCB2YWx1ZXM6IFZhbHVlW10sIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IHN0cmluZyA9PiB7XG4gICAgICAgIGxldCBpPTAsIHJlc3VsdCA9ICcnO1xuICAgICAgICBmb3IoaT0wO2k8KDxhbnlbXT52YWx1ZXNbMV0uZXZhbHVhdGUodmFyaWFibGVzKSkubGVuZ3RoO2krKyl7XG4gICAgICAgICAgICB2YXJpYWJsZXNbPHN0cmluZz52YWx1ZXNbMF0udmFsdWVdID0gdmFsdWVzWzFdLmV2YWx1YXRlKHZhcmlhYmxlcylbaV07XG4gICAgICAgICAgICByZXN1bHQgKz0gYCR7Y29tbWFuZC5zY29wZS5wZXJmb3JtKCl9YFxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxufVxuZXhwb3J0IGxldCBGb3JJblVzaW5nID0gbmV3IEV4cHJlc3Npb24oRm9ySW5Vc2luZ0RlZmluaXRpb24pO1xuXG5leHBvcnQge2RlZmF1bHQgYXMgRXhwcmVzc2lvbn0gZnJvbSAnLi9leHByZXNzaW9ucy9FeHByZXNzaW9uJztcbiIsImludGVyZmFjZSBBcnJheTxUPntcblx0bGFzdCgpOiBUO1xuICAgIGlzRnVsbCgpOiBib29sZWFuO1xuICAgIGNvbnRhaW5zKFQpOiBib29sZWFuO1xufVxuQXJyYXkucHJvdG90eXBlLmxhc3QgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gdGhpc1t0aGlzLmxlbmd0aC0xXTtcbn1cblxuQXJyYXkucHJvdG90eXBlLmlzRnVsbCA9IGZ1bmN0aW9uKCl7XG4gICAgZm9yKGxldCBpPTA7aTx0aGlzLmxlbmd0aDtpKyspe1xuICAgICAgICBpZihpID09IG51bGwpIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5cbkFycmF5LnByb3RvdHlwZS5jb250YWlucyA9IGZ1bmN0aW9uKFQpe1xuICAgIHJldHVybiB0aGlzLnNvbWUoeCA9PiB4ID09PSBUKTtcbn0iLCJpbXBvcnQge1NRaWdnTFBhcnNlcn0gZnJvbSAnLi9QYXJzZXJzJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4vSVZhcmlhYmxlcyc7XG4vKipcbiAqIFRoZSBzdGFydGluZyBwb2ludCBvZiB0aGUgZW50aXJlIFNRaWdnTCBwYXJzZXJcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IHNxbCAgICAgICAgICAgICAgLSBUaGUgU1FMIHF1ZXJ5IHRvIHJ1biBTUWlnZ0wgYWdhaW5zdFxuICogQHBhcmFtIHtJVmFyaWFibGVzP30gdmFyaWFibGVzICAgLSBPcHRpb25hbCBjb2xsZWN0aW9uIG9mIHZhcmlhYmxlcyBmb3IgeW91ciBTUWlnZ0wgcXVlcnlcbiAqIEByZXR1cm4ge3N0cmluZ30gICAgICAgICAgICAgICAgIC0gVGhlIGZ1bGx5IHBhcnNlZCBTUUwgcXVlcnlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlKHNxbDogc3RyaW5nLCB2YXJpYWJsZXM/OiBJVmFyaWFibGVzKTogc3RyaW5ne1xuXHRTUWlnZ0xQYXJzZXIucGFyc2Uoc3FsLCB2YXJpYWJsZXMpO1xuICAgIHJldHVybiBTUWlnZ0xQYXJzZXIucGVyZm9ybSgpO1xufSIsImltcG9ydCBJTW9kaWZpZXJEZWZpbml0aW9uIGZyb20gJy4vbW9kaWZpZXJzL0lNb2RpZmllckRlZmluaXRpb24nO1xuaW1wb3J0IE1vZGlmaWVyIGZyb20gJy4vbW9kaWZpZXJzL01vZGlmaWVyJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4vSVZhcmlhYmxlcyc7XG5pbXBvcnQgVmFsdWUgZnJvbSAnLi9WYWx1ZSc7XG5cbmxldCBOb3REZWZpbml0aW9uOiBJTW9kaWZpZXJEZWZpbml0aW9uID0ge1xuICAgIGlkZW50aWZpZXJzOiBbLyEvaSwgLyg/OlxcYnxcXHMrKW5vdCg/OlxcYnxcXHMrKS9pXSxcbiAgICBydWxlOiAocGFzczogYm9vbGVhbiwgdmFsdWVzOiBWYWx1ZVtdLCB2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBib29sZWFuID0+ICFwYXNzXG59XG5leHBvcnQgbGV0IE5vdCA9IG5ldyBNb2RpZmllcihOb3REZWZpbml0aW9uKTtcblxubGV0IE9yRXF1YWxEZWZpbml0aW9uOiBJTW9kaWZpZXJEZWZpbml0aW9uID0ge1xuICAgIGlkZW50aWZpZXJzOiBbLz0vaV0sXG4gICAgcnVsZTogKHBhc3M6IGJvb2xlYW4sIHZhbHVlczogVmFsdWVbXSwgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogYm9vbGVhbiA9PiBwYXNzIHx8IHZhbHVlc1swXS5ldmFsdWF0ZSh2YXJpYWJsZXMpID09PSB2YWx1ZXNbMV0uZXZhbHVhdGUodmFyaWFibGVzKVxufVxuZXhwb3J0IGxldCBPckVxdWFsID0gbmV3IE1vZGlmaWVyKE9yRXF1YWxEZWZpbml0aW9uKTtcblxubGV0IExlbmd0aE9yRXF1YWxEZWZpbml0aW9uOiBJTW9kaWZpZXJEZWZpbml0aW9uID0ge1xuICAgIGlkZW50aWZpZXJzOiBbLz0vaV0sXG4gICAgcnVsZTogKHBhc3M6IGJvb2xlYW4sIHZhbHVlczogVmFsdWVbXSwgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogYm9vbGVhbiA9PiBwYXNzIHx8ICg8c3RyaW5nPnZhbHVlc1swXS5ldmFsdWF0ZSh2YXJpYWJsZXMpKS5sZW5ndGggPT09IHZhbHVlc1sxXS5ldmFsdWF0ZSh2YXJpYWJsZXMpXG59XG5leHBvcnQgbGV0IExlbmd0aE9yRXF1YWwgPSBuZXcgTW9kaWZpZXIoTGVuZ3RoT3JFcXVhbERlZmluaXRpb24pO1xuXG5sZXQgQmV0d2Vlbk9yRXF1YWxEZWZpbml0aW9uOiBJTW9kaWZpZXJEZWZpbml0aW9uID0ge1xuICAgIGlkZW50aWZpZXJzOiBbLz0vaV0sXG4gICAgcnVsZTogKHBhc3M6IGJvb2xlYW4sIHZhbHVlczogVmFsdWVbXSwgdmFyaWFibGVzOiBJVmFyaWFibGVzKTogYm9vbGVhbiA9PiBwYXNzIHx8IHZhbHVlc1swXS5ldmFsdWF0ZSh2YXJpYWJsZXMpID09PSB2YWx1ZXNbMV0uZXZhbHVhdGUodmFyaWFibGVzKSB8fCB2YWx1ZXNbMF0uZXZhbHVhdGUodmFyaWFibGVzKSA9PT0gdmFsdWVzWzJdLmV2YWx1YXRlKHZhcmlhYmxlcylcbn1cbmV4cG9ydCBsZXQgQmV0d2Vlbk9yRXF1YWwgPSBuZXcgTW9kaWZpZXIoQmV0d2Vlbk9yRXF1YWxEZWZpbml0aW9uKTtcblxuZXhwb3J0IHtkZWZhdWx0IGFzIElNb2RpZmllckRlZmluaXRpb259IGZyb20gJy4vbW9kaWZpZXJzL0lNb2RpZmllckRlZmluaXRpb24nO1xuZXhwb3J0IHtkZWZhdWx0IGFzIE1vZGlmaWVyfSBmcm9tICcuL21vZGlmaWVycy9Nb2RpZmllcic7ICIsImltcG9ydCBJUGFyc2VyRGVmaW5pdGlvbiBmcm9tICcuL3BhcnNlcnMvSVBhcnNlckRlZmluaXRpb24nO1xuaW1wb3J0IFBhcnNlciBmcm9tICcuL3BhcnNlcnMvUGFyc2VyJztcbmltcG9ydCB7UnVubmVyLCBBY3Rpb25SdW5uZXJ9IGZyb20gJy4vUnVubmVycyc7XG5cbmxldCBTUWlnZ0xQYXJzZXJEZWZpbml0aW9uOiBJUGFyc2VyRGVmaW5pdGlvbiA9IHtcbiAgICBydW5uZXJzOiBbQWN0aW9uUnVubmVyXVxufVxuZXhwb3J0IGxldCBTUWlnZ0xQYXJzZXIgPSBuZXcgUGFyc2VyKFNRaWdnTFBhcnNlckRlZmluaXRpb24pOyBcblxuZXhwb3J0IHtkZWZhdWx0IGFzIElQYXJzZXJEZWZpbml0aW9ufSBmcm9tICcuL3BhcnNlcnMvSVBhcnNlckRlZmluaXRpb24nOyIsImltcG9ydCBJUGxhY2Vob2xkZXIgZnJvbSAnLi9wbGFjZWhvbGRlcnMvSVBsYWNlaG9sZGVyJztcbmltcG9ydCB7TW9kaWZpZXJ9IGZyb20gJy4vTW9kaWZpZXJzJztcbmV4cG9ydCBsZXQgUGxhY2Vob2xkZXJzOiBJUGxhY2Vob2xkZXJbXSA9IFtcbiAgICB7XG4gICAgICAgIG5hbWU6ICd2YWx1ZScsXG4gICAgICAgIGxvY2F0b3I6IC9cXCh2XFwpL2ksXG4gICAgICAgIHJlcGxhY2VtZW50OiAoKSA9PiBgKCg/OlwifCcpP1tcXFxcd1xcXFxkXSsoPzpcInwnKT8pYFxuICAgIH0sXG4gICAge1xuICAgICAgICBuYW1lOiAnbW9kaWZpZXInLFxuICAgICAgICBsb2NhdG9yOiAvXFwobVxcKS9pLFxuICAgICAgICByZXBsYWNlbWVudDogKGl0ZW0/OiBNb2RpZmllcltdKSA9PiBgKCg/OiR7aXRlbS5tYXAobW9kaWZpZXIgPT4gbW9kaWZpZXIuZGVmaW5pdGlvbi5pZGVudGlmaWVycy5tYXAoaWRlbnRpZmllciA9PiBpZGVudGlmaWVyLnNvdXJjZSkuam9pbignfCcpKS5qb2luKCd8Jyl9fFxcXFxzKikpYFxuICAgIH0sXG4gICAge1xuICAgICAgICBuYW1lOiAnY29sbGVjdGlvbicsXG4gICAgICAgIGxvY2F0b3I6IC9cXChjXFwpL2ksXG4gICAgICAgIHJlcGxhY2VtZW50OiAoKSA9PiBgKFtcXFxcd1xcXFxkXSspYCxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgbmFtZTogJ2pvaW5lcicsXG4gICAgICAgIGxvY2F0b3I6IC9cXChqXFwpL2ksXG4gICAgICAgIHJlcGxhY2VtZW50OiAoKSA9PiBgKC4rKWBcbiAgICB9XG5dO1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gUGxhY2Vob2xkZXIobmFtZTogc3RyaW5nKXtcbiAgICByZXR1cm4gUGxhY2Vob2xkZXJzLmZpbHRlcih4ID0+IHgubmFtZSA9PT0gbmFtZSlbMF07XG59IiwiaW1wb3J0IElSZXBsYWNlckRlZmluaXRpb24gZnJvbSAnLi9yZXBsYWNlcnMvSVJlcGxhY2VyRGVmaW5pdGlvbic7XG5pbXBvcnQgUmVwbGFjZXIgZnJvbSAnLi9yZXBsYWNlcnMvUmVwbGFjZXInO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi9JVmFyaWFibGVzJztcblxubGV0IFZhcmlhYmxlRGVmaW5pdGlvbjogSVJlcGxhY2VyRGVmaW5pdGlvbiA9IHtcbiAgICByZWdleDogLyhbXntdfF4pe3soPyF7KVxccyooXFx3KilcXHMqfX0oPyF9KS9nLFxuICAgIHJ1bGU6IChkZWZpbml0aW9uOiBJUmVwbGFjZXJEZWZpbml0aW9uLCB0ZXh0OiBzdHJpbmcsIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IHN0cmluZyA9PiB0ZXh0LnJlcGxhY2UoZGVmaW5pdGlvbi5yZWdleCwgKG1hdGNoLCAkMSwgJDIpID0+ICQxK3ZhcmlhYmxlc1skMl0pXG59XG5leHBvcnQgbGV0IFZhcmlhYmxlID0gbmV3IFJlcGxhY2VyKFZhcmlhYmxlRGVmaW5pdGlvbik7XG5cbmV4cG9ydCB7ZGVmYXVsdCBhcyBJUmVwbGFjZXJEZWZpbml0aW9ufSBmcm9tICcuL3JlcGxhY2Vycy9JUmVwbGFjZXJEZWZpbml0aW9uJztcbmV4cG9ydCB7ZGVmYXVsdCBhcyBSZXBsYWNlcn0gZnJvbSAnLi9yZXBsYWNlcnMvUmVwbGFjZXInOyIsImltcG9ydCBJUnVubmVyRGVmaW5pdGlvbiBmcm9tICcuL3J1bm5lcnMvSVJ1bm5lckRlZmluaXRpb24nO1xuaW1wb3J0IFJ1bm5lciBmcm9tICcuL3J1bm5lcnMvUnVubmVyJztcbmltcG9ydCB7QWN0aW9uLCBJZiwgRWxzZSwgRW5kSWYsIFVubGVzcywgRW5kVW5sZXNzfSBmcm9tICcuL0FjdGlvbnMnO1xuaW1wb3J0IHtSZXBsYWNlciwgVmFyaWFibGV9IGZyb20gJy4vUmVwbGFjZXJzJztcblxubGV0IEFjdGlvblJ1bm5lckRlZmluaXRpb246IElSdW5uZXJEZWZpbml0aW9uID0ge1xuICAgIHJlZ2V4OiAve3slKC4qPyklfX0oW1xcc1xcU10qPyk/KD89KD86e3slfCQpKS9nbSxcbiAgICBhY3Rpb25zOiBbSWYsIEVsc2UsIEVuZElmLCBVbmxlc3MsIEVuZFVubGVzc10sXG4gICAgcmVwbGFjZXJzOiBbVmFyaWFibGVdXG59XG5leHBvcnQgbGV0IEFjdGlvblJ1bm5lciA9IG5ldyBSdW5uZXIoQWN0aW9uUnVubmVyRGVmaW5pdGlvbik7XG5cbmV4cG9ydCB7ZGVmYXVsdCBhcyBJUnVubmVyRGVmaW5pdGlvbn0gZnJvbSAnLi9ydW5uZXJzL0lSdW5uZXJEZWZpbml0aW9uJztcbmV4cG9ydCB7ZGVmYXVsdCBhcyBSdW5uZXJ9IGZyb20gJy4vcnVubmVycy9SdW5uZXInOyIsImltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4vSVZhcmlhYmxlcyc7XG5pbXBvcnQgQ29tbWFuZCBmcm9tICcuL0NvbW1hbmQnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTY29wZSB7XG5cdHB1YmxpYyB2YXJpYWJsZXM6IElWYXJpYWJsZXMgPSB7fTtcblx0cHVibGljIGNvbW1hbmRzOiBDb21tYW5kW10gPSBbXTtcblx0cHVibGljIGRlcGVuZGVudHM6IENvbW1hbmRbXSA9IFtdO1xuICAgIFxuICAgIHB1YmxpYyBwZXJmb3JtKCk6IHN0cmluZyB7XG4gICAgICAgIGxldCBjb21tYW5kOiBDb21tYW5kLCB0ZXh0OiBzdHJpbmcgPSAnJztcbiAgICAgICAgZm9yKGNvbW1hbmQgb2YgdGhpcy5jb21tYW5kcyl7XG4gICAgICAgICAgICB0ZXh0ICs9IGNvbW1hbmQucGVyZm9ybSgpLnJlc3VsdC50ZXh0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0ZXh0O1xuICAgIH1cbn0iLCJpbXBvcnQgVmFsdWVUeXBlIGZyb20gJy4vVmFsdWVUeXBlJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4vSVZhcmlhYmxlcyc7XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWYWx1ZSB7XG4gICAgcHVibGljIHR5cGU6IFZhbHVlVHlwZTtcbiAgICBwdWJsaWMgdmFsdWU6IGFueTtcbiAgICBjb25zdHJ1Y3RvcihpdGVtOiBhbnkpe1xuICAgICAgICBpZihpdGVtIGluc3RhbmNlb2YgQXJyYXkpe1xuICAgICAgICAgICAgdGhpcy50eXBlID0gVmFsdWVUeXBlLmFycmF5O1xuICAgICAgICB9IGVsc2UgaWYoLyhcInwnKVtcXHdcXGRdKyhcXDEpLy50ZXN0KGl0ZW0pKSB7XG4gICAgICAgICAgICB0aGlzLnR5cGUgPSBWYWx1ZVR5cGUuc3RyaW5nO1xuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IGl0ZW0uc3Vic3RyKDEsIGl0ZW0ubGVuZ3RoIC0gMik7XG4gICAgICAgIH0gZWxzZSBpZighaXNOYU4oaXRlbSkpIHtcbiAgICAgICAgICAgIHRoaXMudHlwZSA9IFZhbHVlVHlwZS5udW1iZXI7XG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gcGFyc2VGbG9hdChpdGVtKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudHlwZSA9IFZhbHVlVHlwZS52YXJpYWJsZTtcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSBpdGVtO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBldmFsdWF0ZSh2YXJpYWJsZXM6IElWYXJpYWJsZXMpOiBhbnl7XG4gICAgICAgIGlmKHRoaXMudHlwZSA9PT0gVmFsdWVUeXBlLnZhcmlhYmxlKXtcbiAgICAgICAgICAgIGlmKGlzTmFOKHZhcmlhYmxlc1s8c3RyaW5nPnRoaXMudmFsdWVdKSl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhcmlhYmxlc1s8c3RyaW5nPnRoaXMudmFsdWVdXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZUZsb2F0KHZhcmlhYmxlc1s8c3RyaW5nPnRoaXMudmFsdWVdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnZhbHVlO1xuICAgICAgICB9XG4gICAgfVxufSIsImVudW0gVmFsdWVUeXBlIHtcbiAgICBzdHJpbmcsXG4gICAgbnVtYmVyLFxuICAgIGFycmF5LFxuICAgIHZhcmlhYmxlXG59XG5leHBvcnQgZGVmYXVsdCBWYWx1ZVR5cGU7IiwiaW1wb3J0IElBY3Rpb25EZWZpbml0aW9uIGZyb20gJy4vSUFjdGlvbkRlZmluaXRpb24nO1xuaW1wb3J0IHtFeHByZXNzaW9ufSBmcm9tICcuLi9FeHByZXNzaW9ucyc7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcbmltcG9ydCBDb21tYW5kIGZyb20gJy4uL0NvbW1hbmQnO1xuaW1wb3J0IFNjb3BlIGZyb20gJy4uL1Njb3BlJztcbi8vIERPIE5PVCBQVVQgSU5TVEFOQ0UgSVRFTVMgSU4gVEhJUyBDTEFTUywgRFVNTVlcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFjdGlvbiB7XG4gICAgY29uc3RydWN0b3IocHVibGljIGRlZmluaXRpb246IElBY3Rpb25EZWZpbml0aW9uKXtcbiAgICAgICAgaWYoIWRlZmluaXRpb24pIHRocm93ICdBdHRlbXB0ZWQgdG8gaW5zdGF0aWF0ZSBhY3Rpb24gd2l0aG91dCBhIGRlZmluaXRpb24nO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgbWF0Y2hlcyhzdGF0ZW1lbnQ6IHN0cmluZyk6IGJvb2xlYW57XG4gICAgICAgIHJldHVybiB0aGlzLmRlZmluaXRpb24ucmVnZXgudGVzdChzdGF0ZW1lbnQpO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgcGFyc2UoY29tbWFuZDogQ29tbWFuZCl7XG4gICAgICAgIGxldCBleHByZXNzaW9uOiBFeHByZXNzaW9uO1xuICAgICAgICBmb3IoZXhwcmVzc2lvbiBvZiB0aGlzLmRlZmluaXRpb24uZXhwcmVzc2lvbnMpe1xuICAgICAgICAgICAgaWYoZXhwcmVzc2lvbi5tYXRjaGVzKGNvbW1hbmQuc3RhdGVtZW50KSkge1xuICAgICAgICAgICAgICAgIGNvbW1hbmQuZXhwcmVzc2lvbiA9IGV4cHJlc3Npb247XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgcHVibGljIHBlcmZvcm0oY29tbWFuZDogQ29tbWFuZCwgcHJldj86IENvbW1hbmQpOiBDb21tYW5kIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVmaW5pdGlvbi5ydWxlKGNvbW1hbmQsIHByZXYpO1xuICAgIH1cbn0iLCJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbW1hbmRSZXN1bHQge1xuICAgIHB1YmxpYyBkZXBlbmRlbnQ6IENvbW1hbmRSZXN1bHQ7XG4gICAgY29uc3RydWN0b3IocHVibGljIHRleHQ6IHN0cmluZywgcHVibGljIHBhc3NlZD86IGJvb2xlYW4pe31cbn0iLCJpbXBvcnQgUGxhY2Vob2xkZXIgZnJvbSAnLi4vUGxhY2Vob2xkZXJzJztcbmltcG9ydCBFeHByZXNzaW9uUmVzdWx0IGZyb20gJy4vRXhwcmVzc2lvblJlc3VsdCc7XG5pbXBvcnQgSUV4cHJlc3Npb25JbmRpY2VzIGZyb20gJy4vSUV4cHJlc3Npb25JbmRpY2VzJztcbmltcG9ydCBJRXhwcmVzc2lvbkRlZmluaXRpb24gZnJvbSAnLi9JRXhwcmVzc2lvbkRlZmluaXRpb24nO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5pbXBvcnQgQ29tbWFuZCBmcm9tICcuLi9Db21tYW5kJztcbmltcG9ydCB7TW9kaWZpZXJ9IGZyb20gJy4uL01vZGlmaWVycydcbmltcG9ydCBWYWx1ZSBmcm9tICcuLi9WYWx1ZSc7XG5pbXBvcnQgJy4uL0V4dGVuc2lvbnMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFeHByZXNzaW9uIHtcbiAgICBwcml2YXRlIHJlZ2V4OiBSZWdFeHA7XG4gICAgcHJpdmF0ZSBpbmRpY2llczogSUV4cHJlc3Npb25JbmRpY2VzID0ge307XG4gICAgcHJpdmF0ZSB0ZW1wbGF0ZTogc3RyaW5nO1xuICAgIHByaXZhdGUgaXRlbXM6IEFycmF5PHN0cmluZyB8IE1vZGlmaWVyW10+O1xuICAgIHByaXZhdGUgcnVsZTogKGNvbW1hbmQ6IENvbW1hbmQsIHZhbHVlczogVmFsdWVbXSwgdmFyaWFibGVzOiBJVmFyaWFibGVzKSA9PiBhbnk7XG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBkZWZpbml0aW9uOiBJRXhwcmVzc2lvbkRlZmluaXRpb24pe1xuICAgICAgICBpZighZGVmaW5pdGlvbikgdGhyb3cgJ0F0dGVtcHRlZCB0byBpbnN0YXRpYXRlIGV4cHJlc3Npb24gd2l0aG91dCBhIGRlZmluaXRpb24nO1xuICAgICAgICB0aGlzLnJlZ2V4ID0gdGhpcy50cmFuc2xhdGUodGhpcy5kZWZpbml0aW9uKTtcbiAgICAgICAgdGhpcy50ZW1wbGF0ZSA9IGRlZmluaXRpb24udGVtcGxhdGU7XG4gICAgICAgIHRoaXMuaXRlbXMgPSBkZWZpbml0aW9uLml0ZW1zO1xuICAgICAgICB0aGlzLnJ1bGUgPSBkZWZpbml0aW9uLnJ1bGU7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgdHJhbnNsYXRlKGRlZmluaXRpb246IElFeHByZXNzaW9uRGVmaW5pdGlvbik6IFJlZ0V4cHtcbiAgICAgICAgbGV0IHRlbXBsYXRlID0gZGVmaW5pdGlvbi50ZW1wbGF0ZSwgaXRlbTogKHN0cmluZyB8IE1vZGlmaWVyW10pLCBuYW1lOiBzdHJpbmcsIGlkeD0xO1xuICAgICAgICBmb3IoaXRlbSBvZiBkZWZpbml0aW9uLml0ZW1zKXtcbiAgICAgICAgICAgIGlmKCFpdGVtKSB0aHJvdyAnSW52YWxpZCBpdGVtIGluIGl0ZW1zIGRlZmluaXRpb24nO1xuICAgICAgICAgICAgaWYoaXRlbSBpbnN0YW5jZW9mIEFycmF5KSBuYW1lID0gJ21vZGlmaWVyJztcbiAgICAgICAgICAgIGVsc2UgbmFtZSA9IDxzdHJpbmc+aXRlbTtcbiAgICAgICAgICAgIGxldCBwbGFjZWhvbGRlciA9IFBsYWNlaG9sZGVyKG5hbWUpO1xuICAgICAgICAgICAgdGVtcGxhdGUgPSB0ZW1wbGF0ZS5yZXBsYWNlKHBsYWNlaG9sZGVyLmxvY2F0b3IsIHBsYWNlaG9sZGVyLnJlcGxhY2VtZW50KGl0ZW0gaW5zdGFuY2VvZiBBcnJheSA/IGl0ZW0gOiBudWxsKSk7XG4gICAgICAgICAgICBpZih0aGlzLmluZGljaWVzW25hbWVdIGluc3RhbmNlb2YgQXJyYXkpICg8bnVtYmVyW10+dGhpcy5pbmRpY2llc1tuYW1lXSkucHVzaChpZHgpO1xuICAgICAgICAgICAgZWxzZSBpZighaXNOYU4oPGFueT50aGlzLmluZGljaWVzW25hbWVdKSkge1xuICAgICAgICAgICAgICAgIGxldCBhcnJheSA9IFtdO1xuICAgICAgICAgICAgICAgIGFycmF5LnB1c2godGhpcy5pbmRpY2llc1tuYW1lXSk7XG4gICAgICAgICAgICAgICAgYXJyYXkucHVzaChpZHgpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5kaWNpZXNbbmFtZV0gPSBhcnJheTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgdGhpcy5pbmRpY2llc1tuYW1lXSA9IGlkeDtcbiAgICAgICAgICAgIHRoaXMuaW5kaWNpZXNbaWR4XSA9IG5hbWU7XG4gICAgICAgICAgICBpZHgrKztcbiAgICAgICAgfVxuICAgICAgICB0ZW1wbGF0ZSA9IHRlbXBsYXRlLnJlcGxhY2UoL1xccysvZywgJyg/OlxcXFxifFxcXFxzKyknKTtcbiAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAodGVtcGxhdGUsICdpJyk7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgcGFyc2UoY29tbWFuZDogQ29tbWFuZCk6IEV4cHJlc3Npb25SZXN1bHQge1xuICAgICAgICBsZXQgcmVzdWx0ID0gbmV3IEV4cHJlc3Npb25SZXN1bHQoKSwgbWF0Y2ggPSBjb21tYW5kLnN0YXRlbWVudC5tYXRjaCh0aGlzLnJlZ2V4KSwgaSwgbW9kaWZpZXI6IE1vZGlmaWVyLCBtb2ROdW1iZXI6IG51bWJlciA9IC0xO1xuICAgICAgICByZXN1bHQuc3RhdGVtZW50ID0gbWF0Y2hbMF07XG4gICAgICAgIGZvcihpPTE7aTxtYXRjaC5sZW5ndGg7aSsrKXtcbiAgICAgICAgICAgIGlmKHRoaXMuaXRlbXNbaS0xXSBpbnN0YW5jZW9mIEFycmF5KXtcbiAgICAgICAgICAgICAgICBtb2ROdW1iZXIrKztcbiAgICAgICAgICAgICAgICBmb3IobW9kaWZpZXIgb2YgPE1vZGlmaWVyW10+dGhpcy5pdGVtc1tpLTFdKXtcbiAgICAgICAgICAgICAgICAgICAgaWYobW9kaWZpZXIubWF0Y2hlcyhtYXRjaFtpXSkpIHJlc3VsdC5zZXQoPHN0cmluZz50aGlzLmluZGljaWVzW2ldLCBtb2RpZmllciwgbW9kTnVtYmVyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHJlc3VsdC5zZXQoPHN0cmluZz50aGlzLmluZGljaWVzW2ldLCBtYXRjaFtpXSlcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQudmFyaWFibGVzID0gY29tbWFuZC5zY29wZS52YXJpYWJsZXM7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBldmFsdWF0ZShjb21tYW5kOiBDb21tYW5kKTogYW55e1xuICAgICAgICBsZXQgcGFyc2VkID0gdGhpcy5wYXJzZShjb21tYW5kKTtcbiAgICAgICAgcGFyc2VkLnBhc3MgPSB0aGlzLnJ1bGUoY29tbWFuZCwgcGFyc2VkLnZhbHVlLCBwYXJzZWQudmFyaWFibGVzKTtcbiAgICAgICAgbGV0IGluZGV4OiBudW1iZXI7XG4gICAgICAgIGZvcihpbmRleCBvZiB0aGlzLmRlZmluaXRpb24ubW9kT3JkZXIpe1xuICAgICAgICAgICAgaWYocGFyc2VkLm1vZGlmaWVyW2luZGV4XSkgcGFyc2VkLnBhc3MgPSBwYXJzZWQubW9kaWZpZXJbaW5kZXhdLmRlZmluaXRpb24ucnVsZShwYXJzZWQucGFzcywgcGFyc2VkLnZhbHVlLCBwYXJzZWQudmFyaWFibGVzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGFyc2VkLnBhc3M7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBtYXRjaGVzKHN0YXRlbWVudDogc3RyaW5nKXtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVnZXgudGVzdChzdGF0ZW1lbnQpO1xuICAgIH1cbn0iLCJpbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcbmltcG9ydCB7TW9kaWZpZXJ9IGZyb20gJy4uL01vZGlmaWVycyc7XG5pbXBvcnQgVmFsdWUgZnJvbSAnLi4vVmFsdWUnO1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXhwcmVzc2lvblJlc3VsdCB7XG4gICAgcHVibGljIHBhc3M6IGJvb2xlYW47XG4gICAgcHVibGljIHZhbHVlOiBWYWx1ZVtdID0gW107XG4gICAgcHVibGljIHZhcmlhYmxlczogSVZhcmlhYmxlcztcbiAgICBwdWJsaWMgbW9kaWZpZXI6IE1vZGlmaWVyW10gPSBbXTtcbiAgICBwdWJsaWMgc3RhdGVtZW50OiBzdHJpbmc7XG4gICAgcHVibGljIHNldChwcm9wOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcgfCBNb2RpZmllciwgaW5kZXg/OiBudW1iZXIpe1xuICAgICAgICBpZih0aGlzW3Byb3BdIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgIGlmKGluZGV4KSB0aGlzW3Byb3BdW2luZGV4XSA9IHByb3AgPT09ICd2YWx1ZScgPyBuZXcgVmFsdWUodmFsdWUpIDogdmFsdWU7XG4gICAgICAgICAgICBlbHNlIHRoaXNbcHJvcF0ucHVzaChwcm9wID09PSAndmFsdWUnID8gbmV3IFZhbHVlKHZhbHVlKSA6IHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHRoaXNbcHJvcF0gPSBwcm9wID09PSAndmFsdWUnID8gbmV3IFZhbHVlKHZhbHVlKSA6IHZhbHVlO1xuICAgIH1cbn0iLCJpbXBvcnQgSU1vZGlmaWVyRGVmaW5pdGlvbiBmcm9tICcuL0lNb2RpZmllckRlZmluaXRpb24nO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vZGlmaWVyIHtcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgZGVmaW5pdGlvbjpJTW9kaWZpZXJEZWZpbml0aW9uKXtcbiAgICAgICAgaWYoIWRlZmluaXRpb24pIHRocm93ICdBdHRlbXB0ZWQgdG8gaW5zdGF0aWF0ZSBtb2RpZmllciB3aXRob3V0IGEgZGVmaW5pdGlvbic7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBtYXRjaGVzKHRleHQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgaWRlbnRpZmllcjtcbiAgICAgICAgZm9yKGlkZW50aWZpZXIgb2YgdGhpcy5kZWZpbml0aW9uLmlkZW50aWZpZXJzKXtcbiAgICAgICAgICAgIGlmKGlkZW50aWZpZXIudGVzdCh0ZXh0KSkgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vRXh0ZW5zaW9ucy50c1wiIC8+XG5pbXBvcnQgSVBhcnNlckRlZmluaXRpb24gZnJvbSAnLi9JUGFyc2VyRGVmaW5pdGlvbic7XG5pbXBvcnQge1J1bm5lciwgQWN0aW9uUnVubmVyfSBmcm9tICcuLi9SdW5uZXJzJztcbmltcG9ydCBDb21tYW5kIGZyb20gJy4uL0NvbW1hbmQnO1xuaW1wb3J0IFNjb3BlIGZyb20gJy4uL1Njb3BlJztcbmltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL0lWYXJpYWJsZXMnO1xuQXJyYXkucHJvdG90eXBlLmxhc3QgPSBmdW5jdGlvbigpe1xuXHRyZXR1cm4gdGhpc1t0aGlzLmxlbmd0aC0xXTtcbn1cbi8qKlxuICogVGhlIFNRaWdnTCBwYXJzZXJcbiAqIEBtb2R1bGUgUGFyc2VyXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7c3RyaW5nfSBzcWwgICAgICAgICAgICAgIC0gVGhlIFNRaWdnTCBxdWVyeSB0byBydW4gdGhlIHBhcnNlciBhZ2FpbnN0XG4gKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAgICAtIEFueSB2YXJpYWJsZXMgcGFzc2VkIHRvIHRoZSBTUWlnZ0wgcGFyc2VyXG4gKiBAcHJvcGVydHkge3N0cmluZ30gc3FsICAgICAgICAgICAtIFRoZSBTUWlnZ0wgcXVlcnkgdG8gcnVuIHRoZSBwYXJzZXIgYWdhaW5zdFxuICogQHByb3BlcnR5IHtJVmFyaWFibGVzfSB2YXJpYWJsZXMgLSBBbnkgdmFyaWFibGVzIHBhc3NlZCB0byB0aGUgU1FpZ2dMIHBhcnNlclxuICogQHByb3BlcnR5IHtDb21tYW5kW119IGNvbW1hbmRzICAgLSBBcnJheSBvZiBjb21tYW5kcyBmb3VuZCBpbiB0aGUgU1FpZ2dMIHF1ZXJ5XG4gKiBAcHJvcGVydHkge0NvbW1hbmRbXX0gc3RhY2sgICAgICAtIENvbW1hbmQgc3RhY2sgZm9yIHN0b3JpbmcgY3VycmVudCBwb3NpdGlvbiBpbiB0aGUgcGFyc2luZyBwcm9jZXNzXG4gKiBAcHJvcGVydHkge3N0cmluZ30gZXJyb3IgICAgICAgICAtIEVycm9yIHN0cmluZyBpZiBhbnkgZXJyb3JzIGFyZSBmb3VuZCBpbiB0aGUgcGFyc2luZyBwcm9jZXNzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhcnNlciB7XG4gICAgcHVibGljIHJlZ2V4OiBSZWdFeHA7XG5cdHB1YmxpYyBjb21tYW5kczogQ29tbWFuZFtdID0gW107XG5cdHB1YmxpYyBzdGFjazogQ29tbWFuZFtdID0gW107XG4gICAgcHVibGljIGVycm9yOiBzdHJpbmdbXSA9IFtdO1xuICAgIHB1YmxpYyBzcWw6IHN0cmluZztcblx0Ly8gY29uc3RydWN0b3IocHVibGljIHNxbDogc3RyaW5nLCBwdWJsaWMgdmFyaWFibGVzOiBJVmFyaWFibGVzKXtcblx0XHQvLyB0aGlzLmNvbW1hbmRzID0gdGhpcy5leHRyYWN0KHNxbCwgdmFyaWFibGVzKTtcblx0XHQvLyB0aGlzLnZhcmlhYmxlcyA9IHZhcmlhYmxlcztcblx0Ly8gfVxuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBkZWZpbml0aW9uOiBJUGFyc2VyRGVmaW5pdGlvbil7XG4gICAgICAgIGlmKCFkZWZpbml0aW9uKSB0aHJvdyAnQXR0ZW1wdGVkIHRvIGluc3RhdGlhdGUgcGFyc2VyIHdpdGhvdXQgYSBkZWZpbml0aW9uJztcbiAgICAgICAgdGhpcy5yZWdleCA9IG5ldyBSZWdFeHAoYCg/OiR7dGhpcy5kZWZpbml0aW9uLnJ1bm5lcnMubWFwKHggPT4geC5kZWZpbml0aW9uLnJlZ2V4LnNvdXJjZSkuam9pbignKXwoJyl9KWAsICdnbScpO1xuICAgIH1cblx0LyoqXG4gICAgICogRXh0cmFjdCBhbnkgY29tbWFuZHMgb3V0IG9mIHRoZSBTUWlnZ0wgcXVlcnkgYW5kIGRldGVybWluZSB0aGVpciBvcmRlciwgbmVzdGluZywgYW5kIHR5cGVcbiAgICAgKiBAbWVtYmVyb2YgUGFyc2VyXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3FsICAgICAgICAgICAgICAtIFNRaWdnTCBxdWVyeSB0byBleHRyYWN0IGNvbW1hbmRzIGZyb21cbiAgICAgKiBAcGFyYW0ge0lWYXJpYWJsZXN9IHZhcmlhYmxlcyAgICAtIEFueSBnbG9iYWwgdmFyaWFibGVzIHBhc3NlZCBpbiB0byBTUWlnZ0xcbiAgICAgKiBAcmV0dXJucyB7Q29tbWFuZFtdfSAgICAgICAgICAgICAtIEFycmF5IG9mIGZ1bGx5IHBhcnNlZCBjb21tYW5kcywgcmVhZHkgZm9yIGV4ZWN1dGlvblxuICAgICAqL1xuXHRwdWJsaWMgcGFyc2Uoc3FsOiBzdHJpbmcsIHZhcmlhYmxlczogSVZhcmlhYmxlcyl7XG5cdCAgICB0aGlzLmNvbW1hbmRzID0gW107XG4gICAgICAgIHRoaXMuc3RhY2sgPSBbXTtcbiAgICAgICAgdGhpcy5zcWwgPSBzcWw7XG4gICAgICAgIGxldCBtYXRjaDtcblx0XHQvLyBDb21tYW5kLnJlZ2V4Lmxhc3RJbmRleCA9IDA7XG5cdFx0d2hpbGUoKG1hdGNoID0gdGhpcy5yZWdleC5leGVjKHNxbCkpICE9IG51bGwpe1xuICAgICAgICAgICAgbGV0IGZvdW5kOiBDb21tYW5kLCBydW5uZXI6IFJ1bm5lcjtcbiAgICAgICAgICAgIGZvcihydW5uZXIgb2YgdGhpcy5kZWZpbml0aW9uLnJ1bm5lcnMpe1xuICAgICAgICAgICAgICAgIGlmKHJ1bm5lci5tYXRjaGVzKG1hdGNoWzBdKSl7XG4gICAgICAgICAgICAgICAgICAgIGZvdW5kID0gbmV3IENvbW1hbmQobWF0Y2guaW5kZXgsIG1hdGNoLmlucHV0Lmxlbmd0aCwgbWF0Y2hbMV0sIG1hdGNoWzJdLCBuZXcgU2NvcGUoKSwgcnVubmVyKTtcbiAgICAgICAgICAgICAgICAgICAgZm91bmQuc2NvcGUudmFyaWFibGVzID0gdmFyaWFibGVzO1xuICAgICAgICAgICAgICAgICAgICBydW5uZXIucGFyc2UoZm91bmQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblx0XHRcdGlmKHRoaXMuc3RhY2subGVuZ3RoID4gMCAmJiB0aGlzLnN0YWNrLmxhc3QoKS5hY3Rpb24uZGVmaW5pdGlvbi5kZXBlbmRlbnRzLmNvbnRhaW5zKGZvdW5kLmFjdGlvbikpe1xuICAgICAgICAgICAgICAgIC8vIGZvdW5kLmFjdGlvbi5zdXBwb3J0ZXIgPSBzdGFjay5sYXN0KCk7XG5cdFx0XHRcdHRoaXMuc3RhY2subGFzdCgpLmRlcGVuZGVudHMucHVzaChmb3VuZCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmICh0aGlzLnN0YWNrLmxlbmd0aCA+IDAgJiYgIXRoaXMuc3RhY2subGFzdCgpLmFjdGlvbi5kZWZpbml0aW9uLnRlcm1pbmF0b3IpIHtcblx0XHRcdFx0dGhpcy5zdGFjay5wdXNoKGZvdW5kKTtcblx0XHRcdFx0dGhpcy5zdGFjay5sYXN0KCkuc2NvcGUuY29tbWFuZHMucHVzaChmb3VuZCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0aWYodGhpcy5zdGFjay5sZW5ndGggPiAwICYmIHRoaXMuc3RhY2subGFzdCgpLmFjdGlvbi5kZWZpbml0aW9uLnRlcm1pbmF0b3IpIHRoaXMuc3RhY2sucG9wKCk7XG5cdFx0XHRcdHRoaXMuc3RhY2sucHVzaChmb3VuZCk7XG5cdFx0XHRcdHRoaXMuY29tbWFuZHMucHVzaChmb3VuZCk7XG5cdFx0XHR9XG4gICAgICAgICAgICAvLyBsZXQgZXJyb3IgPSBmb3VuZC5hY3Rpb24udmFsaWRhdGUoKTtcbiAgICAgICAgICAgIC8vIGlmKGVycm9yKSByZXR1cm4gW107XG5cdFx0fVxuXHRcdC8vIHJldHVybiBjb21tYW5kcztcblx0fVxuXHQvKipcbiAgICAgKiBSdW4gdGhlIGNvbW1hbmRzIGFnYWluc3QgdGhlIHN0cmluZyBhbmQgb3V0cHV0IHRoZSBlbmQgcmVzdWx0XG4gICAgICogQG1lbWJlcm9mIFBhcnNlclxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcHVibGljXG4gICAgICogQHJldHVybnMge3N0cmluZ30gVGhlIGVuZCByZXN1bHQgb2YgcnVubmluZyBhbGwgY29tbWFuZHMgYWdhaW5zdCB0aGUgU1FpZ2dMIHF1ZXJ5XG4gICAgICovXG5cdHB1YmxpYyBwZXJmb3JtKCk6IHN0cmluZyB7XG5cdFx0dmFyIHF1ZXJ5ID0gJycsIGluZGV4ID0gMDtcbiAgICAgICAgaWYodGhpcy5jb21tYW5kcy5sZW5ndGggPT09IDApIHJldHVybiB0aGlzLnNxbDtcblx0XHRmb3IodmFyIGNvbW1hbmQgb2YgdGhpcy5jb21tYW5kcyl7XG5cdFx0XHRxdWVyeSArPSB0aGlzLnNxbC5zbGljZShpbmRleCwgY29tbWFuZC5pbmRleCAtMSk7XG5cdFx0XHRxdWVyeSArPSBjb21tYW5kLnBlcmZvcm0oY29tbWFuZCkucmVzdWx0LnRleHQ7XG5cdFx0XHRpbmRleCArPSBjb21tYW5kLmxlbmd0aDtcblx0XHR9XG5cdFx0cmV0dXJuIHF1ZXJ5OyAvL1RPRE9cblx0fVxufSIsImltcG9ydCBJUmVwbGFjZXJEZWZpbml0aW9uIGZyb20gJy4vSVJlcGxhY2VyRGVmaW5pdGlvbic7XG5pbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9JVmFyaWFibGVzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVwbGFjZXIgeyAgICBcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgZGVmaW5pdGlvbjogSVJlcGxhY2VyRGVmaW5pdGlvbil7XG4gICAgICAgIGlmKCFkZWZpbml0aW9uKSB0aHJvdyAnQXR0ZW1wdGVkIHRvIGluc3RhdGlhdGUgcmVwbGFjZXIgd2l0aG91dCBhIGRlZmluaXRpb24nO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgcmVwbGFjZSh0ZXh0OiBzdHJpbmcsIHZhcmlhYmxlczogSVZhcmlhYmxlcyk6IHN0cmluZ3tcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVmaW5pdGlvbi5ydWxlKHRoaXMuZGVmaW5pdGlvbiwgdGV4dCwgdmFyaWFibGVzKTtcbiAgICB9XG59IiwiaW1wb3J0IElSdW5uZXJEZWZpbml0aW9uIGZyb20gJy4vSVJ1bm5lckRlZmluaXRpb24nO1xuaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vSVZhcmlhYmxlcyc7XG5pbXBvcnQgU2NvcGUgZnJvbSAnLi4vU2NvcGUnO1xuaW1wb3J0IHtBY3Rpb259IGZyb20gJy4uL0FjdGlvbnMnO1xuaW1wb3J0IENvbW1hbmQgZnJvbSAnLi4vQ29tbWFuZCc7XG5pbXBvcnQge1JlcGxhY2VyfSBmcm9tICcuLi9SZXBsYWNlcnMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSdW5uZXIge1xuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBkZWZpbml0aW9uOiBJUnVubmVyRGVmaW5pdGlvbil7XG4gICAgICAgIGlmKCFkZWZpbml0aW9uKSB0aHJvdyAnQXR0ZW1wdGVkIHRvIGluc3RhdGlhdGUgcnVubmVyIHdpdGhvdXQgYSBkZWZpbml0aW9uJztcbiAgICB9XG4gICAgXG4gICAgcHVibGljIHBhcnNlKGNvbW1hbmQ6IENvbW1hbmQpIHtcbiAgICAgICAgbGV0IGFjdGlvbjogQWN0aW9uO1xuICAgICAgICBmb3IoYWN0aW9uIG9mIHRoaXMuZGVmaW5pdGlvbi5hY3Rpb25zKXtcbiAgICAgICAgICAgIGlmKGFjdGlvbi5tYXRjaGVzKGNvbW1hbmQuc3RhdGVtZW50KSkge1xuICAgICAgICAgICAgICAgIGNvbW1hbmQuYWN0aW9uID0gYWN0aW9uO1xuICAgICAgICAgICAgICAgIGNvbW1hbmQuYWN0aW9uLnBhcnNlKGNvbW1hbmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBwZXJmb3JtKGNvbW1hbmQ6IENvbW1hbmQsIHByZXY/OiBDb21tYW5kKTogQ29tbWFuZCB7XG4gICAgICAgIGNvbW1hbmQucmVzdWx0ID0gY29tbWFuZC5hY3Rpb24ucGVyZm9ybShjb21tYW5kLCBwcmV2KS5yZXN1bHQ7XG4gICAgICAgIC8vIGNvbW1hbmQucmVzdWx0LmRlcGVuZGVudCA9IGNvbW1hbmQuc2NvcGUucGVyZm9ybShjb21tYW5kKS5yZXN1bHQ7XG4gICAgICAgIGxldCByZXBsYWNlcjogUmVwbGFjZXI7XG4gICAgICAgIGZvcihyZXBsYWNlciBvZiB0aGlzLmRlZmluaXRpb24ucmVwbGFjZXJzKXtcbiAgICAgICAgICAgIGNvbW1hbmQucmVwbGFjZShyZXBsYWNlcik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbW1hbmQ7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBtYXRjaGVzKHRleHQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICB0aGlzLmRlZmluaXRpb24ucmVnZXgubGFzdEluZGV4ID0gMDtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVmaW5pdGlvbi5yZWdleC50ZXN0KHRleHQpO1xuICAgIH1cbn0iLCIvLyAvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdHlwaW5ncy90c2QuZC50c1wiIC8+XG4vLyBpbXBvcnQgQ29tbWFuZCBmcm9tICcuLi9zcmMvQ29tbWFuZCc7XG4vLyBpbXBvcnQge0lmfSBmcm9tICcuLi9zcmMvQWN0aW9ucyc7XG4vLyBpbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi9zcmMvSVZhcmlhYmxlcyc7XG5cbi8vIGRlc2NyaWJlKCdDb21tYW5kJywgKCkgPT4ge1xuLy8gXHRkZXNjcmliZSgncmVnZXgnLCAoKSA9PiB7XG4vLyBcdFx0aXQoJ3Nob3VsZCBtYXRjaCBhbnkgc3RyaW5ncyB3cmFwcGVkIGluIFwie3slICV9fVwiJywgKCkgPT4gZXhwZWN0KENvbW1hbmQucmVnZXgudGVzdCgne3slIHNvbWV0aGluZyAlfX0nKSkudG9CZSh0cnVlKSk7XG4vLyBcdFx0aXQoJ3Nob3VsZCBub3QgbWF0Y2ggYW55IHN0cmluZ3Mgd3JhcHBlZCBpbiBcInt7IH19XCInLCAoKSA9PiBleHBlY3QoQ29tbWFuZC5yZWdleC50ZXN0KCd7eyBzb21ldGhpbmcgfX0nKSkudG9CZShmYWxzZSkpO1xuLy8gXHRcdGl0KCdzaG91bGQgbm90IG1hdGNoIGFueSBzdHJpbmdzIHdyYXBwZWQgaW4gXCJ7e3sgfX19XCInLCAoKSA9PiBleHBlY3QoQ29tbWFuZC5yZWdleC50ZXN0KCd7e3sgc29tZXRoaW5nIH19fScpKS50b0JlKGZhbHNlKSk7XG4vLyBcdFx0aXQoJ3Nob3VsZCBtYXRjaCBhbnkgc3RyaW5ncyB3cmFwcGVkIGluIFwie3slICV9fVwiIGFueXdoZXJlJywgKCkgPT4gZXhwZWN0KENvbW1hbmQucmVnZXgudGVzdCgnaGVsbG8gd29ybGQge3slIHNvbWV0aGluZyAlfX0gZnJvbSB0aGlzIHRlc3QnKSkudG9CZSh0cnVlKSk7XG4vLyBcdFx0Ly8gaXQoJ3Nob3VsZCBjYXB0dXJlIHRoZSBjb21tYW5kIGFuZCBpbm5lcicsICgpID0+IHtcbi8vIFx0XHQvLyBcdHZhciBtYXRjaCwgbWF0Y2hlczogc3RyaW5nW11bXSA9IFtdO1xuLy8gXHRcdC8vIFx0d2hpbGUoKG1hdGNoID0gQ29tbWFuZC5yZWdleC5leGVjKCdoZWxsbyB3b3JsZCB7eyUgdGhpcyBpcyB0aGUgY29tbWFuZCAlfX0gYW5kIHRoaXMgaXMgdGhlIGlubmVyJykpICE9IG51bGwpe1xuLy8gXHRcdC8vIFx0XHRjb25zb2xlLmxvZyhtYXRjaCk7XG4vLyBcdFx0Ly8gXHRcdG1hdGNoZXMucHVzaChtYXRjaCk7XG4vLyBcdFx0Ly8gXHR9XG4vLyBcdFx0Ly8gXHRleHBlY3QobWF0Y2hlcykubm90LnRvQmVOdWxsKCk7XG4vLyBcdFx0Ly8gXHRleHBlY3QobWF0Y2hlcykubm90LnRvQmVVbmRlZmluZWQoKTtcbi8vIFx0XHQvLyBcdGV4cGVjdChtYXRjaGVzWzBdKS5ub3QudG9CZU51bGwoKTtcbi8vIFx0XHQvLyBcdGV4cGVjdChtYXRjaGVzWzBdKS5ub3QudG9CZVVuZGVmaW5lZCgpO1xuLy8gXHRcdC8vIFx0Ly8gZXhwZWN0KG1hdGNoZXNbMF1bMV0pLm5vdC50b0JlTnVsbCgpO1xuXHRcdFxuLy8gXHRcdC8vIFx0Ly8gZXhwZWN0KG1hdGNoZXNbMF1bMV0pLnRvRXF1YWwoJyB0aGlzIGlzIHRoZSBjb21tYW5kICcpO1xuLy8gXHRcdC8vIFx0Ly8gZXhwZWN0KG1hdGNoZXNbMF1bMl0pLnRvRXF1YWwoJyBhbmQgdGhpcyBpcyB0aGUgaW5uZXInKTtcbi8vIFx0XHQvLyB9KTtcbi8vIFx0fSk7XG5cdFxuLy8gXHRkZXNjcmliZSgnaW5zdGFuY2UnLCAoKSA9PiB7XG4vLyBcdFx0bGV0IGluZGV4ID0gNSxcbi8vIFx0XHRcdHN0YXRlbWVudCA9ICcgaWYgc29tZXRoaW5nIGlzIG5vdCBudWxsICcsXG4vLyBcdFx0XHRpbm5lciA9ICcgRmlyc3ROYW1lID0ge3sgc29tZXRoaW5nIH19ICcsXG4vLyBcdFx0XHR2YXJpYWJsZXM6IElWYXJpYWJsZXMgPSB7c29tZXRoaW5nOiAnRHJhZ29uJ30sXG4vLyBcdFx0XHRjb21tYW5kOiBDb21tYW5kLFxuLy8gXHRcdFx0bGVuZ3RoOiBudW1iZXIgPSBge3slJHtzdGF0ZW1lbnR9JX19JHtpbm5lcn1gLmxlbmd0aDsgXG4vLyBcdFx0YmVmb3JlQWxsKCgpID0+IGNvbW1hbmQgPSBuZXcgQ29tbWFuZChpbmRleCwgbGVuZ3RoLCBzdGF0ZW1lbnQsIGlubmVyLCB2YXJpYWJsZXMpKTtcbi8vIFx0XHRpdCgnc2hvdWxkIHN0b3JlIHRoZSBpbmRleCcsICgpID0+IGV4cGVjdChjb21tYW5kLmluZGV4KS50b0VxdWFsKDUpKTtcbi8vIFx0XHRpdCgnc2hvdWxkIHN0b3JlIHRoZSBzdGF0ZW1lbnQnLCAoKSA9PiBleHBlY3QoY29tbWFuZC5zdGF0ZW1lbnQpLnRvRXF1YWwoc3RhdGVtZW50KSk7XG4vLyBcdFx0aXQoJ3Nob3VsZCBzdG9yZSB0aGUgaW5uZXInLCAoKSA9PiBleHBlY3QoY29tbWFuZC5pbm5lcikudG9FcXVhbChpbm5lcikpO1xuLy8gXHRcdGl0KCdzaG91bGQgc3RvcmUgdGhlIHZhcmlhYmxlcycsICgpID0+IGV4cGVjdChjb21tYW5kLnNjb3BlLnZhcmlhYmxlcykudG9FcXVhbCh2YXJpYWJsZXMpKTtcbi8vIFx0fSk7XG5cdFxuLy8gXHRkZXNjcmliZSgnZXhwZWN0JywgKCkgPT4ge1xuLy8gXHRcdGxldCBpbmRleCA9IDUsXG4vLyBcdFx0XHRzdGF0ZW1lbnQgPSAnIGlmIHNvbWV0aGluZyBpcyBub3QgbnVsbCAnLFxuLy8gXHRcdFx0aW5uZXIgPSAnIEZpcnN0TmFtZSA9IHt7IHNvbWV0aGluZyB9fSAnLFxuLy8gXHRcdFx0dmFyaWFibGVzOiBJVmFyaWFibGVzID0ge3NvbWV0aGluZzogJ0RyYWdvbid9LFxuLy8gXHRcdFx0Y29tbWFuZDogQ29tbWFuZCxcbi8vIFx0XHRcdGxlbmd0aDogbnVtYmVyID0gYHt7JSR7c3RhdGVtZW50fSV9fSR7aW5uZXJ9YC5sZW5ndGg7IFxuLy8gXHRcdGJlZm9yZUFsbCgoKSA9PiBjb21tYW5kID0gbmV3IENvbW1hbmQoaW5kZXgsIGxlbmd0aCwgc3RhdGVtZW50LCBpbm5lciwgdmFyaWFibGVzKSk7XG4vLyBcdFx0aXQoJ3Nob3VsZCBjcmVhdGUgdGhlIGNvcnJlY3QgYWN0aW9uJywgKCkgPT4gZXhwZWN0KGNvbW1hbmQuZXh0cmFjdChzdGF0ZW1lbnQsIGlubmVyLCB2YXJpYWJsZXMpIGluc3RhbmNlb2YgSWYpLnRvQmUodHJ1ZSkpO1xuLy8gXHR9KTtcbi8vIH0pOyIsIi8vIC8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi90eXBpbmdzL3RzZC5kLnRzXCIgLz5cbi8vIGltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uL3NyYy9JVmFyaWFibGVzJztcbi8vIGltcG9ydCBQYXJzZXIgZnJvbSAnLi4vc3JjL1BhcnNlcic7XG4vLyBpbXBvcnQgQ29tbWFuZCBmcm9tICcuLi9zcmMvQ29tbWFuZCc7XG5cbi8vIGRlc2NyaWJlKCdQYXJzZXInLCAoKSA9PiB7XG4vLyBcdGRlc2NyaWJlKCdpbnN0YW5jZScsICgpID0+IHtcbi8vIFx0XHR2YXIgcGFyc2VyLCBcbi8vIFx0XHRcdHNxbCA9IFwiVVBEQVRFIFNvbWV0aGluZyBTRVQge3slIGlmIG15VmFyIGlzIG5vdCBudWxsICV9fSBGaXJzdE5hbWUgPSB7eyBteVZhciB9fSB7eyUgZWxzZSAlfX0gRmlyc3ROYW1lID0gJ0RlZmF1bHQnIHt7JSBlbmRpZiAlfX0gV0hFUkUgSUQgPSAxXCIsXG4vLyBcdFx0XHR2YXJpYWJsZXM6IElWYXJpYWJsZXMgPSB7bXlWYXI6ICdEcmFnb24nfTtcbi8vIFx0XHRiZWZvcmVBbGwoKCkgPT4gcGFyc2VyID0gbmV3IFBhcnNlcihzcWwsIHZhcmlhYmxlcykpO1xuLy8gXHRcdGl0KCdzaG91bGQgc3RvcmUgdGhlIHNxbCcsICgpID0+IGV4cGVjdChwYXJzZXIuc3FsKS50b0VxdWFsKHNxbCkpO1xuLy8gXHRcdGl0KCdzaG91bGQgc3RvcmUgdGhlIHZhcmlhYmxlcycsICgpID0+IGV4cGVjdChwYXJzZXIudmFyaWFibGVzKS50b0VxdWFsKHZhcmlhYmxlcykpO1xuLy8gXHR9KTtcblx0XG4vLyBcdGRlc2NyaWJlKCdleHRyYWN0JywgKCkgPT4ge1xuLy8gXHRcdHZhciBwYXJzZXIsIFxuLy8gXHRcdFx0c3FsID0gXCJVUERBVEUgU29tZXRoaW5nIFNFVCB7eyUgaWYgbXlWYXIgaXMgbm90IG51bGwgJX19IEZpcnN0TmFtZSA9IHt7IG15VmFyIH19IHt7JSBlbHNlICV9fSBGaXJzdE5hbWUgPSAnRGVmYXVsdCcge3slIGVuZGlmICV9fSBXSEVSRSBJRCA9IDFcIixcbi8vIFx0XHRcdHZhcmlhYmxlczogSVZhcmlhYmxlcyA9IHtteVZhcjogJ0RyYWdvbid9O1xuLy8gXHRcdGJlZm9yZUFsbCgoKSA9PiBwYXJzZXIgPSBuZXcgUGFyc2VyKHNxbCwgdmFyaWFibGVzKSk7XG4vLyBcdFx0aXQoJ3Nob3VsZCByZXR1cm4gYSBsaXN0IG9mIGNvbW1hbmRzJywgKCkgPT4gZXhwZWN0KHBhcnNlci5leHRyYWN0KHNxbCwgdmFyaWFibGVzKVswXSBpbnN0YW5jZW9mIENvbW1hbmQpLnRvQmUodHJ1ZSkpO1xuLy8gXHRcdGl0KCdzaG91bGQgY29udGFpbiB0aGUgY29ycmVjdCBudW1iZXIgb2YgY29tbWFuZHMnLCAoKSA9PiBleHBlY3QocGFyc2VyLmV4dHJhY3Qoc3FsLCB2YXJpYWJsZXMpLmxlbmd0aCkudG9FcXVhbCgxKSk7XG4vLyBcdFx0aXQoJ3Nob3VsZCBjb250YWluIGRlcGVuZGVudCBjb21tYW5kcycsICgpID0+IGV4cGVjdChwYXJzZXIuZXh0cmFjdChzcWwsIHZhcmlhYmxlcylbMF0uZGVwZW5kZW50c1swXSBpbnN0YW5jZW9mIENvbW1hbmQpLnRvQmUodHJ1ZSkpO1xuLy8gXHRcdGl0KCdzaG91bGQgY29udGFpbiB0aGUgY29ycmVjdCBudW1iZXIgb2YgZGVwZW5kZW50IGNvbW1hbmRzJywgKCkgPT4gZXhwZWN0KHBhcnNlci5leHRyYWN0KHNxbCwgdmFyaWFibGVzKVswXS5kZXBlbmRlbnRzLmxlbmd0aCkudG9FcXVhbCgyKSk7XG4vLyBcdH0pO1xuLy8gfSk7IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3R5cGluZ3MvdHNkLmQudHNcIiAvPlxuaW1wb3J0IHtwYXJzZX0gZnJvbSAnLi4vc3JjL01haW4nO1xuXG5kZXNjcmliZSgnVGhlIHNjZW5hcmlvJywgKCkgPT4ge1xuICAgIGRlc2NyaWJlKCdpZiBhY3Rpb24nLCAoKSA9PiB7XG4gICAgICAgIFxuICAgICAgICBkZXNjcmliZSgnaXMgbnVsbCBjb25kaXRpb24nLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgcXVlcnkgPSBgVVBEQVRFIE5hbWVzIHt7JSBpZiBleGFtcGxlIGlzIG51bGwgJX19IFNFVCBOYW1lID0gJ0Nvdycge3slIGVsc2UgJX19IFNFVCBOYW1lID0gJ3t7ZXhhbXBsZX19JyB7eyUgZW5kaWYgJX19IFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgO1xuICAgICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgdHJ1ZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtwZW5ueTogJzEyJ30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnQ293JyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiBmYWxzZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnMTInfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICcxMicgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGRlc2NyaWJlKCdpcyBub3QgbnVsbCBjb25kaXRpb24nLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgcXVlcnkgPSBgVVBEQVRFIE5hbWVzIHt7JSBpZiBleGFtcGxlIGlzIG5vdCBudWxsICV9fSBTRVQgTmFtZSA9ICd7e2V4YW1wbGV9fScge3slIGVsc2UgJX19IFNFVCBOYW1lID0gJ0Nvdycge3slIGVuZGlmICV9fSBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYDtcbiAgICAgICAgICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIHRydWUnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJzEyJ30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnMTInICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGZhbHNlJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge3Blbm55OiAnMTQnfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdDb3cnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBkZXNjcmliZSgnaXMgIW51bGwgY29uZGl0aW9uJywgKCkgPT4ge1xuICAgICAgICAgICAgbGV0IHF1ZXJ5ID0gYFVQREFURSBOYW1lcyB7eyUgaWYgZXhhbXBsZSBpcyAhbnVsbCAlfX0gU0VUIE5hbWUgPSAne3tleGFtcGxlfX0nIHt7JSBlbHNlICV9fSBTRVQgTmFtZSA9ICdDb3cnIHt7JSBlbmRpZiAlfX0gV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2A7XG4gICAgICAgICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiB0cnVlJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICcxMid9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJzEyJyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiBmYWxzZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtwZW5ueTogJzE0J30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnQ293JyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgZGVzY3JpYmUoJz0gY29uZGl0aW9uJywgKCkgPT4ge1xuICAgICAgICAgICAgbGV0IHF1ZXJ5ID0gYFVQREFURSBOYW1lcyB7eyUgaWYgZXhhbXBsZSA9IDEyICV9fSBTRVQgTmFtZSA9ICd7e2V4YW1wbGV9fScge3slIGVsc2UgJX19IFNFVCBOYW1lID0gJ0Nvdycge3slIGVuZGlmICV9fSBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYDtcbiAgICAgICAgICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIHRydWUnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJzEyJ30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnMTInICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGZhbHNlJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICcxNCd9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ0NvdycgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGRlc2NyaWJlKCc9PSBjb25kaXRpb24nLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgcXVlcnkgPSBgVVBEQVRFIE5hbWVzIHt7JSBpZiBleGFtcGxlID09IDEyICV9fSBTRVQgTmFtZSA9ICd7e2V4YW1wbGV9fScge3slIGVsc2UgJX19IFNFVCBOYW1lID0gJ0Nvdycge3slIGVuZGlmICV9fSBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYDtcbiAgICAgICAgICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIHRydWUnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJzEyJ30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnMTInICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGZhbHNlJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICcxNCd9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ0NvdycgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGRlc2NyaWJlKCc9PT0gY29uZGl0aW9uJywgKCkgPT4ge1xuICAgICAgICAgICAgbGV0IHF1ZXJ5ID0gYFVQREFURSBOYW1lcyB7eyUgaWYgZXhhbXBsZSA9PT0gMTIgJX19IFNFVCBOYW1lID0gJ3t7ZXhhbXBsZX19JyB7eyUgZWxzZSAlfX0gU0VUIE5hbWUgPSAnQ293JyB7eyUgZW5kaWYgJX19IFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgO1xuICAgICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgdHJ1ZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnMTInfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICcxMicgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgZmFsc2UnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJzE0J30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnQ293JyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgZGVzY3JpYmUoJyE9IGNvbmRpdGlvbicsICgpID0+IHtcbiAgICAgICAgICAgIGxldCBxdWVyeSA9IGBVUERBVEUgTmFtZXMge3slIGlmIGV4YW1wbGUgIT0gMTIgJX19IFNFVCBOYW1lID0gJ3t7ZXhhbXBsZX19JyB7eyUgZWxzZSAlfX0gU0VUIE5hbWUgPSAnQ293JyB7eyUgZW5kaWYgJX19IFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgO1xuICAgICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgdHJ1ZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnMTInfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdDb3cnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGZhbHNlJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICcxNCd9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJzE0JyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgZGVzY3JpYmUoJyE9PSBjb25kaXRpb24nLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgcXVlcnkgPSBgVVBEQVRFIE5hbWVzIHt7JSBpZiBleGFtcGxlICE9PSAxMiAlfX0gU0VUIE5hbWUgPSAne3tleGFtcGxlfX0nIHt7JSBlbHNlICV9fSBTRVQgTmFtZSA9ICdDb3cnIHt7JSBlbmRpZiAlfX0gV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2A7XG4gICAgICAgICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiB0cnVlJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICcxMid9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ0NvdycgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgZmFsc2UnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJzE0J30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnMTQnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBkZXNjcmliZSgnPiBjb25kaXRpb24nLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgcXVlcnkgPSBgVVBEQVRFIE5hbWVzIHt7JSBpZiBleGFtcGxlID4gMTIgJX19IFNFVCBOYW1lID0gJ3t7ZXhhbXBsZX19JyB7eyUgZWxzZSAlfX0gU0VUIE5hbWUgPSAnQ293JyB7eyUgZW5kaWYgJX19IFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgO1xuICAgICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgdHJ1ZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnMTQnfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICcxNCcgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgZXF1YWwnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJzEyJ30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnQ293JyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiBmYWxzZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnOSd9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ0NvdycgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGRlc2NyaWJlKCc+PSBjb25kaXRpb24nLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgcXVlcnkgPSBgVVBEQVRFIE5hbWVzIHt7JSBpZiBleGFtcGxlID49IDEyICV9fSBTRVQgTmFtZSA9ICd7e2V4YW1wbGV9fScge3slIGVsc2UgJX19IFNFVCBOYW1lID0gJ0Nvdycge3slIGVuZGlmICV9fSBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYDtcbiAgICAgICAgICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIHRydWUnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJzE0J30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnMTQnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGVxdWFsJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICcxMid9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJzEyJyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiBmYWxzZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnOSd9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ0NvdycgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGRlc2NyaWJlKCchPiBjb25kaXRpb24nLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgcXVlcnkgPSBgVVBEQVRFIE5hbWVzIHt7JSBpZiBleGFtcGxlICE+IDEyICV9fSBTRVQgTmFtZSA9ICd7e2V4YW1wbGV9fScge3slIGVsc2UgJX19IFNFVCBOYW1lID0gJ0Nvdycge3slIGVuZGlmICV9fSBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYDtcbiAgICAgICAgICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIHRydWUnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJzE0J30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnQ293JyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiBlcXVhbCcsICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnMTInfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICcxMicgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgZmFsc2UnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJzknfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICc5JyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgZGVzY3JpYmUoJyE+PSBjb25kaXRpb24nLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgcXVlcnkgPSBgVVBEQVRFIE5hbWVzIHt7JSBpZiBleGFtcGxlICE+PSAxMiAlfX0gU0VUIE5hbWUgPSAne3tleGFtcGxlfX0nIHt7JSBlbHNlICV9fSBTRVQgTmFtZSA9ICdDb3cnIHt7JSBlbmRpZiAlfX0gV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2A7XG4gICAgICAgICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiB0cnVlJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICcxNCd9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ0NvdycgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgZXF1YWwnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJzEyJ30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnQ293JyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiBmYWxzZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnOSd9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJzknICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBkZXNjcmliZSgnPCBjb25kaXRpb24nLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgcXVlcnkgPSBgVVBEQVRFIE5hbWVzIHt7JSBpZiBleGFtcGxlIDwgMTIgJX19IFNFVCBOYW1lID0gJ3t7ZXhhbXBsZX19JyB7eyUgZWxzZSAlfX0gU0VUIE5hbWUgPSAnQ293JyB7eyUgZW5kaWYgJX19IFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgO1xuICAgICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgdHJ1ZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnOSd9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJzknICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGVxdWFsJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICcxMid9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ0NvdycgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgZmFsc2UnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJzE0J30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnQ293JyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgZGVzY3JpYmUoJzw9IGNvbmRpdGlvbicsICgpID0+IHtcbiAgICAgICAgICAgIGxldCBxdWVyeSA9IGBVUERBVEUgTmFtZXMge3slIGlmIGV4YW1wbGUgPD0gMTIgJX19IFNFVCBOYW1lID0gJ3t7ZXhhbXBsZX19JyB7eyUgZWxzZSAlfX0gU0VUIE5hbWUgPSAnQ293JyB7eyUgZW5kaWYgJX19IFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgO1xuICAgICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgdHJ1ZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnOSd9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJzknICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGVxdWFsJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICcxMid9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJzEyJyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiBmYWxzZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnMTQnfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdDb3cnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBkZXNjcmliZSgnITwgY29uZGl0aW9uJywgKCkgPT4ge1xuICAgICAgICAgICAgbGV0IHF1ZXJ5ID0gYFVQREFURSBOYW1lcyB7eyUgaWYgZXhhbXBsZSAhPCAxMiAlfX0gU0VUIE5hbWUgPSAne3tleGFtcGxlfX0nIHt7JSBlbHNlICV9fSBTRVQgTmFtZSA9ICdDb3cnIHt7JSBlbmRpZiAlfX0gV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2A7XG4gICAgICAgICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiB0cnVlJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICc5J30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnQ293JyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiBlcXVhbCcsICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnMTInfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICcxMicgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgZmFsc2UnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJzE0J30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnMTQnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBkZXNjcmliZSgnITw9IGNvbmRpdGlvbicsICgpID0+IHtcbiAgICAgICAgICAgIGxldCBxdWVyeSA9IGBVUERBVEUgTmFtZXMge3slIGlmIGV4YW1wbGUgITw9IDEyICV9fSBTRVQgTmFtZSA9ICd7e2V4YW1wbGV9fScge3slIGVsc2UgJX19IFNFVCBOYW1lID0gJ0Nvdycge3slIGVuZGlmICV9fSBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYDtcbiAgICAgICAgICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIHRydWUnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJzknfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdDb3cnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGVxdWFsJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICcxMid9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ0NvdycgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgZmFsc2UnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJzE0J30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnMTQnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBkZXNjcmliZSgnYWJjPiBjb25kaXRpb24nLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgcXVlcnkgPSBgVVBEQVRFIE5hbWVzIHt7JSBpZiBleGFtcGxlIGFiYz4gJ2RyYWdvbicgJX19IFNFVCBOYW1lID0gJ3t7ZXhhbXBsZX19JyB7eyUgZWxzZSAlfX0gU0VUIE5hbWUgPSAnQ293JyB7eyUgZW5kaWYgJX19IFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgO1xuICAgICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgdHJ1ZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnaGVsbG8nfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdoZWxsbycgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgZXF1YWwnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJ2RyYWdvbid9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ0NvdycgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgZmFsc2UnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJ2F3a3dhcmQnfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdDb3cnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBkZXNjcmliZSgnYWJjPj0gY29uZGl0aW9uJywgKCkgPT4ge1xuICAgICAgICAgICAgbGV0IHF1ZXJ5ID0gYFVQREFURSBOYW1lcyB7eyUgaWYgZXhhbXBsZSBhYmM+PSAnZHJhZ29uJyAlfX0gU0VUIE5hbWUgPSAne3tleGFtcGxlfX0nIHt7JSBlbHNlICV9fSBTRVQgTmFtZSA9ICdDb3cnIHt7JSBlbmRpZiAlfX0gV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2A7XG4gICAgICAgICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiB0cnVlJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICdoZWxsbyd9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ2hlbGxvJyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiBlcXVhbCcsICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnZHJhZ29uJ30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnZHJhZ29uJyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiBmYWxzZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnYXdrd2FyZCd9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ0NvdycgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGRlc2NyaWJlKCchYWJjPiBjb25kaXRpb24nLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgcXVlcnkgPSBgVVBEQVRFIE5hbWVzIHt7JSBpZiBleGFtcGxlICFhYmM+ICdkcmFnb24nICV9fSBTRVQgTmFtZSA9ICd7e2V4YW1wbGV9fScge3slIGVsc2UgJX19IFNFVCBOYW1lID0gJ0Nvdycge3slIGVuZGlmICV9fSBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYDtcbiAgICAgICAgICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIHRydWUnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJ2hlbGxvJ30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnQ293JyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiBlcXVhbCcsICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnZHJhZ29uJ30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnZHJhZ29uJyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiBmYWxzZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnYXdrd2FyZCd9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ2F3a3dhcmQnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBkZXNjcmliZSgnIWFiYz49IGNvbmRpdGlvbicsICgpID0+IHtcbiAgICAgICAgICAgIGxldCBxdWVyeSA9IGBVUERBVEUgTmFtZXMge3slIGlmIGV4YW1wbGUgIWFiYz49ICdkcmFnb24nICV9fSBTRVQgTmFtZSA9ICd7e2V4YW1wbGV9fScge3slIGVsc2UgJX19IFNFVCBOYW1lID0gJ0Nvdycge3slIGVuZGlmICV9fSBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYDtcbiAgICAgICAgICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIHRydWUnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJ2hlbGxvJ30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnQ293JyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiBlcXVhbCcsICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnZHJhZ29uJ30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnQ293JyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiBmYWxzZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnYXdrd2FyZCd9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ2F3a3dhcmQnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBkZXNjcmliZSgnYWJjPCBjb25kaXRpb24nLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgcXVlcnkgPSBgVVBEQVRFIE5hbWVzIHt7JSBpZiBleGFtcGxlIGFiYzwgJ2RyYWdvbicgJX19IFNFVCBOYW1lID0gJ3t7ZXhhbXBsZX19JyB7eyUgZWxzZSAlfX0gU0VUIE5hbWUgPSAnQ293JyB7eyUgZW5kaWYgJX19IFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgO1xuICAgICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgdHJ1ZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnYXdrd2FyZCd9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ2F3a3dhcmQnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGVxdWFsJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICdkcmFnb24nfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdDb3cnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGZhbHNlJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICdoZWxsbyd9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ0NvdycgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGRlc2NyaWJlKCdhYmM8PSBjb25kaXRpb24nLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgcXVlcnkgPSBgVVBEQVRFIE5hbWVzIHt7JSBpZiBleGFtcGxlIGFiYzw9ICdkcmFnb24nICV9fSBTRVQgTmFtZSA9ICd7e2V4YW1wbGV9fScge3slIGVsc2UgJX19IFNFVCBOYW1lID0gJ0Nvdycge3slIGVuZGlmICV9fSBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYDtcbiAgICAgICAgICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIHRydWUnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJ2F3a3dhcmQnfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdhd2t3YXJkJyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiBlcXVhbCcsICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnZHJhZ29uJ30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnZHJhZ29uJyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiBmYWxzZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnaGVsbG8nfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdDb3cnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBkZXNjcmliZSgnIWFiYzwgY29uZGl0aW9uJywgKCkgPT4ge1xuICAgICAgICAgICAgbGV0IHF1ZXJ5ID0gYFVQREFURSBOYW1lcyB7eyUgaWYgZXhhbXBsZSAhYWJjPCAnZHJhZ29uJyAlfX0gU0VUIE5hbWUgPSAne3tleGFtcGxlfX0nIHt7JSBlbHNlICV9fSBTRVQgTmFtZSA9ICdDb3cnIHt7JSBlbmRpZiAlfX0gV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2A7XG4gICAgICAgICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiB0cnVlJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICdhd2t3YXJkJ30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnQ293JyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiBlcXVhbCcsICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnZHJhZ29uJ30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnZHJhZ29uJyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiBmYWxzZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnaGVsbG8nfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdoZWxsbycgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGRlc2NyaWJlKCchYWJjPD0gY29uZGl0aW9uJywgKCkgPT4ge1xuICAgICAgICAgICAgbGV0IHF1ZXJ5ID0gYFVQREFURSBOYW1lcyB7eyUgaWYgZXhhbXBsZSAhYWJjPD0gJ2RyYWdvbicgJX19IFNFVCBOYW1lID0gJ3t7ZXhhbXBsZX19JyB7eyUgZWxzZSAlfX0gU0VUIE5hbWUgPSAnQ293JyB7eyUgZW5kaWYgJX19IFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgO1xuICAgICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgdHJ1ZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnYXdrd2FyZCd9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ0NvdycgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgZXF1YWwnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJ2RyYWdvbid9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ0NvdycgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgZmFsc2UnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJ2hlbGxvJ30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnaGVsbG8nICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBkZXNjcmliZSgnbGVuPiBjb25kaXRpb24nLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgcXVlcnkgPSBgVVBEQVRFIE5hbWVzIHt7JSBpZiBleGFtcGxlIGxlbj4gNiAlfX0gU0VUIE5hbWUgPSAne3tleGFtcGxlfX0nIHt7JSBlbHNlICV9fSBTRVQgTmFtZSA9ICdDb3cnIHt7JSBlbmRpZiAlfX0gV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2A7XG4gICAgICAgICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiB0cnVlJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICdwYWxvb3phJ30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAncGFsb296YScgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgZXF1YWwnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJ3NxaWdnbCd9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ0NvdycgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgZmFsc2UnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJ2Z1bid9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ0NvdycgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGRlc2NyaWJlKCdsZW4+PSBjb25kaXRpb24nLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgcXVlcnkgPSBgVVBEQVRFIE5hbWVzIHt7JSBpZiBleGFtcGxlIGxlbj49IDYgJX19IFNFVCBOYW1lID0gJ3t7ZXhhbXBsZX19JyB7eyUgZWxzZSAlfX0gU0VUIE5hbWUgPSAnQ293JyB7eyUgZW5kaWYgJX19IFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgO1xuICAgICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgdHJ1ZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAncGFsb296YSd9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ3BhbG9vemEnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGVxdWFsJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICdzcWlnZ2wnfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdzcWlnZ2wnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGZhbHNlJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICdmdW4nfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdDb3cnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBkZXNjcmliZSgnIWxlbj4gY29uZGl0aW9uJywgKCkgPT4ge1xuICAgICAgICAgICAgbGV0IHF1ZXJ5ID0gYFVQREFURSBOYW1lcyB7eyUgaWYgZXhhbXBsZSAhbGVuPiA2ICV9fSBTRVQgTmFtZSA9ICd7e2V4YW1wbGV9fScge3slIGVsc2UgJX19IFNFVCBOYW1lID0gJ0Nvdycge3slIGVuZGlmICV9fSBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYDtcbiAgICAgICAgICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIHRydWUnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJ3BhbG9vemEnfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdDb3cnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGVxdWFsJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICdzcWlnZ2wnfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdzcWlnZ2wnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGZhbHNlJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICdmdW4nfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdmdW4nICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBkZXNjcmliZSgnIWxlbj49IGNvbmRpdGlvbicsICgpID0+IHtcbiAgICAgICAgICAgIGxldCBxdWVyeSA9IGBVUERBVEUgTmFtZXMge3slIGlmIGV4YW1wbGUgIWxlbj49IDYgJX19IFNFVCBOYW1lID0gJ3t7ZXhhbXBsZX19JyB7eyUgZWxzZSAlfX0gU0VUIE5hbWUgPSAnQ293JyB7eyUgZW5kaWYgJX19IFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgO1xuICAgICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgdHJ1ZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAncGFsb296YSd9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ0NvdycgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgZXF1YWwnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJ3NxaWdnbCd9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ0NvdycgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgZmFsc2UnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJ2Z1bid9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ2Z1bicgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGRlc2NyaWJlKCdsZW48IGNvbmRpdGlvbicsICgpID0+IHtcbiAgICAgICAgICAgIGxldCBxdWVyeSA9IGBVUERBVEUgTmFtZXMge3slIGlmIGV4YW1wbGUgbGVuPCA2ICV9fSBTRVQgTmFtZSA9ICd7e2V4YW1wbGV9fScge3slIGVsc2UgJX19IFNFVCBOYW1lID0gJ0Nvdycge3slIGVuZGlmICV9fSBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYDtcbiAgICAgICAgICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIHRydWUnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJ2Z1bid9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ2Z1bicgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgZXF1YWwnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJ3NxaWdnbCd9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ0NvdycgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgZmFsc2UnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJ3BhbG9vemEnfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdDb3cnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBkZXNjcmliZSgnbGVuPD0gY29uZGl0aW9uJywgKCkgPT4ge1xuICAgICAgICAgICAgbGV0IHF1ZXJ5ID0gYFVQREFURSBOYW1lcyB7eyUgaWYgZXhhbXBsZSBsZW48PSA2ICV9fSBTRVQgTmFtZSA9ICd7e2V4YW1wbGV9fScge3slIGVsc2UgJX19IFNFVCBOYW1lID0gJ0Nvdycge3slIGVuZGlmICV9fSBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYDtcbiAgICAgICAgICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIHRydWUnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJ2Z1bid9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ2Z1bicgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgZXF1YWwnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJ3NxaWdnbCd9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ3NxaWdnbCcgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgZmFsc2UnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJ3BhbG9vemEnfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdDb3cnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBkZXNjcmliZSgnIWxlbjwgY29uZGl0aW9uJywgKCkgPT4ge1xuICAgICAgICAgICAgbGV0IHF1ZXJ5ID0gYFVQREFURSBOYW1lcyB7eyUgaWYgZXhhbXBsZSAhbGVuPCA2ICV9fSBTRVQgTmFtZSA9ICd7e2V4YW1wbGV9fScge3slIGVsc2UgJX19IFNFVCBOYW1lID0gJ0Nvdycge3slIGVuZGlmICV9fSBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYDtcbiAgICAgICAgICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIHRydWUnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJ2Z1bid9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ0NvdycgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgZXF1YWwnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJ3NxaWdnbCd9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ3NxaWdnbCcgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgZmFsc2UnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJ3BhbG9vemEnfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdwYWxvb3phJyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgZGVzY3JpYmUoJyFsZW48PSBjb25kaXRpb24nLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgcXVlcnkgPSBgVVBEQVRFIE5hbWVzIHt7JSBpZiBleGFtcGxlICFsZW48PSA2ICV9fSBTRVQgTmFtZSA9ICd7e2V4YW1wbGV9fScge3slIGVsc2UgJX19IFNFVCBOYW1lID0gJ0Nvdycge3slIGVuZGlmICV9fSBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYDtcbiAgICAgICAgICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIHRydWUnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJ2Z1bid9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ0NvdycgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgZXF1YWwnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJ3NxaWdnbCd9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ0NvdycgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgZmFsc2UnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJ3BhbG9vemEnfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdwYWxvb3phJyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgZGVzY3JpYmUoJ2lzIE5hTiBjb25kaXRpb24nLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgcXVlcnkgPSBgVVBEQVRFIE5hbWVzIHt7JSBpZiBleGFtcGxlIGlzIE5hTiAlfX0gU0VUIE5hbWUgPSAnQ293JyB7eyUgZWxzZSAlfX0gU0VUIE5hbWUgPSAne3tleGFtcGxlfX0nIHt7JSBlbmRpZiAlfX0gV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2A7XG4gICAgICAgICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiB0cnVlJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICdkcmFnb24nfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdDb3cnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGZhbHNlJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICcxMid9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJzEyJyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgZGVzY3JpYmUoJ2lzIG5vdCBOYU4gY29uZGl0aW9uJywgKCkgPT4ge1xuICAgICAgICAgICAgbGV0IHF1ZXJ5ID0gYFVQREFURSBOYW1lcyB7eyUgaWYgZXhhbXBsZSBpcyBub3QgTmFOICV9fSBTRVQgTmFtZSA9ICd7e2V4YW1wbGV9fScge3slIGVsc2UgJX19IFNFVCBOYW1lID0gJ0Nvdycge3slIGVuZGlmICV9fSBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYDtcbiAgICAgICAgICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIHRydWUnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJzEyJ30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnMTInICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGZhbHNlJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICdkcmFnb24nfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdDb3cnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBkZXNjcmliZSgnaXMgIU5hTiBjb25kaXRpb24nLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgcXVlcnkgPSBgVVBEQVRFIE5hbWVzIHt7JSBpZiBleGFtcGxlIGlzICFOYU4gJX19IFNFVCBOYW1lID0gJ3t7ZXhhbXBsZX19JyB7eyUgZWxzZSAlfX0gU0VUIE5hbWUgPSAnQ293JyB7eyUgZW5kaWYgJX19IFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgO1xuICAgICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgdHJ1ZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnMTInfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICcxMicgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgZmFsc2UnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJ2RyYWdvbid9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ0NvdycgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGRlc2NyaWJlKCdiZXR3ZWVuIGNvbmRpdGlvbicsICgpID0+IHtcbiAgICAgICAgICAgIGxldCBxdWVyeSA9IGBVUERBVEUgTmFtZXMge3slIGlmIGV4YW1wbGUgMTA+PDIwICV9fSBTRVQgTmFtZSA9ICd7e2V4YW1wbGV9fScge3slIGVsc2UgJX19IFNFVCBOYW1lID0gJ0Nvdycge3slIGVuZGlmICV9fSBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYDtcbiAgICAgICAgICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIHRydWUnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogMTV9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJzE1JyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiBlcXVhbCB0byB0aGUgbG93IG51bWJlcicsICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAxMH0pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnQ293JyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiBlcXVhbCB0byB0aGUgaGlnaCBudW1iZXInLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogMjB9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ0NvdycgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgYmVsb3cgdGhlIGxvdyBudW1iZXInLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogNX0pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnQ293JyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiBhYm92ZSB0aGUgaGlnaCBudW1iZXInLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogMjV9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ0NvdycgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGRlc2NyaWJlKCchYmV0d2VlbiBjb25kaXRpb24nLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgcXVlcnkgPSBgVVBEQVRFIE5hbWVzIHt7JSBpZiBleGFtcGxlIDEwPiE8MjAgJX19IFNFVCBOYW1lID0gJ3t7ZXhhbXBsZX19JyB7eyUgZWxzZSAlfX0gU0VUIE5hbWUgPSAnQ293JyB7eyUgZW5kaWYgJX19IFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgO1xuICAgICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgdHJ1ZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAxNX0pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnQ293JyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiBlcXVhbCB0byB0aGUgbG93IG51bWJlcicsICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAxMH0pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnMTAnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGVxdWFsIHRvIHRoZSBoaWdoIG51bWJlcicsICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAyMH0pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnMjAnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGJlbG93IHRoZSBsb3cgbnVtYmVyJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6IDV9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJzUnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGFib3ZlIHRoZSBoaWdoIG51bWJlcicsICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAyNX0pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnMjUnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBkZXNjcmliZSgnYmV0d2Vlbj0gY29uZGl0aW9uJywgKCkgPT4ge1xuICAgICAgICAgICAgbGV0IHF1ZXJ5ID0gYFVQREFURSBOYW1lcyB7eyUgaWYgZXhhbXBsZSAxMD49PDIwICV9fSBTRVQgTmFtZSA9ICd7e2V4YW1wbGV9fScge3slIGVsc2UgJX19IFNFVCBOYW1lID0gJ0Nvdycge3slIGVuZGlmICV9fSBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYDtcbiAgICAgICAgICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIHRydWUnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogMTV9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJzE1JyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiBlcXVhbCB0byB0aGUgbG93IG51bWJlcicsICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAxMH0pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnMTAnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGVxdWFsIHRvIHRoZSBoaWdoIG51bWJlcicsICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAyMH0pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnMjAnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGJlbG93IHRoZSBsb3cgbnVtYmVyJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6IDV9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ0NvdycgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgYWJvdmUgdGhlIGhpZ2ggbnVtYmVyJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6IDI1fSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdDb3cnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgIH0pO1xuICAgIFxuICAgIGRlc2NyaWJlKCd1bmxlc3MgYWN0aW9uJywgKCkgPT4ge1xuICAgICAgICBcbiAgICAgICAgZGVzY3JpYmUoJ2lzIG51bGwgY29uZGl0aW9uJywgKCkgPT4ge1xuICAgICAgICAgICAgbGV0IHF1ZXJ5ID0gYFVQREFURSBOYW1lcyB7eyUgdW5sZXNzIGV4YW1wbGUgaXMgbnVsbCAlfX0gU0VUIE5hbWUgPSAne3tleGFtcGxlfX0nIHt7JSBlbHNlICV9fSBTRVQgTmFtZSA9ICdDb3cnIHt7JSBlbmR1bmxlc3MgJX19IFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgO1xuICAgICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgdHJ1ZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtwZW5ueTogJzEyJ30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnQ293JyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiBmYWxzZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnMTInfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICcxMicgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGRlc2NyaWJlKCdpcyBub3QgbnVsbCBjb25kaXRpb24nLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgcXVlcnkgPSBgVVBEQVRFIE5hbWVzIHt7JSB1bmxlc3MgZXhhbXBsZSBpcyBub3QgbnVsbCAlfX0gU0VUIE5hbWUgPSAnQ293JyB7eyUgZWxzZSAlfX0gU0VUIE5hbWUgPSAne3tleGFtcGxlfX0nIHt7JSBlbmR1bmxlc3MgJX19IFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgO1xuICAgICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgdHJ1ZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnMTInfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICcxMicgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgZmFsc2UnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7cGVubnk6ICcxNCd9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ0NvdycgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGRlc2NyaWJlKCdpcyAhbnVsbCBjb25kaXRpb24nLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgcXVlcnkgPSBgVVBEQVRFIE5hbWVzIHt7JSB1bmxlc3MgZXhhbXBsZSBpcyAhbnVsbCAlfX0gU0VUIE5hbWUgPSAnQ293JyB7eyUgZWxzZSAlfX0gU0VUIE5hbWUgPSAne3tleGFtcGxlfX0nIHt7JSBlbmR1bmxlc3MgJX19IFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgO1xuICAgICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgdHJ1ZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnMTInfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICcxMicgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgZmFsc2UnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7cGVubnk6ICcxNCd9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ0NvdycgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vIGRlc2NyaWJlKCc9IGNvbmRpdGlvbicsICgpID0+IHtcbiAgICAgICAgLy8gICAgIGxldCBxdWVyeSA9IGBVUERBVEUgTmFtZXMge3slIGlmIGV4YW1wbGUgPSAxMiAlfX0gU0VUIE5hbWUgPSAne3tleGFtcGxlfX0nIHt7JSBlbHNlICV9fSBTRVQgTmFtZSA9ICdDb3cnIHt7JSBlbmRpZiAlfX0gV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2A7XG4gICAgICAgIC8vICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiB0cnVlJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICcxMid9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJzEyJyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiBmYWxzZScsICgpID0+IHtcbiAgICAgICAgLy8gICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnMTQnfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdDb3cnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy8gfSk7XG4gICAgICAgIFxuICAgICAgICAvLyBkZXNjcmliZSgnPT0gY29uZGl0aW9uJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgbGV0IHF1ZXJ5ID0gYFVQREFURSBOYW1lcyB7eyUgaWYgZXhhbXBsZSA9PSAxMiAlfX0gU0VUIE5hbWUgPSAne3tleGFtcGxlfX0nIHt7JSBlbHNlICV9fSBTRVQgTmFtZSA9ICdDb3cnIHt7JSBlbmRpZiAlfX0gV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2A7XG4gICAgICAgIC8vICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiB0cnVlJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICcxMid9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJzEyJyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiBmYWxzZScsICgpID0+IHtcbiAgICAgICAgLy8gICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnMTQnfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdDb3cnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy8gfSk7XG4gICAgICAgIFxuICAgICAgICAvLyBkZXNjcmliZSgnPT09IGNvbmRpdGlvbicsICgpID0+IHtcbiAgICAgICAgLy8gICAgIGxldCBxdWVyeSA9IGBVUERBVEUgTmFtZXMge3slIGlmIGV4YW1wbGUgPT09IDEyICV9fSBTRVQgTmFtZSA9ICd7e2V4YW1wbGV9fScge3slIGVsc2UgJX19IFNFVCBOYW1lID0gJ0Nvdycge3slIGVuZGlmICV9fSBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYDtcbiAgICAgICAgLy8gICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIHRydWUnLCAoKSA9PiB7XG4gICAgICAgIC8vICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJzEyJ30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnMTInICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy8gICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGZhbHNlJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICcxNCd9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ0NvdycgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAvLyB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vIGRlc2NyaWJlKCchPSBjb25kaXRpb24nLCAoKSA9PiB7XG4gICAgICAgIC8vICAgICBsZXQgcXVlcnkgPSBgVVBEQVRFIE5hbWVzIHt7JSBpZiBleGFtcGxlICE9IDEyICV9fSBTRVQgTmFtZSA9ICd7e2V4YW1wbGV9fScge3slIGVsc2UgJX19IFNFVCBOYW1lID0gJ0Nvdycge3slIGVuZGlmICV9fSBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYDtcbiAgICAgICAgLy8gICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIHRydWUnLCAoKSA9PiB7XG4gICAgICAgIC8vICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJzEyJ30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnQ293JyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiBmYWxzZScsICgpID0+IHtcbiAgICAgICAgLy8gICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnMTQnfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICcxNCcgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAvLyB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vIGRlc2NyaWJlKCchPT0gY29uZGl0aW9uJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgbGV0IHF1ZXJ5ID0gYFVQREFURSBOYW1lcyB7eyUgaWYgZXhhbXBsZSAhPT0gMTIgJX19IFNFVCBOYW1lID0gJ3t7ZXhhbXBsZX19JyB7eyUgZWxzZSAlfX0gU0VUIE5hbWUgPSAnQ293JyB7eyUgZW5kaWYgJX19IFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgO1xuICAgICAgICAvLyAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgdHJ1ZScsICgpID0+IHtcbiAgICAgICAgLy8gICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnMTInfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdDb3cnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy8gICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGZhbHNlJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICcxNCd9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJzE0JyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vIH0pO1xuICAgICAgICBcbiAgICAgICAgLy8gZGVzY3JpYmUoJz4gY29uZGl0aW9uJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgbGV0IHF1ZXJ5ID0gYFVQREFURSBOYW1lcyB7eyUgaWYgZXhhbXBsZSA+IDEyICV9fSBTRVQgTmFtZSA9ICd7e2V4YW1wbGV9fScge3slIGVsc2UgJX19IFNFVCBOYW1lID0gJ0Nvdycge3slIGVuZGlmICV9fSBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYDtcbiAgICAgICAgLy8gICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIHRydWUnLCAoKSA9PiB7XG4gICAgICAgIC8vICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJzE0J30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnMTQnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy8gICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGVxdWFsJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICcxMid9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ0NvdycgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAvLyAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgZmFsc2UnLCAoKSA9PiB7XG4gICAgICAgIC8vICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJzknfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdDb3cnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy8gfSk7XG4gICAgICAgIFxuICAgICAgICAvLyBkZXNjcmliZSgnPj0gY29uZGl0aW9uJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgbGV0IHF1ZXJ5ID0gYFVQREFURSBOYW1lcyB7eyUgaWYgZXhhbXBsZSA+PSAxMiAlfX0gU0VUIE5hbWUgPSAne3tleGFtcGxlfX0nIHt7JSBlbHNlICV9fSBTRVQgTmFtZSA9ICdDb3cnIHt7JSBlbmRpZiAlfX0gV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2A7XG4gICAgICAgIC8vICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiB0cnVlJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICcxNCd9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJzE0JyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiBlcXVhbCcsICgpID0+IHtcbiAgICAgICAgLy8gICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnMTInfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICcxMicgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAvLyAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgZmFsc2UnLCAoKSA9PiB7XG4gICAgICAgIC8vICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJzknfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdDb3cnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy8gfSk7XG4gICAgICAgIFxuICAgICAgICAvLyBkZXNjcmliZSgnIT4gY29uZGl0aW9uJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgbGV0IHF1ZXJ5ID0gYFVQREFURSBOYW1lcyB7eyUgaWYgZXhhbXBsZSAhPiAxMiAlfX0gU0VUIE5hbWUgPSAne3tleGFtcGxlfX0nIHt7JSBlbHNlICV9fSBTRVQgTmFtZSA9ICdDb3cnIHt7JSBlbmRpZiAlfX0gV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2A7XG4gICAgICAgIC8vICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiB0cnVlJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICcxNCd9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ0NvdycgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAvLyAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgZXF1YWwnLCAoKSA9PiB7XG4gICAgICAgIC8vICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJzEyJ30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnMTInICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy8gICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGZhbHNlJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICc5J30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnOScgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAvLyB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vIGRlc2NyaWJlKCchPj0gY29uZGl0aW9uJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgbGV0IHF1ZXJ5ID0gYFVQREFURSBOYW1lcyB7eyUgaWYgZXhhbXBsZSAhPj0gMTIgJX19IFNFVCBOYW1lID0gJ3t7ZXhhbXBsZX19JyB7eyUgZWxzZSAlfX0gU0VUIE5hbWUgPSAnQ293JyB7eyUgZW5kaWYgJX19IFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgO1xuICAgICAgICAvLyAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgdHJ1ZScsICgpID0+IHtcbiAgICAgICAgLy8gICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnMTQnfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdDb3cnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy8gICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGVxdWFsJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICcxMid9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ0NvdycgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAvLyAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgZmFsc2UnLCAoKSA9PiB7XG4gICAgICAgIC8vICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJzknfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICc5JyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vIH0pO1xuICAgICAgICBcbiAgICAgICAgLy8gZGVzY3JpYmUoJzwgY29uZGl0aW9uJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgbGV0IHF1ZXJ5ID0gYFVQREFURSBOYW1lcyB7eyUgaWYgZXhhbXBsZSA8IDEyICV9fSBTRVQgTmFtZSA9ICd7e2V4YW1wbGV9fScge3slIGVsc2UgJX19IFNFVCBOYW1lID0gJ0Nvdycge3slIGVuZGlmICV9fSBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYDtcbiAgICAgICAgLy8gICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIHRydWUnLCAoKSA9PiB7XG4gICAgICAgIC8vICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJzknfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICc5JyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiBlcXVhbCcsICgpID0+IHtcbiAgICAgICAgLy8gICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnMTInfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdDb3cnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy8gICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGZhbHNlJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICcxNCd9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ0NvdycgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAvLyB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vIGRlc2NyaWJlKCc8PSBjb25kaXRpb24nLCAoKSA9PiB7XG4gICAgICAgIC8vICAgICBsZXQgcXVlcnkgPSBgVVBEQVRFIE5hbWVzIHt7JSBpZiBleGFtcGxlIDw9IDEyICV9fSBTRVQgTmFtZSA9ICd7e2V4YW1wbGV9fScge3slIGVsc2UgJX19IFNFVCBOYW1lID0gJ0Nvdycge3slIGVuZGlmICV9fSBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYDtcbiAgICAgICAgLy8gICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIHRydWUnLCAoKSA9PiB7XG4gICAgICAgIC8vICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJzknfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICc5JyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiBlcXVhbCcsICgpID0+IHtcbiAgICAgICAgLy8gICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnMTInfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICcxMicgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAvLyAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgZmFsc2UnLCAoKSA9PiB7XG4gICAgICAgIC8vICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJzE0J30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnQ293JyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vIH0pO1xuICAgICAgICBcbiAgICAgICAgLy8gZGVzY3JpYmUoJyE8IGNvbmRpdGlvbicsICgpID0+IHtcbiAgICAgICAgLy8gICAgIGxldCBxdWVyeSA9IGBVUERBVEUgTmFtZXMge3slIGlmIGV4YW1wbGUgITwgMTIgJX19IFNFVCBOYW1lID0gJ3t7ZXhhbXBsZX19JyB7eyUgZWxzZSAlfX0gU0VUIE5hbWUgPSAnQ293JyB7eyUgZW5kaWYgJX19IFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgO1xuICAgICAgICAvLyAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgdHJ1ZScsICgpID0+IHtcbiAgICAgICAgLy8gICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnOSd9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ0NvdycgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAvLyAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgZXF1YWwnLCAoKSA9PiB7XG4gICAgICAgIC8vICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJzEyJ30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnMTInICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy8gICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGZhbHNlJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICcxNCd9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJzE0JyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vIH0pO1xuICAgICAgICBcbiAgICAgICAgLy8gZGVzY3JpYmUoJyE8PSBjb25kaXRpb24nLCAoKSA9PiB7XG4gICAgICAgIC8vICAgICBsZXQgcXVlcnkgPSBgVVBEQVRFIE5hbWVzIHt7JSBpZiBleGFtcGxlICE8PSAxMiAlfX0gU0VUIE5hbWUgPSAne3tleGFtcGxlfX0nIHt7JSBlbHNlICV9fSBTRVQgTmFtZSA9ICdDb3cnIHt7JSBlbmRpZiAlfX0gV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2A7XG4gICAgICAgIC8vICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiB0cnVlJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICc5J30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnQ293JyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiBlcXVhbCcsICgpID0+IHtcbiAgICAgICAgLy8gICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnMTInfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdDb3cnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy8gICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGZhbHNlJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICcxNCd9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJzE0JyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vIH0pO1xuICAgICAgICBcbiAgICAgICAgLy8gZGVzY3JpYmUoJ2FiYz4gY29uZGl0aW9uJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgbGV0IHF1ZXJ5ID0gYFVQREFURSBOYW1lcyB7eyUgaWYgZXhhbXBsZSBhYmM+ICdkcmFnb24nICV9fSBTRVQgTmFtZSA9ICd7e2V4YW1wbGV9fScge3slIGVsc2UgJX19IFNFVCBOYW1lID0gJ0Nvdycge3slIGVuZGlmICV9fSBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYDtcbiAgICAgICAgLy8gICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIHRydWUnLCAoKSA9PiB7XG4gICAgICAgIC8vICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJ2hlbGxvJ30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnaGVsbG8nICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy8gICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGVxdWFsJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICdkcmFnb24nfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdDb3cnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy8gICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGZhbHNlJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICdhd2t3YXJkJ30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnQ293JyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vIH0pO1xuICAgICAgICBcbiAgICAgICAgLy8gZGVzY3JpYmUoJ2FiYz49IGNvbmRpdGlvbicsICgpID0+IHtcbiAgICAgICAgLy8gICAgIGxldCBxdWVyeSA9IGBVUERBVEUgTmFtZXMge3slIGlmIGV4YW1wbGUgYWJjPj0gJ2RyYWdvbicgJX19IFNFVCBOYW1lID0gJ3t7ZXhhbXBsZX19JyB7eyUgZWxzZSAlfX0gU0VUIE5hbWUgPSAnQ293JyB7eyUgZW5kaWYgJX19IFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgO1xuICAgICAgICAvLyAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgdHJ1ZScsICgpID0+IHtcbiAgICAgICAgLy8gICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnaGVsbG8nfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdoZWxsbycgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAvLyAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgZXF1YWwnLCAoKSA9PiB7XG4gICAgICAgIC8vICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJ2RyYWdvbid9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ2RyYWdvbicgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAvLyAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgZmFsc2UnLCAoKSA9PiB7XG4gICAgICAgIC8vICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJ2F3a3dhcmQnfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdDb3cnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy8gfSk7XG4gICAgICAgIFxuICAgICAgICAvLyBkZXNjcmliZSgnIWFiYz4gY29uZGl0aW9uJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgbGV0IHF1ZXJ5ID0gYFVQREFURSBOYW1lcyB7eyUgaWYgZXhhbXBsZSAhYWJjPiAnZHJhZ29uJyAlfX0gU0VUIE5hbWUgPSAne3tleGFtcGxlfX0nIHt7JSBlbHNlICV9fSBTRVQgTmFtZSA9ICdDb3cnIHt7JSBlbmRpZiAlfX0gV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2A7XG4gICAgICAgIC8vICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiB0cnVlJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICdoZWxsbyd9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ0NvdycgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAvLyAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgZXF1YWwnLCAoKSA9PiB7XG4gICAgICAgIC8vICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJ2RyYWdvbid9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ2RyYWdvbicgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAvLyAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgZmFsc2UnLCAoKSA9PiB7XG4gICAgICAgIC8vICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJ2F3a3dhcmQnfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdhd2t3YXJkJyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vIH0pO1xuICAgICAgICBcbiAgICAgICAgLy8gZGVzY3JpYmUoJyFhYmM+PSBjb25kaXRpb24nLCAoKSA9PiB7XG4gICAgICAgIC8vICAgICBsZXQgcXVlcnkgPSBgVVBEQVRFIE5hbWVzIHt7JSBpZiBleGFtcGxlICFhYmM+PSAnZHJhZ29uJyAlfX0gU0VUIE5hbWUgPSAne3tleGFtcGxlfX0nIHt7JSBlbHNlICV9fSBTRVQgTmFtZSA9ICdDb3cnIHt7JSBlbmRpZiAlfX0gV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2A7XG4gICAgICAgIC8vICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiB0cnVlJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICdoZWxsbyd9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ0NvdycgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAvLyAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgZXF1YWwnLCAoKSA9PiB7XG4gICAgICAgIC8vICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJ2RyYWdvbid9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ0NvdycgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAvLyAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgZmFsc2UnLCAoKSA9PiB7XG4gICAgICAgIC8vICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJ2F3a3dhcmQnfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdhd2t3YXJkJyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vIH0pO1xuICAgICAgICBcbiAgICAgICAgLy8gZGVzY3JpYmUoJ2FiYzwgY29uZGl0aW9uJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgbGV0IHF1ZXJ5ID0gYFVQREFURSBOYW1lcyB7eyUgaWYgZXhhbXBsZSBhYmM8ICdkcmFnb24nICV9fSBTRVQgTmFtZSA9ICd7e2V4YW1wbGV9fScge3slIGVsc2UgJX19IFNFVCBOYW1lID0gJ0Nvdycge3slIGVuZGlmICV9fSBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYDtcbiAgICAgICAgLy8gICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIHRydWUnLCAoKSA9PiB7XG4gICAgICAgIC8vICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJ2F3a3dhcmQnfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdhd2t3YXJkJyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiBlcXVhbCcsICgpID0+IHtcbiAgICAgICAgLy8gICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnZHJhZ29uJ30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnQ293JyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiBmYWxzZScsICgpID0+IHtcbiAgICAgICAgLy8gICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnaGVsbG8nfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdDb3cnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy8gfSk7XG4gICAgICAgIFxuICAgICAgICAvLyBkZXNjcmliZSgnYWJjPD0gY29uZGl0aW9uJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgbGV0IHF1ZXJ5ID0gYFVQREFURSBOYW1lcyB7eyUgaWYgZXhhbXBsZSBhYmM8PSAnZHJhZ29uJyAlfX0gU0VUIE5hbWUgPSAne3tleGFtcGxlfX0nIHt7JSBlbHNlICV9fSBTRVQgTmFtZSA9ICdDb3cnIHt7JSBlbmRpZiAlfX0gV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2A7XG4gICAgICAgIC8vICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiB0cnVlJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICdhd2t3YXJkJ30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnYXdrd2FyZCcgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAvLyAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgZXF1YWwnLCAoKSA9PiB7XG4gICAgICAgIC8vICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJ2RyYWdvbid9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ2RyYWdvbicgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAvLyAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgZmFsc2UnLCAoKSA9PiB7XG4gICAgICAgIC8vICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJ2hlbGxvJ30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnQ293JyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vIH0pO1xuICAgICAgICBcbiAgICAgICAgLy8gZGVzY3JpYmUoJyFhYmM8IGNvbmRpdGlvbicsICgpID0+IHtcbiAgICAgICAgLy8gICAgIGxldCBxdWVyeSA9IGBVUERBVEUgTmFtZXMge3slIGlmIGV4YW1wbGUgIWFiYzwgJ2RyYWdvbicgJX19IFNFVCBOYW1lID0gJ3t7ZXhhbXBsZX19JyB7eyUgZWxzZSAlfX0gU0VUIE5hbWUgPSAnQ293JyB7eyUgZW5kaWYgJX19IFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgO1xuICAgICAgICAvLyAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgdHJ1ZScsICgpID0+IHtcbiAgICAgICAgLy8gICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnYXdrd2FyZCd9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ0NvdycgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAvLyAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgZXF1YWwnLCAoKSA9PiB7XG4gICAgICAgIC8vICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJ2RyYWdvbid9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ2RyYWdvbicgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAvLyAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgZmFsc2UnLCAoKSA9PiB7XG4gICAgICAgIC8vICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJ2hlbGxvJ30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnaGVsbG8nICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy8gfSk7XG4gICAgICAgIFxuICAgICAgICAvLyBkZXNjcmliZSgnIWFiYzw9IGNvbmRpdGlvbicsICgpID0+IHtcbiAgICAgICAgLy8gICAgIGxldCBxdWVyeSA9IGBVUERBVEUgTmFtZXMge3slIGlmIGV4YW1wbGUgIWFiYzw9ICdkcmFnb24nICV9fSBTRVQgTmFtZSA9ICd7e2V4YW1wbGV9fScge3slIGVsc2UgJX19IFNFVCBOYW1lID0gJ0Nvdycge3slIGVuZGlmICV9fSBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYDtcbiAgICAgICAgLy8gICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIHRydWUnLCAoKSA9PiB7XG4gICAgICAgIC8vICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJ2F3a3dhcmQnfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdDb3cnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy8gICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGVxdWFsJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICdkcmFnb24nfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdDb3cnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy8gICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGZhbHNlJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICdoZWxsbyd9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ2hlbGxvJyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vIH0pO1xuICAgICAgICBcbiAgICAgICAgLy8gZGVzY3JpYmUoJ2xlbj4gY29uZGl0aW9uJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgbGV0IHF1ZXJ5ID0gYFVQREFURSBOYW1lcyB7eyUgaWYgZXhhbXBsZSBsZW4+IDYgJX19IFNFVCBOYW1lID0gJ3t7ZXhhbXBsZX19JyB7eyUgZWxzZSAlfX0gU0VUIE5hbWUgPSAnQ293JyB7eyUgZW5kaWYgJX19IFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgO1xuICAgICAgICAvLyAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgdHJ1ZScsICgpID0+IHtcbiAgICAgICAgLy8gICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAncGFsb296YSd9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ3BhbG9vemEnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy8gICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGVxdWFsJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICdzcWlnZ2wnfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdDb3cnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy8gICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGZhbHNlJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICdmdW4nfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdDb3cnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy8gfSk7XG4gICAgICAgIFxuICAgICAgICAvLyBkZXNjcmliZSgnbGVuPj0gY29uZGl0aW9uJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgbGV0IHF1ZXJ5ID0gYFVQREFURSBOYW1lcyB7eyUgaWYgZXhhbXBsZSBsZW4+PSA2ICV9fSBTRVQgTmFtZSA9ICd7e2V4YW1wbGV9fScge3slIGVsc2UgJX19IFNFVCBOYW1lID0gJ0Nvdycge3slIGVuZGlmICV9fSBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYDtcbiAgICAgICAgLy8gICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIHRydWUnLCAoKSA9PiB7XG4gICAgICAgIC8vICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJ3BhbG9vemEnfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdwYWxvb3phJyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiBlcXVhbCcsICgpID0+IHtcbiAgICAgICAgLy8gICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnc3FpZ2dsJ30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnc3FpZ2dsJyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiBmYWxzZScsICgpID0+IHtcbiAgICAgICAgLy8gICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnZnVuJ30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnQ293JyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vIH0pO1xuICAgICAgICBcbiAgICAgICAgLy8gZGVzY3JpYmUoJyFsZW4+IGNvbmRpdGlvbicsICgpID0+IHtcbiAgICAgICAgLy8gICAgIGxldCBxdWVyeSA9IGBVUERBVEUgTmFtZXMge3slIGlmIGV4YW1wbGUgIWxlbj4gNiAlfX0gU0VUIE5hbWUgPSAne3tleGFtcGxlfX0nIHt7JSBlbHNlICV9fSBTRVQgTmFtZSA9ICdDb3cnIHt7JSBlbmRpZiAlfX0gV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2A7XG4gICAgICAgIC8vICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiB0cnVlJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICdwYWxvb3phJ30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnQ293JyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiBlcXVhbCcsICgpID0+IHtcbiAgICAgICAgLy8gICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnc3FpZ2dsJ30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnc3FpZ2dsJyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiBmYWxzZScsICgpID0+IHtcbiAgICAgICAgLy8gICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnZnVuJ30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnZnVuJyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vIH0pO1xuICAgICAgICBcbiAgICAgICAgLy8gZGVzY3JpYmUoJyFsZW4+PSBjb25kaXRpb24nLCAoKSA9PiB7XG4gICAgICAgIC8vICAgICBsZXQgcXVlcnkgPSBgVVBEQVRFIE5hbWVzIHt7JSBpZiBleGFtcGxlICFsZW4+PSA2ICV9fSBTRVQgTmFtZSA9ICd7e2V4YW1wbGV9fScge3slIGVsc2UgJX19IFNFVCBOYW1lID0gJ0Nvdycge3slIGVuZGlmICV9fSBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYDtcbiAgICAgICAgLy8gICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIHRydWUnLCAoKSA9PiB7XG4gICAgICAgIC8vICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJ3BhbG9vemEnfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdDb3cnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy8gICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGVxdWFsJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICdzcWlnZ2wnfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdDb3cnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy8gICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGZhbHNlJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICdmdW4nfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdmdW4nICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy8gfSk7XG4gICAgICAgIFxuICAgICAgICAvLyBkZXNjcmliZSgnbGVuPCBjb25kaXRpb24nLCAoKSA9PiB7XG4gICAgICAgIC8vICAgICBsZXQgcXVlcnkgPSBgVVBEQVRFIE5hbWVzIHt7JSBpZiBleGFtcGxlIGxlbjwgNiAlfX0gU0VUIE5hbWUgPSAne3tleGFtcGxlfX0nIHt7JSBlbHNlICV9fSBTRVQgTmFtZSA9ICdDb3cnIHt7JSBlbmRpZiAlfX0gV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2A7XG4gICAgICAgIC8vICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiB0cnVlJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICdmdW4nfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdmdW4nICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy8gICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGVxdWFsJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICdzcWlnZ2wnfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdDb3cnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy8gICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGZhbHNlJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICdwYWxvb3phJ30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnQ293JyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vIH0pO1xuICAgICAgICBcbiAgICAgICAgLy8gZGVzY3JpYmUoJ2xlbjw9IGNvbmRpdGlvbicsICgpID0+IHtcbiAgICAgICAgLy8gICAgIGxldCBxdWVyeSA9IGBVUERBVEUgTmFtZXMge3slIGlmIGV4YW1wbGUgbGVuPD0gNiAlfX0gU0VUIE5hbWUgPSAne3tleGFtcGxlfX0nIHt7JSBlbHNlICV9fSBTRVQgTmFtZSA9ICdDb3cnIHt7JSBlbmRpZiAlfX0gV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2A7XG4gICAgICAgIC8vICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiB0cnVlJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICdmdW4nfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdmdW4nICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy8gICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGVxdWFsJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICdzcWlnZ2wnfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdzcWlnZ2wnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy8gICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGZhbHNlJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICdwYWxvb3phJ30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnQ293JyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vIH0pO1xuICAgICAgICBcbiAgICAgICAgLy8gZGVzY3JpYmUoJyFsZW48IGNvbmRpdGlvbicsICgpID0+IHtcbiAgICAgICAgLy8gICAgIGxldCBxdWVyeSA9IGBVUERBVEUgTmFtZXMge3slIGlmIGV4YW1wbGUgIWxlbjwgNiAlfX0gU0VUIE5hbWUgPSAne3tleGFtcGxlfX0nIHt7JSBlbHNlICV9fSBTRVQgTmFtZSA9ICdDb3cnIHt7JSBlbmRpZiAlfX0gV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2A7XG4gICAgICAgIC8vICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiB0cnVlJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICdmdW4nfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdDb3cnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy8gICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGVxdWFsJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICdzcWlnZ2wnfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdzcWlnZ2wnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy8gICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGZhbHNlJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICdwYWxvb3phJ30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAncGFsb296YScgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAvLyB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vIGRlc2NyaWJlKCchbGVuPD0gY29uZGl0aW9uJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgbGV0IHF1ZXJ5ID0gYFVQREFURSBOYW1lcyB7eyUgaWYgZXhhbXBsZSAhbGVuPD0gNiAlfX0gU0VUIE5hbWUgPSAne3tleGFtcGxlfX0nIHt7JSBlbHNlICV9fSBTRVQgTmFtZSA9ICdDb3cnIHt7JSBlbmRpZiAlfX0gV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2A7XG4gICAgICAgIC8vICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiB0cnVlJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICdmdW4nfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdDb3cnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy8gICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGVxdWFsJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICdzcWlnZ2wnfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdDb3cnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy8gICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGZhbHNlJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICdwYWxvb3phJ30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAncGFsb296YScgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAvLyB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vIGRlc2NyaWJlKCdpcyBOYU4gY29uZGl0aW9uJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgbGV0IHF1ZXJ5ID0gYFVQREFURSBOYW1lcyB7eyUgaWYgZXhhbXBsZSBpcyBOYU4gJX19IFNFVCBOYW1lID0gJ0Nvdycge3slIGVsc2UgJX19IFNFVCBOYW1lID0gJ3t7ZXhhbXBsZX19JyB7eyUgZW5kaWYgJX19IFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgO1xuICAgICAgICAvLyAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgdHJ1ZScsICgpID0+IHtcbiAgICAgICAgLy8gICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnZHJhZ29uJ30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnQ293JyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiBmYWxzZScsICgpID0+IHtcbiAgICAgICAgLy8gICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnMTInfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICcxMicgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAvLyB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vIGRlc2NyaWJlKCdpcyBub3QgTmFOIGNvbmRpdGlvbicsICgpID0+IHtcbiAgICAgICAgLy8gICAgIGxldCBxdWVyeSA9IGBVUERBVEUgTmFtZXMge3slIGlmIGV4YW1wbGUgaXMgbm90IE5hTiAlfX0gU0VUIE5hbWUgPSAne3tleGFtcGxlfX0nIHt7JSBlbHNlICV9fSBTRVQgTmFtZSA9ICdDb3cnIHt7JSBlbmRpZiAlfX0gV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2A7XG4gICAgICAgIC8vICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiB0cnVlJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICcxMid9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJzEyJyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiBmYWxzZScsICgpID0+IHtcbiAgICAgICAgLy8gICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAnZHJhZ29uJ30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnQ293JyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vIH0pO1xuICAgICAgICBcbiAgICAgICAgLy8gZGVzY3JpYmUoJ2lzICFOYU4gY29uZGl0aW9uJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgbGV0IHF1ZXJ5ID0gYFVQREFURSBOYW1lcyB7eyUgaWYgZXhhbXBsZSBpcyAhTmFOICV9fSBTRVQgTmFtZSA9ICd7e2V4YW1wbGV9fScge3slIGVsc2UgJX19IFNFVCBOYW1lID0gJ0Nvdycge3slIGVuZGlmICV9fSBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYDtcbiAgICAgICAgLy8gICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIHRydWUnLCAoKSA9PiB7XG4gICAgICAgIC8vICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogJzEyJ30pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnMTInICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy8gICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGZhbHNlJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6ICdkcmFnb24nfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdDb3cnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy8gfSk7XG4gICAgICAgIFxuICAgICAgICAvLyBkZXNjcmliZSgnYmV0d2VlbiBjb25kaXRpb24nLCAoKSA9PiB7XG4gICAgICAgIC8vICAgICBsZXQgcXVlcnkgPSBgVVBEQVRFIE5hbWVzIHt7JSBpZiBleGFtcGxlIDEwPjwyMCAlfX0gU0VUIE5hbWUgPSAne3tleGFtcGxlfX0nIHt7JSBlbHNlICV9fSBTRVQgTmFtZSA9ICdDb3cnIHt7JSBlbmRpZiAlfX0gV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2A7XG4gICAgICAgIC8vICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiB0cnVlJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6IDE1fSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICcxNScgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAvLyAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgZXF1YWwgdG8gdGhlIGxvdyBudW1iZXInLCAoKSA9PiB7XG4gICAgICAgIC8vICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogMTB9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ0NvdycgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAvLyAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgZXF1YWwgdG8gdGhlIGhpZ2ggbnVtYmVyJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6IDIwfSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdDb3cnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy8gICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGJlbG93IHRoZSBsb3cgbnVtYmVyJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6IDV9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ0NvdycgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAvLyAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgYWJvdmUgdGhlIGhpZ2ggbnVtYmVyJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6IDI1fSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdDb3cnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy8gfSk7XG4gICAgICAgIFxuICAgICAgICAvLyBkZXNjcmliZSgnIWJldHdlZW4gY29uZGl0aW9uJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgbGV0IHF1ZXJ5ID0gYFVQREFURSBOYW1lcyB7eyUgaWYgZXhhbXBsZSAxMD4hPDIwICV9fSBTRVQgTmFtZSA9ICd7e2V4YW1wbGV9fScge3slIGVsc2UgJX19IFNFVCBOYW1lID0gJ0Nvdycge3slIGVuZGlmICV9fSBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYDtcbiAgICAgICAgLy8gICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIHRydWUnLCAoKSA9PiB7XG4gICAgICAgIC8vICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogMTV9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJ0NvdycgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAvLyAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgZXF1YWwgdG8gdGhlIGxvdyBudW1iZXInLCAoKSA9PiB7XG4gICAgICAgIC8vICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogMTB9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJzEwJyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiBlcXVhbCB0byB0aGUgaGlnaCBudW1iZXInLCAoKSA9PiB7XG4gICAgICAgIC8vICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogMjB9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJzIwJyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiBiZWxvdyB0aGUgbG93IG51bWJlcicsICgpID0+IHtcbiAgICAgICAgLy8gICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiA1fSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICc1JyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiBhYm92ZSB0aGUgaGlnaCBudW1iZXInLCAoKSA9PiB7XG4gICAgICAgIC8vICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogMjV9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJzI1JyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vIH0pO1xuICAgICAgICBcbiAgICAgICAgLy8gZGVzY3JpYmUoJ2JldHdlZW49IGNvbmRpdGlvbicsICgpID0+IHtcbiAgICAgICAgLy8gICAgIGxldCBxdWVyeSA9IGBVUERBVEUgTmFtZXMge3slIGlmIGV4YW1wbGUgMTA+PTwyMCAlfX0gU0VUIE5hbWUgPSAne3tleGFtcGxlfX0nIHt7JSBlbHNlICV9fSBTRVQgTmFtZSA9ICdDb3cnIHt7JSBlbmRpZiAlfX0gV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2A7XG4gICAgICAgIC8vICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiB0cnVlJywgKCkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIGV4cGVjdChwYXJzZShxdWVyeSwge2V4YW1wbGU6IDE1fSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICcxNScgIFdIRVJFIE5hbWUgPSAnQXdlc29tZSdgKTtcbiAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAvLyAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgaWYgZXF1YWwgdG8gdGhlIGxvdyBudW1iZXInLCAoKSA9PiB7XG4gICAgICAgIC8vICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogMTB9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJzEwJyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiBlcXVhbCB0byB0aGUgaGlnaCBudW1iZXInLCAoKSA9PiB7XG4gICAgICAgIC8vICAgICAgICAgZXhwZWN0KHBhcnNlKHF1ZXJ5LCB7ZXhhbXBsZTogMjB9KSkudG9FcXVhbChgVVBEQVRFIE5hbWVzIFNFVCBOYW1lID0gJzIwJyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCBpZiBiZWxvdyB0aGUgbG93IG51bWJlcicsICgpID0+IHtcbiAgICAgICAgLy8gICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiA1fSkpLnRvRXF1YWwoYFVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdDb3cnICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnYCk7XG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy8gICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IGlmIGFib3ZlIHRoZSBoaWdoIG51bWJlcicsICgpID0+IHtcbiAgICAgICAgLy8gICAgICAgICBleHBlY3QocGFyc2UocXVlcnksIHtleGFtcGxlOiAyNX0pKS50b0VxdWFsKGBVUERBVEUgTmFtZXMgU0VUIE5hbWUgPSAnQ293JyAgV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2ApO1xuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vIH0pO1xuICAgICAgICBcbiAgICB9KTtcbiAgICBcbiAgICBkZXNjcmliZSgnXCJubyBjb21tYW5kc1wiJywgKCkgPT4ge1xuICAgICAgICBpdCgnc2hvdWxkIHN1Y2NlZWQgYW5kIGhhdmUgdGhlIGV4cGVjdGVkIG91dHB1dCcsICgpID0+IHtcbiAgICAgICAgICAgIGxldCBzcWwgPSBcIlVQREFURVwiO1xuICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHNxbCwgbnVsbCkpLnRvRXF1YWwoc3FsKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgXG4gICAgLy8gZGVzY3JpYmUoJ1wibWlzc2luZyBkZXBlbmRlbnQgYWN0aW9uc1wiJywgKCkgPT4ge1xuICAgIC8vICAgICBiZWZvcmVFYWNoKCgpID0+IHNweU9uKGNvbnNvbGUsICdlcnJvcicpKTtcbiAgICBcbiAgICAvLyAgICAgaXQoJ3Nob3VsZCB0aHJvdyBhIHN5bnRheCBlcnJvciBpZiBhIGRlcGVuZGVudCBhY3Rpb24gaXMgZm91bmQgd2l0aG91dCB0aGUgbmVlZGVkIHByZWNlZWRpbmcgYWN0aW9uJywgKCkgPT4ge1xuICAgIC8vICAgICAgICAgbGV0IHNxbCA9IFwiVVBEQVRFIFN0dWRlbnRzIHt7JSBlbHNlICV9fSBTRVQgRmlyc3ROYW1lID0gJ1Njb3R0J1wiO1xuICAgIC8vICAgICAgICAgZXhwZWN0KHBhcnNlKHNxbCwgbnVsbCkpLnRvRXF1YWwoc3FsKTtcbiAgICAvLyAgICAgICAgIGV4cGVjdChjb25zb2xlLmVycm9yKS50b0hhdmVCZWVuQ2FsbGVkKCk7XG4gICAgLy8gICAgIH0pO1xuICAgICAgICBcbiAgICAvLyAgICAgaXQoJ3Nob3VsZCB0aHJvdyBhIHN5bnRheCBlcnJvciBpZiBhIGRlcGVuZGVudCBhY3Rpb24gaXMgZm91bmQgd2l0aG91dCB0aGUgbmVlZGVkIHByZWNlZWRpbmcgYWN0aW9uJywgKCkgPT4ge1xuICAgIC8vICAgICAgICAgbGV0IHNxbCA9IFwiVVBEQVRFIFN0dWRlbnRzIHt7JSBlbmRpZiAlfX0gU0VUIEZpcnN0TmFtZSA9ICdTY290dCdcIjtcbiAgICAvLyAgICAgICAgIGV4cGVjdChwYXJzZShzcWwsIG51bGwpKS50b0VxdWFsKHNxbCk7XG4gICAgLy8gICAgICAgICBleHBlY3QoY29uc29sZS5lcnJvcikudG9IYXZlQmVlbkNhbGxlZCgpO1xuICAgIC8vICAgICB9KTtcbiAgICAvLyB9KTtcbiAgICBcbiAgICBkZXNjcmliZSgnXCJxdWVyeSB3aXRoIG5ld2xpbmVzXCInLCAoKSA9PiB7ICAgICBcbiAgICAgICAgaXQoJ3Nob3VsZCBhY2NlcHQgbmV3bGluZXMgaW4gcXVlcmllcycsICgpID0+IHtcbiAgICAgICAgICAgIGxldCBzcWwgPSBgVVBEQVRFIE5hbWVzIFxue3slIGlmIGV4YW1wbGUgaXMgbm90IG51bGwgJX19XG5TRVQgTmFtZSA9ICd7e2V4YW1wbGV9fSdcbnt7JSBlbHNlICV9fSBTRVQgTmFtZSA9ICdDb3cnIFxue3slIGVuZGlmICV9fVxuV0hFUkUgTmFtZSA9ICdBd2Vzb21lJ2A7XG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gYFVQREFURSBOYW1lcyBcblNFVCBOYW1lID0gJ0RyYWdvbidcbldIRVJFIE5hbWUgPSAnQXdlc29tZSdgO1xuICAgICAgICAgICAgZXhwZWN0KHBhcnNlKHNxbCwge2V4YW1wbGU6ICdEcmFnb24nfSkpLnRvRXF1YWwocmVzdWx0KTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgXG4gICAgZGVzY3JpYmUoJ1widXBwZXIgY2FzZSBjb21tYW5kc1wiJywgKCkgPT4ge1xuICAgICAgICBpdCgnc2hvdWxkIHN1Y2NlZWQgZGlzcGl0ZSBsZXR0ZXIgY2FzZScsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNxbCA9IFwiVVBEQVRFIE5hbWVzIHt7JSBJRiBleGFtcGxlIGlzIE5PVCBudWxsICV9fSBTRVQgTmFtZSA9ICd7e2V4YW1wbGV9fScge3slIEVsc2UgJX19IFNFVCBOYW1lID0gJ0Nvdycge3slIGVuZElmICV9fSBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnXCI7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBcIlVQREFURSBOYW1lcyBTRVQgTmFtZSA9ICdEcmFnb24nICBXSEVSRSBOYW1lID0gJ0F3ZXNvbWUnXCI7XG4gICAgICAgICAgICBleHBlY3QocGFyc2Uoc3FsLCB7ZXhhbXBsZTogJ0RyYWdvbid9KSkudG9FcXVhbChyZXN1bHQpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbiAgICBcbn0pOyIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL3RzZC5kLnRzXCIgLz5cbi8vIGltcG9ydCB7QWN0aW9uLCBJQWN0aW9uRGVmaW5pdGlvbiwgQ29tbWFuZFJlc3VsdH0gZnJvbSAnLi4vLi4vc3JjL0FjdGlvbnMnO1xuXG4vLyBsZXQgdGVzdEFjdGlvbkRlZmluaXRpb246IElBY3Rpb25EZWZpbml0aW9uID0ge1xuLy8gICAgIHJlZ2V4OiAvXnRoaXNcXHMraXNcXHMrYVxccyt0ZXN0L2ksXG4vLyAgICAgY29uZGl0aW9uczogW10sXG4vLyAgICAgZGVwZW5kZW50czogW10sXG4vLyAgICAgdGVybWluYXRvcjogZmFsc2UsXG4vLyAgICAgcnVsZTogKGNvbW1hbmQsIGNvbmRpdGlvbiwgcHJldik6IEFjdGlvblJlc3VsdCA9PiB7XG4vLyAgICAgICAgIHJldHVybiBuZXcgQWN0aW9uUmVzdWx0KGNvbW1hbmQuaW5uZXIsIHRydWUpO1xuLy8gICAgIH1cbi8vIH1cbi8vIGxldCB0ZXN0QWN0aW9uOiBBY3Rpb24gPSBuZXcgQWN0aW9uKHRlc3RBY3Rpb25EZWZpbml0aW9uKTtcblxuLy8gZGVzY3JpYmUoJ0FuIEFjdGlvbicsICgpID0+IHtcbi8vICAgICBpdCgnc2hvdWxkIHN0b3JlIGl0XFwncyBkZWZpbml0aW9uJywgKCkgPT4gZXhwZWN0KHRlc3RBY3Rpb24uZGVmaW5pdGlvbikudG9FcXVhbCh0ZXN0QWN0aW9uRGVmaW5pdGlvbikpO1xuLy8gICAgIGl0KCdzaG91bGQgbWF0Y2ggYSBzdGF0ZW1lbnQgd2l0aCB0aGUgY29ycmVjdCB0ZXh0JywgKCkgPT4gZXhwZWN0KHRlc3RBY3Rpb24ubWF0Y2hlcygndGhpcyBpcyBhIHRlc3QnKSkudG9CZSh0cnVlKSk7XG4vLyAgICAgaXQoJ3Nob3VsZCBub3QgbWF0Y2hhIGEgc3RhdGVtZW50IHdpdGggdGhlIHdyb25nIHRleHQnLCAoKSA9PiBleHBlY3QodGVzdEFjdGlvbi5tYXRjaGVzKCdzb21ldGhpbmcgZWxzZScpKS50b0JlKGZhbHNlKSk7XG4vLyB9KTsiLCIvLyAvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy90c2QuZC50c1wiIC8+XG4vLyBpbXBvcnQgRWxzZSBmcm9tICcuLi8uLi9zcmMvYWN0aW9ucy9FbHNlJztcbi8vIGltcG9ydCBDb21tYW5kIGZyb20gJy4uLy4uL3NyYy9Db21tYW5kJztcbi8vIGltcG9ydCBJVmFyaWFibGVzIGZyb20gJy4uLy4uL3NyYy9JVmFyaWFibGVzJztcblxuLy8gZGVzY3JpYmUoXCJFbHNlXCIsICgpID0+IHtcbi8vIFx0ZGVzY3JpYmUoJ3JlZ2V4JywgKCkgPT4ge1xuLy8gXHRcdGl0KCdzaG91bGQgaGF2ZSBhIHF1ZXJ5IHRoYXQgbWF0Y2hlcyBlbHNlJywgKCkgPT4gZXhwZWN0KEVsc2UucmVnZXgudGVzdCgnZWxzZScpKS50b0JlKHRydWUpKTtcbi8vIFx0XHRpdCgnc2hvdWxkIG9ubHkgbWF0Y2ggaWYgXCJlbHNlXCIgaXMgZmlyc3Qgd29yZCcsICgpID0+IGV4cGVjdChFbHNlLnJlZ2V4LnRlc3QoJ25vdGhpbmcgZWxzZScpKS50b0JlKGZhbHNlKSk7XG4vLyBcdFx0aXQoJ3Nob3VsZCBub3QgbWF0Y2ggbW9yZSB0aGFuIG9uZSBcImVsc2VcIiBpbiB0aGUgc3RhdGVtZW50JywgKCkgPT4gZXhwZWN0KCdlbHNlIHNvbWV0aGluZyBlbHNlIHNvbWV0aGluZycubWF0Y2goRWxzZS5yZWdleCkubGVuZ3RoKS50b0VxdWFsKDEpKTtcbi8vIFx0XHRpdCgnc2hvdWxkIG5vdCBtYXRjaCBpZiBcImVsc2VcIiBpcyBub3QgcHJlc2VudCcsICgpID0+IGV4cGVjdChFbHNlLnJlZ2V4LnRlc3QoJ3RoZXJlIGlzIG5vIGFjdGlvbicpKS50b0JlKGZhbHNlKSk7XG4vLyBcdFx0aXQoJ3Nob3VsZCBub3QgbWF0Y2ggYSB3b3JkIG9ubHkgc3RhcnRpbmcgd2l0aCBcImVsc2VcIicsICgpID0+IGV4cGVjdChFbHNlLnJlZ2V4LnRlc3QoJ2Vsc2VsbCcpKS50b0JlKGZhbHNlKSk7XG4vLyBcdFx0aXQoJ3Nob3VsZCBub3QgbWF0Y2ggYSB3b3JkIGNvbnRhaW5pbmcgXCJlbHNlXCInLCAoKSA9PiBleHBlY3QoRWxzZS5yZWdleC50ZXN0KCdzb21lbHNldGhpbmcnKSkudG9CZShmYWxzZSkpO1xuLy8gXHR9KTtcblx0XG4vLyBcdGRlc2NyaWJlKCdpbnN0YW5jZScsICgpID0+IHtcbi8vIFx0XHRjb25zdCBpbmRleDogbnVtYmVyID0gNSwgXG4vLyBcdFx0XHRzdGF0ZW1lbnQgPSAnIGVsc2UgJyxcbi8vIFx0XHRcdGlubmVyID0gJyBTRVQgRmlyc3ROYW1lID0ge3tzb21ldGhpbmd9fSAnLFxuLy8gXHRcdFx0bGVuZ3RoOiBudW1iZXIgPSBge3slJHtzdGF0ZW1lbnR9JX19JHtpbm5lcn1gLmxlbmd0aCxcbi8vIFx0XHRcdHZhcmlhYmxlczogSVZhcmlhYmxlcyA9IHtzb21ldGhpbmc6ICdncmVlbid9O1xuLy8gXHRcdGxldFx0Y29tbWFuZDogQ29tbWFuZCxcbi8vIFx0XHRcdGFjdGlvbjogRWxzZTtcbi8vIFx0XHRiZWZvcmVBbGwoKCkgPT4ge1xuLy8gXHRcdFx0Y29tbWFuZCA9IG5ldyBDb21tYW5kKGluZGV4LCBsZW5ndGgsIHN0YXRlbWVudCwgaW5uZXIsIHZhcmlhYmxlcyk7XG4vLyBcdFx0XHRhY3Rpb24gPSBuZXcgRWxzZShjb21tYW5kLCBzdGF0ZW1lbnQsIGlubmVyLCB2YXJpYWJsZXMpO1xuLy8gXHRcdH0pO1xuLy8gXHRcdGl0KCdzaG91bGQgc3RvcmUgdGhlIHN0YXRlbWVudCcsICgpID0+IGV4cGVjdChhY3Rpb24uc3RhdGVtZW50KS50b0VxdWFsKHN0YXRlbWVudCkpO1xuLy8gXHRcdGl0KCdzaG91bGQgc3RvcmUgdGhlIGlubmVyJywgKCkgPT4gZXhwZWN0KGFjdGlvbi5pbm5lcikudG9FcXVhbChpbm5lcikpO1xuLy8gXHRcdGl0KCdzaG91bGQgc3RvcmUgdGhlIHZhcmlhYmxlcycsICgpID0+IGV4cGVjdChhY3Rpb24udmFyaWFibGVzKS50b0VxdWFsKHZhcmlhYmxlcykpO1xuLy8gXHR9KTtcbi8vIH0pOyIsIi8vIC8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL3RzZC5kLnRzXCIgLz5cbi8vIGltcG9ydCBFbmRJZiBmcm9tICcuLi8uLi9zcmMvYWN0aW9ucy9FbmRJZic7XG4vLyBpbXBvcnQgQ29tbWFuZCBmcm9tICcuLi8uLi9zcmMvQ29tbWFuZCc7XG4vLyBpbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi8uLi9zcmMvSVZhcmlhYmxlcyc7XG5cbi8vIGRlc2NyaWJlKFwiRW5kSWZcIiwgKCkgPT4ge1xuLy8gXHRkZXNjcmliZSgncmVnZXgnLCAoKSA9PiB7XG4vLyBcdFx0aXQoJ3Nob3VsZCBoYXZlIGEgcXVlcnkgdGhhdCBtYXRjaGVzIFwiZW5kaWZcIicsICgpID0+IGV4cGVjdChFbmRJZi5yZWdleC50ZXN0KCdlbmRpZicpKS50b0JlKHRydWUpKTtcbi8vIFx0XHRpdCgnc2hvdWxkIG9ubHkgbWF0Y2ggaWYgXCJlbmRpZlwiIGlzIGZpcnN0IHdvcmQnLCAoKSA9PiBleHBlY3QoRW5kSWYucmVnZXgudGVzdCgnbm90aGluZyBlbmRpZicpKS50b0JlKGZhbHNlKSk7XG4vLyBcdFx0aXQoJ3Nob3VsZCBub3QgbWF0Y2ggbW9yZSB0aGFuIG9uZSBcImVuZGlmXCIgaW4gdGhlIHN0YXRlbWVudCcsICgpID0+IGV4cGVjdCgnZW5kaWYgc29tZXRoaW5nIGVuZGlmIHNvbWV0aGluZycubWF0Y2goRW5kSWYucmVnZXgpLmxlbmd0aCkudG9FcXVhbCgxKSk7XG4vLyBcdFx0aXQoJ3Nob3VsZCBub3QgbWF0Y2ggaWYgXCJlbmRpZlwiIGlzIG5vdCBwcmVzZW50JywgKCkgPT4gZXhwZWN0KEVuZElmLnJlZ2V4LnRlc3QoJ3RoZXJlIGlzIG5vIGFjdGlvbicpKS50b0JlKGZhbHNlKSk7XG4vLyBcdFx0aXQoJ3Nob3VsZCBub3QgbWF0Y2ggYSB3b3JkIG9ubHkgc3RhcnRpbmcgd2l0aCBcImVuZGlmXCInLCAoKSA9PiBleHBlY3QoRW5kSWYucmVnZXgudGVzdCgnZW5kaWZsbCcpKS50b0JlKGZhbHNlKSk7XG4vLyBcdFx0aXQoJ3Nob3VsZCBub3QgbWF0Y2ggYSB3b3JkIGNvbnRhaW5pbmcgXCJlbmRpZlwiJywgKCkgPT4gZXhwZWN0KEVuZElmLnJlZ2V4LnRlc3QoJ3NvbWVuZGlmdGhpbmcnKSkudG9CZShmYWxzZSkpO1xuLy8gXHR9KTtcblx0XG4vLyBcdGRlc2NyaWJlKCdpbnN0YW5jZScsICgpID0+IHtcbi8vIFx0XHRjb25zdCBpbmRleDogbnVtYmVyID0gNSwgXG4vLyBcdFx0XHRzdGF0ZW1lbnQgPSAnIGVuZGlmICcsXG4vLyBcdFx0XHRpbm5lciA9ICcgV0hFUkUgRmlyc3ROYW1lID0ge3tzdGF0ZW1lbnR9fSAnLFxuLy8gXHRcdFx0bGVuZ3RoOiBudW1iZXIgPSBge3slJHtzdGF0ZW1lbnR9JX19JHtpbm5lcn1gLmxlbmd0aCxcbi8vIFx0XHRcdHZhcmlhYmxlczogSVZhcmlhYmxlcyA9IHtzb21ldGhpbmc6ICdncmVlbid9O1xuLy8gXHRcdGxldFx0Y29tbWFuZDogQ29tbWFuZCxcbi8vIFx0XHRcdGFjdGlvbjogRW5kSWY7XG4vLyBcdFx0YmVmb3JlQWxsKCgpID0+IHtcbi8vIFx0XHRcdGNvbW1hbmQgPSBuZXcgQ29tbWFuZChpbmRleCwgbGVuZ3RoLCBzdGF0ZW1lbnQsIGlubmVyLCB2YXJpYWJsZXMpO1xuLy8gXHRcdFx0YWN0aW9uID0gbmV3IEVuZElmKGNvbW1hbmQsIHN0YXRlbWVudCwgaW5uZXIsIHZhcmlhYmxlcyk7XG4vLyBcdFx0fSk7XG4vLyBcdFx0aXQoJ3Nob3VsZCBzdG9yZSB0aGUgc3RhdGVtZW50JywgKCkgPT4gZXhwZWN0KGFjdGlvbi5zdGF0ZW1lbnQpLnRvRXF1YWwoc3RhdGVtZW50KSk7XG4vLyBcdFx0aXQoJ3Nob3VsZCBzdG9yZSB0aGUgaW5uZXInLCAoKSA9PiBleHBlY3QoYWN0aW9uLmlubmVyKS50b0VxdWFsKGlubmVyKSk7XG4vLyBcdFx0aXQoJ3Nob3VsZCBzdG9yZSB0aGUgdmFyaWFibGVzJywgKCkgPT4gZXhwZWN0KGFjdGlvbi52YXJpYWJsZXMpLnRvRXF1YWwodmFyaWFibGVzKSk7XG4vLyBcdH0pO1xuLy8gfSk7IiwiLy8gLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvdHNkLmQudHNcIiAvPlxuLy8gaW1wb3J0IElmIGZyb20gJy4uLy4uL3NyYy9hY3Rpb25zL0lmJztcbi8vIGltcG9ydCB7SXNOdWxsfSBmcm9tICcuLi8uLi9zcmMvQ29uZGl0aW9ucyc7XG4vLyBpbXBvcnQgQ29tbWFuZCBmcm9tICcuLi8uLi9zcmMvQ29tbWFuZCc7XG4vLyBpbXBvcnQgSVZhcmlhYmxlcyBmcm9tICcuLi8uLi9zcmMvSVZhcmlhYmxlcyc7XG5cbi8vIGRlc2NyaWJlKFwiSWZcIiwgKCkgPT4ge1xuLy8gXHRkZXNjcmliZSgncmVnZXgnLCAoKSA9PiB7XG4vLyBcdFx0aXQoJ3Nob3VsZCBoYXZlIGEgcXVlcnkgdGhhdCBtYXRjaGVzIGlmJywgKCkgPT4gZXhwZWN0KElmLnJlZ2V4LnRlc3QoJ2lmIHNvbWV0aGluZyBpcyBub3QgbnVsbCcpKS50b0JlKHRydWUpKTtcbi8vIFx0XHRpdCgnc2hvdWxkIG9ubHkgbWF0Y2ggaWYgXCJpZlwiIGlzIGZpcnN0IHdvcmQnLCAoKSA9PiBleHBlY3QoSWYucmVnZXgudGVzdCgnbm90aGluZyBpZiBzb21ldGhpbmcgaXMgbm90IG51bGwnKSkudG9CZShmYWxzZSkpO1xuLy8gXHRcdGl0KCdzaG91bGQgbm90IG1hdGNoIG1vcmUgdGhhbiBvbmUgXCJpZlwiIGluIHRoZSBzdGF0ZW1lbnQnLCAoKSA9PiBleHBlY3QoJ2lmIHNvbWV0aGluZyBpZiBzb21ldGhpbmcnLm1hdGNoKElmLnJlZ2V4KS5sZW5ndGgpLnRvRXF1YWwoMSkpO1xuLy8gXHRcdGl0KCdzaG91bGQgbm90IG1hdGNoIGlmIFwiaWZcIiBpcyBub3QgcHJlc2VudCcsICgpID0+IGV4cGVjdChJZi5yZWdleC50ZXN0KCd0aGVyZSBpcyBubyBjb25kaXRpb25hbCcpKS50b0JlKGZhbHNlKSk7XG4vLyBcdFx0aXQoJ3Nob3VsZCBub3QgbWF0Y2ggYSB3b3JkIG9ubHkgc3RhcnRpbmcgd2l0aCBcImlmXCInLCAoKSA9PiBleHBlY3QoSWYucmVnZXgudGVzdCgnaWZsZSBzb21ldGhpbmcgaXMgbm90IG51bGwnKSkudG9CZShmYWxzZSkpO1xuLy8gXHRcdGl0KCdzaG91bGQgbm90IG1hdGNoIGEgd29yZCBjb250YWluaW5nIFwiaWZcIicsICgpID0+IGV4cGVjdChJZi5yZWdleC50ZXN0KCdzb21laWZ0aGluZyBpcyBub3QgbnVsbCcpKS50b0JlKGZhbHNlKSk7XG4vLyBcdH0pO1xuXHRcbi8vIFx0ZGVzY3JpYmUoJ2luc3RhbmNlJywgKCkgPT4ge1xuLy8gXHRcdGNvbnN0IGluZGV4OiBudW1iZXIgPSA1LCBcbi8vIFx0XHRcdHN0YXRlbWVudCA9ICcgaWYgc29tZXRoaW5nIGlzIG51bGwgJyxcbi8vIFx0XHRcdGlubmVyID0gJyBTRVQgRmlyc3ROYW1lID0ge3tzb21ldGhpbmd9fSAnLFxuLy8gXHRcdFx0bGVuZ3RoOiBudW1iZXIgPSBge3slJHtzdGF0ZW1lbnR9JX19JHtpbm5lcn1gLmxlbmd0aCxcbi8vIFx0XHRcdHZhcmlhYmxlczogSVZhcmlhYmxlcyA9IHtzb21ldGhpbmc6ICdncmVlbid9O1xuLy8gXHRcdGxldFx0Y29tbWFuZDogQ29tbWFuZCxcbi8vIFx0XHRcdGlmSXNOb3ROdWxsOiBJZjtcbi8vIFx0XHRiZWZvcmVBbGwoKCkgPT4ge1xuLy8gXHRcdFx0Y29tbWFuZCA9IG5ldyBDb21tYW5kKGluZGV4LCBsZW5ndGgsIHN0YXRlbWVudCwgaW5uZXIsIHZhcmlhYmxlcyk7XG4vLyBcdFx0XHRpZklzTm90TnVsbCA9IG5ldyBJZihjb21tYW5kLCBzdGF0ZW1lbnQsIGlubmVyLCB2YXJpYWJsZXMpO1xuLy8gXHRcdH0pO1xuLy8gXHRcdGl0KCdzaG91bGQgc3RvcmUgdGhlIHN0YXRlbWVudCcsICgpID0+IGV4cGVjdChpZklzTm90TnVsbC5zdGF0ZW1lbnQpLnRvRXF1YWwoc3RhdGVtZW50KSk7XG4vLyBcdFx0aXQoJ3Nob3VsZCBzdG9yZSB0aGUgaW5uZXInLCAoKSA9PiBleHBlY3QoaWZJc05vdE51bGwuaW5uZXIpLnRvRXF1YWwoaW5uZXIpKTtcbi8vIFx0XHRpdCgnc2hvdWxkIHN0b3JlIHRoZSB2YXJpYWJsZXMnLCAoKSA9PiBleHBlY3QoaWZJc05vdE51bGwudmFyaWFibGVzKS50b0VxdWFsKHZhcmlhYmxlcykpO1xuLy8gXHRcdGl0KCdzaG91bGQgY29ycmVjdGx5IHNlbGVjdCB0aGUgSXNOdWxsIGNvbmRpdGlvbicsICgpID0+IGV4cGVjdChpZklzTm90TnVsbC5leHRyYWN0Q29uZGl0aW9uKGlmSXNOb3ROdWxsLnN0YXRlbWVudCwgaWZJc05vdE51bGwudmFyaWFibGVzKSBpbnN0YW5jZW9mIElzTnVsbCkudG9CZSh0cnVlKSk7XG4vLyBcdH0pO1xuLy8gfSk7IiwiLy8gLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvdHNkLmQudHNcIiAvPlxuLy8gaW1wb3J0IEVxdWFsIGZyb20gJy4uLy4uL3NyYy9jb25kaXRpb25zL0VxdWFsJztcbi8vIGltcG9ydCB7Tm90LCBPckVxdWFsfSBmcm9tICcuLi8uLi9zcmMvTW9kaWZpZXJzJztcblxuLy8gZGVzY3JpYmUoJ0VxdWFsJywgKCkgPT4ge1xuLy8gICAgIGRlc2NyaWJlKCdyZWdleCcsICgpID0+IHtcbi8vICAgICAgICAgaXQoJ3Nob3VsZCBtYXRjaCBhIHN0YXRlbWVudCBjb250YWluaW5nIFwiPVwiJywgKCkgPT4gZXhwZWN0KEVxdWFsLnJlZ2V4LnRlc3QoJ3NvbWV0aGluZyA9IDEyJykpLnRvQmUodHJ1ZSkpO1xuLy8gICAgICAgICBpdCgnc2hvdWxkIG1hdGNoIGEgc3RhdGVtZW50IGNvbnRhaW5pbmcgXCI9XCIgYW5kIGEgc3BvdCAxIG1vZGlmaWVyJywgKCkgPT4gZXhwZWN0KEVxdWFsLnJlZ2V4LnRlc3QoJ3NvbWV0aGluZyAhPSAxMicpKS50b0JlKHRydWUpKTtcbi8vICAgICAgICAgaXQoJ3Nob3VsZCBtYXRjaCBhIHN0YXRlbWVudCBjb250YWluaW5nIFwiPVwiIGFuZCBhIHNwb3QgMiBtb2RpZmllcicsICgpID0+IGV4cGVjdChFcXVhbC5yZWdleC50ZXN0KCdzb21ldGhpbmcgPSEgMTInKSkudG9CZSh0cnVlKSk7XG4vLyAgICAgICAgIGl0KCdzaG91bGQgbWF0Y2ggYSBzdGF0ZW1lbnQgY29udGFpbmluZyBcIj1cIiBhbmQgMiBtb2RpZmllcnMnLCAoKSA9PiBleHBlY3QoRXF1YWwucmVnZXgudGVzdCgnc29tZXRoaW5nICE9ISAxMicpKS50b0JlKHRydWUpKTtcbi8vICAgICAgICAgaXQoJ3Nob3VsZCBub3QgbWF0Y2ggYSBzdGF0ZW1lbnQgbWlzc2luZyBcIj1cIicsICgpID0+IGV4cGVjdChFcXVhbC5yZWdleC50ZXN0KCdzb21ldGhpbmcgbWlzc2luZyBlcXVhbCBzeW1ib2wnKSkudG9CZShmYWxzZSkpO1xuLy8gXHRcdGl0KCdzaG91bGQgbWF0Y2ggYSBzdGF0ZW1lbnQgY29udGFpbmluZyBcIj1cIiBhbnl3aGVyZScsICgpID0+IGV4cGVjdChFcXVhbC5yZWdleC50ZXN0KCdzb21ldGhpbmcgaXMgPSAxMiBzb21ldGhpbmcnKSkudG9CZSh0cnVlKSk7XG4vLyBcdFx0aXQoJ3Nob3VsZCBub3QgbWF0Y2ggYSBzdGF0ZW1lbnQgY29udGFpbmluZyBcIj1cIiBidXQgaW4gdGhlIHdyb25nIG9yZGVyJywgKCkgPT4gZXhwZWN0KEVxdWFsLnJlZ2V4LnRlc3QoJ3NvbWV0aGluZyAxMiA9JykpLnRvQmUoZmFsc2UpKTtcbi8vICAgICAgICAgaXQoJ3Nob3VsZCBub3QgbWF0Y2ggYSBzdGF0ZW1lbnQgbWlzc2luZyBhIHZhcmlhYmxlJywgKCkgPT4gZXhwZWN0KEVxdWFsLnJlZ2V4LnRlc3QoJz0gMTInKSkudG9CZShmYWxzZSkpO1xuLy8gICAgICAgICBpdCgnc2hvdWxkIG5vdCBtYXRjaCBhIHN0YXRlbWVudCBtaXNzaW5nIGEgY29tcGFyYXRpdmUnLCAoKSA9PiBleHBlY3QoRXF1YWwucmVnZXgudGVzdCgnc29tZXRoaW5nID0nKSkudG9CZShmYWxzZSkpO1xuLy8gXHRcdGl0KCdzaG91bGQgY2FwdHVyZSBhIHZhcmlhYmxlIGluIHRoZSBzdGF0ZW1lbnQnLCAoKSA9PiBleHBlY3QoJ3NvbWV0aGluZyAhPT0gMTInLm1hdGNoKEVxdWFsLnJlZ2V4KVsxXSkudG9FcXVhbCgnc29tZXRoaW5nJykpO1xuLy8gICAgICAgICBpdCgnc2hvdWxkIGNhcHR1cmUgdGhlIGZpcnN0IG1vZGlmaWVyIGluIHRoZSBzdGF0ZW1lbnQnLCAoKSA9PiBleHBlY3QoJ3NvbWV0aGluZyAhPT0gMTInLm1hdGNoKEVxdWFsLnJlZ2V4KVsyXSkudG9FcXVhbCgnIScpKTtcbi8vICAgICAgICAgaXQoJ3Nob3VsZCBjYXB0dXJlIHRoZSBzZWNvbmQgbW9kaWZpZXIgaW4gdGhlIHN0YXRlbWVudCcsICgpID0+IGV4cGVjdCgnc29tZXRoaW5nICE9PSAxMicubWF0Y2goRXF1YWwucmVnZXgpWzNdKS50b0VxdWFsKCc9JykpO1xuLy8gICAgICAgICBpdCgnc2hvdWxkIGNhcHR1cmUgYSBjb21wYXJhdGl2ZSBpbiB0aGUgc3RhdGVtZW50JywgKCkgPT4gZXhwZWN0KCdzb21ldGhpbmcgIT09IDEyJy5tYXRjaChFcXVhbC5yZWdleClbNF0pLnRvRXF1YWwoJzEyJykpO1xuICAgICAgICBcbi8vIFx0fSk7XG5cdFxuLy8gXHRkZXNjcmliZSgnaW5zdGFuY2UnLCAoKSA9PiB7XG4vLyBcdFx0bGV0IGVxQmFyZSwgZXFOZWdhdGVkLCBlcURvdWJsZSwgZXFGYWxzZTtcbi8vIFx0XHRiZWZvcmVBbGwoKCkgPT4ge1xuLy8gICAgICAgICAgICAgZXFCYXJlID0gbmV3IEVxdWFsKCdzb21ldGhpbmcnLCB7c29tZXRoaW5nOiAnRHJhZ29uJywgYmxhaDogJ3JlZCd9LCAnRHJhZ29uJywgbnVsbCwgbnVsbCk7XG4vLyBcdFx0XHRlcU5lZ2F0ZWQgPSBuZXcgRXF1YWwoJ3NvbWV0aGluZycsIHtzb21ldGhpbmc6ICdEcmFnb24nLCBibGFoOiAncmVkJ30sICdEcmFnb24nLCAnIScsIG51bGwpO1xuLy8gICAgICAgICAgICAgZXFEb3VibGUgPSBuZXcgRXF1YWwoJ3NvbWV0aGluZycsIHtzb21ldGhpbmc6ICdEcmFnb24nLCBibGFoOiAncmVkJ30sICdEcmFnb24nLCAnIScsICc9Jyk7XG4vLyAgICAgICAgICAgICBlcUZhbHNlID0gbmV3IEVxdWFsKCdzb21ldGhpbmcnLCB7c29tZXRoaW5nOiAnRHJhZ29uJywgYmxhaDogJ3JlZCd9LCAnU3BpY2UnLCBudWxsLCBudWxsKTtcbi8vIFx0XHR9KTtcbi8vIFx0XHRpdCgnc2hvdWxkIHN0b3JlIHRoZSB2YXJpYWJsZScsICgpID0+IGV4cGVjdChlcURvdWJsZS52YXJpYWJsZSkudG9FcXVhbCgnc29tZXRoaW5nJykpO1xuLy8gXHRcdGl0KCdzaG91bGQgc3RvcmUgdGhlIHZhcmlhYmxlcyBvYmplY3QnLCAoKSA9PiBleHBlY3QoZXFEb3VibGUudmFyaWFibGVzKS50b0VxdWFsKHtzb21ldGhpbmc6ICdEcmFnb24nLCBibGFoOiAncmVkJ30pKTtcbi8vICAgICAgICAgaXQoJ3Nob3VsZCBzdG9yZSB0aGUgY29tcGFyYXRpdmUnLCAoKSA9PiBleHBlY3QoZXFEb3VibGUuY29tcGFyYXRpdmUpLnRvRXF1YWwoJ0RyYWdvbicpKTtcbi8vICAgICAgICAgaXQoJ3Nob3VsZCBzdG9yZSB0aGUgZmlyc3QgbW9kaWZpZXInLCAoKSA9PiBleHBlY3QoZXFEb3VibGUubW9kaWZpZXJzWzBdKS50b0VxdWFsKE5vdCkpO1xuLy8gICAgICAgICBpdCgnc2hvdWxkIHN0b3JlIHRoZSBzZWNvbmQgbW9kaWZpZXInLCAoKSA9PiBleHBlY3QoZXFEb3VibGUubW9kaWZpZXJzWzFdKS50b0VxdWFsKE9yRXF1YWwpKTtcbi8vIFx0XHRpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IHJlc3VsdCcsICgpID0+IGV4cGVjdChlcUJhcmUucGVyZm9ybSgpKS50b0JlKHRydWUpKTtcbi8vICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCBtb2RpZmllZCByZXN1bHQnLCAoKSA9PiBleHBlY3QoZXFOZWdhdGVkLnBlcmZvcm0oKSkudG9CZShmYWxzZSkpO1xuLy8gICAgICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IGRvdWJsZSBtb2RpZmllZCByZXN1bHQnLCAoKSA9PiBleHBlY3QoZXFEb3VibGUucGVyZm9ybSgpKS50b0JlKGZhbHNlKSk7XG4vLyAgICAgICAgIGl0KCdzaG91bGQgYWxzbyBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgd2hlbiB2YXJpYWJsZSBpcyBub3QgZXF1YWwnLCAoKSA9PiBleHBlY3QoZXFGYWxzZS5wZXJmb3JtKCkpLnRvQmUoZmFsc2UpKTtcbi8vIFx0fSk7XG4vLyB9KTsiLCIvLyAvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy90c2QuZC50c1wiIC8+XG4vLyBpbXBvcnQgR3JlYXRlclRoYW4gZnJvbSAnLi4vLi4vc3JjL2NvbmRpdGlvbnMvR3JlYXRlclRoYW4nO1xuLy8gaW1wb3J0IHtOb3QsIE9yRXF1YWx9IGZyb20gJy4uLy4uL3NyYy9Nb2RpZmllcnMnO1xuXG4vLyBkZXNjcmliZSgnR3JlYXRlclRoYW4nLCAoKSA9PiB7XG4vLyAgICAgZGVzY3JpYmUoJ3JlZ2V4JywgKCkgPT4ge1xuLy8gICAgICAgICBpdCgnc2hvdWxkIG1hdGNoIGEgc3RhdGVtZW50IGNvbnRhaW5pbmcgXCI+XCInLCAoKSA9PiBleHBlY3QoR3JlYXRlclRoYW4ucmVnZXgudGVzdCgnc29tZXRoaW5nID4gMTInKSkudG9CZSh0cnVlKSk7XG4vLyAgICAgICAgIGl0KCdzaG91bGQgbWF0Y2ggYSBzdGF0ZW1lbnQgY29udGFpbmluZyBcIj5cIiBhbmQgYSBzcG90IDEgbW9kaWZpZXInLCAoKSA9PiBleHBlY3QoR3JlYXRlclRoYW4ucmVnZXgudGVzdCgnc29tZXRoaW5nICE+IDEyJykpLnRvQmUodHJ1ZSkpO1xuLy8gICAgICAgICBpdCgnc2hvdWxkIG1hdGNoIGEgc3RhdGVtZW50IGNvbnRhaW5pbmcgXCI+XCIgYW5kIGEgc3BvdCAyIG1vZGlmaWVyJywgKCkgPT4gZXhwZWN0KEdyZWF0ZXJUaGFuLnJlZ2V4LnRlc3QoJ3NvbWV0aGluZyA+PSAxMicpKS50b0JlKHRydWUpKTtcbi8vICAgICAgICAgaXQoJ3Nob3VsZCBtYXRjaCBhIHN0YXRlbWVudCBjb250YWluaW5nIFwiPlwiIGFuZCAyIG1vZGlmaWVycycsICgpID0+IGV4cGVjdChHcmVhdGVyVGhhbi5yZWdleC50ZXN0KCdzb21ldGhpbmcgIT49IDEyJykpLnRvQmUodHJ1ZSkpO1xuLy8gICAgICAgICBpdCgnc2hvdWxkIG5vdCBtYXRjaCBhIHN0YXRlbWVudCBtaXNzaW5nIFwiPlwiJywgKCkgPT4gZXhwZWN0KEdyZWF0ZXJUaGFuLnJlZ2V4LnRlc3QoJ3NvbWV0aGluZyBtaXNzaW5nIGdyZWF0ZXIgdGhhbiBzeW1ib2wnKSkudG9CZShmYWxzZSkpO1xuLy8gXHRcdGl0KCdzaG91bGQgbWF0Y2ggYSBzdGF0ZW1lbnQgY29udGFpbmluZyBcIj5cIiBhbnl3aGVyZScsICgpID0+IGV4cGVjdChHcmVhdGVyVGhhbi5yZWdleC50ZXN0KCdzb21ldGhpbmcgaXMgPiAxMiBzb21ldGhpbmcnKSkudG9CZSh0cnVlKSk7XG4vLyBcdFx0aXQoJ3Nob3VsZCBub3QgbWF0Y2ggYSBzdGF0ZW1lbnQgY29udGFpbmluZyBcIj5cIiBidXQgaW4gdGhlIHdyb25nIG9yZGVyJywgKCkgPT4gZXhwZWN0KEdyZWF0ZXJUaGFuLnJlZ2V4LnRlc3QoJ3NvbWV0aGluZyAxMiA+JykpLnRvQmUoZmFsc2UpKTtcbi8vICAgICAgICAgaXQoJ3Nob3VsZCBub3QgbWF0Y2ggYSBzdGF0ZW1lbnQgbWlzc2luZyBhIHZhcmlhYmxlJywgKCkgPT4gZXhwZWN0KEdyZWF0ZXJUaGFuLnJlZ2V4LnRlc3QoJz4gMTInKSkudG9CZShmYWxzZSkpO1xuLy8gICAgICAgICBpdCgnc2hvdWxkIG5vdCBtYXRjaCBhIHN0YXRlbWVudCBtaXNzaW5nIGEgY29tcGFyYXRpdmUnLCAoKSA9PiBleHBlY3QoR3JlYXRlclRoYW4ucmVnZXgudGVzdCgnc29tZXRoaW5nID4nKSkudG9CZShmYWxzZSkpO1xuLy8gXHRcdGl0KCdzaG91bGQgbm90IG1hdGNoIGEgc3RhdGVtZW50IGNvbnRhaW5pbmcgXCI+XCIgYnV0IHdpdGggYW4gZXh0cmEgXCI+XCInLCAoKSA9PiBleHBlY3QoR3JlYXRlclRoYW4ucmVnZXgudGVzdCgnc29tZXRoaW5nID4+IDEyJykpLnRvQmUoZmFsc2UpKTtcbi8vIFx0XHRpdCgnc2hvdWxkIGNhcHR1cmUgYSB2YXJpYWJsZSBpbiB0aGUgc3RhdGVtZW50JywgKCkgPT4gZXhwZWN0KCdzb21ldGhpbmcgIT49IDEyJy5tYXRjaChHcmVhdGVyVGhhbi5yZWdleClbMV0pLnRvRXF1YWwoJ3NvbWV0aGluZycpKTtcbi8vICAgICAgICAgaXQoJ3Nob3VsZCBjYXB0dXJlIHRoZSBmaXJzdCBtb2RpZmllciBpbiB0aGUgc3RhdGVtZW50JywgKCkgPT4gZXhwZWN0KCdzb21ldGhpbmcgIT49IDEyJy5tYXRjaChHcmVhdGVyVGhhbi5yZWdleClbMl0pLnRvRXF1YWwoJyEnKSk7XG4vLyAgICAgICAgIGl0KCdzaG91bGQgY2FwdHVyZSB0aGUgc2Vjb25kIG1vZGlmaWVyIGluIHRoZSBzdGF0ZW1lbnQnLCAoKSA9PiBleHBlY3QoJ3NvbWV0aGluZyAhPj0gMTInLm1hdGNoKEdyZWF0ZXJUaGFuLnJlZ2V4KVszXSkudG9FcXVhbCgnPScpKTtcbi8vICAgICAgICAgaXQoJ3Nob3VsZCBjYXB0dXJlIGEgY29tcGFyYXRvciBpbiB0aGUgc3RhdGVtZW50JywgKCkgPT4gZXhwZWN0KCdzb21ldGhpbmcgIT49IDEyJy5tYXRjaChHcmVhdGVyVGhhbi5yZWdleClbNF0pLnRvRXF1YWwoJzEyJykpO1xuLy8gXHR9KTtcblx0XG4vLyBcdGRlc2NyaWJlKCdpbnN0YW5jZScsICgpID0+IHtcbi8vIFx0XHR2YXIgZ3RCYXJlLCBndE5lZ2F0ZWQsIGd0RXF1YWxlZCwgZ3REb3VibGUsIGd0RmFsc2UsIGd0ZUZhbHNlO1xuLy8gXHRcdGJlZm9yZUFsbCgoKSA9PiB7XG4vLyBcdFx0XHRndEJhcmUgPSBuZXcgR3JlYXRlclRoYW4oJ3NvbWV0aGluZycsIHtzb21ldGhpbmc6ICcxNCcsIGJsYWg6ICdyZWQnfSwgJzEyJywgbnVsbCwgbnVsbCk7XG4vLyAgICAgICAgICAgICBndE5lZ2F0ZWQgPSBuZXcgR3JlYXRlclRoYW4oJ3NvbWV0aGluZycsIHtzb21ldGhpbmc6ICcxNCcsIGJsYWg6ICdyZWQnfSwgJzEyJywgJyEnLCBudWxsKTtcbi8vICAgICAgICAgICAgIGd0RXF1YWxlZCA9IG5ldyBHcmVhdGVyVGhhbignc29tZXRoaW5nJywge3NvbWV0aGluZzogJzE0JywgYmxhaDogJ3JlZCd9LCAnMTQnLCBudWxsLCAnPScpO1xuLy8gICAgICAgICAgICAgZ3REb3VibGUgPSBuZXcgR3JlYXRlclRoYW4oJ3NvbWV0aGluZycsIHtzb21ldGhpbmc6ICcxNCcsIGJsYWg6ICdyZWQnfSwgJzE0JywgJyEnLCAnPScpO1xuLy8gICAgICAgICAgICAgZ3RGYWxzZSA9IG5ldyBHcmVhdGVyVGhhbignc29tZXRoaW5nJywge3NvbWV0aGluZzogJzE0JywgYmxhaDogJ3JlZCd9LCAnMTQnLCBudWxsLCBudWxsKTtcbi8vICAgICAgICAgICAgIGd0ZUZhbHNlID0gbmV3IEdyZWF0ZXJUaGFuKCdzb21ldGhpbmcnLCB7c29tZXRoaW5nOiAnMTQnLCBibGFoOiAncmVkJ30sICcyMCcsIG51bGwsICc9Jyk7XG4vLyBcdFx0fSk7XG4vLyBcdFx0aXQoJ3Nob3VsZCBzdG9yZSB0aGUgdmFyaWFibGUnLCAoKSA9PiBleHBlY3QoZ3REb3VibGUudmFyaWFibGUpLnRvRXF1YWwoJ3NvbWV0aGluZycpKTtcbi8vIFx0XHRpdCgnc2hvdWxkIHN0b3JlIHRoZSB2YXJpYWJsZXMgb2JqZWN0JywgKCkgPT4gZXhwZWN0KGd0RG91YmxlLnZhcmlhYmxlcykudG9FcXVhbCh7c29tZXRoaW5nOiAnMTQnLCBibGFoOiAncmVkJ30pKTtcbi8vICAgICAgICAgaXQoJ3Nob3VsZCBzdG9yZSB0aGUgY29tcGFyYXRpdmUnLCAoKSA9PiBleHBlY3QoZ3REb3VibGUuY29tcGFyYXRpdmUpLnRvRXF1YWwoJzE0JykpO1xuLy8gICAgICAgICBpdCgnc2hvdWxkIHN0b3JlIHRoZSBmaXJzdCBtb2RpZmllcicsICgpID0+IGV4cGVjdChndERvdWJsZS5tb2RpZmllcnNbMF0pLnRvRXF1YWwoTm90KSk7XG4vLyAgICAgICAgIGl0KCdzaG91bGQgc3RvcmUgdGhlIHNlY29uZCBtb2RpZmllcicsICgpID0+IGV4cGVjdChndERvdWJsZS5tb2RpZmllcnNbMV0pLnRvRXF1YWwoT3JFcXVhbCkpO1xuLy8gXHRcdGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0JywgKCkgPT4gZXhwZWN0KGd0QmFyZS5wZXJmb3JtKCkpLnRvQmUodHJ1ZSkpO1xuLy8gICAgICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IG5lZ2F0ZWQgcmVzdWx0JywgKCkgPT4gZXhwZWN0KGd0TmVnYXRlZC5wZXJmb3JtKCkpLnRvQmUoZmFsc2UpKTtcbi8vICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCBvci1lcXVhbCByZXN1bHQnLCAoKSA9PiBleHBlY3QoZ3RFcXVhbGVkLnBlcmZvcm0oKSkudG9CZSh0cnVlKSk7XG4vLyAgICAgICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgZG91YmxlIG1vZGlmaWVkIHJlc3VsdCcsICgpID0+IGV4cGVjdChndERvdWJsZS5wZXJmb3JtKCkpLnRvQmUoZmFsc2UpKTtcbi8vIFx0XHRpdCgnc2hvdWxkIGFsc28gcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IHdoZW4gdmFyaWFibGUgaXMgbm90IGdyZWF0ZXIgdGhhbicsICgpID0+IGV4cGVjdChndEZhbHNlLnBlcmZvcm0oKSkudG9CZShmYWxzZSkpO1xuLy8gICAgICAgICBpdCgnc2hvdWxkIGFsc28gcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0IHdoZW4gdmFyaWFibGUgaXMgbm90IGdyZWF0ZXIgdGhhbiBvciBlcXVhbCcsICgpID0+IGV4cGVjdChndGVGYWxzZS5wZXJmb3JtKCkpLnRvQmUoZmFsc2UpKTtcbi8vIFx0fSk7XG4vLyB9KTsiLCIvLyAvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy90c2QuZC50c1wiIC8+XG4vLyBpbXBvcnQgSXNOdWxsIGZyb20gJy4uLy4uL3NyYy9jb25kaXRpb25zL0lzTnVsbCc7XG5cbi8vIGRlc2NyaWJlKCdJc051bGwnLCAoKSA9PiB7XG4vLyAgICAgZGVzY3JpYmUoJ3JlZ2V4JywgKCkgPT4ge1xuLy8gICAgICAgICBpdCgnc2hvdWxkIG1hdGNoIGEgc3RhdGVtZW50IGNvbnRhaW5pbmcgXCJpcyBudWxsXCInLCAoKSA9PiBleHBlY3QoSXNOdWxsLnJlZ2V4LnRlc3QoJ3NvbWV0aGluZyBpcyBudWxsJykpLnRvQmUodHJ1ZSkpO1xuLy8gICAgICAgICBpdCgnc2hvdWxkIG5vdCBtYXRjaCBhIHN0YXRlbWVudCBtaXNzaW5nIFwiaXMgbnVsbFwiJywgKCkgPT4gZXhwZWN0KElzTnVsbC5yZWdleC50ZXN0KCdzb21ldGhpbmcgd2l0aG91dCB0aGUgY29ycmVjdCB3b3JkcycpKS50b0JlKGZhbHNlKSk7XG4vLyBcdFx0aXQoJ3Nob3VsZCBtYXRjaCBhIHN0YXRlbWVudCBjb250YWluaW5nIFwiaXMgbnVsbFwiIGFueXdoZXJlJywgKCkgPT4gZXhwZWN0KElzTnVsbC5yZWdleC50ZXN0KCdzb21ldGhpbmcgaXMgbnVsbCBzb21ldGhpbmcnKSkudG9CZSh0cnVlKSk7XG4vLyBcdFx0aXQoJ3Nob3VsZCBub3QgbWF0Y2ggYSBzdGF0ZW1lbnQgY29udGFpbmluZyBcImlzIG51bGxcIiBidXQgaW4gdGhlIHdyb25nIG9yZGVyJywgKCkgPT4gZXhwZWN0KElzTnVsbC5yZWdleC50ZXN0KCdzb21ldGhpbmcgbnVsbCBpcycpKS50b0JlKGZhbHNlKSk7XG4vLyBcdFx0aXQoJ3Nob3VsZCBub3QgbWF0Y2ggYSBzdGF0ZW1lbnQgY29udGFpbmluZyBcImlzIG51bGxcIiBidXQgd2l0aCB3b3JkcyBpbi1iZXR3ZWVuJywgKCkgPT4gZXhwZWN0KElzTnVsbC5yZWdleC50ZXN0KCdzb21ldGhpbmcgaXMgYmxhaCBudWxsJykpLnRvQmUoZmFsc2UpKTtcbi8vIFx0XHRpdCgnc2hvdWxkIG5vdCBtYXRjaCBhIHN0YXRlbWVudCBjb250YWluaW5nIFwiaXMgbnVsbFwiIGJ1dCB3aXRoIGV4dHJhIGxldHRlcnMgb24gdGhlIHdvcmRzJywgKCkgPT4gZXhwZWN0KElzTnVsbC5yZWdleC50ZXN0KCdzb21ldGhpbmcgaXNzIG51dWxsJykpLnRvQmUoZmFsc2UpKTtcbi8vIFx0XHRpdCgnc2hvdWxkIGNhcHR1cmUgYSB2YXJpYWJsZSBpbiB0aGUgc3RhdGVtZW50JywgKCkgPT4gZXhwZWN0KCdzb21ldGhpbmcgaXMgbnVsbCcubWF0Y2goSXNOdWxsLnJlZ2V4KVsxXSkudG9FcXVhbCgnc29tZXRoaW5nJykpO1xuLy8gXHR9KTtcblx0XG4vLyBcdGRlc2NyaWJlKCdpbnN0YW5jZScsICgpID0+IHtcbi8vIFx0XHR2YXIgaXNOdWxsO1xuLy8gXHRcdGJlZm9yZUFsbCgoKSA9PiB7XG4vLyBcdFx0XHRpc051bGwgPSBuZXcgSXNOdWxsKCdzb21ldGhpbmcnLCB7bm90aGluZzogJ2dyZWVuJywgYmxhaDogJ3JlZCd9LCBudWxsLCBudWxsLCBudWxsKTtcbi8vIFx0XHR9KTtcbi8vIFx0XHRpdCgnc2hvdWxkIHN0b3JlIHRoZSB2YXJpYWJsZScsICgpID0+IGV4cGVjdChpc051bGwudmFyaWFibGUpLnRvRXF1YWwoJ3NvbWV0aGluZycpKTtcbi8vIFx0XHRpdCgnc2hvdWxkIHN0b3JlIHRoZSB2YXJpYWJsZXMgb2JqZWN0JywgKCkgPT4gZXhwZWN0KGlzTnVsbC52YXJpYWJsZXMpLnRvRXF1YWwoe25vdGhpbmc6ICdncmVlbicsIGJsYWg6ICdyZWQnfSkpO1xuLy8gXHRcdGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgcmVzdWx0JywgKCkgPT4gZXhwZWN0KGlzTnVsbC5wZXJmb3JtKCkpLnRvQmUodHJ1ZSkpO1xuLy8gXHRcdGl0KCdzaG91bGQgYWxzbyBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgd2hlbiB2YXJpYWJsZSBpcyBub3QgbnVsbCcsICgpID0+IHtcbi8vIFx0XHRcdHZhciBvdGhlcklzTnVsbCA9IG5ldyBJc051bGwoJ3NvbWV0aGluZycsIHtzb21ldGhpbmc6ICdncmVlbicsIGJsYWg6ICdyZWQnfSwgbnVsbCwgbnVsbCwgbnVsbCk7XG4vLyBcdFx0XHRleHBlY3Qob3RoZXJJc051bGwucGVyZm9ybSgpKS50b0JlKGZhbHNlKTtcbi8vIFx0XHR9KTtcbi8vIFx0fSk7XG4vLyB9KTsiLCIvLyAvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy90c2QuZC50c1wiIC8+XG4vLyBpbXBvcnQgTGVzc1RoYW4gZnJvbSAnLi4vLi4vc3JjL2NvbmRpdGlvbnMvTGVzc1RoYW4nO1xuLy8gaW1wb3J0IHtOb3QsIE9yRXF1YWx9IGZyb20gJy4uLy4uL3NyYy9Nb2RpZmllcnMnO1xuXG4vLyBkZXNjcmliZSgnTGVzc1RoYW4nLCAoKSA9PiB7XG4vLyAgICAgZGVzY3JpYmUoJ3JlZ2V4JywgKCkgPT4ge1xuLy8gICAgICAgICBpdCgnc2hvdWxkIG1hdGNoIGEgc3RhdGVtZW50IGNvbnRhaW5pbmcgXCI8XCInLCAoKSA9PiBleHBlY3QoTGVzc1RoYW4ucmVnZXgudGVzdCgnc29tZXRoaW5nIDwgMTInKSkudG9CZSh0cnVlKSk7XG4vLyAgICAgICAgIGl0KCdzaG91bGQgbWF0Y2ggYSBzdGF0ZW1lbnQgY29udGFpbmluZyBcIjxcIiBhbmQgYSBzcG90IDEgbW9kaWZpZXInLCAoKSA9PiBleHBlY3QoTGVzc1RoYW4ucmVnZXgudGVzdCgnc29tZXRoaW5nICE8IDEyJykpLnRvQmUodHJ1ZSkpO1xuLy8gICAgICAgICBpdCgnc2hvdWxkIG1hdGNoIGEgc3RhdGVtZW50IGNvbnRhaW5pbmcgXCI8XCIgYW5kIGEgc3BvdCAyIG1vZGlmaWVyJywgKCkgPT4gZXhwZWN0KExlc3NUaGFuLnJlZ2V4LnRlc3QoJ3NvbWV0aGluZyA8PSAxMicpKS50b0JlKHRydWUpKTtcbi8vICAgICAgICAgaXQoJ3Nob3VsZCBtYXRjaCBhIHN0YXRlbWVudCBjb250YWluaW5nIFwiPFwiIGFuZCAyIG1vZGlmaWVycycsICgpID0+IGV4cGVjdChMZXNzVGhhbi5yZWdleC50ZXN0KCdzb21ldGhpbmcgITw9IDEyJykpLnRvQmUodHJ1ZSkpO1xuLy8gICAgICAgICBpdCgnc2hvdWxkIG5vdCBtYXRjaCBhIHN0YXRlbWVudCBtaXNzaW5nIFwiPFwiJywgKCkgPT4gZXhwZWN0KExlc3NUaGFuLnJlZ2V4LnRlc3QoJ3NvbWV0aGluZyBtaXNzaW5nIGxlc3MgdGhhbiBzeW1ib2wnKSkudG9CZShmYWxzZSkpO1xuLy8gXHRcdGl0KCdzaG91bGQgbWF0Y2ggYSBzdGF0ZW1lbnQgY29udGFpbmluZyBcIjxcIiBhbnl3aGVyZScsICgpID0+IGV4cGVjdChMZXNzVGhhbi5yZWdleC50ZXN0KCdzb21ldGhpbmcgaXMgPCAxMiBzb21ldGhpbmcnKSkudG9CZSh0cnVlKSk7XG4vLyBcdFx0aXQoJ3Nob3VsZCBub3QgbWF0Y2ggYSBzdGF0ZW1lbnQgY29udGFpbmluZyBcIjxcIiBidXQgaW4gdGhlIHdyb25nIG9yZGVyJywgKCkgPT4gZXhwZWN0KExlc3NUaGFuLnJlZ2V4LnRlc3QoJ3NvbWV0aGluZyAxMiA8JykpLnRvQmUoZmFsc2UpKTtcbi8vICAgICAgICAgaXQoJ3Nob3VsZCBub3QgbWF0Y2ggYSBzdGF0ZW1lbnQgbWlzc2luZyBhIHZhcmlhYmxlJywgKCkgPT4gZXhwZWN0KExlc3NUaGFuLnJlZ2V4LnRlc3QoJzwgMTInKSkudG9CZShmYWxzZSkpO1xuLy8gICAgICAgICBpdCgnc2hvdWxkIG5vdCBtYXRjaCBhIHN0YXRlbWVudCBtaXNzaW5nIGEgY29tcGFyYXRpdmUnLCAoKSA9PiBleHBlY3QoTGVzc1RoYW4ucmVnZXgudGVzdCgnc29tZXRoaW5nIDwnKSkudG9CZShmYWxzZSkpO1xuLy8gXHRcdGl0KCdzaG91bGQgbm90IG1hdGNoIGEgc3RhdGVtZW50IGNvbnRhaW5pbmcgXCI8XCIgYnV0IHdpdGggYW4gZXh0cmEgXCI8XCInLCAoKSA9PiBleHBlY3QoTGVzc1RoYW4ucmVnZXgudGVzdCgnc29tZXRoaW5nIDw8IDEyJykpLnRvQmUoZmFsc2UpKTtcbi8vIFx0XHRpdCgnc2hvdWxkIGNhcHR1cmUgYSB2YXJpYWJsZSBpbiB0aGUgc3RhdGVtZW50JywgKCkgPT4gZXhwZWN0KCdzb21ldGhpbmcgPCAxMicubWF0Y2goTGVzc1RoYW4ucmVnZXgpWzFdKS50b0VxdWFsKCdzb21ldGhpbmcnKSk7XG4vLyAgICAgICAgIGl0KCdzaG91bGQgY2FwdHVyZSB0aGUgZmlyc3QgbW9kaWZpZXIgaW4gdGhlIHN0YXRlbWVudCcsICgpID0+IGV4cGVjdCgnc29tZXRoaW5nICE8PSAxMicubWF0Y2goTGVzc1RoYW4ucmVnZXgpWzJdKS50b0VxdWFsKCchJykpO1xuLy8gICAgICAgICBpdCgnc2hvdWxkIGNhcHR1cmUgdGhlIHNlY29uZCBtb2RpZmllciBpbiB0aGUgc3RhdGVtZW50JywgKCkgPT4gZXhwZWN0KCdzb21ldGhpbmcgITw9IDEyJy5tYXRjaChMZXNzVGhhbi5yZWdleClbM10pLnRvRXF1YWwoJz0nKSk7XG4vLyAgICAgICAgIGl0KCdzaG91bGQgY2FwdHVyZSBhIGNvbXBhcmF0b3IgaW4gdGhlIHN0YXRlbWVudCcsICgpID0+IGV4cGVjdCgnc29tZXRoaW5nIDwgMTInLm1hdGNoKExlc3NUaGFuLnJlZ2V4KVs0XSkudG9FcXVhbCgnMTInKSk7XG4vLyBcdH0pO1xuXHRcbi8vIFx0ZGVzY3JpYmUoJ2luc3RhbmNlJywgKCkgPT4ge1xuLy8gXHRcdHZhciBsdEJhcmUsIGx0TmVnYXRlZCwgbHRFcXVhbGVkLCBsdERvdWJsZSwgbHRGYWxzZSwgbHRlRmFsc2U7XG4vLyBcdFx0YmVmb3JlQWxsKCgpID0+IHtcbi8vIFx0XHRcdGx0QmFyZSA9IG5ldyBMZXNzVGhhbignc29tZXRoaW5nJywge3NvbWV0aGluZzogJzknLCBibGFoOiAncmVkJ30sICcxMicsIG51bGwsIG51bGwpO1xuLy8gICAgICAgICAgICAgbHROZWdhdGVkID0gbmV3IExlc3NUaGFuKCdzb21ldGhpbmcnLCB7c29tZXRoaW5nOiAnOScsIGJsYWg6ICdyZWQnfSwgJzEyJywgJyEnLCBudWxsKTtcbi8vICAgICAgICAgICAgIGx0RXF1YWxlZCA9IG5ldyBMZXNzVGhhbignc29tZXRoaW5nJywge3NvbWV0aGluZzogJzknLCBibGFoOiAncmVkJ30sICc5JywgbnVsbCwgJz0nKTtcbi8vICAgICAgICAgICAgIGx0RG91YmxlID0gbmV3IExlc3NUaGFuKCdzb21ldGhpbmcnLCB7c29tZXRoaW5nOiAnOScsIGJsYWg6ICdyZWQnfSwgJzknLCAnIScsICc9Jyk7XG4vLyAgICAgICAgICAgICBsdEZhbHNlID0gbmV3IExlc3NUaGFuKCdzb21ldGhpbmcnLCB7c29tZXRoaW5nOiAnOScsIGJsYWg6ICdyZWQnfSwgJzknLCBudWxsLCBudWxsKTtcbi8vICAgICAgICAgICAgIGx0ZUZhbHNlID0gbmV3IExlc3NUaGFuKCdzb21ldGhpbmcnLCB7c29tZXRoaW5nOiAnOScsIGJsYWg6ICdyZWQnfSwgJzYnLCBudWxsLCAnPScpO1xuLy8gXHRcdH0pO1xuLy8gXHRcdGl0KCdzaG91bGQgc3RvcmUgdGhlIHZhcmlhYmxlJywgKCkgPT4gZXhwZWN0KGx0RG91YmxlLnZhcmlhYmxlKS50b0VxdWFsKCdzb21ldGhpbmcnKSk7XG4vLyBcdFx0aXQoJ3Nob3VsZCBzdG9yZSB0aGUgdmFyaWFibGVzIG9iamVjdCcsICgpID0+IGV4cGVjdChsdERvdWJsZS52YXJpYWJsZXMpLnRvRXF1YWwoe3NvbWV0aGluZzogJzknLCBibGFoOiAncmVkJ30pKTtcbi8vICAgICAgICAgaXQoJ3Nob3VsZCBzdG9yZSB0aGUgY29tcGFyYXRpdmUnLCAoKSA9PiBleHBlY3QobHREb3VibGUuY29tcGFyYXRpdmUpLnRvRXF1YWwoJzknKSk7XG4vLyAgICAgICAgIGl0KCdzaG91bGQgc3RvcmUgdGhlIGZpcnN0IG1vZGlmaWVyJywgKCkgPT4gZXhwZWN0KGx0RG91YmxlLm1vZGlmaWVyc1swXSkudG9FcXVhbChOb3QpKTtcbi8vICAgICAgICAgaXQoJ3Nob3VsZCBzdG9yZSB0aGUgc2Vjb25kIG1vZGlmaWVyJywgKCkgPT4gZXhwZWN0KGx0RG91YmxlLm1vZGlmaWVyc1sxXSkudG9FcXVhbChPckVxdWFsKSk7XG4vLyBcdFx0aXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQnLCAoKSA9PiBleHBlY3QobHRCYXJlLnBlcmZvcm0oKSkudG9CZSh0cnVlKSk7XG4vLyAgICAgICAgIGl0KCdzaG91bGQgcHJvdmlkZSBhIGNvcnJlY3QgbmVnYXRlZCByZXN1bHQnLCAoKSA9PiBleHBlY3QobHROZWdhdGVkLnBlcmZvcm0oKSkudG9CZShmYWxzZSkpO1xuLy8gICAgICAgICBpdCgnc2hvdWxkIHByb3ZpZGUgYSBjb3JyZWN0IG9yLWVxdWFsIHJlc3VsdCcsICgpID0+IGV4cGVjdChsdEVxdWFsZWQucGVyZm9ybSgpKS50b0JlKHRydWUpKTtcbi8vICAgICAgICAgaXQoJ3Nob3VsZCBwcm92aWRlIGEgY29ycmVjdCBkb3VibGUgbW9kaWZpZWQgcmVzdWx0JywgKCkgPT4gZXhwZWN0KGx0RG91YmxlLnBlcmZvcm0oKSkudG9CZShmYWxzZSkpO1xuLy8gXHRcdGl0KCdzaG91bGQgYWxzbyBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgd2hlbiB2YXJpYWJsZSBpcyBub3QgbGVzcyB0aGFuJywgKCkgPT4gZXhwZWN0KGx0RmFsc2UucGVyZm9ybSgpKS50b0JlKGZhbHNlKSk7XG4vLyAgICAgICAgIGl0KCdzaG91bGQgYWxzbyBwcm92aWRlIGEgY29ycmVjdCByZXN1bHQgd2hlbiB2YXJpYWJsZSBpcyBub3QgbGVzcyB0aGFuIG9yIGVxdWFsJywgKCkgPT4gZXhwZWN0KGx0ZUZhbHNlLnBlcmZvcm0oKSkudG9CZShmYWxzZSkpO1xuLy8gXHR9KTtcbi8vIH0pOyIsIi8vIC8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL3RzZC5kLnRzXCIgLz5cbi8vIGltcG9ydCBOb3QgZnJvbSAnLi4vLi4vc3JjL21vZGlmaWVycy9Ob3QnO1xuXG4vLyBkZXNjcmliZSgnTm90JywgKCkgPT4ge1xuLy8gICAgIGRlc2NyaWJlKCdpZGVudGlmaWVycycsICgpID0+IHtcbi8vICAgICAgICAgaXQoJ3Nob3VsZCBtYXRjaCBcIiFcIicsICgpID0+IGV4cGVjdChOb3QubWF0Y2hlcygnIScpKS50b0JlKHRydWUpKTtcbi8vICAgICAgICAgaXQoJ3Nob3VsZCBtYXRjaCBcIm5vdFwiJywgKCkgPT4gZXhwZWN0KE5vdC5tYXRjaGVzKCdub3QnKSkudG9CZSh0cnVlKSk7XG4vLyAgICAgICAgIGl0KCdzaG91bGQgbWF0Y2ggXCIgbm90XCInLCAoKSA9PiBleHBlY3QoTm90Lm1hdGNoZXMoJyBub3QnKSkudG9CZSh0cnVlKSk7XG4vLyAgICAgICAgIGl0KCdzaG91bGQgbWF0Y2ggXCJub3QgXCInLCAoKSA9PiBleHBlY3QoTm90Lm1hdGNoZXMoJ25vdCAnKSkudG9CZSh0cnVlKSk7XG4vLyAgICAgICAgIGl0KCdzaG91bGQgbWF0Y2ggXCIgbm90IFwiJywgKCkgPT4gZXhwZWN0KE5vdC5tYXRjaGVzKCcgbm90ICcpKS50b0JlKHRydWUpKTtcbi8vICAgICAgICAgaXQoJ3Nob3VsZCBtYXRjaCBcIk5PVFwiJywgKCkgPT4gZXhwZWN0KE5vdC5tYXRjaGVzKCdOT1QnKSkudG9CZSh0cnVlKSk7XG4vLyAgICAgICAgIGl0KCdzaG91bGQgbWF0Y2ggXCJOb3RcIicsICgpID0+IGV4cGVjdChOb3QubWF0Y2hlcygnTm90JykpLnRvQmUodHJ1ZSkpO1xuLy8gXHR9KTtcbiAgICBcbi8vICAgICBkZXNjcmliZSgncGVyZm9tJywgKCkgPT4ge1xuLy8gICAgICAgICBpdCgnc2hvdWxkIG5lZ2F0ZSB0aGUgcHJvdmlkZWQgKHRydWUpIHJlc3VsdCcsICgpID0+IGV4cGVjdChOb3QucGVyZm9ybSh0cnVlLCAnc29tZXRoaW5nJywgbnVsbCwgbnVsbCkpLnRvQmUoZmFsc2UpKTtcbi8vICAgICAgICAgaXQoJ3Nob3VsZCBuZWdhdGUgdGhlIHByb3ZpZGVkIChmYWxzZSkgcmVzdWx0JywgKCkgPT4gZXhwZWN0KE5vdC5wZXJmb3JtKGZhbHNlLCAnc29tZXRoaW5nJywgbnVsbCwgbnVsbCkpLnRvQmUodHJ1ZSkpO1xuLy8gICAgIH0pO1xuLy8gfSk7IiwiLy8gLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvdHNkLmQudHNcIiAvPlxuLy8gaW1wb3J0IE9yRXF1YWwgZnJvbSAnLi4vLi4vc3JjL21vZGlmaWVycy9PckVxdWFsJztcblxuLy8gZGVzY3JpYmUoJ09yRXF1YWwnLCAoKSA9PiB7XG4vLyAgICAgZGVzY3JpYmUoJ2lkZW50aWZpZXJzJywgKCkgPT4ge1xuLy8gICAgICAgICBpdCgnc2hvdWxkIG1hdGNoIFwiPVwiJywgKCkgPT4gZXhwZWN0KE9yRXF1YWwubWF0Y2hlcygnPScpKS50b0JlKHRydWUpKTtcbi8vIFx0fSk7XG4gICAgXG4vLyAgICAgZGVzY3JpYmUoJ3BlcmZvbScsICgpID0+IHtcbi8vICAgICAgICAgaXQoJ3Nob3VsZCByZWNvbXBhcmUgdGhlIHZhcmlhYmxlIGFuZCBwcm92aWRlIHRoZSBjb3JyZWN0IHJlc3VsdCAodHJ1ZSknLCAoKSA9PiBleHBlY3QoT3JFcXVhbC5wZXJmb3JtKGZhbHNlLCAnc29tZXRoaW5nJywge3NvbWV0aGluZzogJzEyJ30sICcxMicpKS50b0JlKHRydWUpKTtcbi8vICAgICAgICAgaXQoJ3Nob3VsZCByZWNvbXBhcmUgdGhlIHZhcmlhYmxlIGFuZCBwcm92aWRlIHRoZSBjb3JyZWN0IHJlc3VsdCAoZmFsc2UpJywgKCkgPT4gZXhwZWN0KE9yRXF1YWwucGVyZm9ybShmYWxzZSwgJ3NvbWV0aGluZycsIHtzb21ldGhpbmc6ICcxMid9LCAnMTQnKSkudG9CZShmYWxzZSkpO1xuLy8gICAgICAgICBpdCgnc2hvdWxkIG5vdCBtYWtlIHRoZSBjb21wYXJpc29uIGlmIHRoZSBwcm92aWRlZCByZXN1bHQgaXMgdHJ1ZScsICgpID0+IGV4cGVjdChPckVxdWFsLnBlcmZvcm0odHJ1ZSwgJ3NvbWV0aGluZycsIHtzb21ldGhpbmc6ICcxNCd9LCAnMTInKSkudG9CZSh0cnVlKSk7XG4vLyAgICAgfSk7XG4vLyB9KTsiLCIvLyAvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy90c2QuZC50c1wiIC8+XG4vLyBpbXBvcnQgVmFyaWFibGVSZXBsYWNlciBmcm9tICcuLi8uLi9zcmMvcmVwbGFjZXJzL1ZhcmlhYmxlUmVwbGFjZXInO1xuLy8gaW1wb3J0IElWYXJpYWJsZXMgZnJvbSAnLi4vLi4vc3JjL0lWYXJpYWJsZXMnO1xuXG4vLyBkZXNjcmliZSgnVmFyaWFibGVSZXBsYWNlcicsICgpID0+IHtcbi8vIFx0ZGVzY3JpYmUoJ3JlZ2V4JywgKCkgPT4ge1xuLy8gXHRcdGJlZm9yZUVhY2goKCkgPT4gVmFyaWFibGVSZXBsYWNlci5yZWdleC5sYXN0SW5kZXggPSAwKTtcbi8vIFx0XHRpdCgnc2hvdWxkIG1hdGNoIGEgZG91YmxlIGN1cmx5IHJlcGxhY2VtZW50JywgKCkgPT4gZXhwZWN0KFZhcmlhYmxlUmVwbGFjZXIucmVnZXgudGVzdCgne3sgc29tZXRoaW5nIH19JykpLnRvQmUodHJ1ZSkpO1xuLy8gXHRcdGl0KCdzaG91bGQgbm90IG1hdGNoIGEgdHJpcGxlIGN1cmx5IHJlcGxhY2VtZW50JywgKCkgPT4gZXhwZWN0KFZhcmlhYmxlUmVwbGFjZXIucmVnZXgudGVzdCgne3t7IHNvbWV0aGluZyB9fX0nKSkudG9CZShmYWxzZSkpO1xuLy8gXHRcdGl0KCdzaG91bGQgbm90IG1hdGNoIHNvbWV0aGluZyB3aXRob3V0IGN1cmx5IGJyYWNrZXRzJywgKCkgPT4gZXhwZWN0KFZhcmlhYmxlUmVwbGFjZXIucmVnZXgudGVzdCgnKCggc29tZXRoaW5nICkpJykpLnRvQmUoZmFsc2UpKTtcbi8vIFx0fSk7XG5cdFxuLy8gXHRjb25zdCB2YXJpYWJsZXM6IElWYXJpYWJsZXMgPSB7c29tZXRoaW5nOiAnRHJhZ29uJywgZ29ibGluOiAnQ2hpZWYnfTtcbi8vIFx0ZGVzY3JpYmUoJ3JlcGxhY2UnLCAoKSA9PiB7XG4vLyBcdFx0aXQoJ3Nob3VsZCByZXBsYWNlIGEgdmFyaWFibGUnLCAoKSA9PiBleHBlY3QoVmFyaWFibGVSZXBsYWNlci5yZXBsYWNlKCd7eyBzb21ldGhpbmcgfX0nLCB2YXJpYWJsZXMpKS50b0VxdWFsKCdEcmFnb24nKSk7XG4vLyBcdFx0aXQoJ3Nob3VsZCByZXBsYWNlIGEgdmFyaWFibGUgaW4gYSBzdHJpbmcnLCAoKSA9PiBleHBlY3QoVmFyaWFibGVSZXBsYWNlci5yZXBsYWNlKCd0aGlzIGlzIGEge3sgc29tZXRoaW5nIH19JywgdmFyaWFibGVzKSkudG9FcXVhbCgndGhpcyBpcyBhIERyYWdvbicpKTtcbi8vIFx0XHRpdCgnc2hvdWxkIHJlcGxhY2UgbW9yZSB0aGFuIG9uZSB2YXJpYWJsZSBpbiBhIHN0cmluZycsICgpID0+IGV4cGVjdChWYXJpYWJsZVJlcGxhY2VyLnJlcGxhY2UoJ3RoaXMgaXMgYSB7eyBzb21ldGhpbmcgfX0gYW5kIHRoaXMgaXMgYSB7e3NvbWV0aGluZ319JywgdmFyaWFibGVzKSkudG9FcXVhbCgndGhpcyBpcyBhIERyYWdvbiBhbmQgdGhpcyBpcyBhIERyYWdvbicpKTtcbi8vIFx0XHRpdCgnc2hvdWxkIHJlcGxhY2UgbW9yZSB0aGFuIG9uZSB2YXJpYWJsZSBpbiBhIHN0cmluZycsICgpID0+IGV4cGVjdChWYXJpYWJsZVJlcGxhY2VyLnJlcGxhY2UoJ3RoaXMgaXMgYSB7eyBzb21ldGhpbmcgfX0gYW5kIHRoaXMgaXMgYSB7e3NvbWV0aGluZ319JywgdmFyaWFibGVzKSkudG9FcXVhbCgndGhpcyBpcyBhIERyYWdvbiBhbmQgdGhpcyBpcyBhIERyYWdvbicpKTtcbi8vIFx0XHRpdCgnc2hvdWxkIHJlcGxhY2UgZGlmZmVyZW50IHZhcmlhYmxlcyBpbiBhIHN0cmluZycsICgpID0+IGV4cGVjdChWYXJpYWJsZVJlcGxhY2VyLnJlcGxhY2UoJ3RoaXMgaXMgYSB7eyBzb21ldGhpbmcgfX0gYW5kIHRoaXMgaXMgYSB7e2dvYmxpbn19JywgdmFyaWFibGVzKSkudG9FcXVhbCgndGhpcyBpcyBhIERyYWdvbiBhbmQgdGhpcyBpcyBhIENoaWVmJykpO1xuLy8gXHR9KTtcbi8vIH0pOyJdfQ==
