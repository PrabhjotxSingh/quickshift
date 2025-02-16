import { UserDto } from "shared/src/dto/models/user.dto";
import { LoginRequest } from "shared/src/dto/request/auth/login.request";
import { RegisterRequest } from "shared/src/dto/request/auth/register.request";
import { LoginResponse } from "shared/src/dto/response/auth/login.response";
import { UserDocument, UserModel } from "../model/user.model";
import { UserRole } from "shared/src/enum/user-role.enum";
import { RefreshTokenDocument, RefreshTokenModel } from "../model/refresh-token.model";
import { AlreadyExistsError } from "../error/AlreadyExistsError";
import { Repository } from "../repository/repository";
import { mapper } from "../utility/mapper/automapper.config";
import { DebugUtil } from "../utility/misc/debug.util";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";
import * as jwt from "jsonwebtoken";
import { NotFoundError } from "../error/NotFoundError";
import { ObjectId } from "mongoose";
import { CompanyModel } from "../model/company.model";
import { Service } from "typedi";
import { CreateCompanyRequest } from "shared/src/dto/request/company/create-company.request";
import { CompanyDto } from "shared/src/dto/models/company.dto";
import { getRequestContext } from "../../controller/middleware/context.middleware";

@Service()
export class CompanyService {
	private companyRepository = new Repository(CompanyModel);

	constructor() {}

	public async createCompany(request: CreateCompanyRequest, user: UserDocument): Promise<CompanyDto> {
		const newCompany = mapper.map(request, CreateCompanyRequest, CompanyModel);
		newCompany.owner = user.id;

		return mapper.map(await this.companyRepository.create(newCompany), CompanyModel, CompanyDto);
	}
}
