"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode_1 = require("vscode");
function getSurroundConfig() {
    let config = vscode_1.workspace.getConfiguration("surround");
    const items = config.get("with", {});
    const custom = config.get("custom", {});
    return Object.assign({}, items, custom);
}
function getEnabledSurroundItems() {
    const items = [];
    const surroundConfig = getSurroundConfig();
    Object.keys(surroundConfig).forEach(surroundItemKey => {
        const surroundItem = surroundConfig[surroundItemKey];
        if (!surroundItem.disabled) {
            items.push(surroundItem);
        }
    });
    return items;
}
function getQuickPickItems(surroundItems) {
    const items = [];
    surroundItems.forEach(surroundItem => {
        if (!surroundItem.disabled) {
            const { label, description } = surroundItem;
            items.push({
                label,
                description
            });
        }
    });
    return items;
}
function applyQuickPick(item, surroundItems) {
    let activeEditor = vscode_1.window.activeTextEditor;
    if (activeEditor && item) {
        let surroundItem = surroundItems.find(s => item.label === s.label);
        if (surroundItem) {
            activeEditor.insertSnippet(new vscode_1.SnippetString(surroundItem.snippet));
        }
    }
}
function applySurroundItem(key) {
    const surroundConfig = getSurroundConfig();
    if (vscode_1.window.activeTextEditor && surroundConfig[key]) {
        const surroundItem = surroundConfig[key];
        vscode_1.window.activeTextEditor.insertSnippet(new vscode_1.SnippetString(surroundItem.snippet));
    }
}
function registerCommands(context) {
    const surroundConfig = getSurroundConfig();
    vscode_1.commands.getCommands().then(cmdList => {
        Object.keys(surroundConfig).forEach(key => {
            const cmdText = `surround.with.${key}`;
            if (cmdList.indexOf(cmdText) === -1) {
                context.subscriptions.push(vscode_1.commands.registerCommand(cmdText, () => {
                    applySurroundItem(key);
                }));
            }
        });
    });
}
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    let quickPickItems;
    let surroundItems = [];
    function update() {
        surroundItems = getEnabledSurroundItems();
        quickPickItems = getQuickPickItems(surroundItems);
        registerCommands(context);
    }
    vscode_1.workspace.onDidChangeConfiguration(() => {
        update();
    });
    update();
    let disposable = vscode_1.commands.registerCommand("surround.with", () => {
        vscode_1.window.showQuickPick(quickPickItems).then(item => {
            if (item) {
                applyQuickPick(item, surroundItems);
            }
        });
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=surround.js.map