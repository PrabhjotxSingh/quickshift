import { MappingProfile, createMap, forMember, mapFrom } from "@automapper/core";
import mongoose from "mongoose";
import { ShiftDto } from "shared/src/dto/models/shift.dto";
import { ShiftModel } from "../../../model/shift.model";

export const shiftDtoProfile: MappingProfile = (mapper) => {
	// Map from ShiftModel to ShiftDto
	createMap(
		mapper,
		ShiftModel,
		ShiftDto,
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
		forMember(
			(dest) => dest.isComplete,
			mapFrom((src) => src.isComplete),
		),
		forMember(
			(dest) => dest.rating,
			mapFrom((src) => src.rating),
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

	// Reverse mapping from ShiftDto to ShiftModel
	createMap(
		mapper,
		ShiftDto,
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
		forMember(
			(dest) => dest.isComplete,
			mapFrom((src) => src.isComplete),
		),
		forMember(
			(dest) => dest.rating,
			mapFrom((src) => src.rating),
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
