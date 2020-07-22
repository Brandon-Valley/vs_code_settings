"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import * as vscode from 'vscode';
const vscode_1 = require("vscode");
const ctags_1 = require("../ctags");
const Logger_1 = require("../Logger");
class VerilogHoverProvider {
    constructor(logger) {
        this.logger = logger;
    }
    provideHover(document, position, token) {
        this.logger.log("Hover requested");
        // get word start and end
        let textRange = document.getWordRangeAtPosition(position);
        if (textRange.isEmpty)
            return;
        // hover word
        let targetText = document.getText(textRange);
        let ctags = ctags_1.CtagsManager.ctags;
        if (ctags.doc === undefined || ctags.doc.uri !== document.uri) { // systemverilog keywords
            return;
        }
        else {
            // find symbol
            for (let i of ctags.symbols) {
                // returns the first found tag. Disregards others
                // TODO: very basic hover implementation. Can be extended
                if (i.name === targetText) {
                    let codeRange = new vscode_1.Range(i.startPosition, new vscode_1.Position(i.startPosition.line, Number.MAX_VALUE));
                    let code = document.getText(codeRange).trim();
                    let hoverText = new vscode_1.MarkdownString();
                    hoverText.appendCodeblock(code, document.languageId);
                    this.logger.log("Hover object returned");
                    return new vscode_1.Hover(hoverText);
                }
            }
            this.logger.log("Hover object not found", Logger_1.Log_Severity.Warn);
            return;
        }
    }
}
exports.default = VerilogHoverProvider;
//# sourceMappingURL=HoverProvider.js.map