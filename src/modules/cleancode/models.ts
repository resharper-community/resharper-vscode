import { CliOptions } from "../configModels";

export interface CCCliOptions extends CliOptions {
    SettingsPath?: string,
    ProfileName?: string,
    IncludePaths?: Array<string>,
    Toolset?: string,
    ToolsetPath?: string,
    MonoPath?: string,
    DotnetCorePath?: string,
    DotnetCoreSdk?: string,
    DisableSettingsLayer?: string,
    Extensions?: string
}