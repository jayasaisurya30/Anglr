import { getDb, type QueuedCatch } from "./db";
import type { CatchFormInput } from "@/lib/validators/catch";

function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `offline_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export async function queueCatch(values: CatchFormInput, files: File[]) {
  const db = await getDb();
  const entry: QueuedCatch = {
    id: uid(),
    created_at: new Date().toISOString(),
    values,
    files: files.map((f) => ({ name: f.name, type: f.type, blob: f })),
  };
  await db.put("queued_catches", entry);
  return entry;
}

export async function listQueued(): Promise<QueuedCatch[]> {
  const db = await getDb();
  return db.getAll("queued_catches");
}

export async function removeQueued(id: string) {
  const db = await getDb();
  await db.delete("queued_catches", id);
}

export async function queueSize(): Promise<number> {
  const db = await getDb();
  return db.count("queued_catches");
}
