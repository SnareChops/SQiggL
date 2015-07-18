import IPlaceholder from './IPlaceholderDefinition';
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
        replacement: (item) => `((?:${item.map(modifier => modifier.identifiers.map(identifier => identifier.source).join('|')).join('|')}|\\s*))`
    }
];
export default function Placeholder(name: string){
    return Placeholders.filter(x => x.name === name)[0];
}