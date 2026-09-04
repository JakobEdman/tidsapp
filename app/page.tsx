"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getSession, signOut } from "@/lib/auth";
import { getEntries, addEntry, deleteEntry, updateEntry } from "@/lib/storage";
import { TimeEntry, User } from "@/lib/types";
import Navbar from "@/components/Navbar";
import Recorder from "@/components/Recorder";
import EntryForm from "@/components/EntryForm";
import EntryList from "@/components/EntryList";
import InstructionsPanel from "@/components/InstructionsPanel";
import AccountModal from "@/components/AccountModal";
import FeedbackButton from "@/components/FeedbackButton";
import ReleaseNoteModal from "@/components/ReleaseNoteModal";

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAccount, setShowAccount] = useState(false);
  const router = useRouter();

  const refreshEntries = useCallback(async (userId: string) => {
    const data = await getEntries(userId);
    setEntries(data);
  }, []);

  useEffect(() => {
    const session = getSession();
    if (!session.user) {
      router.push("/login");
      return;
    }
    setUser(session.user);
    refreshEntries(session.user.id).then(() => setLoading(false));
  }, [router, refreshEntries]);

  const handleNewEntry = async (parsed: {
    project: string;
    activity: string;
    start_time: string;
    end_time: string;
    duration: string;
    entry_date: string;
  }) => {
    if (!user) return;
    const result = await addEntry({ ...parsed, user_id: user.id });
    if (!result) {
      alert("Kunde inte spara posten. Kontrollera att du är inloggad och försök igen.");
    }
    await refreshEntries(user.id);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    await deleteEntry(id, user.id);
    await refreshEntries(user.id);
  };

  const handleUpdate = async (id: string, updates: Partial<TimeEntry>) => {
    if (!user) return;
    await updateEntry(id, user.id, updates);
    await refreshEntries(user.id);
  };

  const handleSignOut = () => {
    signOut();
    router.push("/login");
  };

  if (loading) return <div className="p-6 text-center">Laddar...</div>;
  if (!user) return null;

  return (
    <div className="min-h-dvh bg-gray-50">
      <Navbar
        user={user}
        onSignOut={handleSignOut}
        onOpenAccount={() => setShowAccount(true)}
      />
      <main className="px-4 pt-5 pb-8 space-y-5 max-w-lg mx-auto">
        <InstructionsPanel />

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="font-semibold text-base">Ny tidspost</h2>
          <Recorder onEntryParsed={handleNewEntry} />
          <div className="border-t border-gray-100 pt-3">
            <EntryForm onSubmit={handleNewEntry} />
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-semibold text-base">
              Tidsposter ({entries.length})
            </h2>
            {entries.length > 5 && (
              <span className="text-xs text-gray-500">Scrolla för att se fler</span>
            )}
          </div>
          <div className="max-h-[26rem] overflow-y-auto rounded-xl">
            <EntryList
              entries={entries}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          </div>
        </div>

        <FeedbackButton user={user} />
      </main>

      <ReleaseNoteModal user={user} />

      {showAccount && (
        <AccountModal
          user={user}
          onClose={() => setShowAccount(false)}
          onUpdated={(updated) => {
            setUser(updated);
            setShowAccount(false);
          }}
        />
      )}
    </div>
  );
}
