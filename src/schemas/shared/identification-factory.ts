import type { IdentificationTranslations, OutputClassification } from "./identification-types";

// ---------------------------------------------------------------------------
// Output refs that represent a conclusive "this IS an AI system" result
// ---------------------------------------------------------------------------
const AI_SYSTEM_REFS = new Set([
  "#/definitions/outputAI",
  "#/definitions/outputAlgoandAI",
  "#/definitions/outputAlgosADMandAI",
]);

// ---------------------------------------------------------------------------
// Helper: decide whether a $ref targets an output or an automation definition
// ---------------------------------------------------------------------------
const refToProp = (ref: string, nextStepsText?: string) => {
  const key = ref.includes("output") ? "output" : "automation";
  return {
    [key]: { $ref: ref },
    ...(nextStepsText !== undefined
      ? { nextStepsText: { type: "string", default: nextStepsText } }
      : {}),
    ...(AI_SYSTEM_REFS.has(ref)
      ? { isAISystem: { type: "string", default: "true" } }
      : {}),
  };
};

// ---------------------------------------------------------------------------
// Q5 dependencies factory
// Params: five $ref strings controlling the branching after Q5 / Q5_1
// ---------------------------------------------------------------------------
const buildQ5Dependencies = (
  t: IdentificationTranslations,
  nsLookup: Record<string, string>,
  string1: string, // q5 = "other decisions" → this ref
  string2: string, // q5 in [formal,financial,schools,eligibility,otherLegal] → this ref
  string3: string, // q5 = "prioritization" → this ref
  string4: string, // q5_1 = yes → this ref
  string5: string  // q5_1 = no  → this ref
) => {
  const { q5Options: o, q5_1Options: o1 } = t;
  const yesOptions = [o1.yes1, o1.yes2, o1.yes3, o1.yes4, o1.yes5];

  return {
    q5: {
      oneOf: [
        {
          properties: {
            q5: { enum: [o.other] },
            q5_option8: { type: "string", title: t.q5OtherDescription, default: "" },
            ...refToProp(string1, nsLookup[string1]),
          },
          required: ["q5_option8"],
        },
        {
          properties: {
            q5: {
              enum: [o.formalComplaints, o.financial, o.schools, o.eligibility, o.otherLegal],
            },
            ...refToProp(string2, nsLookup[string2]),
          },
        },
        {
          properties: {
            q5: { enum: [o.inspection] },
            q5_1: {
              type: "string",
              title: t.q5_1Title,
              enum: [o1.yes1, o1.yes2, o1.yes3, o1.yes4, o1.yes5, o1.no],
            },
          },
        },
        {
          properties: {
            q5: { enum: [o.prioritization] },
            ...refToProp(string3, nsLookup[string3]),
          },
        },
      ],
    },
    q5_1: {
      oneOf: [
        {
          properties: {
            q5_1: { enum: yesOptions },
            ...refToProp(string4, nsLookup[string4]),
          },
        },
        {
          properties: {
            q5_1: { enum: [o1.no] },
            ...refToProp(string5, nsLookup[string5]),
          },
        },
      ],
    },
  };
};

// ---------------------------------------------------------------------------
// Automation definition factory
// Builds the nested Q7 → output schema for one of the 5 automation variants.
//
// The Q7 options are grouped into three output tiers:
//   high12  – options 1 (direct) + 2 (strong)
//   medium34 – options 3 (partial) + 4 (process)
//   low5    – option 5 (fully human)  AND the "other" branch
//
// When two adjacent tiers share the same $ref they are merged into a single
// oneOf branch, matching the original schemas exactly.
// ---------------------------------------------------------------------------
const buildAutomation = (
  t: IdentificationTranslations,
  nsLookup: Record<string, string>,
  refs: { high12: string; medium34: string; low5: string }
) => {
  const { q7Options: o } = t;
  const { high12, medium34, low5 } = refs;

  const highOpts = [o.direct];
  const mediumOpts = [o.partial];

  let oneOf: object[];

  if (medium34 === low5) {
    // sADM: options 3+4+5 all go to the same ref (low5); only 1+2 differ
    oneOf = [
      {
        properties: {
          q7: { enum: [...mediumOpts, o.human] },
          ...refToProp(low5, nsLookup[low5]),
        },
      },
      {
        properties: {
          q7: { enum: [o.other] },
          q7_option5: { type: "string", title: t.q7OtherDescription },
          ...refToProp(low5, nsLookup[low5]),
        },
        required: ["q7_option5"],
      },
      {
        properties: {
          q7: { enum: highOpts },
          ...refToProp(high12, nsLookup[high12]),
        },
      },
    ];
  } else if (high12 === medium34) {
    // Algo / AIAlgo: options 1+2+3+4 all go to the same ref (high12); only 5 differs
    oneOf = [
      {
        properties: {
          q7: { enum: [o.human] },
          ...refToProp(low5, nsLookup[low5]),
        },
      },
      {
        properties: {
          q7: { enum: [o.other] },
          q7_option5: { type: "string", title: t.q7OtherDescription },
          ...refToProp(low5, nsLookup[low5]),
        },
        required: ["q7_option5"],
      },
      {
        properties: {
          q7: { enum: [...highOpts, ...mediumOpts] },
          ...refToProp(high12, nsLookup[high12]),
        },
      },
    ];
  } else {
    // AlgosADM / AIAlgosADM: all three tiers are distinct
    oneOf = [
      {
        properties: {
          q7: { enum: [o.human] },
          ...refToProp(low5, nsLookup[low5]),
        },
      },
      {
        properties: {
          q7: { enum: [o.other] },
          q7_option5: { type: "string", title: t.q7OtherDescription },
          ...refToProp(low5, nsLookup[low5]),
        },
        required: ["q7_option5"],
      },
      {
        properties: {
          q7: { enum: highOpts },
          ...refToProp(high12, nsLookup[high12]),
        },
      },
      {
        properties: {
          q7: { enum: mediumOpts },
          ...refToProp(medium34, nsLookup[medium34]),
        },
      },
    ];
  }

  return {
    title: "Automation",
    type: "object",
    properties: {
      q7: {
        type: "string",
        title: t.q7Title,
        enum: [o.direct, o.partial, o.human, o.other],
      },
    },
    required: ["q7"],
    dependencies: { q7: { oneOf } },
  };
};

// ---------------------------------------------------------------------------
// Impact definition factory
// Builds the Q4 → Q5/Q5_1/Q6 → output schema for one of the 3 impact variants.
// ---------------------------------------------------------------------------
type ImpactOptions =
  | {
      // sADM: when Q4=No → show outputNone
      hasQ6: false;
      q5refs: [string, string, string, string, string];
      q4NoRef: string;
      nsLookup: Record<string, string>;
    }
  | {
      // Algo / AI: when Q4=No → show Q6
      hasQ6: true;
      q5refs: [string, string, string, string, string];
      q6YesRef: string;
      q6NoRef: string;
      nsLookup: Record<string, string>;
    };

const buildImpact = (t: IdentificationTranslations, opts: ImpactOptions) => {
  const { q4Options: o4, q5Options: o5, q6Options: o6 } = t;

  const q5Field = {
    type: "string",
    title: t.q5Title,
    enum: [
      o5.prioritization,
      o5.formalComplaints,
      o5.financial,
      o5.inspection,
      o5.schools,
      o5.eligibility,
      o5.otherLegal,
      o5.other,
    ],
  };

  const q4NoBranch = opts.hasQ6
    ? {
        properties: {
          q4: { enum: [o4.no] },
          q6: {
            type: "string",
            title: t.q6Title,
            enum: [o6.yes, o6.unsure, o6.no],
          },
        },
        required: ["q6"],
      }
    : {
        properties: {
          q4: { enum: [o4.no] },
          output: { $ref: opts.q4NoRef },
          ...(opts.nsLookup[opts.q4NoRef] !== undefined
            ? { nextStepsText: { type: "string", default: opts.nsLookup[opts.q4NoRef] } }
            : {}),
        },
      };

  const q6Dependencies = opts.hasQ6
    ? {
        q6: {
          oneOf: [
            {
              properties: {
                q6: { enum: [o6.yes] },
                automation: { $ref: opts.q6YesRef },
              },
            },
            {
              properties: {
                q6: { enum: [o6.unsure] },
                q6_unsure: {
                  type: "string",
                  title: t.q6UnsureDescription,
                  default: "",
                },
                automation: { $ref: opts.q6YesRef },
              },
              required: ["q6_unsure"],
            },
            {
              properties: {
                q6: { enum: [o6.no] },
                output: { $ref: opts.q6NoRef },
                ...(opts.nsLookup[opts.q6NoRef] !== undefined
                  ? { nextStepsText: { type: "string", default: opts.nsLookup[opts.q6NoRef] } }
                  : {}),
              },
            },
          ],
        },
      }
    : {};

  return {
    title: "Impact",
    type: "object",
    properties: {
      q4: { type: "string", title: t.q4Title, enum: [o4.yes, o4.no] },
    },
    required: ["q4"],
    dependencies: {
      q4: {
        oneOf: [
          {
            properties: { q4: { enum: [o4.yes] }, q5: q5Field },
            required: ["q5"],
          },
          q4NoBranch,
        ],
      },
      ...buildQ5Dependencies(t, opts.nsLookup, ...opts.q5refs),
      ...q6Dependencies,
    },
  };
};

// ---------------------------------------------------------------------------
// Saving/sharing (Q8–Q10) factory
// Builds the Q8 → Q8b → Q9 → Q10 → impact chain.
// ---------------------------------------------------------------------------
const buildSavingSharing = (
  t: IdentificationTranslations,
  impactRef: string
) => {
  const { q8Options, q8bOptions, q9Options, q10Options } = t;
  const intermediateProps = {
    outputIntermediate: {
      type: "string",
      title: t.nextStepTitle,
      default: t.nextStepText,
    },
    impact: { $ref: impactRef },
  };

  // Q9 → Q10 structure reused for both Q8b=Yes and Q8b=No branches
  const q9Field = { type: "string", title: t.q9Title, enum: [q9Options.yes, q9Options.no] };
  const q9Dependencies = {
    q9: {
      oneOf: [
        {
          properties: {
            q9: { enum: [q9Options.yes] },
            ...intermediateProps,
          },
        },
        {
          properties: {
            q9: { enum: [q9Options.no] },
            q10: {
              type: "string",
              title: t.q10Title,
              enum: [q10Options.yes, q10Options.no],
            },
          },
          required: ["q10"],
          dependencies: {
            q10: {
              oneOf: [
                {
                  properties: {
                    q10: { enum: [q10Options.yes] },
                    additionalOutputText: { default: t.storageWarning },
                    ...intermediateProps,
                  },
                },
                {
                  properties: {
                    q10: { enum: [q10Options.no] },
                    additionalOutputText: { default: "" },
                    ...intermediateProps,
                  },
                },
              ],
            },
          },
        },
      ],
    },
  };

  return {
    properties: {
      q8: { type: "string", title: t.q8Title, enum: [q8Options.yes, q8Options.no] },
    },
    required: ["q8"],
    dependencies: {
      q8: {
        oneOf: [
          {
            properties: {
              q8: { enum: [q8Options.no] },
              ...intermediateProps,
            },
          },
          {
            // Q8 = Yes → ask Q8b (profiling), then Q9 regardless of answer
            properties: {
              q8: { enum: [q8Options.yes] },
              q8b: {
                type: "string",
                title: t.q8bTitle,
                enum: [q8bOptions.yes, q8bOptions.no],
              },
            },
            required: ["q8b"],
            dependencies: {
              q8b: {
                oneOf: [
                  {
                    properties: { q8b: { enum: [q8bOptions.yes] }, q9: q9Field },
                    required: ["q9"],
                    dependencies: q9Dependencies,
                  },
                  {
                    properties: { q8b: { enum: [q8bOptions.no] }, q9: q9Field },
                    required: ["q9"],
                    dependencies: q9Dependencies,
                  },
                ],
              },
            },
          },
        ],
      },
    },
  };
};

// ---------------------------------------------------------------------------
// Main factory
// ---------------------------------------------------------------------------
export const createIdentificationSchema = (t: IdentificationTranslations) => {
  const { q1Options: o1, q2Options: o2, q3Options: o3 } = t;

  const saving_sharing_AIAlgosADM = buildSavingSharing(
    t,
    "#/definitions/impact_AIAlgosADM"
  );
  const saving_sharing_AlgosADM = buildSavingSharing(
    t,
    "#/definitions/impact_AlgosADM"
  );
  const saving_sharing_sADM = buildSavingSharing(
    t,
    "#/definitions/impact_sADM"
  );

  const outputDef = (text: string, classification?: OutputClassification) => ({
    type: "string",
    title: t.outputResultTitle,
    default: text,
    ...(classification ? { classification } : {}),
  });

  // Lookup from output $ref → nextStepsText default value
  const nsLookup: Record<string, string> = {
    "#/definitions/outputAI": t.outputNextSteps.AI,
    "#/definitions/outputAlgo": t.outputNextSteps.Algo,
    "#/definitions/outputsADM": t.outputNextSteps.sADM,
    "#/definitions/outputAlgoandAI": t.outputNextSteps.AlgoAndAI,
    "#/definitions/outputAlgoandsADM": t.outputNextSteps.AlgoAndSADM,
    "#/definitions/outputAlgosADMandAI": t.outputNextSteps.AlgoSADMAndAI,
  };

  return {
    JSONSchema: {
      title: t.schemaTitle,
      type: "object",
      definitions: {
        // ── Output definitions ──────────────────────────────────────────────
        outputAI: outputDef(t.outputs.AI,             { ai: "yes", algo: "no",   sadm: "no"    }),
        outputAlgo: outputDef(t.outputs.Algo,          { ai: "no",  algo: "yes",  sadm: "no"    }),
        outputsADM: outputDef(t.outputs.sADM,          { ai: "no",  algo: "no",   sadm: "maybe" }),
        outputAlgoandAI: outputDef(t.outputs.AlgoAndAI,     { ai: "yes", algo: "yes",  sadm: "no"    }),
        outputAlgoandsADM: outputDef(t.outputs.AlgoAndSADM, { ai: "no",  algo: "yes",  sadm: "maybe" }),
        outputAlgosADMandAI: outputDef(t.outputs.AlgoSADMAndAI, { ai: "yes", algo: "yes", sadm: "maybe" }),
        outputNone: outputDef(t.outputs.None,          { ai: "no",  algo: "no",   sadm: "no"    }),

        // ── Automation definitions (Q7 → output) ───────────────────────────
        automation_sADM: buildAutomation(t, nsLookup, {
          high12: "#/definitions/outputsADM",
          medium34: "#/definitions/outputNone",
          low5: "#/definitions/outputNone",
        }),
        automation_Algo: buildAutomation(t, nsLookup, {
          high12: "#/definitions/outputAlgo",
          medium34: "#/definitions/outputAlgo",
          low5: "#/definitions/outputNone",
        }),
        automation_AlgosADM: buildAutomation(t, nsLookup, {
          high12: "#/definitions/outputAlgoandsADM",
          medium34: "#/definitions/outputAlgo",
          low5: "#/definitions/outputNone",
        }),
        automation_AIAlgosADM: buildAutomation(t, nsLookup, {
          high12: "#/definitions/outputAlgosADMandAI",
          medium34: "#/definitions/outputAlgoandAI",
          low5: "#/definitions/outputAI",
        }),
        automation_AIAlgo: buildAutomation(t, nsLookup, {
          high12: "#/definitions/outputAlgoandAI",
          medium34: "#/definitions/outputAlgoandAI",
          low5: "#/definitions/outputAI",
        }),

        // ── Impact definitions (Q4 → Q5/Q6 → automation) ──────────────────
        impact_sADM: buildImpact(t, {
          hasQ6: false,
          q5refs: [
            "#/definitions/outputNone",
            "#/definitions/automation_sADM",
            "#/definitions/outputNone",
            "#/definitions/automation_sADM",
            "#/definitions/outputNone",
          ],
          q4NoRef: "#/definitions/outputNone",
          nsLookup,
        }),
        impact_AlgosADM: buildImpact(t, {
          hasQ6: true,
          q5refs: [
            "#/definitions/outputNone",
            "#/definitions/automation_AlgosADM",
            "#/definitions/automation_Algo",
            "#/definitions/automation_AlgosADM",
            "#/definitions/automation_Algo",
          ],
          q6YesRef: "#/definitions/automation_Algo",
          q6NoRef: "#/definitions/outputNone",
          nsLookup,
        }),
        impact_AIAlgosADM: buildImpact(t, {
          hasQ6: true,
          q5refs: [
            "#/definitions/outputAI",
            "#/definitions/automation_AIAlgosADM",
            "#/definitions/automation_AIAlgo",
            "#/definitions/automation_AIAlgosADM",
            "#/definitions/automation_AIAlgo",
          ],
          q6YesRef: "#/definitions/automation_AIAlgo",
          q6NoRef: "#/definitions/outputAI",
          nsLookup,
        }),
      },

      // ── Intro screen ─────────────────────────────────────────────────────
      properties: {
        intro: { type: "string", title: "", default: "" },
        q1: {
          type: "array",
          title: t.q1Title,
          items: {
            type: "string",
            enum: [
              o1.score,
              o1.label,
              o1.recommendation,
              o1.decision,
              o1.content,
              o1.recognition,
              o1.dashboard,
              o1.other,
            ],
          },
          minItems: 1,
          uniqueItems: true,
        },
      },

      // ── Q1 → Q2 → Q3 dependency chain ────────────────────────────────────
      dependencies: {
        q1: {
          oneOf: [
            // Q1 = only "other" → ask for description, then Q8
            {
              properties: {
                q1: { maxItems: 1, contains: { enum: [o1.other] } },
                q1_option6: { type: "string", title: t.q1OtherDescription, default: "" },
                ...saving_sharing_sADM.properties,
              },
              required: ["q1_option6", ...saving_sharing_sADM.required],
              dependencies: saving_sharing_sADM.dependencies,
            },
            // Q1 = only "dashboard" → Q8
            {
              properties: {
                q1: { maxItems: 1, contains: { enum: [o1.dashboard] } },
                ...saving_sharing_sADM.properties,
              },
              required: saving_sharing_sADM.required,
              dependencies: saving_sharing_sADM.dependencies,
            },
            // Q1 = dashboard + other (exactly 2) → ask for description, then Q8
            {
              properties: {
                q1: {
                  minItems: 2,
                  maxItems: 2,
                  allOf: [
                    { contains: { enum: [o1.dashboard] } },
                    { contains: { enum: [o1.other] } },
                  ],
                },
                q1_option6: { type: "string", title: t.q1OtherDescription, default: "" },
                ...saving_sharing_sADM.properties,
              },
              required: ["q1_option6", ...saving_sharing_sADM.required],
              dependencies: saving_sharing_sADM.dependencies,
            },
            // Q1 contains a meaningful output → ask Q2
            {
              properties: {
                q1: {
                  anyOf: [
                    { contains: { enum: [o1.score] } },
                    { contains: { enum: [o1.label] } },
                    { contains: { enum: [o1.recommendation] } },
                    { contains: { enum: [o1.decision] } },
                    { contains: { enum: [o1.content] } },
                    { contains: { enum: [o1.recognition] } },
                  ],
                },
                q2: {
                  type: "string",
                  title: t.q2Title,
                  enum: [o2.dataInspired, o2.dataDerived, o2.noData],
                },
              },
              required: ["q2"],
            },
          ],
        },

        q2: {
          oneOf: [
            // Q2 = data-inspired (no AI) → q2_yes1 → Q8
            {
              properties: {
                q2: { enum: [o2.dataInspired] },
                q2_yes1: { type: "string", title: t.q2DescribeInsights, default: "" },
                ...saving_sharing_AlgosADM.properties,
              },
              required: ["q2_yes1", ...saving_sharing_AlgosADM.required],
              dependencies: saving_sharing_AlgosADM.dependencies,
            },
            // Q2 = data-derived (AI) → Q8 directly
            {
              properties: {
                q2: { enum: [o2.dataDerived] },
                q2_yes2: { type: "string", title: t.q2DescribeMethod, default: "" },
                ...saving_sharing_AIAlgosADM.properties,
              },
              required: ["q2_yes2", ...saving_sharing_AIAlgosADM.required],
              dependencies: saving_sharing_AIAlgosADM.dependencies,
            },
            // Q2 = no data → Q3
            {
              properties: {
                q2: { enum: [o2.noData] },
                q3: {
                  type: "string",
                  title: t.q3Title,
                  enum: [o3.oneToOne, o3.informal, o3.symbolic, o3.no],
                },
              },
              required: ["q3"],
            },
          ],
        },

        q3: {
          oneOf: [
            // Q3 = one-to-one legislation → ask formal ref text, then Q8
            {
              properties: {
                q3: { enum: [o3.oneToOne] },
                q3_yes1: { type: "string", title: t.q3FormalRefTitle, default: "" },
                ...saving_sharing_sADM.properties,
              },
              required: ["q3_yes1", ...saving_sharing_sADM.required],
              dependencies: saving_sharing_sADM.dependencies,
            },
            // Q3 = informal rules → Q8 directly
            {
              properties: {
                q3: { enum: [o3.informal] },
                ...saving_sharing_AlgosADM.properties,
              },
              required: saving_sharing_AlgosADM.required,
              dependencies: saving_sharing_AlgosADM.dependencies,
            },
            // Q3 = symbolic AI → ask description, then Q8
            {
              properties: {
                q3: { enum: [o3.symbolic] },
                q3_symbolic: { type: "string", title: t.q3SymbolicDescription, default: "" },
                ...saving_sharing_AIAlgosADM.properties,
              },
              required: ["q3_symbolic", ...saving_sharing_AIAlgosADM.required],
              dependencies: saving_sharing_AIAlgosADM.dependencies,
            },
            // Q3 = no → ask description, then Q8
            {
              properties: {
                q3: { enum: [o3.no] },
                q3_no: { type: "string", title: t.q3NoDescription, default: "" },
                ...saving_sharing_AlgosADM.properties,
              },
              required: ["q3_no", ...saving_sharing_AlgosADM.required],
              dependencies: saving_sharing_AlgosADM.dependencies,
            },
          ],
        },
      },
    },

    // ── uiSchema ─────────────────────────────────────────────────────────────
    uiSchema: {
      intro: {
        "ui:id": "start",
        "ui:widget": "IntroWidget",
        "ui:options": { label: false },
      },
      q1: {
        "ui:id": "q1",
        "ui:widget": "checkboxes",
        "ui:description": t.q1Description,
        "ui:descriptionStyle": "plain",
        "ui:badges": t.q1Badges,
        "ui:enumTooltips": t.q1EnumTooltips,
        ...(t.q1EnumDescriptions ? { "ui:enumDescriptions": t.q1EnumDescriptions } : {}),
      },
      q1_option6: { "ui:id": "q1.1", "ui:widget": "textarea" },
      q2: {
        "ui:id": "q2",
        "ui:widget": "radio",
        "ui:description": t.q2Description,
        "ui:badges": t.q2Badges,
        "ui:enumTooltips": t.q2EnumTooltips,
      },
      q2_yes1: { "ui:id": "q2.1", "ui:widget": "textarea" },
      q2_yes2: { "ui:id": "q2.1", "ui:widget": "textarea" },
      q3: {
        "ui:id": "q3",
        "ui:widget": "radio",
        "ui:enableMarkdownInDescription": true,
        "ui:description": t.q3Description,
        "ui:badges": t.q3Badges,
        ...(t.q3EnumTooltips ? { "ui:enumTooltips": t.q3EnumTooltips } : {}),
      },
      q3_yes1: { "ui:id": "q3.1", "ui:widget": "textarea" },
      q3_symbolic: { "ui:id": "q3.1", "ui:widget": "textarea" },
      q3_no: { "ui:id": "q3.1", "ui:widget": "textarea" },
      q4: {
        "ui:id": "q8",
        "ui:widget": "radio",
        "ui:enableMarkdownInDescription": true,
        "ui:description": t.q4Description,
        "ui:badges": t.q4Badges,
      },
      q5: { "ui:id": "q9", "ui:widget": "radio", "ui:badges": t.q5Badges, ...(t.q5EnumDescriptions ? { "ui:enumDescriptions": t.q5EnumDescriptions } : {}) },
      q5_option8: { "ui:id": "q9.1", "ui:widget": "textarea" },
      q5_1: { "ui:id": "q10", "ui:widget": "radio", "ui:badges": t.q5_1Badges },
      q6: { "ui:id": "q11", "ui:widget": "radio", "ui:badges": t.q6Badges },
      q6_unsure: { "ui:id": "q11.1", "ui:widget": "textarea" },
      q7: {
        "ui:id": "q12",
        "ui:widget": "radio",
        "ui:badges": t.q7Badges,
        ...(t.q7EnumTooltips ? { "ui:enumTooltips": t.q7EnumTooltips } : {}),
      },
      q7_option5: { "ui:id": "q12.1", "ui:widget": "textarea" },
      q8: {
        "ui:id": "q4",
        "ui:widget": "radio",
        "ui:description": t.q8Description,
        "ui:descriptionStyle": "plain",
        "ui:alertDescription": t.q8AlertDescription,
        "ui:badges": t.q8Badges,
      },
      q8b: {
        "ui:id": "q5",
        "ui:widget": "radio",
        "ui:description": t.q8bDescription,
        "ui:descriptionStyle": "plain",
        "ui:alertDescription": t.q8bAlertDescription,
        "ui:badges": t.q8bBadges,
      },
      q9: { "ui:id": "q6", "ui:widget": "radio", "ui:badges": t.q9Badges },
      q10: { "ui:id": "q7", "ui:widget": "radio", "ui:badges": t.q10Badges },
      outputIntermediate: {
        "ui:widget": "PlainTextWidget",
        "ui:classNames": "intermediate-output",
      },
      additionalOutputText: { "ui:widget": "hidden" },
      nextStepsText: { "ui:widget": "hidden" },
      isAISystem: { "ui:widget": "hidden" },
    },
  };
};
