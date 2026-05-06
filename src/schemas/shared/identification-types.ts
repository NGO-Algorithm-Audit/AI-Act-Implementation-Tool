export interface Badge {
  label: string;
  color: string;
  url: string;
}

export type OutputClassification = {
  ai: "yes" | "no" | null;
  algo: "yes" | "no" | null;
  sadm: "yes" | "no" | "maybe" | null;
};

export interface IdentificationTranslations {
  schemaTitle: string;

  // Q1
  q1Title: string;
  q1Description: string;
  q1Options: {
    score: string;
    label: string;
    recommendation: string;
    decision: string;
    content: string;
    recognition: string;
    dashboard: string;
    other: string;
  };
  q1OtherDescription: string;
  q1Badges: Badge[];
  q1EnumTooltips: (string | null)[];
  /** Optional per-option descriptions shown below the option label */
  q1EnumDescriptions?: (string | null)[];

  // Q2
  q2Title: string;
  q2Options: {
    dataInspired: string;
    dataDerived: string;
    genAI: string;
    noData: string;
  };
  q2DescribeInsights: string;
  q2DescribeMethod: string;
  q2DescribeGenAI: string;
  q2Description: string;
  q2Badges: Badge[];
  q2EnumTooltips: (string | null)[];

  // Q3
  q3Title: string;
  q3Options: {
    oneToOne: string;
    informal: string;
    symbolic: string;
    no: string;
  };
  q3FormalRefTitle: string;
  q3SymbolicDescription: string;
  q3NoDescription: string;
  q3Description: string;
  q3Badges: Badge[];
  q3EnumTooltips?: (string | null)[];

  // Q4
  q4Title: string;
  q4Options: { yes: string; no: string };
  q4Description: string;
  q4Badges: Badge[];

  // Q5
  q5Title: string;
  q5Options: {
    prioritization: string;
    formalComplaints: string;
    financial: string;
    inspection: string;
    schools: string;
    eligibility: string;
    otherLegal: string;
    other: string;
  };
  q5OtherDescription: string;
  q5EnumDescriptions?: (string | null)[];
  q5Badges: Badge[];

  // Q5_1
  q5_1Title: string;
  q5_1Options: {
    yes1: string;
    yes2: string;
    yes3: string;
    yes4: string;
    yes5: string;
    no: string;
  };
  q5_1ControlDescription: string;
  q5_1Badges: Badge[];

  // Q6
  q6Title: string;
  q6Options: { yes: string; unsure: string; no: string };
  q6UnsureDescription: string;
  q6Badges: Badge[];

  // Q7
  q7Title: string;
  q7Options: {
    direct: string;
    partial: string;
    human: string;
    other: string;
  };
  q7OtherDescription: string;
  q7EnumTooltips?: (string | null)[];
  q7Description: string;
  q7Badges: Badge[];

  // Q8
  q8Title: string;
  q8Options: { yes: string; no: string };
  q8Description: string;
  q8AlertDescription: string;
  q8Badges: Badge[];

  // Q8b (profiling — between Q8 and Q9, shown when Q8 = Yes)
  q8bTitle: string;
  q8bDescription: string;
  q8bAlertDescription: string;
  q8bOptions: { yes: string; no: string };
  q8bBadges: Badge[];

  // Q9
  q9Title: string;
  q9Options: { yes: string; no: string };
  q9Badges: Badge[];

  // Q10
  q10Title: string;
  q10Options: { yes: string; no: string };
  q10Badges: Badge[];

  // Intermediate output shown between sections
  nextStepTitle: string;
  nextStepText: string;

  // Warning about long-term storage/sharing
  storageWarning: string;

  // Output result texts
  outputResultTitle: string;
  outputs: {
    AI: string;
    Algo: string;
    sADM: string;
    AlgoAndAI: string;
    AlgoAndSADM: string;
    AlgoSADMAndAI: string;
    None: string;
  };
  outputNextSteps: {
    AI: string;
    Algo: string;
    sADM: string;
    AlgoAndAI: string;
    AlgoAndSADM: string;
    AlgoSADMAndAI: string;
  };
}
