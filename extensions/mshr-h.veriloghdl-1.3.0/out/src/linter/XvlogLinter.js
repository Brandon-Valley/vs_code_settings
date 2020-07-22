"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const child_process_1 = require("child_process");
const BaseLinter_1 = require("./BaseLinter");
const Logger_1 = require("../Logger");
class XvlogLinter extends BaseLinter_1.default {
    constructor(logger) {
        super("xvlog", logger);
    }
    lint(doc) {
        this.logger.log('xvlog lint requested');
        let svArgs = (doc.languageId == "systemverilog") ? "-sv" : ""; //Systemverilog args
        let command = "xvlog " + svArgs + " -nolog " + doc.fileName;
        this.logger.log(command, Logger_1.Log_Severity.Command);
        let process = child_process_1.exec(command, (error, stdout, stderr) => {
            let diagnostics = [];
            let lines = stdout.split(/\r?\n/g);
            lines.forEach((line) => {
                let tokens = line.split(/:?\s*(?:\[|\])\s*/).filter(Boolean);
                if (tokens.length < 4
                    || tokens[0] != "ERROR"
                    || !tokens[1].startsWith("VRFC")) {
                    return;
                }
                // Get filename and line number
                let [filename, lineno_str] = tokens[3].split(/:(\d+)/);
                let lineno = parseInt(lineno_str) - 1;
                // if (filename != doc.fileName) // Check that filename matches
                //     return;
                let diagnostic = {
                    severity: vscode_1.DiagnosticSeverity.Error,
                    code: tokens[1],
                    message: "[" + tokens[1] + "] " + tokens[2],
                    range: new vscode_1.Range(lineno, 0, lineno, Number.MAX_VALUE),
                    source: "xvlog",
                };
                diagnostics.push(diagnostic);
            });
            this.logger.log(diagnostics.length + ' errors/warnings returned');
            this.diagnostic_collection.set(doc.uri, diagnostics);
        });
    }
}
exports.default = XvlogLinter;
//# sourceMappingURL=XvlogLinter.js.map