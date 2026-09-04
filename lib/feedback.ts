import { supabase } from "./supabase";

export type FeedbackType = "bug" | "request" | "other";
export type FeedbackStatus = "new" | "in_progress" | "done";

export interface Feedback {
  id: string;
  user_id: string | null;
  user_name: string | null;
  user_email: string | null;
  type: FeedbackType;
  message: string;
  status: FeedbackStatus;
  admin_notes: string;
  created_at: string;
}

export interface ReleaseNote {
  id: string;
  title: string;
  body: string;
  published_at: string;
  is_active: boolean;
}

export async function submitFeedback(args: {
  user_id: string | null;
  user_name: string | null;
  user_email: string | null;
  type: FeedbackType;
  message: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!args.message.trim()) {
    return { success: false, error: "Skriv ett meddelande." };
  }

  const { error } = await supabase.from("feedback").insert({
    user_id: args.user_id,
    user_name: args.user_name,
    user_email: args.user_email,
    type: args.type,
    message: args.message.trim(),
    status: "new",
  });

  if (error) {
    console.error("submitFeedback error:", error);
    return { success: false, error: "Kunde inte skicka feedback. Försök igen." };
  }
  return { success: true };
}

export async function getAllFeedback(): Promise<Feedback[]> {
  const { data, error } = await supabase
    .from("feedback")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as Feedback[];
}

export async function updateFeedbackStatus(
  id: string,
  status: FeedbackStatus
): Promise<boolean> {
  const { error } = await supabase
    .from("feedback")
    .update({ status })
    .eq("id", id);
  return !error;
}

export async function updateFeedbackNotes(
  id: string,
  admin_notes: string
): Promise<boolean> {
  const { error } = await supabase
    .from("feedback")
    .update({ admin_notes })
    .eq("id", id);
  return !error;
}

export async function deleteFeedback(id: string): Promise<boolean> {
  const { error } = await supabase.from("feedback").delete().eq("id", id);
  return !error;
}

export async function getLatestActiveReleaseNote(): Promise<ReleaseNote | null> {
  const { data, error } = await supabase
    .from("release_notes")
    .select("*")
    .eq("is_active", true)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return data as ReleaseNote;
}

export async function getAllReleaseNotes(): Promise<ReleaseNote[]> {
  const { data, error } = await supabase
    .from("release_notes")
    .select("*")
    .order("published_at", { ascending: false });
  if (error || !data) return [];
  return data as ReleaseNote[];
}

export async function publishReleaseNote(
  title: string,
  body: string
): Promise<{ success: boolean; error?: string }> {
  if (!title.trim() || !body.trim()) {
    return { success: false, error: "Fyll i både titel och text." };
  }
  // Inaktivera tidigare aktiva release notes så bara den senaste visas
  await supabase
    .from("release_notes")
    .update({ is_active: false })
    .eq("is_active", true);

  const { error } = await supabase.from("release_notes").insert({
    title: title.trim(),
    body: body.trim(),
    is_active: true,
  });

  if (error) {
    console.error("publishReleaseNote error:", error);
    return { success: false, error: "Kunde inte publicera." };
  }
  return { success: true };
}

export async function deactivateReleaseNote(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("release_notes")
    .update({ is_active: false })
    .eq("id", id);
  return !error;
}
