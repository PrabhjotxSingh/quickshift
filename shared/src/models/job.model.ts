// models/Job.model.ts
import mongoose, { Document, Schema } from "mongoose";
import { CompanyDocument } from "./company.model";

export interface JobDocument extends Document {
  company: mongoose.Types.ObjectId | CompanyDocument;
  name: string;
  description: string;
}

const JobSchema = new Schema<JobDocument>({
  company: {
    type: Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

export const JobModel = mongoose.model<JobDocument>("Job", JobSchema);
