"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.Log_Severity = void 0;
const vscode_1 = require("vscode");
const logChannel = vscode_1.window.createOutputChannel("Verilog");
var Log_Severity;
(function (Log_Severity) {
    Log_Severity[Log_Severity["Info"] = 0] = "Info";
    Log_Severity[Log_Severity["Warn"] = 1] = "Warn";
    Log_Severity[Log_Severity["Error"] = 2] = "Error";
    Log_Severity[Log_Severity["Command"] = 3] = "Command";
})(Log_Severity = exports.Log_Severity || (exports.Log_Severity = {}));
class Logger {
    constructor() {
        // Register for any changes to logging
        vscode_1.workspace.onDidChangeConfiguration(() => {
            this.CheckIfEnabled();
        });
        this.CheckIfEnabled();
    }
    CheckIfEnabled() {
        this.isEnabled = vscode_1.workspace.getConfiguration().get('verilog.logging.enabled');
    }
    log(msg, severity = Log_Severity.Info) {
        if (this.isEnabled) {
            if (severity == Log_Severity.Command)
                logChannel.appendLine("> " + msg);
            else
                logChannel.appendLine("[" + Log_Severity[severity] + "] " + msg);
        }
    }
}
exports.Logger = Logger;
//# sourceMappingURL=Logger.js.map