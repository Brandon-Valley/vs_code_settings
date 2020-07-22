"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CtagsManager = exports.Ctags = exports.Symbol = void 0;
const vscode_1 = require("vscode");
const child = require("child_process");
const Logger_1 = require("./Logger");
// Internal representation of a symbol
class Symbol {
    constructor(name, type, pattern, startLine, parentScope, parentType, endLine, isValid) {
        this.name = name;
        this.type = type;
        this.pattern = pattern;
        this.startPosition = new vscode_1.Position(startLine, 0);
        this.parentScope = parentScope;
        this.parentType = parentType;
        this.isValid = isValid;
        this.endPosition = new vscode_1.Position(endLine, Number.MAX_VALUE);
    }
    setEndPosition(endLine) {
        this.endPosition = new vscode_1.Position(endLine, Number.MAX_VALUE);
        this.isValid = true;
    }
    getDocumentSymbol() {
        let range = new vscode_1.Range(this.startPosition, this.endPosition);
        return new vscode_1.DocumentSymbol(this.name, this.type, Symbol.getSymbolKind(this.type), range, range);
    }
    static isContainer(type) {
        switch (type) {
            case 'constant':
            case 'event':
            case 'net':
            case 'port':
            case 'register':
            case 'modport':
            case 'prototype':
            case 'typedef':
            case 'property':
            case 'assert':
                return false;
            case 'function':
            case 'module':
            case 'task':
            case 'block':
            case 'class':
            case 'covergroup':
            case 'enum':
            case 'interface':
            case 'package':
            case 'program':
            case 'struct':
                return true;
        }
    }
    // types used by ctags
    // taken from https://github.com/universal-ctags/ctags/blob/master/parsers/verilog.c
    static getSymbolKind(name) {
        switch (name) {
            case 'constant': return vscode_1.SymbolKind.Constant;
            case 'event': return vscode_1.SymbolKind.Event;
            case 'function': return vscode_1.SymbolKind.Function;
            case 'module': return vscode_1.SymbolKind.Module;
            case 'net': return vscode_1.SymbolKind.Variable;
            // Boolean uses a double headed arrow as symbol (kinda looks like a port)
            case 'port': return vscode_1.SymbolKind.Boolean;
            case 'register': return vscode_1.SymbolKind.Variable;
            case 'task': return vscode_1.SymbolKind.Function;
            case 'block': return vscode_1.SymbolKind.Module;
            case 'assert': return vscode_1.SymbolKind.Variable; // No idea what to use
            case 'class': return vscode_1.SymbolKind.Class;
            case 'covergroup': return vscode_1.SymbolKind.Class; // No idea what to use
            case 'enum': return vscode_1.SymbolKind.Enum;
            case 'interface': return vscode_1.SymbolKind.Interface;
            case 'modport': return vscode_1.SymbolKind.Boolean; // same as ports
            case 'package': return vscode_1.SymbolKind.Package;
            case 'program': return vscode_1.SymbolKind.Module;
            case 'prototype': return vscode_1.SymbolKind.Function;
            case 'property': return vscode_1.SymbolKind.Property;
            case 'struct': return vscode_1.SymbolKind.Struct;
            case 'typedef': return vscode_1.SymbolKind.TypeParameter;
            default: return vscode_1.SymbolKind.Variable;
        }
    }
}
exports.Symbol = Symbol;
// TODO: add a user setting to enable/disable all ctags based operations
class Ctags {
    constructor(logger) {
        this.symbols = [];
        this.isDirty = true;
        this.logger = logger;
    }
    setDocument(doc) {
        this.doc = doc;
        this.clearSymbols();
    }
    clearSymbols() {
        this.isDirty = true;
        this.symbols = [];
    }
    getSymbolsList() {
        return this.symbols;
    }
    execCtags(filepath) {
        console.log("executing ctags");
        let ctags = vscode_1.workspace.getConfiguration().get('verilog.ctags.path');
        let command = ctags + ' -f - --fields=+K --sort=no --excmd=n "' + filepath + '"';
        console.log(command);
        this.logger.log(command, Logger_1.Log_Severity.Command);
        return new Promise((resolve, reject) => {
            child.exec(command, (error, stdout, stderr) => {
                resolve(stdout);
            });
        });
    }
    parseTagLine(line) {
        try {
            let name, type, pattern, lineNoStr, parentScope, parentType;
            let scope;
            let lineNo;
            let parts = line.split('\t');
            name = parts[0];
            // pattern = parts[2];
            type = parts[3];
            if (parts.length == 5) {
                scope = parts[4].split(':');
                parentType = scope[0];
                parentScope = scope[1];
            }
            else {
                parentScope = '';
                parentType = '';
            }
            lineNoStr = parts[2];
            lineNo = Number(lineNoStr.slice(0, -2)) - 1;
            return new Symbol(name, type, pattern, lineNo, parentScope, parentType, lineNo, false);
        }
        catch (e) {
            console.log(e);
            this.logger.log('Ctags Line Parser: ' + e, Logger_1.Log_Severity.Error);
            this.logger.log('Line: ' + line, Logger_1.Log_Severity.Error);
        }
    }
    buildSymbolsList(tags) {
        try {
            console.log("building symbols");
            if (tags === '') {
                console.log("No output from ctags");
                return;
            }
            // Parse ctags output
            let lines = tags.split(/\r?\n/);
            lines.forEach(line => {
                if (line !== '')
                    this.symbols.push(this.parseTagLine(line));
            });
            // end tags are not supported yet in ctags. So, using regex
            let match;
            let endPosition;
            let text = this.doc.getText();
            let eRegex = /^(?![\r\n])\s*end(\w*)*[\s:]?/gm;
            while (match = eRegex.exec(text)) {
                if (match && typeof match[1] !== 'undefined') {
                    endPosition = this.doc.positionAt(match.index + match[0].length - 1);
                    // get the starting symbols of the same type
                    // doesn't check for begin...end blocks
                    let s = this.symbols.filter(i => i.type === match[1] && i.startPosition.isBefore(endPosition) && !i.isValid);
                    if (s.length > 0) {
                        // get the symbol nearest to the end tag
                        let max = s[0];
                        for (let i = 0; i < s.length; i++) {
                            max = s[i].startPosition.isAfter(max.startPosition) ? s[i] : max;
                        }
                        for (let i of this.symbols) {
                            if (i.name === max.name && i.startPosition.isEqual(max.startPosition) && i.type === max.type) {
                                i.setEndPosition(endPosition.line);
                                break;
                            }
                        }
                    }
                }
            }
            console.log(this.symbols);
            this.isDirty = false;
            return Promise.resolve();
        }
        catch (e) {
            console.log(e);
        }
    }
    index() {
        console.log("indexing...");
        return new Promise((resolve, reject) => {
            this.execCtags(this.doc.uri.fsPath)
                .then(output => this.buildSymbolsList(output))
                .then(() => resolve());
        });
    }
}
exports.Ctags = Ctags;
class CtagsManager {
    constructor(logger) {
        this.logger = logger;
        CtagsManager.ctags = new Ctags(logger);
    }
    configure() {
        console.log("ctags manager configure");
        vscode_1.workspace.onDidSaveTextDocument(this.onSave.bind(this));
        vscode_1.window.onDidChangeActiveTextEditor(this.onDidChangeActiveTextEditor.bind(this));
    }
    onSave(doc) {
        console.log("on save");
        CtagsManager.ctags.clearSymbols();
        // Should automatically refresh the Document symbols show, but doesn't seem to be working
        vscode_1.commands.executeCommand('vscode.executeDocumentSymbolProvider', doc.uri);
    }
    onDidChangeActiveTextEditor(editor) {
        if (!this.isOutputPanel(editor.document.uri)) {
            console.log("on open");
            CtagsManager.ctags.setDocument(editor.document);
        }
    }
    isOutputPanel(uri) {
        return uri.toString().startsWith('output:extension-output-');
    }
}
exports.CtagsManager = CtagsManager;
//# sourceMappingURL=ctags.js.map