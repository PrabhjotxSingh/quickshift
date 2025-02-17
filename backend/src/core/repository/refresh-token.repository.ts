import { Service } from "typedi";
import { Repository } from "./base.repository";
import { RefreshTokenDocument, RefreshTokenModel } from "../model/refresh-token.model";

@Service()
export class RefreshTokenRepository extends Repository<RefreshTokenDocument> {
	constructor() {
		super(RefreshTokenModel);
	}
}
