# fakesharper**settings**

This extension provides a wrapper for the R# CLI. The CLI executables are available as commands in the command pallette and any command line arguments can be configurable from the VS Code config files.

This extension is a fork of fakesharpersettings which is a fork of fakesharper

## Inspect Code

![example](https://raw.githubusercontent.com/resharper-community/resharper-vscode/master/assets/example.gif)

## Dupfinder

![example](https://raw.githubusercontent.com/resharper-community/resharper-vscode/master/assets/dupfinder.gif)

## Requirements

* [ReSharper Command Line](https://www.jetbrains.com/resharper/features/command-line.html) tool:
  * Download from [here](https://www.jetbrains.com/resharper/download/#section=commandline).
  * Extract files to any folder.
  * Add folder to environment PATH variable.
  * Check if installed correctly by `inspectcode --version` command on command line.

## Features

* `Inspect Code`: Inspecting and linting.
* `Clean Diagnostics`: Clean diagnostics on current editor.
* `Clean All Diagnostics`: Clean all diagnostics on workspace.
* `Reload Diagnostics`: Show diagnostics on editor from all found inspectcode.xml files.
* `Cleanup Code`: Format and cleanup code.
* `Run Dupfinder`: Find duplicates in code.
* `Clean Duplicates`: Clean duplicates tree.

## FAQ

### Is ReSharper free?

**Yes!** We use free tool of [JetBrains](https://www.jetbrains.com/) [ReSharper](https://www.jetbrains.com/resharper/) called [ReSharper Command Line](https://www.jetbrains.com/resharper/features/command-line.html) tool for this extension.

### Does this extension make Visual Studio Code slower?

**No!** Currently fakesharper**settings** works as command. This extension works only when you run any command.

-----------------------------------------------------------------------------------------------------------

## Thanks

[JetBrains](https://www.jetbrains.com/) for the free awesome [ReSharper](https://www.jetbrains.com/resharper/) [Command Line](https://www.jetbrains.com/resharper/features/command-line.html) tool.

**Enjoy!**
