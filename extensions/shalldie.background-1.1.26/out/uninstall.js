"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const background_1 = __importDefault(require("./background"));
const vsHelp_1 = __importDefault(require("./vsHelp"));
if (background_1.default.hasInstalled) {
    background_1.default.uninstall();
    vsHelp_1.default.showInfoRestart('Background has been uninstalled! Please restart.');
}
//# sourceMappingURL=uninstall.js.map