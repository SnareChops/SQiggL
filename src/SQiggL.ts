import {parse as Parse} from './Main';
let SQiggL = {
    parse: Parse,
    version: '0.1.0',
    //extend: Extend
};
if(window) window['SQiggL'] = SQiggL;
export default SQiggL;