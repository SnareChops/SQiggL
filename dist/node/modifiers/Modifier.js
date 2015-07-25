var Modifier = (function () {
    function Modifier(definition) {
        this.definition = definition;
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
