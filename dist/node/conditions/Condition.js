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
