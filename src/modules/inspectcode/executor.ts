import { spawn } from 'child_process';
import * as path from 'path';
import * as vscode from 'vscode';
import { EXTENSION_NAME, INSPECTION_FILENAME, INSPECTION_COMMAND, NONZERO_RET_CODE, NO_SLN_WARN } from '../../constants';
import { selectSolutionFile } from '../../utils/workspace';
import { loadDiagnostics } from './diagnostics';
import { Config } from '../config';

export class InspectCodeExecutor {
	constructor(
		private readonly output: vscode.OutputChannel,
		private readonly statusBarItem: vscode.StatusBarItem,
		private readonly diagnosticCollection: vscode.DiagnosticCollection
	) { }

	private showStatusBarItem(): void {
		this.statusBarItem.text = "$(sync~spin) Inspect Code";
		this.statusBarItem.tooltip = "Inspect Code command is running";
		this.statusBarItem.command = `${EXTENSION_NAME}.showoutput`;
		this.statusBarItem.show();
	};

	private hideStatusBarItem(): void {
		this.statusBarItem.text = EXTENSION_NAME;
		this.statusBarItem.tooltip = undefined;
		this.statusBarItem.command = undefined;
		this.statusBarItem.hide();
	}

	private executeInspectCode(filePath: string, xmlPath: string): void {
		this.output.appendLine(`Inspect Code command is running for '${filePath}'...`);

		let args: Array<string> = [];
		let config = Config.getConfig().inspectCodeConfig;
		args.push(
			(config.ConfigPath) ? `--config=${config.ConfigPath}` : "",
			(config.ProfilePath) ? `--profile=${config.ProfilePath}` : "",
			(config.Exclude) ? `--exclude=${config.Exclude}` : "",
			(config.Include) ? `--include=${config.Include}` : "",
			(config.Debug) ? `--debug=True` : "",
			(config.NoSwea) ? `--no-swea=True` : "",
			(config.Swea) ? `--swea=True` : "",
			(config.Verbosity) ? `--verbosity=${config.Verbosity}` : "",
			(config.Toolset) ? `--toolset=${config.Toolset}` : "",
			(config.Severity) ? `--severity=${config.Severity}` : "",
			(config.Project) ? `--project=${config.Project}` : "",
			(config.ToolsetPath) ? `--toolset-path=${config.ToolsetPath}` : "",
			(config.MonoPath) ? `--mono=${config.MonoPath}` : "",
			(config.DotnetCorePath) ? `--dotnetcore=${config.DotnetCorePath}` : "",
			(config.DotnetCoreSdk) ? `--dotnetcoresdk=${config.DotnetCoreSdk}` : "",
			(config.DisableSettingsLayer) ? `-dsl=${config.DisableSettingsLayer}` : "",
			(config.MsBuildProperties) ? `--properties=${config.MsBuildProperties}` : "",
			(config.CachesHomePath) ? `--caches-home=${config.CachesHomePath}` : "",
			(config.TargetForReference) ? `--targets-for-references=${config.TargetForReference}` : "",
			(config.TargetsForItems) ? `--targets-for-items=${config.TargetsForItems}` : "",
			(config.Extensions) ? `-x=${config.Extensions}` : "",
			`--output=${xmlPath}`,
			filePath
		);

		const cp = spawn(INSPECTION_COMMAND, args, { shell: true });

		cp.stdin?.addListener('data', message => this.output.append(message.toString()));
		cp.stdout?.addListener('data', message => this.output.append(message.toString()));
		cp.stderr?.addListener('data', message => this.output.append(message.toString()));

		cp.on('exit', code => {
			if (code !== 0) {
				vscode.window.showErrorMessage(NONZERO_RET_CODE);
				this.statusBarItem.hide();
			} else {
				const dirPath = path.dirname(filePath);

				this.diagnosticCollection.clear();
				loadDiagnostics(dirPath, this.diagnosticCollection);

				this.hideStatusBarItem();
				this.output.appendLine('Fnished Inspect Code command.');
			}
		});
	}

	public run(): void {
		selectSolutionFile(filePath => {
			if (!filePath) {
				vscode.window.showWarningMessage(NO_SLN_WARN);
				return;
			}

			const xmlPath = path.join(path.dirname(filePath), INSPECTION_FILENAME);

			this.showStatusBarItem();
			this.executeInspectCode(filePath, xmlPath);
		});
	}
}
