import { UserRole } from "../../core/enum/user-role.enum";
import { verify } from "jsonwebtoken";
import { BaseController } from "../base.controller";
import { UnauthorizedError } from "../../core/error/UnauthorizedError";
import { ForbiddenError } from "../../core/error/ForbiddenError";
import { getRequestContext } from "../middleware/context.middleware";

/**
 * verifies the access token. if expired,
 * calls refresh and re-verifies the new token.
 */
async function getValidDecodedToken(
	controller: BaseController,
	accessToken: string,
	refreshToken: string,
): Promise<any> {
	try {
		return verify(accessToken, process.env.SECRET!);
	} catch (error: any) {
		if (error.name !== "TokenExpiredError") {
			throw new UnauthorizedError("Invalid access token");
		}
		const refreshResponse = await controller.refresh(refreshToken);
		if (!refreshResponse?.accessToken || !refreshResponse?.refreshToken) {
			throw new UnauthorizedError("Invalid access token");
		}
		return verify(refreshResponse.accessToken, process.env.SECRET!);
	}
}

export function Authenticate(role: UserRole) {
	return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		const originalMethod = descriptor.value;

		descriptor.value = async function (...args: any[]) {
			const controller = this as BaseController;
			const req = getRequestContext();

			if (!req) {
				throw new UnauthorizedError("Request context is missing");
			}

			const { cookies, signedCookies, headers } = req;
			const accessToken = signedCookies?.[BaseController.ACCESS_TOKEN_COOKIE_HEADER];
			const refreshToken = cookies?.[BaseController.REFRESH_TOKEN_COOKIE_HEADER];

			// Check for Authorization header
			const authHeader = headers?.authorization;
			let bearerToken = null;
			if (authHeader && authHeader.startsWith("Bearer ")) {
				bearerToken = authHeader.substring(7);
			}

			// Use either cookie tokens or Authorization header bearer token
			if ((!accessToken || !refreshToken) && !bearerToken) {
				throw new UnauthorizedError("Missing authentication tokens");
			}

			try {
				let decoded;
				if (bearerToken) {
					// If using bearer token, verify it directly
					decoded = verify(bearerToken, process.env.SECRET!);
				} else {
					// Otherwise use the cookie-based tokens
					decoded = await getValidDecodedToken(controller, accessToken, refreshToken);
				}

				const user = await controller.getUserFromUsername(decoded.username);
				if (!user || !user.roles.map((role) => role.toUpperCase()).includes(role.toUpperCase())) {
					throw new ForbiddenError("Insufficient permissions");
				}

				return originalMethod.apply(this, args);
			} catch (error) {
				return controller.handleError(error);
			}
		};

		return descriptor;
	};
}

export function AuthenticateAny(roles: UserRole[]) {
	return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		const originalMethod = descriptor.value;

		descriptor.value = async function (...args: any[]) {
			const controller = this as BaseController;
			const req = getRequestContext();

			if (!req) {
				throw new UnauthorizedError("Request context is missing");
			}

			const { cookies, signedCookies, headers } = req;
			const accessToken = signedCookies?.[BaseController.ACCESS_TOKEN_COOKIE_HEADER];
			const refreshToken = cookies?.[BaseController.REFRESH_TOKEN_COOKIE_HEADER];

			// Check for Authorization header
			const authHeader = headers?.authorization;
			let bearerToken = null;
			if (authHeader && authHeader.startsWith("Bearer ")) {
				bearerToken = authHeader.substring(7);
			}

			// Use either cookie tokens or Authorization header bearer token
			if ((!accessToken || !refreshToken) && !bearerToken) {
				throw new UnauthorizedError("Missing authentication tokens");
			}

			try {
				let decoded;
				if (bearerToken) {
					// If using bearer token, verify it directly
					decoded = verify(bearerToken, process.env.SECRET!);
				} else {
					// Otherwise use the cookie-based tokens
					decoded = await getValidDecodedToken(controller, accessToken, refreshToken);
				}

				const user = await controller.getUserFromUsername(decoded.username);
				if (
					!user ||
					!roles.some((role) => user.roles.map((r) => r.toUpperCase()).includes(role.toUpperCase()))
				) {
					throw new ForbiddenError("Insufficient permissions");
				}

				return originalMethod.apply(this, args);
			} catch (error) {
				return controller.handleError(error);
			}
		};

		return descriptor;
	};
}
