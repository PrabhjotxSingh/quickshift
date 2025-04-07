import { AutoMap } from "@automapper/classes";
import { ShiftDto } from "./shift.dto";
import { UserDto } from "./user.dto";

export class ShiftApplicantDto {
	@AutoMap()
	_id!: string;

	@AutoMap()
	company!: string;

	@AutoMap()
	shiftId!: string;

	@AutoMap()
	user!: string;

	@AutoMap()
	rejected!: boolean;

	// Include shift details
	shift?: ShiftDto;

	// Include user details if needed
	userData?: UserDto;
}
