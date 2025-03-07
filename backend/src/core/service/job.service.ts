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
import { JobDocument, JobModel } from "../model/job.model";
import { Service } from "typedi";
import { CreateJobRequest } from "shared/src/dto/request/job/create-job-request";
import { JobDto } from "shared/src/dto/models/job.dto";
import { getRequestContext } from "../../controller/middleware/context.middleware";
import { UserRepository } from "../repository/user.repository";
import { JobRepository } from "../repository/job.repository";
import { CompanyRepository } from "../repository/company.repository";

@Service()
export class JobService {
	constructor(
		private companyRepository: CompanyRepository,
		private jobRepository: JobRepository,
	) {}

	public async createJob(request: CreateJobRequest): Promise<JobDto> {
		const company = this.companyRepository.get(request.company);
		if (company == null) {
			throw new NotFoundError("Company not found");
		}

		const newJob = mapper.map(request, CreateJobRequest, JobModel);
		newJob.isOpen = true;

		return mapper.map(await this.jobRepository.create(newJob), JobModel, JobDto);
	}

	public async getJobById(id: string): Promise<JobDto> {
		const Job = await this.jobRepository.get(id);
		if (Job == null) {
			throw new NotFoundError("Job not found");
		}

		return mapper.map(Job, JobModel, JobDto);
	}

	public async deleteJob(id: string): Promise<void> {
		await this.jobRepository.delete(id);
	}

	public async updateJob(request: CreateJobRequest, jobId: string): Promise<JobDto> {
		const Job = await this.jobRepository.get(jobId);
		if (Job == null) {
			throw new NotFoundError("Job not found");
		}

		const updatedJob = mapper.map(request, CreateJobRequest, JobModel);

		return mapper.map(await this.jobRepository.update(Job.id, updatedJob), JobModel, JobDto);
	}

	public async getUserJob(user: CompanyDocument): Promise<JobDto> {
		const Job = await this.jobRepository.getByQuery({ owner: user.id });
		if (Job == null) {
			throw new NotFoundError("Job not found");
		}

		return mapper.map(Job, JobModel, JobDto);
	}

	public async getAvailableJobs(tags?: string[]): Promise<JobDocument[] | undefined> {
		let result;
		if (!tags || tags.length === 0) {
			result = await this.jobRepository.getMultipleByQuery({ isOpen: true });
		}

		result = await this.jobRepository.getMultipleByQuery({
			isOpen: true,
			tags: { $in: tags },
		});

		return result;
	}

	public async getUsersJobs(userId: string, getUpcoming: boolean = false) {
		let query: FilterQuery<JobDocument>;
		if (getUpcoming) {
			const currentTime = new Date();
			query = {
				userHired: userId,
				startTime: { $gt: currentTime },
			};
		} else {
			query = { userHired: userId };
		}
		return this.jobRepository.getByQuery(query);
	}
}
