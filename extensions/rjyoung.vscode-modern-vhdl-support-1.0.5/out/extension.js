"use strict";
// Copyright (c) 2019 Rich J. Young
Object.defineProperty(exports, "__esModule", { value: true });
const completions_1 = require("./completions");
const formatters_1 = require("./formatters");
function activate(context) {
    context.subscriptions.push(completions_1.VhdlAttributeCompletionItemProvider);
    context.subscriptions.push(completions_1.VhdlLibraryCompletionItemProvider);
    context.subscriptions.push(completions_1.VhdlStdPackageCompletionItemProvider);
    context.subscriptions.push(formatters_1.VhdlStutterModeFormattingEditProvider);
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map