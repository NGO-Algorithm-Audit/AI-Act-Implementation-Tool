// Outcome of the Pre-scan DPIA questionnaire (src/schemas/avg/<lang>/prescan-dpia.json).
//
// The decision logic follows flowcharts/src/nl/prescan-dpia.mmd, which mirrors the
// `assessments` block of the MinBZK Pre-scan DPIA (sources/prescan.yaml):
//   DPIA verplicht  ⇐ Q1 nieuwe wet- of regelgeving ∨ Σ risicoscore > 4
//                     ∨ ≥ 1 item op de AP-lijst (Q13) ∨ ≥ 2 items op de EDPB-lijst (Q14)
//   DPIA aanbevolen ⇐ precies 1 item op de EDPB-lijst
// RJSF dependencies cannot add up scores, so the schema asks Q2–Q14 in flowchart order
// and the sum is computed here, on the result screen.

const NOTA = "Geen van de bovenstaande";

const selected = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v) => v !== NOTA) : [];

// Weights copied from the weightedCountMap() calls in prescan.yaml.
const BETROKKENEN_WEIGHTS: Record<string, number> = {
  "Medewerkers/bewindspersonen": 1,
  "Burgers over wie gegevens worden verwerkt in het proces/systeem/applicatie": 1,
  "Kinderen jonger dan 16 jaar": 3,
  "Andere kwetsbare groepen (gehandicapten, minderheden, etc.)": 3,
};
const BASISREGISTRATIE_WEIGHTS: Record<string, number> = {
  "Basisregistratie Inkomen (BRI)": 1,
  "Basisregistratie Kadaster (BRK)": 1,
  "Basisregistratie Personen (BRP)": 1,
  "Basisregistratie Voertuigen (BRV)": 1,
  "Basisregistratie Waarde Onroerende Zaken (WOZ)": 1,
  "Handelsregister (HR)": 1,
};
const weighted = (value: unknown, weights: Record<string, number>) =>
  selected(value).reduce((sum, v) => sum + (weights[v] ?? 0), 0);

export type PrescanLevel = "required" | "recommended" | "none";
export type PrescanReason = "legislation" | "riskscore" | "aplist" | "edpblist2" | "edpblist1";

export interface PrescanResult {
  level: PrescanLevel;
  reasons: PrescanReason[];
  /** Σ of the risk scores of Q2–Q12 (0 when Q1 = Ja, because those questions are skipped). */
  riskScore: number;
  /** Risk score per question, for the breakdown on the result screen. */
  scores: Record<string, number>;
}

export function evaluatePrescanDpia(data: Record<string, unknown>): PrescanResult {
  const n3 = selected(data.q3).length;
  const n4 = selected(data.q4).length;
  const betrokkenen = weighted(data.q5, BETROKKENEN_WEIGHTS);

  const scores: Record<string, number> = {
    q2: selected(data.q2).length >= 6 ? 1 : 0,
    q3: n3 > 6 ? 2 : n3 >= 1 ? 1 : 0,
    q4: n4 > 6 ? 2 : n4 >= 1 ? 1 : 0,
    q5: betrokkenen >= 4 ? 2 : betrokkenen === 3 ? 1 : 0,
    q6: data.q6 === "Ja" ? 1 : 0,
    // q7 (hoeveelheid gegevens) carries no score in the source either.
    q8: ["Continu", "Vaker dan maandelijks", "Minstens maandelijks"].includes(String(data.q8)) ? 1 : 0,
    q9: ["Aantal jaren", "Jaar"].includes(String(data.q9)) ? 1 : 0,
    q10: data.q10 === "Ja, inclusief bijzondere persoonsgegevens" ? 2 : data.q10 === "Ja, zonder bijzondere persoonsgegevens" ? 1 : 0,
    q11: weighted(data.q11, BASISREGISTRATIE_WEIGHTS) >= 1 ? 1 : 0,
    q12: data.q12 === "Ja, primair bedoeld voor gebruik door personen jonger dan 18 jaar" ? 2 : data.q12 === "Ja, niet primair bedoeld voor personen jonger dan 18 jaar" ? 1 : 0,
  };
  const riskScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const nAp = selected(data.q13).length;
  const nEdpb = selected(data.q14).length;

  const required: PrescanReason[] = [];
  if (data.q1 === "Ja") required.push("legislation");
  if (riskScore > 4) required.push("riskscore");
  if (nAp >= 1) required.push("aplist");
  if (nEdpb >= 2) required.push("edpblist2");

  if (required.length) return { level: "required", reasons: required, riskScore, scores };
  if (nEdpb === 1) return { level: "recommended", reasons: ["edpblist1"], riskScore, scores };
  return { level: "none", reasons: [], riskScore, scores };
}
