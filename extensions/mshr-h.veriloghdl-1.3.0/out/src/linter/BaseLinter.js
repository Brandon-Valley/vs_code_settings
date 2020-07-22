"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
class BaseLinter {
    constructor(name, logger) {
        this.diagnostic_collection = vscode_1.languages.createDiagnosticCollection();
        this.name = name;
        this.logger = logger;
    }
    startLint(doc) {
        this.lint(doc);
    }
    removeFileDiagnostics(doc) {
        this.diagnostic_collection.delete(doc.uri);
    }
}
exports.default = BaseLinter;
//# sourceMappingURL=BaseLinter.js.map