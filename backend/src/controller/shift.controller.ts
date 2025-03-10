import { Route, Post, Tags, Body, Query, Get, Delete, Patch } from "tsoa";
import { BaseController } from "./base.controller";
import { Authenticate } from "./decorators/auth.decorater";
import { UserRole } from "shared/src/enum/user-role.enum";
import { CreateShiftRequest } from "shared/src/dto/request/shift/create-shift-request";
import { ShiftService } from "../core/service/shift.service";
import { ShiftDto } from "shared/src/dto/models/shift.dto";
import { AuthService } from "../core/service/auth.service";
import { Service } from "typedi";
import { ObjectId } from "mongoose";
import { UserRepository } from "../core/repository/user.repository";

@Route("Shift")
@Tags("Shift")
@Service()
export class ShiftController extends BaseController {
	constructor(private shiftService: ShiftService) {
		super();
	}

	@Post()
	@Authenticate(UserRole.WORKER)
	public async create(@Body() request: CreateShiftRequest): Promise<ShiftDto | string> {
		try {
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
	@Authenticate(UserRole.EMPLOYER)
	public async delete(@Query() shiftId: string): Promise<string> {
		try {
			await this.shiftService.deleteShift(shiftId);
			return this.ok("Succesfullt deleted Shift");
		} catch (ex: any) {
			return this.handleError(ex);
		}
	}

	@Patch()
	@Authenticate(UserRole.EMPLOYER)
	public async update(@Query() shiftId: string, @Body() request: CreateShiftRequest): Promise<ShiftDto | string> {
		try {
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
}
