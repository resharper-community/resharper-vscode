import * as path from 'path';
import * as vscode from 'vscode';
import { EXTENSION_NAME } from '../../constants';
import { Issue, IssueType } from './models';

export class IssueTreeItem extends vscode.TreeItem {
	constructor(
		public readonly issueGroup: IssueGroup,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly children: IssueTreeItem[],
		public readonly issue: Issue | undefined
	) {
		super(issue === undefined ? `${issueGroup.issueType.id} (${issueGroup.issues.length})` : `${path.basename(issue.file)}`, collapsibleState);
		const dirname = this.issue === undefined ? '' : path.dirname(this.issue.file);
		this.description = dirname === '.' ? '' : dirname;
		this.tooltip = this.issue === undefined ? this.issueGroup.issueType.description : `Line: ${this.issue.line} (${this.issue.offset.start}, ${this.issue.offset.end})`;
	}
}

export class IssueGroup {
	constructor(
		public readonly issueType: IssueType,
		public readonly issues: Issue[]
	)
	{}
}

export class InspectCodeTreeDataProvider implements vscode.TreeDataProvider<IssueTreeItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<IssueTreeItem | undefined> = new vscode.EventEmitter<IssueTreeItem | undefined>();
	public readonly onDidChangeTreeData?: vscode.Event<IssueTreeItem | undefined> = this._onDidChangeTreeData.event;

	private _issueGroups: IssueGroup[] | undefined = undefined;

	public set dataSource(issues: Issue[] | undefined) {
		if (issues === undefined) {
			this._issueGroups = undefined;
		}
		else {
			const map = new Map<string, IssueGroup>();
			for (let i = 0; i < issues.length; i++) {
				const issue = issues[i];
				var key = issue.issueType.id;
				var issueGroup = map.get(key);
				if (issueGroup === undefined) {
					issueGroup = new IssueGroup(issue.issueType, [ issue ]);
					map.set(key, issueGroup);
				}
				else {
					issueGroup.issues.push(issue);
				}
			}
			this._issueGroups = [...map.values()].sort((a, b) => a.issueType.id.localeCompare(b.issueType.id));
		}
		this.refresh();
	}

	public refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	public getTreeItem(element: IssueTreeItem): vscode.TreeItem {
		return element;
	}

	public getChildren(element?: IssueTreeItem | undefined): vscode.ProviderResult<IssueTreeItem[]> {
		if (this._issueGroups === undefined) {
			return null;
		}

		if (element === undefined) {
			return this._issueGroups.map(group => this.createParentItem(group));
		} else {
			return element.children.length === 0 ? null : element.children;
		}
	}

	private createParentItem(group: IssueGroup): IssueTreeItem {
		const children = group.issues.map(issue => this.createChildItem(group, issue));;
		const item = new IssueTreeItem(group, vscode.TreeItemCollapsibleState.Collapsed, children, undefined);
		return item;
	}

	private createChildItem(group: IssueGroup, issue: Issue): IssueTreeItem {
		const item = new IssueTreeItem(group, vscode.TreeItemCollapsibleState.None, [], issue);
		item.command = {
			command: `${EXTENSION_NAME}.issue.show`,
			title: 'Show issue',
			arguments: [issue]
		};
		return item;
	}

	public getParent(node: IssueTreeItem): IssueTreeItem | null {
		return null;
	}
}
