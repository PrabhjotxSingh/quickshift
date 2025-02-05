import { UserDto } from "../../../../shared/src/dto/models/user.dto";
import { LoginRequest } from "../../../../shared/src/dto/request/auth/login.request";
import { RegisterRequest } from "../../../../shared/src/dto/request/auth/register.request";
import { LoginResponse } from "../../../../shared/src/dto/response/auth/login.response";
import { UserModel } from "../models/user.model";
import { AlreadyExistsError } from "../errors/AlreadyExistsError";
import { Repository } from "../repositories/repository";
import { mapper } from "../utility/mapper/automapper.config";
import { ErrorHandler } from "../utility/misc/error-handler.utility";

export class AuthService {
	// TODO:
	// Change to be dependecy injection
	authRepository = new Repository(UserModel);
	constructor() {}

	async Register(request: RegisterRequest): Promise<UserDto> {
		try {
			// Check if any existing users with the same username exists
			const existingUser = await this.authRepository.getByQuery({ username: request.Username });
			if (existingUser !== null) {
				throw new AlreadyExistsError(`Username ${request.Username} is already taken`);
			}

			// Create new user
			const userDto: UserDto = mapper.map(request, RegisterRequest, UserDto);
			const newUser = await this.authRepository.create(userDto);

			return userDto;
		} catch (ex: any) {
			ErrorHandler.ThrowError(ex);
		}
	}

	async Login(request: LoginRequest): Promise<LoginResponse> {
		throw new Error("Unimplemented");
	}

	async DeleteUser(): Promise<void> {
		throw new Error("Unimplemented");
	}

	async Refresh(): Promise<LoginResponse> {
		throw new Error("unimplemted");
	}
}
