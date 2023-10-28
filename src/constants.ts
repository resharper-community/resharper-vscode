export const EXTENSION_NAME: string = "resharpervscode";
export const INSPECTION_FILENAME: string = "inspectcode.xml";
export const DUPFINDER_FILENAME: string = "dupfinder.xml";
export const JB_COMMAND: string = 'jb';
export const DUPFINDER_COMMAND: string = JB_COMMAND + ' dupfinder';
export const CLEANCODE_COMMAND: string = JB_COMMAND + ' cleanupcode';
export const INSPECTION_COMMAND: string = JB_COMMAND + ' inspectcode';
export const JB_INSTALLATION_COMMAND: string = 'dotnet tool install -g JetBrains.ReSharper.GlobalTools';
export const NO_SLN_WARN: string = 'Could not find a solution file (*.sln), please create one with the dotnet CLI.';
export const NONZERO_RET_CODE: string = 'Process did not exit with 0 code. Please check output.';
