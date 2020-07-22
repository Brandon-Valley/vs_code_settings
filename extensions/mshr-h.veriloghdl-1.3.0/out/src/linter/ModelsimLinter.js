"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const child = require("child_process");
const BaseLinter_1 = require("./BaseLinter");
var isWindows = process.platform === "win32";
class ModelsimLinter extends BaseLinter_1.default {
    constructor(logger) {
        super("modelsim", logger);
        vscode_1.workspace.onDidChangeConfiguration(() => {
            this.getConfig();
        });
        this.getConfig();
    }
    getConfig() {
        //get custom arguments
        this.modelsimArgs = vscode_1.workspace.getConfiguration().get('verilog.linting.modelsim.arguments');
        this.modelsimWork = vscode_1.workspace.getConfiguration().get('verilog.linting.modelsim.work');
        this.runAtFileLocation = vscode_1.workspace.getConfiguration().get('verilog.linting.modelsim.runAtFileLocation');
    }
    lint(doc) {
        this.logger.log('modelsim lint requested');
        let docUri = doc.uri.fsPath; //path of current doc
        let lastIndex = (isWindows == true) ? docUri.lastIndexOf("\\") : docUri.lastIndexOf("/");
        let docFolder = docUri.substr(0, lastIndex); //folder of current doc
        let runLocation = (this.runAtFileLocation == true) ? docFolder : vscode_1.workspace.rootPath; //choose correct location to run
        // no change needed for systemverilog
        let command = 'vlog -nologo -work ' + this.modelsimWork + ' \"' + doc.fileName + '\" ' + this.modelsimArgs; //command to execute
        var process = child.exec(command, { cwd: runLocation }, (error, stdout, stderr) => {
            let diagnostics = [];
            let lines = stdout.split(/\r?\n/g);
            // ^\*\* (((Error)|(Warning))( \(suppressible\))?: )(\([a-z]+-[0-9]+\) )?([^\(]*\(([0-9]+)\): )(\([a-z]+-[0-9]+\) )?((((near|Unknown identifier|Undefined variable):? )?["']([\w:;\.]+)["'][ :.]*)?.*)
            // From https://github.com/dave2pi/SublimeLinter-contrib-vlog/blob/master/linter.py
            let regexExp = "^\\*\\* (((Error)|(Warning))( \\(suppressible\\))?: )(\\([a-z]+-[0-9]+\\) )?([^\\(]*)\\(([0-9]+)\\): (\\([a-z]+-[0-9]+\\) )?((((near|Unknown identifier|Undefined variable):? )?[\"\']([\\w:;\\.]+)[\"\'][ :.]*)?.*)";
            // Parse output lines
            lines.forEach((line, i) => {
                let sev;
                if (line.startsWith('**')) {
                    let m = line.match(regexExp);
                    try {
                        if (m[7] != doc.fileName)
                            return;
                        switch (m[2]) {
                            case "Error":
                                sev = vscode_1.DiagnosticSeverity.Error;
                                break;
                            case "Warning":
                                sev = vscode_1.DiagnosticSeverity.Warning;
                                break;
                            default:
                                sev = vscode_1.DiagnosticSeverity.Information;
                                break;
                        }
                        let lineNum = parseInt(m[8]) - 1;
                        let msg = m[10];
                        diagnostics.push({
                            severity: sev,
                            range: new vscode_1.Range(lineNum, 0, lineNum, Number.MAX_VALUE),
                            message: msg,
                            code: 'modelsim',
                            source: 'modelsim'
                        });
                    }
                    catch (e) {
                        diagnostics.push({
                            severity: sev,
                            range: new vscode_1.Range(0, 0, 0, Number.MAX_VALUE),
                            message: line,
                            code: 'modelsim',
                            source: 'modelsim'
                        });
                    }
                }
            });
            this.logger.log(diagnostics.length + ' errors/warnings returned');
            this.diagnostic_collection.set(doc.uri, diagnostics);
        });
    }
}
exports.default = ModelsimLinter;
//# sourceMappingURL=ModelsimLinter.js.map