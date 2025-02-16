import { Service } from "typedi";
import { UserDocument } from "../model/user.model";
import { Repository } from "./base.repository";
@Service()
export class UserRepository extends Repository<UserDocument> {}
