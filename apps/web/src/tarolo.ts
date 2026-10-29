// Helyi tárolás: IndexedDB („bimline” adatbázis, „projektek” tár). Ha az IndexedDB nem érhető el (privát ablak,
// beágyazott nézet), memóriában dolgozik; ezt a felület jelzi.
import type { Projekt } from '@bimline/model';

const DB = 'bimline';
const TAR = 'projektek';
let memoria: Map<string, Projekt> | null = null;

function megnyit(): Promise<IDBDatabase> {
  return new Promise((ok, hiba) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(TAR, { keyPath: 'azon' });
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
