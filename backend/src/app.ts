import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import swaggerUi from "swagger-ui-express";
import * as swaggerDocument from "../dist/swagger.json";
import cors from "cors";
import mongoose, { ConnectOptions } from "mongoose";
import cookieParser from "cookie-parser";
import { requestMiddleware } from "./controller/middleware/request-context.middleware";
require("dotenv").config();

if (process.env.DB_CONNECTION_STRING === undefined) {
	throw Error("Connection string is undefiend");
}

const app = express();
app.use(express.json());
const conOptions: ConnectOptions = { autoCreate: true, autoIndex: false };

mongoose
	.connect(process.env.DB_CONNECTION_STRING, conOptions)
	.then(async () => {
		// Second round of imports so that database models arente created before
		// mongoose connection is established
		const { RegisterRoutes } = await import("./routes");

		app.use(bodyParser.urlencoded({ extended: true }));
		app.use(bodyParser.json());
		app.use(express.json());
		app.use(cookieParser(process.env.JWT_SECRET));

		// middleware
		app.use(requestMiddleware);
		// for debugging
		app.use((req, res, next) => {
			console.log("Request cookies:", req.cookies);
			console.log("Request signed cookies:", req.signedCookies);
			next();
		});

		const port = process.env.PORT || 3000;
		app.use(
			cors({
				origin: "*",
				credentials: true,
				exposedHeaders: ["set-cookie"],
				methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
				allowedHeaders: ["Content-Type", "Authorization", "Cookie", "Set-Cookie"],
			}),
		);

		RegisterRoutes(app);
		app.use(
			"/",
			swaggerUi.serve,
			swaggerUi.setup(swaggerDocument, {
				swaggerOptions: {
					withCredentials: true,
					persistAuthorization: true,
					requestInterceptor: (req: any) => {
						req.credentials = "include";
						return req;
					},
				},
			}),
		);
		// General error handler
		app.use(function (err: unknown, req: Request, res: Response, next: NextFunction) {
			const status = (err as any).status || 500;
			const message = (err as any).message || "An error occurred during the request.";

			res.status(status).send({ message });
		});
	})
	.catch((err) => console.log(err));
export { app };
