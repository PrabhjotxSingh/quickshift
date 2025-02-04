import { Route, Post, Tags, Put, Body } from "tsoa";
import { loginRequest } from "../../../shared/src/dto/request/auth/loginRequest";
import { loginResponse } from "../../../shared/src/dto/response/auth/loginResponse";
import { refreshRequest } from "../../../shared/src/dto/request/auth/refreshRequest";
import { baseController } from "./baseController";

@Route("Auth")
@Tags("Auth")
export class authController extends baseController {
	@Post("Login")
	public async Login(@Body() request: loginRequest): Promise<loginResponse> {
		return this.InternalServerError({
			success: false,
			refreshToken: "Not Implemented",
		});
	}

	@Put("Refresh")
	public async Refresh(@Body() request: refreshRequest): Promise<loginResponse> {
		return this.InternalServerError({
			success: false,
			refreshToken: "Not Implemented",
		});
	}

	@Post("Register")
	public async Register(): Promise<loginResponse> {
		return this.InternalServerError({
			success: false,
			refreshToken: "Not Implemented",
		});
	}
}
