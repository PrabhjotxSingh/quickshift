import { MappingProfile, createMap, forMember, mapFrom } from "@automapper/core";
import mongoose from "mongoose";
import { JobDto } from "shared/src/dto/models/job.dto";
import { JobModel } from "../../../model/job.model";

export const jobDtoProfile: MappingProfile = (mapper) => {
	// Map from JobModel to JobDto
	createMap(
		mapper,
		JobModel,
		JobDto,
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
			(dest) => dest.isOpen,
			mapFrom((src) => src.isOpen),
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
		// Explicitly map the nested location property
		forMember(
			(dest) => dest.location,
			mapFrom((src) => ({
				latitude: src.location.latitude,
				longitude: src.location.longitude,
			})),
		),
	);

	// Reverse mapping from JobDto to JobModel
	createMap(
		mapper,
		JobDto,
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
			(dest) => dest.isOpen,
			mapFrom((src) => src.isOpen),
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
		// Reverse mapping for the location: explicitly create an object with fully spelled-out keys
		forMember(
			(dest) => dest.location,
			mapFrom((src) => ({
				latitude: src.location.latitude,
				longitude: src.location.longitude,
			})),
		),
	);
};
