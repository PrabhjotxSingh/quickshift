/*
 * For easier time of logging stuff
 */
export class DebugUtil {
	static log(message: string): void {
		console.log(message);
	}

	static error(er: Error): never {
		this.logErrorTrace(er);
		throw er;
	}

	static logErrorTrace(er: Error): void {
		const trace = er.stack;
		if (trace != null) {
			console.log(trace);
		}
	}

	static warn(message: string): void {
		console.warn(message);
	}
}
