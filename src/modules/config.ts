import { CCCliOptions } from "./cleancode/models";
import { ICCliOptions } from "./inspectcode/models";
import * as vscode from "vscode";
import { EXTENSION_NAME } from "../constants";
import { DFCliOptions } from "./dupfinder/models";

export class Config {
    static conf: Config;
    cleanupCodeConfig: CCCliOptions;
    inspectCodeConfig: ICCliOptions;
    dupFinderConfig: DFCliOptions;
    private constructor() {
        this.cleanupCodeConfig = {};
        this.inspectCodeConfig = {};
        this.dupFinderConfig = {};
    }
    static getConfig() {
        if (Config.conf === undefined) {
            Config.conf = new Config();
        }
        return Config.conf;
    }
    loadConfig() {
        let config = vscode.workspace.getConfiguration(EXTENSION_NAME);
        this.cleanupCodeConfig = config.get<CCCliOptions>("cleanupcode", this.cleanupCodeConfig);
        this.inspectCodeConfig = config.get<ICCliOptions>("inspectcode", this.inspectCodeConfig);
        this.dupFinderConfig = config.get<DFCliOptions>("dupfinder", this.dupFinderConfig);
    }
}