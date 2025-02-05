import { Model, Document, FilterQuery } from "mongoose";

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
			const newDocument = new this.model(documentData);
			return await newDocument.save();
		} catch (error: any) {
			throw new Error(error.message);
		}
	}

	async get(id: string): Promise<T | null> {
		try {
			return await this.model.findById(id);
		} catch (error: any) {
			throw new Error(error.message);
		}
	}

	async delete(id: string): Promise<T | null> {
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

	async update(id: string, newData: Partial<T>): Promise<T | null> {
		try {
			const existingDocument = await this.model.findById(id);
			if (!existingDocument) {
				throw new Error(`Document not found`);
			}

			const updatedDocumentData = Object.assign({}, existingDocument.toObject(), newData);
			return await this.model.findByIdAndUpdate(id, { $set: updatedDocumentData }, { new: true });
		} catch (error: any) {
			throw new Error(error.message);
		}
	}
}
