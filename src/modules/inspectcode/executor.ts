import { execSync, spawn } from 'child_process';
import * as path from 'path';
import * as vscode from 'vscode';
import { EXTENSION_NAME, INSPECTION_FILENAME, INSPECTION_COMMAND, NONZERO_RET_CODE, NO_SLN_WARN } from '../../constants';
import { selectSolutionFile } from '../../utils/workspace';
import { loadDiagnostics } from './diagnostics';
import { Config } from '../config';
import { InspectCodeTreeDataProvider } from './tree';

export class InspectCodeExecutor {
	private progressResolve: null | ((value: void | PromiseLike<void>) => void) = null;

	constructor(
		private readonly output: vscode.OutputChannel,
		private readonly statusBarItem: vscode.StatusBarItem,
		private readonly diagnosticCollection: vscode.DiagnosticCollection,
		private readonly dataProvider: InspectCodeTreeDataProvider
	) { }

	private showStatusBarItem(): void {
		this.statusBarItem.text = "$(sync~spin) ReSharper: Inspect Code";
		this.statusBarItem.tooltip = "Inspect Code command is running";
		this.statusBarItem.command = `${EXTENSION_NAME}.showoutput`;
		this.statusBarItem.show();

		vscode.window.withProgress(
			{ location: { viewId: `${EXTENSION_NAME}.inspectcode` } },
			(_, __) =>
			{
				const p = new Promise<void>(resolve => {
					this.progressResolve = resolve;
				});
				return p;
			}
		);
	};

	private hideStatusBarItem(): void {
		this.statusBarItem.text = EXTENSION_NAME;
		this.statusBarItem.tooltip = undefined;
		this.statusBarItem.command = undefined;
		this.statusBarItem.hide();

		if (this.progressResolve) {
			this.progressResolve();
		}
	}

	private executeInspectCode(filePath: string, xmlPath: string): void {
		vscode.commands.executeCommand('setContext', 'resharpervscode:hideWelcome', true);

		this.output.appendLine(`Inspect Code command is running for '${filePath}'...`);
		const wd: string = path.dirname(filePath);

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
			`--output="${xmlPath}"`,
			`"${filePath}"`
		);

		this.output.appendLine(`${INSPECTION_COMMAND} ${args.filter(x => x.length > 0).join(' ')}`);
		const cp = spawn(INSPECTION_COMMAND, args, {
			cwd: wd,
			shell: true
		});

		const inspectCodeOutput: string[] = [];
		cp.stdin?.addListener('data', message => { const m = message.toString(); inspectCodeOutput.push(m); this.output.append(m); });
		cp.stdout?.addListener('data', message => { const m = message.toString(); inspectCodeOutput.push(m); this.output.append(m); });
		cp.stderr?.addListener('data', message => { const m = message.toString(); inspectCodeOutput.push(m); this.output.append(m); });

		cp.on('exit', async code => {
			if (code !== 0) {
				this.statusBarItem.hide();
				if (!await this.tryToFix(inspectCodeOutput)) {
					vscode.window.showErrorMessage(NONZERO_RET_CODE);
				}
			} else {
				this.diagnosticCollection.clear();
				var issues = loadDiagnostics(wd, this.diagnosticCollection);
				this.dataProvider.dataSource = issues;

				this.hideStatusBarItem();
				this.output.appendLine('Finished Inspect Code command.');
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

	private async tryToFix(inspectCodeOutput: string[]): Promise<boolean> {
		let canFix = false;
		if (inspectCodeOutput.find(m => m.indexOf("The SDK 'Microsoft.NET.SDK.WorkloadAutoImportPropsLocator' specified could not be found") >= 0)) {
			canFix = true;
		}

		if (canFix)
		{
			let config = Config.getConfig().inspectCodeConfig;
			if (!config.DotnetCoreSdk) {
				let dotnetSdkVersion: string;
				try{
					dotnetSdkVersion = execSync(`dotnet --version`).toString().trim();
				}
				catch {
					dotnetSdkVersion = '';
				}

				if (dotnetSdkVersion) {
					const selection = await vscode.window.showErrorMessage('Failed to inspect code. It was probably because ReSharper cannot find the correct dotnet SDK version.', "Try To Fix", "Show Output");
					if (selection === "Try To Fix") {
						Config.getConfig().saveInspectCodeDotnetSdkConfig(dotnetSdkVersion);
						vscode.commands.executeCommand(`${EXTENSION_NAME}.inspectcode`);
					}
					else if (selection === "Show Output") {
						vscode.commands.executeCommand(`${EXTENSION_NAME}.showoutput`);
					}
				}
			}
			return true;
		}
		return false;
	}
}
