"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const ctags_1 = require("../ctags");
class VerilogDefinitionProvider {
    constructor(logger) {
        this.logger = logger;
    }
    provideDefinition(document, position, token) {
        this.logger.log("Definitions Requested: " + document.uri);
        return new Promise((resolve, reject) => {
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
                let matchingSymbols = [];
                let definitions = [];
                // find all matching symbols
                for (let i of ctags.symbols) {
                    if (i.name === targetText) {
                        matchingSymbols.push(i);
                    }
                }
                for (let i of matchingSymbols) {
                    definitions.push({
                        targetUri: document.uri,
                        targetRange: new vscode_1.Range(i.startPosition, new vscode_1.Position(i.startPosition.line, Number.MAX_VALUE)),
                        targetSelectionRange: new vscode_1.Range(i.startPosition, i.endPosition)
                    });
                }
                this.logger.log(definitions.length + " definitions returned");
                resolve(definitions);
            }
        });
    }
}
exports.default = VerilogDefinitionProvider;
//# sourceMappingURL=DefinitionProvider.js.map