import { Document, model, Schema } from "mongoose";

// Define the interface for a RefreshToken document
export interface RefreshTokenDocument extends Document {
	token: string;
	userId: Schema.Types.ObjectId; // References the User model
	device: string;
	expiresAt: Date;
}

// Create the refresh token schema
const refreshTokenSchema = new Schema<RefreshTokenDocument>(
	{
		token: {
			type: String,
			required: true,
			unique: true,
		},
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		device: {
			type: String,
			required: true,
		},
		expiresAt: {
			type: Date,
			required: true,
		},
	},
	{
		timestamps: true, // Adds createdAt and updatedAt fields automatically
	},
);

// Export the Mongoose model
export const RefreshTokenModel = model<RefreshTokenDocument>("RefreshToken", refreshTokenSchema);
