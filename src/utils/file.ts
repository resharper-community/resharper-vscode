import * as fs from 'fs';

export const BOM_CHAR_CODE: number = 65279;

/**
 * Synchronously reads the entire contents of a file.
 * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
 * URL support is _experimental_.
 * If a file descriptor is provided, the underlying file will _not_ be closed automatically.
 */
export function readFileSync(path: string): string {
	let data: string = fs.readFileSync(path).toString();

	return removeBOM(data);
}

export function removeBOM(data: string): string {
	if (data.length > 0 && data.charCodeAt(0) === BOM_CHAR_CODE) {
		data = data.substring(1);
	}

	return data;
}
