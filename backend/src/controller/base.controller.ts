import { Controller, Request } from "tsoa";
import { AlreadyExistsError } from "../core/error/AlreadyExistsError";
import { DebugUtil } from "../core/utility/misc/debug.util";
import { LoginResponse } from "shared/src/dto/response/auth/login.response";
import { UnauthorizedError } from "../core/error/UnauthorizedError";
import { Repository } from "../core/repository/repository";
import { UserDocument, UserModel } from "../core/model/user.model";
import mongoose, { ObjectId } from "mongoose";
import { AuthService } from "../core/service/auth.service";
import { NotFoundError } from "../core/error/NotFoundError";
import { ForbiddenError } from "../core/error/ForbiddenError";
import { sign } from "cookie-signature";
import { getRequestContext, getResponseContext } from "./middleware/context.middleware";
import { verify } from "jsonwebtoken";

require("dotenv").config();

export class BaseController extends Controller {
	constructor(protected authService: AuthService) {
		super();
	}
	static ACCESS_TOKEN_COOKIE_HEADER: string = "access-token";
	static REFRESH_TOKEN_COOKIE_HEADER: string = "refresh-token";

	private userRepository = new Repository(UserModel);

	public ok<T>(data: T): T {
		this.setStatus(200); // OK
		return data;
	}

	public bad<T>(data: T): T {
		this.setStatus(400); // Bad Request
		return data;
	}

	public unauthorized<T>(data: T): T {
		this.setStatus(401); // Unauthorized
		return data;
	}

	public forbidden<T>(data: T): T {
		this.setStatus(403); // Forbidden
		return data;
	}

	public notFound<T>(data: T): T {
		this.setStatus(404); // Not Found
		return data;
	}

	public internalServerError<T>(data: T): T {
		this.setStatus(500); // Internal Server Error
		return data;
	}

	public alreadyExists<T>(data: T): T {
		this.setStatus(409); // Conflict (Already Exists)
		return data;
	}

	/**
	 * Handles exceptions and returns an appropriate response
	 * @param ex - The caught exception
	 */
	public handleError<T>(ex: any): T | string {
		DebugUtil.log(ex.message);
		if (ex instanceof AlreadyExistsError) {
			return this.alreadyExists(ex.message);
		}
		if (ex instanceof UnauthorizedError) {
			return this.unauthorized(ex.message);
		}
		if (ex instanceof NotFoundError) {
			return this.notFound(ex.message);
		}
		if (ex instanceof ForbiddenError) {
			return this.forbidden(ex.message);
		}
		// Default to internal server error for unexpected exceptions
		return this.internalServerError(ex.message);
	}

	public getDeviceName(): string {
		return this.getHeader("uset-agent")?.toString() || "unknown";
	}

	public async refresh(refreshToken: string): Promise<LoginResponse> {
		try {
			const tokens = await this.authService.refresh(refreshToken, this.getDeviceName());
			this.setTokenResponse(tokens);

			return tokens;
		} catch (error) {
			DebugUtil.error(new UnauthorizedError("Invalid refresh token"));
		}
	}

	public async getUserFromUsername(username: string) {
		try {
			return await this.userRepository.getByQuery({ username: username });
		} catch (error) {
			throw new UnauthorizedError("User not found");
		}
	}

	public async getUser(): Promise<UserDocument> {
		try {
			const req = getRequestContext();
			if (!req) {
				throw new UnauthorizedError("Request context is missing");
			}
			const { cookies, signedCookies } = req;

			const accessToken = signedCookies?.[BaseController.ACCESS_TOKEN_COOKIE_HEADER];
			const refreshToken = cookies?.[BaseController.REFRESH_TOKEN_COOKIE_HEADER];

			const decoded = verify(accessToken, process.env.SECRET!) as any;
			if (!decoded) {
				throw new UnauthorizedError("Invalid access token");
			}

			const user = await this.getUserFromUsername(decoded.username);
			if (user == null) {
				throw new UnauthorizedError("User not found");
			}
			return user;
		} catch (error) {
			throw new UnauthorizedError("User not found");
		}
	}

	// Set cookie header to save refresh & access tokens
	// so never have to login again on swagger
	//
	// when frontend sees header is different from saved, should resave new ones
	protected setTokenResponse(result: LoginResponse): void {
		if (!result.accessToken || !result.refreshToken) {
			DebugUtil.error(new Error("Access or refresh token undefined"));
		}
		// Convert environment variables to numbers with fallbacks
		const accessMaxAge = parseInt(process.env.TRAINER_LIFE!) || 900000; // 15m
		const refreshMaxAge = parseInt(process.env.REFRESH_LIFE!) || 2592000000; // 30d

		// Access token cookie
		const res = getResponseContext();
		if (!res) {
			throw Error("Resposne context not found");
		}
		res.cookie(BaseController.ACCESS_TOKEN_COOKIE_HEADER, result.accessToken, {
			maxAge: accessMaxAge,
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			signed: true,
		});
		res.cookie(BaseController.REFRESH_TOKEN_COOKIE_HEADER, result.refreshToken, {
			maxAge: refreshMaxAge,
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
		});
	}
}
