// userProfile.ts
import { MappingProfile, createMap, forMember, mapFrom } from "@automapper/core";
import { UserModel } from "../../../models/user.model";
import { UserDto } from "../../../../../../shared/src/dto/models/user.dto";

export const userProfile: MappingProfile = (mapper) => {
	createMap(
		mapper,
		UserModel,
		UserDto,
		forMember(
			(destination) => destination.email,
			mapFrom((source) => source.email),
		),
		forMember(
			(destination) => destination.username,
			mapFrom((source) => source.username),
		),
		forMember(
			(destination) => destination.password,
			mapFrom((source) => source.password),
		),
		forMember(
			(destination) => destination.firstName,
			mapFrom((source) => source.firstName),
		),
		forMember(
			(destination) => destination.lastName,
			mapFrom((source) => source.lastName),
		),
		forMember(
			(destination) => destination.roles,
			mapFrom((source) => source.roles),
		),
		forMember(
			(destination) => destination.skills,
			mapFrom((source) => source.skills),
		),
	);
};
