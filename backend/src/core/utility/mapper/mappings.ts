import { createMap, forMember, mapFrom } from "@automapper/core";
import { mapper } from "./automapper.config";
import { RegisterRequest } from "../../../../../shared/src/dto/request/auth/register.request";
import { UserDto } from "../../../../../shared/src/dto/models/user.dto";

export function configureMappings() {
	createMap(
		mapper,
		RegisterRequest,
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
	);
}
