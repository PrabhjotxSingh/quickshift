import mongoose from "mongoose";

/*
 * For easier time of logging errors
 */
export class ErrorHandler {
	static ThrowError(er: Error): never {
		throw er;
	}
}
