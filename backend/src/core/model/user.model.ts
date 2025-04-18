import { Document, model, Schema, Types } from "mongoose";
import { UserRole } from "../enum/user-role.enum";

export interface UserDocument extends Document {
	_id: Types.ObjectId;
	email: string;
	username: string;
	password: string;
	firstName: string;
	lastName: string;
	roles: UserRole[];
	skills: string[];
}

const userSchema = new Schema<UserDocument>({
	email: {
		type: String,
		required: true,
		unique: true,
	},
	username: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	firstName: {
		type: String,
		required: true,
	},
	lastName: {
		type: String,
		required: true,
	},
	roles: {
		type: [String],
		enum: Object.values(UserRole),
		default: [UserRole.WORKER],
	},
	skills: {
		type: [String],
		default: [],
	},
});

export const UserModel = model<UserDocument>("User", userSchema);
