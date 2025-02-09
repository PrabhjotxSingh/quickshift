import { UserRole } from "@shared/enum/user-role.enum";
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

			const { cookies, signedCookies } = req;
			const accessToken = signedCookies?.[BaseController.ACCESS_TOKEN_COOKIE_HEADER];
			const refreshToken = cookies?.[BaseController.REFRESH_TOKEN_COOKIE_HEADER];

			if (!accessToken || !refreshToken) {
				throw new UnauthorizedError("Missing authentication tokens");
			}

			try {
				const decoded = await getValidDecodedToken(controller, accessToken, refreshToken);

				const user = await controller.getUserFromUsername(decoded.username);
				if (!user || !user.roles.includes(role)) {
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
