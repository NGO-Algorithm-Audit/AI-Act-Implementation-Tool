// Outcome of the Pre-scan DPIA questionnaire (src/schemas/avg/<lang>/prescan-dpia.json).
//
// The decision logic follows flowcharts/src/nl/prescan-dpia.mmd, which mirrors the
// `assessments` block of the MinBZK Pre-scan DPIA (sources/prescan.yaml):
//   DPIA verplicht  ⇐ Q1 nieuwe wet- of regelgeving ∨ Σ risicoscore > 4
//                     ∨ ≥ 1 item op de AP-lijst ∨ ≥ 2 criteria van de EDPB-lijst
//   DPIA aanbevolen ⇐ precies 1 criterium van de EDPB-lijst
// The AP and EDPB lists are not asked as such: Q11 asks for processing activities
// (each mapped to an AP item and/or EDPB criterion below), and the list items about
// kinds of data, vulnerable groups and scale are derived from Q3–Q8.
// RJSF dependencies cannot add up scores, so the schema asks Q2–Q11 in flowchart order
// and the sum is computed here, on the result screen.
//
// The scoring tables below use the Dutch answer texts. The English schema has the
// same structure and option order, so English answers are first mapped to their
// Dutch counterparts by position.

import nlSchema from "../schemas/avg/nl/prescan-dpia.json";
import enSchema from "../schemas/avg/en/prescan-dpia.json";

const NOTA = "Geen van de bovenstaande";

const TO_DUTCH = new Map<string, string>();
const collectEnums = (nl: unknown, en: unknown): void => {
  if (Array.isArray(nl) && Array.isArray(en)) {
    nl.forEach((v, i) => collectEnums(v, en[i]));
  } else if (nl && en && typeof nl === "object" && typeof en === "object") {
    const nlObj = nl as Record<string, unknown>;
    const enObj = en as Record<string, unknown>;
    const enEnum = enObj.enum;
    if (Array.isArray(nlObj.enum) && Array.isArray(enEnum)) {
      nlObj.enum.forEach((v, i) => TO_DUTCH.set(String(enEnum[i]), String(v)));
    }
    for (const k of Object.keys(nlObj)) collectEnums(nlObj[k], enObj[k]);
  }
};
collectEnums(nlSchema.JSONSchema, enSchema.JSONSchema);

const toDutch = (value: unknown): unknown =>
  Array.isArray(value)
    ? value.map((v) => TO_DUTCH.get(String(v)) ?? v)
    : typeof value === "string"
    ? TO_DUTCH.get(value) ?? value
    : value;

const selected = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v) => v !== NOTA) : [];

// Weights copied from the weightedCountMap() calls in prescan.yaml.
const BETROKKENEN_WEIGHTS: Record<string, number> = {
  "Medewerkers": 1,
  "Betrokkenen wiens gegevens worden verwerkt in het proces/systeem/applicatie": 1,
  "Kinderen jonger dan 16 jaar": 3,
  "Andere kwetsbare groepen (gehandicapten, minderheden, etc.)": 3,
};
const weighted = (value: unknown, weights: Record<string, number>) =>
  selected(value).reduce((sum, v) => sum + (weights[v] ?? 0), 0);

type EdpbCriterion =
  | "sensitive"
  | "vulnerable"
  | "largescale"
  | "monitoring"
  | "scoring"
  | "blocking"
  | "automated"
  | "matching"
  | "newtech";

// Q11 options: whether each is on the AP list, and which EDPB criterion it meets.
const ACTIVITY_LISTS: Record<string, { ap: boolean; edpb?: EdpbCriterion }> = {
  "Cameratoezicht, vast of flexibel (bijv. bodycams, drones)": { ap: true, edpb: "monitoring" },
  "Stelselmatig volgen van gedrag, locatie of communicatie van medewerkers": { ap: true, edpb: "monitoring" },
  "Heimelijk onderzoek naar personen": { ap: true, edpb: "monitoring" },
  "Observeren of beïnvloeden van gedrag (bijv. online tracking, gepersonaliseerde beïnvloeding)": { ap: true, edpb: "monitoring" },
  "Profilering of beoordelen van personen op persoonskenmerken (scoring)": { ap: true, edpb: "scoring" },
  "Bepalen van kredietwaardigheid (creditscores)": { ap: true, edpb: "scoring" },
  "Fraudebestrijding": { ap: true },
  "Zwarte lijsten: registratie van personen die tot uitsluiting kan leiden": { ap: true, edpb: "blocking" },
  "Besluiten die iemand een dienst, recht of contract kunnen ontzeggen": { ap: false, edpb: "blocking" },
  "Geautomatiseerde besluitvorming met rechtsgevolgen of vergelijkbare gevolgen": { ap: false, edpb: "automated" },
  "Uitwisselen of koppelen van gegevens tussen organisaties (samenwerkingsverband)": { ap: true, edpb: "matching" },
  "Koppelen of combineren van datasets binnen de eigen organisatie": { ap: false, edpb: "matching" },
  "Internet of things (slimme apparaten, sensoren)": { ap: true, edpb: "newtech" },
  "Andere nieuwe technologie (bijv. AI, gezichtsherkenning)": { ap: false, edpb: "newtech" },
};

// AP-list items about kinds of data apply only to large-scale or systematic processing.
const AP_DATA_ITEMS = [
  "Biometrische gegevens met het oog op de unieke identificatie van een persoon",
  "Genetische gegevens",
  "Gegevens over gezondheid",
  "Communicatie- en locatiegegevens",
  "Gegevens over de financiële situatie van de betrokkene",
];
const SENSITIVE_Q4 = [
  "Gegevens over de financiële situatie van de betrokkene",
  "Communicatie- en locatiegegevens",
  "Strafrechtelijke gegevens",
  "Andere gegevens die kunnen leiden tot stigmatisering of uitsluiting van de betrokkene",
];
const VULNERABLE_Q5 = [
  "Kinderen jonger dan 16 jaar",
  "Andere kwetsbare groepen (gehandicapten, minderheden, etc.)",
];

export type PrescanLevel = "required" | "recommended" | "none";
export type PrescanReason = "legislation" | "riskscore" | "aplist" | "edpblist2" | "edpblist1";

export interface PrescanResult {
  level: PrescanLevel;
  reasons: PrescanReason[];
  /** Σ of the risk scores of Q2–Q10 (0 when Q1 = Ja, because those questions are skipped). */
  riskScore: number;
  /** Risk score per question, for the breakdown on the result screen. */
  scores: Record<string, number>;
}

export function evaluatePrescanDpia(answers: Record<string, unknown>): PrescanResult {
  const data = Object.fromEntries(Object.entries(answers).map(([k, v]) => [k, toDutch(v)]));
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
    q8: ["Continu (doorlopend)", "Dagelijks of wekelijks", "Maandelijks"].includes(String(data.q8)) ? 1 : 0,
    q9: ["Aantal jaren", "Jaar"].includes(String(data.q9)) ? 1 : 0,
    q10: data.q10 === "Ja, inclusief bijzondere persoonsgegevens" ? 2 : data.q10 === "Ja, zonder bijzondere persoonsgegevens" ? 1 : 0,
  };
  const riskScore = Object.values(scores).reduce((a, b) => a + b, 0);

  const activities = selected(data.q11).map((v) => ACTIVITY_LISTS[v]).filter(Boolean);
  const q3 = selected(data.q3);
  const q4 = selected(data.q4);
  const largeScale = data.q6 === "Ja" || data.q7 === "Ja";
  const systematic = ["Continu (doorlopend)", "Dagelijks of wekelijks"].includes(String(data.q8));

  const nAp =
    activities.filter((a) => a.ap).length +
    (largeScale || systematic ? [...q3, ...q4].filter((v) => AP_DATA_ITEMS.includes(v)).length : 0);

  const edpb = new Set<EdpbCriterion>();
  for (const a of activities) if (a.edpb) edpb.add(a.edpb);
  if (q3.length || q4.some((v) => SENSITIVE_Q4.includes(v))) edpb.add("sensitive");
  if (
    selected(data.q5).some((v) => VULNERABLE_Q5.includes(v)) ||
    q4.includes("Gegevens die betrekking hebben op kwetsbare groepen")
  )
    edpb.add("vulnerable");
  if (largeScale) edpb.add("largescale");
  const nEdpb = edpb.size;

  const required: PrescanReason[] = [];
  if (data.q1 === "Ja") required.push("legislation");
  if (riskScore > 4) required.push("riskscore");
  if (nAp >= 1) required.push("aplist");
  if (nEdpb >= 2) required.push("edpblist2");

  if (required.length) return { level: "required", reasons: required, riskScore, scores };
  if (nEdpb === 1) return { level: "recommended", reasons: ["edpblist1"], riskScore, scores };
  return { level: "none", reasons: [], riskScore, scores };
}
