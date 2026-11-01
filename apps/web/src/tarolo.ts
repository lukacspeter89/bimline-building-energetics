// Helyi tárolás: IndexedDB („bimline” adatbázis, „projektek” tár). Ha az IndexedDB nem érhető el (privát ablak,
// beágyazott nézet), memóriában dolgozik; ezt a felület jelzi.
import type { Projekt } from '@bimline/model';

const DB = 'bimline';
const TAR = 'projektek';
/** Az alaprajz-alátétek (nagy képek) külön tárban, a projekt JSON-ja nélkül. Kulcs: projekt|szint. */
const ALATET = 'alatetek';
const memoriaAlatet = new Map<string, unknown>();
let memoria: Map<string, Projekt> | null = null;

function megnyit(): Promise<IDBDatabase> {
  return new Promise((ok, hiba) => {
    const r = indexedDB.open(DB, 2);
    r.onupgradeneeded = () => {
      if (!r.result.objectStoreNames.contains(TAR)) r.result.createObjectStore(TAR, { keyPath: 'azon' });
      if (!r.result.objectStoreNames.contains(ALATET)) r.result.createObjectStore(ALATET);
    };
    r.onsuccess = () => ok(r.result);
    r.onerror = () => hiba(r.error);
  });
}

async function muvelet<T>(mod: IDBTransactionMode, f: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await megnyit();
  return new Promise((ok, hiba) => {
    const tx = db.transaction(TAR, mod);
    const r = f(tx.objectStore(TAR));
    r.onsuccess = () => ok(r.result);
    r.onerror = () => hiba(r.error);
  });
}

export async function tarolasElerheto(): Promise<boolean> {
  try {
    await megnyit();
    return true;
  } catch {
    memoria ??= new Map();
    return false;
  }
}

export async function projektek(): Promise<Projekt[]> {
  if (memoria) return [...memoria.values()];
  try {
    return await muvelet('readonly', (s) => s.getAll() as IDBRequest<Projekt[]>);
  } catch {
    memoria = new Map();
    return [];
  }
}

export async function ment(p: Projekt): Promise<void> {
  if (memoria) {
    memoria.set(p.azon, p);
    return;
  }
  await muvelet('readwrite', (s) => s.put(p));
}

export async function torol(azon: string): Promise<void> {
  if (memoria) {
    memoria.delete(azon);
    return;
  }
  await muvelet('readwrite', (s) => s.delete(azon));
}

async function alatetMuvelet<T>(mod: IDBTransactionMode, f: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await megnyit();
  return new Promise((ok, hiba) => {
    const tx = db.transaction(ALATET, mod);
    const r = f(tx.objectStore(ALATET));
    r.onsuccess = () => ok(r.result);
    r.onerror = () => hiba(r.error);
  });
}

export async function alatetBetolt<T>(projekt: string, szint: string): Promise<T | undefined> {
  const k = `${projekt}|${szint}`;
  if (memoria) return memoriaAlatet.get(k) as T | undefined;
  try {
    return (await alatetMuvelet('readonly', (s) => s.get(k) as IDBRequest<T | undefined>)) ?? undefined;
  } catch {
    return memoriaAlatet.get(k) as T | undefined;
  }
}

export async function alatetMent(projekt: string, szint: string, a: unknown): Promise<void> {
  const k = `${projekt}|${szint}`;
  memoriaAlatet.set(k, a);
  if (memoria) return;
  try {
    await alatetMuvelet('readwrite', (s) => (a === undefined ? s.delete(k) : s.put(a, k)) as IDBRequest<unknown>);
  } catch {
    /* memóriában marad */
  }
}
