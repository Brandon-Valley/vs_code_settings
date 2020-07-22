'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckpointNode = exports.CheckpointsTreeView = void 0;
const vscode_1 = require("vscode");
class CheckpointsTreeView {
    constructor(context, model) {
        this.context = context;
        this.model = model;
        this._onDidChangeTreeData = new vscode_1.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        // register to the models events.
        // TODO: Improve performance by only updating the affected file nodes.
        // This can be problematic without keeping a representation of the 
        // current tree view state. _onDidChangeTreeData only takes CheckpointNode
        // as argument.
        context.subscriptions.push(model.onDidChangeCheckpointContext(filename => {
            this._onDidChangeTreeData.fire();
        }), model.onDidAddCheckpoint(checkpoint => {
            this._onDidChangeTreeData.fire();
        }), model.onDidRemoveCheckpoint(checkpoint => {
            this._onDidChangeTreeData.fire();
        }), model.onDidUpdateItem(checkpoint => {
            this._onDidChangeTreeData.fire();
        }));
    }
    /**
     * Refresh the entire tree view.
     */
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    /**
     * Assigns the TreeItem specific fields in the checkpoint node elements.
     * Will be called for each node before render, and every time they are updated.
     * @param element
     */
    getTreeItem(element) {
        // No parent => File nodes
        if (!element.parentId) {
            const config = vscode_1.workspace.getConfiguration('checkpoints');
            // Get the file from the model.
            let file = this.model.getFile(element.nodeId);
            // Control the collapsed state of the file. We want it to expand when the file is selected
            // and collapse when it is not selected.
            element.collapsibleState =
                this.model.checkpointContext.toString() === file.id
                    ? vscode_1.TreeItemCollapsibleState.Expanded
                    : vscode_1.TreeItemCollapsibleState.Collapsed;
            // Set the file icon
            if (this.model.checkpointContext.toString() === file.id) {
                element.iconPath = {
                    light: this.context.asAbsolutePath('resources/light/file-selected.svg'),
                    dark: this.context.asAbsolutePath('resources/dark/file-selected.svg'),
                };
            }
            else {
                element.iconPath = {
                    light: this.context.asAbsolutePath('resources/light/file.svg'),
                    dark: this.context.asAbsolutePath('resources/dark/file.svg'),
                };
            }
            if (config.get('autoOpenFile')) {
                element.command = {
                    command: 'checkpoints.openFile',
                    arguments: [element],
                    title: 'Open File',
                };
            }
            let label = file.name;
            // File has name duplicates, add extra name.
            if (file.fileNameDuplicates.length > 0) {
                label = label + ` (${file.extraName})`;
            }
            element.label = label;
            element.contextValue = 'file';
            if (vscode_1.workspace.getConfiguration('checkpoints').get('autoSelectFile')) {
                // The id field of tree items is used to maintain the selection and collapsible state
                // of nodes in the tree view. By default, the label is used to create an unique id,
                // But since we want to modify the collapsed state on each update (without
                // modifying the label), we generate a new id for the node.
                // To keep the dependencies of the extension to a minimum this little random
                // id generator is used. The entropy is not that important, worst case
                // scenario is that the node doesn't collapse/expand when it is supposed to.
                element.id = String(Math.floor(Math.random() * 9e15));
            }
            else {
                element.id = file.id;
            }
            return element;
        }
        // checkpoint nodes
        let checkpoint = this.model.getCheckpoint(element.nodeId);
        element.collapsibleState = vscode_1.TreeItemCollapsibleState.None;
        element.label = checkpoint.name;
        // Set the correct context value and icon
        let parentFile = this.model.getFile(element.parentId);
        if (parentFile && parentFile.selection == element.nodeId) {
            element.iconPath = {
                light: this.context.asAbsolutePath('resources/light/check.svg'),
                dark: this.context.asAbsolutePath('resources/dark/check.svg'),
            };
            element.contextValue = 'selectedCheckpoint';
        }
        else {
            element.contextValue = 'checkpoint';
        }
        return element;
    }
    /**
     * This function will be used to recursively get all items in the tree.
     * First time it is called with a null argument that indicates to get
     * the top level nodes.
     * @param element The element to get the children from.
     */
    getChildren(element) {
        const config = vscode_1.workspace.getConfiguration('checkpoints');
        const showActiveFileOnly = config.get('showActiveFileOnly');
        // If this is the root, and we only want to show the checkpoints
        // that belong to the currently active file only, return checkpoint
        // nodes.
        if (!element && showActiveFileOnly) {
            let checkpoints = this.model.getCheckpoints(this.model.checkpointContext.toString());
            return checkpoints.map(checkpoint => {
                return new CheckpointNode(checkpoint.id, checkpoint.parent);
            });
        }
        // If this is the root, get all files that have been saved
        if (!element) {
            let savedFiles = this.model.files;
            return savedFiles.map(fileId => {
                return new CheckpointNode(fileId);
            });
        }
        // This element has no parent, it must be a file,
        // get all checkpoints for the file.
        if (!element.parentId) {
            let checkpoints = this.model.getCheckpoints(element.nodeId);
            return checkpoints.map(checkpoint => {
                return new CheckpointNode(checkpoint.id, checkpoint.parent);
            });
        }
        // if this element is a checkpoint, it has no children
        return [];
    }
}
exports.CheckpointsTreeView = CheckpointsTreeView;
/**
 * One node in the tree view. Can either represent a file (collapsible root)
 * or a checkpoint.
 */
class CheckpointNode extends vscode_1.TreeItem {
    constructor(nodeId, parentId) {
        // Will assign TreeItem fields later.
        super('');
        this.nodeId = nodeId;
        this.parentId = parentId;
    }
}
exports.CheckpointNode = CheckpointNode;
//# sourceMappingURL=CheckpointsTreeView.js.map