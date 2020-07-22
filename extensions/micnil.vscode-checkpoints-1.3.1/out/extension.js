'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const CheckpointsModel_1 = require("./CheckpointsModel");
const CheckpointsTreeView_1 = require("./CheckpointsTreeView");
const CheckpointsController_1 = require("./CheckpointsController");
const CheckpointsDocumentView_1 = require("./CheckpointsDocumentView");
// this method is called when the extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Initialize views, models and controllers.
    let checkpointsModel = new CheckpointsModel_1.CheckpointsModel(context);
    let checkpointsTreeView = new CheckpointsTreeView_1.CheckpointsTreeView(context, checkpointsModel);
    let checkpointsDocumentView = new CheckpointsDocumentView_1.CheckpointsDocumentView(context, checkpointsModel);
    let checkpointsController = new CheckpointsController_1.CheckpointsController(context, checkpointsModel, checkpointsTreeView, checkpointsDocumentView);
    checkpointsController.initialize();
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map