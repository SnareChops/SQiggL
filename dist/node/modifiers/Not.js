var Not = {
    identifiers: [/!/i, /(?:\b|\s+)not(?:\b|\s+)/i],
    perform: function (result, variable, variables, comparative) { return !result; },
    matches: function (item) {
        for (var _i = 0, _a = Not.identifiers; _i < _a.length; _i++) {
            var identifier = _a[_i];
            if (identifier.test(item))
                return true;
        }
        return false;
    }
};
exports.default = Not;
