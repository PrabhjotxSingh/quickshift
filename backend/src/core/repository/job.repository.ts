import { Service } from "typedi";
import { UserDocument } from "../model/user.model";
import { Repository } from "./base.repository";
import { JobDocument } from "../model/job.model";
@Service()
export class JobRepository extends Repository<JobDocument> {}
