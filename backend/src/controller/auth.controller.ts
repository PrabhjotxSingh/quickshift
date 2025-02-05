import { Route, Post, Tags, Put, Body } from "tsoa";
import { LoginRequest } from "../../../shared/src/dto/request/auth/login.request";
import { LoginResponse } from "../../../shared/src/dto/response/auth/login.response";
import { RefreshRequest } from "../../../shared/src/dto/request/auth/refresh.request";
import { baseController } from "./base.controller";

@Route("Auth")
@Tags("Auth")
export class authController extends baseController {
	@Post("Login")
	public async Login(@Body() request: LoginRequest): Promise<LoginResponse> {
		return this.InternalServerError({
			success: false,
			refreshToken: "Not Implemented",
		});
	}

	@Put("Refresh")
	public async Refresh(@Body() request: RefreshRequest): Promise<LoginResponse> {
		return this.InternalServerError({
			success: false,
			refreshToken: "Not Implemented",
		});
	}

	@Post("Register")
	public async Register(): Promise<LoginResponse> {
		return this.InternalServerError({
			success: false,
			refreshToken: "Not Implemented",
		});
	}
}
