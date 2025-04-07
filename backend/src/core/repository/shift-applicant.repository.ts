import { Service } from "typedi";
import { UserDocument } from "../model/user.model";
import { Repository } from "./base.repository";
import { ShiftDocument, ShiftModel } from "../model/shift.model";
import { ShiftApplicantDocument, ShiftApplicantModel } from "../model/shift-applicant.model";
import { FilterQuery } from "mongoose";

@Service()
export class ShiftApplicantRepository extends Repository<ShiftApplicantDocument> {
	constructor() {
		super(ShiftApplicantModel);
	}

	async getManyByQuery(query: FilterQuery<ShiftApplicantDocument>): Promise<ShiftApplicantDocument[]> {
		return super.getManyByQuery(query) as Promise<ShiftApplicantDocument[]>;
	}
}
