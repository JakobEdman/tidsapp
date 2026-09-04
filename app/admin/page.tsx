"use client";

import { useState, useEffect, useCallback } from "react";
import { User } from "@/lib/types";
import {
  getAllUsers,
  adminCreateUser,
  adminDeleteUser,
  adminResetPassword,
} from "@/lib/auth";
import {
  getAllFeedback,
  updateFeedbackStatus,
  updateFeedbackNotes,
  deleteFeedback,
  getAllReleaseNotes,
  publishReleaseNote,
  deactivateReleaseNote,
  Feedback,
  FeedbackStatus,
  FeedbackType,
  ReleaseNote,
} from "@/lib/feedback";

const ADMIN_PASSWORD = "Lars123";

type Tab = "users" | "feedback" | "release";

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [adminPw, setAdminPw] = useState("");
  const [authError, setAuthError] = useState("");
  const [tab, setTab] = useState<Tab>("feedback");

  // Users
  const [users, setUsers] = useState<User[]>([]);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [resetPw, setResetPw] = useState("");

  // Feedback
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | FeedbackStatus>(
    "all"
  );
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState("");

  // Release notes
  const [releaseNotes, setReleaseNotes] = useState<ReleaseNote[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [publishError, setPublishError] = useState("");
  const [publishSuccess, setPublishSuccess] = useState("");

  const refreshAll = useCallback(async () => {
    const [u, f, r] = await Promise.all([
      getAllUsers(),
      getAllFeedback(),
      getAllReleaseNotes(),
    ]);
    setUsers(u);
    setFeedback(f);
    setReleaseNotes(r);
  }, []);

  useEffect(() => {
    if (authenticated) {
      refreshAll();
    }
  }, [authenticated, refreshAll]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPw === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Fel admin-lösenord.");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    setCreateSuccess("");

    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) {
      setCreateError("Fyll i alla fält.");
      return;
    }

    const result = await adminCreateUser(
      newName.trim(),
      newEmail.trim(),
      newPassword.trim()
    );
    if (!result.success) {
      setCreateError(result.error || "Kunde inte skapa användare.");
      return;
    }

    try {
      const emailRes = await fetch("/api/send-welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          email: newEmail.trim(),
          password: newPassword.trim(),
        }),
      });
      const emailData = await emailRes.json();
      if (emailData.success) {
        setCreateSuccess(
          `Konto skapat för ${newName.trim()} — välkomstmail skickat!`
        );
      } else {
        setCreateSuccess(
          `Konto skapat för ${newName.trim()} (mail kunde inte skickas).`
        );
      }
    } catch {
      setCreateSuccess(
        `Konto skapat för ${newName.trim()} (mail kunde inte skickas).`
      );
    }

    setNewName("");
    setNewEmail("");
    setNewPassword("");
    await refreshAll();
    setTimeout(() => setCreateSuccess(""), 5000);
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Ta bort ${user.name} (${user.email})?`)) return;
    await adminDeleteUser(user.id);
    await refreshAll();
  };

  const handleResetPassword = async (userId: string) => {
    if (!resetPw.trim()) return;
    await adminResetPassword(userId, resetPw.trim());
    setResetUserId(null);
    setResetPw("");
    await refreshAll();
  };

  const handleStatusChange = async (id: string, status: FeedbackStatus) => {
    await updateFeedbackStatus(id, status);
    await refreshAll();
  };

  const handleDeleteFeedback = async (id: string) => {
    if (!confirm("Ta bort denna feedback?")) return;
    await deleteFeedback(id);
    await refreshAll();
  };

  const handleSaveNotes = async (id: string) => {
    await updateFeedbackNotes(id, notesDraft);
    setEditingNotesId(null);
    setNotesDraft("");
    await refreshAll();
  };

  const handlePublishReleaseNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishError("");
    setPublishSuccess("");
    const result = await publishReleaseNote(newTitle, newBody);
    if (!result.success) {
      setPublishError(result.error || "Kunde inte publicera.");
      return;
    }
    setNewTitle("");
    setNewBody("");
    setPublishSuccess(
      "Publicerad! Alla användare ser den vid nästa besök tills de tryckt 'Okej, läst'."
    );
    await refreshAll();
    setTimeout(() => setPublishSuccess(""), 6000);
  };

  const handleDeactivateRelease = async (id: string) => {
    if (!confirm("Inaktivera detta meddelande? Det visas inte längre för nya användare.")) return;
    await deactivateReleaseNote(id);
    await refreshAll();
  };

  const filteredFeedback =
    statusFilter === "all"
      ? feedback
      : feedback.filter((f) => f.status === statusFilter);

  const newCount = feedback.filter((f) => f.status === "new").length;

  if (!authenticated) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-4 py-8 bg-gray-50">
        <div className="w-full max-w-sm">
          <form
            onSubmit={handleAdminLogin}
            className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-sm"
          >
            <h2 className="font-semibold text-lg">Admin</h2>
            <div>
              <label className="text-xs text-gray-500 block mb-1">
                Admin-lösenord
              </label>
              <input
                type="password"
                value={adminPw}
                onChange={(e) => setAdminPw(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base"
                required
              />
            </div>
            {authError && <p className="text-sm text-red-600">{authError}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 active:bg-blue-700 text-white rounded-lg px-4 py-3 font-medium text-base"
            >
              Logga in
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="px-4 py-3 max-w-2xl mx-auto space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-blue-600">Admin</h1>
            <a
              href="/"
              className="text-xs text-gray-500 border border-gray-300 rounded-lg px-3 py-1.5"
            >
              Till appen →
            </a>
          </div>
          <div className="flex gap-1.5 overflow-x-auto">
            <TabBtn active={tab === "feedback"} onClick={() => setTab("feedback")}>
              Feedback
              {newCount > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                  {newCount}
                </span>
              )}
            </TabBtn>
            <TabBtn active={tab === "release"} onClick={() => setTab("release")}>
              Meddelanden
            </TabBtn>
            <TabBtn active={tab === "users"} onClick={() => setTab("users")}>
              Användare
            </TabBtn>
          </div>
        </div>
      </div>

      <main className="px-4 pt-5 pb-8 space-y-5 max-w-2xl mx-auto">
        {tab === "feedback" && (
          <>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-base">
                  Feedback ({feedback.length})
                </h2>
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as "all" | FeedbackStatus)
                  }
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white"
                >
                  <option value="all">Alla</option>
                  <option value="new">Nya</option>
                  <option value="in_progress">Pågående</option>
                  <option value="done">Klara</option>
                </select>
              </div>

              {filteredFeedback.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">
                  Ingen feedback i denna kategori.
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredFeedback.map((f) => (
                    <FeedbackCard
                      key={f.id}
                      item={f}
                      onStatusChange={(s) => handleStatusChange(f.id, s)}
                      onDelete={() => handleDeleteFeedback(f.id)}
                      isEditingNotes={editingNotesId === f.id}
                      notesDraft={editingNotesId === f.id ? notesDraft : f.admin_notes || ""}
                      onStartEditNotes={() => {
                        setEditingNotesId(f.id);
                        setNotesDraft(f.admin_notes || "");
                      }}
                      onCancelNotes={() => {
                        setEditingNotesId(null);
                        setNotesDraft("");
                      }}
                      onChangeNotes={setNotesDraft}
                      onSaveNotes={() => handleSaveNotes(f.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {tab === "release" && (
          <>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
              <h2 className="font-semibold text-base">
                Publicera nytt meddelande
              </h2>
              <p className="text-sm text-gray-500">
                Visas som popup för alla användare första gången de öppnar
                appen — försvinner när de tryckt &quot;Okej, läst&quot;.
              </p>
              <form onSubmit={handlePublishReleaseNote} className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Titel
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="t.ex. Ny funktion: ..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Text
                  </label>
                  <textarea
                    value={newBody}
                    onChange={(e) => setNewBody(e.target.value)}
                    rows={5}
                    placeholder="Beskriv vad som är nytt..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base min-h-[8rem] resize-y"
                  />
                </div>
                {publishError && (
                  <p className="text-sm text-red-600">{publishError}</p>
                )}
                {publishSuccess && (
                  <p className="text-sm text-green-600">{publishSuccess}</p>
                )}
                <button
                  type="submit"
                  className="w-full bg-blue-600 active:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium text-base"
                >
                  Publicera
                </button>
              </form>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
              <h2 className="font-semibold text-base">
                Historik ({releaseNotes.length})
              </h2>
              {releaseNotes.length === 0 ? (
                <p className="text-sm text-gray-500">Inga meddelanden ännu.</p>
              ) : (
                <div className="space-y-3">
                  {releaseNotes.map((r) => (
                    <div
                      key={r.id}
                      className="p-3 border border-gray-200 rounded-lg space-y-1.5"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium text-sm">{r.title}</h3>
                            {r.is_active ? (
                              <span className="text-[10px] font-semibold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full uppercase">
                                Aktiv
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full uppercase">
                                Inaktiv
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(r.published_at).toLocaleString("sv-SE")}
                          </p>
                        </div>
                        {r.is_active && (
                          <button
                            onClick={() => handleDeactivateRelease(r.id)}
                            className="text-xs text-red-500 active:text-red-700 font-medium shrink-0"
                          >
                            Inaktivera
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">
                        {r.body}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {tab === "users" && (
          <>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
              <h2 className="font-semibold text-base">Skapa ny användare</h2>
              <form onSubmit={handleCreateUser} className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Namn
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Förnamn Efternamn"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    E-post
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="namn@foretag.se"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Lösenord
                  </label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Välj lösenord"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base"
                  />
                </div>
                {createError && (
                  <p className="text-sm text-red-600">{createError}</p>
                )}
                {createSuccess && (
                  <p className="text-sm text-green-600">{createSuccess}</p>
                )}
                <button
                  type="submit"
                  className="w-full bg-green-600 active:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium text-base"
                >
                  Skapa användare
                </button>
              </form>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
              <h2 className="font-semibold text-base">
                Registrerade användare ({users.length})
              </h2>

              {users.length === 0 ? (
                <p className="text-sm text-gray-500">Inga användare ännu.</p>
              ) : (
                <div className="space-y-3">
                  {users.map((u) => (
                    <div
                      key={u.id}
                      className="p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <div className="font-medium text-base">{u.name}</div>
                          <div className="text-sm text-gray-500 truncate">
                            {u.email}
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => {
                              setResetUserId(
                                resetUserId === u.id ? null : u.id
                              );
                              setResetPw("");
                            }}
                            className="text-xs text-blue-600 active:text-blue-800 font-medium"
                          >
                            Byt lösenord
                          </button>
                          <button
                            onClick={() => handleDelete(u)}
                            className="text-xs text-red-500 active:text-red-700 font-medium"
                          >
                            Ta bort
                          </button>
                        </div>
                      </div>

                      {resetUserId === u.id && (
                        <div className="mt-2 flex gap-2">
                          <input
                            type="text"
                            value={resetPw}
                            onChange={(e) => setResetPw(e.target.value)}
                            placeholder="Nytt lösenord"
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          />
                          <button
                            onClick={() => handleResetPassword(u.id)}
                            className="bg-blue-600 active:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium shrink-0"
                          >
                            Spara
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
        active
          ? "bg-blue-600 text-white"
          : "bg-gray-100 text-gray-700 active:bg-gray-200"
      }`}
    >
      {children}
    </button>
  );
}

const TYPE_LABEL: Record<FeedbackType, string> = {
  bug: "Bugg",
  request: "Önskemål",
  other: "Övrigt",
};

const TYPE_STYLE: Record<FeedbackType, string> = {
  bug: "bg-red-100 text-red-700",
  request: "bg-blue-100 text-blue-700",
  other: "bg-gray-100 text-gray-700",
};

const STATUS_LABEL: Record<FeedbackStatus, string> = {
  new: "Ny",
  in_progress: "Pågående",
  done: "Klar",
};

const STATUS_STYLE: Record<FeedbackStatus, string> = {
  new: "bg-amber-100 text-amber-800",
  in_progress: "bg-blue-100 text-blue-700",
  done: "bg-green-100 text-green-700",
};

function FeedbackCard({
  item,
  onStatusChange,
  onDelete,
  isEditingNotes,
  notesDraft,
  onStartEditNotes,
  onCancelNotes,
  onChangeNotes,
  onSaveNotes,
}: {
  item: Feedback;
  onStatusChange: (s: FeedbackStatus) => void;
  onDelete: () => void;
  isEditingNotes: boolean;
  notesDraft: string;
  onStartEditNotes: () => void;
  onCancelNotes: () => void;
  onChangeNotes: (s: string) => void;
  onSaveNotes: () => void;
}) {
  return (
    <div className="p-3 border border-gray-200 rounded-lg space-y-2.5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase ${
              TYPE_STYLE[item.type]
            }`}
          >
            {TYPE_LABEL[item.type]}
          </span>
          <span
            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase ${
              STATUS_STYLE[item.status]
            }`}
          >
            {STATUS_LABEL[item.status]}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {new Date(item.created_at).toLocaleString("sv-SE")}
        </span>
      </div>

      <div className="text-sm">
        <span className="font-medium">{item.user_name || "Okänd"}</span>
        {item.user_email && (
          <span className="text-gray-500"> · {item.user_email}</span>
        )}
      </div>

      <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.message}</p>

      <div>
        {isEditingNotes ? (
          <div className="space-y-2">
            <label className="text-xs text-gray-500 block">
              Interna anteckningar (visas bara här)
            </label>
            <textarea
              value={notesDraft}
              onChange={(e) => onChangeNotes(e.target.value)}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm min-h-[3.5rem] resize-y"
            />
            <div className="flex gap-2">
              <button
                onClick={onSaveNotes}
                className="bg-blue-600 active:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
              >
                Spara anteckning
              </button>
              <button
                onClick={onCancelNotes}
                className="bg-gray-200 active:bg-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium"
              >
                Avbryt
              </button>
            </div>
          </div>
        ) : item.admin_notes ? (
          <button
            onClick={onStartEditNotes}
            className="block w-full text-left bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs text-gray-600 active:bg-gray-100"
          >
            <span className="font-medium text-gray-500">Anteckning: </span>
            {item.admin_notes}
            <span className="text-blue-600 ml-1">redigera</span>
          </button>
        ) : (
          <button
            onClick={onStartEditNotes}
            className="text-xs text-blue-600 active:text-blue-800 font-medium"
          >
            + Lägg till anteckning
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 items-center pt-1 border-t border-gray-100">
        <select
          value={item.status}
          onChange={(e) => onStatusChange(e.target.value as FeedbackStatus)}
          className="border border-gray-300 rounded-lg px-2 py-1 text-xs bg-white"
        >
          <option value="new">Ny</option>
          <option value="in_progress">Pågående</option>
          <option value="done">Klar</option>
        </select>
        <button
          onClick={onDelete}
          className="text-xs text-red-500 active:text-red-700 font-medium ml-auto"
        >
          Ta bort
        </button>
      </div>
    </div>
  );
}
