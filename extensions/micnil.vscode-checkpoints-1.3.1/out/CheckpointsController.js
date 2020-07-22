"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckpointsController = void 0;
const vscode_1 = require("vscode");
class CheckpointsController {
    constructor(context, model, treeView, documentView) {
        this.context = context;
        this.model = model;
        this.treeView = treeView;
        this.documentView = documentView;
    }
    initialize() {
        this.activeEditor = vscode_1.window.activeTextEditor;
        if (!this.activeEditor) {
            return;
        }
        // initial selection of slot context.
        this.model.checkpointContext = this.activeEditor.document.uri;
        // Update the active editor on when it changes
        this.context.subscriptions.push(vscode_1.window.onDidChangeActiveTextEditor(editor => {
            if (!editor) {
                return;
            }
            this.activeEditor = editor;
            this.model.checkpointContext = this.activeEditor.document.uri;
        }, null, this.context.subscriptions));
        this.context.subscriptions.push(vscode_1.window.registerTreeDataProvider('checkpointsTreeViewExplorer', this.treeView), vscode_1.window.registerTreeDataProvider('checkpointsTreeViewScm', this.treeView), vscode_1.workspace.registerTextDocumentContentProvider('checkpointsDocumentView', this.documentView));
        // Register commands
        // =================
        this.context.subscriptions.push(vscode_1.commands.registerCommand('checkpoints.deleteCheckpoint', checkpointNode => {
            this.promptAreYouSure(`Are you sure you want to delete checkpoint '${checkpointNode.label}'?`, () => {
                this.model.remove(checkpointNode.nodeId);
            });
        }), vscode_1.commands.registerCommand('checkpoints.clearFile', checkpointNode => {
            this.promptAreYouSure(`Are you sure you want to clear all checkpoints from file '${checkpointNode.nodeId}'?`, () => {
                this.model.remove(checkpointNode.nodeId);
            });
        }), vscode_1.commands.registerCommand('checkpoints.clearAll', () => {
            this.promptAreYouSure(`Are you sure you want to clear ALL checkpoints?`, () => {
                this.model.remove();
            });
        }), vscode_1.commands.registerCommand('checkpoints.selectCheckpoint', (checkpointNode) => {
            this.model.selectCheckpoint(checkpointNode.nodeId);
        }), vscode_1.commands.registerCommand('checkpoints.deselectCheckpoint', (checkpointNode) => {
            this.model.clearSelectionFromFile(checkpointNode.parentId);
        }));
        this.context.subscriptions.push(vscode_1.commands.registerCommand('checkpoints.refresh', this.treeView.refresh, this.treeView), vscode_1.commands.registerCommand('checkpoints.addCheckpoint', this.onAddCheckpoint, this), vscode_1.commands.registerCommand('checkpoints.diffWithCurrent', this.onDiffWithCurrent, this), vscode_1.commands.registerCommand('checkpoints.diffWithSelection', this.onDiffWithSelection, this), vscode_1.commands.registerCommand('checkpoints.restoreCheckpoint', this.onRestoreCheckpoint, this), vscode_1.commands.registerCommand('checkpoints.openFile', this.onOpenFile, this), vscode_1.commands.registerCommand('checkpoints.renameCheckpoint', this.onRenameCheckpoint, this), vscode_1.commands.registerCommand('checkpoints.toggleTreeViewContext', this.onToggleShowActiveFileOnly, this));
    }
    /**
     * Tries to add a new checkpoint from the current document to
     * the checkpoint model.
    */
    onAddCheckpoint() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.activeEditor.document.uri.scheme === "untitled") {
                console.log(`Failed to add file to store. Unsaved documents are currently not supported`);
                vscode_1.window.showInformationMessage("Untitled documents are currently not supported");
                return;
            }
            const timestamp = Date.now();
            // local helper method to a a checkpoint.
            let addCheckpoint = (name) => {
                try {
                    this.model.add(this.activeEditor.document, name, timestamp);
                    this.activeEditor.document.save();
                    vscode_1.window.setStatusBarMessage(`Added checkpoint '${defaultName}'`, 5000);
                }
                catch (err) {
                    vscode_1.window.showErrorMessage(`Add checkpoint failed: ${err.message}`);
                }
            };
            const config = vscode_1.workspace.getConfiguration('checkpoints');
            // create default name
            let locale = config.get('locale');
            const defaultName = new Date(timestamp).toLocaleString(locale);
            // If "ask for checkpoint name" is disabled, use default name.
            if (config.get('askForCheckpointName') === false) {
                addCheckpoint(defaultName);
                return;
            }
            // Ask the user for a checkpoint name
            let result = yield vscode_1.window.showInputBox({
                ignoreFocusOut: true,
                prompt: 'Give your checkpoint a name.',
                value: defaultName,
                valueSelection: undefined,
            });
            if (result === undefined) {
                console.log(`Add checkpoint canceled`);
                return;
            }
            // User provided no name.
            if (result === "") {
                result = "Untitled";
            }
            addCheckpoint(result);
        });
    }
    /**
     * Get the checkpoints saved document and replaces the text in the editor
     * @param checkpointNode checkpoint node from the tree view
     */
    onRestoreCheckpoint(checkpointNode) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Restoring checkpoint: '${checkpointNode.label}', with id: '${checkpointNode.nodeId}'`);
            let textDocument;
            let success;
            try {
                // Get the document to edit.
                textDocument = yield this.openTextDocument(checkpointNode);
                // Create a range spanning the entire content of the file
                let lastLine = textDocument.lineAt(textDocument.lineCount - 1);
                let documentRange = new vscode_1.Range(new vscode_1.Position(0, 0), lastLine.rangeIncludingLineBreak.end);
                // Create an edit job
                let workspaceEdit = new vscode_1.WorkspaceEdit();
                workspaceEdit.replace(textDocument.uri, documentRange, this.model.getCheckpoint(checkpointNode.nodeId).text);
                // Apply the edit job
                success = yield vscode_1.workspace.applyEdit(workspaceEdit);
                if (success) {
                    // Only save if this is not an untitled document
                    // (this happens if the original file is removed/replace/renamed)
                    if (textDocument.isUntitled) {
                        vscode_1.window.showInformationMessage(`Restored checkpoint '${checkpointNode.label}'`);
                    }
                    else {
                        vscode_1.window.showInformationMessage(`Restored '${textDocument.fileName}' to checkpoint '${checkpointNode.label}'`);
                        textDocument.save();
                    }
                }
            }
            catch (err) {
                vscode_1.window.showErrorMessage(`Failed to restore file '${checkpointNode.parentId}': ${err.message}`);
                console.error(err);
                return;
            }
            // The file is not open in the currently active editor, open it.
            if (success && checkpointNode.parentId !== this.model.checkpointContext.toString()) {
                let editor = yield vscode_1.window.showTextDocument(textDocument, {
                    preserveFocus: false,
                    preview: true,
                });
            }
        });
    }
    ;
    /**
     * Opens the current file of the checkpoint.
     * @param checkpointNode checkpoint node from the tree view
     */
    onOpenFile(checkpointNode) {
        console.log(`Opening file: '${checkpointNode.nodeId}'`);
        vscode_1.workspace.openTextDocument(vscode_1.Uri.parse(checkpointNode.nodeId)).then(
        // On success:
        textDocument => {
            vscode_1.window.showTextDocument(textDocument, {
                preserveFocus: false,
                preview: true,
            });
        }, 
        // On failure:
        error => {
            vscode_1.window.showErrorMessage(`Cannot open file ${checkpointNode.nodeId}, showing preview of most recent checkpoint instead`);
            console.error(error.message);
            let allCheckpoints = this.model.getCheckpoints(checkpointNode.nodeId);
            this.documentView.showPreview(allCheckpoints[0].id);
        });
    }
    ;
    /**
     * Opens a input dialog to request a new name for a checkpoint and
     * updates the model.
     * @param checkpointNode checkpoint node from the tree view
     */
    onRenameCheckpoint(checkpointNode) {
        console.log(`Rename checkpoint command invoked on checkpoint: '${checkpointNode.label}'`);
        vscode_1.window
            .showInputBox({
            ignoreFocusOut: true,
            prompt: 'Type in a new name for the checkpoint.',
            value: checkpointNode.label,
            valueSelection: undefined,
        })
            .then(result => {
            if (result === undefined) {
                console.log(`Rename checkpoint canceled`);
                return;
            }
            if (result === checkpointNode.label) {
                console.log(`Checkpoint name is the same as before, returning.`);
                return;
            }
            this.model.renameCheckpoint(checkpointNode.nodeId, result);
        });
    }
    ;
    /**
     * Gets the text document passes it to the diff view.
     * @param checkpointNode Checkpoint node to diff against
     */
    onDiffWithCurrent(checkpointNode) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let textDocument = yield vscode_1.workspace.openTextDocument(vscode_1.Uri.parse(checkpointNode.parentId));
                this.documentView.showDiffWithDocument(textDocument.uri, checkpointNode.nodeId);
            }
            catch (err) {
                console.error(err);
                vscode_1.window.showErrorMessage(`Failed to show diff for ${checkpointNode.label}: ${err.message}`);
                this.documentView.showPreview(checkpointNode.nodeId);
            }
        });
    }
    /**
     * Shows a diff between the checkpoint marked as selected and the checkpoint
     * that this command was triggered by.
     * @param checkpointNode Checkpoint node that this command was triggered by
     */
    onDiffWithSelection(checkpointNode) {
        const file = this.model.getFile(checkpointNode.parentId);
        if (file.selection === '') {
            vscode_1.window.showInformationMessage('Please mark a checkpoint as selected first.');
            return;
        }
        this.documentView.showDiffWithCheckpoint(checkpointNode.nodeId, file.selection);
    }
    /**
     * Toggles the configuration showActiveFileOnly
     * and refreshed the tree view.
    */
    onToggleShowActiveFileOnly() {
        let config = vscode_1.workspace.getConfiguration('checkpoints');
        let currentConfigValue = config.get('showActiveFileOnly');
        config.update('showActiveFileOnly', !currentConfigValue)
            .then(() => {
            vscode_1.window.setStatusBarMessage(`Set showActiveFileOnly config to '${!currentConfigValue}'`, 5000);
            this.treeView.refresh();
        }, (err) => {
            console.error(err);
            vscode_1.window.showErrorMessage("Failed to toggle 'Show Active File Only'");
        });
    }
    /**
     * Wrapper for workspace.openTextDocument that will
     * open an untitled (unsaved) text document if it has been removed.
     * @param filePath The absolute file path
     */
    openTextDocument(checkpoint) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield vscode_1.workspace.openTextDocument(vscode_1.Uri.parse(checkpoint.parentId));
            }
            catch (err) {
                vscode_1.window.showWarningMessage("Failed to open original document, opening untitled document instead.");
                return yield vscode_1.workspace.openTextDocument({
                    content: this.model.getCheckpoint(checkpoint.nodeId).text,
                });
            }
        });
    }
    /**
     * Prompt the user with a modal before performing an action
     * @param message Message to ask the user (yes/no question)
     * @param cb Callback that will be called if answer is yes
     */
    promptAreYouSure(message, cb) {
        vscode_1.window
            .showWarningMessage(message, { modal: true }, { title: 'Yes', isCloseAffordance: false }, { title: 'No', isCloseAffordance: true })
            .then(answer => {
            if (answer.title === 'Yes') {
                cb();
            }
        });
    }
}
exports.CheckpointsController = CheckpointsController;
//# sourceMappingURL=CheckpointsController.js.map