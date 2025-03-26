import { AuthService } from "../../core/service/auth.service";
import { UserRepository } from "../../core/repository/user.repository";
import { RefreshTokenRepository } from "../../core/repository/refresh-token.repository";
import { UserDto } from "shared/src/dto/models/user.dto";
import { LoginRequest } from "shared/src/dto/request/auth/login.request";
import { RegisterRequest } from "shared/src/dto/request/auth/register.request";
import { UserRole } from "shared/src/enum/user-role.enum";
import { AlreadyExistsError } from "../../core/error/AlreadyExistsError";
import { NotFoundError } from "../../core/error/NotFoundError";
import { Types, Schema, Model } from "mongoose";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import * as crypto from "crypto";
import { RefreshTokenDocument } from "../../core/model/refresh-token.model";
import { UserDocument } from "../../core/model/user.model";

// Mock dependencies
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("crypto");

// Mock automapper
jest.mock("../../../src/core/utility/mapper/automapper.config", () => ({
	mapper: {
		map: jest.fn().mockImplementation((source, sourceType, destinationType) => {
			if (sourceType === "RegisterRequest" && destinationType === "UserDto") {
				return {
					...source,
					roles: [UserRole.WORKER],
					skills: [],
				};
			}
			if (sourceType === "UserModel" && destinationType === "UserDto") {
				return {
					...source,
					roles: source.roles || [UserRole.WORKER],
					skills: source.skills || [],
				};
			}
			return source;
		}),
	},
}));

// Mock mongoose
jest.mock("mongoose", () => {
	const actualMongoose = jest.requireActual("mongoose");
	return {
		...actualMongoose,
		Types: {
			ObjectId: jest.fn().mockImplementation(() => ({
				toString: () => "mockObjectId",
			})),
		},
		Schema: class Schema {
			constructor() {
				return {
					Types: {
						ObjectId: jest.fn().mockImplementation(() => ({
							toString: () => "mockObjectId",
						})),
					},
				};
			}
		},
		model: jest.fn().mockImplementation((name) => {
			if (name === "User") {
				return {
					findOne: jest.fn(),
					find: jest.fn(),
					create: jest.fn(),
					updateOne: jest.fn(),
					deleteOne: jest.fn(),
					findById: jest.fn(),
					findByIdAndDelete: jest.fn(),
					findOneAndUpdate: jest.fn(),
				};
			} else if (name === "RefreshToken") {
				return {
					findOne: jest.fn(),
					find: jest.fn(),
					create: jest.fn(),
					updateOne: jest.fn(),
					deleteOne: jest.fn(),
					deleteMany: jest.fn(),
					findById: jest.fn(),
					findByIdAndDelete: jest.fn(),
					findOneAndUpdate: jest.fn(),
				};
			}
			return {};
		}),
	};
});

// Mock repositories
jest.mock("../../../src/core/repository/user.repository", () => {
	return {
		UserRepository: jest.fn().mockImplementation(() => ({
			getByQuery: jest.fn(),
			create: jest.fn(),
			delete: jest.fn(),
			get: jest.fn(),
			update: jest.fn(),
		})),
	};
});

jest.mock("../../../src/core/repository/refresh-token.repository", () => {
	return {
		RefreshTokenRepository: jest.fn().mockImplementation(() => ({
			getByQuery: jest.fn(),
			create: jest.fn(),
			deleteByQuery: jest.fn(),
			deleteManyByQuery: jest.fn(),
			get: jest.fn(),
			update: jest.fn(),
		})),
	};
});

// Mock models
jest.mock("../../../src/core/model/user.model", () => ({
	UserModel: {
		findOne: jest.fn(),
		find: jest.fn(),
		create: jest.fn(),
		updateOne: jest.fn(),
		deleteOne: jest.fn(),
		findById: jest.fn(),
		findByIdAndDelete: jest.fn(),
		findOneAndUpdate: jest.fn(),
	},
}));

jest.mock("../../../src/core/model/refresh-token.model", () => ({
	RefreshTokenModel: {
		findOne: jest.fn(),
		find: jest.fn(),
		create: jest.fn(),
		updateOne: jest.fn(),
		deleteOne: jest.fn(),
		deleteMany: jest.fn(),
		findById: jest.fn(),
		findByIdAndDelete: jest.fn(),
		findOneAndUpdate: jest.fn(),
	},
	RefreshTokenDocument: jest.fn(),
}));

describe("AuthService", () => {
	let authService: AuthService;
	let mockUserRepository: jest.Mocked<UserRepository>;
	let mockRefreshTokenRepository: jest.Mocked<RefreshTokenRepository>;

	const mockUserId = new Types.ObjectId();
	const mockUser: UserDto & { id?: string } = {
		id: mockUserId.toString(),
		username: "testuser",
		email: "test@example.com",
		password: "hashedPassword",
		firstName: "Test",
		lastName: "User",
		roles: [UserRole.WORKER],
		skills: [],
	};

	const mockRefreshToken: RefreshTokenDocument = {
		_id: new Types.ObjectId(),
		token: "mockRefreshToken",
		userId: mockUserId,
		device: "testDevice",
		expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
		$assertPopulated: jest.fn(),
		$clearModifiedPaths: jest.fn(),
		$clone: jest.fn(),
		$getAllSubdocs: jest.fn(),
		$getPopulatedDocs: jest.fn(),
		$inc: jest.fn(),
		$isDefault: jest.fn(),
		$isDeleted: jest.fn(),
		$isNew: jest.fn(),
		$isValid: jest.fn(),
		$locals: {},
		$markValid: jest.fn(),
		$model: jest.fn(),
		$op: null,
		$session: jest.fn(),
		$set: jest.fn(),
		$setDefaults: jest.fn(),
		$where: {},
		collection: {} as any,
		db: {} as any,
		delete: jest.fn(),
		deleteOne: jest.fn(),
		depopulate: jest.fn(),
		directModifiedPaths: jest.fn(),
		equals: jest.fn(),
		errors: {},
		get: jest.fn(),
		increment: jest.fn(),
		init: jest.fn(),
		isDirectModifiedPaths: jest.fn(),
		isDirectSelected: jest.fn(),
		isInit: jest.fn(),
		isModified: jest.fn(),
		isNew: jest.fn(),
		isSelected: jest.fn(),
		isValid: jest.fn(),
		markModified: jest.fn(),
		modelName: "",
		overwrite: jest.fn(),
		populate: jest.fn(),
		remove: jest.fn(),
		replaceOne: jest.fn(),
		schema: {} as any,
		set: jest.fn(),
		toJSON: jest.fn(),
		toObject: jest.fn(),
		unmarkModified: jest.fn(),
		update: jest.fn(),
		updateOne: jest.fn(),
	} as any;

	beforeEach(() => {
		// Clear all mocks
		jest.clearAllMocks();

		// Setup repository mocks
		mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;
		mockRefreshTokenRepository = new RefreshTokenRepository() as jest.Mocked<RefreshTokenRepository>;

		// Setup bcrypt mocks
		(bcrypt.genSalt as jest.Mock).mockResolvedValue("mockSalt");
		(bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
		(bcrypt.compare as jest.Mock).mockResolvedValue(true);

		// Setup jwt mock
		(jwt.sign as jest.Mock).mockReturnValue("mockAccessToken");

		// Setup crypto mock
		(crypto.randomBytes as jest.Mock).mockReturnValue({ toString: () => "mockRefreshToken" });

		authService = new AuthService(mockUserRepository, mockRefreshTokenRepository);
	});

	describe("register", () => {
		const registerRequest: RegisterRequest = {
			username: "testuser",
			email: "test@example.com",
			password: "password123",
			birthday: new Date(),
			firstName: "Test",
			lastName: "User",
		};

		it("should register a new user successfully", async () => {
			// Mock repository responses
			mockUserRepository.getByQuery.mockResolvedValue(null);
			mockUserRepository.create.mockResolvedValue({ ...mockUser, id: mockUserId.toString() } as any);

			const result = await authService.register(registerRequest);

			expect(mockUserRepository.getByQuery).toHaveBeenCalledWith({
				$or: [{ username: registerRequest.username }, { email: registerRequest.email }],
			});
			expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
			expect(bcrypt.hash).toHaveBeenCalledWith("password123", "mockSalt");
			expect(mockUserRepository.create).toHaveBeenCalled();
			expect(result).toEqual(mockUser);
		});

		it("should throw AlreadyExistsError if user exists", async () => {
			mockUserRepository.getByQuery.mockResolvedValue(mockUser as any);

			await expect(authService.register(registerRequest)).rejects.toThrow(AlreadyExistsError);
		});

		it("should register an admin user when isAdmin is true", async () => {
			mockUserRepository.getByQuery.mockResolvedValue(null);
			mockUserRepository.create.mockResolvedValue({
				...mockUser,
				roles: [UserRole.ADMIN, UserRole.WORKER],
			} as any);

			const result = await authService.register(registerRequest, true);

			expect(result.roles).toContain(UserRole.ADMIN);
		});
	});

	describe("Login", () => {
		const loginRequest: LoginRequest = {
			username: "testuser",
			password: "password123",
		};

		it("should login successfully with valid credentials", async () => {
			mockUserRepository.getByQuery.mockResolvedValue(mockUser as any);
			mockRefreshTokenRepository.create.mockResolvedValue(mockRefreshToken);

			const result = await authService.Login(loginRequest, "testDevice");

			expect(mockUserRepository.getByQuery).toHaveBeenCalledWith({ username: loginRequest.username });
			expect(bcrypt.compare).toHaveBeenCalledWith(loginRequest.password, mockUser.password);
			expect(jwt.sign).toHaveBeenCalled();
			expect(result).toEqual({
				accessToken: "mockAccessToken",
				refreshToken: mockRefreshToken.token,
				user: mockUser,
			});
		});

		it("should throw NotFoundError with invalid username", async () => {
			mockUserRepository.getByQuery.mockResolvedValue(null);

			await expect(authService.Login(loginRequest, "testDevice")).rejects.toThrow(NotFoundError);
		});

		it("should throw NotFoundError with invalid password", async () => {
			mockUserRepository.getByQuery.mockResolvedValue(mockUser as any);
			(bcrypt.compare as jest.Mock).mockResolvedValue(false);

			await expect(authService.Login(loginRequest, "testDevice")).rejects.toThrow(NotFoundError);
		});
	});

	describe("deleteUser", () => {
		it("should delete user and associated refresh tokens", async () => {
			const userWithId = { ...mockUser, id: mockUserId.toString() };
			mockUserRepository.getByQuery.mockResolvedValue(userWithId as any);
			mockUserRepository.delete.mockResolvedValue(userWithId as any);
			mockRefreshTokenRepository.deleteManyByQuery.mockResolvedValue(undefined);

			await authService.deleteUser(mockUser.username);

			expect(mockUserRepository.getByQuery).toHaveBeenCalledWith({ userId: mockUser.username });
			expect(mockUserRepository.delete).toHaveBeenCalledWith(mockUserId.toString());
			expect(mockRefreshTokenRepository.deleteManyByQuery).toHaveBeenCalledWith({
				userId: mockUserId.toString(),
			});
		});

		it("should not throw error if user does not exist", async () => {
			mockUserRepository.getByQuery.mockResolvedValue(null);

			await expect(authService.deleteUser("nonexistent")).resolves.not.toThrow();
		});
	});

	describe("refresh", () => {
		it("should refresh token successfully", async () => {
			mockRefreshTokenRepository.getByQuery.mockResolvedValue(mockRefreshToken);
			mockUserRepository.get.mockResolvedValue({ ...mockUser, id: mockUserId.toString() } as any);
			mockRefreshTokenRepository.deleteByQuery.mockResolvedValue(mockRefreshToken);
			mockRefreshTokenRepository.create.mockResolvedValue(mockRefreshToken);

			const result = await authService.refresh("mockRefreshToken", "testDevice");

			expect(mockRefreshTokenRepository.getByQuery).toHaveBeenCalledWith({ token: "mockRefreshToken" });
			expect(mockUserRepository.get).toHaveBeenCalledWith(mockUserId);
			expect(jwt.sign).toHaveBeenCalled();
			expect(result).toEqual({
				accessToken: "mockAccessToken",
				refreshToken: mockRefreshToken.token,
				user: mockUser,
			});
		});

		it("should throw error for invalid refresh token", async () => {
			mockRefreshTokenRepository.getByQuery.mockResolvedValue(null);

			await expect(authService.refresh("invalidToken", "testDevice")).rejects.toThrow("Invalid refresh token");
		});

		it("should throw error for expired refresh token", async () => {
			const expiredToken = {
				...mockRefreshToken,
				expiresAt: new Date(Date.now() - 1000), // Expired
			} as RefreshTokenDocument;
			mockRefreshTokenRepository.getByQuery.mockResolvedValue(expiredToken);

			await expect(authService.refresh("expiredToken", "testDevice")).rejects.toThrow("Invalid refresh token");
		});

		it("should throw error if user not found", async () => {
			mockRefreshTokenRepository.getByQuery.mockResolvedValue(mockRefreshToken);
			mockUserRepository.get.mockResolvedValue(null);

			await expect(authService.refresh("mockRefreshToken", "testDevice")).rejects.toThrow("User not found");
		});
	});

	describe("createRefreshToken", () => {
		it("should create new refresh token and delete old ones", async () => {
			mockRefreshTokenRepository.deleteManyByQuery.mockResolvedValue(undefined);
			mockRefreshTokenRepository.create.mockResolvedValue(mockRefreshToken);

			const result = await (authService as any).createRefreshToken(mockUser.username, "testDevice");

			expect(mockRefreshTokenRepository.deleteManyByQuery).toHaveBeenCalledWith({
				userId: mockUser.username,
				device: "testDevice",
			});
			expect(crypto.randomBytes).toHaveBeenCalledWith(32);
			expect(mockRefreshTokenRepository.create).toHaveBeenCalled();
			expect(result).toEqual(mockRefreshToken);
		});
	});
});
