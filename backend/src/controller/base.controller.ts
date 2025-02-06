/*
------------------------------------------------------------------------
DESCRIPTION

Base controller class for streamlined status responses with automatic error handling
------------------------------------------------------------------------
*/

import { Controller, Request } from "tsoa";
import { AlreadyExistsError } from "../core/errors/AlreadyExistsError";
import { ErrorHandler } from "../core/utility/misc/error-handler.utility";
import { LoginResponse } from "../../../shared/src/dto/response/auth/login.response";
import { UnauthorizedError } from "../core/errors/UnauthorizedError";
import { Repository } from "../core/repositories/repository";
import { UserModel } from "../core/models/user.model";
import mongoose, { ObjectId } from "mongoose";
import { AuthService } from "../core/service/auth.service";
import { NotFoundError } from "../core/errors/NotFoundError";
import { ForbiddenError } from "../core/errors/ForbiddenError";
import { sign } from "cookie-signature";

require("dotenv").config();

export class BaseController extends Controller {
	static ACCESS_TOKEN_COOKIE_HEADER: string = "access-token";
	static REFRESH_TOKEN_COOKIE_HEADER: string = "refresh-token";

	// TODO:
	// Change to be dependecy injection
	protected authService = new AuthService();

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
			ErrorHandler.ThrowError(new UnauthorizedError("Invalid refresh token"));
		}
	}

	public async getUserFromToken(userId: string) {
		try {
			return await this.userRepository.getByQuery({ id: userId });
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
			ErrorHandler.ThrowError(new Error("Access or refresh token undefined"));
		}
		// Convert environment variables to numbers with fallbacks
		const accessMaxAge = parseInt(process.env.TRAINER_LIFE!) || 900000; // 15m
		const refreshMaxAge = parseInt(process.env.REFRESH_LIFE!) || 2592000000; // 30d

		// Access token cookie
		this.setHeader("Set-Cookie", [
			this.buildCookie(BaseController.ACCESS_TOKEN_COOKIE_HEADER, result.accessToken, accessMaxAge, true),
			this.buildCookie(BaseController.REFRESH_TOKEN_COOKIE_HEADER, result.refreshToken, refreshMaxAge),
		]);
	}

	private buildCookie(name: string, value: string, maxAge: number, signed: boolean = false): string {
		// Sign the value if required
		const cookieValue = signed
			? sign(value, process.env.COOKIE_SECRET!) // Use the same secret as cookie-parser
			: value;

		const options = {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production", // Adjust based on your environment
			sameSite: "strict" as const,
			maxAge: maxAge,
			signed: signed,
		};

		// Convert options to cookie string
		const optionsStr = Object.entries(options)
			.map(([key, val]) => `${key}=${val}`)
			.join("; ");

		return `${name}=${cookieValue}; ${optionsStr}`;
	}
}
