import * as vscode from 'vscode';
import { EXTENSION_DISPLAY_NAME, EXTENSION_NAME } from './constants';
import { reloadAllDiagnostics } from './modules/inspectcode/diagnostics';
import { InspectCodeExecutor } from './modules/inspectcode/executor';
import { CleanupCodeExecutor } from './modules/cleancode/executor';
import { JetBrainsInstaller } from './utils/jetbrainsinstaller';
import { Config } from './modules/config';
import { InspectCodeTreeDataProvider } from './modules/inspectcode/tree';
import { Issue } from './modules/inspectcode/models';

export function activate(context: vscode.ExtensionContext) {
	const config = Config.getConfig();
	config.loadConfig();

	vscode.workspace.onDidChangeConfiguration(function (event) {
		config.loadConfig();
	});

	const diagnosticCollection = vscode.languages.createDiagnosticCollection(EXTENSION_NAME);

	const output = vscode.window.createOutputChannel(EXTENSION_DISPLAY_NAME);
	const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);

	const jbInstaller = new JetBrainsInstaller(output);
	jbInstaller.verifyInstallation();

	const dataProvider = new InspectCodeTreeDataProvider();
	const tree = vscode.window.createTreeView(`${EXTENSION_NAME}.inspectcode`, {
		canSelectMany: false,
		treeDataProvider: dataProvider
	});

	let disposableShowOutput = vscode.commands.registerCommand(`${EXTENSION_NAME}.showoutput`, () => {
		output.show();
	});

	let disposable = vscode.commands.registerCommand(`${EXTENSION_NAME}.inspectcode`, () => {
		new InspectCodeExecutor(output, statusBarItem, diagnosticCollection, dataProvider).run();
	});

	let disposable2 = vscode.commands.registerTextEditorCommand(`${EXTENSION_NAME}.cleandiagnostics`, (textEditor) => {
		output.appendLine(`Clean Diagnostics command is running for '${textEditor.document.uri.fsPath}'...`);
		diagnosticCollection.delete(textEditor.document.uri);
		output.appendLine('Finished Clean Diagnostics command.');
	});

	let disposable3 = vscode.commands.registerCommand(`${EXTENSION_NAME}.cleanalldiagnostics`, () => {
		output.appendLine(`Clean All Diagnostics command is running...`);
		diagnosticCollection.clear();
		dataProvider.dataSource = undefined;
		output.appendLine('Finished Clean All Diagnostics command.');
		vscode.commands.executeCommand('setContext', 'resharpervscode:hideWelcome', false);
	});

	let disposable4 = vscode.commands.registerCommand(`${EXTENSION_NAME}.cleanupcode`, () => {
		new CleanupCodeExecutor(output, statusBarItem).run();
	});

	let disposable5 = vscode.commands.registerCommand(`${EXTENSION_NAME}.reloaddiagnostics`, () => {
		output.appendLine(`Reload Diagnostics command is running...`);
		reloadAllDiagnostics(diagnosticCollection, dataProvider);
		output.appendLine('Finished Reload Diagnostics command.');
	});

	let disposable9 = vscode.commands.registerCommand(`${EXTENSION_NAME}.issue.show`, async (issue: Issue) => {
		const textDocument = await vscode.workspace.openTextDocument(issue.fullPath);
		const textEditor = await vscode.window.showTextDocument(textDocument);

		const p11 = textDocument.positionAt(issue.offset.start);
		const p12 = textDocument.positionAt(issue.offset.end);

		textEditor.selection = new vscode.Selection(p11, p12);

		textEditor.revealRange(textEditor.selection, vscode.TextEditorRevealType.InCenter);
	});

	context.subscriptions.push(
		output,
		statusBarItem,
		tree,
		disposableShowOutput,
		disposable,
		disposable2,
		disposable3,
		disposable4,
		disposable5,
		disposable9
	);
}

export function deactivate() { }
