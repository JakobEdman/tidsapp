"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    signIn(email);
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-md space-y-6">
        {/* Welcome section */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-blue-600">Tidsapp</h1>
          <p className="text-gray-600 text-lg">
            Registrera din arbetstid enkelt med r&ouml;sten
          </p>
        </div>

        {/* How it works */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-800">S&aring; h&auml;r fungerar det:</h2>
          <div className="space-y-3">
            <div className="flex gap-3 items-start">
              <span className="bg-blue-100 text-blue-700 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shrink-0">
                1
              </span>
              <p className="text-sm text-gray-600">
                <span className="font-medium text-gray-800">Logga in</span> med
                din e-postadress nedan
              </p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="bg-blue-100 text-blue-700 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shrink-0">
                2
              </span>
              <p className="text-sm text-gray-600">
                <span className="font-medium text-gray-800">
                  Spela in med r&ouml;sten
                </span>{" "}
                &mdash; s&auml;g t.ex. &quot;Jobbade med hemsidan fr&aring;n 9 till 11&quot;
              </p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="bg-blue-100 text-blue-700 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shrink-0">
                3
              </span>
              <p className="text-sm text-gray-600">
                <span className="font-medium text-gray-800">
                  AI:n tolkar automatiskt
                </span>{" "}
                och skapar en tidspost &aring;t dig
              </p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="bg-blue-100 text-blue-700 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shrink-0">
                4
              </span>
              <p className="text-sm text-gray-600">
                <span className="font-medium text-gray-800">
                  Se statistik och exportera PDF
                </span>{" "}
                fr&aring;n din dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Login form */}
        <form
          onSubmit={handleSignIn}
          className="bg-white border rounded-2xl p-6 shadow-sm space-y-4"
        >
          <h2 className="font-semibold text-gray-800">Kom ig&aring;ng</h2>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="namn@foretag.se"
            className="w-full border rounded-lg px-4 py-3 text-sm"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg px-4 py-3 font-medium transition-colors"
          >
            {loading ? "Loggar in..." : "Logga in"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400">
          Tips: Tryck p&aring; &quot;Spela in&quot; och till&aring;t mikrofonen n&auml;r telefonen fr&aring;gar.
        </p>
      </div>
    </div>
  );
}
