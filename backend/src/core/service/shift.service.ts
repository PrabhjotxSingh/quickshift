import { UserDto } from "../dto/models/user.dto";
import { LoginRequest } from "../dto/request/auth/login.request";
import { RegisterRequest } from "../dto/request/auth/register.request";
import { LoginResponse } from "../dto/response/auth/login.response";
import { CompanyDocument } from "../model/company.model";
import { UserRole } from "../enum/user-role.enum";
import { RefreshTokenDocument, RefreshTokenModel } from "../model/refresh-token.model";
import { AlreadyExistsError } from "../error/AlreadyExistsError";
import { Repository } from "../repository/base.repository";
import { mapper } from "../utility/mapper/automapper.config";
import { DebugUtil } from "../utility/misc/debug.util";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";
import * as jwt from "jsonwebtoken";
import { NotFoundError } from "../error/NotFoundError";
import mongoose, { FilterQuery, ObjectId, Types, Schema } from "mongoose";
import { ShiftDocument, ShiftModel } from "../model/shift.model";
import { Service } from "typedi";
import { CreateShiftRequest } from "../dto/request/shift/create-shift-request";
import { ShiftDto } from "../dto/models/shift.dto";
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
		const company = await this.companyRepository.get(request.company);
		if (company == null) {
			throw new NotFoundError("Company not found");
		}

		const newShift = mapper.map(request, CreateShiftRequest, ShiftModel);
		newShift.isOpen = true;

		const createdShift = await this.shiftRepository.create(newShift);
		const shiftDto = mapper.map(createdShift, ShiftModel, ShiftDto);

		// Populate the company name
		shiftDto.companyName = company.name;

		return shiftDto;
	}

	public async getShiftById(id: string): Promise<ShiftDto> {
		const Shift = await this.shiftRepository.get(id);
		if (Shift == null) {
			throw new NotFoundError("Shift not found");
		}

		const shiftDto = mapper.map(Shift, ShiftModel, ShiftDto);

		// Populate the company name
		const company = await this.companyRepository.get(Shift.company);
		if (company) {
			shiftDto.companyName = company.name;
		}

		return shiftDto;
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
		const updatedShiftDoc = await this.shiftRepository.update(Shift.id, updatedShift);

		if (!updatedShiftDoc) {
			throw new NotFoundError("Failed to update shift");
		}

		const shiftDto = mapper.map(updatedShiftDoc, ShiftModel, ShiftDto);

		// Populate the company name
		const company = await this.companyRepository.get(updatedShiftDoc.company);
		if (company) {
			shiftDto.companyName = company.name;
		}

		return shiftDto;
	}

	public async getUserShift(user: CompanyDocument): Promise<ShiftDto> {
		const Shift = await this.shiftRepository.getByQuery({ owner: user.id });
		if (Shift == null) {
			throw new NotFoundError("Shift not found");
		}

		const shiftDto = mapper.map(Shift, ShiftModel, ShiftDto);

		// Populate the company name
		const company = await this.companyRepository.get(Shift.company);
		if (company) {
			shiftDto.companyName = company.name;
		}

		return shiftDto;
	}

	public async getAvailableShifts(tags?: string[]): Promise<ShiftDto[]> {
		let query: FilterQuery<ShiftDocument> = { isOpen: true };

		if (tags && tags.length > 0) {
			query.tags = { $in: tags };
		}

		const shifts = await this.shiftRepository.getManyByQuery(query);

		// Map to DTOs and populate company names
		const shiftDtos: ShiftDto[] = [];

		for (const shift of shifts) {
			const shiftDto = mapper.map(shift, ShiftModel, ShiftDto);

			// Populate the company name
			const company = await this.companyRepository.get(shift.company);
			if (company) {
				shiftDto.companyName = company.name;
			}

			shiftDtos.push(shiftDto);
		}

		return shiftDtos;
	}

	// Gets users shifts.
	// onlyUpcoming:
	//				true -> return only upcoming shifts
	//			 	false -> return all shifts
	public async getUsersShifts(userId: string, onlyUpcoming: boolean = false): Promise<ShiftDto[]> {
		let query: FilterQuery<ShiftDocument> = { userHired: new Types.ObjectId(userId) };

		if (onlyUpcoming) {
			const now = new Date();
			query.startTime = { $gt: now };
		}

		const shifts = await this.shiftRepository.getManyByQuery(query);

		// Map to DTOs and populate company names
		const shiftDtos: ShiftDto[] = [];

		for (const shift of shifts) {
			const shiftDto = mapper.map(shift, ShiftModel, ShiftDto);

			// Populate the company name
			const company = await this.companyRepository.get(shift.company);
			if (company) {
				shiftDto.companyName = company.name;
			}

			shiftDtos.push(shiftDto);
		}

		return shiftDtos;
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

		// Check if user has already applied
		const existingApplication = await this.shiftApplicantRepository.getByQuery({
			shiftId: shift._id as Types.ObjectId,
			user: user._id as Types.ObjectId,
		});

		if (existingApplication) {
			throw new AlreadyExistsError("User has already applied to this shift");
		}

		const newApplication = await this.shiftApplicantRepository.create({
			shiftId: shift._id as Types.ObjectId,
			user: user._id as Types.ObjectId,
			company: shift.company as Types.ObjectId,
		});

		return newApplication;
	}

	public async hireUserForShift(shiftId: string, userId: string): Promise<ShiftDto> {
		const shift = await this.shiftRepository.get(shiftId);
		if (!shift) {
			throw new NotFoundError("Shift not found");
		}

		if (!shift.isOpen) {
			throw new ShiftUnavailableError("Shift is not available for hiring");
		}

		shift.userHired = new mongoose.Types.ObjectId(userId);
		shift.isOpen = false;

		const updatedShift = await this.shiftRepository.update(shiftId, shift);
		if (!updatedShift) {
			throw new NotFoundError("Failed to update shift");
		}

		const shiftDto = mapper.map(updatedShift, ShiftModel, ShiftDto);

		// Populate the company name
		const company = await this.companyRepository.get(updatedShift.company);
		if (company) {
			shiftDto.companyName = company.name;
		}

		return shiftDto;
	}

	public async completeShiftWithRating(shiftId: string, rating: number): Promise<ShiftDto> {
		const shift = await this.shiftRepository.get(shiftId);
		if (!shift) {
			throw new NotFoundError("Shift not found");
		}

		if (shift.isComplete) {
			throw new Error("Shift is already completed");
		}

		if (rating < 0 || rating > 100) {
			throw new Error("Rating must be between 0 and 100");
		}

		shift.isComplete = true;
		shift.rating = rating;

		const updatedShift = await this.shiftRepository.update(shiftId, shift);
		if (!updatedShift) {
			throw new NotFoundError("Failed to update shift");
		}

		const shiftDto = mapper.map(updatedShift, ShiftModel, ShiftDto);

		// Populate the company name
		const company = await this.companyRepository.get(updatedShift.company);
		if (company) {
			shiftDto.companyName = company.name;
		}

		return shiftDto;
	}

	public async getPendingApplications(user: UserDocument): Promise<ShiftApplicantDocument[]> {
		// Get all open shifts
		const openShifts = await this.shiftRepository.getManyByQuery({ isOpen: true });
		if (!openShifts || openShifts.length === 0) {
			return [];
		}

		// Get all applications for these open shifts
		const shiftIds = openShifts.map((shift) => shift._id);
		const applications = await this.shiftApplicantRepository.getManyByQuery({
			shiftId: { $in: shiftIds },
		});

		// Filter applications to only those for companies the user has access to
		const filteredApplications = [];
		for (const application of applications) {
			try {
				const company = await this.companyRepository.get(application.company);
				if (!company) {
					continue;
				}

				const isAdmin = user.roles.includes(UserRole.ADMIN);
				if (isAdmin) {
					filteredApplications.push(application);
					continue;
				}

				const isOwner = company.owner.toString() === user.id;
				const isCompanyAdmin = company.companyAdmins.some((adminId) => adminId.toString() === user.id);
				const isEmployer = user.roles.includes(UserRole.EMPLOYER);

				if (isOwner || isCompanyAdmin || isEmployer) {
					filteredApplications.push(application);
				}
			} catch (error) {
				// Skip applications for companies the user doesn't have access to
				continue;
			}
		}

		return filteredApplications;
	}

	public async getUserTotalEarnings(userId: string): Promise<number> {
		// Get all completed shifts where the user was hired
		const completedShifts = await this.shiftRepository.getManyByQuery({
			userHired: userId,
			isComplete: true,
		});

		if (!completedShifts || completedShifts.length === 0) {
			return 0;
		}

		// Calculate total earnings
		const totalEarnings = completedShifts.reduce((total, shift) => {
			return total + shift.pay;
		}, 0);

		return totalEarnings;
	}
}
