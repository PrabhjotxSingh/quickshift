import { AutoMap } from "@automapper/classes";
import { Location } from "./location";
import { UserDto } from "./user.dto";

// Define the Applicant type
export interface Applicant {
	id: string;
	userId: string;
	userData?: UserDto;
}

export class ShiftDto {
	@AutoMap()
	_id!: string;
	@AutoMap()
	company!: string;
	@AutoMap()
	companyName!: string;
	@AutoMap()
	name!: string;
	@AutoMap()
	description!: string;
	@AutoMap()
	tags!: string[];
	@AutoMap()
	isOpen!: boolean;
	@AutoMap()
	startTime!: Date;
	@AutoMap()
	endTime!: Date;
	@AutoMap()
	pay!: number;
	@AutoMap()
	location!: Location;
	@AutoMap()
	userHired?: string;
	@AutoMap()
	isComplete!: boolean;
	@AutoMap()
	rating?: number;

	// Add applicants property
	applicants?: Applicant[];
}
