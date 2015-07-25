var Placeholders_1 = require('../Placeholders');
var ConditionResult_1 = require('./ConditionResult');
var Modifiers_1 = require('../Modifiers');
require('../Extensions');
var Condition = (function () {
    function Condition(definition) {
        this.definition = definition;
        this.regex = this.translate(this.definition);
        this.template = definition.template;
        this.items = definition.items;
        this.rule = definition.rule;
    }
    Condition.prototype.translate = function (definition) {
        var template = definition.template, item, idx = 1;
        for (var _i = 0, _a = definition.items; _i < _a.length; _i++) {
            item = _a[_i];
            if (!item)
                throw 'Invalid item in items definition';
            if (item instanceof Array)
                item.name = 'modifier';
            var placeholder = Placeholders_1.default(item.name);
            template = template.replace(placeholder.locator, placeholder.replacement(item));
            if (this.indicies[item.name] instanceof Array)
                this.indicies[item.name].push(idx);
            else if (this.indicies[item.name] instanceof Number) {
                var array = [];
                array.push(this.indicies[item.name]);
                array.push(idx);
                this.indicies[item.name] = array;
            }
            else
                this.indicies[item.name] = idx;
            this.indicies[idx] = item.name;
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
