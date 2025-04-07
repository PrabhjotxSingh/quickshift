import { MappingProfile, createMap, forMember, mapFrom } from "@automapper/core";
import { ShiftApplicantDocument, ShiftApplicantModel } from "../../../model/shift-applicant.model";
import { ShiftApplicantDto } from "../../../dto/models/shift-applicant.dto";

export const shiftApplicantDtoProfile: MappingProfile = (mapper) => {
	createMap(
		mapper,
		ShiftApplicantModel,
		ShiftApplicantDto,
		forMember(
			(destination) => destination._id,
			mapFrom((source: ShiftApplicantDocument) => source.id.toString()),
		),
		forMember(
			(destination) => destination.company,
			mapFrom((source: ShiftApplicantDocument) => source.company.toString()),
		),
		forMember(
			(destination) => destination.shiftId,
			mapFrom((source: ShiftApplicantDocument) => source.shiftId.toString()),
		),
		forMember(
			(destination) => destination.user,
			mapFrom((source: ShiftApplicantDocument) => source.user.toString()),
		),
		forMember(
			(destination) => destination.rejected,
			mapFrom((source: ShiftApplicantDocument) => source.rejected),
		),
	);
};
