import { Service } from "typedi";
import { UserDocument } from "../model/user.model";
import { Repository } from "./base.repository";
import { ShiftDocument } from "../model/shift.model";
import { CompanyDocument, CompanyModel } from "../model/company.model";

@Service()
export class CompanyRepository extends Repository<CompanyDocument> {
	constructor() {
		super(CompanyModel);
	}
}
