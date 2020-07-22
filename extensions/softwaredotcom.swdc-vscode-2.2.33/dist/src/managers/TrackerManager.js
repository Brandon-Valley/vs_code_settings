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
exports.TrackerManager = void 0;
const swdc_tracker_1 = require("swdc-tracker");
const Constants_1 = require("../Constants");
const Util_1 = require("../Util");
const KpmRepoManager_1 = require("../repo/KpmRepoManager");
const moment = require("moment-timezone");
class TrackerManager {
    constructor() {
        this.trackerReady = false;
        this.pluginParams = this.getPluginParams();
        this.tzOffsetParams = this.getTzOffsetParams();
        this.jwtParams = this.getJwtParams();
    }
    static getInstance() {
        if (!TrackerManager.instance) {
            TrackerManager.instance = new TrackerManager();
        }
        return TrackerManager.instance;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            // initialize tracker with swdc api host, namespace, and appId
            const result = yield swdc_tracker_1.default.initialize(Constants_1.api_endpoint, "CodeTime", this.pluginParams.plugin_name);
            if (result.status === 200) {
                this.trackerReady = true;
            }
        });
    }
    resetJwt() {
        this.jwtParams = this.getJwtParams();
    }
    trackUIInteraction(item) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.trackerReady) {
                return;
            }
            const ui_interaction = {
                interaction_type: item.interactionType,
            };
            const ui_element = {
                element_name: item.name,
                element_location: item.location,
                color: item.color ? item.color : null,
                icon_name: item.interactionIcon ? item.interactionIcon : null,
                cta_text: !item.hideCTAInTracker ? item.label || item.description || item.tooltip : "redacted"
            };
            const ui_event = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, ui_interaction), ui_element), this.pluginParams), this.jwtParams), this.tzOffsetParams);
            swdc_tracker_1.default.trackUIInteraction(ui_event);
        });
    }
    trackEditorAction(entity, type, event) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.trackerReady) {
                return;
            }
            const projectParams = this.getProjectParams();
            const repoParams = yield this.getRepoParams(projectParams.project_directory);
            const editor_event = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ entity,
                type }, this.pluginParams), this.jwtParams), this.tzOffsetParams), projectParams), this.getFileParams(event, projectParams.project_directory)), repoParams);
            // send the event
            swdc_tracker_1.default.trackEditorAction(editor_event);
        });
    }
    // Static attributes
    getJwtParams() {
        var _a;
        return { jwt: (_a = Util_1.getItem("jwt")) === null || _a === void 0 ? void 0 : _a.split("JWT ")[1] };
    }
    getPluginParams() {
        return {
            plugin_id: Util_1.getPluginId(),
            plugin_name: Util_1.getPluginName(),
            plugin_version: Util_1.getVersion()
        };
    }
    getTzOffsetParams() {
        return { tz_offset_minutes: moment.parseZone(moment().local()).utcOffset() };
    }
    // Dynamic attributes
    getProjectParams() {
        const workspaceFolders = Util_1.getWorkspaceFolders();
        const project_directory = (workspaceFolders.length) ? workspaceFolders[0].uri.fsPath : "";
        const project_name = (workspaceFolders.length) ? workspaceFolders[0].name : "";
        return { project_directory, project_name };
    }
    getRepoParams(projectRootPath) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        return __awaiter(this, void 0, void 0, function* () {
            const resourceInfo = yield KpmRepoManager_1.getResourceInfo(projectRootPath);
            let ownerId = "";
            if (resourceInfo.identifier.includes(":")) {
                ownerId = (_c = (_b = (_a = resourceInfo.identifier.split("/")) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.split(":")) === null || _c === void 0 ? void 0 : _c[1];
            }
            else {
                ownerId = (_e = (_d = resourceInfo.identifier.split("/")) === null || _d === void 0 ? void 0 : _d.slice(-2)) === null || _e === void 0 ? void 0 : _e[0];
            }
            return {
                repo_identifier: resourceInfo.identifier,
                repo_name: (_k = (_j = (_h = (_g = (_f = resourceInfo.identifier) === null || _f === void 0 ? void 0 : _f.split("/")) === null || _g === void 0 ? void 0 : _g.slice(-1)) === null || _h === void 0 ? void 0 : _h[0]) === null || _j === void 0 ? void 0 : _j.split(".git")) === null || _k === void 0 ? void 0 : _k[0],
                git_branch: resourceInfo.branch,
                git_tag: resourceInfo.tag,
                owner_id: ownerId
            };
        });
    }
    getFileParams(event, projectRootPath) {
        var _a, _b, _c, _d, _e, _f, _g;
        if (!event)
            return {};
        // File Open and Close have document attributes on the event.
        // File Change has it on a `document` attribute
        const textDoc = event.document || event;
        return {
            file_name: (_b = (_a = textDoc.fileName) === null || _a === void 0 ? void 0 : _a.split(projectRootPath)) === null || _b === void 0 ? void 0 : _b[1],
            file_path: (_c = textDoc.uri) === null || _c === void 0 ? void 0 : _c.path,
            syntax: textDoc.languageId || ((_f = (_e = (_d = textDoc.fileName) === null || _d === void 0 ? void 0 : _d.split(".")) === null || _e === void 0 ? void 0 : _e.slice(-1)) === null || _f === void 0 ? void 0 : _f[0]),
            line_count: textDoc.lineCount || 0,
            character_count: ((_g = textDoc.getText()) === null || _g === void 0 ? void 0 : _g.length) || 0
        };
    }
}
exports.TrackerManager = TrackerManager;
//# sourceMappingURL=TrackerManager.js.map