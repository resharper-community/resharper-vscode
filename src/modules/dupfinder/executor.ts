import { spawn } from 'child_process';
import * as path from 'path';
import * as vscode from 'vscode';
import { DUPFINDER_FILENAME, EXTENSION_NAME, DUPFINDER_COMMAND, NO_SLN_WARN, NONZERO_RET_CODE } from '../../constants';
import { selectSolutionFile } from '../../utils/workspace';
import { DupfinderTreeDataProvider } from './tree';
import { parsefile } from './parser';
import { Config } from '../config';

export class DupfinderExecutor {
	constructor(
		private readonly output: vscode.OutputChannel,
		private readonly statusBarItem: vscode.StatusBarItem,
		private readonly dataProvider: DupfinderTreeDataProvider
	) { }

	private showStatusBarItem() {
		this.statusBarItem.text = "$(sync~spin) Dupfinder";
		this.statusBarItem.tooltip = "Dupfinder command is running";
		this.statusBarItem.command = `${EXTENSION_NAME}.showoutput`;
		this.statusBarItem.show();
	}

	private hideStatusBarItem() {
		this.statusBarItem.text = EXTENSION_NAME;
		this.statusBarItem.tooltip = undefined;
		this.statusBarItem.command = undefined;
		this.statusBarItem.hide();
	}

	private executeDupfinder(filePath: string, xmlPath: string) {
		this.output.appendLine(`Dupfinder command is running for '${filePath}'...`);

		const wd: string = path.dirname(filePath);

		let args = [];
		let config = Config.getConfig().dupFinderConfig;
		args.push(
			(config.ConfigPath) ? `--config=${config.ConfigPath}` : "",
			(config.Debug) ? `--debug=True` : "",
			(config.Verbosity) ? `--verbosity=${config.Verbosity}` : "",
			(config.CachesHomePath) ? `--caches-home=${config.CachesHomePath}` : "",
			(config.DiscardCost) ? `--discard-cost=${config.DiscardCost}` : "",
			(config.DiscardFields) ? `--discard-fields=True` : "",
			(config.DiscardLiterals) ? `--discard-literals=True` : "",
			(config.DiscardLocalVars) ? `--discard-local-vars=True` : "",
			(config.DiscardTypes) ? `--discard-types=True` : "",
			(config.IdlePriority) ? `--idle-priority` : "",
			(config.ExcludeByComment) ? `--exclude-by-comment=${config.ExcludeByComment.join(';')}` : "",
			(config.ExcludeCodeRegions) ? `--exclude-code-regions=${config.ExcludeCodeRegions.join(';')}` : "",
			(config.Exclude) ? `-e=${config.Exclude}` : "",
			(config.MsBuildProperties) ? `--properties=${config.MsBuildProperties}` : "",
			(config.CachesHomePath) ? `--caches-home=${config.CachesHomePath}` : "",
			(config.ShowStats) ? `--show-stats=${config.ShowStats}` : "",
			(config.ShowText) ? `--show-stats=${config.ShowText}` : "",
			`--output=${xmlPath}`,
			filePath
		);

		const cp = spawn(DUPFINDER_COMMAND, args, {
			cwd: wd
		});

		cp.stdin?.addListener('data', message => this.output.append(message.toString()));
		cp.stdout?.addListener('data', message => this.output.append(message.toString()));
		cp.stderr?.addListener('data', message => this.output.append(message.toString()));

		cp.on('exit', code => {
			this.hideStatusBarItem();
			this.output.appendLine('Fnished Dupfinder command.');

			if (code !== 0) {
				vscode.window.showErrorMessage(NONZERO_RET_CODE);
			} else {
				try {
					const duplicatesReport = parsefile(xmlPath);
					for (let i = 0; i < duplicatesReport.duplicates.length; i++) {
						duplicatesReport.duplicates[i].fragment1.filePath = path.join(wd, duplicatesReport.duplicates[i].fragment1.fileName);
						duplicatesReport.duplicates[i].fragment2.filePath = path.join(wd, duplicatesReport.duplicates[i].fragment2.fileName);
					}
					this.dataProvider.dataSource = duplicatesReport;
				} catch (e) {
					console.error(e);
					vscode.window.showErrorMessage(`${e?.message || e}`);
				}
			}
		});
	}

	public run(): void {
		selectSolutionFile(filePath => {
			if (!filePath) {
				vscode.window.showWarningMessage(NO_SLN_WARN);
				return;
			}

			const xmlPath = path.join(path.dirname(filePath), DUPFINDER_FILENAME);

			this.showStatusBarItem();
			this.executeDupfinder(filePath, xmlPath);
		});
	}
}
