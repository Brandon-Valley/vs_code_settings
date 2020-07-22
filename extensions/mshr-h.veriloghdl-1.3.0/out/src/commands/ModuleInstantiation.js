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
exports.instantiateModuleInteract = void 0;
const fs = require("fs");
const path = require("path");
const ctags_1 = require("../ctags");
const vscode_1 = require("vscode");
const Logger_1 = require("../Logger");
function instantiateModuleInteract() {
    let filePath = path.dirname(vscode_1.window.activeTextEditor.document.fileName);
    selectFile(filePath).then(srcpath => {
        instantiateModule(srcpath)
            .then(inst => {
            vscode_1.window.activeTextEditor.insertSnippet(inst);
        });
    });
}
exports.instantiateModuleInteract = instantiateModuleInteract;
function instantiateModule(srcpath) {
    return new Promise((resolve, reject) => {
        // Using Ctags to get all the modules in the file
        let moduleName = "";
        let portsName = [];
        let parametersName = [];
        let logger = new Logger_1.Logger;
        let ctags = new moduleTags(logger);
        console.log("Executing ctags for module instantiation");
        ctags.execCtags(srcpath)
            .then(output => {
            ctags.buildSymbolsList(output);
        }).then(() => __awaiter(this, void 0, void 0, function* () {
            let module;
            let modules = ctags.symbols.filter(tag => tag.type === "module");
            // No modules found
            if (modules.length <= 0) {
                vscode_1.window.showErrorMessage("Verilog-HDL/SystemVerilog: No modules found in the file");
                return;
            }
            // Only one module found
            else if (modules.length == 1)
                module = modules[0];
            // many modules found
            else if (modules.length > 1) {
                moduleName = yield vscode_1.window.showQuickPick(ctags.symbols.filter(tag => tag.type === "module")
                    .map(tag => tag.name), {
                    placeHolder: "Choose a module to instantiate"
                });
                if (moduleName === undefined)
                    return;
                module = modules.filter(tag => tag.name === moduleName)[0];
            }
            let scope = (module.parentScope != "") ? module.parentScope + "." + module.name : module.name;
            let ports = ctags.symbols.filter(tag => tag.type === "port" &&
                tag.parentType === "module" &&
                tag.parentScope === scope);
            portsName = ports.map(tag => tag.name);
            let params = ctags.symbols.filter(tag => tag.type === "constant" &&
                tag.parentType === "module" &&
                tag.parentScope === scope);
            parametersName = params.map(tag => tag.name);
            console.log(module);
            let paramString = ``;
            if (parametersName.length > 0) {
                paramString = `\n#(\n${instantiatePort(parametersName)})\n`;
            }
            console.log(portsName);
            resolve(new vscode_1.SnippetString()
                .appendText(module.name + " ")
                .appendText(paramString)
                .appendPlaceholder("u_")
                .appendPlaceholder(`${module.name}(\n`)
                .appendText(instantiatePort(portsName))
                .appendText(');\n'));
        }));
    });
}
function instantiatePort(ports) {
    let port = '';
    let max_len = 0;
    for (let i = 0; i < ports.length; i++) {
        if (ports[i].length > max_len)
            max_len = ports[i].length;
    }
    // .NAME(NAME)
    for (let i = 0; i < ports.length; i++) {
        let element = ports[i];
        let padding = max_len - element.length + 1;
        element = element + ' '.repeat(padding);
        port += `\t.${element}(${element})`;
        if (i !== ports.length - 1) {
            port += ',';
        }
        port += '\n';
    }
    return port;
}
function selectFile(currentDir) {
    currentDir = currentDir || vscode_1.workspace.rootPath;
    let dirs = getDirectories(currentDir);
    // if is subdirectory, add '../'
    if (currentDir !== vscode_1.workspace.rootPath) {
        dirs.unshift('..');
    }
    // all files ends with '.sv'
    let files = getFiles(currentDir)
        .filter(file => file.endsWith('.v') || file.endsWith('.sv'));
    // available quick pick items
    // Indicate folders in the Quick pick
    let items = [];
    dirs.forEach(dir => {
        items.push({
            label: dir,
            description: "folder"
        });
    });
    files.forEach(file => {
        items.push({
            label: file
        });
    });
    return vscode_1.window.showQuickPick(items, {
        placeHolder: "Choose the module file"
    })
        .then(selected => {
        if (!selected) {
            return;
        }
        // if is a directory
        let location = path.join(currentDir, selected.label);
        if (fs.statSync(location).isDirectory()) {
            return selectFile(location);
        }
        // return file path
        return location;
    });
}
function getDirectories(srcpath) {
    return fs.readdirSync(srcpath)
        .filter(file => fs.statSync(path.join(srcpath, file)).isDirectory());
}
function getFiles(srcpath) {
    return fs.readdirSync(srcpath)
        .filter(file => fs.statSync(path.join(srcpath, file)).isFile());
}
class moduleTags extends ctags_1.Ctags {
    buildSymbolsList(tags) {
        console.log("building symbols");
        if (tags === '') {
            console.log("No output from ctags");
            return;
        }
        // Parse ctags output
        let lines = tags.split(/\r?\n/);
        lines.forEach(line => {
            if (line !== '') {
                let tag = this.parseTagLine(line);
                // add only modules and ports
                if (tag.type === "module" || tag.type === "port" || tag.type === "constant")
                    this.symbols.push(tag);
            }
        });
        // skip finding end tags
        console.log(this.symbols);
    }
}
//# sourceMappingURL=ModuleInstantiation.js.map