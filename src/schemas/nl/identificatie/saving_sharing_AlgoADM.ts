export const saving_sharing_AlgoADM = {
  properties: {
    noAICont: {
      enum: ["Doorgaan"],
    },
    q8: {
      type: "string",
      title:
        "Gaat de output van het algoritme over een individuele burger of een casus die een individuele burger aangaat?",
      enum: ["ja", "nee"],
    },
  },
  dependencies: {
    q8: {
      oneOf: [
        {
          properties: {
            q8: {
              enum: ["nee"],
            },
            outputIntermediate: {
              type: "string",
              title: "Volgende stap",
              default:
                "De volgende vragen gaan over het proces waarin de toepassing gebruikt wordt. Focus hierbij op het proces. \nHet maakt voor deze vragen niet uit of de toepassing slechts een kleine voorbereidende rol in het besluitvormingsproces heeft.",
            },
            impact: {
              $ref: "#/definitions/impact_AlgoADM",
            },
          },
        },
        {
          properties: {
            q8: {
              enum: ["ja"],
            },
            q9: {
              type: "string",
              title:
                "Wordt de output van het algoritme gedeeld met andere organisaties?",
              enum: ["ja", "nee"],
            },
          },
          required: ["q9"],
          dependencies: {
            q9: {
              oneOf: [
                {
                  properties: {
                    q9: {
                      enum: ["ja"],
                    },
                    additionalOutputText: {
                      default: `Let op: Het langdurig opslaan of delen met derden van de output van een algoritme kan leiden tot aanmerkelijke (onvoorziene) gevolgen voor een betrokkene. Hierdoor kan in juridische zin sprake zijn van geautomatiseerde besluitvorming (art 22) ook wanneer het primaire gebruik van het algoritme dit niet is. Bepaal in overleg met relevante juridische experts of door opslag of delen van de uitkomsten indirect sprake kan zijn van geautomatiseerde besluitvorming (art 22). Zie ook https://www.autoriteitpersoonsgegevens.nl/documenten/advies-geautomatiseerde-besluitvorming`,
                    },
                    outputIntermediate: {
                      type: "string",
                      title: "Volgende stap",
                      default:
                        "De volgende vragen gaan over het proces waarin de toepassing gebruikt wordt. Focus hierbij op het proces. \nHet maakt voor deze vragen niet uit of de toepassing slechts een kleine voorbereidende rol in het besluitvormingsproces heeft.",
                    },
                    impact: {
                      $ref: "#/definitions/impact_AlgoADM",
                    },
                  },
                },
                {
                  properties: {
                    q9: {
                      enum: ["nee"],
                    },
                    q10: {
                      type: "string",
                      title:
                        "Wordt de output van het algoritme langer opgeslagen dan de doorlooptijd van het primaire proces waarvoor het algoritme wordt ingezet?",
                      enum: ["ja", "nee"],
                    },
                  },
                  required: ["q10"],
                  dependencies: {
                    q10: {
                      oneOf: [
                        {
                          properties: {
                            q10: {
                              enum: ["ja"],
                            },
                            additionalOutputText: {
                              default: `Let op: Het langdurig opslaan of delen met derden van de output van een algoritme kan leiden tot aanmerkelijke (onvoorziene) gevolgen voor een betrokkene. Hierdoor kan in juridische zin sprake zijn van geautomatiseerde besluitvorming (art 22) ook wanneer het primaire gebruik van het algoritme dit niet is. Bepaal in overleg met relevante juridische experts of door opslag of delen van de uitkomsten indirect sprake kan zijn van geautomatiseerde besluitvorming (art 22). Zie ook https://www.autoriteitpersoonsgegevens.nl/documenten/advies-geautomatiseerde-besluitvorming`,
                            },
                            outputIntermediate: {
                              type: "string",
                              title: "Volgende stap",
                              default:
                                "De volgende vragen gaan over het proces waarin de toepassing gebruikt wordt. Focus hierbij op het proces. \nHet maakt voor deze vragen niet uit of de toepassing slechts een kleine voorbereidende rol in het besluitvormingsproces heeft.",
                            },
                            impact: {
                              $ref: "#/definitions/impact_AlgoADM",
                            },
                          },
                        },
                        {
                          properties: {
                            q10: {
                              enum: ["nee"],
                            },
                            outputIntermediate: {
                              type: "string",
                              title: "Volgende stap",
                              default:
                                "De volgende vragen gaan over het proces waarin de toepassing gebruikt wordt. Focus hierbij op het proces. \nHet maakt voor deze vragen niet uit of de toepassing slechts een kleine voorbereidende rol in het besluitvormingsproces heeft.",
                            },
                            impact: {
                              $ref: "#/definitions/impact_AlgoADM",
                            },
                          },
                        },
                      ],
                    },
                  },
                },
              ],
            },
          },
        },
      ],
    },
  },
};
