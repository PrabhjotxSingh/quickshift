import { UserDto } from "shared/src/dto/models/user.dto";
import { LoginRequest } from "shared/src/dto/request/auth/login.request";
import { RegisterRequest } from "shared/src/dto/request/auth/register.request";
import { LoginResponse } from "shared/src/dto/response/auth/login.response";
import { CompanyDocument } from "../model/company.model";
import { UserRole } from "shared/src/enum/user-role.enum";
import { RefreshTokenDocument, RefreshTokenModel } from "../model/refresh-token.model";
import { AlreadyExistsError } from "../error/AlreadyExistsError";
import { Repository } from "../repository/base.repository";
import { mapper } from "../utility/mapper/automapper.config";
import { DebugUtil } from "../utility/misc/debug.util";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";
import * as jwt from "jsonwebtoken";
import { NotFoundError } from "../error/NotFoundError";
import mongoose, { FilterQuery, ObjectId, Types } from "mongoose";
import { ShiftDocument, ShiftModel } from "../model/shift.model";
import { Service } from "typedi";
import { CreateShiftRequest } from "shared/src/dto/request/shift/create-shift-request";
import { ShiftDto } from "shared/src/dto/models/shift.dto";
import { getRequestContext } from "../../controller/middleware/context.middleware";
import { UserRepository } from "../repository/user.repository";
import { ShiftRepository } from "../repository/shift.repository";
import { CompanyRepository } from "../repository/company.repository";
import { ShiftApplicantRepository } from "../repository/shift-applicant.repository";
import { ShiftApplicantDocument } from "../model/shift-applicant.model";
import { UserDocument } from "../model/user.model";
import { ShiftUnavailableError } from "../error/ShiftUnavailableError";

@Service()
export class ShiftService {
	constructor(
		private companyRepository: CompanyRepository,
		private shiftRepository: ShiftRepository,
		private shiftApplicantRepository: ShiftApplicantRepository,
	) {}

	public async createShift(request: CreateShiftRequest): Promise<ShiftDto> {
		const company = this.companyRepository.get(request.company);
		if (company == null) {
			throw new NotFoundError("Company not found");
		}

		const newShift = mapper.map(request, CreateShiftRequest, ShiftModel);
		newShift.isOpen = true;

		return mapper.map(await this.shiftRepository.create(newShift), ShiftModel, ShiftDto);
	}

	public async getShiftById(id: string): Promise<ShiftDto> {
		const Shift = await this.shiftRepository.get(id);
		if (Shift == null) {
			throw new NotFoundError("Shift not found");
		}

		return mapper.map(Shift, ShiftModel, ShiftDto);
	}

	public async deleteShift(id: string): Promise<void> {
		await this.shiftRepository.delete(id);
	}

	public async updateShift(request: CreateShiftRequest, shiftId: string): Promise<ShiftDto> {
		const Shift = await this.shiftRepository.get(shiftId);
		if (Shift == null) {
			throw new NotFoundError("Shift not found");
		}

		const updatedShift = mapper.map(request, CreateShiftRequest, ShiftModel);

		return mapper.map(await this.shiftRepository.update(Shift.id, updatedShift), ShiftModel, ShiftDto);
	}

	public async getUserShift(user: CompanyDocument): Promise<ShiftDto> {
		const Shift = await this.shiftRepository.getByQuery({ owner: user.id });
		if (Shift == null) {
			throw new NotFoundError("Shift not found");
		}

		return mapper.map(Shift, ShiftModel, ShiftDto);
	}

	public async getAvailableShifts(tags?: string[]): Promise<ShiftDocument[] | undefined> {
		let result;
		if (!tags || tags.length === 0) {
			result = await this.shiftRepository.getManyByQuery({ isOpen: true });
		} else {
			result = await this.shiftRepository.getManyByQuery({
				isOpen: true,
				tags: { $in: tags },
			});
		}

		return result;
	}

	// Gets users shifts.
	// onlyUpcoming:
	//				true -> return only upcoming shifts
	//			 	false -> return all shifts
	public async getUsersShifts(userId: string, onlyUpcoming: boolean = false) {
		let query: FilterQuery<ShiftDocument>;
		if (onlyUpcoming) {
			const currentTime = new Date();
			query = {
				userHired: userId,
				startTime: { $gt: currentTime },
			};
		} else {
			query = { userHired: userId };
		}
		return this.shiftRepository.getByQuery(query);
	}

	public async getShiftApplications(shiftId: string): Promise<ShiftApplicantDocument[]> {
		const shifts = await this.shiftApplicantRepository.getManyByQuery({ shiftId: shiftId });
		if (shifts == null) {
			throw new NotFoundError("Shift not found");
		}

		return shifts;
	}

	public async applyToShift(shiftId: string, user: UserDocument): Promise<ShiftApplicantDocument> {
		const shift = await this.shiftRepository.get(shiftId);
		if (!shift) {
			throw new NotFoundError("Shift not found");
		}

		if (!shift.isOpen) {
			throw new ShiftUnavailableError("Shift is not available for applications");
		}

		const newApplication = await this.shiftApplicantRepository.create({
			shiftId: shift._id as Types.ObjectId,
			user: user._id as Types.ObjectId,
			company: shift.company as Types.ObjectId,
		});

		return newApplication;
	}
}
