import { Route, Post, Tags, Put, Body, Request, Path, Query } from "tsoa";
import { BaseController } from "./base.controller";
import { UserDto } from "shared/src/dto/models/user.dto";
import { Authenticate } from "./decorators/auth.decorater";
import { UserRole } from "shared/src/enum/user-role.enum";
import { Request as ExpressRequest } from "express";
import { DebugUtil } from "../core/utility/misc/debug.util";
import { CreateCompanyRequest } from "shared/src/dto/request/company/create-company.request";
import { CompanyService } from "../core/service/company.service";
import { CompanyDto } from "shared/src/dto/models/company.dto";
import { AuthService } from "../core/service/auth.service";

@Route("Company")
@Tags("Company")
export class CompanyController extends BaseController {
	constructor(
		private companyService: CompanyService,
		authService: AuthService,
	) {
		super(authService);
	}

	@Post()
	public async create(@Body() request: CreateCompanyRequest): Promise<CompanyDto | string> {
		try {
			const user = await this.getUser();
			return await this.companyService.createCompany(request, user);
		} catch (ex: any) {
			return this.handleError(ex);
		}
	}
}
