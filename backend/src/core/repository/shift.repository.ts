import { Service } from "typedi";
import { UserDocument } from "../model/user.model";
import { Repository } from "./base.repository";
import { ShiftDocument, ShiftModel } from "../model/shift.model";

@Service()
export class ShiftRepository extends Repository<ShiftDocument> {
	constructor() {
		super(ShiftModel);
	}
}
