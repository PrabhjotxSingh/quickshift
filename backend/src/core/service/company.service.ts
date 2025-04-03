import { UserDto } from "../dto/models/user.dto";
import { LoginRequest } from "../dto/request/auth/login.request";
import { RegisterRequest } from "../dto/request/auth/register.request";
import { LoginResponse } from "../dto/response/auth/login.response";
import { UserDocument, UserModel } from "../model/user.model";
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
import mongoose, { ObjectId, Types } from "mongoose";
import { CompanyModel } from "../model/company.model";
import { Service } from "typedi";
import { CreateCompanyRequest } from "../dto/request/company/create-company.request";
import { CompanyDto } from "../dto/models/company.dto";
import { getRequestContext } from "../../controller/middleware/context.middleware";
import { UserRepository } from "../repository/user.repository";
import { CompanyRepository } from "../repository/company.repository";

@Service()
export class CompanyService {
	constructor(
		private userRepository: UserRepository,
		private companyRepository: CompanyRepository,
	) {}

	public async createCompany(request: CreateCompanyRequest, user: UserDocument): Promise<CompanyDto> {
		// Check if the user already has a company
		const existingCompany = await this.companyRepository.getByQuery({ owner: user.id });
		if (existingCompany != null) {
			throw new AlreadyExistsError("User already has a company");
		}
		const newCompany = mapper.map(request, CreateCompanyRequest, CompanyModel);
		newCompany.owner = user.id;

		user.roles.push(UserRole.EMPLOYER);
		await this.userRepository.update(user.id, user);

		return mapper.map(await this.companyRepository.create(newCompany), CompanyModel, CompanyDto);
	}

	public async getCompanyById(id: string): Promise<CompanyDto> {
		const objectId = new mongoose.Types.ObjectId(id);
		const company = await this.companyRepository.get(objectId);
		if (company == null) {
			throw new NotFoundError("Company not found");
		}

		return mapper.map(company, CompanyModel, CompanyDto);
	}

	public async deleteCompany(user: UserDocument): Promise<void> {
		const company = await this.companyRepository.getByQuery({ owner: user.id });
		if (company == null) {
			throw new NotFoundError("Company not found");
		}

		await this.companyRepository.delete(company.id);
	}

	public async updateCompany(request: CreateCompanyRequest, user: UserDocument): Promise<CompanyDto> {
		const company = await this.companyRepository.getByQuery({ owner: user.id });
		if (company == null) {
			throw new NotFoundError("Company not found");
		}

		const updatedCompany = mapper.map(request, CreateCompanyRequest, CompanyModel);
		updatedCompany.owner = user.id;

		return mapper.map(await this.companyRepository.update(company.id, updatedCompany), CompanyModel, CompanyDto);
	}

	public async getUserCompany(user: UserDocument): Promise<CompanyDto> {
		const company = await this.companyRepository.getByQuery({ owner: user.id });
		if (company == null) {
			throw new NotFoundError("Company not found");
		}

		return mapper.map(company, CompanyModel, CompanyDto);
	}
}
