import { RegisterRoutes } from "./routes";
import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import swaggerUi from "swagger-ui-express";
import * as swaggerDocument from "../dist/swagger.json";
import mongoose from "mongoose";

require("dotenv").config();

const connectionString = process.env.DB_CONNECTION_STRING;
if (connectionString === undefined) {
	throw Error("Connection string is undefiend");
}

const app = express();

mongoose
	.connect(connectionString)
	.then(() => {
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
