// job-request-to-dto.mapping.profile.ts
import { MappingProfile, createMap, forMember, mapFrom } from "@automapper/core";
import mongoose from "mongoose";
import { JobDto } from "shared/src/dto/models/job.dto";
import { CreateJobRequest } from "shared/src/dto/request/job/create-job-request";
import { JobModel } from "../../../model/job.model";

export const createJobRequestToJobDtoProfile: MappingProfile = (mapper) => {
	// Map from CreateJobRequest to JobDto
	createMap(
		mapper,
		CreateJobRequest,
		JobDto,
		forMember(
			(dest) => dest.company,
			mapFrom((src) => src.company),
		),
		forMember(
			(dest) => dest.name,
			mapFrom((src) => src.name),
		),
		forMember(
			(dest) => dest.description,
			mapFrom((src) => src.description),
		),
		forMember(
			(dest) => dest.tags,
			mapFrom((src) => src.tags),
		),
		forMember(
			(dest) => dest.startTime,
			mapFrom((src) => src.startTime),
		),
		// Note: if your DTO has `endTime` instead of `endtime`, adjust accordingly.
		forMember(
			(dest) => dest.endTime,
			mapFrom((src) => src.endTime),
		),
		forMember(
			(dest) => dest.pay,
			mapFrom((src) => src.pay),
		),
		forMember(
			(dest) => dest.location,
			mapFrom((src) => ({
				latitude: src.location.latitude,
				longitude: src.location.longitude,
			})),
		),
	);

	// Reverse mapping from JobDto to CreateJobRequest
	createMap(
		mapper,
		JobDto,
		CreateJobRequest,
		forMember(
			(dest) => dest.company,
			mapFrom((src) => src.company),
		),
		forMember(
			(dest) => dest.name,
			mapFrom((src) => src.name),
		),
		forMember(
			(dest) => dest.description,
			mapFrom((src) => src.description),
		),
		forMember(
			(dest) => dest.tags,
			mapFrom((src) => src.tags),
		),
		forMember(
			(dest) => dest.startTime,
			mapFrom((src) => src.startTime),
		),
		forMember(
			(dest) => dest.endTime,
			mapFrom((src) => src.endTime),
		),
		forMember(
			(dest) => dest.pay,
			mapFrom((src) => src.pay),
		),
		forMember(
			(dest) => dest.location,
			mapFrom((src) => ({
				latitude: src.location.latitude,
				longitude: src.location.longitude,
			})),
		),
	);

	// Map from JobModel to CreateJobRequest
	createMap(
		mapper,
		JobModel,
		CreateJobRequest,
		forMember(
			(dest) => dest.company,
			mapFrom((src) => src.company.toString()),
		),
		forMember(
			(dest) => dest.name,
			mapFrom((src) => src.name),
		),
		forMember(
			(dest) => dest.description,
			mapFrom((src) => src.description),
		),
		forMember(
			(dest) => dest.tags,
			mapFrom((src) => src.tags),
		),
		forMember(
			(dest) => dest.startTime,
			mapFrom((src) => src.startTime),
		),
		// Map the model's 'endtime' to the request's 'endTime'
		forMember(
			(dest) => dest.endTime,
			mapFrom((src) => src.endTime),
		),
		forMember(
			(dest) => dest.pay,
			mapFrom((src) => src.pay),
		),
		forMember(
			(dest) => dest.location,
			mapFrom((src) => ({
				latitude: src.location.latitude,
				longitude: src.location.longitude,
			})),
		),
	);

	// Reverse mapping from CreateJobRequest to JobModel
	createMap(
		mapper,
		CreateJobRequest,
		JobModel,
		forMember(
			(dest) => dest.company,
			mapFrom((src) => new mongoose.Types.ObjectId(src.company)),
		),
		forMember(
			(dest) => dest.name,
			mapFrom((src) => src.name),
		),
		forMember(
			(dest) => dest.description,
			mapFrom((src) => src.description),
		),
		forMember(
			(dest) => dest.tags,
			mapFrom((src) => src.tags),
		),
		forMember(
			(dest) => dest.startTime,
			mapFrom((src) => src.startTime),
		),
		// Map the request's 'endTime' to the model's 'endtime'
		forMember(
			(dest) => dest.endTime,
			mapFrom((src) => src.endTime),
		),
		forMember(
			(dest) => dest.pay,
			mapFrom((src) => src.pay),
		),
		forMember(
			(dest) => dest.location,
			mapFrom((src) => ({
				latitude: src.location.latitude,
				longitude: src.location.longitude,
			})),
		),
	);
};
