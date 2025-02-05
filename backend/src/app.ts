import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import swaggerUi from "swagger-ui-express";
import * as swaggerDocument from "../dist/swagger.json";
import mongoose, { ConnectOptions } from "mongoose";

require("dotenv").config();

if (process.env.DB_CONNECTION_STRING === undefined) {
	throw Error("Connection string is undefiend");
}

const app = express();
const conOptions: ConnectOptions = { autoCreate: true, autoIndex: false };

mongoose
	.connect(process.env.DB_CONNECTION_STRING, conOptions)
	.then(async () => {
		// Second round of imports so that database models arente created before
		// mongoose connection is established
		const { RegisterRoutes } = await import("./routes");

		console.log(`Connected to database ${mongoose.connection.db?.databaseName}`);

		app.use(bodyParser.urlencoded({ extended: true }));
		app.use(bodyParser.json());

		RegisterRoutes(app);
		app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

		// General error handler
		app.use(function (err: unknown, req: Request, res: Response, next: NextFunction) {
			const status = (err as any).status || 500;
			const message = (err as any).message || "An error occurred during the request.";
			res.status(status).send({ message });
		});
	})
	.catch((err) => console.log(err));
export { app };
