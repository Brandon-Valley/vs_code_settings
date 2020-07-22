"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
/**
 * Prvoide configuration which affects the execution behaviour of hungry delete and smart backspace, not the "when" condition
 *
 * 1. Provide a TypeSafe config object, meanwhile caches the configuration
 * 2. Stub the config without actually reading the vscode workspace config (For testing purpose)
 *
 */
class ConfigurationProvider {
    constructor(config) {
        /**
         * Set the configuration of internal config object
         *
         * @memberof ConfigurationProvider
         */
        this.setConfiguration = (config) => {
            this.config = config;
        };
        this._mapIndentionRules = (json) => {
            let increaseIndentPattern, decreaseIndentPattern;
            if (json) {
                if (json.increaseIndentPattern) {
                    increaseIndentPattern = new RegExp(json.increaseIndentPattern);
                }
                if (json.decreaseIndentPattern) {
                    decreaseIndentPattern = new RegExp(json.decreaseIndentPattern);
                }
                return {
                    increaseIndentPattern: increaseIndentPattern,
                    decreaseIndentPattern: decreaseIndentPattern
                };
            }
            return undefined;
        };
        this._mapLanguageConfig = (json) => {
            const languageId = json.languageId;
            const indentationRules = this._mapIndentionRules(json.indentationRules);
            return {
                languageId: languageId,
                indentationRules: indentationRules
            };
        };
        this._getLanguageConfigurations = () => {
            const jsonArray = vscode_1.workspace.getConfiguration().get('hungryDelete.languageConfigurations');
            if (jsonArray) {
                return jsonArray.map(json => this._mapLanguageConfig(json));
            }
            return undefined;
        };
        /**
         * Attach listener which listen the workspace configuration change
         */
        this.listenConfigurationChange = () => {
            this.workspaceListener = vscode_1.workspace.onDidChangeConfiguration((e) => {
                if (e.affectsConfiguration("hungryDelete")) {
                    this._resetConfiguration();
                    console.log("Reset hungry delete configuration");
                }
            });
        };
        /**
         * Remove listener which listen the workspace configuration change in order to prevent memory leak
         */
        this.unlistenConfigurationChange = () => {
            if (this.workspaceListener) {
                this.workspaceListener.dispose();
            }
        };
        /**
         * If internal configuration object exists, use it.
         *
         * Otherwise, use workspace configuration settings (Lazy loading of the config)
         *
         * @memberof ConfigurationProvider
         */
        this.getConfiguration = () => {
            if (this.config) {
                return this.config;
            }
            const workspaceConfig = vscode_1.workspace.getConfiguration('hungryDelete');
            this.config = {
                KeepOneSpace: workspaceConfig.get('keepOneSpace'),
                KeepOneSpaceException: workspaceConfig.get('keepOneSpaceException'),
                CoupleCharacters: ConfigurationProvider.CoupleCharacters,
                ConsiderIncreaseIndentPattern: workspaceConfig.get('considerIncreaseIndentPattern'),
                FollowAbovelineIndent: workspaceConfig.get('followAbovelineIndent'),
                LanguageConfigurations: this._getLanguageConfigurations(),
            };
            return this.config;
        };
        /**
         * Clear the internal configuration cache
         *
         * @private
         * @memberof ConfigurationProvider
         */
        this._resetConfiguration = () => {
            this.config = null;
        };
        this.config = config;
    }
    isKeepOnespaceException(char) {
        const config = this.getConfiguration();
        if (!config.KeepOneSpaceException) {
            return false;
        }
        return config.KeepOneSpaceException.indexOf(char) >= 0;
    }
    increaseIndentAfterLine(textLine, languageId) {
        const config = this.getConfiguration();
        if (!config.ConsiderIncreaseIndentPattern) {
            return false;
        }
        const languageConfigs = config.LanguageConfigurations.filter(langConfig => langConfig.languageId === languageId);
        if (languageConfigs.length > 0) {
            const langConfig = languageConfigs[0];
            if (langConfig.indentationRules) {
                return langConfig.indentationRules.increaseIndentPattern.test(textLine.text);
            }
        }
        return false;
    }
}
// TODO: May be a better way to handle this
ConfigurationProvider.CoupleCharacters = [
    "()",
    "[]",
    "<>",
    "{}",
    "''",
    "``",
    '""',
];
/**
  *Get the default configuration, must be alligned with the value in settins.json
 *
 * @memberof ConfigurationProvider
 */
ConfigurationProvider.getDefaultConfiguration = () => {
    return {
        KeepOneSpace: false,
        CoupleCharacters: ConfigurationProvider.CoupleCharacters
    };
};
exports.ConfigurationProvider = ConfigurationProvider;
//# sourceMappingURL=ConfigurationProvider.js.map