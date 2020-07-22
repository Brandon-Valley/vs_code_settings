"use strict";
// Copyright (c) 2019 Rich J. Young
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const triggerCharacters = [';', '.', "'", ',', '[', ']', '-', '\n'];
exports.VhdlStutterModeFormattingEditProvider = vscode_1.languages.registerOnTypeFormattingEditProvider({ scheme: '*', language: 'vhdl' }, {
    provideOnTypeFormattingEdits(document, position, ch) {
        const conf = vscode_1.workspace.getConfiguration('vhdl', document.uri);
        let inComment = document.lineAt(position).text.match(/^.*--.*$/);
        let linePrefix = document.lineAt(position).text.substr(0, position.character);
        switch (ch) {
            case "'":
                if (!conf.get('enableStutterDelimiters'))
                    break;
                if (inComment)
                    break;
                if (linePrefix.endsWith("''")) {
                    return [
                        vscode_1.TextEdit.replace(new vscode_1.Range(position.translate(0, -2), position.with()), '"')
                    ];
                }
                break;
            case ';':
                if (!conf.get('enableStutterDelimiters'))
                    break;
                if (inComment)
                    break;
                if (linePrefix.endsWith(': ;')) {
                    return [
                        vscode_1.TextEdit.replace(new vscode_1.Range(position.translate(0, -2), position.with()), '= ')
                    ];
                }
                else if (linePrefix.match(/\s;;/)) {
                    return [
                        vscode_1.TextEdit.replace(new vscode_1.Range(position.translate(0, -2), position.with()), ': ')
                    ];
                }
                else if (linePrefix.endsWith(';;')) {
                    return [
                        vscode_1.TextEdit.replace(new vscode_1.Range(position.translate(0, -2), position.with()), ' : ')
                    ];
                }
                break;
            case '.':
                if (!conf.get('enableStutterDelimiters'))
                    break;
                if (inComment)
                    break;
                if (linePrefix.match(/\s\.\./)) {
                    return [
                        vscode_1.TextEdit.replace(new vscode_1.Range(position.translate(0, -2), position.with()), '=> ')
                    ];
                }
                else if (linePrefix.endsWith('..')) {
                    return [
                        vscode_1.TextEdit.replace(new vscode_1.Range(position.translate(0, -2), position.with()), ' => ')
                    ];
                }
                break;
            case ',':
                if (!conf.get('enableStutterDelimiters'))
                    break;
                if (inComment)
                    break;
                if (linePrefix.match(/\s,,/)) {
                    return [
                        vscode_1.TextEdit.replace(new vscode_1.Range(position.translate(0, -2), position.with()), '<= ')
                    ];
                }
                else if (linePrefix.endsWith(',,')) {
                    return [
                        vscode_1.TextEdit.replace(new vscode_1.Range(position.translate(0, -2), position.with()), ' <= ')
                    ];
                }
                break;
            case '[':
                if (!conf.get('enableStutterBrackets'))
                    break;
                if (inComment)
                    break;
                if (linePrefix.endsWith('([')) {
                    return [
                        vscode_1.TextEdit.replace(new vscode_1.Range(position.translate(0, -2), position.with()), '[')
                    ];
                }
                else if (linePrefix.endsWith('[')) {
                    return [
                        vscode_1.TextEdit.replace(new vscode_1.Range(position.translate(0, -1), position.with()), '(')
                    ];
                }
                break;
            case ']':
                if (!conf.get('enableStutterBrackets'))
                    break;
                if (inComment)
                    break;
                if (linePrefix.endsWith(')]')) {
                    return [
                        vscode_1.TextEdit.replace(new vscode_1.Range(position.translate(0, -2), position.with()), ']')
                    ];
                }
                else if (linePrefix.endsWith(']')) {
                    return [
                        vscode_1.TextEdit.replace(new vscode_1.Range(position.translate(0, -1), position.with()), ')')
                    ];
                }
                break;
            case '-':
                if (!conf.get('enableStutterComments'))
                    break;
                let max = conf.get('stutterCompletionsMaxWidth');
                let width = conf.get('stutterCompletionsBlockWidth');
                let indent = linePrefix.match(/^(\s*).*$/)[1];
                // Adjust width if max is set
                if (max > 0) {
                    width = Math.min(width, max - indent.length);
                }
                if (linePrefix.match(/^\s*----+$/)) {
                    return [
                        vscode_1.TextEdit.replace(new vscode_1.Range(position.translate(0, -1), position.with()), (document.eol == 1 ? '\n' : '\r\n') + indent + '-- '),
                        vscode_1.TextEdit.insert(new vscode_1.Position(position.line + 1, 0), indent + '-'.repeat(width) + (document.eol == 1 ? '\n' : '\r\n'))
                    ];
                }
                else if (linePrefix.match(/^\s*---$/)) {
                    return [vscode_1.TextEdit.insert(position.with(), '-'.repeat(width - 3))];
                }
                break;
            case '\n':
                if (!conf.get('enableStutterComments'))
                    break;
                if (linePrefix.match(/^\s*$/)) {
                    let prevLineIsComment = document
                        .lineAt(position.line - 1)
                        .text.match(/^\s*(--[^-]\s*)\S+.*$/);
                    let prevLineIsEmptyComment = document
                        .lineAt(position.line - 1)
                        .text.match(/^\s*--\s*$/);
                    if (prevLineIsComment) {
                        return [vscode_1.TextEdit.insert(position.with(), prevLineIsComment[1])];
                    }
                    else if (prevLineIsEmptyComment) {
                        return [
                            vscode_1.TextEdit.delete(new vscode_1.Range(position.translate(-1, 0), position.with()))
                        ];
                    }
                }
                break;
        }
        return [];
    }
}, triggerCharacters[0], ...triggerCharacters.slice(1));
//# sourceMappingURL=stutter_mode.js.map