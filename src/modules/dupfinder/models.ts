import { CliOptions } from "../configModels";

export type Duplicate = {
	cost: number;
	fragment1: Fragment;
	fragment2: Fragment;
};

export type DuplicatesReport = {
	toolsVersion: string;
	statistics: Statistics;
	duplicates: Duplicate[];
};

export type Fragment = {
	filePath: string;
	fileName: string;
	offsetRange: Range;
	lineRange: Range;
};

export type Range = {
	start: number;
	end: number;
};

export type Statistics = {
	codebaseCost: number;
	totalDuplicatesCost: number;
	totalFragmentsCost: number;
};

export interface DFCliOptions extends CliOptions {
	DiscardCost?: number,
	DiscardFields?: boolean,
	DiscardLiterals?: boolean,
	DiscardLocalVars?: boolean,
	DiscardTypes?: boolean,
	IdlePriority?: boolean,
	ExcludeByComment?: Array<string>,
	ExcludeCodeRegions?: Array<string>,
	Exclude?: string,
	NormalizeTypes?: boolean,
	ShowStats?: boolean,
	ShowText?: boolean
}