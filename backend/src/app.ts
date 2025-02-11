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

DebugUtil.log("Registering parsers");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser(process.env.SECRET));

// middleware
DebugUtil.log("Registering context middleware");
app.use(contextMiddleware);

// for debugging
// probably not needed anymore
if (false) {
	app.use((req, res, next) => {
		console.log("Request cookies:", req.cookies);
		console.log("Request signed cookies:", req.signedCookies);
		next();
	});
}

DebugUtil.log("Registering cors");
app.use(
	cors({
		origin: "*",
		credentials: true,
		exposedHeaders: ["set-cookie"],
		methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "Cookie", "Set-Cookie"],
	}),
);

DebugUtil.log("Registering routes");
RegisterRoutes(app);

DebugUtil.log("Registering swagger");
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
