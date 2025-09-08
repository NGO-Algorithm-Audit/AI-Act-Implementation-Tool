import { AICont } from "./identificatie/AICont";
import { AIContDoorgaan } from "./identificatie/AICont-doorgaan";
import { noAICont } from "./identificatie/noAICont";
import { noAIContDoorgaan } from "./identificatie/noAICont-doorgaan";
import { q5, q5Dependencies } from "./identificatie/q5";

export const identificationSchema = {
  JSONSchema: {
    title:
      "[beta] Identificatie AI-systeem, impactvolle algoritmes en geautomatiseerde besluitvorming",
    type: "object",
    definitions: {
      outputNoAI: {
        type: "string",
        title: "Uitslag",
        default:
          "Op basis van uw antwoorden is uw toepassing geen AI-systeem of impactvol algoritme.",
      },
      outputAI: {
        type: "string",
        title: "Uitslag",
        default:
          "Op basis van uw antwoorden is uw toepassing een AI-systeem volgens de AI-verordening. Vul de volgende vragenlijst in om te bepalen aan welke vereisten uit de AI-verordening de toepassing moet voldoen.",
      },
      outputAlgorithm: {
        type: "string",
        title: "Uitslag",
        default:
          "Op basis van uw antwoorden is uw toepassing een impactvol algoritme. Het algoritme moet worden opgenomen in de het Algoritmeregister en het moet voldoen aan intern geldend algoritmebeleid.",
      },
      outputAlgorithmAndAI: {
        type: "string",
        title: "Uitslag",
        default:
          "Op basis van uw antwoorden is uw toepassing een impactvol algoritme. Het algoritme moet worden opgenomen in de het Algoritmeregister en het moet voldoen aan intern geldend algoritmebeleid. \nOp basis van uw antwoorden is uw toepassing ook een AI-systeem volgens de AI-verordening. Vul de volgende vragenlijst in om te bepalen Vul de volgende vragenlijst in om te bepalen of de toepassing moet voldoen aan aanvullende eisen volgens de AI-verordening.",
      },
      outputAlgoAndADM: {
        type: "string",
        title: "Uitslag",
        default:
          "Op basis van uw antwoorden is uw toepassing:\n- geen AI-systeem volgens de AI-verordening;\n- wel een impactvol algoritme; en\n- mogelijk geautomatiseerde besluitivorming volgens artikel 22 van de AVG.\n\nVervolgstappen:\n- Neem het algoritme op in het Algoritmeregister\n - Zorg dat wordt voldaan aan intern geldend algoritmebeleid.\n- Bepaal in overleg met relevante juridische experts of er daadwerkelijk sprake is van geautomatiseerde besluitvorming.",
      },
      outputAlgoAndADMAndAI: {
        type: "string",
        title: "Uitslag",
        default:
          "Op basis van uw antwoorden is uw toepassing:\n- een AI-systeem volgens de AI-verordening;\n- een impactvol algoritme; en\n- mogelijk geautomatiseerde besluitivorming volgens artikel 22 van de AVG.\n\nVervolgstappen:\n- Vul de AI risicoclassificatie vragenlijst in om te bepalen aan welke vereisten uit de AI-verordening de toepassing moet voldoen.\n- Neem het algoritme op in het Algoritmeregister.\n- Zorg dat wordt voldaan aan intern geldend algoritmebeleid.\n- Bepaal in overleg met relevante juridische experts of er daadwerkelijk sprake is van geautomatiseerde besluitvorming.",
      },
      outputIntermediateAISystem: {
        type: "string",
        title: "Uitslag",
        default:
          "Deze toepassing is een AI-systeem volgens de AI-verordening. Mogelijk is dit systeem ook een impactvol algoritme, vul daarvoor de volgende vragen in.",
      },
      effect: {
        title: "Effect",
        type: "object",
        properties: {
          q7: {
            type: "string",
            title:
              "Welke van de volgende opties beschrijft het effect van de toepassing op de uitkomst het beste?",
            enum: [
              "De uitkomst van het proces wordt direct bepaald door de toepassing (hier is geen menselijke tussenkomst voor nodig). Nadat het proces is voltooid, kunnen mensen nog wel de resultaten controleren of analyseren.",
              "De uitkomst van het proces wordt sterk beïnvloed door de toepassing. Bijvoorbeeld doordat werkvoorschriften bepalen wat het gevolg is van een bepaalde uitkomst van de toepassing. Een medewerker kan in sommige gevallen andere keuzes maken, maar meestal bepaalt het resultaat van het systeem wat het eindresultaat van het proces zal zijn.",
              "De uitkomst van het proces wordt deels beïnvloed door de toepassing. Het resultaat van de toepassing is belangrijk voor het eindresultaat, maar de uiteindelijke beslissing wordt genomen door een medewerker. Deze medewerker heeft de juiste informatie, ervaring/kunde, mandaat en beschikbare tijd om de beslissing te maken.",
              "De toepassing bepaalt (mede) het procesverloop, maar de uitkomst van het proces wordt volledig door een medewerker bepaald. Bijvoorbeeld wanneer de uitkomst van de toepassing een risicoscore aan de hand waarvan een controle proces wordt gestart of een meer insentieve dossierevalutie plaatsvindt, maar de controle of evaluatie daarna volledig door een medewerker wordt uitgevoerd.",
              "Het procesverloop en uitkomst van het proces wordt volledig door een mens bepaald. Het resultaat van de toepassing is slechts één van de factoren en is niet doorslaggevend in de keuze.",
              "Een ander soort effect",
            ],
          },
        },
        required: ["q7"],
        dependencies: {
          q7: {
            oneOf: [
              {
                properties: {
                  q7: {
                    enum: [
                      "Het procesverloop en uitkomst van het proces wordt volledig door een mens bepaald. Het resultaat van de toepassing is slechts één van de factoren en is niet doorslaggevend in de keuze.",
                    ],
                  },
                  output: { $ref: "#/definitions/outputNoAI" },
                },
              },
              {
                properties: {
                  q7: { enum: ["Een ander soort effect"] },
                  q7_option5: {
                    type: "string",
                    title:
                      "Beschrijf het effect van de toepassing op het proces",
                  },
                  output: { $ref: "#/definitions/outputNoAI" },
                },
                required: ["q7_option5"],
              },
              {
                properties: {
                  q7: {
                    enum: [
                      "De uitkomst van het proces wordt direct bepaald door de toepassing (hier is geen menselijke tussenkomst voor nodig). Nadat het proces is voltooid, kunnen mensen nog wel de resultaten controleren of analyseren.",
                      "De uitkomst van het proces wordt sterk beïnvloed door de toepassing. Bijvoorbeeld doordat werkvoorschriften bepalen wat het gevolg is van een bepaalde uitkomst van de toepassing. Een medewerker kan in sommige gevallen andere keuzes maken, maar meestal bepaalt het resultaat van het systeem wat het eindresultaat van het proces zal zijn.",
                      "De uitkomst van het proces wordt deels beïnvloed door de toepassing. Het resultaat van de toepassing is belangrijk voor het eindresultaat, maar de uiteindelijke beslissing wordt genomen door een medewerker. Deze medewerker heeft de juiste informatie, ervaring/kunde, mandaat en beschikbare tijd om de beslissing te maken.",
                      "De toepassing bepaalt (mede) het procesverloop, maar de uitkomst van het proces wordt volledig door een medewerker bepaald. Bijvoorbeeld wanneer de uitkomst van de toepassing een risicoscore aan de hand waarvan een controle proces wordt gestart of een meer insentieve dossierevalutie plaatsvindt, maar de controle of evaluatie daarna volledig door een medewerker wordt uitgevoerd.",
                    ],
                  },
                  output: { $ref: "#/definitions/outputAlgorithm" },
                },
              },
            ],
          },
        },
      },
      effectADM: {
        title: "Effect",
        type: "object",
        properties: {
          q7: {
            type: "string",
            title:
              "Welke van de volgende opties beschrijft het effect van de toepassing op de uitkomst het beste?",
            enum: [
              "De uitkomst van het proces wordt direct bepaald door de toepassing (hier is geen menselijke tussenkomst voor nodig). Nadat het proces is voltooid, kunnen mensen nog wel de resultaten controleren of analyseren.",
              "De uitkomst van het proces wordt sterk beïnvloed door de toepassing. Bijvoorbeeld doordat werkvoorschriften bepalen wat het gevolg is van een bepaalde uitkomst van de toepassing. Een medewerker kan in sommige gevallen andere keuzes maken, maar meestal bepaalt het resultaat van het systeem wat het eindresultaat van het proces zal zijn.",
              "De uitkomst van het proces wordt deels beïnvloed door de toepassing. Het resultaat van de toepassing is belangrijk voor het eindresultaat, maar de uiteindelijke beslissing wordt genomen door een medewerker. Deze medewerker heeft de juiste informatie, ervaring/kunde, mandaat en beschikbare tijd om de beslissing te maken.",
              "De toepassing bepaalt (mede) het procesverloop, maar de uitkomst van het proces wordt volledig door een medewerker bepaald. Bijvoorbeeld wanneer de uitkomst van de toepassing een risicoscore aan de hand waarvan een controle proces wordt gestart of een meer insentieve dossierevalutie plaatsvindt, maar de controle of evaluatie daarna volledig door een medewerker wordt uitgevoerd.",
              "Het procesverloop en uitkomst van het proces wordt volledig door een mens bepaald. Het resultaat van de toepassing is slechts één van de factoren en is niet doorslaggevend in de keuze.",
              "Een ander soort effect",
            ],
          },
        },
        required: ["q7"],
        dependencies: {
          q7: {
            oneOf: [
              {
                properties: {
                  q7: {
                    enum: [
                      "Het procesverloop en uitkomst van het proces wordt volledig door een mens bepaald. Het resultaat van de toepassing is slechts één van de factoren en is niet doorslaggevend in de keuze.",
                    ],
                  },
                  output: { $ref: "#/definitions/outputNoAI" },
                },
              },
              {
                properties: {
                  q7: { enum: ["Een ander soort effect"] },
                  q7_option5: {
                    type: "string",
                    title:
                      "Beschrijf het effect van de toepassing op het proces",
                  },
                  output: { $ref: "#/definitions/outputNoAI" },
                },
                required: ["q7_option5"],
              },
              {
                properties: {
                  q7: {
                    enum: [
                      "De uitkomst van het proces wordt direct bepaald door de toepassing (hier is geen menselijke tussenkomst voor nodig). Nadat het proces is voltooid, kunnen mensen nog wel de resultaten controleren of analyseren.",
                      "De uitkomst van het proces wordt sterk beïnvloed door de toepassing. Bijvoorbeeld doordat werkvoorschriften bepalen wat het gevolg is van een bepaalde uitkomst van de toepassing. Een medewerker kan in sommige gevallen andere keuzes maken, maar meestal bepaalt het resultaat van het systeem wat het eindresultaat van het proces zal zijn.",
                    ],
                  },
                  output: { $ref: "#/definitions/outputAlgoAndADM" },
                },
              },
              {
                properties: {
                  q7: {
                    enum: [
                      "De uitkomst van het proces wordt deels beïnvloed door de toepassing. Het resultaat van de toepassing is belangrijk voor het eindresultaat, maar de uiteindelijke beslissing wordt genomen door een medewerker. Deze medewerker heeft de juiste informatie, ervaring/kunde, mandaat en beschikbare tijd om de beslissing te maken.",
                      "De toepassing bepaalt (mede) het procesverloop, maar de uitkomst van het proces wordt volledig door een medewerker bepaald. Bijvoorbeeld wanneer de uitkomst van de toepassing een risicoscore aan de hand waarvan een controle proces wordt gestart of een meer insentieve dossierevalutie plaatsvindt, maar de controle of evaluatie daarna volledig door een medewerker wordt uitgevoerd.",
                    ],
                  },
                  output: { $ref: "#/definitions/outputAlgorithm" },
                },
              },
            ],
          },
        },
      },
      effectAIADM: {
        title: "Effect",
        type: "object",
        properties: {
          q7: {
            type: "string",
            title:
              "Welke van de volgende opties beschrijft het effect van de toepassing op de uitkomst het beste?",
            enum: [
              "De uitkomst van het proces wordt direct bepaald door de toepassing (hier is geen menselijke tussenkomst voor nodig). Nadat het proces is voltooid, kunnen mensen nog wel de resultaten controleren of analyseren.",
              "De uitkomst van het proces wordt sterk beïnvloed door de toepassing. Bijvoorbeeld doordat werkvoorschriften bepalen wat het gevolg is van een bepaalde uitkomst van de toepassing. Een medewerker kan in sommige gevallen andere keuzes maken, maar meestal bepaalt het resultaat van het systeem wat het eindresultaat van het proces zal zijn.",
              "De uitkomst van het proces wordt deels beïnvloed door de toepassing. Het resultaat van de toepassing is belangrijk voor het eindresultaat, maar de uiteindelijke beslissing wordt genomen door een medewerker. Deze medewerker heeft de juiste informatie, ervaring/kunde, mandaat en beschikbare tijd om de beslissing te maken.",
              "De toepassing bepaalt (mede) het procesverloop, maar de uitkomst van het proces wordt volledig door een medewerker bepaald. Bijvoorbeeld wanneer de uitkomst van de toepassing een risicoscore aan de hand waarvan een controle proces wordt gestart of een meer insentieve dossierevalutie plaatsvindt, maar de controle of evaluatie daarna volledig door een medewerker wordt uitgevoerd.",
              "Het procesverloop en uitkomst van het proces wordt volledig door een mens bepaald. Het resultaat van de toepassing is slechts één van de factoren en is niet doorslaggevend in de keuze.",
              "Een ander soort effect",
            ],
          },
        },
        required: ["q7"],
        dependencies: {
          q7: {
            oneOf: [
              {
                properties: {
                  q7: {
                    enum: [
                      "Het procesverloop en uitkomst van het proces wordt volledig door een mens bepaald. Het resultaat van de toepassing is slechts één van de factoren en is niet doorslaggevend in de keuze.",
                    ],
                  },
                  output: { $ref: "#/definitions/outputNoAI" },
                },
              },
              {
                properties: {
                  q7: { enum: ["Een ander soort effect"] },
                  q7_option5: {
                    type: "string",
                    title:
                      "Beschrijf het effect van de toepassing op het proces",
                  },
                  output: { $ref: "#/definitions/outputNoAI" },
                },
                required: ["q7_option5"],
              },
              {
                properties: {
                  q7: {
                    enum: [
                      "De uitkomst van het proces wordt direct bepaald door de toepassing (hier is geen menselijke tussenkomst voor nodig). Nadat het proces is voltooid, kunnen mensen nog wel de resultaten controleren of analyseren.",
                      "De uitkomst van het proces wordt sterk beïnvloed door de toepassing. Bijvoorbeeld doordat werkvoorschriften bepalen wat het gevolg is van een bepaalde uitkomst van de toepassing. Een medewerker kan in sommige gevallen andere keuzes maken, maar meestal bepaalt het resultaat van het systeem wat het eindresultaat van het proces zal zijn.",
                    ],
                  },
                  output: { $ref: "#/definitions/outputAlgoAndADMAndAI" },
                },
              },
              {
                properties: {
                  q7: {
                    enum: [
                      "De uitkomst van het proces wordt deels beïnvloed door de toepassing. Het resultaat van de toepassing is belangrijk voor het eindresultaat, maar de uiteindelijke beslissing wordt genomen door een medewerker. Deze medewerker heeft de juiste informatie, ervaring/kunde, mandaat en beschikbare tijd om de beslissing te maken.",
                      "De toepassing bepaalt (mede) het procesverloop, maar de uitkomst van het proces wordt volledig door een medewerker bepaald. Bijvoorbeeld wanneer de uitkomst van de toepassing een risicoscore aan de hand waarvan een controle proces wordt gestart of een meer insentieve dossierevalutie plaatsvindt, maar de controle of evaluatie daarna volledig door een medewerker wordt uitgevoerd.",
                    ],
                  },
                  output: { $ref: "#/definitions/outputAlgorithmAndAI" },
                },
              },
            ],
          },
        },
      },
      effectAI: {
        title: "EffectAI",
        type: "object",
        properties: {
          q7: {
            type: "string",
            title:
              "Welke van de volgende opties beschrijft het effect van de toepassing op de uitkomst het beste?",
            enum: [
              "De uitkomst van het proces wordt direct bepaald door de toepassing (er is geen sprake van menselijke tussenkomst). Nadat het proces is voltooid, kunnen mensen nog wel de resultaten controleren of analyseren.",
              "De uitkomst van het proces wordt sterk beïnvloed door de toepassing. Bijvoorbeeld doordat werkvoorschriften bepalen wat het gevolg is van een bepaalde uitkomst van de toepassing. Een medewerker kan in sommige gevallen andere keuzes maken, maar meestal bepaalt het resultaat van het systeem wat het eindresultaat van het proces zal zijn.",
              "De uitkomst van het proces wordt deels beïnvloed door de toepassing. Het resultaat van de toepassing is belangrijk voor het eindresultaat, maar de uiteindelijke beslissing wordt genomen door een medewerker. Deze medewerker heeft de juiste informatie, ervaring/kunde, mandaat en beschikbare tijd om de beslissing te maken.",
              "De toepassing bepaalt (mede) het procesverloop, maar de uitkomst van het proces wordt volledig door een medewerker bepaald. Bijvoorbeeld wanneer de uitkomst van de toepassing een risicoscore aan de hand waarvan een controle proces wordt gestart of een meer insentieve dossierevalutie plaatsvindt, maar de controle of evaluatie daarna volledig door een medewerker wordt uitgevoerd.",
              "Het procesverloop en uitkomst van het proces wordt volledig door een mens bepaald. Het resultaat van de toepassing is slechts één van de factoren en is niet doorslaggevend in de keuze.",
              "Een ander soort effect",
            ],
          },
        },
        required: ["q7"],
        dependencies: {
          q7: {
            oneOf: [
              {
                properties: {
                  q7: {
                    enum: [
                      "Het procesverloop en uitkomst van het proces wordt volledig door een mens bepaald. Het resultaat van de toepassing is slechts één van de factoren en is niet doorslaggevend in de keuze.",
                    ],
                  },
                  output: { $ref: "#/definitions/outputAI" },
                },
              },
              {
                properties: {
                  q7: { enum: ["Een ander soort effect"] },
                  q7_option5: {
                    type: "string",
                    title:
                      "Beschrijf het effect van de toepassing op het proces",
                  },
                  output: { $ref: "#/definitions/outputAI" },
                },
                required: ["q7_option5"],
              },
              {
                properties: {
                  q7: {
                    enum: [
                      "De uitkomst van het proces wordt direct bepaald door de toepassing (hier is geen menselijke tussenkomst voor nodig). Nadat het proces is voltooid, kunnen mensen nog wel de resultaten controleren of analyseren.",
                      "De uitkomst van het proces wordt sterk beïnvloed door de toepassing. Bijvoorbeeld doordat werkvoorschriften bepalen wat het gevolg is van een bepaalde uitkomst van de toepassing. Een medewerker kan in sommige gevallen andere keuzes maken, maar meestal bepaalt het resultaat van het systeem wat het eindresultaat van het proces zal zijn.",
                      "De uitkomst van het proces wordt deels beïnvloed door de toepassing. Het resultaat van de toepassing is belangrijk voor het eindresultaat, maar de uiteindelijke beslissing wordt genomen door een medewerker. Deze medewerker heeft de juiste informatie, ervaring/kunde, mandaat en beschikbare tijd om de beslissing te maken.",
                      "De toepassing bepaalt (mede) het procesverloop, maar de uitkomst van het proces wordt volledig door een medewerker bepaald. Bijvoorbeeld wanneer de uitkomst van de toepassing een risicoscore aan de hand waarvan een controle proces wordt gestart of een meer insentieve dossierevalutie plaatsvindt, maar de controle of evaluatie daarna volledig door een medewerker wordt uitgevoerd.",
                    ],
                  },
                  output: { $ref: "#/definitions/outputAlgorithmAndAI" },
                },
              },
            ],
          },
        },
      },
      impact: {
        title: "impact",
        type: "object",
        properties: {
          q4: {
            type: "string",
            title:
              "Wordt in het proces een beslissing genomen voor individuele burgers of ambtenaren?",
            enum: ["Ja", "Nee"],
          },
        },
        required: ["q4"],
        dependencies: {
          q4: {
            oneOf: [
              {
                properties: {
                  q4: {
                    enum: ["Ja"],
                  },
                  q5,
                },
                required: ["q5"],
              },
              {
                properties: {
                  q4: {
                    enum: ["Nee"],
                  },
                  q6: {
                    type: "string",
                    title:
                      "Draagt het proces bij aan hoe de overheid (groepen) burgers of ambtenaren categoriseert of benadert?",
                    enum: ["Ja", "Ik weet het niet zeker", "Nee"],
                  },
                },
                required: ["q6"],
              },
            ],
          },
          ...q5Dependencies(
            "#/definitions/outputNoAI",
            "#/definitions/effectADM",
            "#/definitions/effect",
            "#/definitions/effectADM",
            "#/definitions/effect"
          ),
          q6: {
            oneOf: [
              {
                properties: {
                  q6: {
                    enum: ["Ja"],
                  },
                  effect: { $ref: "#/definitions/effect" },
                },
              },
              {
                properties: {
                  q6: {
                    enum: ["Ik weet het niet zeker"],
                  },
                  q6_unsure: {
                    type: "string",
                    title:
                      "Geef een korte beschrijving van het proces en hoe dit burgers of ambtenaren raakt.",
                    default: "",
                  },
                  effect: { $ref: "#/definitions/effect" },
                },
                required: ["q6_unsure"],
              },
              {
                properties: {
                  q6: {
                    enum: ["Nee"],
                  },
                  output: { $ref: "#/definitions/outputNoAI" },
                },
              },
            ],
          },
        },
      },
      impactAI: {
        title: "impactAI",
        type: "object",
        properties: {
          q4: {
            type: "string",
            title:
              "Worden in het proces beslissingen genomen voor individuele burgers?",
            enum: ["Ja", "Nee"],
          },
        },
        required: ["q4"],
        dependencies: {
          q4: {
            oneOf: [
              {
                properties: {
                  q4: {
                    enum: ["Ja"],
                  },
                  q5,
                },
                required: ["q5"],
              },
              {
                properties: {
                  q4: {
                    enum: ["Nee"],
                  },
                  q6: {
                    type: "string",
                    title:
                      "Draagt het proces bij aan hoe de overheid (groepen) burgers of ambtenaren categoriseert of benadert?",
                    enum: ["Ja", "Ik weet het niet zeker", "Nee"],
                  },
                },
                required: ["q6"],
              },
            ],
          },
          ...q5Dependencies(
            "#/definitions/outputAI",
            "#/definitions/effectAIADM",
            "#/definitions/effectAI",
            "#/definitions/effectAIADM",
            "#/definitions/effectAI"
          ),
          q6: {
            oneOf: [
              {
                properties: {
                  q6: {
                    enum: ["Ja"],
                  },
                  effect: { $ref: "#/definitions/effectAI" },
                },
              },
              {
                properties: {
                  q6: {
                    enum: ["Ik weet het niet zeker"],
                  },
                  q6_unsure: {
                    type: "string",
                    title:
                      "Geef een korte beschrijving van het proces en hoe dit burgers of ambtenaren raakt.",
                    default: "",
                  },
                  effect: { $ref: "#/definitions/effectAI" },
                },
                required: ["q6_unsure"],
              },
              {
                properties: {
                  q6: {
                    enum: ["Nee"],
                  },
                  output: { $ref: "#/definitions/outputAI" },
                },
              },
            ],
          },
        },
      },
    },
    properties: {
      q1: {
        type: "array",
        title: "Wat is de uitkomst van de toepassing?",
        items: {
          type: "string",
          enum: [
            "Een ingeschatte score, rangschikking of kans",
            "Een ingeschat label of classificatie zoals ja/nee, hoog/laag of een indeling in groepen.\nBijvoorbeeld ten behoeve van routering, communicatiecampagnes of risicoclassificatie.",
            "Een aanbeveling",
            "Een beslissing",
            "Content, zoals geschreven tekst, video, audio of afbeeldingen",
            "Objectherkenning, gezichtsherkenning of stemherkenning",
            "Een dashboard of grafiek, met enkel rechtstreekse datavisualisatie.\nWanneer in dit dashboard een van de eerdere opties wordt weergeven, kies dan de eerdere optie.",
            "Een ander soort output",
          ],
        },
        minItems: 1,
        uniqueItems: true,
      },
    },
    dependencies: {
      q1: {
        oneOf: [
          {
            properties: {
              q1: {
                maxItems: 1,
                contains: {
                  enum: ["Een ander soort output"],
                },
              },
              q1_option6: {
                type: "string",
                title: "Geef een beschrijving van de output",
                default: "",
              },
              output: { $ref: "#/definitions/outputNoAI" },
            },
            required: ["q1_option6"],
          },
          {
            properties: {
              q1: {
                maxItems: 1,
                contains: {
                  enum: [
                    "Een dashboard of grafiek, met enkel rechtstreekse datavisualisatie.\nWanneer in dit dashboard een van de eerdere opties wordt weergeven, kies dan de eerdere optie.",
                  ],
                },
              },
              output: { $ref: "#/definitions/outputNoAI" },
            },
          },
          {
            properties: {
              q1: {
                anyOf: [
                  {
                    contains: {
                      enum: ["Een ingeschatte score, rangschikking of kans"],
                    },
                  },
                  {
                    contains: {
                      enum: [
                        "Een ingeschat label of classificatie zoals ja/nee, hoog/laag of een indeling in groepen.\nBijvoorbeeld ten behoeve van routering, communicatiecampagnes of risicoclassificatie.",
                      ],
                    },
                  },
                  {
                    contains: {
                      enum: ["Een aanbeveling"],
                    },
                  },
                  {
                    contains: {
                      enum: ["Een beslissing"],
                    },
                  },
                  {
                    contains: {
                      enum: [
                        "Content, zoals geschreven tekst, video, audio of afbeeldingen",
                      ],
                    },
                  },
                  {
                    contains: {
                      enum: [
                        "Objectherkenning, gezichtsherkenning of stemherkenning",
                      ],
                    },
                  },
                ],
              },
              q2: {
                type: "string",
                title: "Is het ontwerp van de toepassing gebaseerd op data?",
                enum: [
                  "Ja, keuzes over ontwerp zijn handmatig gemaakt, maar inzichten uit data-analyse hebben geholpen bij het ontwerp.",
                  "Ja, de toepassing bevat componenten die zijn afgeleid uit data. Er is sprake van het fitten of leren van een model of automatische variabele selectie met behulp van statistiek, optimalisatie, simulatie, machine learning of een vergelijkbare techniek.",
                  "Nee, het ontwerp van de toepassing is niet gebaseerd op data-analyse.",
                ],
              },
            },
            required: ["q2"],
          },
        ],
      },
      q2: {
        oneOf: [
          {
            properties: {
              q2: {
                enum: [
                  "Ja, keuzes over ontwerp zijn handmatig gemaakt, maar inzichten uit data-analyse hebben geholpen bij het ontwerp.",
                ],
              },
              noAICont,
            },
            required: ["noAICont"],
            dependencies: {
              noAICont: {
                oneOf: [
                  {
                    properties: {
                      noAICont: {
                        enum: ["Vragenlijst stoppen, ga naar conclusies"],
                      },
                      output: { $ref: "#/definitions/outputNoAI" },
                    },
                  },
                  { ...noAIContDoorgaan },
                ],
              },
            },
          },
          {
            properties: {
              q2: {
                enum: [
                  "Ja, de toepassing bevat componenten die zijn afgeleid uit data. Er is sprake van het fitten of leren van een model of automatische variabele selectie met behulp van statistiek, optimalisatie, simulatie, machine learning of een vergelijkbare techniek.",
                ],
              },
              AICont,
            },
            required: ["AICont"],
            dependencies: {
              AICont: {
                oneOf: [
                  {
                    properties: {
                      AICont: {
                        enum: ["Vragenlijst stoppen, ga naar conclusies"],
                      },
                      output: { $ref: "#/definitions/outputNoAI" },
                    },
                  },
                  { ...AIContDoorgaan },
                ],
              },
            },
          },
          {
            properties: {
              q2: {
                enum: [
                  "Nee, het ontwerp van de toepassing is niet gebaseerd op data-analyse.",
                ],
              },
              q3: {
                type: "string",
                title:
                  "Is de toepassing automatisering van door mensen opgestelde regels?",
                enum: [
                  "Ja, een-op-een automatisering van in wet- of regelgeving of formeel beleid vastgestelde regels",
                  "Ja, automatisering van regels, maar deze zijn niet expliciet vastgesteld in wet- of regelgeving of formeel beleid",
                  "Ja, logica- en kennis-gebaseerde benaderingen van AI waarbij uitkomsten worden afgeleid uit gecodeerde kennis of uit een symbolische weergave van de op te lossen taak",
                  "Nee",
                ],
              },
            },
            required: ["q3"],
          },
        ],
      },
      q3: {
        oneOf: [
          {
            properties: {
              q3: {
                enum: [
                  "Ja, een-op-een automatisering van in wet- of regelgeving of formeel beleid vastgestelde regels",
                ],
              },
              q3_yes1: {
                type: "string",
                title:
                  "Welk formeel beleid, wet- of regelgeving? Welk artikel, lid of paragraaf van deze regelgeving?",
                default: "",
              },
              output: { $ref: "#/definitions/outputNoAI" },
            },
            required: ["q3_yes1"],
          },
          {
            properties: {
              q3: {
                enum: [
                  "Ja, automatisering van regels, maar deze zijn niet expliciet vastgesteld in wet- of regelgeving of formeel beleid",
                ],
              },
              noAICont,
            },
            required: ["noAICont"],
            dependencies: {
              noAICont: {
                oneOf: [
                  {
                    properties: {
                      noAICont: {
                        enum: ["Vragenlijst stoppen, ga naar conclusies"],
                      },
                      output: { $ref: "#/definitions/outputNoAI" },
                    },
                  },
                  { ...noAIContDoorgaan },
                ],
              },
            },
          },
          {
            properties: {
              q3: {
                enum: [
                  "Ja, logica- en kennis-gebaseerde benaderingen van AI waarbij uitkomsten worden afgeleid uit gecodeerde kennis of uit een symbolische weergave van de op te lossen taak",
                ],
              },
              AICont,
            },
            required: ["AICont"],
            dependencies: {
              AICont: {
                oneOf: [
                  {
                    properties: {
                      AICont: {
                        enum: ["Vragenlijst stoppen, ga naar conclusies"],
                      },
                      output: { $ref: "#/definitions/outputNoAI" },
                    },
                  },
                  { ...AIContDoorgaan },
                ],
              },
            },
          },
          {
            properties: {
              q3: {
                enum: ["Nee"],
              },
              q3_no: {
                type: "string",
                title:
                  "Geef een korte beschrijving van het ontwerp van de toepassing.",
                default: "",
              },
              noAICont,
            },
            required: ["q3_no", "noAICont"],
            dependencies: {
              noAICont: {
                oneOf: [
                  {
                    properties: {
                      noAICont: {
                        enum: ["Vragenlijst stoppen, ga naar conclusies"],
                      },
                      output: { $ref: "#/definitions/outputNoAI" },
                    },
                  },
                  { ...noAIContDoorgaan },
                ],
              },
            },
          },
        ],
      },
    },
  },
  uiSchema: {
    q1: {
      "ui:widget": "checkboxes",
    },
    q2: {
      "ui:widget": "radio",
      "ui:description":
        "Data omvat alle vormen van elektronische gegevens. Tekst, afbeeldingen, audio zijn ook data.\n\nVerschillende vormen van algoritmes kunnen uit data worden afgeleid. Bij regel-gebasseerde algoritmes kunnen drempelwaardes voor (uitval)regels of weegfactoren voor beslissingen uit data worden berekend.\nOok klassieke statistische modellen, zoals regressiemodellen, worden afgeleid uit data. Machine learning wordt gebruikt om een model te leren uit data. Large language modellen zoals ChatGPT maken gebruik van machine learning.",
    },
    q3: {
      "ui:widget": "radio",
      "ui:description":
        "Een voorbeeld van in wet- of regelgeving vastgestelde regels is een regelgebaseerd algoritme dat bij aanvraag voor een bijstandsuitkering geautomatiseerd aangeeft wanneer niet is voldaan inkomens- en vermogenseisen. De regels in het algoritme zijn in dat geval een letterlijke implementatie van normen gespecificeerd in de Participatiewet.\nWanneer een norm open is gedefninieerd in wet- of regelgeving en deze verder worden gespecificeerd in de toepassing, is de toepassing geen een-op-een automatisering van wet- of regelgeving.\n\nVoorbeelden van door mensen opgestelde regels zijn een regelgebaseerd algoritme waarbij een werkinstructie is vertaald naar een algoritme, een risicoprofiel waarbij de regels met de hand zijn opgesteld op basis van ervaring van medewerkers of wettelijke normen die verder gespecificeerd zijn in regels.\n\nOp logica- en kennis-gebaseerde benaderingen worden ook wel symbolische AI-systemen genoemd (symbolic AI). Onder deze  vorm van AI-systemen vallen kennisrepresentatie, inductief (logisch) programmeren, kennisbanken, inferentie- en deductiemachines, (symbolisch) redeneren. Deze technologie wordt bijvoorbeeld ingezet in expert systemen.",
    },
    AICont: {
      "ui:widget": "radio",
    },
    noAICont: {
      "ui:widget": "radio",
    },
    q4: {
      "ui:widget": "radio",
      "ui:enableMarkdownInDescription": true,
      "ui:description":
        "Denk aan prioritering, opvolging van een vraag of een verzoek van een burger. Bijvoorbeeld wel/geen verzoek aan een burger om aanvullende informatie aan te leveren, wel/geen selectie voor controle of inspectie, wel/niet (proactief) aanbieden van specifieke voorziening bij bijstand etc.\n\n**Let op: een beslissing is veel breder dan een formeel besluit zoals gedefinieerd in de Algemene wet bestuursrecht Art. 1:3.**",
    },
    q5: {
      "ui:widget": "radio",
    },
    q5_option5: {
      "ui:widget": "radio",
    },
    "q5-option5-controle": {
      "ui:widget": "textarea",
    },
    q6: {
      "ui:widget": "radio",
    },
    q7: {
      "ui:widget": "radio",
      "ui:description":
        "Kies bij twijfel de bovenste van de opties waarover u twijfelt.",
    },
    q8: {
      "ui:widget": "radio",
      "ui:description": `Voorbeelden van output over een individuele burger zijn:
- een inschatting van een eigenschap 

Voorbeelden van informatie die niet over indiviuen gaat zijn:
- Output over groepen, waarin de individuen niet los van de groep een uitput krijgen toegekent
- Een output over fysieke zaken die niet aan een indivue gekoppelt zijn, zoals 
-Output over sectoren, wijken
- Output over financieel beleid en de invloed van beleid

Denk bij individuen ook aan ondernemingen waarbij de ondernemer persoonlijk aansprakelijk is (zzp, eenmanszaak, vof, maatschap)`,
    },
    q9: {
      "ui:widget": "radio",
    },
    q10: {
      "ui:widget": "radio",
    },
    outputIntermediate: {
      "ui:widget": "textarea",
      "ui:classNames": "intermediate-output",
      "ui:enableMarkdownInDescription": true,
    },
    additionalOutputText: {
      "ui:widget": "hidden",
    },
  },
};
