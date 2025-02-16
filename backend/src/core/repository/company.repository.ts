import { Service } from "typedi";
import { UserDocument } from "../model/user.model";
import { Repository } from "./base.repository";
import { JobDocument } from "../model/job.model";
import { CompanyDocument } from "../model/company.model";
@Service()
export class CompanyRepository extends Repository<CompanyDocument> {}
