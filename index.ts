import {SQiggL} from "./src/sqiggl";

/* istanbul ignore next */
if(typeof window !== 'undefined'){
    /* istanbul ignore next */
    window['SQiggL'] = SQiggL;
}

export = SQiggL