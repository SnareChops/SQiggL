require('../Extensions');
var Condition = (function () {
    function Condition() {
    }
    Condition.mods = function (klass) {
        return klass.modifiers.map(function (x) { return ("" + x.identifiers.map(function (id) { return id.source; }).join('|')); }).join('|');
    };
    Condition.prototype.extractModifiers = function (klass, mod1, mod2) {
        if (!mod1 && !mod2)
            return [];
        var array = [], count = 0;
        if (mod1)
            count++;
        if (mod2)
            count++;
        for (var _i = 0, _a = klass.modifiers; _i < _a.length; _i++) {
            var mod = _a[_i];
            for (var _b = 0, _c = mod.identifiers; _b < _c.length; _b++) {
                var identifier = _c[_b];
                if (mod1 && identifier.test(mod1))
                    array[0] = mod;
                if (mod2 && identifier.test(mod2)) {
                    array[!mod1 ? 0 : 1] = mod;
                }
                if (array.length === count && array.isFull())
                    return array;
            }
        }
        return array;
    };
    Condition.prototype.performModifiers = function (modifiers, result, variable, variables, comparative) {
        if (modifiers.length === 0)
            return result;
        var i;
        for (i = modifiers.length - 1; i > -1; --i) {
            result = modifiers[i].perform(result, variable, variables, comparative);
        }
        return result;
    };
    return Condition;
})();
exports.default = Condition;
