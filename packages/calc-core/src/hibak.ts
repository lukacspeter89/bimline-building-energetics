/**
 * A számítási mag hibái. Minden hiba hordozza a követelménymátrix azonosítóját,
 * hogy a felület meg tudja mutatni, melyik szabály miatt állt meg a számítás.
 */
export class SzamitasiHiba extends Error {
  constructor(
    message: string,
    /** Követelménymátrix-azonosító(k), pl. "HT-033". */
    readonly matrixId: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

/** A bemenet hiányos vagy fizikailag értelmetlen (pl. negatív vastagság). */
export class ErvenytelenBemenet extends SzamitasiHiba {}

/**
 * Az egyszerűsített módszer az adott esetre nem alkalmazható; a módszer szerint
 * részletes (szabvány szerinti vagy numerikus) számítás kötelező. Lásd DONTESEK.md D-002.
 */
export class ReszletesModszerSzukseges extends SzamitasiHiba {}

/** A normatív adatállományból hiányzik a keresett táblázat vagy érték. */
export class NormativAdatHiba extends SzamitasiHiba {}
