import { CliOptions } from "../configModels";

export type File = {
	path: string;
	issues: Issue[];
};

export type Issue = {
	typeId: string;
	file: string;
	offset: Range;
	line: number;
	message: string;

	issueType: IssueType;
};

export type IssueType = {
	id: string;
	category: string;
	categoryId: string;
	description: string;
	severity: 'ERROR' | 'HINT' | 'INFORMATION' | 'SUGGESTION' | 'WARNING';
	wikiUrl: string | undefined;
};

export type Range = {
	start: number;
	end: number;
};

export interface ICCliOptions extends CliOptions {
	ProfilePath?: string,
	Exclude?: string,
	NoSwea?: boolean,
	Swea?: boolean,
	Severity?: string,
	Project?: string,
	Include?: string,
	Toolset?: string,
	ToolsetPath?: string,
	MonoPath?: string,
	DotnetCorePath?: string,
	DotnetCoreSdk?: string,
	DisableSettingsLayer?: string,
	Extensions?: string
}