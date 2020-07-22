'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs = require("fs");
function activate(context) {
    const formatUris = (uris) => __awaiter(this, void 0, void 0, function* () {
        // Getting current settings
        const saveAfterFormat = vscode.workspace.getConfiguration().get('formatContextMenu.saveAfterFormat');
        const closeAfterSave = vscode.workspace.getConfiguration().get('formatContextMenu.closeAfterSave');
        const increment = (1 / uris.length) * 100;
        const progressOptions = {
            location: vscode.ProgressLocation.Notification,
            title: 'Formatting files',
            cancellable: true,
        };
        vscode.window.withProgress(progressOptions, (progress, cancellationToken) => __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < uris.length; i++) {
                const uri = uris[i];
                if (cancellationToken.isCancellationRequested) {
                    break;
                }
                try {
                    progress.report({
                        message: `${i + 1}/${uris.length}`
                    });
                    yield vscode.window.showTextDocument(uris[i], { preserveFocus: false, preview: true });
                    yield vscode.commands.executeCommand('editor.action.formatDocument', uri);
                    if (saveAfterFormat) {
                        yield vscode.commands.executeCommand('workbench.action.files.save', uri);
                        if (closeAfterSave) {
                            yield vscode.commands.executeCommand('workbench.action.closeActiveEditor', uri);
                        }
                    }
                }
                catch (exception) {
                    vscode.window.showWarningMessage(`Could not format file ${uri}`);
                }
                progress.report({
                    increment: increment,
                });
            }
        }));
    });
    const getRecursiveUris = (uris) => __awaiter(this, void 0, void 0, function* () {
        let outputUris = [];
        for (let i = 0; i < uris.length; i++) {
            if (fs.existsSync(uris[i].fsPath)) {
                if (fs.lstatSync(uris[i].fsPath).isDirectory()) {
                    outputUris = [...outputUris, ...yield vscode.workspace.findFiles({
                            base: uris[i].path,
                            pattern: '**/*'
                        })];
                }
                else {
                    outputUris.push(uris[i]);
                }
            }
        }
        return outputUris;
    });
    context.subscriptions.push(...[
        vscode.commands.registerCommand('extension.formatSelectedFilesFromScmContext', (...selectedFiles) => __awaiter(this, void 0, void 0, function* () {
            const uris = yield getRecursiveUris(selectedFiles.map(x => x.resourceUri));
            yield formatUris(uris);
        })),
        vscode.commands.registerCommand('extension.formatSelectedFileFromEditorTileContext', (clickedFile) => __awaiter(this, void 0, void 0, function* () {
            yield formatUris([clickedFile]);
        })),
        vscode.commands.registerCommand('extension.formatSelectedFilesFromExplorerContext', (clickedFile, selectedFiles) => __awaiter(this, void 0, void 0, function* () {
            const uris = yield getRecursiveUris(selectedFiles || [clickedFile]);
            yield formatUris(uris);
        }))
    ]);
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map