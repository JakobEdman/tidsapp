"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession, signOut } from "@/lib/auth";
import { User } from "@/lib/types";
import Navbar from "@/components/Navbar";
import FeedbackButton from "@/components/FeedbackButton";

export default function InformationPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (!session.user) {
      router.push("/login");
      return;
    }
    setUser(session.user);
    setLoading(false);
  }, [router]);

  const handleSignOut = () => {
    signOut();
    router.push("/login");
  };

  if (loading) return <div className="p-6 text-center">Laddar...</div>;
  if (!user) return null;

  return (
    <div className="min-h-dvh bg-gray-50">
      <Navbar user={user} onSignOut={handleSignOut} />
      <main className="px-4 pt-5 pb-8 space-y-5 max-w-lg mx-auto">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold">Information</h1>
          <p className="text-sm text-gray-500">
            Guide, tips och svar på vanliga frågor.
          </p>
        </header>

        <section className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <h2 className="font-semibold text-base">Detaljerad guide</h2>

          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-gray-800 py-2 active:text-blue-600">
              Rapportera tid med rösten
            </summary>
            <div className="text-sm text-gray-600 space-y-2 pl-1 pb-2">
              <p>
                Tryck på <strong>Spela in</strong> och berätta vad du gjort.
                Säg gärna projekt, aktivitet, tid och datum. Exempel:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>&quot;Jobbade med hemsidan från 9 till 11&quot;</li>
                <li>&quot;Möte med kund i två timmar igår eftermiddag&quot;</li>
                <li>
                  &quot;Skrev offert för projekt X den 15 maj, tre
                  timmar&quot;
                </li>
              </ul>
              <p>
                Tryck <strong>Stoppa inspelning</strong> när du är klar. Appen
                tolkar texten och skapar en post automatiskt.
              </p>
            </div>
          </details>

          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-gray-800 py-2 active:text-blue-600">
              Lägga till tid manuellt
            </summary>
            <div className="text-sm text-gray-600 space-y-2 pl-1 pb-2">
              <p>
                Under inspelningsknappen finns &quot;Lägg till manuellt&quot;.
                Där fyller du i datum, projekt, aktivitet och tid själv. Bra
                när du redan vet exakta tider eller vill registrera utan att
                tala.
              </p>
            </div>
          </details>

          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-gray-800 py-2 active:text-blue-600">
              Redigera eller ta bort en post
            </summary>
            <div className="text-sm text-gray-600 space-y-2 pl-1 pb-2">
              <p>
                I listan med tidsposter har varje rad knapparna{" "}
                <strong>Redigera</strong> och <strong>Ta bort</strong>. I
                redigeringsläget kan du också spela in på nytt — då ersätts
                alla fält av den nya inspelningen.
              </p>
            </div>
          </details>

          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-gray-800 py-2 active:text-blue-600">
              Exportera tidsrapport som PDF
            </summary>
            <div className="text-sm text-gray-600 space-y-2 pl-1 pb-2">
              <p>
                Gå till <strong>Administration</strong> i menyn. Välj
                datumintervall och tryck <strong>Ladda ner PDF</strong>. PDF:en
                innehåller alla poster i perioden samt totalsumma.
              </p>
            </div>
          </details>
        </section>

        <section className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <h2 className="font-semibold text-base">
            Spara appen på hemskärmen
          </h2>
          <p className="text-sm text-gray-600">
            Då fungerar Tidsappen som en vanlig app — egen ikon, fullskärm,
            utan adressfält.
          </p>

          <details className="group" open>
            <summary className="cursor-pointer text-sm font-medium text-gray-800 py-2 active:text-blue-600">
              På iPhone (Safari)
            </summary>
            <ol className="list-decimal pl-5 text-sm text-gray-600 space-y-1.5 pb-2">
              <li>
                Öppna <code className="bg-gray-100 px-1 rounded">tidsapp.vercel.app</code> i Safari (inte Chrome).
              </li>
              <li>
                Tryck på <strong>dela-knappen</strong> längst ner i mitten —
                rutan med en pil uppåt.
              </li>
              <li>
                Bläddra ner i listan och välj{" "}
                <strong>&quot;Lägg till på hemskärm&quot;</strong>.
              </li>
              <li>
                Tryck <strong>&quot;Lägg till&quot;</strong> uppe i hörnet.
              </li>
            </ol>
          </details>

          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-gray-800 py-2 active:text-blue-600">
              På Android (Chrome)
            </summary>
            <ol className="list-decimal pl-5 text-sm text-gray-600 space-y-1.5 pb-2">
              <li>
                Öppna <code className="bg-gray-100 px-1 rounded">tidsapp.vercel.app</code> i Chrome.
              </li>
              <li>
                Tryck på <strong>de tre prickarna</strong> uppe i högra
                hörnet.
              </li>
              <li>
                Välj <strong>&quot;Lägg till på startskärmen&quot;</strong>{" "}
                eller <strong>&quot;Installera app&quot;</strong>.
              </li>
              <li>
                Bekräfta med <strong>&quot;Lägg till&quot;</strong>.
              </li>
            </ol>
          </details>

          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-gray-800 py-2 active:text-blue-600">
              På datorn
            </summary>
            <p className="text-sm text-gray-600 pb-2">
              Du kan använda Tidsappen direkt i webbläsaren — Chrome, Safari,
              Edge eller Firefox fungerar lika bra. Du loggar in med samma
              konto och ser samma data som på mobilen.
            </p>
          </details>
        </section>

        <section className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <h2 className="font-semibold text-base">Vanliga frågor</h2>

          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-gray-800 py-2 active:text-blue-600">
              Var lagras min data?
            </summary>
            <p className="text-sm text-gray-600 pb-2">
              All data lagras säkert i en databas hos Supabase. Inspelningar
              skickas till OpenAI för transkribering men sparas inte där efter
              bearbetning.
            </p>
          </details>

          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-gray-800 py-2 active:text-blue-600">
              Fungerar appen offline?
            </summary>
            <p className="text-sm text-gray-600 pb-2">
              Nej, just nu krävs internetuppkoppling. Inspelning och tolkning
              använder molntjänster, och dina poster sparas direkt i databasen.
            </p>
          </details>

          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-gray-800 py-2 active:text-blue-600">
              Hur byter jag lösenord?
            </summary>
            <p className="text-sm text-gray-600 pb-2">
              Logga ut, gå till inloggningssidan och tryck{" "}
              <strong>Glömt lösenord?</strong> — du får en länk till din
              e-post för att välja ett nytt.
            </p>
          </details>

          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-gray-800 py-2 active:text-blue-600">
              Kan jag rensa eller radera mitt konto?
            </summary>
            <p className="text-sm text-gray-600 pb-2">
              Funktionen är på väg. Skicka önskemålet via feedback-knappen
              nedan så hjälper vi dig under tiden.
            </p>
          </details>
        </section>

        <FeedbackButton user={user} />

        <div className="text-center pt-2 space-y-2">
          <div>
            <Link
              href="/integritet"
              className="text-sm text-blue-600 active:text-blue-800 font-medium"
            >
              Läs integritetspolicyn
            </Link>
          </div>
          <Link
            href="/"
            className="block text-sm text-gray-500 active:text-gray-700"
          >
            ← Tillbaka till tidsregistrering
          </Link>
        </div>
      </main>
    </div>
  );
}
