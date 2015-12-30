var CommentParser = (function () {
    function CommentParser(options) {
        this.options = options;
    }
    /**
     * Change the comment into a SQL comment using the provided start and ending tokens
     * and output the newly formatted comment
     *
     * @param comment {string} - The DSL for a comment is simply a string
     * @returns {string}
     */
    CommentParser.prototype.parse = function (comment) {
        return this.options.commentBeginning + " " + comment + " " + this.options.commentEnding;
    };
    return CommentParser;
})();
exports.CommentParser = CommentParser;
