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
