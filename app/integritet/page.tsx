import Link from "next/link";

export const metadata = {
  title: "Integritetspolicy — Tidsapp",
};

export default function IntegritetPage() {
  const lastUpdated = "2026-05-21";
  return (
    <div className="min-h-dvh bg-gray-50">
      <main className="px-4 pt-8 pb-12 max-w-2xl mx-auto space-y-6">
        <header className="space-y-2">
          <Link href="/" className="text-sm text-blue-600 active:text-blue-800">
            ← Tillbaka
          </Link>
          <h1 className="text-3xl font-bold">Integritetspolicy</h1>
          <p className="text-sm text-gray-500">
            Senast uppdaterad: {lastUpdated}
          </p>
        </header>

        <section className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3 text-sm leading-relaxed text-gray-700">
          <p>
            Tidsappen är en tjänst för tidsredovisning. Den här policyn
            beskriver vilka personuppgifter vi behandlar, hur vi använder
            dem och vilka rättigheter du har som användare. Tidsappen är
            just nu i betafas.
          </p>

          <h2 className="font-semibold text-base text-gray-900 pt-2">
            Vilka uppgifter vi samlar in
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Kontouppgifter:</strong> för- och efternamn samt
              e-postadress som du anger vid registrering.
            </li>
            <li>
              <strong>Lösenord:</strong> sparas krypterat med bcrypt och kan
              inte läsas i klartext, inte ens av oss.
            </li>
            <li>
              <strong>Tidsposter:</strong> projekt, aktivitet, datum, start-
              och sluttid samt eventuella anteckningar du sparar.
            </li>
            <li>
              <strong>Röstinspelningar:</strong> ljudet du spelar in skickas
              till OpenAI för transkribering. Själva ljudfilen sparas inte hos
              oss eller hos OpenAI efter bearbetning. Den transkriberade
              texten lagras inte heller — bara den färdiga tidsposten.
            </li>
            <li>
              <strong>Feedback:</strong> om du skickar in feedback via appen
              sparas ditt meddelande tillsammans med ditt namn och din
              e-post.
            </li>
          </ul>

          <h2 className="font-semibold text-base text-gray-900 pt-2">
            Varför vi behandlar uppgifterna
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>För att kunna logga in dig och visa dina tidsposter.</li>
            <li>
              För att tolka det du spelar in och skapa korrekta poster.
            </li>
            <li>
              För att vi ska kunna återkomma med svar om du skickar feedback
              eller rapporterar fel.
            </li>
            <li>
              För att utveckla och förbättra appen baserat på hur den
              används.
            </li>
          </ul>

          <h2 className="font-semibold text-base text-gray-900 pt-2">
            Var uppgifterna lagras
          </h2>
          <p>
            All data lagras i en databas hos <strong>Supabase</strong>{" "}
            (servrar inom EU). Röstinspelningar skickas via vår server till{" "}
            <strong>OpenAI</strong> för transkribering. E-postutskick (t.ex.
            återställning av lösenord) sker via <strong>Resend</strong>.
            Appen körs på <strong>Vercel</strong>.
          </p>

          <h2 className="font-semibold text-base text-gray-900 pt-2">
            Hur länge vi sparar uppgifterna
          </h2>
          <p>
            Kontot och dina tidsposter sparas så länge du har ett aktivt
            konto. Vid radering av konto tas alla dina uppgifter bort. Under
            betafasen sparas allt så länge testperioden pågår — vi kommer
            informera er innan eventuell rensning.
          </p>

          <h2 className="font-semibold text-base text-gray-900 pt-2">
            Dina rättigheter
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Tillgång:</strong> du kan se all din data direkt i appen
              (under Administration).
            </li>
            <li>
              <strong>Rättelse:</strong> du kan redigera dina tidsposter och
              kontouppgifter när som helst.
            </li>
            <li>
              <strong>Radering:</strong> du kan begära att ditt konto och all
              tillhörande data raderas. Skicka begäran via feedback-knappen i
              appen under tiden den funktionen byggs in.
            </li>
            <li>
              <strong>Återkalla samtycke:</strong> du kan när som helst sluta
              använda Tidsappen och be om att kontot tas bort.
            </li>
          </ul>

          <h2 className="font-semibold text-base text-gray-900 pt-2">
            Säkerhet
          </h2>
          <p>
            Lösenord hashas med bcrypt. All kommunikation sker över krypterad
            anslutning (HTTPS). Endast appens administratörer har tillgång
            till databasen.
          </p>

          <h2 className="font-semibold text-base text-gray-900 pt-2">
            Kontakt
          </h2>
          <p>
            Vid frågor eller önskemål om dina uppgifter, använd
            feedback-knappen i appen.
          </p>
        </section>

        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-gray-500 active:text-gray-700"
          >
            ← Tillbaka
          </Link>
        </div>
      </main>
    </div>
  );
}
