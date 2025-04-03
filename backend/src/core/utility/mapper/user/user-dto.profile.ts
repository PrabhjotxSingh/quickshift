// userProfile.ts
import { MappingProfile, createMap, forMember, mapFrom } from "@automapper/core";
import { UserModel, UserDocument } from "../../../model/user.model";
import { UserDto } from "shared/src/dto/models/user.dto";

export const userDtoProfile: MappingProfile = (mapper) => {
	createMap(
		mapper,
		UserModel,
		UserDto,
		forMember(
			(destination) => destination._id,
			mapFrom((source: UserDocument) => source._id.toString()),
		),
		forMember(
			(destination) => destination.email,
			mapFrom((source: UserDocument) => source.email),
		),
		forMember(
			(destination) => destination.username,
			mapFrom((source: UserDocument) => source.username),
		),
		forMember(
			(destination) => destination.password,
			mapFrom((source: UserDocument) => source.password),
		),
		forMember(
			(destination) => destination.firstName,
			mapFrom((source: UserDocument) => source.firstName),
		),
		forMember(
			(destination) => destination.lastName,
			mapFrom((source: UserDocument) => source.lastName),
		),
		forMember(
			(destination) => destination.roles,
			mapFrom((source: UserDocument) => source.roles),
		),
		forMember(
			(destination) => destination.skills,
			mapFrom((source: UserDocument) => source.skills),
		),
	);
};
