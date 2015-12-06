export interface Action{
    name?: string;
    key: string;
    dependents?: Action[];
}

export var If: Action = {
    key: 'if'
};

export var Else: Action = {
    key: 'else',
    dependents: [If]
};

export var EndIf: Action = {
    key: 'endif',
    dependents: [If]
};

export var Unless: Action = {
    key: 'unless'
};

export var EndUnless: Action = {
    key: 'endunless',
    dependents: [Unless]
};

export var For: Action = {
    key: 'for'
};

export var EndFor: Action = {
    key: 'endfor',
    dependents: [For]
};

export var CORE_ACTIONS: Action[] = [
    If,
    Else,
    EndIf,
    Unless,
    EndUnless,
    For,
    EndFor
];