export interface CliOptions {
    ConfigPath?: string,
    Debug?: boolean,
    Verbosity?: string,
    ExcludePaths?: Array<string>,
    CachesHomePath?: string,
    MsBuildProperties?: string,
    TargetForReference?: string,
    TargetsForItems?: string
}