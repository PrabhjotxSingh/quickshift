// src/core/utility/mapper/auth/user.mapper.ts
import { createMap, forMember, mapFrom } from "@automapper/core";
import { mapper } from "../automapper.config";
import { RegisterRequest } from "../../../../../../shared/src/dto/request/auth/register.request";
import { UserDto } from "../../../../../../shared/src/dto/models/user.dto";

createMap(
	mapper,
	RegisterRequest,
	UserDto,
	forMember(
		(destination: UserDto) => destination.email,
		mapFrom((source: RegisterRequest) => source.Email),
	),
	forMember(
		(destination: UserDto) => destination.username,
		mapFrom((source: RegisterRequest) => source.Username),
	),
	forMember(
		(destination: UserDto) => destination.password,
		mapFrom((source: RegisterRequest) => source.Password),
	),
	forMember(
		(destination: UserDto) => destination.firstName,
		mapFrom((source: RegisterRequest) => source.FirstName),
	),
	forMember(
		(destination: UserDto) => destination.lastName,
		mapFrom((source: RegisterRequest) => source.LastName),
	),
);
