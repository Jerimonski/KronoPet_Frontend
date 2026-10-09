// Almacén de archivos adjuntos para el modo simulado. Los binarios van a
// IndexedDB (localStorage no soporta archivos ni su tamaño); los metadatos
// viven en la base simulada. Con backend real, esto lo reemplaza un
// almacenamiento de objetos (S3, GCS...) detrás de la API.

const DB_NAME = "kronopet-files";
const STORE = "files";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const request = action(db.transaction(STORE, mode).objectStore(STORE));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function putFile(id: string, blob: Blob): Promise<void> {
  await run("readwrite", (store) => store.put(blob, id));
}

export async function getFile(id: string): Promise<Blob | undefined> {
  return run<Blob | undefined>("readonly", (store) => store.get(id));
}

export async function deleteFiles(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id) => run("readwrite", (store) => store.delete(id))));
}
