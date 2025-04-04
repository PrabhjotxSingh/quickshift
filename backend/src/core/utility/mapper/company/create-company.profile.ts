// companyProfile.ts
import { MappingProfile, createMap, forMember, mapFrom } from "@automapper/core";
import { CompanyModel } from "../../../model/company.model";
import { CompanyDto } from "../../../dto/models/company.dto";
import { CreateCompanyRequest } from "../../../dto/request/company/create-company.request";

export const createCompanyProfile: MappingProfile = (mapper) => {
	createMap(
		mapper,
		CompanyModel,
		CreateCompanyRequest,
		forMember(
			(destination) => destination.name,
			mapFrom((source) => source.name),
		),
		forMember(
			(destination) => destination.description,
			mapFrom((source) => source.description),
		),
	);

	createMap(
		mapper,
		CreateCompanyRequest,
		CompanyModel,
		forMember(
			(destination) => destination.name,
			mapFrom((source) => source.name),
		),
		forMember(
			(destination) => destination.description,
			mapFrom((source) => source.description),
		),
	);
};
