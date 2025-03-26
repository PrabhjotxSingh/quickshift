import { Model, Document, FilterQuery, ObjectId, UpdateQuery } from "mongoose";
import { omit } from "lodash";

export class Repository<T extends Document> {
	constructor(private model: Model<T>) {}

	async getAll(): Promise<T[]> {
		try {
			return await this.model.find();
		} catch (error: any) {
			throw new Error(error.message);
		}
	}

	async getByQuery(query: FilterQuery<T>): Promise<T | null> {
		try {
			return await this.model.findOne(query);
		} catch (error: any) {
			throw new Error(error.message);
		}
	}

	async getMultipleByQuery(query: FilterQuery<T>): Promise<T[]> {
		try {
			return await this.model.find(query).exec();
		} catch (error: any) {
			throw new Error(error.message);
		}
	}

	async deleteManyByQuery(query: FilterQuery<T>): Promise<void> {
		try {
			const deletedDocument = await this.model.deleteMany(query);
			if (!deletedDocument) {
				throw new Error(`Document not found`);
			}
		} catch (error: any) {
			throw new Error(error.message);
		}
	}

	async deleteByQuery(query: FilterQuery<T>): Promise<T | null> {
		try {
			const deletedDocument = await this.model.findOneAndDelete(query);
			if (!deletedDocument) {
				throw new Error(`Document not found`);
			}
			return deletedDocument;
		} catch (error: any) {
			throw new Error(error.message);
		}
	}

	async updateByQuery(query: FilterQuery<T>, newData: Partial<T>): Promise<T | null> {
		try {
			const existingDocument = await this.model.findOne(query);
			if (!existingDocument) {
				throw new Error(`Document not found`);
			}

			const updatedDocumentData = Object.assign({}, existingDocument.toObject(), newData);
			return await this.model.findOneAndUpdate(query, { $set: updatedDocumentData }, { new: true });
		} catch (error: any) {
			throw new Error(error.message);
		}
	}

	async create(documentData: Partial<T>): Promise<T> {
		try {
			return await this.model.create(documentData);
		} catch (error: any) {
			throw new Error(error.message);
		}
	}

	async get(id: any): Promise<T | null> {
		try {
			return await this.model.findById(id);
		} catch (error: any) {
			throw new Error(error.message);
		}
	}

	async delete(id: any): Promise<T | null> {
		try {
			const deletedDocument = await this.model.findByIdAndDelete(id);
			if (!deletedDocument) {
				throw new Error(`Document with id ${id} not found`);
			}
			return deletedDocument;
		} catch (error: any) {
			throw new Error(error.message);
		}
	}

	async update(id: any, newData: Partial<T>): Promise<T | null> {
		try {
			const updateData: Partial<T> = JSON.parse(JSON.stringify(newData));

			if (updateData.hasOwnProperty("_id")) {
				delete updateData["_id"];
			}

			const updatedDocument = await this.model.findOneAndUpdate(
				{ _id: id },
				{ $set: updateData } as UpdateQuery<T>,
				{ new: true },
			);

			return updatedDocument;
		} catch (error: any) {
			throw new Error(error.message);
		}
	}
}
