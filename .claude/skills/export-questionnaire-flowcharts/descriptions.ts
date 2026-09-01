// Header title + one-paragraph description shown under the logo on each PDF.
// Wording is the curated house text from the `old mermaid` charts: the title names the
// articles covered, the lead enumerates the screens in order, and every lead closes with
// the pointer to the tool itself — that closer is what licenses the condensed node text
// in the charts (see the authoring rules in SKILL.md). Keys match the chart keys.
//
// The four NTA 8047 charts (nta-*) are Dutch-only: the schemas in src/schemas/nta/en are
// still byte-identical copies of the Dutch ones, so an English chart would not match what
// the tool shows. Add the en entries together with the English masters once those land.

export interface Desc {
  title: string;
  text: string;
}

export const DESCRIPTIONS: Record<"en" | "nl", Record<string, Desc>> = {
  en: {
    identification: {
      title: "Flowchart — Identification (Art. 3 AI Act, Algorithm Register Guidelines, Art. 4, 22 GDPR)",
      text: "This schematic representation shows the logic required to determine whether the application qualifies as an AI system according to Article 3 of the AI Act, as a high-impact algorithm according to the Algorithm Register Guidelines, and/or as solely automated decision-making (sADM) according to Article 4 and 22 of the GDPR, including the personal-data and profiling screens. The complete questions can be found in the AI AQT tool itself.",
    },
    "identification-ai": {
      title: "Flowchart — AI system (Art. 3 AI Act)",
      text: "This schematic representation shows the logic required to determine whether the application qualifies as an AI system according to Article 3 of the AI Act. The flowchart of the complete Identification questionnaire with all paths and outcomes can be found on the Algorithm Audit website. The complete questions can be found in the AI AQT tool itself.",
    },
    "identification-algo": {
      title: "Flowchart — High-impact algorithm (Algorithm Register Guidelines)",
      text: "This schematic representation shows the logic required to determine whether the application qualifies as a high-impact algorithm according to the Algorithm Register Guidelines. The flowchart of the complete Identification questionnaire with all paths and outcomes can be found on the Algorithm Audit website. The complete questions can be found in the AI AQT tool itself.",
    },
    "identification-sadm": {
      title: "Flowchart — Solely automated decision-making (sADM) (Art. 4, 22 GDPR)",
      text: "This schematic representation shows the logic required to determine whether there is solely automated decision-making (sADM) according to Article 4 and 22 of the GDPR. The flowchart of the complete Identification questionnaire with all paths and outcomes can be found on the Algorithm Audit website. The complete questions can be found in the AI AQT tool itself.",
    },
    role: {
      title: "Flowchart — Role and status (Art. 2, 3, 25, 43, 111, 113 AI Act)",
      text: "This schematic representation shows the logic required to determine what your role is in relation to the AI system and how the usage status of the system can be determined according to Article 2, 3, 25, 43, 111 and 113 of the AI Act. The complete questions can be found in the AI AQT tool itself.",
    },
    risk: {
      title: "Flowchart — Risk category (Art. 2, 3, 5, 6, 50 and Annex I, III AI Act)",
      text: "This schematic representation shows the logic required to determine the risk category of an AI system according to Article 2, 3, 5, 6, 50 and Annex I, III of the AI Act, covering the Annex I safety-component / product check, the Article 6(1) third-party conformity assessment, the biometric-data screen, the Recital 54 cybersecurity / personal-data-protection carve-out, the Article 50 transparency screen, the Annex III high-risk domains, the prohibited-practices screening of Article 5(1)(a) and (c), and the Article 2 exception screen with the Article 6 classification rules. The complete questions can be found in the AI AQT tool itself.",
    },
    obligations: {
      title: "Flowchart — Obligations by risk category, role and Article 50 scenario (Art. 4, 5, 9, 10-17, 26, 27, 43, 47-50, 72 and Annex III, IV AI Act)",
      text: "This schematic representation shows the obligations that apply, depending on the role of the actor (provider or deployer) and the risk category (prohibited, high-risk or generative and interactive AI), mirroring the conditional logic of the “Risk category results” page based on the Risk category questionnaire and Role and status questionnaire. The complete questions and result page text can be found in the AI AQT itself.",
    },
  },
  nl: {
    identification: {
      title: "Stroomschema — Identificatie (Art. 3 AI-verordening, Handreiking Algoritmeregister, Art. 4, 22 AVG)",
      text: "Dit schema toont de logica om te bepalen of de toepassing kwalificeert als AI-systeem volgens artikel 3 van de AI-verordening, als impactvol algoritme volgens de Handreiking Algoritmeregister en/of als uitsluitend op geautomatiseerde verwerking gebaseerde besluitvorming (sADM) volgens artikel 4 en 22 van de AVG, inclusief de schermen voor persoonsgegevens en profilering. De volledige vragen zijn te vinden in de AI AQT tool zelf.",
    },
    "identification-ai": {
      title: "Stroomschema — AI-systeem (Art. 3 AI-verordening)",
      text: "Dit schema toont de logica om te bepalen of de toepassing kwalificeert als AI-systeem volgens artikel 3 van de AI-verordening. Het stroomschema van de volledige Identificatie-vragenlijst met alle paden en uitkomsten is te vinden op de website van Algorithm Audit. De volledige vragen zijn te vinden in de AI AQT tool zelf.",
    },
    "identification-algo": {
      title: "Stroomschema — Impactvol algoritme (Handreiking Algoritmeregister)",
      text: "Dit schema toont de logica om te bepalen of de toepassing kwalificeert als impactvol algoritme volgens de Handreiking Algoritmeregister. Het stroomschema van de volledige Identificatie-vragenlijst met alle paden en uitkomsten is te vinden op de website van Algorithm Audit. De volledige vragen zijn te vinden in de AI AQT tool zelf.",
    },
    "identification-sadm": {
      title: "Stroomschema — Uitsluitend op geautomatiseerde verwerking gebaseerde besluitvorming (sADM) (Art. 4, 22 AVG)",
      text: "Dit schema toont de logica om te bepalen of er sprake is van uitsluitend op geautomatiseerde verwerking gebaseerde besluitvorming (sADM) volgens artikel 4 en 22 van de AVG. Het stroomschema van de volledige Identificatie-vragenlijst met alle paden en uitkomsten is te vinden op de website van Algorithm Audit. De volledige vragen zijn te vinden in de AI AQT tool zelf.",
    },
    role: {
      title: "Stroomschema — Rol en status (Art. 2, 3, 25, 43, 111, 113 AI-verordening)",
      text: "Dit schema toont de logica om te bepalen wat jouw rol is ten opzichte van het AI-systeem en hoe de gebruiksstatus van het systeem kan worden bepaald volgens artikel 2, 3, 25, 43, 111 en 113 van de AI-verordening. De volledige vragen zijn te vinden in de AI AQT tool zelf.",
    },
    risk: {
      title: "Stroomschema — Risicocategorie (Art. 2, 3, 5, 6, 50 en bijlage I, III AI-verordening)",
      text: "Dit schema toont de logica om de risicocategorie van een AI-systeem te bepalen volgens artikel 2, 3, 5, 6, 50 en bijlage I, III van de AI-verordening, met de Bijlage I veiligheidscomponent-/productcontrole, de Artikel 6(1) conformiteitsbeoordeling door een derde partij, het biometrische gegevens-scherm, de Overweging 54 uitzondering voor cybersecurity en bescherming van persoonsgegevens, het Artikel 50 transparantie-scherm, de hoog-risico-domeinen van Bijlage III, de screening van verboden praktijken uit Artikel 5(1)(a) en (c) en het Artikel 2 uitzonderingenscherm met de classificatieregels van Artikel 6. De volledige vragen zijn te vinden in de AI AQT tool zelf.",
    },
    obligations: {
      title: "Stroomschema — Verplichtingen per risicocategorie, rol en Artikel 50-scenario (Art. 4, 5, 9, 10-17, 26, 27, 43, 47-50, 72 en Bijlage III, IV AI-verordening)",
      text: "Dit schema toont de verplichtingen die van toepassing zijn, afhankelijk van de rol van de actor (aanbieder of gebruiksverantwoordelijke) en de risicocategorie (verboden, hoog-risico of generatieve en interactieve AI), en weerspiegelt de conditionele logica van de pagina “Risicocategorie-resultaten” op basis van de Risicocategorie-vragenlijst en de Rol en status-vragenlijst. De volledige vragen en de tekst van de resultaten-pagina zijn te vinden in de AI AQT tool zelf.",
    },
    nta: {
      title: "Stroomschema \u2014 NTA 8047 voor profileringsalgoritmes (hoofdstukken 6\u20139)",
      text: "Dit schema toont de vier NTA 8047-vragenlijsten in \u00e9\u00e9n beeld, zoals ze vanaf het NTA-scherm in de tool kunnen worden gestart: Wenselijkheid en noodzakelijkheid (hoofdstuk 6), Ontwerp en ontwikkeling (hoofdstuk 7), Toetsing (hoofdstuk 8) en Gebruik profileringsalgoritme (hoofdstuk 9). Elk hoofdstuk staat op een eigen rij: een reeks schermen met per scherm de NTA-paragraaf, een korte omschrijving en het aantal vast te leggen vereisten, eindigend op de resultatenpagina van dat hoofdstuk. De instapknoop links op elke rij geeft aan waar dat hoofdstuk vandaan wordt gestart \u2014 vanaf het NTA-scherm, of na de resultatenpagina van het vorige hoofdstuk. De vier vragenlijsten zijn lineaire documentatieformulieren: er zijn geen vertakkingen en de volgorde tussen de hoofdstukken wordt niet door de tool afgedwongen. Het auteursrecht op de vereisten en de NTA 8047 berust bij NEN. De volledige vragen zijn te vinden in de AI AQT tool zelf.",
    },
    "nta-wenselijkheid": {
      title: "Stroomschema \u2014 NTA 8047 hoofdstuk 6: Wenselijkheid en noodzakelijkheid (\u00a7 6.2\u20136.6)",
      text: "Dit schema toont de schermen van de vragenlijst Wenselijkheid en noodzakelijkheid, in de volgorde waarin ze in de tool worden doorlopen: probleemanalyse (6.2), doel van het besluitvormingsproces (6.3), belangen van betrokkenen (6.4), alternatieve instrumenten (6.5) en de voorlopige afweging (6.6). Per scherm is aangegeven hoeveel vereisten uit de NTA moeten worden vastgelegd. Deze vragenlijst is een lineair documentatieformulier: er zijn geen vertakkingen of uitkomsten. Het auteursrecht op de vereisten en de NTA 8047 berust bij NEN. De volledige vragen zijn te vinden in de AI AQT tool zelf.",
    },
    "nta-ontwerp": {
      title: "Stroomschema \u2014 NTA 8047 hoofdstuk 7: Ontwerp en ontwikkeling (\u00a7 7.2\u20137.8)",
      text: "Dit schema toont de schermen van de vragenlijst Ontwerp en ontwikkeling, in de volgorde waarin ze in de tool worden doorlopen: doelvariabele (7.2), datasets, datakwaliteit en datasetdocumentatie (7.3.1\u20137.3.3), kwalitatieve en kwantitatieve analyse van profileringskenmerken (7.4.2\u20137.4.3), algoritmekeuze (7.5), opstellen van het profileringsalgoritme (7.6), prestaties, indirect onderscheid, statistisch toetsen en herziening van metrieken (7.7.2\u20137.7.5) en de documentatie van de ontwikkeling (7.8). Per scherm is aangegeven hoeveel vereisten uit de NTA moeten worden vastgelegd. Deze vragenlijst is een lineair documentatieformulier: er zijn geen vertakkingen of uitkomsten. Het auteursrecht op de vereisten en de NTA 8047 berust bij NEN. De volledige vragen zijn te vinden in de AI AQT tool zelf.",
    },
    "nta-verificatie": {
      title: "Stroomschema \u2014 NTA 8047 hoofdstuk 8: Toetsing (\u00a7 8.2\u20138.7)",
      text: "Dit schema toont de schermen van de vragenlijst Toetsing, in de volgorde waarin ze in de tool worden doorlopen: adviezen en besluitvorming (8.2), doel en context van de verificatie, testdataset, schaduwdraaien en het beoordelen van prestaties en onderscheid (8.3.1\u20138.3.4), de juridische toets (8.4), praktijkvalidatie (8.5), onafhankelijke assessment of audit (8.6) en de definitieve afweging (8.7). Per scherm is aangegeven hoeveel vereisten uit de NTA moeten worden vastgelegd. Deze vragenlijst is een lineair documentatieformulier: er zijn geen vertakkingen of uitkomsten. Het auteursrecht op de vereisten en de NTA 8047 berust bij NEN. De volledige vragen zijn te vinden in de AI AQT tool zelf.",
    },
    "nta-gebruik": {
      title: "Stroomschema \u2014 NTA 8047 hoofdstuk 9: Gebruik profileringsalgoritme (\u00a7 9.2.1\u20139.3.4)",
      text: "Dit schema toont de schermen van de vragenlijst Gebruik profileringsalgoritme, in de volgorde waarin ze in de tool worden doorlopen: duidelijke werkinstructies en consistente uitkomsten (9.2.1), selectie voor het besluitvormingsproces (9.2.2), transparantieverplichtingen (9.2.3), monitoren op organisatorische waarborgen en veranderingen (9.3.2), monitoren van prestaties en onderscheid (9.3.3) en het herevalueren van de toetsing (9.3.4). Per scherm is aangegeven hoeveel vereisten uit de NTA moeten worden vastgelegd. Deze vragenlijst is een lineair documentatieformulier: er zijn geen vertakkingen of uitkomsten. Het auteursrecht op de vereisten en de NTA 8047 berust bij NEN. De volledige vragen zijn te vinden in de AI AQT tool zelf.",
    },
  },
};
