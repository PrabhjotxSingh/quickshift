import { Service } from "typedi";
import { UserDocument } from "../model/user.model";
import { Repository } from "./base.repository";
import { ShiftDocument, ShiftModel } from "../model/shift.model";
import { ShiftApplicantDocument, ShiftApplicantModel } from "../model/shift-applicant.model";

@Service()
export class ShiftApplicantRepository extends Repository<ShiftApplicantDocument> {
	constructor() {
		super(ShiftApplicantModel);
	}
}
