// shift-request-to-dto.mapping.profile.ts
import { MappingProfile, createMap, forMember, mapFrom } from "@automapper/core";
import mongoose from "mongoose";
import { ShiftDto } from "shared/src/dto/models/shift.dto";
import { CreateShiftRequest } from "shared/src/dto/request/shift/create-shift-request";
import { ShiftModel } from "../../../model/shift.model";

export const createShiftRequestToShiftDtoProfile: MappingProfile = (mapper) => {
	// Map from CreateShiftRequest to ShiftDto
	createMap(
		mapper,
		CreateShiftRequest,
		ShiftDto,
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

	// Reverse mapping from ShiftDto to CreateShiftRequest
	createMap(
		mapper,
		ShiftDto,
		CreateShiftRequest,
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

	// Map from ShiftModel to CreateShiftRequest
	createMap(
		mapper,
		ShiftModel,
		CreateShiftRequest,
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

	// Reverse mapping from CreateShiftRequest to ShiftModel
	createMap(
		mapper,
		CreateShiftRequest,
		ShiftModel,
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
