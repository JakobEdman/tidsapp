// Matchning av projekt-/kundnamn.
//
// Namnen kommer från tal, så samma kund låter aldrig likadant två gånger:
// "Fager", "Projekt Fager" och "Projektfager" är samma kund men tre strängar.
// Här snäpps nya namn mot de som redan finns istället för att skapa tvillingar.

/** Jämförelsenyckel: gemener utan mellanslag och skiljetecken. */
function key(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9åäö]/g, "");
}

/** Trimmar och slår ihop dubbla blanksteg. */
export function normalizeProject(raw: string | null | undefined): string {
  return (raw ?? "").replace(/\s+/g, " ").trim();
}

/**
 * Tar bort inledande "projekt"/"kund" — talspråk som annars bakas in i namnet.
 * Med mellanslag är det ofarligt. Utan mellanslag ("Projektfager") görs det
 * bara när resultatet faktiskt matchar en känd kund, så att en kund som
 * verkligen heter t.ex. "Projektor AB" inte stympas.
 */
function prefixVariants(name: string): string[] {
  const varianter = [name];
  const medMellanslag = name.replace(/^(projekt|kund)(et|en)?\s+/i, "").trim();
  if (medMellanslag && medMellanslag !== name) varianter.push(medMellanslag);
  const utanMellanslag = name.replace(/^(projekt|kund)(et|en)?/i, "").trim();
  if (utanMellanslag && !varianter.includes(utanMellanslag)) {
    varianter.push(utanMellanslag);
  }
  return varianter;
}

/** Levenshtein-avstånd, för att fånga stavfel från transkriberingen. */
function distance(a: string, b: string): number {
  if (a === b) return 0;
  const rad = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let forra = rad[0];
    rad[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = rad[j];
      rad[j] = Math.min(
        rad[j] + 1,
        rad[j - 1] + 1,
        forra + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
      forra = temp;
    }
  }
  return rad[b.length];
}

/** Hur nära ett stavfel får ligga för att räknas som samma kund. */
function taletsTolerans(langd: number): number {
  if (langd <= 4) return 0;
  if (langd <= 8) return 1;
  return 2;
}

/**
 * Snäpper ett inkommande namn mot en befintlig kund om det går.
 * Returnerar det befintliga namnet vid träff, annars det städade nya namnet.
 */
export function matchProject(raw: string, known: string[]): string {
  const stadat = normalizeProject(raw);
  if (!stadat) return "Övrigt";

  // Listan städas först. Kommer den från äldre data innehåller den både
  // "Fager" och "Projekt Fager", och då träffar en variant sig själv.
  const kanda = knownProjects(known.map((p) => ({ project: p })));
  if (kanda.length === 0) return stadat;

  // 1. Exakt träff på nyckel, inklusive prefixvarianter
  for (const variant of prefixVariants(stadat)) {
    const n = key(variant);
    if (!n) continue;
    const traff = kanda.find((k) => key(k) === n);
    if (traff) return traff;
  }

  // 2. Nära nog — fångar stavfel som "Fagert" mot "Fager"
  const n = key(stadat);
  let bast: string | null = null;
  let bastAvstand = Infinity;
  for (const k of kanda) {
    const d = distance(n, key(k));
    if (d < bastAvstand) {
      bastAvstand = d;
      bast = k;
    }
  }
  if (bast && bastAvstand <= taletsTolerans(n.length)) return bast;

  return stadat;
}

/**
 * Kundlistan användaren redan har, vanligast först, "Övrigt" bortsorterat.
 *
 * Varianter av samma kund slås ihop till ett namn. Det är nödvändigt: listan
 * används som facit vid matchning, och innehåller den både "Fager" och
 * "Projekt Fager" kommer skräpvarianten att träffa sig själv och leva vidare.
 */
export function knownProjects(entries: { project: string }[]): string[] {
  const grupper: { nycklar: Set<string>; namn: Map<string, number> }[] = [];

  for (const e of entries) {
    const namn = normalizeProject(e.project);
    if (!namn || namn.toLowerCase() === "övrigt") continue;

    const nycklar = prefixVariants(namn).map(key).filter(Boolean);
    let grupp = grupper.find((g) => nycklar.some((n) => g.nycklar.has(n)));
    if (!grupp) {
      grupp = { nycklar: new Set(), namn: new Map() };
      grupper.push(grupp);
    }
    for (const n of nycklar) grupp.nycklar.add(n);
    grupp.namn.set(namn, (grupp.namn.get(namn) ?? 0) + 1);
  }

  return grupper
    .map((g) => {
      // Vanligaste stavningen vinner; vid lika den kortaste, så att
      // "Fager" väljs framför "Projekt Fager".
      const [namn] = [...g.namn.entries()].sort(
        (a, b) => b[1] - a[1] || a[0].length - b[0].length
      )[0];
      const antal = [...g.namn.values()].reduce((s, x) => s + x, 0);
      return { namn, antal };
    })
    .sort((a, b) => b.antal - a.antal)
    .map((g) => g.namn);
}
