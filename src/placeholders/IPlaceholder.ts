import {Modifier} from '../Modifiers';
interface IPlaceholder {
    name: string;
    locator: RegExp;
    replacement: (item?:Modifier[]) => string;
}
export default IPlaceholder;