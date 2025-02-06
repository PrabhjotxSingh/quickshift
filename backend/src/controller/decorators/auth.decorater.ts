import { UserRole } from "../../core/models/user.model";
import { verify } from "jsonwebtoken";
import { BaseController } from "../base.controller";
import { UnauthorizedError } from "../../core/errors/UnauthorizedError";
import { ForbiddenError } from "../../core/errors/ForbiddenError";
import { Request as ExpressRequest } from "express";
import { getRequestContext } from "../middleware/context.middleware";

export function Authenticate(role: UserRole) {
	return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		const originalMethod = descriptor.value;

		descriptor.value = async function (...args: any[]) {
			const controller = this as BaseController;

			// Extract the Express request object from `context`
			const context = args[1]; // TSOA passes the context as the second argument
			const req = getRequestContext();

			if (!req) {
				throw new UnauthorizedError("Request context is missing");
			}

			try {
				// Extract cookies and signed cookies from request
				const cookies = req.cookies;
				const signedCookies = req.signedCookies;

				const accessToken = signedCookies?.[BaseController.ACCESS_TOKEN_COOKIE_HEADER];
				const refreshToken = cookies?.[BaseController.REFRESH_TOKEN_COOKIE_HEADER];

				if (!accessToken || !refreshToken) {
					throw new UnauthorizedError("Missing authentication tokens");
				}

				// Verify/Refresh tokens
				let decoded: any;
				try {
					decoded = verify(accessToken, process.env.COOKIE_SECRET!);
				} catch (error: any) {
					if (error.name === "TokenExpiredError") {
						const refreshResponse = await controller.refresh(refreshToken);
						if (!refreshResponse.accessToken || !refreshResponse.refreshToken) {
							throw new UnauthorizedError("Invalid access token");
						}
						try {
							decoded = verify(refreshResponse.accessToken, process.env.COOKIE_SECRET!);
						} catch {
							throw new UnauthorizedError("Invalid access token");
						}
					} else {
						throw new UnauthorizedError("Invalid access token");
					}
				}

				// Check user roles
				const user = await controller.getUserFromToken(decoded.userId);
				if (!user || user.roles.length < 1 || !user.roles.includes(role)) {
					throw new ForbiddenError("Insufficient permissions");
				}

				// Proceed with the original function
				return originalMethod.apply(this, args);
			} catch (error) {
				return controller.handleError(error);
			}
		};

		return descriptor;
	};
}
