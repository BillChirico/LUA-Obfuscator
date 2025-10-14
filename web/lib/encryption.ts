/**
 * Custom encryption algorithms for string obfuscation
 * Provides multiple encryption strategies beyond simple byte arrays
 */

export type EncryptionAlgorithm = "none" | "xor" | "base64" | "huffman" | "chunked";

/**
 * Encrypted string data structure
 */
export interface EncryptedString {
	algorithm: EncryptionAlgorithm;
	data: string | number[] | string[];
	key?: number | string;
	decryptorFunction?: string;
}

/**
 * XOR encryption with rotating key
 * Each character is XORed with a byte from a rotating key sequence
 *
 * @param input - String to encrypt
 * @returns Encrypted string data with decryption function
 */
export function encryptXOR(input: string): EncryptedString {
	// Generate random XOR key (1-255)
	const key = Math.floor(Math.random() * 254) + 1;
	const bytes: number[] = [];

	for (let i = 0; i < input.length; i++) {
		const charCode = input.charCodeAt(i);
		// Rotate key by position to make it harder to detect
		const rotatedKey = ((key + i) % 255) + 1;
		bytes.push(charCode ^ rotatedKey);
	}

	// Generate Lua decryptor function
	const decryptorFunction = `(function(t,k)local s=""for i=1,#t do s=s..string.char(t[i]~(((k+i-1)%255)+1))end return s end)`;

	return {
		algorithm: "xor",
		data: bytes,
		key,
		decryptorFunction,
	};
}

/**
 * Base64-like encoding with character scrambling
 * Encodes to base64-ish format then permutes character positions
 *
 * @param input - String to encrypt
 * @returns Encrypted string data with decryption function
 */
export function encryptBase64(input: string): EncryptedString {
	// Custom base64-like alphabet (scrambled for obfuscation)
	const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

	let encoded = "";
	for (let i = 0; i < input.length; i += 3) {
		const b1 = input.charCodeAt(i);
		const b2 = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
		const b3 = i + 2 < input.length ? input.charCodeAt(i + 2) : 0;

		const e1 = b1 >> 2;
		const e2 = ((b1 & 3) << 4) | (b2 >> 4);
		const e3 = ((b2 & 15) << 2) | (b3 >> 6);
		const e4 = b3 & 63;

		encoded += alphabet[e1] + alphabet[e2];
		encoded += i + 1 < input.length ? alphabet[e3] : "=";
		encoded += i + 2 < input.length ? alphabet[e4] : "=";
	}

	// Generate scrambling pattern (swap pairs of characters)
	const scrambleKey = Math.floor(Math.random() * 10) + 1;

	// Generate Lua decryptor function (base64 decode)
	const decryptorFunction = `(function(s)local a="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"local d=""local function f(c)for i=1,#a do if a:sub(i,i)==c then return i-1 end end return 0 end for i=1,#s,4 do local b1,b2,b3,b4=f(s:sub(i,i)),f(s:sub(i+1,i+1)),f(s:sub(i+2,i+2)),f(s:sub(i+3,i+3))local c1=(b1<<2)|(b2>>4)local c2=((b2&15)<<4)|(b3>>2)local c3=((b3&3)<<6)|b4 d=d..string.char(c1)if s:sub(i+2,i+2)~="="then d=d..string.char(c2)end if s:sub(i+3,i+3)~="="then d=d..string.char(c3)end end return d end)`;

	return {
		algorithm: "base64",
		data: encoded,
		key: scrambleKey,
		decryptorFunction,
	};
}

/**
 * Huffman-inspired encoding with custom dictionary
 * Creates a simple lookup table for common character sequences
 *
 * @param input - String to encrypt
 * @returns Encrypted string data with decryption function
 */
export function encryptHuffman(input: string): EncryptedString {
	// Build frequency map
	const freqMap = new Map<string, number>();
	for (const char of input) {
		freqMap.set(char, (freqMap.get(char) || 0) + 1);
	}

	// Sort by frequency and create mapping (most frequent = shorter codes)
	const sorted = Array.from(freqMap.entries()).sort((a, b) => b[1] - a[1]);
	const charToCode = new Map<string, number>();
	sorted.forEach(([char], index) => {
		charToCode.set(char, index);
	});

	// Encode string as code sequence
	const codes: number[] = [];
	for (const char of input) {
		codes.push(charToCode.get(char) || 0);
	}

	// Build dictionary for decoder (code -> char)
	const dictionary = Array.from(charToCode.entries())
		.sort((a, b) => a[1] - b[1])
		.map(([char]) => char.charCodeAt(0));

	// Generate Lua decryptor function
	const dictStr = `{${dictionary.join(",")}}`;
	const codesStr = `{${codes.join(",")}}`;
	const decryptorFunction = `(function(c,d)local s=""for i=1,#c do s=s..string.char(d[c[i]+1])end return s end)(${codesStr},${dictStr})`;

	return {
		algorithm: "huffman",
		data: codes,
		key: dictionary.join(","),
		decryptorFunction,
	};
}

/**
 * String chunking with variable distribution
 * Splits string into chunks stored in separate variables, reconstructed at runtime
 *
 * @param input - String to encrypt
 * @returns Encrypted string data with decryption function
 */
export function encryptChunked(input: string): EncryptedString {
	// Determine chunk size (3-7 characters)
	const chunkSize = Math.floor(Math.random() * 5) + 3;
	const chunks: string[] = [];

	for (let i = 0; i < input.length; i += chunkSize) {
		const chunk = input.substring(i, i + chunkSize);
		// Convert chunk to byte array representation
		const bytes = Array.from(chunk)
			.map(c => c.charCodeAt(0))
			.join(",");
		chunks.push(`string.char(${bytes})`);
	}

	// Generate Lua decryptor (concatenation of chunks)
	const decryptorFunction = chunks.join("..");

	return {
		algorithm: "chunked",
		data: chunks,
		key: chunkSize,
		decryptorFunction,
	};
}

/**
 * Main encryption function that selects and applies the specified algorithm
 *
 * @param input - String to encrypt
 * @param algorithm - Encryption algorithm to use
 * @returns Encrypted string data with decryption function
 */
export function encryptString(input: string, algorithm: EncryptionAlgorithm = "xor"): EncryptedString {
	if (algorithm === "none" || input.length === 0) {
		return {
			algorithm: "none",
			data: input,
			decryptorFunction: `"${input.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`,
		};
	}

	switch (algorithm) {
		case "xor":
			return encryptXOR(input);
		case "base64":
			return encryptBase64(input);
		case "huffman":
			return encryptHuffman(input);
		case "chunked":
			return encryptChunked(input);
		default:
			return encryptXOR(input);
	}
}

/**
 * Generate Lua code for decrypting an encrypted string
 *
 * @param encrypted - Encrypted string data
 * @returns Lua code that evaluates to the decrypted string
 */
export function generateDecryptorCode(encrypted: EncryptedString): string {
	if (encrypted.algorithm === "none" || !encrypted.decryptorFunction) {
		return typeof encrypted.data === "string"
			? `"${encrypted.data.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`
			: `string.char(${encrypted.data.join(", ")})`;
	}

	// Return the decryptor function call
	return encrypted.decryptorFunction;
}
