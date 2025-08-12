// Crypto utilities for local AES-GCM encryption using Web Crypto API
// All values are encoded/decoded with base64 for storage

export type EncryptedPayload = {
  iv: string; // base64
  data: string; // base64
  updatedAt?: number;
};

export type VaultMeta = {
  salt: string; // base64
  iterations: number;
  encDek: string; // base64 encrypted DEK
  encDekIv: string; // base64 IV used to encrypt DEK
  digits: number; // PIN length
  createdAt: number;
};

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export function toBase64(bytes: ArrayBuffer): string {
  const arr = new Uint8Array(bytes);
  let str = "";
  for (let i = 0; i < arr.length; i++) str += String.fromCharCode(arr[i]);
  return btoa(str);
}

export function fromBase64(b64: string): ArrayBuffer {
  const str = atob(b64);
  const arr = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) arr[i] = str.charCodeAt(i);
  return arr.buffer;
}

export function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

export async function deriveKeyFromPin(pin: string, saltB64: string, iterations = 250000): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(pin),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const salt = fromBase64(saltB64);
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptBytes(key: CryptoKey, bytes: ArrayBuffer): Promise<EncryptedPayload> {
  const iv = randomBytes(12);
  const data = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, bytes);
  return { iv: toBase64(iv), data: toBase64(data), updatedAt: Date.now() };
}

export async function decryptBytes(key: CryptoKey, payload: EncryptedPayload): Promise<ArrayBuffer> {
  const iv = fromBase64(payload.iv);
  const data = fromBase64(payload.data);
  return crypto.subtle.decrypt({ name: "AES-GCM", iv: new Uint8Array(iv) }, key, data);
}

export async function encryptJson(key: CryptoKey, obj: unknown): Promise<EncryptedPayload> {
  const bytes = textEncoder.encode(JSON.stringify(obj));
  return encryptBytes(key, bytes.buffer);
}

export async function decryptJson<T = unknown>(key: CryptoKey, payload: EncryptedPayload): Promise<T> {
  const decrypted = await decryptBytes(key, payload);
  const text = textDecoder.decode(decrypted);
  return JSON.parse(text) as T;
}

export function uuid(): string {
  // simple UUID v4-like
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 0xf) >> 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
