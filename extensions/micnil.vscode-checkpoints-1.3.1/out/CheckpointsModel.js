'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckpointsModel = exports.isFile = exports.isCheckpoint = void 0;
const vscode_1 = require("vscode");
const path = require("path");
/**
 * Interface typegaurds
 */
function isCheckpoint(candidate) {
    return candidate.parent !== undefined;
}
exports.isCheckpoint = isCheckpoint;
function isFile(candidate) {
    return candidate.checkpointIds !== undefined;
}
exports.isFile = isFile;
/**
 * Maps all files to an array of checkpoints and updates storage
 */
class CheckpointsModel {
    constructor(context) {
        // Events
        this.onDidAddCheckpointEmitter = new vscode_1.EventEmitter();
        this.onDidRemoveCheckpointEmitter = new vscode_1.EventEmitter();
        this.onDidChangeCheckpointContextEmitter = new vscode_1.EventEmitter();
        this.onDidUpdateItemEmitter = new vscode_1.EventEmitter();
        this.context = context;
        // Initialize the checkpoints map from workspace state
        this.checkpointStore = this.getWorkspaceSate();
    }
    get onDidAddCheckpoint() {
        return this.onDidAddCheckpointEmitter.event;
    }
    get onDidRemoveCheckpoint() {
        return this.onDidRemoveCheckpointEmitter.event;
    }
    get onDidChangeCheckpointContext() {
        return this.onDidChangeCheckpointContextEmitter.event;
    }
    get onDidUpdateItem() {
        return this.onDidUpdateItemEmitter.event;
    }
    /**
     * Sets a new checkpoint context you want the tree view to operate on.
     * @param fileUri The file's uri
     */
    set checkpointContext(fileUri) {
        // If this uri is already set, or if the new uri 
        // is the custom diff view (CheckPointsDocumentView), 
        // then return. We do not want to update the tree view in 
        // these cases because we loose selection marker unnecessarily.
        if (this.currentCheckpointContext &&
            (this.currentCheckpointContext.toString() === fileUri.toString() ||
                fileUri.scheme === 'checkpointsDocumentView')) {
            return;
        }
        // Save the key to the current checkpoint
        this.currentCheckpointContext = fileUri;
        this.onDidChangeCheckpointContextEmitter.fire(this.currentCheckpointContext);
    }
    /**
     * gets the checkpoint context the tree view should operate on (current open file)
     */
    get checkpointContext() {
        return this.currentCheckpointContext;
    }
    /**
     * Get all keys (files) from the checkpoint map
     */
    get files() {
        return this.checkpointStore.files.allIds;
    }
    /**
     * Adds the current state of the document to the current checkpoint context.
     * @param document The document to save
     */
    add(document, name, timestamp) {
        const documentId = document.uri.toString();
        console.log(`Adding file '${documentId}' to checkpoint store.`);
        // If there is no entry for this document, then create one
        if (!this.checkpointStore.files.byId[documentId]) {
            // Remove the active file name and use as extra name.
            let extraName = path.dirname(documentId);
            // Truncate the name if it is too long
            if (extraName.length > this.maxLengthFileName) {
                extraName = '...' + extraName.substr(extraName.length - this.maxLengthFileName, extraName.length - 1);
            }
            let baseName = path.basename(documentId);
            // create the file
            let file = {
                id: documentId,
                name: baseName,
                extraName: extraName,
                fileNameDuplicates: [],
                checkpointIds: [],
                selection: ''
            };
            this.handleNewDuplicates(file);
            this.checkpointStore.files.byId[file.id] = file;
            this.checkpointStore.files.allIds.push(file.id);
        }
        // create the checkpoint
        let checkpoint = {
            parent: documentId,
            timestamp: timestamp,
            text: document.getText(),
            name: name,
            id: timestamp.toString(),
        };
        // Add the checkpoint to the checkpoint store
        this.checkpointStore.checkpoints.byId[checkpoint.id] = checkpoint;
        this.checkpointStore.checkpoints.allIds.push(checkpoint.id);
        // Reference the checkpoint in the file
        this.checkpointStore.files.byId[checkpoint.parent].checkpointIds.push(checkpoint.id);
        this.onDidAddCheckpointEmitter.fire(checkpoint);
        this.updateWorkspaceState(this.checkpointStore);
    }
    /**
     * Deletes all checkpoints, all from a file or one
     * checkpoint from the store.
     * @param id optional id of the checkpoint or file to remove
     */
    remove(id) {
        console.log("Removing checkpoint(s)");
        let removedItem;
        // Labeled block that exits as soon as we removed the item.
        itemRemoved: {
            // If id undefined, delete all checkpoints.  
            if (!id) {
                removedItem = this.clearAll();
                break itemRemoved;
            }
            // If id represents a file, clear the file of all checkpoints.
            let file = this.getFile(id);
            if (file) {
                removedItem = this.clearFile(id);
                break itemRemoved;
            }
            // If id represents a checkpoint, delete the checkpoint
            let checkpoint = this.getCheckpoint(id);
            if (checkpoint) {
                removedItem = this.deleteCheckpoint(id);
                break itemRemoved;
            }
        }
        if (!removedItem) {
            console.warn("The item/items to remove were not found");
            return;
        }
        this.onDidRemoveCheckpointEmitter.fire(removedItem);
        this.updateWorkspaceState(this.checkpointStore);
    }
    /**
     * Gets all checkpoints or all for a specific file.
     * @param fileId optional file id to get checkpoints from
     */
    getCheckpoints(fileId) {
        // The checkpoint IDs to get.
        let checkpointsIds;
        if (!fileId) {
            // All checkpoints
            checkpointsIds = this.checkpointStore.checkpoints.allIds;
        }
        else {
            // All checkoints from a specific file
            const file = this.checkpointStore.files.byId[fileId];
            checkpointsIds = file ? file.checkpointIds : [];
        }
        // Get the checkpoints by their ID
        let checkpoints = [];
        for (let checkpointId of checkpointsIds) {
            checkpoints.push(this.getCheckpoint(checkpointId));
        }
        return checkpoints;
    }
    /**
     * Get a checkpoint from the checkpoint store
     * @param id The id of the checkpoint
     */
    getCheckpoint(id) {
        return this.checkpointStore.checkpoints.byId[id];
    }
    /**
     * Get a file from the checkpoint store.
     * @param id The id of the file
     */
    getFile(id) {
        return this.checkpointStore.files.byId[id];
    }
    /**
     * Rename a specific checkpoint to a new name.
     * @param id The id of the checkpoint
     * @param newName The name to set
     */
    renameCheckpoint(id, newName) {
        console.log(`Renaming checkpoint with id '${id}' to ${newName}`);
        let checkpoint = this.getCheckpoint(id);
        checkpoint.name = newName;
        this.onDidUpdateItemEmitter.fire(checkpoint);
    }
    /**
     * Marks the given checkpoint as selected in the
     * files store. Only one checkpoint can be selected
     * at a time.
     * @param id id of the checkpoint
     */
    selectCheckpoint(checkpointId) {
        console.log(`Selecting checkpoint with id: ${checkpointId}`);
        const checkpoint = this.getCheckpoint(checkpointId);
        if (!checkpoint) {
            console.error(`Selection failed: checkpoint not found`);
            return;
        }
        let file = this.checkpointStore.files.byId[checkpoint.parent];
        file.selection = checkpoint.id;
        this.onDidUpdateItemEmitter.fire(file);
    }
    /**
     * Clears the selected checkpoint from the file.
     * @param fileId the file id
     */
    clearSelectionFromFile(fileId) {
        console.log(`Clearing checkpoint selection from file with id: ${fileId}`);
        let file = this.getFile(fileId);
        if (!file) {
            console.error(`Clear selection failed: file not found`);
            return;
        }
        file.selection = '';
        this.onDidUpdateItemEmitter.fire(file);
    }
    /**
     * Deletes a checkpoint from the model.
     * @param id The id of the checkpoint
     */
    deleteCheckpoint(id) {
        console.log(`deleting checkpoint with id  '${id}'`);
        // get the checkpoint
        let checkpoint = this.getCheckpoint(id);
        if (!checkpoint) {
            console.error(`The checkpoint with id: '${id}' does not exist`);
            return;
        }
        // Remove the checkpoint
        delete this.checkpointStore.checkpoints.byId[checkpoint.id];
        // Remove the checkpoint id from the allIds array
        let cpToRemoveIndex = this.checkpointStore.checkpoints.allIds.findIndex(id => id == checkpoint.id);
        this.checkpointStore.checkpoints.allIds.splice(cpToRemoveIndex, 1);
        // Get the file
        let file = this.getFile(checkpoint.parent);
        if (!file) {
            console.error(`Unable to find the file: ${checkpoint.parent} that the checkpoint belongs to.`);
            return checkpoint;
        }
        // If this is the selected checkpoint in the file,
        // remove the reference to it.
        if (file.selection === id) {
            file.selection = '';
        }
        // Remove the checkpoint reference from the file
        file.checkpointIds = file.checkpointIds.filter(id => id !== checkpoint.id);
        // If the file is now empty of checkpoints, remove the file from store
        if (file.checkpointIds.length === 0) {
            delete this.checkpointStore.files.byId[file.id];
            let fileToRemoveIndex = this.checkpointStore.files.allIds.findIndex(id => id == file.id);
            this.checkpointStore.files.allIds.splice(fileToRemoveIndex, 1);
            this.handleRemovedDuplicates(file);
        }
        return checkpoint;
    }
    /**
     * Deletes all checkpoint that belongs to the a specific file
     * @param id The file id
     */
    clearFile(id) {
        console.log(`clearing checkpoints from file with id: '${id}'`);
        let file = this.getFile(id);
        if (!file) {
            console.error(`The file with '${id}' does not exist`);
            return;
        }
        // Delete all checkpoints that belong to the file
        for (let checkpointId of file.checkpointIds) {
            this.deleteCheckpoint(checkpointId);
        }
        return file;
    }
    /**
     * Clears the entire checkpoint store, and updates the workspace state.
    */
    clearAll() {
        this.checkpointStore = this.createEmptyStore();
        this.updateWorkspaceState(this.checkpointStore);
        return this.checkpointStore;
    }
    /**
     * Serializes and updates the workspace state with the checkpoint store.
     * @param checkpointStore the checkpoint store
     */
    updateWorkspaceState(checkpointStore) {
        this.context.workspaceState.update("checkpointsStore", checkpointStore)
            .then(() => { }, reason => {
            console.error(`Failed to update storage. Will not persist the session: ${reason}`);
            vscode_1.window.showWarningMessage("Failed to update the checkpoint store to workspace storage.");
        });
    }
    /**
     * Checks the store of a previously removed file
     * had any file name duplicates, and if it does,
     * unmarks itself from their fileNameDuplicates array.
     * @param removedFile The file that has been removed.
     */
    handleRemovedDuplicates(removedFile) {
        for (let fileId of removedFile.fileNameDuplicates) {
            let duplicatefile = this.checkpointStore.files.byId[fileId];
            let removeIndex = duplicatefile.fileNameDuplicates.findIndex(id => id === removedFile.id);
            // Not found
            if (removeIndex === -1) {
                console.error(`The removed file has marked ${duplicatefile.name} as duplicate,
					 but this was not mutual`);
            }
            duplicatefile.fileNameDuplicates.splice(removeIndex, 1);
        }
    }
    /**
     * Checks the store if the new (not-yet added) file
     * has any duplicate file names, and adds their
     * respective IDs to their fileNameDuplicates arrays
     * if they do.
     * @param newFile The file that WILL be added
     */
    handleNewDuplicates(newFile) {
        for (let fileId of this.checkpointStore.files.allIds) {
            let file = this.checkpointStore.files.byId[fileId];
            // If this is not a duplicate, just continue;
            if (newFile.name !== file.name) {
                continue;
            }
            // This file is a duplicate
            newFile.fileNameDuplicates.push(file.id);
            file.fileNameDuplicates.push(newFile.id);
        }
    }
    /**
     * Helper method to create an empty store object.
    */
    createEmptyStore() {
        return {
            version: 1,
            files: {
                byId: {},
                allIds: []
            },
            checkpoints: {
                byId: {},
                allIds: []
            }
        };
    }
    getWorkspaceSate() {
        let checkpointStore = this.context.workspaceState.get("checkpointsStore", this.createEmptyStore());
        // If the saved store does not have a version number,
        // it is the first version of the store. Correct the changes
        // that has been made since.
        if (!checkpointStore.version) {
            console.log("Updating the checkpoint store state to version 1");
            // The ID of the files were changed
            // from the file's fsPath to the files
            // URI.toString(). Convert all current file
            // IDs to the new format.
            let { files } = checkpointStore;
            files.allIds = files.allIds.map(id => {
                try {
                    // Get the new id
                    let newId = vscode_1.Uri.file(id).toString();
                    // create a new entry for new version of the file
                    files.byId[newId] = files.byId[id];
                    files.byId[newId].id = newId;
                    // delete the old version
                    delete files.byId[id];
                    return newId;
                }
                catch (err) {
                    // log error and continue
                    console.error(`Failed to convert file id '${id}' to new format: ${err}`);
                    return id;
                }
            });
            let { checkpoints } = checkpointStore;
            for (let id of checkpoints.allIds) {
                try {
                    let parentId = checkpoints.byId[id].parent;
                    let newParentId = vscode_1.Uri.file(parentId).toString();
                    checkpoints.byId[id].parent = newParentId;
                }
                catch (err) {
                    // just continue. If this failed, then the conversion above
                    // must have failed also, and we have logged the error.
                }
            }
            // Update version number.
            checkpointStore.version = 1;
            this.updateWorkspaceState(checkpointStore);
            console.log("Checkpoint store state updated");
        }
        return checkpointStore;
    }
}
exports.CheckpointsModel = CheckpointsModel;
//# sourceMappingURL=CheckpointsModel.js.map