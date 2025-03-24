// companyProfile.ts
import { MappingProfile, createMap, forMember, mapFrom } from "@automapper/core";
import { CompanyModel } from "../../../model/company.model";
import { CompanyDto } from "shared/src/dto/models/company.dto";

export const companyDtoProfile: MappingProfile = (mapper) => {
	createMap(
		mapper,
		CompanyModel,
		CompanyDto,
		forMember(
			(destination) => destination.name,
			mapFrom((source) => source.name),
		),
		forMember(
			(destination) => destination.description,
			mapFrom((source) => source.description),
		),
		forMember(
			(destination) => destination.owner,
			// Convert the owner to a string (e.g., the ObjectId value)
			mapFrom((source) => source.owner.toString()),
		),
	);
};
