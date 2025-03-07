import mongoose, { Document, Schema } from "mongoose";
import { CompanyDocument } from "./company.model";
import { required } from "joi";
import { Location } from "shared/src/dto/models/location";

export interface JobDocument extends Document {
	company: mongoose.Types.ObjectId | CompanyDocument;
	name: string;
	description: string;
	tags: string[];
	isOpen: boolean;
	startTime: Date;
	endTime: Date;
	pay: number;
	location: Location;
	userHired: Schema.Types.ObjectId;
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
	tags: {
		type: [String],
		required: true,
	},
	isOpen: {
		type: Boolean,
		default: true,
		required: true,
	},
	startTime: {
		type: Date,
		required: true,
	},
	endTime: {
		type: Date,
		required: true,
	},
	pay: {
		type: Number,
		required: true,
	},
	location: {
		latitude: { type: Number, required: true },
		longitude: { type: Number, required: true },
	},
	userHired: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
});

export const JobModel = mongoose.model<JobDocument>("Job", JobSchema);
