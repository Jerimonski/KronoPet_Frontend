// Base de datos en memoria que simula el backend. Persiste en
// localStorage para que los registros creados sobrevivan a una recarga.
// Solo la usan core/api y los hooks de lectura de cada feature.

import { useSyncExternalStore } from "react";
import { createSeed, type DbState } from "./seed";

const STORAGE_KEY = "kronopet:mock-db:v6";

function load(): DbState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as DbState;
  } catch {
    // Datos corruptos o storage bloqueado: se vuelve a la semilla.
  }
  return createSeed();
}

let state: DbState = load();
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Sin storage disponible: los cambios quedan solo en memoria.
  }
}

export function getDb(): DbState {
  return state;
}

export function updateDb(updater: (current: DbState) => DbState) {
  state = updater(state);
  persist();
  listeners.forEach((listener) => listener());
}

export function resetDb() {
  updateDb(() => createSeed());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Suscribe un componente a la base simulada. */
export function useDb(): DbState {
  return useSyncExternalStore(subscribe, getDb);
}
