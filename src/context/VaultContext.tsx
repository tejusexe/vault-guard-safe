import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { decryptBytes, decryptJson, encryptJson, deriveKeyFromPin, randomBytes, toBase64, fromBase64, type EncryptedPayload, type VaultMeta } from "@/lib/crypto";

export type AccountItem = { id: string; title: string; username: string; password: string };
export type LinkItem = { id: string; title: string; url: string };
export type Category<T> = { id: string; name: string; items: T[] };

export type VaultData = {
  accounts: { categories: Category<AccountItem>[] };
  links: { categories: Category<LinkItem>[] };
};

const EMPTY_VAULT: VaultData = { accounts: { categories: [] }, links: { categories: [] } };

const META_KEY = "vault.meta";
const DATA_KEY = "vault.data";

interface VaultContextValue {
  isSetup: boolean;
  isUnlocked: boolean;
  pinLength: number;
  data: VaultData | null;
  setupPin: (pin: string, digits: number) => Promise<void>;
  unlock: (pin: string) => Promise<boolean>;
  lock: () => void;
  saveData: (updater: (prev: VaultData) => VaultData) => Promise<void>;
}

const VaultContext = createContext<VaultContextValue | undefined>(undefined);

export const useVault = () => {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error("useVault must be used within VaultProvider");
  return ctx;
};

export const VaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [meta, setMeta] = useState<VaultMeta | null>(null);
  const [dekKey, setDekKey] = useState<CryptoKey | null>(null);
  const [data, setData] = useState<VaultData | null>(null);
  const [isUnlocked, setUnlocked] = useState(false);

  useEffect(() => {
    const m = localStorage.getItem(META_KEY);
    if (m) setMeta(JSON.parse(m));
  }, []);

  const isSetup = !!meta;
  const pinLength = meta?.digits ?? 6;

  const setupPin = useCallback(async (pin: string, digits: number) => {
    // Delegate to fixed implementation
    await setupPinFixed(pin, digits);
  }, [/* no deps */]);

  // Re-implement setupPin's DEK decrypt cleanly to avoid TS issues
  const setupPinFixed = useCallback(async (pin: string, digits: number) => {
    const salt = toBase64(randomBytes(16).buffer);
    const iterations = 250000;
    const kek = await deriveKeyFromPin(pin, salt, iterations);

    // Generate DEK
    const rawDek = randomBytes(32).buffer;
    const payload = await encryptJson(kek, { dek: toBase64(rawDek) });

    const newMeta: VaultMeta = {
      salt,
      iterations,
      encDek: payload.data,
      encDekIv: payload.iv,
      digits,
      createdAt: Date.now(),
    };

    localStorage.setItem(META_KEY, JSON.stringify(newMeta));
    setMeta(newMeta);

    const decrypted = await decryptJson<{ dek: string }>(kek, { iv: payload.iv, data: payload.data });
    const dekBytes = fromBase64(decrypted.dek);
    const dek = await crypto.subtle.importKey("raw", dekBytes, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
    setDekKey(dek);
    setUnlocked(true);

    // Initialize empty vault
    const encData = await encryptJson(dek, EMPTY_VAULT);
    localStorage.setItem(DATA_KEY, JSON.stringify(encData));
    setData(EMPTY_VAULT);
  }, []);

  // Alias to the fixed implementation
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _setupPin = setupPin; // keep for reference

  const unlock = useCallback(async (pin: string) => {
    if (!meta) return false;
    try {
      const kek = await deriveKeyFromPin(pin, meta.salt, meta.iterations);
      const decrypted = await decryptJson<{ dek: string }>(kek, { iv: meta.encDekIv, data: meta.encDek });
      const dekBytes = fromBase64(decrypted.dek);
      const dek = await crypto.subtle.importKey("raw", dekBytes, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
      setDekKey(dek);
      setUnlocked(true);

      const stored = localStorage.getItem(DATA_KEY);
      if (stored) {
        const payload: EncryptedPayload = JSON.parse(stored);
        const parsed = await decryptJson<VaultData>(dek, payload);
        setData(parsed);
      } else {
        // initialize empty vault if missing
        const encData = await encryptJson(dek, EMPTY_VAULT);
        localStorage.setItem(DATA_KEY, JSON.stringify(encData));
        setData(EMPTY_VAULT);
      }
      return true;
    } catch (e) {
      console.error("Unlock failed", e);
      return false;
    }
  }, [meta]);

  const lock = useCallback(() => {
    setDekKey(null);
    setUnlocked(false);
    setData(null);
  }, []);

  const saveData = useCallback(async (updater: (prev: VaultData) => VaultData) => {
    if (!dekKey) throw new Error("Vault is locked");
    const next = updater(data ?? EMPTY_VAULT);
    const enc = await encryptJson(dekKey, next);
    localStorage.setItem(DATA_KEY, JSON.stringify(enc));
    setData(next);
  }, [dekKey, data]);

  const value = useMemo<VaultContextValue>(() => ({
    isSetup,
    isUnlocked,
    pinLength,
    data,
    setupPin: setupPinFixed,
    unlock,
    lock,
    saveData,
  }), [isSetup, isUnlocked, pinLength, data, setupPinFixed, unlock, lock, saveData]);

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
};
