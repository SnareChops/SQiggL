export type SQiggLValue = string | number | boolean | (string | number | boolean)[];

export class ScopedVariables{
    private collection: {[key: string]: SQiggLValue} = {};

    constructor(obj?: Object){
        if(!!obj) this.concat(obj);
    }

    public get(key: string): SQiggLValue{
        return this.collection[key];
    }

    public has(key: string): boolean{
        return !!this.collection[key];
    }

    public set(key: string, value: SQiggLValue): void{
        this.collection[key] = value;
    }

    public delete(key: string): void{
        delete this.collection[key];
    }

    public concat(obj: Object): void{
        for(var key of Object.keys(obj)){
            this.set(key, obj[key]);
        }
    }
}

