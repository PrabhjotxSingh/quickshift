import { Route, Post, Tags, Body, Query, Get, Delete, Patch } from "tsoa";
import { BaseController } from "./base.controller";
import { Authenticate, AuthenticateAny } from "./decorators/auth.decorater";
import { UserRole } from "shared/src/enum/user-role.enum";
import { CreateShiftRequest } from "shared/src/dto/request/shift/create-shift-request";
import { ShiftService } from "../core/service/shift.service";
import { ShiftDto } from "shared/src/dto/models/shift.dto";
import { AuthService } from "../core/service/auth.service";
import { Service } from "typedi";
import { ObjectId, Types } from "mongoose";
import { UserRepository } from "../core/repository/user.repository";
import { CompanyRepository } from "../core/repository/company.repository";
import { ForbiddenError } from "../core/error/ForbiddenError";
import { UserDocument } from "../core/model/user.model";

@Route("Shift")
@Tags("Shift")
@Service()
export class ShiftController extends BaseController {
	constructor(
		private shiftService: ShiftService,
		private companyRepository: CompanyRepository,
	) {
		super();
	}

	private async validateCompanyAccess(companyId: string, userId: string): Promise<void> {
		const company = await this.companyRepository.get(companyId);
		if (!company) {
			throw new Error("Company not found");
		}

		const isOwner = company.owner.toString() === userId;
		const isCompanyAdmin = company.companyAdmins.some((adminId) => adminId.toString() === userId);
		const isEmployer = (await this.getUser())?.roles.includes(UserRole.EMPLOYER);

		if (!isOwner && !isCompanyAdmin && !isEmployer) {
			throw new ForbiddenError("User does not have permission to manage this company");
		}
	}

	@Post()
	@AuthenticateAny([UserRole.EMPLOYER, UserRole.COMPANYADMIN])
	public async create(@Body() request: CreateShiftRequest): Promise<ShiftDto | string> {
		try {
			const user = await this.getUser();
			await this.validateCompanyAccess(request.company, user.id);
			return await this.shiftService.createShift(request);
		} catch (ex: any) {
			return this.handleError(ex);
		}
	}

	@Get()
	@Authenticate(UserRole.WORKER)
	public async get(@Query() id: string): Promise<ShiftDto | string> {
		try {
			return await this.shiftService.getShiftById(id);
		} catch (ex: any) {
			return this.handleError(ex);
		}
	}

	@Delete()
	@AuthenticateAny([UserRole.EMPLOYER, UserRole.COMPANYADMIN])
	public async delete(@Query() shiftId: string): Promise<string> {
		try {
			const user = await this.getUser();
			const shift = await this.shiftService.getShiftById(shiftId);
			if (typeof shift === "string") {
				throw new Error(shift);
			}
			await this.validateCompanyAccess(shift.company, user.id);
			await this.shiftService.deleteShift(shiftId);
			return this.ok("Successfully deleted Shift");
		} catch (ex: any) {
			return this.handleError(ex);
		}
	}

	@Patch()
	@AuthenticateAny([UserRole.EMPLOYER, UserRole.COMPANYADMIN])
	public async update(@Query() shiftId: string, @Body() request: CreateShiftRequest): Promise<ShiftDto | string> {
		try {
			const user = await this.getUser();
			const shift = await this.shiftService.getShiftById(shiftId);
			if (typeof shift === "string") {
				throw new Error(shift);
			}
			await this.validateCompanyAccess(shift.company, user.id);
			return await this.shiftService.updateShift(request, shiftId);
		} catch (ex: any) {
			return this.handleError(ex);
		}
	}

	@Get("User")
	@Authenticate(UserRole.WORKER)
	public async getUserShifts(@Query() getUpcoming: boolean) {
		try {
			const user = await this.getUser();
			return await this.shiftService.getUsersShifts(user.id, getUpcoming);
		} catch (ex: any) {
			return this.handleError(ex);
		}
	}

	@Get("Available")
	@Authenticate(UserRole.WORKER)
	public async getAvailableShifts(@Query() tags?: string[]) {
		try {
			const user = await this.getUser();
			return await this.shiftService.getAvailableShifts(tags);
		} catch (ex: any) {
			return this.handleError(ex);
		}
	}

	@Get("Applicants")
	@AuthenticateAny([UserRole.EMPLOYER, UserRole.COMPANYADMIN])
	public async getApplicants(@Query() shiftId: string) {
		try {
			const user = await this.getUser();
			const shift = await this.shiftService.getShiftById(shiftId);
			if (typeof shift === "string") {
				throw new Error(shift);
			}
			await this.validateCompanyAccess(shift.company, user.id);
			return await this.shiftService.getShiftApplications(shiftId);
		} catch (ex: any) {
			return this.handleError(ex);
		}
	}

	@Post("Apply")
	@Authenticate(UserRole.WORKER)
	public async applyToShift(@Query() shiftId: string) {
		try {
			const user = await this.getUser();
			return await this.shiftService.applyToShift(shiftId, user);
		} catch (ex: any) {
			return this.handleError(ex);
		}
	}
}
