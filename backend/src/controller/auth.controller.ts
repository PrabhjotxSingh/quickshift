import { Route, Post, Tags, Put, Body, Request } from "tsoa";
import { LoginRequest } from "@shared/dto/request/auth/login.request";
import { LoginResponse } from "@shared/dto/response/auth/login.response";
import { RefreshRequest } from "@shared/dto/request/auth/refresh.request";
import { BaseController } from "./base.controller";
import { AuthService } from "../core/service/auth.service";
import { RegisterRequest } from "@shared/dto/request/auth/register.request";
import { UserDto } from "@shared/dto/models/user.dto";
import { Authenticate } from "./decorators/auth.decorater";
import { UserRole } from "@shared/enum/user-role.enum";
import { Request as ExpressRequest } from "express";

@Route("Auth")
@Tags("Auth")
export class AuthController extends BaseController {
	constructor() {
		super();
	}

	@Post("Login")
	public async login(@Body() request: LoginRequest): Promise<LoginResponse | String> {
		try {
			const result = await this.authService.Login(request, this.getDeviceName());

			this.setTokenResponse(result);

			return this.ok(result);
		} catch (ex: any) {
			return this.handleError(ex);
		}
	}

	@Put("Refresh")
	public async refreshTokens(@Body() request: RefreshRequest): Promise<LoginResponse> {
		return this.internalServerError({
			success: false,
			refreshToken: "Not Implemented",
		});
	}

	@Post("Register")
	public async register(@Body() request: RegisterRequest): Promise<UserDto | string> {
		try {
			const result = await this.authService.register(request, false);

			return this.ok(result);
		} catch (ex: any) {
			return this.handleError(ex);
		}
	}

	@Post("Register/Admin")
	@Authenticate(UserRole.ADMIN)
	public async registerAdmin(@Body() request: RegisterRequest): Promise<UserDto | string> {
		try {
			const result = await this.authService.register(request, true);

			return this.ok(result);
		} catch (ex: any) {
			return this.handleError(ex);
		}
	}
}
