'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const utils_1 = require("./utils");
const uuid = require("uuid");
function range(rangeMethod) {
    const editor = vscode.window.activeTextEditor;
    editor.edit(editBuilder => {
        let cursors = utils_1.getCursors(editBuilder);
        let itemsToInsert;
        if (typeof rangeMethod === 'function') {
            itemsToInsert = rangeMethod(cursors.length);
        }
        else {
            itemsToInsert = rangeMethod;
        }
        cursors.forEach((selection, index) => {
            let range = new vscode.Position(selection.start.line, selection.start.character);
            editBuilder.insert(range, itemsToInsert[index]);
            editBuilder.delete(selection);
        });
    });
}
exports.range = range;
function promptRange(prompt = 'Where should the range start?') {
    return new Promise((resolve, reject) => {
        return vscode.window.showInputBox({ prompt }).then(result => {
            if (result == null) {
                // User cancelled
                reject();
            }
            let num = +result;
            if (isNaN(num)) {
                resolve(promptRange(`"${result}" is an invalid number. Enter a number.`));
            }
            resolve(num);
        });
    });
}
exports.promptRange = promptRange;
;
function range_generic(start) {
    return function (count) {
        let a = [];
        let end = count + start;
        for (let i = start; i < end; ++i) {
            a.push(String(i));
        }
        return a;
    };
}
exports.range_generic = range_generic;
function range_0toX(count) {
    return range_generic(0)(count);
}
exports.range_0toX = range_0toX;
function range_1toX(count) {
    return range_generic(1)(count);
}
exports.range_1toX = range_1toX;
function range_AtoX(count) {
    let a = [];
    let startCode = 'a'.charCodeAt(0);
    for (let i = 0; i < count; ++i) {
        const offset = i % 26; // only loop through lower case a-z
        a.push(String.fromCharCode(startCode + offset));
    }
    return a;
}
exports.range_AtoX = range_AtoX;
function range_uuid(count) {
    let a = [];
    for (let i = 0; i < count; ++i) {
        a.push(uuid.v4().toLowerCase());
    }
    return a;
}
exports.range_uuid = range_uuid;
//# sourceMappingURL=rangeMethods.js.map