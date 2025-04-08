/**
 * Crypto utility for frontend encryption and decryption
 * Uses Web Crypto API for client-side operations
 */

// The encryption key needs to match the one on the backend
const ENCRYPTION_KEY =
  import.meta.env.VITE_ENCRYPTION_KEY ||
  "quickshift-default-encryption-key-32char";

// Convert string to ArrayBuffer
const stringToArrayBuffer = (str: string): ArrayBuffer => {
  const encoder = new TextEncoder();
  return encoder.encode(str);
};

// Convert ArrayBuffer to Base64 string
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
};

/**
 * Encrypt a string using AES-CBC
 * Matches the encryption used on the server side
 * @param text The text to encrypt
 * @returns Base64 string containing IV + encrypted data
 */
export const encryptPassword = async (password: string): Promise<string> => {
  try {
    // If password is empty or invalid, return as is
    if (!password || typeof password !== "string") {
      return password;
    }

    // Convert the encryption key to a format usable by Web Crypto API
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      stringToArrayBuffer(ENCRYPTION_KEY),
      { name: "AES-CBC" },
      false,
      ["encrypt"]
    );

    // Generate a random IV (initialization vector)
    const iv = window.crypto.getRandomValues(new Uint8Array(16));

    // Encrypt the password
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: "AES-CBC",
        iv: iv,
      },
      keyMaterial,
      stringToArrayBuffer(password)
    );

    // Combine IV and encrypted data, then convert to Base64
    const combined = new Uint8Array(
      iv.length + new Uint8Array(encryptedData).length
    );
    combined.set(iv);
    combined.set(new Uint8Array(encryptedData), iv.length);

    return arrayBufferToBase64(combined.buffer);
  } catch (error) {
    console.error("Encryption error:", error);
    // Return the original password if encryption fails to prevent login issues
    return password;
  }
};
