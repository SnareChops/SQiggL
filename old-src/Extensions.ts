interface Array<T>{
	last(): T;
    isFull(): boolean;
    contains(T): boolean;
}
Array.prototype.last = function(){
	return this[this.length-1];
}

Array.prototype.isFull = function(){
    for(let i=0;i<this.length;i++){
        if(i == null) return false;
    }
}

Array.prototype.contains = function(T){
    return this.some(x => x === T);
}