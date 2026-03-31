import { TimeEntry } from "./types";

const STORAGE_KEY = "tidsapp_entries";

function getAll(): TimeEntry[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveAll(entries: TimeEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getEntries(userId: string): TimeEntry[] {
  return getAll()
    .filter((e) => e.user_id === userId)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
}

export function addEntry(
  entry: Omit<TimeEntry, "id" | "created_at">
): TimeEntry {
  const all = getAll();
  const newEntry: TimeEntry = {
    ...entry,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  all.push(newEntry);
  saveAll(all);
  return newEntry;
}

export function deleteEntry(id: string, userId: string): void {
  const all = getAll().filter((e) => !(e.id === id && e.user_id === userId));
  saveAll(all);
}

export function getEntryCount(userId: string): number {
  return getAll().filter((e) => e.user_id === userId).length;
}
