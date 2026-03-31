import { User, AuthSession } from "./types";

const USERS_KEY = "tidsapp_users";
const SESSION_KEY = "tidsapp_session";

function getUsers(): User[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
}

function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function signIn(email: string): AuthSession {
  const users = getUsers();
  let user = users.find((u) => u.email === email);

  if (!user) {
    user = {
      id: crypto.randomUUID(),
      email,
      is_pro: false,
    };
    users.push(user);
    saveUsers(users);
  }

  const session: AuthSession = { user };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function signOut(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getSession(): AuthSession {
  if (typeof window === "undefined") return { user: null };
  const data = localStorage.getItem(SESSION_KEY);
  if (!data) return { user: null };
  return JSON.parse(data);
}

export function upgradeToPro(userId: string): void {
  const users = getUsers();
  const user = users.find((u) => u.id === userId);
  if (user) {
    user.is_pro = true;
    saveUsers(users);
    const session = getSession();
    if (session.user?.id === userId) {
      session.user.is_pro = true;
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
  }
}
