"use strict";
// Copyright (c) 2019 Rich J. Young
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const attributes = [
    {
        attribute: 'base',
        kind: vscode_1.CompletionItemKind.TypeParameter,
        detail: "(type) T'base : (Type | Subtype)"
    },
    {
        attribute: 'left',
        kind: vscode_1.CompletionItemKind.Value,
        detail: "(value) T'left : Value"
    },
    {
        attribute: 'right',
        kind: vscode_1.CompletionItemKind.Value,
        detail: "(value) T'right : Value"
    },
    {
        attribute: 'high',
        kind: vscode_1.CompletionItemKind.Value,
        detail: "(value) T'high : Value"
    },
    {
        attribute: 'low',
        kind: vscode_1.CompletionItemKind.Value,
        detail: "(value) T'low : Value"
    },
    {
        attribute: 'ascending',
        kind: vscode_1.CompletionItemKind.Value,
        detail: "(value) T'ascending : Boolean"
    },
    {
        attribute: 'image',
        kind: vscode_1.CompletionItemKind.Function,
        detail: "(function) T'image(X) : String",
        commitCharacters: ['(']
    },
    {
        attribute: 'value',
        kind: vscode_1.CompletionItemKind.Function,
        detail: "(function) T'value(X) : Value",
        commitCharacters: ['(']
    },
    {
        attribute: 'pos',
        kind: vscode_1.CompletionItemKind.Function,
        detail: "(function) T'pos(X) : Integer",
        commitCharacters: ['(']
    },
    {
        attribute: 'val',
        kind: vscode_1.CompletionItemKind.Function,
        detail: "(function) T'val(X) : Value",
        commitCharacters: ['(']
    },
    {
        attribute: 'succ',
        kind: vscode_1.CompletionItemKind.Function,
        detail: "(function) T'succ(X) : Value",
        commitCharacters: ['(']
    },
    {
        attribute: 'pred',
        kind: vscode_1.CompletionItemKind.Function,
        detail: "(function) T'pred(X) : Value",
        commitCharacters: ['(']
    },
    {
        attribute: 'leftof',
        kind: vscode_1.CompletionItemKind.Function,
        detail: "(function) T'leftof(X) : Value",
        commitCharacters: ['(']
    },
    {
        attribute: 'rightof',
        kind: vscode_1.CompletionItemKind.Function,
        detail: "(function) T'rightof(X) : Value",
        commitCharacters: ['(']
    },
    {
        attribute: 'subtype',
        kind: vscode_1.CompletionItemKind.TypeParameter,
        detail: "(type) O'subtype: Subtype"
    },
    {
        attribute: 'range',
        kind: vscode_1.CompletionItemKind.TypeParameter,
        detail: "(type) A'range[(N)]: Range",
        commitCharacters: ['(']
    },
    {
        attribute: 'reverse_range',
        kind: vscode_1.CompletionItemKind.TypeParameter,
        detail: "(type) A'reverse_range[(N)]: Range",
        commitCharacters: ['(']
    },
    {
        attribute: 'length',
        kind: vscode_1.CompletionItemKind.Function,
        detail: "(function) A'length[(N)]: Integer",
        commitCharacters: ['(']
    },
    {
        attribute: 'ascending',
        kind: vscode_1.CompletionItemKind.Function,
        detail: "(function) A'ascending[(N)] : Boolean",
        commitCharacters: ['(']
    },
    {
        attribute: 'element',
        kind: vscode_1.CompletionItemKind.TypeParameter,
        detail: "(type) A'element : Subtype"
    },
    {
        attribute: 'delayed',
        kind: vscode_1.CompletionItemKind.Function,
        detail: "(function) S'delayed[(T)] : Signal",
        commitCharacters: ['(']
    },
    {
        attribute: 'stable',
        kind: vscode_1.CompletionItemKind.Function,
        detail: "(function) S'stable[(T)] : Boolean",
        commitCharacters: ['(']
    },
    {
        attribute: 'quiet',
        kind: vscode_1.CompletionItemKind.Function,
        detail: "(function) S'quiet[(T)] : Boolean",
        commitCharacters: ['(']
    },
    {
        attribute: 'transaction',
        kind: vscode_1.CompletionItemKind.Value,
        detail: "(value) S'transaction : Bit"
    },
    {
        attribute: 'event',
        kind: vscode_1.CompletionItemKind.Function,
        detail: "(function) S'event : Boolean"
    },
    {
        attribute: 'active',
        kind: vscode_1.CompletionItemKind.Function,
        detail: "(function) S'active : Boolean"
    },
    {
        attribute: 'last_event',
        kind: vscode_1.CompletionItemKind.Function,
        detail: "(function) S'last_event : Time"
    },
    {
        attribute: 'last_active',
        kind: vscode_1.CompletionItemKind.Function,
        detail: "(function) S'last_active : Time"
    },
    {
        attribute: 'last_value',
        kind: vscode_1.CompletionItemKind.Function,
        detail: "(function) S'last_value : Value"
    },
    {
        attribute: 'driving',
        kind: vscode_1.CompletionItemKind.Function,
        detail: "(function) S'driving : Boolean"
    },
    {
        attribute: 'driving_value',
        kind: vscode_1.CompletionItemKind.Function,
        detail: "(function) S'driving_value : Value"
    },
    {
        attribute: 'simple_name',
        kind: vscode_1.CompletionItemKind.Value,
        detail: "(value) E'simple_name : String"
    },
    {
        attribute: 'instance_name',
        kind: vscode_1.CompletionItemKind.Value,
        detail: "(value) E'instance_name : String"
    },
    {
        attribute: 'path_name',
        kind: vscode_1.CompletionItemKind.Value,
        detail: "(value) E'instance_name : String"
    }
];
exports.VhdlAttributeCompletionItemProvider = vscode_1.languages.registerCompletionItemProvider({ scheme: '*', language: 'vhdl' }, {
    provideCompletionItems(document, position) {
        const conf = vscode_1.workspace.getConfiguration('vhdl', document.uri);
        let linePrefix = document.lineAt(position).text.substr(0, position.character);
        if (linePrefix.match(/.*[a-z0-9_]'$/i)) {
            return attributes.map(attr => {
                let item = new vscode_1.CompletionItem(attr.attribute);
                item.kind = attr.kind;
                item.detail = attr.detail;
                item.commitCharacters = attr.commitCharacters;
                switch (conf.get('suggestAttributeCase')) {
                    case 'upper':
                        item.insertText = attr.attribute.toUpperCase();
                        break;
                    case 'lower':
                        item.insertText = attr.attribute.toLowerCase();
                        break;
                }
                return item;
            });
        }
        return undefined;
    }
}, "'");
//# sourceMappingURL=attributes.js.map