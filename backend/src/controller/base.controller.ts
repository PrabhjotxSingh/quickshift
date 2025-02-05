/*
------------------------------------------------------------------------
DESCRIPTION

Base controller class for streamlined status responses with automatic error handling
------------------------------------------------------------------------
*/

import { Controller } from "tsoa";
import { AlreadyExistsError } from "../core/errors/AlreadyExistsError";
import { ErrorHandler } from "../core/utility/misc/error-handler.utility";
import { LoginResponse } from "../../../shared/src/dto/response/auth/login.response";
require("dotenv").config();

export class BaseController extends Controller {
	static ACCESS_TOKEN_COOKIE_HEADER: string = "access-token";
	static REFRESH_TOKEN_COOKIE_HEADER: string = "refresh-token";

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
	public handleException<T>(ex: any): T | string {
		if (ex instanceof AlreadyExistsError) {
			return this.alreadyExists(ex.message);
		}
		// Default to internal server error for unexpected exceptions
		return this.internalServerError(ex.message);
	}

	public getDeviceName(): string {
		return this.getHeader("uset-agent")?.toString() || "unknown";
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
			this.buildCookie(
				BaseController.ACCESS_TOKEN_COOKIE_HEADER,
				result.accessToken,
				accessMaxAge,
				true, // signed
			),
			this.buildCookie(BaseController.REFRESH_TOKEN_COOKIE_HEADER, result.refreshToken, refreshMaxAge),
		]);
	}

	private buildCookie(name: string, value: string, maxAge: number, signed = false): string {
		const parts = [
			`${name}=${signed ? "s:" : ""}${value}`,
			`HttpOnly`,
			`Max-Age=${maxAge}`,
			`Path=/`,
			`SameSite=Strict`,
			process.env.NODE_ENV === "production" ? "Secure" : "",
		];

		if (signed) {
			parts.push("Signed");
		}

		return parts.filter((p) => p.length > 0).join("; ");
	}
}
