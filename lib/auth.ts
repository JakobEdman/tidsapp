import bcrypt from "bcryptjs";
import { supabase } from "./supabase";
import { User, AuthSession } from "./types";

const SESSION_KEY = "tidsapp_session";
const SESSION_MAX_AGE_DAYS = 30;
const BCRYPT_ROUNDS = 10;

function isBcryptHash(value: string | null | undefined): boolean {
  if (!value) return false;
  return /^\$2[aby]\$\d{2}\$/.test(value);
}

async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

async function comparePassword(plain: string, stored: string): Promise<boolean> {
  if (isBcryptHash(stored)) {
    return bcrypt.compare(plain, stored);
  }
  // Legacy klartext-lösenord (gammal data, ska bytas vid inloggning)
  return plain === stored;
}

function mapUser(data: Record<string, unknown>): User {
  return {
    id: data.id as string,
    email: data.email as string,
    name: data.name as string,
    password: data.password as string,
    is_pro: data.is_pro as boolean,
    must_change_password: (data.must_change_password ?? false) as boolean,
  };
}

export async function signIn(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; must_change_password?: boolean }> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase())
    .single();

  if (error || !data) {
    return { success: false, error: "Inget konto med den e-postadressen." };
  }

  const ok = await comparePassword(password, data.password);
  if (!ok) {
    return { success: false, error: "Fel l\u00f6senord." };
  }

  // Migrera tysta gamla klartext-lösenord till bcrypt vid lyckad inloggning
  if (!isBcryptHash(data.password)) {
    const hashed = await hashPassword(password);
    await supabase
      .from("users")
      .update({ password: hashed })
      .eq("id", data.id);
    data.password = hashed;
  }

  const user = mapUser(data);
  const session: AuthSession = {
    user,
    expires_at: Date.now() + SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));

  return { success: true, must_change_password: user.must_change_password };
}

export function signOut(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}

export function getSession(): AuthSession {
  if (typeof window === "undefined") return { user: null };
  const data = localStorage.getItem(SESSION_KEY);
  if (!data) return { user: null };
  try {
    const session = JSON.parse(data) as AuthSession;
    if (session.expires_at && session.expires_at < Date.now()) {
      localStorage.removeItem(SESSION_KEY);
      return { user: null };
    }
    return session;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return { user: null };
  }
}

export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; user?: User }> {
  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanName) return { success: false, error: "Ange namn." };
  if (!cleanEmail) return { success: false, error: "Ange e-postadress." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) {
    return { success: false, error: "Ogiltig e-postadress." };
  }
  if (!password) return { success: false, error: "Ange l\u00f6senord." };

  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("email", cleanEmail)
    .maybeSingle();

  if (existing) {
    return { success: false, error: "E-postadressen \u00e4r redan registrerad." };
  }

  const hashed = await hashPassword(password);

  const { data, error } = await supabase
    .from("users")
    .insert({
      name: cleanName,
      email: cleanEmail,
      password: hashed,
      is_pro: false,
      must_change_password: false,
    })
    .select("*")
    .single();

  if (error || !data) {
    console.error("registerUser error:", error);
    return { success: false, error: "Kunde inte skapa konto. F\u00f6rs\u00f6k igen." };
  }

  const user = mapUser(data);
  const session: AuthSession = {
    user,
    expires_at: Date.now() + SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));

  return { success: true, user };
}

export async function requestPasswordReset(
  email: string
): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return { success: false, error: "Ange e-postadress." };

  // Vi anropar API-route som genererar token, sparar i DB och skickar mail.
  // API:t svarar alltid "success" för att inte avslöja vilka e-postadresser som finns.
  try {
    const res = await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail }),
    });
    if (!res.ok) {
      return { success: false, error: "Kunde inte skicka e-post. F\u00f6rs\u00f6k igen senare." };
    }
    return { success: true };
  } catch {
    return { success: false, error: "N\u00e4tverksfel. F\u00f6rs\u00f6k igen." };
  }
}

export async function resetPasswordWithToken(
  token: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  if (!token) return { success: false, error: "Ogiltig l\u00e4nk." };
  if (!newPassword) return { success: false, error: "Ange ett nytt l\u00f6senord." };

  // Sök efter användare med matchande token
  const { data: user, error: lookupError } = await supabase
    .from("users")
    .select("id, password_reset_expires")
    .eq("password_reset_token", token)
    .maybeSingle();

  if (lookupError || !user) {
    return { success: false, error: "L\u00e4nken \u00e4r ogiltig eller redan anv\u00e4nd." };
  }

  if (user.password_reset_expires) {
    const expiresAt = new Date(user.password_reset_expires).getTime();
    if (expiresAt < Date.now()) {
      return { success: false, error: "L\u00e4nken har g\u00e5tt ut. Beg\u00e4r en ny." };
    }
  }

  const hashed = await hashPassword(newPassword);

  const { error: updateError } = await supabase
    .from("users")
    .update({
      password: hashed,
      password_reset_token: null,
      password_reset_expires: null,
      must_change_password: false,
    })
    .eq("id", user.id);

  if (updateError) {
    console.error("resetPasswordWithToken error:", updateError);
    return { success: false, error: "Kunde inte uppdatera l\u00f6senordet." };
  }

  return { success: true };
}

export async function changePassword(
  userId: string,
  newPassword: string
): Promise<boolean> {
  const hashed = await hashPassword(newPassword);
  const { error } = await supabase
    .from("users")
    .update({ password: hashed, must_change_password: false })
    .eq("id", userId);

  if (error) return false;

  const session = getSession();
  if (session.user?.id === userId) {
    session.user.password = hashed;
    session.user.must_change_password = false;
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
  return true;
}

export async function updateUser(
  userId: string,
  updates: Partial<Pick<User, "name" | "email">>
): Promise<boolean> {
  if (updates.email) {
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", updates.email.toLowerCase())
      .neq("id", userId)
      .maybeSingle();

    if (existing) return false;
    updates.email = updates.email.toLowerCase();
  }

  const { error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId);

  if (error) return false;

  const session = getSession();
  if (session.user?.id === userId) {
    session.user = { ...session.user, ...updates };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
  return true;
}

// Admin functions
export async function getAllUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data.map(mapUser);
}

export async function adminCreateUser(
  name: string,
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  const hashed = await hashPassword(password);
  const { error } = await supabase
    .from("users")
    .insert({
      name,
      email: email.toLowerCase(),
      password: hashed,
      is_pro: false,
      must_change_password: true,
    });

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "E-postadressen finns redan." };
    }
    return { success: false, error: "Kunde inte skapa anv\u00e4ndare." };
  }
  return { success: true };
}

export async function adminDeleteUser(userId: string): Promise<boolean> {
  const { error } = await supabase.from("users").delete().eq("id", userId);
  return !error;
}

export async function adminResetPassword(
  userId: string,
  newPassword: string
): Promise<boolean> {
  const hashed = await hashPassword(newPassword);
  const { error } = await supabase
    .from("users")
    .update({ password: hashed, must_change_password: true })
    .eq("id", userId);
  return !error;
}
