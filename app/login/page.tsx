"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, getSession, changePassword } from "@/lib/auth";

export default function LoginPage() {
  const [step, setStep] = useState<"login" | "change_password">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn(email.trim(), password);
    if (!result.success) {
      setError(result.error || "Kunde inte logga in.");
      setLoading(false);
      return;
    }

    if (result.must_change_password) {
      setStep("change_password");
      setLoading(false);
      return;
    }

    router.push("/");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 4) {
      setError("L\u00f6senordet m\u00e5ste vara minst 4 tecken.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("L\u00f6senorden matchar inte.");
      return;
    }

    setLoading(true);

    const session = getSession();
    if (!session.user) {
      setError("N\u00e5got gick fel. F\u00f6rs\u00f6k logga in igen.");
      setStep("login");
      setLoading(false);
      return;
    }

    const ok = await changePassword(session.user.id, newPassword);
    if (!ok) {
      setError("Kunde inte byta l\u00f6senord. F\u00f6rs\u00f6k igen.");
      setLoading(false);
      return;
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
          <p className="text-gray-500 text-sm">
            {"Registrera din arbetstid enkelt med r\u00f6sten"}
          </p>
        </div>

        {step === "login" && (
          <form
            onSubmit={handleLogin}
            className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-sm"
          >
            <h2 className="font-semibold text-base">Logga in</h2>

            <div>
              <label className="text-xs text-gray-500 block mb-1">E-post</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="namn@foretag.se"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base"
                required
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1">{"L\u00f6senord"}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={"Ange l\u00f6senord"}
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
              {loading ? "Loggar in..." : "Logga in"}
            </button>

            <div className="flex flex-col items-center gap-2 pt-2 text-sm">
              <Link
                href="/forgot-password"
                className="text-blue-600 font-medium"
              >
                {"Gl\u00f6mt l\u00f6senord?"}
              </Link>
              <p className="text-gray-500">
                Har du inget konto?{" "}
                <Link href="/register" className="text-blue-600 font-medium">
                  Registrera dig
                </Link>
              </p>
            </div>
          </form>
        )}

        {step === "change_password" && (
          <form
            onSubmit={handleChangePassword}
            className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-sm"
          >
            <h2 className="font-semibold text-base">{"V\u00e4lj eget l\u00f6senord"}</h2>
            <p className="text-sm text-gray-500">
              {"Du loggar in f\u00f6r f\u00f6rsta g\u00e5ngen. V\u00e4lj ett eget l\u00f6senord."}
            </p>

            <div>
              <label className="text-xs text-gray-500 block mb-1">{"Nytt l\u00f6senord"}</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={"V\u00e4lj ett l\u00f6senord"}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base"
                required
                minLength={4}
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1">{"Bekr\u00e4fta nytt l\u00f6senord"}</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={"Skriv l\u00f6senordet igen"}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base"
                required
                minLength={4}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 active:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg px-4 py-3 font-medium transition-colors text-base"
            >
              {loading ? "Sparar..." : "Spara och forts\u00e4tt"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
