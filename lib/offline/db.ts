import { openDB, type IDBPDatabase } from "idb";
import type { CatchFormInput } from "@/lib/validators/catch";

const DB_NAME = "anglr-offline";
const DB_VERSION = 1;

export interface QueuedCatch {
  id: string;
  created_at: string;
  values: CatchFormInput;
  files: {
    name: string;
    type: string;
    blob: Blob;
  }[];
}

interface OfflineSchema {
  queued_catches: {
    key: string;
    value: QueuedCatch;
  };
}

let dbPromise: Promise<IDBPDatabase<OfflineSchema>> | null = null;

export function getDb() {
  if (typeof window === "undefined") {
    throw new Error("IndexedDB is only available in the browser");
  }
  if (!dbPromise) {
    dbPromise = openDB<OfflineSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("queued_catches")) {
          db.createObjectStore("queued_catches", { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
}
