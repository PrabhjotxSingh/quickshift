import { Route, Post, Tags, Put, Body, Request, Path, Query } from "tsoa";
import { BaseController } from "./base.controller";
import { UserDto } from "shared/src/dto/models/user.dto";
import { Authenticate } from "./decorators/auth.decorater";
import { UserRole } from "shared/src/enum/user-role.enum";
import { Request as ExpressRequest } from "express";
import { DebugUtil } from "../core/utility/misc/debug.util";
import { CreateCompanyRequest } from "shared/src/dto/request/company/create-company.request";

@Route("Company")
@Tags("Company")
export class CompanyController extends BaseController {
	constructor() {
		super();
	}

	@Post()
	public async login(@Body() request: CreateCompanyRequest): Promise<String> {
		try {
			DebugUtil.error(new Error("Not implemented"));
		} catch (ex: any) {
			DebugUtil.error(new Error("Not implemented"));
			return this.handleError(ex);
		}
	}
}
