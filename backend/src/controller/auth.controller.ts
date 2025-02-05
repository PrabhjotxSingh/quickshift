import { Route, Post, Tags, Put, Body } from "tsoa";
import { LoginRequest } from "../../../shared/src/dto/request/auth/login.request";
import { LoginResponse } from "../../../shared/src/dto/response/auth/login.response";
import { RefreshRequest } from "../../../shared/src/dto/request/auth/refresh.request";
import { BaseController } from "./base.controller";
import { AuthService } from "../core/service/auth.service";
import { RegisterRequest } from "../../../shared/src/dto/request/auth/register.request";
import { UserDto } from "../../../shared/src/dto/models/user.dto";

@Route("Auth")
@Tags("Auth")
export class AuthController extends BaseController {
	// TODO:
	// Change to be dependecy injection
	private readonly authService: AuthService = new AuthService();
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
			return this.handleException(ex);
		}
	}

	@Put("Refresh")
	public async refresh(@Body() request: RefreshRequest): Promise<LoginResponse> {
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
			return this.handleException(ex);
		}
	}

	@Post("Register/Admin")
	public async registerAdmin(@Body() request: RegisterRequest): Promise<UserDto | string> {
		try {
			const result = await this.authService.register(request, true);

			return this.ok(result);
		} catch (ex: any) {
			return this.handleException(ex);
		}
	}
}
