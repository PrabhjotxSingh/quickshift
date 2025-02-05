// models/JobApplicant.model.ts
import mongoose, { Document, Schema } from "mongoose";
import { UserDocument } from "./user.model";
import { CompanyDocument } from "./company.model";

export interface JobApplicantDocument extends Document {
  company: mongoose.Types.ObjectId | CompanyDocument;
  user: mongoose.Types.ObjectId | UserDocument;
}

const JobApplicantSchema = new Schema<JobApplicantDocument>({
  company: {
    type: Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

export const JobApplicantModel = mongoose.model<JobApplicantDocument>(
  "JobApplicant",
  JobApplicantSchema
);
