import { AutoMap } from "@automapper/classes";
import { Location } from "./location";

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
}
