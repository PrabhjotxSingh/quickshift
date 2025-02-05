import mongoose from "mongoose";

/*
 * For easier time of logging errors
 */
export class ErrorHandler {
	static ThrowError(er: Error): never {
		console.log("\n\n\n");
		console.log("Mongoose readyState:", mongoose.connection.readyState);
		console.log("Connected database:", mongoose.connection.name);
		console.log(er.message);

		throw er;
	}
}
