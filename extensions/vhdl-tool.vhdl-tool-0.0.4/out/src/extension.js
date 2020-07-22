'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const vscode_languageclient_1 = require("vscode-languageclient");
function activate(context) {
    let serverPath = context.asAbsolutePath(path.join('.', 'vhdltool-wrapper.sh'));
    // If the extension is launched in debug mode then the debug server options are used
    // Otherwise the run options are used
    let serverOptions = {
        run: { command: serverPath },
        debug: { command: serverPath }
    };
    // Options to control the language client
    let clientOptions = {
        // Register the server for VHDL files
        documentSelector: ['vhdl'],
    };
    // Create the language client and start the client.
    let disposable = new vscode_languageclient_1.LanguageClient('vhdltool', 'Language Server VHDL', serverOptions, clientOptions).start();
    // Push the disposable to the context's subscriptions so that the client can be deactivated on extension deactivation
    context.subscriptions.push(disposable);
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map