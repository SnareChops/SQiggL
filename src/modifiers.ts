export interface Modifier{
    identifiers: string[],
    rule?: Function;
}

export var Not: Modifier = {
    identifiers: ['!', 'not']
};

export var OrEqual: Modifier = {
    identifiers: ['=']
};

export var LengthOrEqual: Modifier = {
    identifiers: ['=']
};

export var BetweenOrEqual: Modifier = {
    identifiers: ['=']
};

export var CORE_MODIFIERS: Modifier[] = [
    Not,
    OrEqual,
    LengthOrEqual,
    BetweenOrEqual
];