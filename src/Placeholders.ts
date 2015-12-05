import IPlaceholder from './placeholders/IPlaceholder';
import {Modifier} from './Modifiers';
export let Placeholders: IPlaceholder[] = [
    {
        name: 'value',
        locator: /\(v\)/i,
        replacement: () => `((?:"|')?[\\w\\d]+(?:"|')?)`
    },
    {
        name: 'modifier',
        locator: /\(m\)/i,
        replacement: (item?: Modifier[]) => `((?:${item.map(modifier => modifier.definition.identifiers.map(identifier => identifier.source).join('|')).join('|')}|\\s*))`
    },
    {
        name: 'collection',
        locator: /\(c\)/i,
        replacement: () => `([\\w\\d]+)`,
    },
    {
        name: 'joiner',
        locator: /\(j\)/i,
        replacement: () => `(.+)`
    }
];
export default function Placeholder(name: string){
    return Placeholders.filter(x => x.name === name)[0];
}