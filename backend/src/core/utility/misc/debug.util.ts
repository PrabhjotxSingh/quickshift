/*
 * For easier time of logging stuff
 */
export class DebugUtil {
	static log(message: string): void {
		console.log(message);
	}
	static error(er: Error): never {
		throw er;
	}
}
