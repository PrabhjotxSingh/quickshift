import mongoose, { Document, Schema } from "mongoose";
import { CompanyDocument } from "./company.model";
import { required } from "joi";
import { Location } from "shared/src/dto/models/location";

export interface ShiftDocument extends Document {
	company: mongoose.Types.ObjectId | CompanyDocument;
	name: string;
	description: string;
	tags: string[];
	isOpen: boolean;
	startTime: Date;
	endTime: Date;
	pay: number;
	location: Location;
	userHired?: mongoose.Types.ObjectId;
	isComplete: boolean;
	rating?: number;
}

const ShiftSchema = new Schema<ShiftDocument>({
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
		required: false,
	},
	isComplete: {
		type: Boolean,
		default: false,
		required: true,
	},
	rating: {
		type: Number,
		required: false,
		min: 0,
		max: 5,
	},
});

export const ShiftModel = mongoose.model<ShiftDocument>("Shift", ShiftSchema);
