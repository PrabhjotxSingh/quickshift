import { Route, Post, Tags, Put, Body, Request, Path, Query } from "tsoa";
import { LoginRequest } from "../core/dto/request/auth/login.request";
import { LoginResponse } from "../core/dto/response/auth/login.response";
import { RefreshRequest } from "../core/dto/request/auth/refresh.request";
import { BaseController } from "./base.controller";
import { AuthService } from "../core/service/auth.service";
import { RegisterRequest } from "../core/dto/request/auth/register.request";
import { UserDto } from "../core/dto/models/user.dto";
import { Authenticate } from "./decorators/auth.decorater";
import { UserRole } from "../core/enum/user-role.enum";
import { Request as ExpressRequest } from "express";
import { DebugUtil } from "../core/utility/misc/debug.util";
import { Service } from "typedi";
import { UserRepository } from "../core/repository/user.repository";

@Route("Auth")
@Tags("Auth")
@Service()
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
