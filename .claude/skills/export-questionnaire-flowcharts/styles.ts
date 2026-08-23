// Verbatim Mermaid init blocks + classDefs, copied from the curated charts in
// ~/Desktop/old mermaid. This is the single source of truth for colours/fonts.
// Terminal-node colours are applied by mapping each questionnaire outcome to one
// of these classDef names (see generate.ts -> outcomeClass()).

const init = (nodeSpacing: number, rankSpacing: number) =>
  `%%{init: {'theme': 'base', 'themeVariables': {'fontFamily': 'Avenir Next, Avenir, Helvetica, sans-serif', 'fontSize': '14px', 'lineColor': '#005AA7', 'primaryColor': '#005AA7', 'edgeLabelBackground': '#ffffff'}, 'flowchart': {'curve': 'basis', 'useMaxWidth': false, 'htmlLabels': true, 'nodeSpacing': ${nodeSpacing}, 'rankSpacing': ${rankSpacing}, 'padding': 24}}}%%`;

const Q = "classDef Q fill:#daeaf7,stroke:#005aa7,color:#000";
const linkDefault = "linkStyle default stroke:#005AA7,stroke-width:1.2px";

export interface ChartStyle {
  init: string;
  classDefs: string[]; // includes the Q classDef and the linkStyle default line
}

export const STYLES: Record<string, ChartStyle> = {
  risk: {
    init: init(100, 140),
    classDefs: [
      Q,
      "classDef gate fill:#e0f2fe,stroke:#0284c7,color:#0c4a6e,font-weight:bold",
      "classDef exc fill:#eff6ff,stroke:#3b82f6,color:#1e3a8a",
      "classDef cat_low fill:#0d9488,stroke:#0d9488,color:#fff,font-weight:bold",
      "classDef cat_high fill:#d97706,stroke:#d97706,color:#fff,font-weight:bold",
      "classDef cat_except fill:#6c757d,stroke:#6c757d,color:#fff,font-weight:bold",
      "classDef cat_forb fill:#dc3545,stroke:#dc3545,color:#fff,font-weight:bold",
      linkDefault,
    ],
  },

  role: {
    init: init(80, 110),
    classDefs: [
      Q,
      "classDef cat_provider fill:#6f42c1,stroke:#6f42c1,color:#fff,font-weight:bold",
      "classDef cat_pd fill:#6f42c1,stroke:#003c70,color:#fff,font-weight:bold",
      "classDef cat_deployer fill:#0891b2,stroke:#0891b2,color:#fff,font-weight:bold",
      "classDef cat_importer fill:#65a30d,stroke:#65a30d,color:#fff,font-weight:bold",
      "classDef cat_distrib fill:#92400e,stroke:#92400e,color:#fff,font-weight:bold",
      "classDef cat_repr fill:#475569,stroke:#475569,color:#fff,font-weight:bold",
      "classDef cat_private fill:#0f766e,stroke:#0f766e,color:#fff,font-weight:bold",
      "classDef cat_inuse fill:#2563eb,stroke:#2563eb,color:#fff,font-weight:bold",
      "classDef cat_indev fill:#8b5cf6,stroke:#8b5cf6,color:#fff,font-weight:bold",
      linkDefault,
    ],
  },

  obligations: {
    init: init(90, 130),
    classDefs: [
      Q,
      "classDef cat_forb fill:#dc3545,stroke:#a01c2a,color:#fff,font-weight:bold",
      "classDef cat_high fill:#d97706,stroke:#a05705,color:#fff,font-weight:bold",
      "classDef cat_genai fill:#FFBF00,stroke:#b88a00,color:#fff,font-weight:bold",
      "classDef role_prov fill:#6f42c1,stroke:#4f2c91,color:#fff,font-weight:bold",
      "classDef role_dep fill:#0891b2,stroke:#076a8d,color:#fff,font-weight:bold",
      "classDef scenario fill:#fff5cc,stroke:#b88a00,color:#000,font-weight:bold",
      "classDef oblig_forb fill:#fbe2e4,stroke:#dc3545,color:#000",
      "classDef oblig_high fill:#fdecd0,stroke:#d97706,color:#000",
      "classDef oblig_genai fill:#f1f3f5,stroke:#9aa3ab,color:#000",
      linkDefault,
    ],
  },

  identification: {
    init: init(80, 110),
    classDefs: [
      Q,
      "classDef mid fill:#fffde7,stroke:#ffc107,color:#555",
      "classDef pA fill:#eaeff5,stroke:#6B8A9E,color:#4a6d8c",
      "classDef pB fill:#fff3ea,stroke:#e06010,color:#7a3a00",
      "classDef pC fill:#fffff0,stroke:#b8860b,color:#7a5e00",
      "classDef cat_ai fill:#fff9e0,stroke:#c9a84c,color:#000,font-weight:bold",
      "classDef cat_algo fill:#ffe9d6,stroke:#fd7e14,color:#000,font-weight:bold",
      "classDef cat_gdpr fill:#198754,stroke:#198754,color:#fff,font-weight:bold",
      "classDef cat_sadm fill:#eaeff5,stroke:#6B8A9E,color:#000,font-weight:bold",
      "classDef cat_prof fill:#e0e7ff,stroke:#4f46e5,color:#000,font-weight:bold",
      "classDef oNone fill:#f5f5f5,stroke:#adb5bd,color:#6c757d",
      linkDefault,
    ],
  },

  "identification-ai": {
    init: init(80, 110),
    classDefs: [
      Q,
      "classDef pA fill:#eaeff5,stroke:#6B8A9E,color:#4a6d8c,font-weight:bold",
      "classDef pB fill:#fff3ea,stroke:#e06010,color:#7a3a00,font-weight:bold",
      "classDef pC fill:#fffff0,stroke:#b8860b,color:#7a5e00,font-weight:bold",
      "classDef cat_ai fill:#c9a84c,stroke:#c9a84c,color:#fff,font-weight:bold",
      "classDef cat_none fill:#f5f5f5,stroke:#adb5bd,color:#6c757d",
      linkDefault,
    ],
  },

  "identification-algo": {
    init: init(80, 110),
    classDefs: [
      Q,
      "classDef cat_algo fill:#fd7e14,stroke:#fd7e14,color:#fff,font-weight:bold",
      "classDef cat_none fill:#f5f5f5,stroke:#adb5bd,color:#6c757d",
      linkDefault,
    ],
  },

  "identification-sadm": {
    init: init(80, 110),
    classDefs: [
      Q,
      "classDef cat_sadm fill:#6B8A9E,stroke:#6B8A9E,color:#fff,font-weight:bold",
      "classDef cat_gdpr fill:#198754,stroke:#198754,color:#fff,font-weight:bold",
      "classDef cat_prof fill:#e0e7ff,stroke:#4f46e5,color:#000,font-weight:bold",
      "classDef cat_none fill:#f5f5f5,stroke:#adb5bd,color:#6c757d",
      linkDefault,
    ],
  },

  // The four NTA 8047 chapter charts share one style: they are linear documentation
  // forms, so there is a single question class and one terminal (the result screen).
  ...Object.fromEntries(
    ["nta", "nta-wenselijkheid", "nta-ontwerp", "nta-verificatie", "nta-gebruik"].map((k) => [
      k,
      {
        init: init(80, 110),
        classDefs: [
          Q,
          "classDef entry fill:#e0f2fe,stroke:#0284c7,color:#0c4a6e,font-weight:bold",
          "classDef cat_result fill:#005AA7,stroke:#003c70,color:#fff,font-weight:bold",
          linkDefault,
        ],
      },
    ])
  ),
};
