import * as fs from "fs";
import { EOL } from "os";
import * as path from "path";
import * as vscode from "vscode";
import { EXTENSION_DISPLAY_NAME, INSPECTION_FILENAME } from "../../constants";
import { readFileSync } from '../../utils/file';
import { File, Issue } from "./models";
import { getIssueRange, getIssueSeverity, restoreRelativePaths } from "./utils";
import { findFiles } from '../../utils/workspace';
import { parseFile } from "./xmlparser";
import { InspectCodeTreeDataProvider } from "./tree";

export function reloadAllDiagnostics(diagnosticCollection: vscode.DiagnosticCollection, dataProvider: InspectCodeTreeDataProvider) {
	findFiles(`**/${INSPECTION_FILENAME}`)
		.then(files => {
			diagnosticCollection.clear();

			let allIssues: Issue[] = [];
			files.forEach((file) => {
				const issues = loadDiagnostics(path.dirname(file.fsPath), diagnosticCollection);
				allIssues.push(...issues);
			});
			dataProvider.dataSource = allIssues;
		});
}

export function loadDiagnostics(basePath: string, diagnosticCollection: vscode.DiagnosticCollection): Issue[] {
	const xmlPath = path.join(basePath, INSPECTION_FILENAME);
	if (!fs.existsSync(xmlPath)) {
		return [];
	}

	try {
		const files: File[] = parseFile(xmlPath);
		restoreRelativePaths(basePath, files);
		updateDiagnostics(files, diagnosticCollection);
		let issues: Issue[] = [];
		for (let i = 0; i < files.length; i++) {
			const file: File = files[i];
			issues.push(...file.issues);
		}
		return issues;
	} catch (err) {
		vscode.window.showErrorMessage(`${(err as any)?.message || err}`);
		return [];
	}
}

export function updateDiagnostics(files: File[], diagnosticCollection: vscode.DiagnosticCollection): void {
	for (let i = 0; i < files.length; i++) {
		const file: File = files[i];

		const data: string = readFileSync(file.path);
		const uri: vscode.Uri = vscode.Uri.file(file.path);

		diagnosticCollection.set(uri, file.issues.map(issue => ({
			message: issue.message + (issue.issueType.wikiUrl ? EOL + issue.issueType.wikiUrl : ''),
			range: getIssueRange(data, issue),
			severity: getIssueSeverity(issue),
			code: issue.typeId,
			source: EXTENSION_DISPLAY_NAME
		})));
	}
}
