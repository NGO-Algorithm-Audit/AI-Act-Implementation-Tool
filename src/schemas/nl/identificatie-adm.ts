import { AICont } from "./identificatie/AICont";
import { saving_sharing_AIAlgoADM } from "./identificatie/saving_sharing_AIAlgoADM";
import { noAICont } from "./identificatie/noAICont";
import { saving_sharing_AlgoADM } from "./identificatie/saving_sharing_AlgoADM";
import { noAIandAlgoCont } from "./identificatie/noAIandAlgoCont";
import { saving_sharing_ADM } from "./identificatie/saving_sharing_ADM";
import { q5, q5Dependencies } from "./identificatie/q5";

export const identificationSchema = {
  JSONSchema: {
    title:
      "1B - [BETA] Identificatie van AI-systemen, impactvolle algoritmes en volledig geautomatiseerde besluitvorming",
    type: "object",
    definitions: {
      outputAI: {
        type: "string",
        title: "Uitslag",
        default: `Op basis van uw antwoorden is uw toepassing:
- wel een AI-systeem volgens de AI-verordening;
- geen impactvol algoritme; en
- geen geautomatiseerde besluitivorming.

Vervolgstappen:
Vul de AI risicoclassificatie vragenlijst in om te bepalen aan welke vereisten uit de AI-verordening de toepassing moet voldoen.`,
      },
      outputAlgo: {
        type: "string",
        title: "Uitslag",
        default: `Op basis van uw antwoorden is uw toepassing:
- wel een impactvol algoritme;
- geen geautomatiseerde besluitvorming; en
- geen AI-systeem volgens de AI-verordening.


Vervolgstappen:
- Neem algoritme op in het Algoritmeregister.
- Zorg dat wordt voldaan aan intern geldend algoritmebeleid.`,
      },
      outputADM: {
        type: "string",
        title: "Uitslag",
        default: `Op basis van uw antwoorden is uw toepassing:
- geen impactvol algoritme;
- geen AI-systeem volgens de AI-verordening;
- mogelijk geautomatiseerde besluitvorming volgens artikel 22 van de AVG.

Vervolgstappen:
- Bepaal in overleg met relevante juridische experts of er daadwerkelijk sprake is van geautomatiseerde besluitvorming.`,
      },
      outputAlgoandAI: {
        type: "string",
        title: "Uitslag",
        default: `Op basis van uw antwoorden is uw toepassing:
- wel een AI-systeem volgens de AI-verordening;
- wel een impactvol algoritme; en
- geen geautomatiseerde besluitvorming.

Vervolgstappen:
- Vul de AI risicoclassificatie vragenlijst in om te bepalen aan welke vereisten uit de AI-verordening de toepassing moet voldoen.
- Neem het algoritme op in het Algoritmeregister.
- Zorg dat wordt voldaan aan intern geldend algoritmebeleid.`,
      },
      outputAlgoandADM: {
        type: "string",
        title: "Uitslag",
        default: `Op basis van uw antwoorden is uw toepassing:
- geen AI-systeem volgens de AI-verordening;
- wel een impactvol algoritme; en
- mogelijk geautomatiseerde besluitvorming volgens artikel 22 van de AVG.

Vervolgstappen:
- Neem het algoritme op in het Algoritmeregister 
- Zorg dat wordt voldaan aan intern geldend algoritmebeleid.
- Bepaal in overleg met relevante juridische experts of er daadwerkelijk sprake is van geautomatiseerde besluitvorming.`,
      },
      outputAlgoADMandAI: {
        type: "string",
        title: "Uitslag",
        default: `Op basis van uw antwoorden is uw toepassing:
- een AI-systeem volgens de AI-verordening;
- een impactvol algoritme; en
- mogelijk geautomatiseerde besluitivorming volgens artikel 22 van de AVG.

Vervolgstappen:
- Vul de AI risicoclassificatie vragenlijst in om te bepalen aan welke vereisten uit de AI-verordening de toepassing moet voldoen.
- Neem het algoritme op in het Algoritmeregister.
- Zorg dat wordt voldaan aan intern geldend algoritmebeleid.
- Bepaal in overleg met relevante juridische experts of er daadwerkelijk sprake is van geautomatiseerde besluitvorming.`,
      },
      outputAIStop: {
        type: "string",
        title: "Uitslag",
        default:
          "Op basis van uw antwoorden is uw toepassing een AI-systeem volgens de AI-verordening. ",
      },
      outputNoAIStop: {
        type: "string",
        title: "Uitslag",
        default:
          "Op basis van uw antwoorden is uw toepassing geen AI-systeem volgens de AI-verordening.",
      },
      outputNoAIandAlgoStop: {
        type: "string",
        title: "Uitslag",
        default:
          "Op basis van uw antwoorden is uw toepassing geen AI-systeem of impactvol algoritme.",
      },
      outputNone: {
        type: "string",
        title: "Uitslag",
        default:
          `Op basis van uw antwoorden is uw toepassing:
- geen impactvol algoritme;
- geen geautomatiseerde besluitvorming; en
- geen AI-systeem volgens de AI-verordening.`,
      },
      automation_ADM: {
        title: "Automation",
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
                      "De uitkomst van het proces wordt deels beïnvloed door de toepassing. Het resultaat van de toepassing is belangrijk voor het eindresultaat, maar de uiteindelijke beslissing wordt genomen door een medewerker. Deze medewerker heeft de juiste informatie, ervaring/kunde, mandaat en beschikbare tijd om de beslissing te maken.",
                      "De toepassing bepaalt (mede) het procesverloop, maar de uitkomst van het proces wordt volledig door een medewerker bepaald. Bijvoorbeeld wanneer de uitkomst van de toepassing een risicoscore aan de hand waarvan een controle proces wordt gestart of een meer insentieve dossierevalutie plaatsvindt, maar de controle of evaluatie daarna volledig door een medewerker wordt uitgevoerd.",
                      "Het procesverloop en uitkomst van het proces wordt volledig door een mens bepaald. Het resultaat van de toepassing is slechts één van de factoren en is niet doorslaggevend in de keuze.",
                    ],
                  },
                  output: { $ref: "#/definitions/outputNone" }, //wordt outputNone
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
                  output: { $ref: "#/definitions/outputNone" }, //wordt outputNone
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
                  output: { $ref: "#/definitions/outputADM" },
                },
              },
            ],
          },
        },
      },
      automation_Algo: {
        title: "Automation",
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
                  output: { $ref: "#/definitions/outputNone" }, //wordt outputNone
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
                  output: { $ref: "#/definitions/outputNone" }, //wordt outputNone
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
                  output: { $ref: "#/definitions/outputAlgo" },
                },
              },
            ],
          },
        },
      },
      automation_AlgoADM: {
        title: "Automation",
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
                  output: { $ref: "#/definitions/outputNone" }, //wordt outputNone
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
                  output: { $ref: "#/definitions/outputNone" }, //wordt outputNone
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
                  output: { $ref: "#/definitions/outputAlgoandADM" },
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
                  output: { $ref: "#/definitions/outputAlgo" },
                },
              },
            ],
          },
        },
      },
      automation_AIAlgoADM: {
        title: "Automation",
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
                  output: { $ref: "#/definitions/outputAI" }, //fixed naar outputAI
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
                  output: { $ref: "#/definitions/outputAI" }, //fixed naar outputAI
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
                  output: { $ref: "#/definitions/outputAlgoADMandAI" },
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
                  output: { $ref: "#/definitions/outputAlgoandAI" },
                },
              },
            ],
          },
        },
      },
      automation_AIAlgo: {
        title: "Automation",
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
                  output: { $ref: "#/definitions/outputAlgoandAI" },
                },
              },
            ],
          },
        },
      },
      impact_ADM: {
        title: "Impact",
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
                  q5
                },
                required: ["q5"],
              },
              {
                properties: {
                  q4: {
                    enum: ["Nee"],
                  },
                  output: { $ref: "#/definitions/outputNone" },
                },
              },
            ],
          },
          ...q5Dependencies(
            "#/definitions/outputNone",
            "#/definitions/automation_ADM",
            "#/definitions/outputNone",
            "#/definitions/automation_ADM",
            "#/definitions/outputNone"
          ),
        },
      },
      impact_AlgoADM: {
        title: "Impact",
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
            "#/definitions/outputNone",
            "#/definitions/automation_AlgoADM",
            "#/definitions/automation_Algo",
            "#/definitions/automation_AlgoADM",
            "#/definitions/automation_Algo"
          ),
          q6: {
            oneOf: [
              {
                properties: {
                  q6: {
                    enum: ["Ja"],
                  },
                  automation: { $ref: "#/definitions/automation_Algo" },
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
                  automation: { $ref: "#/definitions/automation_Algo" },
                },
                required: ["q6_unsure"],
              },
              {
                properties: {
                  q6: {
                    enum: ["Nee"],
                  },
                  output: { $ref: "#/definitions/outputNone" }, // wordt outputNone
                },
              },
            ],
          },
        },
      },
      impact_AIAlgoADM: {
        title: "Impact",
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
            "#/definitions/automation_AIAlgoADM",
            "#/definitions/automation_AIAlgo",
            "#/definitions/automation_AIAlgoADM",
            "#/definitions/automation_AIAlgo"
          ),
          q6: {
            oneOf: [
              {
                properties: {
                  q6: {
                    enum: ["Ja"],
                  },
                  automation: { $ref: "#/definitions/automation_AIAlgo" },
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
                  automation: { $ref: "#/definitions/automation_AIAlgo" },
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
              output: { $ref: "#/definitions/outputNone" }, // wordt outputNone
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
              output: { $ref: "#/definitions/outputNone" }, // wordt outputNone
            },
          },
          {
            properties: {
              q1: {
                minItems: 2,
                maxItems:2,
                allOf: [
                  {
                    contains: {
                      enum: ["Een dashboard of grafiek, met enkel rechtstreekse datavisualisatie.\nWanneer in dit dashboard een van de eerdere opties wordt weergeven, kies dan de eerdere optie."],
                    },
                  },
                  {
                    contains: {
                      enum: ["Een ander soort output"],
                    },
                  },
                ],
              },
              q1_option6: {
                type: "string",
                title: "Geef een beschrijving van de output",
                default: "",
              },
              output: { $ref: "#/definitions/outputNone" }, // wordt outputNone
            },
            required: ["q1_option6"],
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
                      output: { $ref: "#/definitions/outputNoAIStop" }, //wordt outputNoAIStop
                    },
                  },
                  { ...saving_sharing_AlgoADM },
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
              q2_yes2: {
                type: "string",
                title: "Beschrijf de methode",
                default: "",
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
                      output: { $ref: "#/definitions/outputAIStop" },
                    },
                  },
                  { ...saving_sharing_AIAlgoADM },
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
              noAIandAlgoCont,
            },
            required: ["q3_yes1", "noAIandAlgoCont"],
            dependencies: {
              noAIandAlgoCont: {
                oneOf: [
                  {
                    properties: {
                      noAIandAlgoCont: {
                        enum: ["Vragenlijst stoppen, ga naar conclusies"],
                      },
                      output: { $ref: "#/definitions/outputNoAIandAlgoStop" },
                    },
                  },
                  { ...saving_sharing_ADM },
                ],
              },
            },
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
                      output: { $ref: "#/definitions/outputNoAIStop" }, //wordt outputNoAIStop
                    },
                  },
                  { ...saving_sharing_AlgoADM },
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
                      output: { $ref: "#/definitions/outputAIStop" }, //wordt outputAIStop
                    },
                  },
                  { ...saving_sharing_AIAlgoADM },
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
                      output: { $ref: "#/definitions/outputAIStop" }, //wordt outputAIStop
                    },
                  },
                  { ...saving_sharing_AlgoADM },
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
        "Data omvat alle vormen van elektronische gegevens. Tekst, afbeeldingen, audio zijn ook data.\n\nToepassingen kunnen met de hand worden ontworpen. Maar ook wanneer deze handmatig is opgesteld, wordt het ontwerp soms gebaseerd op data-analyse. Zo kunnen drempelwaardes voor (uitval)regels berekend worden uit data of criteria gekozen worden aan de hand van berekende correlaties.\n\nHet komt ook voor dat componenten (e.g. modellen en algoritmes) meer automatisch uit data worden afgeleid. Bijvoorbeeld door een statistisch model te fitten op data of d.m.v. machine learning een model  of regelgebaseerd algoritme te leren uit data. Ook vormen van simulatie en optimalising kunnen gebruikt worden om een model af te leiden uit data.\n\nLarge language modellen zoals ChatGPT zijn ook afgeleid (geleerd) uit grote hoeveelheden tekstuele data.",
    },
    q3: {
      "ui:widget": "radio",
      "ui:enableMarkdownInDescription": true,
      "ui:description": `Een voorbeeld van in wet- of regelgeving vastgestelde regels is een regelgebaseerd algoritme dat bij aanvraag voor een bijstandsuitkering geautomatiseerd aangeeft wanneer niet is voldaan inkomens- en vermogenseisen. De regels in het algoritme zijn in dat geval een letterlijke implementatie van normen gespecificeerd in de Participatiewet.\nWanneer een norm open is gedefninieerd in wet- of regelgeving en deze verder worden gespecificeerd in de toepassing, is de toepassing **geen** een-op-een automatisering van wet- of regelgeving.\n\nVoorbeelden van door mensen opgestelde regels zijn:
- een regelgebaseerd algoritme waarbij een werkinstructie is vertaald naar een algoritme
- een risicoprofiel waarbij de regels met de hand zijn opgesteld op basis van ervaring van medewerkers
- open wettelijke normen die verder gespecificeerd zijn in regels
\n\nOp logica- en kennis-gebaseerde benaderingen worden ook wel symbolische AI-systemen genoemd (symbolic AI). Onder deze  vorm van AI-systemen vallen kennisrepresentatie, inductief (logisch) programmeren, kennisbanken, inferentie- en deductiemachines, (symbolisch) redeneren. Deze technologie wordt bijvoorbeeld ingezet in expert systemen.`,
    },
    AICont: {
      "ui:widget": "radio",
    },
    noAICont: {
      "ui:widget": "radio",
    },
    noAIandAlgoCont: {
      "ui:widget": "radio",
    },
    q4: {
      "ui:widget": "radio",
      "ui:enableMarkdownInDescription": true,
      "ui:description":
        "Denk aan prioritering van de opvolging vraag of verzoek van een burger, wel/geen verzoek aan burger om aanvullende informatie aan te leveren, wel/geen selectie voor controle of inspectie, wel/niet of een persoon in aanmerking komt voor diensten of voorzieningen etc.\n\n**Let op: een beslissing is veel breder dan een formeel besluit zoals gedefinieerd in de Algemene wet bestuursrecht Art. 1:3.**",
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
- Een inschatting van een eigenschap

Voorbeelden van casus die een individuele burger aangaat zijn:
- Zaken die aan een individu gekoppeld zijn, zoals een transactie of een aanvraag

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
