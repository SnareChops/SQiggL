import IPlaceholder from './placeholders/IPlaceholder';
import {Modifier} from './Modifiers';
export let Placeholders: IPlaceholder[] = [
    {
        name: 'variable',
        locator: /\(v\)/i,
        replacement: () => '(\\w+)'
    },
    {
        name: 'comparative',
        locator: /\(c\)/i,
        replacement: () => `(\\d+|["']\\w+["'])`
    },
    {
        name: 'modifier',
        locator: /\(m\)/i,
        replacement: (item?: Modifier[]) => `((?:${item.map(modifier => modifier.definition.identifiers.map(identifier => identifier.source).join('|')).join('|')}|\\s*))`
    }
];
export default function Placeholder(name: string){
    return Placeholders.filter(x => x.name === name)[0];
}