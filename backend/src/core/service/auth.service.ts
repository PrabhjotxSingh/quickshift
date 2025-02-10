import { UserDto } from "shared/src/dto/models/user.dto";
import { LoginRequest } from "shared/src/dto/request/auth/login.request";
import { RegisterRequest } from "shared/src/dto/request/auth/register.request";
import { LoginResponse } from "shared/src/dto/response/auth/login.response";
import { UserModel } from "../model/user.model";
import { UserRole } from "shared/src/enum/user-role.enum";
import { RefreshTokenDocument, RefreshTokenModel } from "../model/refresh-token.model";
import { AlreadyExistsError } from "../error/AlreadyExistsError";
import { Repository } from "../repository/repository";
import { mapper } from "../utility/mapper/automapper.config";
import { ErrorHandler } from "../utility/misc/error-handler.utility";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";
import * as jwt from "jsonwebtoken";
import { NotFoundError } from "../error/NotFoundError";
import { ObjectId } from "mongoose";

export class AuthService {
	private userRepository = new Repository(UserModel);
	private refreshTokenRepository = new Repository(RefreshTokenModel);

	constructor() {}

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

			// Create the user in the database
			const newUser = await this.userRepository.create(userDto);

			return mapper.map(newUser, UserModel, UserDto);
		} catch (ex: any) {
			ErrorHandler.ThrowError(ex);
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
			ErrorHandler.ThrowError(ex);
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
			ErrorHandler.ThrowError(ex);
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
			ErrorHandler.ThrowError(ex);
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
}
