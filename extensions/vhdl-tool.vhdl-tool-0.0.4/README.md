# VHDL-Tool

[VHDL-Tool](https://www.vhdltool.com/) provides a [language server](https://github.com/Microsoft/language-server-protocol) for the VHDL hardware description language. This plugin makes VHDL-Tool's language server interface available from within VSCode.

**This is beta quality code. Report bugs here: https://git.vhdltool.com/vhdl-tool/vhdl-tool/issues.

To use this plugin, you must first [download](https://www.vhdltool.com/download) VHDL-Tool. See the requirements section.

For now, only Linux is supported.

## Features

* Syntax checking
* Go to definition
* Find references
* Browse file symbols
* Basic autocompletion
* Type information on hover

## Screenshots
![Syntax check and autocompletion](https://git.vhdltool.com/vhdl-tool/vhdltool-vscode/raw/master/images/autocompl-syntax.png)
![File symbols and hover](https://git.vhdltool.com/vhdl-tool/vhdltool-vscode/raw/master/images/symbols-hover.png)

## Usage
* F12 - go to definition
* Ctrl-Shift-F10 - peek definition
* Shift-F12 - find references
* Ctrl-Shift-o - find symbol in current file
* Syntax checking occurs on save and the first time a file is opened
* Autocompletion happens automatically when you type 
* Mouse over an identifier for type information

## Requirements

Before using this plugin, you must ensure that the `vhdl-tool` binary is installed on your system. To install `vhdl-tool` and setup your environment, do the following:

1. Install this plugin.
2. Download the `vhdl-tool` binary from [here](https://www.vhdltool.com/download), make sure it has execute permissions, and put it somewhere in your $PATH.
3. Create a vhdltool-config.yaml configuration file for your project by following the instructions [here](https://www.vhdltool.com/configuration).
4. Install one of the other VHDL plugins available in the marketplace for syntax highlighting. Search for VHDL in the extensions sidebar. **This step is compulsory as these plugins define the VHDL language and if VSCode does not know about VHDL it cannot launch the language server**.
5. Launch VSCode and open the folder containing the configuration file created in the previous step.

## Known Limitations
* The go to definition and find references commands are not accurate in the presence of overloading. In the case of multiple overloaded identifiers with the same name, the type correct one may not be chosen.
* VHDL-2008 is only partially supported.

## Release Notes

### 0.0.1

Initial beta release of VHDL-Tool.

