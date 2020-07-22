'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var vscode = require("vscode");
var VHDLFormatter = require("./VHDLFormatter/VHDLFormatter");
exports.CONFIGURATION_KEY = "vhdl.formatter";
exports.CONFIGURATION_REMOVE_COMMENTS = "removeComments"; // Boolean
exports.CONFIGURATION_REMOVE_REPORTS = "removeReports"; // Boolean
exports.CONFIGURATION_CHECK_ALIAS = "replaceByAliases"; // Boolean
exports.CONFIGURATION_ALIGN_ALL_SIGN = "align.all"; // Boolean
exports.CONFIGURATION_ALIGN_PORT_SIGN = "align.port"; // Boolean
exports.CONFIGURATION_ALIGN_FUNCTION_SIGN = "align.function"; // Boolean
exports.CONFIGURATION_ALIGN_PROCEDURE_SIGN = "align.procedure"; // Boolean
exports.CONFIGURATION_ALIGN_GENERIC_SIGN = "align.generic"; // Boolean
exports.CONFIGURATION_ALIGN_SIGN_MODE = "align.mode"; // AlignMode
exports.CONFIGURATION_NEWLINE_AFTER_PORT = "newline.port"; // NewLineConfig
exports.CONFIGURATION_NEWLINE_AFTER_THEN = "newline.then"; // NewLineConfig
exports.CONFIGURATION_NEWLINE_AFTER_SEMICOLON = "newline.semicolon"; // NewLineConfig
exports.CONFIGURATION_NEWLINE_AFTER_ELSE = "newline.else"; // NewLineConfig
exports.CONFIGURATION_NEWLINE_AFTER_GENERIC = "newline.generic"; // NewLineConfig
exports.CONFIGURATION_CASE_KEYWORD = "case.keyword"; // CaseType
exports.CONFIGURATION_CASE_TYPENAME = "case.typename"; // CaseType
var AlignMode;
(function (AlignMode) {
    AlignMode[AlignMode["Local"] = 0] = "Local";
    AlignMode[AlignMode["Global"] = 1] = "Global";
})(AlignMode || (AlignMode = {}));
var CaseType;
(function (CaseType) {
    CaseType[CaseType["UpperCase"] = 0] = "UpperCase";
    CaseType[CaseType["LowerCase"] = 1] = "LowerCase";
    CaseType[CaseType["DefaultCase"] = 2] = "DefaultCase";
})(CaseType || (CaseType = {}));
var NewLineConfig;
(function (NewLineConfig) {
    NewLineConfig[NewLineConfig["NewLine"] = 0] = "NewLine";
    NewLineConfig[NewLineConfig["NoNewLine"] = 1] = "NoNewLine";
    NewLineConfig[NewLineConfig["None"] = 2] = "None";
})(NewLineConfig || (NewLineConfig = {}));
function getSettings(section, key, defaultValue) {
    return vscode.workspace.getConfiguration(section, null).get(key, defaultValue);
}
exports.getSettings = getSettings;
function getExtSettings(key, defaultValue) {
    return getSettings(exports.CONFIGURATION_KEY, key, defaultValue);
}
exports.getExtSettings = getExtSettings;
function getEndOfLine() {
    var endOfLine = getSettings("files", "eol", "\n");
    var isValid = endOfLine == "\r\n" || endOfLine == "\n";
    return isValid ? endOfLine : "\n";
}
function getIndentation(options) {
    if (!options.insertSpaces)
        return "\t";
    var tabSize = options.tabSize;
    if (tabSize < 1)
        tabSize = 4;
    return " ".repeat(tabSize);
}
function getConfig(options) {
    if (!options)
        options = { insertSpaces: false, tabSize: 4 };
    var indentation = getIndentation(options);
    var endOfLine = getEndOfLine();
    var removeComments = getExtSettings(exports.CONFIGURATION_REMOVE_COMMENTS, false);
    var removeReports = getExtSettings(exports.CONFIGURATION_REMOVE_REPORTS, false);
    var checkAlias = getExtSettings(exports.CONFIGURATION_CHECK_ALIAS, false);
    var newLineAfterPort = getExtSettings(exports.CONFIGURATION_NEWLINE_AFTER_PORT, NewLineConfig.None);
    var newLineAfterThen = getExtSettings(exports.CONFIGURATION_NEWLINE_AFTER_THEN, NewLineConfig.NewLine);
    var newLineAfterSemicolon = getExtSettings(exports.CONFIGURATION_NEWLINE_AFTER_SEMICOLON, NewLineConfig.NewLine);
    var newLineAfterElse = getExtSettings(exports.CONFIGURATION_NEWLINE_AFTER_ELSE, NewLineConfig.NewLine);
    var newLineAfterGeneric = getExtSettings(exports.CONFIGURATION_NEWLINE_AFTER_GENERIC, NewLineConfig.None);
    var alignAllSign = getExtSettings(exports.CONFIGURATION_ALIGN_ALL_SIGN, false);
    var alignPortSign = getExtSettings(exports.CONFIGURATION_ALIGN_PORT_SIGN, false);
    var alignFunctionSign = getExtSettings(exports.CONFIGURATION_ALIGN_FUNCTION_SIGN, false);
    var alignProcedureSign = getExtSettings(exports.CONFIGURATION_ALIGN_PROCEDURE_SIGN, false);
    var alignGenericSign = getExtSettings(exports.CONFIGURATION_ALIGN_GENERIC_SIGN, false);
    var signAlignMode = getExtSettings(exports.CONFIGURATION_ALIGN_SIGN_MODE, AlignMode.Local).toString().toLowerCase();
    var keywordCase = getExtSettings(exports.CONFIGURATION_CASE_KEYWORD, CaseType.UpperCase).toString().toLowerCase();
    var typenameCase = getExtSettings(exports.CONFIGURATION_CASE_TYPENAME, CaseType.UpperCase).toString().toLowerCase();
    var newLineSettings = new VHDLFormatter.NewLineSettings();
    newLineSettings.push("generic", newLineAfterGeneric.toString());
    newLineSettings.push("generic map", newLineAfterGeneric.toString());
    newLineSettings.push("port", newLineAfterPort.toString());
    newLineSettings.push("port map", newLineAfterPort.toString());
    newLineSettings.push(";", newLineAfterSemicolon.toString());
    newLineSettings.push("then", newLineAfterThen.toString());
    newLineSettings.push("else", newLineAfterElse.toString());
    var signAlignKeywords = [];
    if (alignGenericSign)
        signAlignKeywords.push("GENERIC");
    if (alignPortSign)
        signAlignKeywords.push("PORT");
    if (alignProcedureSign)
        signAlignKeywords.push("PROCEDURE");
    if (alignFunctionSign) {
        signAlignKeywords.push("FUNCTION");
        signAlignKeywords.push("IMPURE FUNCTION");
    }
    var alignSettings = new VHDLFormatter.signAlignSettings(signAlignKeywords.length > 0, alignAllSign, signAlignMode, signAlignKeywords);
    return new VHDLFormatter.BeautifierSettings(removeComments, removeReports, checkAlias, alignSettings, keywordCase, typenameCase, indentation, newLineSettings, endOfLine);
}
exports.getConfig = getConfig;
//# sourceMappingURL=config.js.map