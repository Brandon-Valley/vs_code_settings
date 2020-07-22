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
const vscode_1 = require("vscode");
const IcarusLinter_1 = require("./IcarusLinter");
const VerilatorLinter_1 = require("./VerilatorLinter");
const XvlogLinter_1 = require("./XvlogLinter");
const ModelsimLinter_1 = require("./ModelsimLinter");
class LintManager {
    constructor(logger) {
        this.logger = logger;
        vscode_1.workspace.onDidOpenTextDocument(this.lint, this, this.subscriptions);
        vscode_1.workspace.onDidSaveTextDocument(this.lint, this, this.subscriptions);
        vscode_1.workspace.onDidCloseTextDocument(this.removeFileDiagnostics, this, this.subscriptions);
        vscode_1.workspace.onDidChangeConfiguration(this.configLinter, this, this.subscriptions);
        this.configLinter();
    }
    configLinter() {
        let linter_name;
        linter_name = vscode_1.workspace.getConfiguration("verilog.linting").get("linter");
        if (this.linter == null || this.linter.name != linter_name) {
            switch (linter_name) {
                case "iverilog":
                    this.linter = new IcarusLinter_1.default(this.logger);
                    break;
                case "xvlog":
                    this.linter = new XvlogLinter_1.default(this.logger);
                    break;
                case "modelsim":
                    this.linter = new ModelsimLinter_1.default(this.logger);
                    break;
                case "verilator":
                    this.linter = new VerilatorLinter_1.default(this.logger);
                    break;
                default:
                    console.log("Invalid linter name.");
                    this.linter = null;
                    break;
            }
        }
        if (this.linter != null) {
            console.log("Using linter " + this.linter.name);
        }
    }
    lint(doc) {
        // Check for language id
        let lang = doc.languageId;
        if (this.linter != null && (lang === "verilog" || lang === "systemverilog"))
            this.linter.startLint(doc);
    }
    removeFileDiagnostics(doc) {
        if (this.linter != null)
            this.linter.removeFileDiagnostics(doc);
    }
    RunLintTool() {
        return __awaiter(this, void 0, void 0, function* () {
            // Check for language id
            let lang = vscode_1.window.activeTextEditor.document.languageId;
            if (vscode_1.window.activeTextEditor === undefined || (lang !== "verilog" && lang !== "systemverilog"))
                vscode_1.window.showErrorMessage("Verilog-HDL/SystemVerilog: No document opened");
            // else if(window.activeTextEditor.document.languageId !== "verilog")
            // window.showErrorMessage("Verilog-HDL/SystemVerilog: No Verilog document opened");
            else {
                // Show the available linters
                let linterStr = yield vscode_1.window.showQuickPick([
                    {
                        label: "iverilog",
                        description: "Icarus Verilog",
                    },
                    {
                        label: "xvlog",
                        description: "Vivado Logical Simulator"
                    },
                    {
                        label: "modelsim",
                        description: "Modelsim"
                    },
                    {
                        label: "verilator",
                        description: "Verilator"
                    }
                ], {
                    matchOnDescription: true,
                    placeHolder: "Choose a linter to run",
                });
                if (linterStr === undefined)
                    return;
                // Create and run the linter with progress bar
                let tempLinter;
                switch (linterStr.label) {
                    case "iverilog":
                        tempLinter = new IcarusLinter_1.default(this.logger);
                        break;
                    case "xvlog":
                        tempLinter = new XvlogLinter_1.default(this.logger);
                        break;
                    case "modelsim":
                        tempLinter = new ModelsimLinter_1.default(this.logger);
                        break;
                    case "verilator":
                        tempLinter = new VerilatorLinter_1.default(this.logger);
                        break;
                    default:
                        return;
                }
                yield vscode_1.window.withProgress({
                    location: vscode_1.ProgressLocation.Notification,
                    title: "Verilog-HDL/SystemVerilog: Running lint tool..."
                }, (progress, token) => __awaiter(this, void 0, void 0, function* () {
                    tempLinter.removeFileDiagnostics(vscode_1.window.activeTextEditor.document);
                    tempLinter.startLint(vscode_1.window.activeTextEditor.document);
                }));
            }
        });
    }
}
exports.default = LintManager;
//# sourceMappingURL=LintManager.js.map