import { spawn } from 'child_process';
import * as vscode from 'vscode';
import { EXTENSION_NAME, CLEANCODE_COMMAND, NO_SLN_WARN, NONZERO_RET_CODE } from '../../constants';
import { selectSolutionFile } from '../../utils/workspace';
import { Config } from "../config";

export class CleanupCodeExecutor {
	public constructor(
		private readonly output: vscode.OutputChannel,
		private readonly statusBarItem: vscode.StatusBarItem
	) { }

	private showStatusBarItem() {
		this.statusBarItem.text = "$(sync~spin) Cleanup Code";
		this.statusBarItem.tooltip = "R#: Cleaning up code";
		this.statusBarItem.command = `${EXTENSION_NAME}.showoutput`;
		this.statusBarItem.show();
	}

	private hideStatusBarItem() {
		this.statusBarItem.text = EXTENSION_NAME;
		this.statusBarItem.tooltip = undefined;
		this.statusBarItem.command = undefined;
		this.statusBarItem.hide();
	}

	private executeCleanupCode(filePath: string): void {
		this.output.appendLine(`Cleanup Code command is running for '${filePath}'...`);

		let args: Array<string> = [];
		let config = Config.getConfig().cleanupCodeConfig;
		args.push(
			(config.ConfigPath) ? `--config=${config.ConfigPath}` : "",
			(config.SettingsPath) ? `-s=${config.SettingsPath}` : "",
			(config.ProfileName) ? `-p=${config.ProfileName}` : "",
			(config.IncludePaths) ? `--include=${config.IncludePaths.join(';')}` : "",
			(config.ExcludePaths) ? `--exclude=${config.ExcludePaths.join(';')}` : "",
			(config.Debug) ? `--debug=True` : "",
			(config.Verbosity) ? `--verbosity=${config.Verbosity}` : "",
			(config.Toolset) ? `--toolset=${config.Toolset}` : "",
			(config.ToolsetPath) ? `--toolset-path=${config.ToolsetPath}` : "",
			(config.MsBuildProperties) ? `--properties=${config.MsBuildProperties}` : "",
			(config.MonoPath) ? `--mono=${config.MonoPath}` : "",
			(config.DotnetCorePath) ? `--dotnetcore=${config.DotnetCorePath}` : "",
			(config.DotnetCoreSdk) ? `--dotnetcoresdk=${config.DotnetCoreSdk}` : "",
			(config.DisableSettingsLayer) ? `-dsl=${config.DisableSettingsLayer}` : "",
			(config.CachesHomePath) ? `--caches-home=${config.CachesHomePath}` : "",
			(config.TargetForReference) ? `--targets-for-references=${config.TargetForReference}` : "",
			(config.TargetsForItems) ? `--targets-for-items=${config.TargetsForItems}` : "",
			(config.Extensions) ? `-x=${config.Extensions}` : "",
			filePath
		);

		const cp = spawn(CLEANCODE_COMMAND, args, { shell: true });

		cp.stdin?.addListener('data', message => this.output.append(message.toString()));
		cp.stdout?.addListener('data', message => this.output.append(message.toString()));
		cp.stderr?.addListener('data', message => this.output.append(message.toString()));

		cp.on('exit', code => {
			if (code !== 0) {
				vscode.window.showErrorMessage(NONZERO_RET_CODE);
			}

			this.hideStatusBarItem();
			this.output.appendLine('Fnished Cleanup Code command.');
		});
	}

	public run() {
		selectSolutionFile(filePath => {
			if (!filePath) {
				vscode.window.showWarningMessage(NO_SLN_WARN);
				return;
			}

			vscode.window.showQuickPick(['No. Do not change my codes.', 'Yes. Cleanup my codes.'], {
				placeHolder: 'WARNING! Your code will be modified by ReSharper, continue?'
			}).then(value => {
				if (value && value.startsWith('Yes')) {
					this.showStatusBarItem();
					this.executeCleanupCode(filePath);
				}
			});
		});
	}
}
