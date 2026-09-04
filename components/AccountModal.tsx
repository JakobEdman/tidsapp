"use client";

import { useState } from "react";
import { User } from "@/lib/types";
import { updateUser } from "@/lib/auth";

interface AccountModalProps {
  user: User;
  onClose: () => void;
  onUpdated: (user: User) => void;
}

export default function AccountModal({
  user,
  onClose,
  onUpdated,
}: AccountModalProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    setSaved(false);

    if (!name.trim()) {
      setError("Namn kan inte vara tomt.");
      return;
    }
    if (!email.trim()) {
      setError("E-post kan inte vara tom.");
      return;
    }

    const ok = await updateUser(user.id, { name: name.trim(), email: email.trim() });
    if (!ok) {
      setError("E-postadressen används redan av ett annat konto.");
      return;
    }

    onUpdated({ ...user, name: name.trim(), email: email.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-sm shadow-xl">
        <div className="p-5 space-y-4">
          <h2 className="font-semibold text-lg">Mitt konto</h2>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Namn</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">E-post</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {saved && (
            <p className="text-sm text-green-600">Sparat!</p>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 active:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium"
            >
              Spara
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 active:bg-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium"
            >
              {"St\u00e4ng"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
