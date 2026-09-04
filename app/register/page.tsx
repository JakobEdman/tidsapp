"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/auth";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptPolicy, setAcceptPolicy] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!firstName.trim() || !lastName.trim()) {
      setError("Ange både för- och efternamn.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Lösenorden matchar inte.");
      return;
    }
    if (!password) {
      setError("Ange ett lösenord.");
      return;
    }
    if (!acceptPolicy) {
      setError("Du behöver godkänna integritetspolicyn.");
      return;
    }

    setLoading(true);
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const result = await registerUser(fullName, email, password);

    if (!result.success) {
      setError(result.error || "Kunde inte skapa konto.");
      setLoading(false);
      return;
    }

    // Skicka välkomstmail i bakgrunden (blockerar inte registreringen)
    try {
      await fetch("/api/send-welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email: email.trim(),
        }),
      });
    } catch {
      // ignorera mailfel
    }

    router.push("/");
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-8 bg-gray-50">
      <div className="w-full max-w-sm space-y-5">
        <div className="text-center space-y-2">
          <div className="inline-block bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded-full">
            BETA
          </div>
          <h1 className="text-3xl font-bold text-blue-600">Tidsapp</h1>
          <p className="text-gray-500 text-sm">Skapa ett konto för att komma igång</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-sm"
        >
          <h2 className="font-semibold text-base">Registrera dig</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Förnamn</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base"
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Efternamn</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base"
                required
              />
            </div>
          </div>

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

          <div>
            <label className="text-xs text-gray-500 block mb-1">Lösenord</label>
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
              Bekräfta lösenord
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

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptPolicy}
              onChange={(e) => setAcceptPolicy(e.target.checked)}
              className="mt-1 w-4 h-4 shrink-0"
            />
            <span className="text-sm text-gray-600">
              Jag godkänner att mina uppgifter hanteras enligt{" "}
              <Link
                href="/integritet"
                target="_blank"
                className="text-blue-600 font-medium underline"
              >
                integritetspolicyn
              </Link>
              .
            </span>
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 active:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg px-4 py-3 font-medium transition-colors text-base"
          >
            {loading ? "Skapar konto..." : "Skapa konto"}
          </button>

          <p className="text-sm text-center text-gray-500 pt-2">
            Har du redan ett konto?{" "}
            <Link href="/login" className="text-blue-600 font-medium">
              Logga in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
