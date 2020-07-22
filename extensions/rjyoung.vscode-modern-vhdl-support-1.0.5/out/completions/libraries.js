"use strict";
// Copyright (c) 2019 Rich J. Young
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
exports.VhdlLibraryCompletionItemProvider = vscode_1.languages.registerCompletionItemProvider({ scheme: '*', language: 'vhdl' }, {
    provideCompletionItems(document, position) {
        const conf = vscode_1.workspace.getConfiguration('vhdl', document.uri);
        let linePrefix = document.lineAt(position).text.substr(0, position.character);
        if (linePrefix.match(/.*use\s+$/i)) {
            return ['IEEE', 'STD'].map(lib => {
                let item = new vscode_1.CompletionItem(lib.toUpperCase());
                item.kind = vscode_1.CompletionItemKind.Module;
                item.detail = 'Standard Library';
                switch (conf.get('suggestLibraryCase')) {
                    case 'upper':
                        item.insertText = lib.toUpperCase();
                        break;
                    case 'lower':
                        item.insertText = lib.toLowerCase();
                        break;
                }
                return item;
            });
        }
        return undefined;
    }
}, ' ');
//# sourceMappingURL=libraries.js.map