import { supabase } from "./supabase";
import { TimeEntry } from "./types";

export async function getEntries(userId: string): Promise<TimeEntry[]> {
  const { data, error } = await supabase
    .from("time_entries")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((e) => ({
    id: e.id,
    project: e.project,
    activity: e.activity,
    start_time: e.start_time || "",
    end_time: e.end_time || "",
    duration: e.duration || "",
    entry_date: e.entry_date || "",
    notes: e.notes || "",
    user_id: e.user_id,
    created_at: e.created_at,
  }));
}

export async function addEntry(
  entry: Omit<TimeEntry, "id" | "created_at">
): Promise<TimeEntry | null> {
  const { data, error } = await supabase
    .from("time_entries")
    .insert({
      user_id: entry.user_id,
      project: entry.project || "Övrigt",
      activity: entry.activity || "",
      start_time: entry.start_time || "",
      end_time: entry.end_time || "",
      duration: entry.duration || "",
      entry_date: entry.entry_date || new Date().toISOString().slice(0, 10),
      notes: entry.notes || "",
    })
    .select()
    .single();

  if (error) {
    console.error("addEntry error:", error.message, error.details, error.hint);
    return null;
  }
  if (!data) return null;
  return data as TimeEntry;
}

export async function deleteEntry(
  id: string,
  userId: string
): Promise<boolean> {
  const { error } = await supabase
    .from("time_entries")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  return !error;
}

export async function updateEntry(
  id: string,
  userId: string,
  updates: Partial<Omit<TimeEntry, "id" | "created_at" | "user_id">>
): Promise<boolean> {
  const { error } = await supabase
    .from("time_entries")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId);
  return !error;
}
