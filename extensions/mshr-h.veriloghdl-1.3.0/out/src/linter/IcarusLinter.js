"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const child = require("child_process");
const BaseLinter_1 = require("./BaseLinter");
const Logger_1 = require("../Logger");
var isWindows = process.platform === "win32";
class IcarusLinter extends BaseLinter_1.default {
    constructor(logger) {
        super("iverilog", logger);
        vscode_1.workspace.onDidChangeConfiguration(() => {
            this.getConfig();
        });
        this.getConfig();
    }
    getConfig() {
        this.iverilogArgs = vscode_1.workspace.getConfiguration().get('verilog.linting.iverilog.arguments');
        this.runAtFileLocation = vscode_1.workspace.getConfiguration().get('verilog.linting.iverilog.runAtFileLocation');
    }
    lint(doc) {
        this.logger.log('iverilog lint requested');
        let docUri = doc.uri.fsPath; //path of current doc
        let lastIndex = (isWindows == true) ? docUri.lastIndexOf("\\") : docUri.lastIndexOf("/");
        let docFolder = docUri.substr(0, lastIndex); //folder of current doc
        let runLocation = (this.runAtFileLocation == true) ? docFolder : vscode_1.workspace.rootPath; //choose correct location to run
        let svArgs = (doc.languageId == "systemverilog") ? "-g2012" : ""; //SystemVerilog args
        let command = 'iverilog ' + svArgs + ' -t null ' + this.iverilogArgs + ' \"' + doc.fileName + '\"'; //command to execute
        this.logger.log(command, Logger_1.Log_Severity.Command);
        var foo = child.exec(command, { cwd: runLocation }, (error, stdout, stderr) => {
            let diagnostics = [];
            let lines = stderr.split(/\r?\n/g);
            // Parse output lines
            lines.forEach((line, i) => {
                if (line.startsWith(doc.fileName)) {
                    line = line.replace(doc.fileName, '');
                    let terms = line.split(':');
                    console.log(terms[1] + ' ' + terms[2]);
                    let lineNum = parseInt(terms[1].trim()) - 1;
                    if (terms.length == 3)
                        diagnostics.push({
                            severity: vscode_1.DiagnosticSeverity.Error,
                            range: new vscode_1.Range(lineNum, 0, lineNum, Number.MAX_VALUE),
                            message: terms[2].trim(),
                            code: 'iverilog',
                            source: 'iverilog'
                        });
                    else if (terms.length >= 4) {
                        let sev;
                        if (terms[2].trim() == 'error')
                            sev = vscode_1.DiagnosticSeverity.Error;
                        else if (terms[2].trim() == 'warning')
                            sev = vscode_1.DiagnosticSeverity.Warning;
                        else
                            sev = vscode_1.DiagnosticSeverity.Information;
                        diagnostics.push({
                            severity: sev,
                            range: new vscode_1.Range(lineNum, 0, lineNum, Number.MAX_VALUE),
                            message: terms[3].trim(),
                            code: 'iverilog',
                            source: 'iverilog'
                        });
                    }
                }
            });
            this.logger.log(diagnostics.length + ' errors/warnings returned');
            this.diagnostic_collection.set(doc.uri, diagnostics);
        });
    }
}
exports.default = IcarusLinter;
//# sourceMappingURL=IcarusLinter.js.map