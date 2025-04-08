export class EncryptionUtility {
	private static readonly algorithm = "aes-256-cbc";
	private static readonly secretKey = process.env.ENCRYPTION_KEY || "quickshift-default-encryption-key-32char";
	private static readonly ivLength = 16;

	/**
	 * Decrypt an encrypted string
	 * @param encryptedText The text to decrypt (base64 string)
	 * @returns The original plaintext
	 */
	static decrypt(encryptedText: string): string {
		try {
			// If input is not in the expected format, return as is
			if (!encryptedText || typeof encryptedText !== "string") {
				return encryptedText;
			}

			const crypto = require("crypto");

			// The IV is prepended to the encrypted data
			const encryptedBuffer = Buffer.from(encryptedText, "base64");

			// Make sure we have enough data for IV and encrypted content
			if (encryptedBuffer.length <= this.ivLength) {
				console.warn("Decryption warning: Input too short, might not be encrypted");
				return encryptedText;
			}

			const iv = encryptedBuffer.slice(0, this.ivLength);
			const encryptedContent = encryptedBuffer.slice(this.ivLength);

			// Create the decipher
			const decipher = crypto.createDecipheriv(this.algorithm, Buffer.from(this.secretKey), iv);

			// Decrypt the data
			let decrypted = decipher.update(encryptedContent);
			decrypted = Buffer.concat([decrypted, decipher.final()]);

			return decrypted.toString("utf8");
		} catch (error) {
			console.error("Decryption error:", error);
			// Return the original text on error to prevent system failures
			return encryptedText;
		}
	}

	/**
	 * Encrypt a string
	 * @param text The text to encrypt
	 * @returns The encrypted text as a base64 string
	 */
	static encrypt(text: string): string {
		try {
			// If input is not in the expected format, return as is
			if (!text || typeof text !== "string") {
				return text;
			}

			const crypto = require("crypto");

			// Generate a random initialization vector
			const iv = crypto.randomBytes(this.ivLength);

			// Create the cipher
			const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(this.secretKey), iv);

			// Encrypt the data
			let encrypted = cipher.update(text, "utf8");
			encrypted = Buffer.concat([encrypted, cipher.final()]);

			// Prepend the IV to the encrypted data and convert to base64
			return Buffer.concat([iv, encrypted]).toString("base64");
		} catch (error) {
			console.error("Encryption error:", error);
			// Return the original text on error to prevent system failures
			return text;
		}
	}
}
