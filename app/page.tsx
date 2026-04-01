"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, signOut } from "@/lib/auth";
import { getEntries, addEntry, deleteEntry, updateEntry } from "@/lib/storage";
import { TimeEntry, User } from "@/lib/types";
import Navbar from "@/components/Navbar";
import Recorder from "@/components/Recorder";
import EntryForm from "@/components/EntryForm";
import EntryList from "@/components/EntryList";

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (!session.user) {
      router.push("/login");
      return;
    }
    setUser(session.user);
    refreshEntries(session.user.id);
    setLoading(false);
  }, [router]);

  const refreshEntries = (userId: string) => {
    setEntries(getEntries(userId));
  };

  const handleNewEntry = (parsed: {
    project: string;
    activity: string;
    start_time: string;
    end_time: string;
    duration: string;
  }) => {
    if (!user) return;
    addEntry({ ...parsed, user_id: user.id });
    refreshEntries(user.id);
  };

  const handleDelete = (id: string) => {
    if (!user) return;
    deleteEntry(id, user.id);
    refreshEntries(user.id);
  };

  const handleUpdate = (id: string, updates: Partial<TimeEntry>) => {
    if (!user) return;
    updateEntry(id, user.id, updates);
    refreshEntries(user.id);
  };

  const handleSignOut = () => {
    signOut();
    router.push("/login");
  };

  if (loading) return <div className="p-6">Laddar...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onSignOut={handleSignOut} />
      <main className="max-w-3xl mx-auto p-4 sm:p-6 space-y-5">
        <div className="bg-white p-5 rounded-xl border space-y-4">
          <h2 className="font-semibold">Ny tidspost</h2>
          <Recorder onEntryParsed={handleNewEntry} />
          <EntryForm onSubmit={handleNewEntry} />
        </div>

        <div>
          <h2 className="font-semibold mb-3">
            Tidsposter ({entries.length})
          </h2>
          <EntryList
            entries={entries}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        </div>
      </main>
    </div>
  );
}
