var Replacer = (function () {
    function Replacer(definition) {
        this.definition = definition;
    }
    Replacer.prototype.replace = function (text, variables) {
        return this.definition.rule(this.definition, text, variables);
    };
    return Replacer;
})();
exports.default = Replacer;
