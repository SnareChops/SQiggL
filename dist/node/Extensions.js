Array.prototype.last = function () {
    return this[this.length - 1];
};
Array.prototype.isFull = function () {
    for (var i = 0; i < this.length; i++) {
        if (i == null)
            return false;
    }
};
