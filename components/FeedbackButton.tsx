"use client";

import { useState } from "react";
import { submitFeedback, FeedbackType } from "@/lib/feedback";
import { User } from "@/lib/types";

interface FeedbackButtonProps {
  user: User | null;
}

export default function FeedbackButton({ user }: FeedbackButtonProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>("request");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setMessage("");
    setType("request");
    setError("");
    setDone(false);
  };

  const close = () => {
    setOpen(false);
    // Liten fördröjning så transitionen hinner spela
    setTimeout(reset, 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await submitFeedback({
      user_id: user?.id || null,
      user_name: user?.name || null,
      user_email: user?.email || null,
      type,
      message,
    });
    setSubmitting(false);
    if (!result.success) {
      setError(result.error || "Något gick fel.");
      return;
    }
    setDone(true);
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="bg-amber-100 text-amber-700 rounded-full w-9 h-9 flex items-center justify-center shrink-0">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="font-semibold text-base">Vad tycker du om Tidsappen?</h3>
            <p className="text-sm text-gray-600">
              Lämna gärna önskemål, tankar eller rapportera fel. All
              feedback uppskattas — vi följer upp och uppdaterar appen
              kontinuerligt utifrån era önskemål.
            </p>
          </div>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="w-full bg-blue-600 active:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium text-base"
        >
          Lämna feedback
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-3"
          onClick={close}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 space-y-4"
            style={{
              paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {done ? (
              <div className="space-y-3 text-center py-4">
                <div className="mx-auto bg-green-100 text-green-700 rounded-full w-12 h-12 flex items-center justify-center">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg">Tack för din feedback!</h3>
                <p className="text-sm text-gray-600">
                  Vi har tagit emot ditt meddelande och återkommer om vi
                  behöver veta mer.
                </p>
                <button
                  onClick={close}
                  className="w-full bg-blue-600 active:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium text-base mt-2"
                >
                  Stäng
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-lg">Lämna feedback</h3>
                    <p className="text-sm text-gray-500">
                      Vi läser allt och uppdaterar appen löpande.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={close}
                    aria-label="Stäng"
                    className="text-gray-400 active:text-gray-700 -mt-1 -mr-1 p-1"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Typ av feedback
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as FeedbackType)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base bg-white"
                  >
                    <option value="request">Önskemål / förbättringsförslag</option>
                    <option value="bug">Något fungerar inte / bugg</option>
                    <option value="other">Övriga tankar</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Ditt meddelande
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    placeholder="Beskriv vad som hände eller vad du önskar..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base resize-y min-h-[8rem]"
                    required
                  />
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 active:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium text-base"
                >
                  {submitting ? "Skickar..." : "Skicka feedback"}
                </button>
                <p className="text-xs text-gray-500 text-center">
                  Vi ser ditt namn och din e-post på meddelandet så vi kan
                  följa upp vid behov.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
