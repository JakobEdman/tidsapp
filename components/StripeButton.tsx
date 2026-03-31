"use client";

import { User } from "@/lib/types";

interface StripeButtonProps {
  user: User;
}

export default function StripeButton({ user }: StripeButtonProps) {
  const startCheckout = async () => {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(
          data.error || "Kunde inte starta betalning. Kontrollera Stripe-konfigurationen."
        );
      }
    } catch {
      alert("Kunde inte ansluta till betalningssystemet.");
    }
  };

  if (user.is_pro) return null;

  return (
    <button
      onClick={startCheckout}
      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
    >
      Uppgradera till Pro
    </button>
  );
}
