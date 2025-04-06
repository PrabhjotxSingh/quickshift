// models/Company.model.ts
import mongoose, { Document, Schema } from "mongoose";
import { UserDocument } from "./user.model";

export interface CompanyDocument extends Document {
	name: string;
	description: string;
	owner: mongoose.Types.ObjectId | UserDocument;
	companyAdmins: mongoose.Types.ObjectId[] | UserDocument[];
}

const CompanySchema = new Schema<CompanyDocument>({
	name: {
		type: String,
		required: true,
		unique: true,
	},
	description: {
		type: String,
		required: true,
	},
	owner: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	companyAdmins: [
		{
			type: Schema.Types.ObjectId,
			ref: "User",
			default: [],
		},
	],
});

export const CompanyModel = mongoose.model<CompanyDocument>("Company", CompanySchema);
