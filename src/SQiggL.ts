import {parse as Parse} from './Main';
let SQiggL = {
    parse: Parse,
    version: '0.1.0',
    //extend: Extend
};
if(typeof window !== 'undefined') window['SQiggL'] = SQiggL;
export default SQiggL;