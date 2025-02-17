import "reflect-metadata";
import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import swaggerUi from "swagger-ui-express";
import * as swaggerDocument from "../swagger/swagger.json";
import cors from "cors";
import mongoose, { ConnectOptions } from "mongoose";
import cookieParser from "cookie-parser";
import { contextMiddleware } from "./controller/middleware/context.middleware";
import { DebugUtil } from "./core/utility/misc/debug.util";
require("dotenv").config();

if (process.env.DB_CONNECTION_STRING === undefined) {
	throw Error("Connection string is undefiend");
}

const app = express();
app.use(express.json());
const conOptions: ConnectOptions = { autoCreate: true, autoIndex: false };

DebugUtil.log("Connecting to database");
mongoose
	.connect(process.env.DB_CONNECTION_STRING, conOptions)
	.then(async () => {})
	.catch((err) => {
		DebugUtil.error(new Error("Error occured connecting to database: " + err));
	});

// Importing after the mongoose.connect() as the models
// need to be registered after the connection is established
import { RegisterRoutes } from "./routes";
import { ValidateError } from "tsoa";
import Container from "typedi";
import { Repository } from "./core/repository/base.repository";
import { CompanyModel } from "./core/model/company.model";
import { CompanyService } from "./core/service/company.service";

DebugUtil.log("registering parsers");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser(process.env.SECRET));

// middleware
DebugUtil.log("registering context middleware");
app.use(contextMiddleware);

app.use((req, res, next) => {
	console.log(`Recieved request to URL: ${req.url}`);
	next();
});

DebugUtil.log("registering cors");
app.use(
	cors({
		origin: "*",
		credentials: true,
		exposedHeaders: ["set-cookie"],
		methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "Cookie", "Set-Cookie"],
	}),
);

DebugUtil.log("registering routes");
RegisterRoutes(app);

// Custom error handler for Tsoa validation errors
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
	if (err instanceof ValidateError) {
		DebugUtil.warn(`Validation Error for ${req.method} ${req.path}}`);

		return res.status(400).json({
			success: false,
			message: "Invalid request parameters.",
			errors: Object.entries(err.fields).map(([key, value]) => ({
				parameter: key,
				message: value.message,
				expected: value.value,
			})),
		});
	}

	if (err instanceof Error) {
		const stack = err.stack?.toString();
		if (stack != null) {
			DebugUtil.log(stack);
		}
		return res.status(500).json({
			success: false,
			message: err.message,
		});
	}

	next();
});

DebugUtil.log("registering swagger");
app.use(
	"/docs",
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
export { app };
