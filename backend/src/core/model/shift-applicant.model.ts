import mongoose, { Document, Schema } from "mongoose";
import { UserDocument } from "./user.model";
import { CompanyDocument } from "./company.model";

export interface ShiftApplicantDocument extends Document {
	company: mongoose.Types.ObjectId | CompanyDocument;
	user: mongoose.Types.ObjectId | UserDocument;
}

const ShiftApplicantSchema = new Schema<ShiftApplicantDocument>({
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

export const ShiftApplicantModel = mongoose.model<ShiftApplicantDocument>("ShiftApplicant", ShiftApplicantSchema);
