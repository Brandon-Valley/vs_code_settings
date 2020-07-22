"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
exports.deepDecorations = [
    vscode.window.createTextEditorDecorationType({
        color: { id: "rainbowend.deep1" }
    }),
    vscode.window.createTextEditorDecorationType({
        color: { id: "rainbowend.deep2" }
    }),
    vscode.window.createTextEditorDecorationType({
        color: { id: "rainbowend.deep3" }
    })
];
const DEFAULT = 0;
const IGNORE = 1;
const COMPREHENSION = 2;
function parse({ activeEditor, options, tokens }) {
    let decorationDepth = 0;
    let mode = DEFAULT;
    let comprehensionDepthStack = [];
    for (let token of tokens) {
        let { pos, length, type } = token;
        /* Switch parsing modes if any of the mode delimiters has been reached */
        if (type === "OPEN IGNORE") {
            mode = IGNORE;
            continue;
        }
        else if (type === "OPEN COMPREHENSION") {
            mode = COMPREHENSION;
            comprehensionDepthStack.push(1);
            continue;
        }
        else if (type === "CLOSE IGNORE" || type === "CLOSE COMPREHENSION") {
            comprehensionDepthStack.pop();
            if (comprehensionDepthStack.length > 0) {
                continue;
            }
            mode = DEFAULT;
            continue;
        }
        const startPos = activeEditor.document.positionAt(pos);
        const endPos = activeEditor.document.positionAt(pos + length);
        const decoration = {
            range: new vscode.Range(startPos, endPos)
        };
        let result = { decorationDepth, options };
        switch (mode) {
            // case IGNORE:
            /* A new parseInComment function could be implemented to allow for different highlighting
              instead of just ignoring */
            // result = parseInComment({ decoration, decorationDepth, options, token });
            // break;
            case COMPREHENSION:
                result = parseInComprehension({
                    decoration,
                    decorationDepth,
                    options,
                    token
                });
                break;
            case DEFAULT:
                result = parseDefault({ decoration, decorationDepth, options, token });
                break;
            default:
                break;
        }
        decorationDepth = result.decorationDepth;
        options = result.options;
    }
}
exports.parse = parse;
function parseDefault(params) {
    let { decoration, token, decorationDepth, options } = params;
    switch (token.type) {
        case "OPEN BLOCK":
            // If beginning a new block, push new decoration and increment decorationDepth
            options[decorationDepth % exports.deepDecorations.length].push(decoration);
            decorationDepth++;
            break;
        case "CLOSE BLOCK":
            // If closing a block, decrement decorationDepth
            decorationDepth = decorationDepth > 0 ? decorationDepth - 1 : 0;
            options[decorationDepth % exports.deepDecorations.length].push(decoration);
            break;
        default:
            if (decorationDepth > 0) {
                // As default, if the token is in non-zero decorationDepth, it is a continuation token and should keep the same color as the opening token
                options[(decorationDepth - 1) % exports.deepDecorations.length].push(decoration);
            }
            break;
    }
    return { decorationDepth, options };
}
function parseInComprehension(params) {
    /* For simplicity, in comprehensions,
    all open-block and close-block tokens will be highlighted with the same decorationDepth color
    The color is the next down from the previous block
  
    i.e.:
    <color>if</color>
    [
      <other color>for</other color> x <other color>if</other color>
    ]
    */
    let { decoration, token, decorationDepth, options } = params;
    let comprehensionDecorationDepth = decorationDepth + 1;
    if (token.type === "OPEN BLOCK" ||
        token.type === "CLOSE BLOCK" ||
        token.type === "NEUTRAL") {
        options[comprehensionDecorationDepth % exports.deepDecorations.length].push(decoration);
    }
    return { decorationDepth, options };
}
//# sourceMappingURL=parser.js.map