var OrEqual = {
    identifiers: [/=/i],
    perform: function (result, variable, variables, comparative) {
        return result || variables[variable] === comparative;
    },
    matches: function (item) {
        for (var _i = 0, _a = OrEqual.identifiers; _i < _a.length; _i++) {
            var identifier = _a[_i];
            if (identifier.test(item))
                return true;
        }
        return false;
    }
};
exports.default = OrEqual;
