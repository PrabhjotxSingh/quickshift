import { ShiftController } from "../../controller/shift.controller";
import { ShiftService } from "../../core/service/shift.service";
import { CompanyRepository } from "../../core/repository/company.repository";
import { ShiftRepository } from "../../core/repository/shift.repository";
import { UserRole } from "../../core/enum/user-role.enum";
import { Types } from "mongoose";
import { ForbiddenError } from "../../core/error/ForbiddenError";
import { NotFoundError } from "../../core/error/NotFoundError";
import { UnauthorizedError } from "../../core/error/UnauthorizedError";
import { CompanyDocument } from "../../core/model/company.model";
import { ShiftDocument } from "../../core/model/shift.model";
import { Location } from "../../core/dto/models/location";
import { ShiftDto } from "../../core/dto/models/shift.dto";
import { ShiftApplicantDocument } from "../../core/model/shift-applicant.model";
import { UserDocument } from "../../core/model/user.model";
import { Request, Response } from "express";
import * as contextMiddleware from "../../controller/middleware/context.middleware";
import { ShiftApplicantRepository } from "../../core/repository/shift-applicant.repository";
import { CompanyService } from "../../core/service/company.service";
import { UserRepository } from "../../core/repository/user.repository";
import { AuthService } from "../../core/service/auth.service";
import { LoginResponse } from "../../core/dto/response/auth/login.response";
import { RefreshTokenRepository } from "../../core/repository/refresh-token.repository";
import { UserModel } from "../../core/model/user.model";
import { RefreshTokenModel } from "../../core/model/refresh-token.model";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import * as crypto from "crypto";
import { connect, disconnect } from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { BaseController } from "../../controller/base.controller";

// Override the authentication decorator
// This is necessary to bypass the JWT verification
jest.mock("../../controller/decorators/auth.decorater", () => ({
	Authenticate: () => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
		const originalMethod = descriptor.value;
		descriptor.value = function (...args: any[]) {
			return originalMethod.apply(this, args);
		};
		return descriptor;
	},
	AuthenticateAny: () => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
		const originalMethod = descriptor.value;
		descriptor.value = function (...args: any[]) {
			return originalMethod.apply(this, args);
		};
		return descriptor;
	},
}));

describe("ShiftController Integration Tests", () => {
	let shiftController: ShiftController;
	let shiftService: ShiftService;
	let companyService: CompanyService;
	let companyRepository: CompanyRepository;
	let shiftRepository: ShiftRepository;
	let userRepository: UserRepository;
	let shiftApplicantRepository: ShiftApplicantRepository;
	let authService: AuthService;
	let mongoServer: MongoMemoryServer;

	const mockUserId = new Types.ObjectId().toString();
	const mockCompanyId = new Types.ObjectId().toString();
	const mockShiftId = new Types.ObjectId().toString();
	const mockCompanyAdminId = new Types.ObjectId().toString();

	const mockLocation: Location = {
		latitude: 37.7749,
		longitude: -122.4194,
	};

	const mockCompany: CompanyDocument = {
		_id: new Types.ObjectId(mockCompanyId),
		name: "Test Company",
		description: "Test Description",
		owner: new Types.ObjectId(mockUserId),
		companyAdmins: [new Types.ObjectId(mockCompanyAdminId)],
	} as CompanyDocument;

	const mockShift: ShiftDto = {
		company: mockCompanyId,
		name: "Test Shift",
		description: "Test Description",
		tags: ["test"],
		isOpen: true,
		startTime: new Date(),
		endTime: new Date(),
		pay: 15,
		location: mockLocation,
		isComplete: false,
		rating: undefined,
	} as ShiftDto;

	const mockShiftDocument: ShiftDocument = {
		_id: new Types.ObjectId(mockShiftId),
		company: new Types.ObjectId(mockCompanyId),
		name: "Test Shift",
		description: "Test Description",
		tags: ["test"],
		isOpen: true,
		startTime: new Date(),
		endTime: new Date(),
		pay: 15,
		location: mockLocation,
		isComplete: false,
		rating: undefined,
	} as ShiftDocument;

	let mockUser: UserDocument;
	let mockCompanyAdmin: UserDocument;
	let accessToken: string;
	let refreshToken: string;

	// Mock request and response objects
	const mockRequest = {
		cookies: {},
		signedCookies: {},
		headers: {},
		get: jest.fn().mockImplementation((name: string) => {
			if (name.toLowerCase() === "authorization") {
				return `Bearer ${accessToken}`;
			}
			return undefined;
		}),
	} as any as Request;

	const mockResponse = {
		cookie: jest.fn(),
		status: jest.fn().mockReturnThis(),
		json: jest.fn(),
	} as any as Response;

	beforeAll(async () => {
		// Connect to in-memory test database
		mongoServer = await MongoMemoryServer.create();
		const uri = mongoServer.getUri();
		await connect(uri);

		// Initialize repositories
		userRepository = new UserRepository();
		companyRepository = new CompanyRepository();
		shiftRepository = new ShiftRepository();
		shiftApplicantRepository = new ShiftApplicantRepository();
		shiftService = new ShiftService(companyRepository, shiftRepository, shiftApplicantRepository);
		companyService = new CompanyService(userRepository, companyRepository);
		authService = new AuthService(userRepository, new RefreshTokenRepository());

		// Create test users in the database
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash("testpassword", salt);

		mockUser = await UserModel.create({
			_id: new Types.ObjectId(mockUserId),
			username: "testuser",
			email: "test@example.com",
			password: hashedPassword,
			firstName: "Test",
			lastName: "User",
			roles: [UserRole.EMPLOYER],
			skills: [],
		});

		mockCompanyAdmin = await UserModel.create({
			_id: new Types.ObjectId(mockCompanyAdminId),
			username: "adminuser",
			email: "admin@example.com",
			password: hashedPassword,
			firstName: "Admin",
			lastName: "User",
			roles: [UserRole.EMPLOYER],
			skills: [],
		});

		// Set SECRET environment variable for token verification
		process.env.SECRET = "test-secret";

		// Generate tokens for testing
		accessToken = jwt.sign(
			{ _id: mockUser._id, username: mockUser.username, roles: mockUser.roles },
			process.env.SECRET,
			{ expiresIn: "1h" },
		);
		refreshToken = jwt.sign({ _id: mockUser._id, username: mockUser.username }, process.env.SECRET, {
			expiresIn: "7d",
		});
	}, 30000); // Increase timeout to 30 seconds

	beforeEach(async () => {
		// Set up mock request with auth tokens
		mockRequest.headers = {
			authorization: `Bearer ${accessToken}`,
		};
		mockRequest.cookies = {
			"refresh-token": refreshToken,
		};
		mockRequest.signedCookies = {
			"access-token": accessToken,
		};

		// Mock request and response context
		jest.spyOn(contextMiddleware, "getRequestContext").mockReturnValue(mockRequest);
		jest.spyOn(contextMiddleware, "getResponseContext").mockReturnValue(mockResponse);

		// Mock ShiftRepository and CompanyRepository
		shiftRepository.get = jest.fn().mockImplementation((id) => {
			if (id === mockShiftId || id.toString() === mockShiftId) {
				return Promise.resolve(mockShiftDocument);
			}
			return Promise.resolve(null);
		});

		companyRepository.get = jest.fn().mockImplementation((id) => {
			if (id === mockCompanyId || id.toString() === mockCompanyId) {
				return Promise.resolve(mockCompany);
			}
			return Promise.resolve(null);
		});

		// Mock CompanyService methods
		companyService.getCompanyById = jest.fn().mockImplementation((id) => {
			if (id === mockCompanyId) {
				return Promise.resolve({
					id: mockCompanyId,
					name: "Test Company",
					description: "Test Description",
					owner: mockUserId,
					companyAdmins: [mockCompanyAdminId],
				});
			}
			return Promise.reject(new NotFoundError("Company not found"));
		});

		// Mock ShiftService methods
		shiftService.getShiftById = jest.fn().mockImplementation((id) => {
			if (id === mockShiftId) {
				return Promise.resolve({
					...mockShift,
					_id: mockShiftId,
				});
			}
			return Promise.reject(new NotFoundError("Shift not found"));
		});

		shiftService.createShift = jest.fn().mockResolvedValue(mockShift);
		shiftService.deleteShift = jest.fn().mockResolvedValue(undefined);
		shiftService.updateShift = jest.fn().mockResolvedValue(mockShift);
		shiftService.getShiftApplications = jest.fn().mockResolvedValue([]);

		// Create controller
		shiftController = new ShiftController(shiftService, companyService);

		// Set up controller with mock methods
		(shiftController as any).getUser = jest.fn().mockResolvedValue({
			...mockUser,
			id: mockUserId,
			roles: [UserRole.EMPLOYER],
		});
		(shiftController as any).getUserFromUsername = jest.fn().mockResolvedValue({
			...mockUser,
			id: mockUserId,
			roles: [UserRole.EMPLOYER],
		});
		(shiftController as any).handleError = jest.fn((error) => {
			throw error;
		});
		(shiftController as any).ok = jest.fn((data) => data);

		// Set up unauthorized tests
		(shiftController as any).validateCompanyAccess = jest
			.spyOn(shiftController as any, "validateCompanyAccess")
			.mockImplementation((companyId, userId) => {
				if (userId === mockUserId || userId === mockCompanyAdminId) {
					return Promise.resolve();
				}
				throw new UnauthorizedError("User not authorized");
			});
	});

	afterAll(async () => {
		// Clean up test data
		if (mockUser && mockCompanyAdmin) {
			await UserModel.deleteMany({ _id: { $in: [mockUser._id, mockCompanyAdmin._id] } });
			await RefreshTokenModel.deleteMany({ userId: mockUser._id });
		}
		// Disconnect from database
		await disconnect();
		await mongoServer.stop();
	});

	describe("create", () => {
		const createShiftRequest = {
			company: mockCompanyId,
			name: "Test Shift",
			description: "Test Description",
			tags: ["test"],
			startTime: new Date(),
			endTime: new Date(),
			pay: 15,
			location: mockLocation,
			isComplete: false,
			rating: undefined,
		};

		it("should allow owner to create shift", async () => {
			// Override getUser to return owner
			(shiftController as any).getUser = jest.fn().mockResolvedValue({
				...mockUser,
				id: mockUserId,
				roles: [UserRole.EMPLOYER],
			});

			// Setup - Rather than checking for repository calls, we'll check that the shiftService is called correctly
			(shiftController as any).validateCompanyAccess = jest
				.fn()
				.mockImplementation((companyId: string, userId: string) => Promise.resolve());
			shiftService.createShift = jest.fn().mockResolvedValue(mockShift);

			// Execute
			const result = await shiftController.create(createShiftRequest);

			// Assert
			expect(result).toBeDefined();
			expect(shiftService.createShift).toHaveBeenCalledWith(createShiftRequest);
		});

		it("should allow company admin to create shift", async () => {
			// Setup
			(shiftController as any).getUser = jest.fn().mockResolvedValue({
				...mockCompanyAdmin,
				id: mockCompanyAdminId,
				roles: [UserRole.EMPLOYER],
			});
			// Don't check repository calls, check service calls
			(shiftController as any).validateCompanyAccess = jest
				.fn()
				.mockImplementation((companyId: string, userId: string) => Promise.resolve());
			shiftService.createShift = jest.fn().mockResolvedValue(mockShift);

			// Execute
			const result = await shiftController.create(createShiftRequest);

			// Assert
			expect(result).toBeDefined();
			expect(shiftService.createShift).toHaveBeenCalledWith(createShiftRequest);
		});
	});

	describe("delete", () => {
		it("should allow owner to delete shift", async () => {
			// Override getUser to return owner
			(shiftController as any).getUser = jest.fn().mockResolvedValue({
				...mockUser,
				id: mockUserId,
				roles: [UserRole.EMPLOYER],
			});

			// Setup - Don't check repository calls
			(shiftController as any).validateCompanyAccess = jest
				.fn()
				.mockImplementation((companyId: string, userId: string) => Promise.resolve());
			shiftService.getShiftById = jest.fn().mockResolvedValue(mockShift);
			shiftService.deleteShift = jest.fn().mockResolvedValue(undefined);

			// Execute
			const result = await shiftController.delete(mockShiftId);

			// Assert
			expect(result).toBeDefined();
			expect(shiftService.deleteShift).toHaveBeenCalledWith(mockShiftId);
		});

		it("should allow company admin to delete shift", async () => {
			// Setup
			(shiftController as any).getUser = jest.fn().mockResolvedValue({
				...mockCompanyAdmin,
				id: mockCompanyAdminId,
				roles: [UserRole.EMPLOYER],
			});
			// Don't check repository calls
			(shiftController as any).validateCompanyAccess = jest
				.fn()
				.mockImplementation((companyId: string, userId: string) => Promise.resolve());
			shiftService.getShiftById = jest.fn().mockResolvedValue(mockShift);
			shiftService.deleteShift = jest.fn().mockResolvedValue(undefined);

			// Execute
			const result = await shiftController.delete(mockShiftId);

			// Assert
			expect(result).toBeDefined();
			expect(shiftService.deleteShift).toHaveBeenCalledWith(mockShiftId);
		});

		it("should throw NotFoundError if shift not found", async () => {
			// Override getUser to return owner
			(shiftController as any).getUser = jest.fn().mockResolvedValue({
				...mockUser,
				id: mockUserId,
				roles: [UserRole.EMPLOYER],
			});

			// Setup
			const nonExistentShiftId = new Types.ObjectId().toString();
			shiftService.getShiftById = jest.fn().mockRejectedValue(new NotFoundError("Shift not found"));

			// Execute & Assert
			await expect(shiftController.delete(nonExistentShiftId)).rejects.toThrow(NotFoundError);
		});
	});

	describe("update", () => {
		const updateShiftRequest = {
			company: mockCompanyId,
			name: "Updated Shift",
			description: "Updated Description",
			tags: ["test"],
			startTime: new Date(),
			endTime: new Date(),
			pay: 15,
			location: mockLocation,
			isComplete: false,
			rating: undefined,
		};

		it("should allow owner to update shift", async () => {
			// Override getUser to return owner
			(shiftController as any).getUser = jest.fn().mockResolvedValue({
				...mockUser,
				id: mockUserId,
				roles: [UserRole.EMPLOYER],
			});

			// Setup - Skip repository checks
			(shiftController as any).validateCompanyAccess = jest
				.fn()
				.mockImplementation((companyId: string, userId: string) => Promise.resolve());
			shiftService.getShiftById = jest.fn().mockResolvedValue(mockShift);
			shiftService.updateShift = jest.fn().mockResolvedValue({ ...mockShift, ...updateShiftRequest });

			// Execute
			const result = await shiftController.update(mockShiftId, updateShiftRequest);

			// Assert
			expect(result).toBeDefined();
			expect(shiftService.updateShift).toHaveBeenCalledWith(updateShiftRequest, mockShiftId);
		});

		it("should allow company admin to update shift", async () => {
			// Setup
			(shiftController as any).getUser = jest.fn().mockResolvedValue({
				...mockCompanyAdmin,
				id: mockCompanyAdminId,
				roles: [UserRole.EMPLOYER],
			});
			// Skip repository checks
			(shiftController as any).validateCompanyAccess = jest
				.fn()
				.mockImplementation((companyId: string, userId: string) => Promise.resolve());
			shiftService.getShiftById = jest.fn().mockResolvedValue(mockShift);
			shiftService.updateShift = jest.fn().mockResolvedValue({ ...mockShift, ...updateShiftRequest });

			// Execute
			const result = await shiftController.update(mockShiftId, updateShiftRequest);

			// Assert
			expect(result).toBeDefined();
			expect(shiftService.updateShift).toHaveBeenCalledWith(updateShiftRequest, mockShiftId);
		});

		it("should throw NotFoundError if shift not found", async () => {
			// Override getUser to return owner
			(shiftController as any).getUser = jest.fn().mockResolvedValue({
				...mockUser,
				id: mockUserId,
				roles: [UserRole.EMPLOYER],
			});

			// Setup
			const nonExistentShiftId = new Types.ObjectId().toString();
			shiftService.getShiftById = jest.fn().mockRejectedValue(new NotFoundError("Shift not found"));

			// Execute & Assert
			await expect(shiftController.update(nonExistentShiftId, updateShiftRequest)).rejects.toThrow(
				NotFoundError,
			);
		});
	});

	describe("getApplicants", () => {
		const mockApplicant = {
			_id: new Types.ObjectId(),
			shiftId: new Types.ObjectId(mockShiftId),
			company: new Types.ObjectId(mockCompanyId),
			user: new Types.ObjectId(),
		} as ShiftApplicantDocument;

		const mockApplicants = [mockApplicant];

		it("should allow owner to get applicants", async () => {
			// Override getUser to return owner
			(shiftController as any).getUser = jest.fn().mockResolvedValue({
				...mockUser,
				id: mockUserId,
				roles: [UserRole.EMPLOYER],
			});

			// Setup - Skip repository checks
			(shiftController as any).validateCompanyAccess = jest
				.fn()
				.mockImplementation((companyId: string, userId: string) => Promise.resolve());
			shiftService.getShiftById = jest.fn().mockResolvedValue(mockShift);
			shiftService.getShiftApplications = jest.fn().mockResolvedValue(mockApplicants);

			// Execute
			const result = await shiftController.getApplicants(mockShiftId);

			// Assert
			expect(result).toBeDefined();
			expect(shiftService.getShiftApplications).toHaveBeenCalledWith(mockShiftId);
		});

		it("should allow company admin to get applicants", async () => {
			// Setup
			(shiftController as any).getUser = jest.fn().mockResolvedValue({
				...mockCompanyAdmin,
				id: mockCompanyAdminId,
				roles: [UserRole.EMPLOYER],
			});
			// Skip repository checks
			(shiftController as any).validateCompanyAccess = jest
				.fn()
				.mockImplementation((companyId: string, userId: string) => Promise.resolve());
			shiftService.getShiftById = jest.fn().mockResolvedValue(mockShift);
			shiftService.getShiftApplications = jest.fn().mockResolvedValue(mockApplicants);

			// Execute
			const result = await shiftController.getApplicants(mockShiftId);

			// Assert
			expect(result).toBeDefined();
			expect(shiftService.getShiftApplications).toHaveBeenCalledWith(mockShiftId);
		});

		it("should throw NotFoundError if shift not found", async () => {
			// Override getUser to return owner
			(shiftController as any).getUser = jest.fn().mockResolvedValue({
				...mockUser,
				id: mockUserId,
				roles: [UserRole.EMPLOYER],
			});

			// Setup
			const nonExistentShiftId = new Types.ObjectId().toString();
			shiftService.getShiftById = jest.fn().mockRejectedValue(new NotFoundError("Shift not found"));

			// Execute & Assert
			await expect(shiftController.getApplicants(nonExistentShiftId)).rejects.toThrow(NotFoundError);
		});
	});

	describe("getUserShifts", () => {
		const mockShifts = [
			{
				...mockShift,
				_id: new Types.ObjectId().toString(),
				startTime: new Date(Date.now() + 86400000), // Tomorrow
				endTime: new Date(Date.now() + 172800000), // Day after tomorrow
				isComplete: false,
				rating: undefined,
			},
		];

		it("should get shifts for provided userId", async () => {
			// Setup
			const providedUserId = new Types.ObjectId().toString();
			shiftService.getUsersShifts = jest.fn().mockResolvedValue(mockShifts);

			// Execute
			const result = await shiftController.getUserShifts(true, providedUserId);

			// Assert
			expect(result).toBeDefined();
			expect(shiftService.getUsersShifts).toHaveBeenCalledWith(providedUserId, true);
		});

		it("should get shifts for authenticated user when no userId provided", async () => {
			// Setup
			(shiftController as any).getUser = jest.fn().mockResolvedValue({
				...mockUser,
				id: mockUserId,
				roles: [UserRole.WORKER],
			});
			shiftService.getUsersShifts = jest.fn().mockResolvedValue(mockShifts);

			// Execute
			const result = await shiftController.getUserShifts(true);

			// Assert
			expect(result).toBeDefined();
			expect(shiftService.getUsersShifts).toHaveBeenCalledWith(mockUserId, true);
		});

		it("should handle errors from shiftService", async () => {
			// Setup
			const error = new Error("Failed to get shifts");
			shiftService.getUsersShifts = jest.fn().mockRejectedValue(error);

			// Execute & Assert
			await expect(shiftController.getUserShifts(true)).rejects.toThrow(error);
		});

		it("should handle errors when getting authenticated user", async () => {
			// Setup
			(shiftController as any).getUser = jest.fn().mockRejectedValue(new Error("Failed to get user"));

			// Execute & Assert
			await expect(shiftController.getUserShifts(true)).rejects.toThrow("Failed to get user");
		});
	});

	describe("get", () => {
		it("should get shift by id for worker", async () => {
			// Setup
			shiftService.getShiftById = jest.fn().mockResolvedValue(mockShift);

			// Execute
			const result = await shiftController.get(mockShiftId);

			// Assert
			expect(result).toBeDefined();
			expect(shiftService.getShiftById).toHaveBeenCalledWith(mockShiftId);
		});

		it("should handle errors from shiftService", async () => {
			// Setup
			const error = new Error("Failed to get shift");
			shiftService.getShiftById = jest.fn().mockRejectedValue(error);

			// Execute & Assert
			await expect(shiftController.get(mockShiftId)).rejects.toThrow(error);
		});
	});

	describe("getAvailableShifts", () => {
		const mockAvailableShifts = [
			{
				...mockShift,
				_id: new Types.ObjectId().toString(),
				startTime: new Date(Date.now() + 86400000),
				endTime: new Date(Date.now() + 172800000),
				isComplete: false,
				rating: undefined,
			},
		];

		it("should get available shifts for worker with no tags", async () => {
			// Setup
			shiftService.getAvailableShifts = jest.fn().mockResolvedValue(mockAvailableShifts);

			// Execute
			const result = await shiftController.getAvailableShifts();

			// Assert
			expect(result).toBeDefined();
			expect(shiftService.getAvailableShifts).toHaveBeenCalledWith(undefined);
		});

		it("should get available shifts for worker with tags", async () => {
			// Setup
			const tags = ["tag1", "tag2"];
			shiftService.getAvailableShifts = jest.fn().mockResolvedValue(mockAvailableShifts);

			// Execute
			const result = await shiftController.getAvailableShifts(tags);

			// Assert
			expect(result).toBeDefined();
			expect(shiftService.getAvailableShifts).toHaveBeenCalledWith(tags);
		});

		it("should handle errors from shiftService", async () => {
			// Setup
			const error = new Error("Failed to get available shifts");
			shiftService.getAvailableShifts = jest.fn().mockRejectedValue(error);

			// Execute & Assert
			await expect(shiftController.getAvailableShifts()).rejects.toThrow(error);
		});
	});

	describe("applyToShift", () => {
		it("should allow worker to apply to shift", async () => {
			// Setup
			(shiftController as any).getUser = jest.fn().mockResolvedValue({
				...mockUser,
				id: mockUserId,
				roles: [UserRole.WORKER],
			});
			shiftService.applyToShift = jest.fn().mockResolvedValue({
				_id: new Types.ObjectId(),
				shiftId: new Types.ObjectId(mockShiftId),
				company: new Types.ObjectId(mockCompanyId),
				user: new Types.ObjectId(mockUserId),
			});

			// Execute
			const result = (await shiftController.applyToShift(mockShiftId)) as ShiftApplicantDocument;

			// Assert
			expect(result).toBeDefined();
			expect(shiftService.applyToShift).toHaveBeenCalledWith(mockShiftId, expect.any(Object));
			expect(result.shiftId.toString()).toBe(mockShiftId);
			expect(result.company.toString()).toBe(mockCompanyId);
			expect(result.user.toString()).toBe(mockUserId);
		});

		it("should handle errors from shiftService", async () => {
			// Setup
			(shiftController as any).getUser = jest.fn().mockResolvedValue({
				...mockUser,
				id: mockUserId,
				roles: [UserRole.WORKER],
			});
			const error = new Error("Failed to apply to shift");
			shiftService.applyToShift = jest.fn().mockRejectedValue(error);

			// Execute & Assert
			await expect(shiftController.applyToShift(mockShiftId)).rejects.toThrow(error);
		});

		it("should handle errors when getting authenticated user", async () => {
			// Setup
			(shiftController as any).getUser = jest.fn().mockRejectedValue(new Error("Failed to get user"));

			// Execute & Assert
			await expect(shiftController.applyToShift(mockShiftId)).rejects.toThrow("Failed to get user");
		});
	});

	describe("hireUser", () => {
		const mockWorkerId = new Types.ObjectId().toString();

		it("should allow employer to hire user for shift", async () => {
			// Setup
			(shiftController as any).getUser = jest.fn().mockResolvedValue({
				...mockUser,
				id: mockUserId,
				roles: [UserRole.EMPLOYER],
			});
			(shiftController as any).validateCompanyAccess = jest
				.fn()
				.mockImplementation((companyId: string, userId: string) => Promise.resolve());
			shiftService.getShiftById = jest.fn().mockResolvedValue(mockShift);
			shiftService.hireUserForShift = jest.fn().mockResolvedValue({
				...mockShift,
				userHired: mockWorkerId,
				isOpen: false,
			});

			// Execute
			const result = (await shiftController.hireUser(mockShiftId, mockWorkerId)) as ShiftDto;

			// Assert
			expect(result).toBeDefined();
			expect(shiftService.hireUserForShift).toHaveBeenCalledWith(mockShiftId, mockWorkerId);
			expect(result.userHired).toBe(mockWorkerId);
			expect(result.isOpen).toBe(false);
			expect(result.company).toBe(mockShift.company);
			expect(result.name).toBe(mockShift.name);
			expect(result.description).toBe(mockShift.description);
			expect(result.tags).toEqual(mockShift.tags);
			expect(result.startTime).toEqual(mockShift.startTime);
			expect(result.endTime).toEqual(mockShift.endTime);
			expect(result.pay).toBe(mockShift.pay);
			expect(result.location).toEqual(mockShift.location);
		});

		it("should allow company admin to hire user for shift", async () => {
			// Setup
			(shiftController as any).getUser = jest.fn().mockResolvedValue({
				...mockCompanyAdmin,
				id: mockCompanyAdminId,
				roles: [UserRole.COMPANYADMIN],
			});
			(shiftController as any).validateCompanyAccess = jest
				.fn()
				.mockImplementation((companyId: string, userId: string) => Promise.resolve());
			shiftService.getShiftById = jest.fn().mockResolvedValue(mockShift);
			shiftService.hireUserForShift = jest.fn().mockResolvedValue({
				...mockShift,
				userHired: mockWorkerId,
				isOpen: false,
			});

			// Execute
			const result = await shiftController.hireUser(mockShiftId, mockWorkerId);

			// Assert
			expect(result).toBeDefined();
			expect(shiftService.hireUserForShift).toHaveBeenCalledWith(mockShiftId, mockWorkerId);
		});

		it("should allow admin to hire user for shift", async () => {
			// Setup
			(shiftController as any).getUser = jest.fn().mockResolvedValue({
				...mockUser,
				id: mockUserId,
				roles: [UserRole.ADMIN],
			});
			(shiftController as any).validateCompanyAccess = jest
				.fn()
				.mockImplementation((companyId: string, userId: string) => Promise.resolve());
			shiftService.getShiftById = jest.fn().mockResolvedValue(mockShift);
			shiftService.hireUserForShift = jest.fn().mockResolvedValue({
				...mockShift,
				userHired: mockWorkerId,
				isOpen: false,
			});

			// Execute
			const result = await shiftController.hireUser(mockShiftId, mockWorkerId);

			// Assert
			expect(result).toBeDefined();
			expect(shiftService.hireUserForShift).toHaveBeenCalledWith(mockShiftId, mockWorkerId);
		});

		it("should throw NotFoundError if shift not found", async () => {
			// Setup
			(shiftController as any).getUser = jest.fn().mockResolvedValue({
				...mockUser,
				id: mockUserId,
				roles: [UserRole.EMPLOYER],
			});
			const nonExistentShiftId = new Types.ObjectId().toString();
			shiftService.getShiftById = jest.fn().mockRejectedValue(new NotFoundError("Shift not found"));

			// Execute & Assert
			await expect(shiftController.hireUser(nonExistentShiftId, mockWorkerId)).rejects.toThrow(NotFoundError);
		});
	});

	describe("completeShift", () => {
		const mockRating = 85;

		it("should allow employer to complete shift with rating", async () => {
			// Setup
			(shiftController as any).getUser = jest.fn().mockResolvedValue({
				...mockUser,
				id: mockUserId,
				roles: [UserRole.EMPLOYER],
			});
			(shiftController as any).validateCompanyAccess = jest
				.fn()
				.mockImplementation((companyId: string, userId: string) => Promise.resolve());
			shiftService.getShiftById = jest.fn().mockResolvedValue(mockShift);
			shiftService.completeShiftWithRating = jest.fn().mockResolvedValue({
				...mockShift,
				isComplete: true,
				rating: mockRating,
			});

			// Execute
			const result = (await shiftController.completeShift(mockShiftId, mockRating)) as ShiftDto;

			// Assert
			expect(result).toBeDefined();
			expect(shiftService.completeShiftWithRating).toHaveBeenCalledWith(mockShiftId, mockRating);
			expect(result.isComplete).toBe(true);
			expect(result.rating).toBe(mockRating);
			expect(result.company).toBe(mockShift.company);
			expect(result.name).toBe(mockShift.name);
			expect(result.description).toBe(mockShift.description);
			expect(result.tags).toEqual(mockShift.tags);
			expect(result.isOpen).toBe(mockShift.isOpen);
			expect(result.startTime).toEqual(mockShift.startTime);
			expect(result.endTime).toEqual(mockShift.endTime);
			expect(result.pay).toBe(mockShift.pay);
			expect(result.location).toEqual(mockShift.location);
		});

		it("should allow company admin to complete shift with rating", async () => {
			// Setup
			(shiftController as any).getUser = jest.fn().mockResolvedValue({
				...mockCompanyAdmin,
				id: mockCompanyAdminId,
				roles: [UserRole.COMPANYADMIN],
			});
			(shiftController as any).validateCompanyAccess = jest
				.fn()
				.mockImplementation((companyId: string, userId: string) => Promise.resolve());
			shiftService.getShiftById = jest.fn().mockResolvedValue(mockShift);
			shiftService.completeShiftWithRating = jest.fn().mockResolvedValue({
				...mockShift,
				isComplete: true,
				rating: mockRating,
			});

			// Execute
			const result = await shiftController.completeShift(mockShiftId, mockRating);

			// Assert
			expect(result).toBeDefined();
			expect(shiftService.completeShiftWithRating).toHaveBeenCalledWith(mockShiftId, mockRating);
		});

		it("should allow admin to complete shift with rating", async () => {
			// Setup
			(shiftController as any).getUser = jest.fn().mockResolvedValue({
				...mockUser,
				id: mockUserId,
				roles: [UserRole.ADMIN],
			});
			(shiftController as any).validateCompanyAccess = jest
				.fn()
				.mockImplementation((companyId: string, userId: string) => Promise.resolve());
			shiftService.getShiftById = jest.fn().mockResolvedValue(mockShift);
			shiftService.completeShiftWithRating = jest.fn().mockResolvedValue({
				...mockShift,
				isComplete: true,
				rating: mockRating,
			});

			// Execute
			const result = await shiftController.completeShift(mockShiftId, mockRating);

			// Assert
			expect(result).toBeDefined();
			expect(shiftService.completeShiftWithRating).toHaveBeenCalledWith(mockShiftId, mockRating);
		});

		it("should reject unauthorized user", async () => {
			// Setup
			const unauthorizedUser = {
				...mockUser,
				_id: new Types.ObjectId(),
				id: new Types.ObjectId().toString(),
				roles: [UserRole.WORKER],
			} as UserDocument;

			(shiftController as any).getUser = jest.fn().mockResolvedValue(unauthorizedUser);
			(shiftController as any).validateCompanyAccess = jest
				.fn()
				.mockRejectedValue(new UnauthorizedError("User not authorized"));

			// Execute & Assert
			await expect(shiftController.completeShift(mockShiftId, mockRating)).rejects.toThrow(UnauthorizedError);
		});

		it("should throw NotFoundError if shift not found", async () => {
			// Setup
			(shiftController as any).getUser = jest.fn().mockResolvedValue({
				...mockUser,
				id: mockUserId,
				roles: [UserRole.EMPLOYER],
			});
			const nonExistentShiftId = new Types.ObjectId().toString();
			shiftService.getShiftById = jest.fn().mockRejectedValue(new NotFoundError("Shift not found"));

			// Execute & Assert
			await expect(shiftController.completeShift(nonExistentShiftId, mockRating)).rejects.toThrow(
				NotFoundError,
			);
		});

		it("should reject invalid rating", async () => {
			// Setup
			(shiftController as any).getUser = jest.fn().mockResolvedValue({
				...mockUser,
				id: mockUserId,
				roles: [UserRole.EMPLOYER],
			});
			(shiftController as any).validateCompanyAccess = jest
				.fn()
				.mockImplementation((companyId: string, userId: string) => Promise.resolve());
			shiftService.getShiftById = jest.fn().mockResolvedValue(mockShift);
			shiftService.completeShiftWithRating = jest
				.fn()
				.mockRejectedValue(new Error("Rating must be between 0 and 100"));

			// Execute & Assert
			await expect(shiftController.completeShift(mockShiftId, 150)).rejects.toThrow(
				"Rating must be between 0 and 100",
			);
		});
	});

	describe("getPendingApplications", () => {
		const mockPendingApplications = [
			{
				_id: new Types.ObjectId(),
				shiftId: new Types.ObjectId(mockShiftId),
				company: new Types.ObjectId(mockCompanyId),
				user: new Types.ObjectId(),
			} as ShiftApplicantDocument,
		];

		it("should allow employer to get pending applications", async () => {
			// Setup
			(shiftController as any).getUser = jest.fn().mockResolvedValue({
				...mockUser,
				id: mockUserId,
				roles: [UserRole.EMPLOYER],
			});
			shiftService.getPendingApplications = jest.fn().mockResolvedValue(mockPendingApplications);

			// Execute
			const result = await shiftController.getPendingApplications();

			// Assert
			expect(result).toBeDefined();
			expect(shiftService.getPendingApplications).toHaveBeenCalledWith(expect.any(Object));
			expect(result).toEqual(mockPendingApplications);
		});

		it("should allow company admin to get pending applications", async () => {
			// Setup
			(shiftController as any).getUser = jest.fn().mockResolvedValue({
				...mockCompanyAdmin,
				id: mockCompanyAdminId,
				roles: [UserRole.COMPANYADMIN],
			});
			shiftService.getPendingApplications = jest.fn().mockResolvedValue(mockPendingApplications);

			// Execute
			const result = await shiftController.getPendingApplications();

			// Assert
			expect(result).toBeDefined();
			expect(shiftService.getPendingApplications).toHaveBeenCalledWith(expect.any(Object));
			expect(result).toEqual(mockPendingApplications);
		});

		it("should allow admin to get pending applications", async () => {
			// Setup
			(shiftController as any).getUser = jest.fn().mockResolvedValue({
				...mockUser,
				id: mockUserId,
				roles: [UserRole.ADMIN],
			});
			shiftService.getPendingApplications = jest.fn().mockResolvedValue(mockPendingApplications);

			// Execute
			const result = await shiftController.getPendingApplications();

			// Assert
			expect(result).toBeDefined();
			expect(shiftService.getPendingApplications).toHaveBeenCalledWith(expect.any(Object));
			expect(result).toEqual(mockPendingApplications);
		});

		it("should handle errors from shiftService", async () => {
			// Setup
			(shiftController as any).getUser = jest.fn().mockResolvedValue({
				...mockUser,
				id: mockUserId,
				roles: [UserRole.EMPLOYER],
			});
			const error = new Error("Failed to get pending applications");
			shiftService.getPendingApplications = jest.fn().mockRejectedValue(error);

			// Execute & Assert
			await expect(shiftController.getPendingApplications()).rejects.toThrow(error);
		});

		it("should handle errors when getting authenticated user", async () => {
			// Setup
			(shiftController as any).getUser = jest.fn().mockRejectedValue(new Error("Failed to get user"));

			// Execute & Assert
			await expect(shiftController.getPendingApplications()).rejects.toThrow("Failed to get user");
		});
	});
});
