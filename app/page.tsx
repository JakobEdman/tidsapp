"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, signOut } from "@/lib/auth";
import { getEntries, addEntry, deleteEntry, getEntryCount } from "@/lib/storage";
import { TimeEntry, User } from "@/lib/types";
import Navbar from "@/components/Navbar";
import Recorder from "@/components/Recorder";
import EntryForm from "@/components/EntryForm";
import EntryList from "@/components/EntryList";
import StripeButton from "@/components/StripeButton";

const FREE_LIMIT = 20;

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [limitReached, setLimitReached] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (!session.user) {
      router.push("/login");
      return;
    }
    setUser(session.user);
    refreshEntries(session.user.id, session.user.is_pro);
    setLoading(false);
  }, [router]);

  const refreshEntries = (userId: string, isPro: boolean) => {
    const data = getEntries(userId);
    setEntries(data);
    setLimitReached(!isPro && getEntryCount(userId) >= FREE_LIMIT);
  };

  const handleNewEntry = (parsed: {
    project: string;
    activity: string;
    start_time: string;
    end_time: string;
    duration: string;
  }) => {
    if (!user) return;
    if (limitReached) {
      alert(
        `Du har nått gratislimiten på ${FREE_LIMIT} poster. Uppgradera till Pro för obegränsade poster.`
      );
      return;
    }

    addEntry({
      ...parsed,
      user_id: user.id,
    });
    refreshEntries(user.id, user.is_pro);
  };

  const handleDelete = (id: string) => {
    if (!user) return;
    deleteEntry(id, user.id);
    refreshEntries(user.id, user.is_pro);
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
      <main className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Tidsregistrering</h1>
          <div className="flex gap-2">
            <StripeButton user={user} />
          </div>
        </div>

        {limitReached && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg text-sm">
            Du har nått gratislimiten ({FREE_LIMIT} poster). Uppgradera till Pro
            för att fortsätta registrera tid.
          </div>
        )}

        <div className="bg-white p-5 rounded-xl border space-y-4">
          <h2 className="font-semibold">Ny tidspost</h2>
          <Recorder onEntryParsed={handleNewEntry} />
          <EntryForm onSubmit={handleNewEntry} />
        </div>

        <div>
          <h2 className="font-semibold mb-3">
            Tidsposter ({entries.length}
            {!user.is_pro && ` / ${FREE_LIMIT}`})
          </h2>
          <EntryList entries={entries} onDelete={handleDelete} />
        </div>
      </main>
    </div>
  );
}
