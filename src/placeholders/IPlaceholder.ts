import IModifier from '../modifiers/IModifier';
interface IPlaceholder {
    name: string;
    locator: RegExp;
    replacement: (item?:IModifier[]) => string;
}
export default IPlaceholder;