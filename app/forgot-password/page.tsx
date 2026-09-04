"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await requestPasswordReset(email);
    setLoading(false);

    if (!result.success) {
      setError(result.error || "Något gick fel.");
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-8 bg-gray-50">
      <div className="w-full max-w-sm space-y-5">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-blue-600">Tidsapp</h1>
          <p className="text-gray-500 text-sm">Återställ ditt lösenord</p>
        </div>

        {submitted ? (
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3 shadow-sm">
            <h2 className="font-semibold text-base">Kontrollera din e-post</h2>
            <p className="text-sm text-gray-600">
              Om det finns ett konto kopplat till{" "}
              <span className="font-medium">{email}</span> har vi skickat en
              länk för att välja ett nytt lösenord. Länken gäller i 1 timme.
            </p>
            <p className="text-sm text-gray-500">
              Kolla i skräppost om du inte hittar mailet.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="text-blue-600 font-medium text-sm"
              >
                ← Tillbaka till inloggning
              </Link>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-sm"
          >
            <h2 className="font-semibold text-base">Glömt lösenord?</h2>
            <p className="text-sm text-gray-500">
              Ange din e-postadress så skickar vi en länk för att välja ett
              nytt lösenord.
            </p>

            <div>
              <label className="text-xs text-gray-500 block mb-1">E-post</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="namn@foretag.se"
                autoComplete="email"
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
              {loading ? "Skickar..." : "Skicka länk"}
            </button>

            <p className="text-sm text-center text-gray-500 pt-2">
              <Link href="/login" className="text-blue-600 font-medium">
                ← Tillbaka till inloggning
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
