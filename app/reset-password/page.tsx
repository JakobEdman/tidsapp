"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPasswordWithToken } from "@/lib/auth";

function ResetForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3 shadow-sm">
        <h2 className="font-semibold text-base">Ogiltig länk</h2>
        <p className="text-sm text-gray-600">
          Länken saknar en token. Begär ett nytt mail för att återställa
          lösenordet.
        </p>
        <Link
          href="/forgot-password"
          className="text-blue-600 font-medium text-sm"
        >
          Begär ny länk
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3 shadow-sm">
        <h2 className="font-semibold text-base">Lösenordet är uppdaterat</h2>
        <p className="text-sm text-gray-600">
          Du kan nu logga in med ditt nya lösenord.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="w-full bg-blue-600 active:bg-blue-700 text-white rounded-lg px-4 py-3 font-medium text-base"
        >
          Logga in
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Lösenorden matchar inte.");
      return;
    }
    if (!password) {
      setError("Ange ett nytt lösenord.");
      return;
    }
    setLoading(true);
    const result = await resetPasswordWithToken(token, password);
    setLoading(false);
    if (!result.success) {
      setError(result.error || "Kunde inte uppdatera lösenordet.");
      return;
    }
    setDone(true);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-sm"
    >
      <h2 className="font-semibold text-base">Välj nytt lösenord</h2>

      <div>
        <label className="text-xs text-gray-500 block mb-1">Nytt lösenord</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base"
          required
        />
      </div>

      <div>
        <label className="text-xs text-gray-500 block mb-1">
          Bekräfta nytt lösenord
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base"
          required
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 active:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg px-4 py-3 font-medium transition-colors text-base"
      >
        {loading ? "Sparar..." : "Spara nytt lösenord"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-8 bg-gray-50">
      <div className="w-full max-w-sm space-y-5">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-blue-600">Tidsapp</h1>
        </div>
        <Suspense fallback={<p className="text-center text-sm text-gray-500">Laddar...</p>}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
