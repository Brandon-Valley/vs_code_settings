"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const minFontSize = 1;
const maxFontSize = Number.MAX_SAFE_INTEGER;
function activate(context) {
    function increaseFontSize(terminal) {
        return __awaiter(this, void 0, void 0, function* () {
            const config = vscode_1.workspace.getConfiguration();
            const fontSizeType = terminal
                ? "terminal.integrated.fontSize"
                : "editor.fontSize";
            const lineHeightProperty = "editor.lineHeight";
            const lineHeight = config.get(lineHeightProperty);
            const fontSize = config.get(fontSizeType);
            const relativeLineHeight = lineHeight / fontSize;
            const step = config.get("fontshortcuts.step");
            const newSize = Math.min(maxFontSize, Math.round(fontSize + step));
            const newLineHeight = Math.min(maxFontSize, Math.round(newSize * relativeLineHeight));
            if (newSize === fontSize)
                return;
            if (!terminal)
                config.update(lineHeightProperty, newLineHeight, true);
            return config.update(fontSizeType, newSize, true);
        });
    }
    function decreaseFontSize(terminal) {
        return __awaiter(this, void 0, void 0, function* () {
            const config = vscode_1.workspace.getConfiguration();
            const fontSizeType = terminal
                ? "terminal.integrated.fontSize"
                : "editor.fontSize";
            const lineHeightProperty = "editor.lineHeight";
            const lineHeight = config.get(lineHeightProperty);
            const fontSize = config.get(fontSizeType);
            const relativeLineHeight = lineHeight / fontSize;
            const step = config.get("fontshortcuts.step");
            const newSize = Math.max(minFontSize, Math.round(fontSize - step));
            const newLineHeight = Math.min(maxFontSize, Math.round(newSize * relativeLineHeight));
            if (newSize === fontSize)
                return;
            if (!terminal)
                config.update(lineHeightProperty, newLineHeight, true);
            return config.update(fontSizeType, newSize, true);
        });
    }
    function resetFontSize(terminal) {
        return __awaiter(this, void 0, void 0, function* () {
            const config = vscode_1.workspace.getConfiguration();
            const fontSizeType = terminal
                ? "terminal.integrated.fontSize"
                : "editor.fontSize";
            const defaultFontSizeType = terminal
                ? "fontshortcuts.defaultFontSize"
                : "fontshortcuts.defaultTerminalFontSize";
            const lineHeightProperty = "editor.lineHeight";
            const lineHeight = config.get(lineHeightProperty);
            const defaultFontSize = config.get(defaultFontSizeType);
            const fontSize = config.get(fontSizeType);
            const relativeLineHeight = lineHeight / fontSize;
            const defaultLineHeight = Math.min(maxFontSize, Math.round(defaultFontSize * relativeLineHeight));
            if (defaultFontSize === null) {
                try {
                    if (!terminal)
                        yield config.update(lineHeightProperty, undefined, true);
                    return yield config.update(fontSizeType, undefined, true);
                }
                catch (e) {
                    // swallow errors
                    return;
                }
            }
            if (Number.isSafeInteger(defaultFontSize) &&
                defaultFontSize >= minFontSize &&
                defaultFontSize <= maxFontSize) {
                if (!terminal)
                    config.update(lineHeightProperty, defaultLineHeight, true);
                return config.update(fontSizeType, defaultFontSize, true);
            }
            vscode_1.window.showErrorMessage(`Cannot set font size to "${defaultFontSize}". Please set "${defaultFontSizeType}" to an integer between ${minFontSize} and ${maxFontSize} in your user settings.`);
        });
    }
    context.subscriptions.push(vscode_1.commands.registerCommand("fontshortcuts.increaseEditorFontSize", () => increaseFontSize(false)), vscode_1.commands.registerCommand("fontshortcuts.increaseTerminalFontSize", () => increaseFontSize(true)), vscode_1.commands.registerCommand("fontshortcuts.increaseFontSize", () => Promise.all([increaseFontSize(false), increaseFontSize(true)])), vscode_1.commands.registerCommand("fontshortcuts.decreaseEditorFontSize", () => decreaseFontSize(false)), vscode_1.commands.registerCommand("fontshortcuts.decreaseTerminalFontSize", () => decreaseFontSize(true)), vscode_1.commands.registerCommand("fontshortcuts.decreaseFontSize", () => Promise.all([decreaseFontSize(false), decreaseFontSize(true)])), vscode_1.commands.registerCommand("fontshortcuts.resetEditorFontSize", () => resetFontSize(false)), vscode_1.commands.registerCommand("fontshortcuts.resetTerminalFontSize", () => resetFontSize(true)), vscode_1.commands.registerCommand("fontshortcuts.resetFontSize", () => Promise.all([resetFontSize(false), resetFontSize(true)])));
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map