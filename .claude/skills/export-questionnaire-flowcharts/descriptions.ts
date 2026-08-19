// Header title + one-paragraph description shown under the logo on each PDF.
// Edit freely; keys must match the chart keys used in generate.ts.

export interface Desc {
  title: string;
  text: string;
}

export const DESCRIPTIONS: Record<"en" | "nl", Record<string, Desc>> = {
  en: {
    identification: {
      title: "Identification — EU AI Act",
      text: "Decision tree that determines whether a system qualifies as an AI system, a high-impact algorithm and/or fully automated decision-making (sADM), and whether the GDPR applies to it.",
    },
    "identification-ai": {
      title: "Identification · AI system — EU AI Act",
      text: "Sub-view of the identification questionnaire: the paths that lead to the 'AI system' outcome.",
    },
    "identification-algo": {
      title: "Identification · High-impact algorithm — EU AI Act",
      text: "Sub-view of the identification questionnaire: the paths that lead to the 'high-impact algorithm' outcome.",
    },
    "identification-sadm": {
      title: "Identification · Automated decision-making (sADM) — EU AI Act",
      text: "Sub-view of the identification questionnaire: the paths that lead to the 'fully automated decision-making (sADM)' outcome.",
    },
    role: {
      title: "Role and status — EU AI Act",
      text: "Decision tree that determines your role under the AI Act (provider, deployer, importer, distributor, authorised representative or private user) and the system's status (in use or in development).",
    },
    risk: {
      title: "Risk category — EU AI Act",
      text: "Decision tree that classifies an AI system's risk category under the AI Act — prohibited, high-risk, high-risk with exception, or minimal/no requirements — following Annex I, Annex III and Articles 5 and 6.",
    },
    obligations: {
      title: "Obligations — EU AI Act",
      text: "Maps the applicable AI Act obligations based on your role, the system's status and its risk category.",
    },
  },
  nl: {
    identification: {
      title: "Identificatie — EU AI-verordening",
      text: "Beslisboom die bepaalt of een systeem kwalificeert als AI-systeem, impactvol algoritme en/of volledig geautomatiseerde besluitvorming (sADM), en of de AVG van toepassing is.",
    },
    "identification-ai": {
      title: "Identificatie · AI-systeem — EU AI-verordening",
      text: "Deelweergave van de identificatievragenlijst: de paden die leiden tot de uitkomst 'AI-systeem'.",
    },
    "identification-algo": {
      title: "Identificatie · Impactvol algoritme — EU AI-verordening",
      text: "Deelweergave van de identificatievragenlijst: de paden die leiden tot de uitkomst 'impactvol algoritme'.",
    },
    "identification-sadm": {
      title: "Identificatie · Geautomatiseerde besluitvorming (sADM) — EU AI-verordening",
      text: "Deelweergave van de identificatievragenlijst: de paden die leiden tot de uitkomst 'volledig geautomatiseerde besluitvorming (sADM)'.",
    },
    role: {
      title: "Rol en status — EU AI-verordening",
      text: "Beslisboom die je rol onder de AI-verordening bepaalt (aanbieder, gebruiksverantwoordelijke, importeur, distributeur, gemachtigde of privégebruiker) en de status van het systeem (in gebruik of in ontwikkeling).",
    },
    risk: {
      title: "Risicocategorie — EU AI-verordening",
      text: "Beslisboom die de risicocategorie van een AI-systeem bepaalt — verboden, hoog risico, hoog risico met uitzondering, of minimaal/geen vereisten — op basis van Bijlage I, Bijlage III en de artikelen 5 en 6.",
    },
    obligations: {
      title: "Verplichtingen — EU AI-verordening",
      text: "Brengt de toepasselijke verplichtingen onder de AI-verordening in kaart op basis van je rol, de status van het systeem en de risicocategorie.",
    },
  },
};
