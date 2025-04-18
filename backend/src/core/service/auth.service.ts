import { UserDto } from "../dto/models/user.dto";
import { LoginRequest } from "../dto/request/auth/login.request";
import { RegisterRequest } from "../dto/request/auth/register.request";
import { LoginResponse } from "../dto/response/auth/login.response";
import { UserModel, UserDocument } from "../model/user.model";
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
import { ObjectId } from "mongoose";
import { Service } from "typedi";
import { UserRepository } from "../repository/user.repository";
import { RefreshTokenRepository } from "../repository/refresh-token.repository";

@Service()
export class AuthService {
	constructor(
		private userRepository: UserRepository,
		private refreshTokenRepository: RefreshTokenRepository,
	) {}

	async register(request: RegisterRequest, isAdmin: boolean = false): Promise<UserDto> {
		try {
			// Check for existing user with the same username or email
			const existingUser = await this.userRepository.getByQuery({
				$or: [{ username: request.username }, { email: request.email }],
			});
			if (existingUser) {
				throw new AlreadyExistsError("A user with the same username or email already exists.");
			}

			// Hash the password
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(request.password, salt);

			// Map request to UserDto and replace password with hashed one
			const userDto: UserDto = mapper.map(request, RegisterRequest, UserDto);
			userDto.password = hashedPassword;
			if (isAdmin) {
				userDto.roles = [UserRole.ADMIN, UserRole.WORKER];
			}

			// Map UserDto to UserDocument and create the user in the database
			const userDocument = mapper.map(userDto, UserDto, UserModel);
			const newUser = await this.userRepository.create(userDocument);

			return mapper.map(newUser, UserModel, UserDto);
		} catch (ex: any) {
			DebugUtil.error(ex);
		}
	}

	async Login(request: LoginRequest, device: string): Promise<LoginResponse> {
		try {
			// Find user by username
			const user = await this.userRepository.getByQuery({ username: request.username });
			if (!user) {
				throw new NotFoundError("Invalid username or password");
			}

			// Validate password
			const validPassword = await bcrypt.compare(request.password, user.password);
			if (!validPassword) {
				throw new NotFoundError("Invalid username or password");
			}

			// Generate JWT access token
			const accessToken = jwt.sign({ userId: user.id, username: user.username }, process.env.SECRET!, {
				expiresIn: "999m",
			});

			// Generate refresh token (assuming device is part of the request)
			const refreshToken = await this.createRefreshToken(user.id, device);

			// Map user to DTO
			const userDto = mapper.map(user, UserModel, UserDto);

			return {
				accessToken: accessToken,
				refreshToken: refreshToken.token,
				user: userDto,
			};
		} catch (ex: any) {
			DebugUtil.error(ex);
		}
	}

	async deleteUser(username: string): Promise<void> {
		try {
			const user = await this.userRepository.getByQuery({ userId: username });
			if (user) {
				// Delete user and associated refresh tokens
				await this.userRepository.delete(user.id);
				await this.refreshTokenRepository.deleteManyByQuery({ userId: user.id });
			}
		} catch (ex: any) {
			DebugUtil.error(ex);
		}
	}

	async refresh(refreshToken: string, device: string): Promise<LoginResponse> {
		try {
			// Validate the refresh token
			const tokenData = await this.refreshTokenRepository.getByQuery({ token: refreshToken });
			if (!tokenData || tokenData.expiresAt < new Date()) {
				throw new Error("Invalid refresh token");
			}

			// Retrieve the associated user
			const user = await this.userRepository.get(tokenData.userId);
			if (!user) {
				throw new Error("User not found");
			}

			// Generate new access token
			const accessToken = jwt.sign({ userId: user.id, username: user.username }, process.env.SECRET!, {
				expiresIn: "15m",
			});

			// Replace the old refresh token with a new one
			await this.refreshTokenRepository.deleteByQuery({ token: refreshToken });
			const newRefreshToken = await this.createRefreshToken(user.id, device);

			// Map user to DTO
			const userDto = mapper.map(user, UserModel, UserDto);

			return {
				accessToken: accessToken,
				refreshToken: newRefreshToken.token,
				user: userDto,
			};
		} catch (ex: any) {
			DebugUtil.error(ex);
		}
	}

	private async createRefreshToken(userId: ObjectId, device: string): Promise<RefreshTokenDocument> {
		// Remove existing refresh tokens for the same user and device
		await this.refreshTokenRepository.deleteManyByQuery({ userId, device });

		// Generate a new token
		const token = crypto.randomBytes(32).toString("hex");
		const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

		// Create and save the new refresh token
		const refreshToken = await this.refreshTokenRepository.create({
			token,
			userId,
			device,
			expiresAt,
		});

		return refreshToken;
	}

	async addSkills(user: UserDocument, skills: string[]): Promise<UserDto> {
		try {
			// Filter out duplicates
			const uniqueSkills = [...new Set([...user.skills, ...skills])];

			// Create update data
			const updateData = {
				skills: uniqueSkills,
			};

			// Update user with new skills
			const updatedUser = await this.userRepository.update(user.id, updateData);

			// Map to DTO and return
			return mapper.map(updatedUser, UserModel, UserDto);
		} catch (ex: any) {
			DebugUtil.error(ex);
			throw ex;
		}
	}

	async getSkills(user: UserDocument): Promise<string[]> {
		try {
			return user.skills || [];
		} catch (ex: any) {
			DebugUtil.error(ex);
			throw ex;
		}
	}

	async deleteSkills(user: UserDocument, skills: string[]): Promise<UserDto> {
		try {
			// Filter out skills to be deleted
			const updatedSkills = user.skills.filter((skill) => !skills.includes(skill));

			// Create update data
			const updateData = {
				skills: updatedSkills,
			};

			// Update user with new skills list
			const updatedUser = await this.userRepository.update(user.id, updateData);

			// Map to DTO and return
			return mapper.map(updatedUser, UserModel, UserDto);
		} catch (ex: any) {
			DebugUtil.error(ex);
			throw ex;
		}
	}

	async addUserSkills(userId: string, skills: string[]): Promise<UserDto> {
		try {
			// Get user
			const user = await this.userRepository.get(userId);
			if (!user) {
				throw new NotFoundError("User not found");
			}

			// Filter out duplicates
			const uniqueSkills = [...new Set([...(user.skills || []), ...skills])];

			// Create update data
			const updateData = {
				skills: uniqueSkills,
			};

			// Update user with new skills
			const updatedUser = await this.userRepository.update(userId, updateData);

			// Map to DTO and return
			return mapper.map(updatedUser, UserModel, UserDto);
		} catch (ex: any) {
			DebugUtil.error(ex);
			throw ex;
		}
	}

	async getUserSkills(userId: string): Promise<string[]> {
		try {
			// Get user
			const user = await this.userRepository.get(userId);
			if (!user) {
				throw new NotFoundError("User not found");
			}

			return user.skills || [];
		} catch (ex: any) {
			DebugUtil.error(ex);
			throw ex;
		}
	}

	async deleteUserSkills(userId: string, skills: string[]): Promise<UserDto> {
		try {
			// Get user
			const user = await this.userRepository.get(userId);
			if (!user) {
				throw new NotFoundError("User not found");
			}

			// Filter out skills to be deleted
			const updatedSkills = (user.skills || []).filter((skill) => !skills.includes(skill));

			// Create update data
			const updateData = {
				skills: updatedSkills,
			};

			// Update user with new skills list
			const updatedUser = await this.userRepository.update(userId, updateData);

			// Map to DTO and return
			return mapper.map(updatedUser, UserModel, UserDto);
		} catch (ex: any) {
			DebugUtil.error(ex);
			throw ex;
		}
	}

	async getUserDto(userId: string): Promise<UserDto> {
		try {
			// Get user
			const user = await this.userRepository.get(userId);
			if (!user) {
				throw new NotFoundError("User not found");
			}

			// Map to DTO and return
			return mapper.map(user, UserModel, UserDto);
		} catch (ex: any) {
			DebugUtil.error(ex);
			throw ex;
		}
	}
}
