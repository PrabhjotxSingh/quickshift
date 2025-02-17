import { Route, Post, Tags, Body, Query, Get, Delete, Patch } from "tsoa";
import { BaseController } from "./base.controller";
import { Authenticate } from "./decorators/auth.decorater";
import { UserRole } from "shared/src/enum/user-role.enum";
import { CreateJobRequest } from "shared/src/dto/request/job/create-job-request";
import { JobService } from "../core/service/job.service";
import { JobDto } from "shared/src/dto/models/job.dto";
import { AuthService } from "../core/service/auth.service";
import { Service } from "typedi";
import { ObjectId } from "mongoose";
import { UserRepository } from "../core/repository/user.repository";

@Route("Job")
@Tags("Job")
@Service()
export class JobController extends BaseController {
	constructor(private JobService: JobService) {
		super();
	}

	@Post()
	@Authenticate(UserRole.WORKER)
	public async create(@Body() request: CreateJobRequest): Promise<JobDto | string> {
		try {
			return await this.JobService.createJob(request);
		} catch (ex: any) {
			return this.handleError(ex);
		}
	}

	@Get()
	@Authenticate(UserRole.WORKER)
	public async get(@Query() id: string): Promise<JobDto | string> {
		try {
			return await this.JobService.getJobById(id);
		} catch (ex: any) {
			return this.handleError(ex);
		}
	}

	@Delete()
	@Authenticate(UserRole.EMPLOYER)
	public async delete(@Query() jobId: string): Promise<string> {
		try {
			await this.JobService.deleteJob(jobId);
			return this.ok("Succesfullt deleted Job");
		} catch (ex: any) {
			return this.handleError(ex);
		}
	}

	@Patch()
	@Authenticate(UserRole.EMPLOYER)
	public async update(@Query() jobId: string, @Body() request: CreateJobRequest): Promise<JobDto | string> {
		try {
			return await this.JobService.updateJob(request, jobId);
		} catch (ex: any) {
			return this.handleError(ex);
		}
	}
}
