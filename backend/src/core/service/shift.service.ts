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
import mongoose, { FilterQuery, ObjectId, Types, Schema, Document } from "mongoose";
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
import { UserDocument, UserModel } from "../model/user.model";
import { ShiftUnavailableError } from "../error/ShiftUnavailableError";
import { ShiftApplicantDto } from "../dto/models/shift-applicant.dto";
import { ShiftApplicantModel } from "../model/shift-applicant.model";

@Service()
export class ShiftService {
	constructor(
		private companyRepository: CompanyRepository,
		private shiftRepository: ShiftRepository,
		private shiftApplicantRepository: ShiftApplicantRepository,
		private userRepository: UserRepository,
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

	public async getAvailableShifts(
		tags?: string[],
		userId?: string,
		skip: number = 0,
		limit: number = 20,
	): Promise<ShiftDto[]> {
		// Get all open shifts
		let query: FilterQuery<ShiftDocument> = { isOpen: true };

		if (tags && tags.length > 0) {
			query.tags = { $in: tags };
		}

		const shifts = await this.shiftRepository.getManyByQuery(query);

		// If userId is provided, filter out shifts the user has already applied to
		let availableShifts = shifts;

		if (userId) {
			// Filter out shifts the user has already applied to
			availableShifts = [];

			for (const shift of shifts) {
				// Check if user has already applied to this shift
				const existingApplication = await this.shiftApplicantRepository.getByQuery({
					user: new Types.ObjectId(userId),
					shiftId: shift._id,
				});

				// If no application exists, add this shift to available shifts
				if (!existingApplication) {
					availableShifts.push(shift);
				}
			}
		}

		// Apply pagination by slicing the array
		availableShifts = availableShifts.slice(skip, skip + limit);

		// Map to DTOs and populate company names
		const shiftDtos: ShiftDto[] = [];

		for (const shift of availableShifts) {
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

	public async getShiftApplications(shiftId: string): Promise<ShiftApplicantDto[]> {
		const applications = await this.shiftApplicantRepository.getManyByQuery({
			shiftId: shiftId,
			rejected: { $ne: true }, // Exclude rejected applications
		});
		if (applications == null) {
			throw new NotFoundError("Shift not found");
		}

		// Map to DTOs and populate user data
		const applicationDtos: ShiftApplicantDto[] = [];

		for (const application of applications) {
			const applicationDto = mapper.map(application, ShiftApplicantModel, ShiftApplicantDto);

			// Populate user data
			const user = await this.userRepository.get(application.user.toString());
			if (user) {
				applicationDto.userData = mapper.map(user, UserModel, UserDto);
			}

			applicationDtos.push(applicationDto);
		}

		return applicationDtos;
	}

	public async getShiftApplicantById(id: string): Promise<ShiftApplicantDocument> {
		const application = await this.shiftApplicantRepository.get(id);
		if (!application) {
			throw new NotFoundError("Application not found");
		}
		return application;
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
			return existingApplication;
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

	public async getPendingApplications(user: UserDocument): Promise<ShiftApplicantDto[]> {
		// Get all applications where the user is the applicant
		const applications = await this.shiftApplicantRepository.getManyByQuery({
			user: user._id,
		});

		// Map to DTOs and populate user data
		const applicationDtos: ShiftApplicantDto[] = [];

		for (const application of applications) {
			const applicationDto = mapper.map(application, ShiftApplicantModel, ShiftApplicantDto);

			// Populate user data
			const applicantUser = await this.userRepository.get(application.user.toString());
			if (applicantUser) {
				applicationDto.userData = mapper.map(applicantUser, UserModel, UserDto);
			}

			// Get and include shift data
			const shift = await this.shiftRepository.get(application.shiftId.toString());
			if (shift) {
				applicationDto.shift = mapper.map(shift, ShiftModel, ShiftDto);

				// Get company name for shift
				const company = await this.companyRepository.get(shift.company.toString());
				if (company) {
					applicationDto.shift.companyName = company.name;
				}
			}

			applicationDtos.push(applicationDto);
		}

		return applicationDtos;
	}

	public async denyShiftApplicant(applicationId: string, user: UserDocument): Promise<ShiftApplicantDocument> {
		const application = await this.shiftApplicantRepository.get(applicationId);
		if (!application) {
			throw new NotFoundError("Application not found");
		}

		// Get the shift to verify company access
		const shift = await this.shiftRepository.get(application.shiftId.toString());
		if (!shift) {
			throw new NotFoundError("Shift not found");
		}

		// Verify the shift belongs to the same company as the user
		if (shift.company.toString() !== application.company.toString()) {
			throw new Error("Shift and application company mismatch");
		}

		// Update the application to mark it as rejected
		application.rejected = true;
		const updatedApplication = await this.shiftApplicantRepository.update(applicationId, application);

		if (!updatedApplication) {
			throw new Error("Failed to update application");
		}

		return updatedApplication;
	}

	public async getUserTotalEarnings(userId: string): Promise<number> {
		// Get all completed shifts where the user was hired
		const completedShifts = await this.shiftRepository.getManyByQuery({
			userHired: new Types.ObjectId(userId),
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

	public async getCompanyIncompleteShifts(companyId: string): Promise<ShiftDto[]> {
		// Get all open shifts for the company and shifts that are not complete
		const shifts = await this.shiftRepository.getManyByQuery({
			company: companyId,
			$or: [{ isOpen: true }, { isOpen: false, isComplete: false }],
		});

		// Map to DTOs and populate company names and applicant data
		const shiftDtos: ShiftDto[] = [];

		// Collect all user IDs from all applications across all shifts
		const allUserIds: string[] = [];
		const shiftApplicationsMap = new Map<string, any[]>();

		for (const shift of shifts) {
			const shiftDto = mapper.map(shift, ShiftModel, ShiftDto);
			const shiftId = shift._id ? shift._id.toString() : "";

			// Populate the company name
			const company = await this.companyRepository.get(shift.company.toString());
			if (company) {
				shiftDto.companyName = company.name;
			}

			// Get applicants for this shift
			const applications = await this.shiftApplicantRepository.getManyByQuery({
				shiftId: shift._id,
				rejected: false,
			});

			// Store applications for this shift
			shiftApplicationsMap.set(shiftId, applications);

			// Collect user IDs
			applications.forEach((app) => {
				allUserIds.push(app.user.toString());
			});

			// Initialize applicants array
			shiftDto.applicants = [];
			shiftDtos.push(shiftDto);
		}

		// Fetch all user data in a single batch query
		const userDataMap = new Map<string, UserDto>();
		if (allUserIds.length > 0) {
			// Get unique user IDs
			const uniqueUserIds = [...new Set(allUserIds)];

			// Fetch all users in a single query
			const users = await this.userRepository.getManyByQuery({
				_id: { $in: uniqueUserIds.map((id) => new mongoose.Types.ObjectId(id)) },
			});

			// Create a map of user ID to user data
			users.forEach((user) => {
				const userDto = mapper.map(user, UserModel, UserDto);
				userDataMap.set(user._id.toString(), userDto);
			});
		}

		// Now populate the applicants with user data
		for (const shiftDto of shiftDtos) {
			const applications = shiftApplicationsMap.get(shiftDto._id) || [];

			for (const application of applications) {
				const applicationId = (application as any)._id?.toString() || "";
				const userId = application.user.toString();
				const userData = userDataMap.get(userId);

				shiftDto.applicants?.push({
					id: applicationId,
					userId: userId,
					userData: userData,
				});
			}
		}

		return shiftDtos;
	}

	async getUserEarningsByWeek(userId: string): Promise<{ week: string; earnings: number }[]> {
		try {
			// Get all completed shifts for the user
			const shifts = await this.shiftRepository.getManyByQuery({
				userHired: userId,
				isComplete: true,
			});

			if (!shifts || shifts.length === 0) {
				return [];
			}

			// Group earnings by week
			const earningsByWeek: { [key: string]: number } = {};

			shifts.forEach((shift: any) => {
				if (!shift.startTime || !shift.endTime) {
					console.warn("Skipping shift due to missing time data", shift);
					return;
				}
				const hoursWorked = this.calculateHoursWorked(shift.startTime, shift.endTime);
				// Use shift.pay if present; otherwise compute earnings
				const earnings =
					shift.pay !== undefined && shift.pay !== null ? shift.pay : hoursWorked * shift.rate;
				const week = this.getWeekNumber(shift.startTime);
				const weekKey = `Week ${week}`;
				earningsByWeek[weekKey] = (earningsByWeek[weekKey] || 0) + earnings;
			});

			// Convert to array format for the frontend
			return Object.entries(earningsByWeek)
				.map(([week, earnings]) => ({ week, earnings }))
				.sort((a, b) => {
					// Sort by week number
					const weekA = parseInt(a.week.split(" ")[1]);
					const weekB = parseInt(b.week.split(" ")[1]);
					return weekA - weekB;
				});
		} catch (error) {
			console.error("Error calculating earnings by week:", error);
			throw error;
		}
	}

	private calculateHoursWorked(startTime: Date, endTime: Date): number {
		const start = new Date(startTime);
		const end = new Date(endTime);
		const diffMs = end.getTime() - start.getTime();
		return diffMs / (1000 * 60 * 60); // Convert to hours
	}

	private getWeekNumber(date: Date): number {
		const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
		const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
		return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
	}
}
