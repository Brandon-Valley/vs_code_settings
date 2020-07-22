'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const rangeMethods = require("./rangeMethods");
const utils = require("./utils");
function activate(context) {
    console.log('Extension "vscode-text-pastry" is now active!');
    let disposables = [
        vscode.commands.registerCommand('extension.textPastry.1toX', () => rangeMethods.range(rangeMethods.range_1toX)),
        vscode.commands.registerCommand('extension.textPastry.0toX', () => rangeMethods.range(rangeMethods.range_0toX)),
        vscode.commands.registerCommand('extension.textPastry.AtoX', () => rangeMethods.range(rangeMethods.range_AtoX)),
        vscode.commands.registerCommand('extension.textPastry.range', () => rangeMethods.promptRange().then(range => rangeMethods.range(rangeMethods.range_generic(range)))),
        vscode.commands.registerCommand('extension.textPastry.paste', () => utils.getClipboardLines().then(lines => {
            return rangeMethods.range(lines);
        })),
        vscode.commands.registerCommand('extension.textPastry.uuid', () => rangeMethods.range(rangeMethods.range_uuid))
    ];
    context.subscriptions.push(...disposables);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map