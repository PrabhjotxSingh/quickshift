import { Model, Document, Query } from "mongoose";
import { Repository } from "../../core/repository/base.repository";

interface TestDocument extends Document {
	name?: string;
	value?: number;
	type?: string;
}

// Create a mock document with toObject method
const createMockDocument = (data: Partial<TestDocument>): TestDocument =>
	({
		...data,
		toObject: () => ({ ...data }),
	}) as TestDocument;

// Mock mongoose Model with proper types
const mockModel = {
	find: jest.fn(),
	findOne: jest.fn(),
	findById: jest.fn(),
	findOneAndDelete: jest.fn(),
	findByIdAndDelete: jest.fn(),
	findOneAndUpdate: jest.fn(),
	deleteMany: jest.fn(),
	create: jest.fn(),
} as unknown as jest.Mocked<Model<TestDocument>>;

describe("Repository", () => {
	let repository: Repository<TestDocument>;

	beforeEach(() => {
		repository = new Repository(mockModel);
		jest.clearAllMocks();
	});

	describe("getAll", () => {
		it("should return all documents", async () => {
			const mockDocuments = [createMockDocument({ _id: "1" }), createMockDocument({ _id: "2" })];
			(mockModel.find as jest.Mock).mockResolvedValue(mockDocuments);

			const result = await repository.getAll();

			expect(mockModel.find).toHaveBeenCalled();
			expect(result).toEqual(mockDocuments);
		});

		it("should throw error when find fails", async () => {
			(mockModel.find as jest.Mock).mockRejectedValue(new Error("Database error"));

			await expect(repository.getAll()).rejects.toThrow("Database error");
		});
	});

	describe("getByQuery", () => {
		it("should return a single document matching query", async () => {
			const mockDocument = createMockDocument({ _id: "1", name: "test" });
			const query = { name: "test" };
			(mockModel.findOne as jest.Mock).mockResolvedValue(mockDocument);

			const result = await repository.getByQuery(query);

			expect(mockModel.findOne).toHaveBeenCalledWith(query);
			expect(result).toEqual(mockDocument);
		});

		it("should return null when no document matches", async () => {
			const query = { name: "nonexistent" };
			(mockModel.findOne as jest.Mock).mockResolvedValue(null);

			const result = await repository.getByQuery(query);

			expect(result).toBeNull();
		});
	});

	describe("getMultipleByQuery", () => {
		it("should return multiple documents matching query", async () => {
			const mockDocuments = [createMockDocument({ _id: "1" }), createMockDocument({ _id: "2" })];
			const query = { type: "test" };
			const mockExec = jest.fn().mockResolvedValue(mockDocuments);
			(mockModel.find as jest.Mock).mockReturnValue({ exec: mockExec });

			const result = await repository.getManyByQuery(query);

			expect(mockModel.find).toHaveBeenCalledWith(query);
			expect(result).toEqual(mockDocuments);
		});
	});

	describe("deleteManyByQuery", () => {
		it("should delete multiple documents matching query", async () => {
			const query = { type: "test" };
			(mockModel.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 2 });

			await repository.deleteManyByQuery(query);

			expect(mockModel.deleteMany).toHaveBeenCalledWith(query);
		});

		it("should throw error when deleteMany fails", async () => {
			const query = { type: "test" };
			(mockModel.deleteMany as jest.Mock).mockRejectedValue(new Error("Delete failed"));

			await expect(repository.deleteManyByQuery(query)).rejects.toThrow("Delete failed");
		});
	});

	describe("deleteByQuery", () => {
		it("should delete and return a single document matching query", async () => {
			const mockDocument = createMockDocument({ _id: "1", name: "test" });
			const query = { name: "test" };
			(mockModel.findOneAndDelete as jest.Mock).mockResolvedValue(mockDocument);

			const result = await repository.deleteByQuery(query);

			expect(mockModel.findOneAndDelete).toHaveBeenCalledWith(query);
			expect(result).toEqual(mockDocument);
		});

		it("should throw error when document not found", async () => {
			const query = { name: "nonexistent" };
			(mockModel.findOneAndDelete as jest.Mock).mockResolvedValue(null);

			await expect(repository.deleteByQuery(query)).rejects.toThrow("Document not found");
		});
	});

	describe("updateByQuery", () => {
		it("should update and return document matching query", async () => {
			const existingDoc = createMockDocument({ _id: "1", name: "old", value: 1 });
			const newData: Partial<TestDocument> = { name: "new" };
			const updatedDoc = createMockDocument({ _id: "1", name: "new", value: 1 });
			const query = { _id: "1" };

			(mockModel.findOne as jest.Mock).mockResolvedValue(existingDoc);
			(mockModel.findOneAndUpdate as jest.Mock).mockResolvedValue(updatedDoc);

			const result = await repository.updateByQuery(query, newData);

			expect(mockModel.findOne).toHaveBeenCalledWith(query);
			expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
				query,
				{ $set: { _id: "1", name: "old", value: 1, ...newData } },
				{ new: true },
			);
			expect(result).toEqual(updatedDoc);
		});

		it("should throw error when document not found", async () => {
			const query = { _id: "nonexistent" };
			(mockModel.findOne as jest.Mock).mockResolvedValue(null);

			await expect(repository.updateByQuery(query, {})).rejects.toThrow("Document not found");
		});
	});

	describe("create", () => {
		it("should create and return a new document", async () => {
			const documentData: Partial<TestDocument> = { name: "test" };
			const mockDocument = createMockDocument({ _id: "1", name: "test" });

			// Mock create method
			(mockModel.create as jest.Mock).mockResolvedValue(mockDocument);

			const result = await repository.create(documentData);

			expect(mockModel.create).toHaveBeenCalledWith(documentData);
			expect(result).toEqual(mockDocument);
		});
	});

	describe("get", () => {
		it("should return document by id", async () => {
			const mockDocument = createMockDocument({ _id: "1", name: "test" });
			(mockModel.findById as jest.Mock).mockResolvedValue(mockDocument);

			const result = await repository.get("1");

			expect(mockModel.findById).toHaveBeenCalledWith("1");
			expect(result).toEqual(mockDocument);
		});
	});

	describe("delete", () => {
		it("should delete and return document by id", async () => {
			const mockDocument = createMockDocument({ _id: "1", name: "test" });
			(mockModel.findByIdAndDelete as jest.Mock).mockResolvedValue(mockDocument);

			const result = await repository.delete("1");

			expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith("1");
			expect(result).toEqual(mockDocument);
		});

		it("should throw error when document not found", async () => {
			(mockModel.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

			await expect(repository.delete("nonexistent")).rejects.toThrow("Document with id nonexistent not found");
		});
	});

	describe("update", () => {
		it("should update and return document by id", async () => {
			const mockDocument = createMockDocument({ _id: "1", name: "test" });
			const newData: Partial<TestDocument> = { name: "updated" };
			(mockModel.findOneAndUpdate as jest.Mock).mockResolvedValue(mockDocument);

			const result = await repository.update("1", newData);

			expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith({ _id: "1" }, { $set: newData }, { new: true });
			expect(result).toEqual(mockDocument);
		});

		it("should remove _id from update data", async () => {
			const newData = { _id: "1", name: "test" } as Partial<TestDocument>;
			(mockModel.findOneAndUpdate as jest.Mock).mockResolvedValue(createMockDocument({ name: "test" }));

			await repository.update("1", newData);

			expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
				{ _id: "1" },
				{ $set: { name: "test" } },
				{ new: true },
			);
		});
	});
});
