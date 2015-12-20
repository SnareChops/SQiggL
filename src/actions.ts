export interface StartingAction{
    name?: string;
    key: string;
}

export interface DependentAction extends StartingAction{
    dependents: StartingAction[];
    end: boolean;
}

export type Action = StartingAction | DependentAction;

export var If: StartingAction = {
    key: 'if',
};

export var EndIf: DependentAction = {
    key: 'endif',
    dependents: [If],
    end: true
};

export var Unless: StartingAction = {
    key: 'unless'
};

export var EndUnless: DependentAction = {
    key: 'endunless',
    dependents: [Unless],
    end: true
};

export var Else: DependentAction = {
    key: 'else',
    dependents: [If, Unless],
    end: false
};

export var For: StartingAction = {
    key: 'for'
};

export var EndFor: DependentAction = {
    key: 'endfor',
    dependents: [For],
    end: true
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