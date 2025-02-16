import { Route, Post, Tags, Put, Body, Request, Path, Query, Get, Delete, Patch } from "tsoa";
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
import { Service } from "typedi";
import { ObjectId } from "mongoose";

@Route("Company")
@Tags("Company")
@Service()
export class CompanyController extends BaseController {
	constructor(
		private companyService: CompanyService,
		authService: AuthService,
	) {
		super(authService);
	}

	@Post()
	@Authenticate(UserRole.WORKER)
	public async create(@Body() request: CreateCompanyRequest): Promise<CompanyDto | string> {
		try {
			const user = await this.getUser();
			return await this.companyService.createCompany(request, user);
		} catch (ex: any) {
			return this.handleError(ex);
		}
	}

	@Get("id")
	@Authenticate(UserRole.WORKER)
	public async get(@Query() id: string): Promise<CompanyDto | string> {
		try {
			return await this.companyService.getCompanyById(id);
		} catch (ex: any) {
			return this.handleError(ex);
		}
	}

	/*
	 * Gets the user's own company
	 */
	@Get()
	@Authenticate(UserRole.EMPLOYER)
	public async getRequestingUserCompany(): Promise<CompanyDto | string> {
		try {
			const user = await this.getUser();
			return await this.companyService.getUserCompany(user);
		} catch (ex: any) {
			return this.handleError(ex);
		}
	}

	@Delete()
	@Authenticate(UserRole.EMPLOYER)
	public async delete(): Promise<string> {
		try {
			const user = await this.getUser();
			await this.companyService.deleteCompany(user);
			return this.ok("Succesfullt deleted company");
		} catch (ex: any) {
			return this.handleError(ex);
		}
	}

	@Patch()
	@Authenticate(UserRole.EMPLOYER)
	public async update(@Body() request: CreateCompanyRequest): Promise<CompanyDto | string> {
		try {
			const user = await this.getUser();
			return await this.companyService.updateCompany(request, user);
		} catch (ex: any) {
			return this.handleError(ex);
		}
	}
}
