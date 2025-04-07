import mongoose, { Document, Schema } from "mongoose";
import { UserDocument } from "./user.model";
import { CompanyDocument } from "./company.model";
import { required } from "joi";

export interface ShiftApplicantDocument extends Document {
	company: mongoose.Types.ObjectId | CompanyDocument;
	shiftId: mongoose.Types.ObjectId | ShiftApplicantDocument;
	user: mongoose.Types.ObjectId | UserDocument;
	rejected: boolean;
}

const ShiftApplicantSchema = new Schema<ShiftApplicantDocument>({
	company: {
		type: Schema.Types.ObjectId,
		ref: "Company",
		required: true,
	},
	shiftId: {
		type: Schema.Types.ObjectId,
		ref: "Shift",
		required: true,
	},
	user: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	rejected: {
		type: Boolean,
		default: false,
	},
});

export const ShiftApplicantModel = mongoose.model<ShiftApplicantDocument>("ShiftApplicant", ShiftApplicantSchema);
