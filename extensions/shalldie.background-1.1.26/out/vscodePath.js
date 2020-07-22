"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const vscode_1 = __importDefault(require("vscode"));
// 基础目录
const base = path_1.default.dirname(require.main.filename);
// css文件路径
const cssName = parseFloat(vscode_1.default.version) >= 1.38 ? 'workbench.desktop.main.css' : 'workbench.main.css';
const cssPath = path_1.default.join(base, 'vs', 'workbench', cssName);
// electron 入口文件所在文件夹
const indexDir = path_1.default.join(base, 'vs', 'workbench', 'electron-browser', 'bootstrap');
exports.default = {
    /**
     * 基础目录
     */
    base,
    /**
     * css文件路径
     */
    cssPath,
    /**
     * electron 入口文件所在文件夹
     */
    indexDir
};
//# sourceMappingURL=vscodePath.js.map