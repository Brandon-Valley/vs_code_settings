'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var vscode = require("vscode");
var VHDLFormatter = require("./VHDLFormatter/VHDLFormatter");
var config = require("./config");
function getDocumentRange(document) {
    var start = new vscode.Position(0, 0);
    var lastLine = document.lineCount - 1;
    var end = new vscode.Position(lastLine, document.lineAt(lastLine).text.length);
    return new vscode.Range(start, end);
}
function activate(context) {
    vscode.languages.registerDocumentFormattingEditProvider('vhdl', {
        provideDocumentFormattingEdits: function (document, options) {
            var range = getDocumentRange(document);
            var content = document.getText(range);
            var result = [];
            var beautifierSettings = config.getConfig(options);
            var formatted = VHDLFormatter.beautify(content, beautifierSettings);
            if (formatted) {
                result.push(new vscode.TextEdit(range, formatted));
            }
            return result;
        }
    });
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map