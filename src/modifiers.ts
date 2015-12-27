export interface Modifier{
    identifiers: string[],
    rule: (prevResult: string | boolean, values?: string[]) => boolean | string;
}

export var Not: Modifier = {
    identifiers: ['!', 'not'],
    rule: (prevResult: string | boolean, values: string[]) => !prevResult
};

export var OrEqual: Modifier = {
    identifiers: ['='],
    rule: (prevResult: string | boolean, values: string[]) => prevResult || values[0] === values[1]
};

export var LengthOrEqual: Modifier = {
    identifiers: ['='],
    rule: (prevResult: string | boolean, values: string[]) => prevResult || values[0].length === values[1].length
};

export var BetweenOrEqual: Modifier = {
    identifiers: ['='],
    rule: (prevResult: string | boolean, values: string[]) => prevResult || values[0] === values[1] || values[0] === values[2]
};

export var CORE_MODIFIERS: Modifier[] = [
    Not,
    OrEqual,
    LengthOrEqual,
    BetweenOrEqual
];